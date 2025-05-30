package uk.ac.ebi.spot.goci.ui.controller;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.model.solr.SumStatDownloadDto;
import uk.ac.ebi.spot.goci.services.SolrService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.exception.IllegalParameterCombinationException;
import uk.ac.ebi.spot.goci.ui.service.JsonStreamingProcessorService;
import uk.ac.ebi.spot.goci.util.FileHandler;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;


/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 31/01/15
 */
@Controller
@RequestMapping("v2")
public class SolrSearchControllerV2 {
    private SearchConfiguration searchConfiguration;

    private Logger log = LoggerFactory.getLogger(getClass());

    @Autowired
    public SolrSearchControllerV2(SearchConfiguration searchConfiguration) {
        this.searchConfiguration = searchConfiguration;
    }


    protected Logger getLog() {
        return log;
    }


    @RequestMapping(value = "api/search", produces = MediaType.APPLICATION_JSON_VALUE)
    @CrossOrigin
    public void doSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "generalTextQuery", required=false, defaultValue = "false") boolean generalTextQuery,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "1000") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        addFacet(solrSearchBuilder, searchConfiguration.getDefaultFacet());
        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        else {
            addRowsAndPage(solrSearchBuilder, maxResults, page);
        }

        if (generalTextQuery) {
            addQueryFilter(solrSearchBuilder);
        }
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    // Use queryFilter to return match to term synonym higher in the result list
    private void addQueryFilter(StringBuilder solrSearchBuilder) {
        solrSearchBuilder.append("&defType=edismax&qf=title%5E2.0+synonyms%5E20.0+parent%5E2.0+text%5E1.0");
    }


    @RequestMapping(value = "/api/select", produces = {MediaType.APPLICATION_JSON_VALUE}, method = RequestMethod.GET)
    public void select(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "fieldList", required = false) Collection<String> fieldList,
            //            @RequestParam(value = "childrenOf", required = false) Collection<String> childrenOf,
            @RequestParam(value = "max", required = false, defaultValue = "100") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            HttpServletResponse response
    ) throws IOException {

//        query = query.replace(" ", "%20");
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addSelectFields(solrSearchBuilder, query);
        addFilterQuery(solrSearchBuilder, searchConfiguration.getDefaultFacet(), "trait");


        if (fieldList == null) {
            fieldList = new HashSet<>();
        }

        //this is the FL parameter
        if (fieldList.isEmpty()) {
            fieldList.add("mappedTrait");
            fieldList.add("mappedUri");
            fieldList.add("id");
            fieldList.add("shortForm");
            fieldList.add("parent");
        }


        addReturnFields(solrSearchBuilder, fieldList);

        Collection<String> highlights = new HashSet<>();

        highlights.add("label_autosuggest");
        highlights.add("mappedTrait");
        highlights.add("synonym_autosuggest");
        highlights.add("synonyms");

        addHighlights(solrSearchBuilder, highlights);

        addQuery(solrSearchBuilder, query);
        dispatchSearch(solrSearchBuilder.toString().replace(" ", "%20"), response.getOutputStream());

    }


    @RequestMapping(value = "api/search/study", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doStudySolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildFatSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFilterQuery(solrSearchBuilder, searchConfiguration.getDefaultFacet(), "study");
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    @RequestMapping(value = "api/search/singlenucleotidepolymorphism", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doSnpSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFilterQuery(solrSearchBuilder,
                searchConfiguration.getDefaultFacet(),
                "SingleNucleotidePolymorphism");
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    @RequestMapping(value = "api/search/association", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doAssociationSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildFatSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFilterQuery(solrSearchBuilder, searchConfiguration.getDefaultFacet(), "association");
        addDefaultSort(solrSearchBuilder);
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    @RequestMapping(value = "api/search/diseasetrait", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doTraitSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFilterQuery(solrSearchBuilder, searchConfiguration.getDefaultFacet(), "DiseaseTrait");
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    @RequestMapping(value = "api/search/traitcount", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doTraitCountSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "facet.mincount", required = false, defaultValue = "1") int mincount,
            @RequestParam(value = "facet.limit", required = false, defaultValue = "1000") int limit,
            @RequestParam(value = "traitfilter[]", required = false) String[] traits,
            @RequestParam(value = "dateFilter", required = false) String dateRange,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFacet(solrSearchBuilder, "traitName_s");
        addFacetMincount(solrSearchBuilder, mincount);
        addFacetLimit(solrSearchBuilder, limit);

        if(query.contains("chromosomeName") && query.contains("chromosomePosition")){
            addFilterQuery(solrSearchBuilder, "resourcename", "association");
        }
        else{
            addFilterQuery(solrSearchBuilder, "resourcename", "study");
        }
        if (traits != null && traits.length != 0) {
            getLog().trace(String.valueOf(traits));
            addFilterQuery(solrSearchBuilder, "traitName_s", traits);
        }

        if (dateRange != "") {
            addFilterQuery(solrSearchBuilder, "catalogPublishDate", "study_catalogPublishDate", dateRange);
        }
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    // Use the Solr SLIM
    private StringBuilder buildSlimSearchRequest() {
        // build base request
        StringBuilder solrSearchBuilder = new StringBuilder();
        solrSearchBuilder.append(searchConfiguration.getGwasSearchSlimServer().toString())
                .append("/select?")
                .append("wt=json");
        return solrSearchBuilder;
    }

    // Use the Solr FAT.
    private StringBuilder buildFatSearchRequest() {
        // build base request
        StringBuilder solrSearchBuilder = new StringBuilder();
        solrSearchBuilder.append(searchConfiguration.getGwasSearchFatServer().toString())
                .append("/select?")
                .append("wt=json");
        return solrSearchBuilder;
    }


    @RequestMapping(value = "api/search/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    @CrossOrigin
    public void doFilterSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "group", required = false, defaultValue = "false") boolean useGroups,
            @RequestParam(value = "group.by", required = false) String groupBy,
            @RequestParam(value = "group.limit", required = false, defaultValue = "10") int groupLimit,
            @RequestParam(value = "pvalfilter", required = false) String pval,
            @RequestParam(value = "orfilter", required = false) String orRange,
            @RequestParam(value = "betafilter", required = false) String betaRange,
            @RequestParam(value = "datefilter", required = false) String dateRange,
            @RequestParam(value = "genomicfilter", required = false) String genomicRange,
            @RequestParam(value = "traitfilter[]", required = false) String[] traits,
            @RequestParam(value = "genotypingfilter[]", required = false) String[] genotypingTechnologies,
            @RequestParam(value = "dateaddedfilter", required = false) String addedDateRange,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        addFacet(solrSearchBuilder, searchConfiguration.getDefaultFacet());
        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        if (useGroups) {
            addGrouping(solrSearchBuilder, groupBy, groupLimit);
        }
        else {
            addRowsAndPage(solrSearchBuilder, maxResults, page);
        }

        if (pval != "") {
            getLog().debug(pval);
            addPvalueFilterQuery(solrSearchBuilder, pval);
        }
        /**TO DO - when we split OR and beta, modify this controller to reflect that change!!***/
        if (orRange != "") {
            getLog().debug(orRange);

            addFilterQuery(solrSearchBuilder, "orPerCopyNum", orRange);
//            addFilterQuery(solrSearchBuilder, "orType", "true");
        }
        if (betaRange != "") {
            getLog().debug(betaRange);

            addFilterQuery(solrSearchBuilder, "betaNum", betaRange);
//            addFilterQuery(solrSearchBuilder, "orType", "false");
        }
        if (dateRange != "") {
            getLog().debug(dateRange);

            addFilterQuery(solrSearchBuilder, "publicationDate", "study_publicationDate", dateRange);

        }
        if(genomicRange != "") {
            getLog().debug(genomicRange);
            addGenomicRangeFilterQuery(solrSearchBuilder, genomicRange);
        }
        if (addedDateRange != "") {
            getLog().debug(addedDateRange);

            addFilterQuery(solrSearchBuilder, "catalogPublishDate", "study_catalogPublishDate", addedDateRange);

        }
        if (traits != null && traits.length != 0) {
            getLog().trace(String.valueOf(traits));

            addFilterQuery(solrSearchBuilder, "traitName_s", traits);
        }

        if (genotypingTechnologies != null && genotypingTechnologies.length != 0) {
            getLog().trace(String.valueOf(genotypingTechnologies));

            addFilterQuery(solrSearchBuilder, "genotypingTechnologies", genotypingTechnologies);
        }


        addDefaultSort(solrSearchBuilder);
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }


    @RequestMapping(value = "api/search/traits", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doTraitsOnlySolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "group", required = false, defaultValue = "false") boolean useGroups,
            @RequestParam(value = "group.by", required = false) String groupBy,
            @RequestParam(value = "group.limit", required = false, defaultValue = "10") int groupLimit,
            @RequestParam(value = "traitfilter[]", required = false) String[] traits,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        addFacet(solrSearchBuilder, searchConfiguration.getDefaultFacet());
        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        if (useGroups) {
            addGrouping(solrSearchBuilder, groupBy, groupLimit);
        }
        else {
            addRowsAndPage(solrSearchBuilder, maxResults, page);
        }

        if (traits != null && traits.length != 0) {
            getLog().trace(String.valueOf(traits));

            addFilterQuery(solrSearchBuilder, "traitName_s", traits);
        }

        addDefaultSort(solrSearchBuilder);
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }


    @Autowired private SolrService solrService;

    @GetMapping(value = "api/search/summaryStatistics/download", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Object downloadFullPvalueSetSolrSearch(HttpServletResponse response) throws IOException {

        int maxResults = Integer.MAX_VALUE;
        int page = 1;
        String query = "fullPvalueSet:true";
        String fieldList = "accessionId,author_s,authorAscii_s,pubmedId,title,publication,publicationDate,mappedLabel,mappedUri,traitName_s,associationCount,agreedToCc0";

        StringBuilder solrSearchBuilder = buildFatSearchRequest();
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFilterQuery(solrSearchBuilder, searchConfiguration.getDefaultFacet(), "study");
        solrSearchBuilder.append("&fl=").append(fieldList);
        addQuery(solrSearchBuilder, query);
        String content = solrService.dispatchSearch(solrSearchBuilder.toString());

        List<SumStatDownloadDto> sumStatDownloadDtos = solrService.assembleSumStatDownloadDto(content);
        String result = FileHandler.serializePojoToTsv(sumStatDownloadDtos);

        response.setContentType("text/csv;charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=list_gwas_summary_statistics.tsv");
        response.getOutputStream().flush();
        return result;
    }

    @RequestMapping(value = "api/search/summaryStatistics", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doFullPvalueSetSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "fl", required = false) String fieldList,
            HttpServletResponse response) throws IOException {

        StringBuilder solrSearchBuilder = buildFatSearchRequest();
        //TODO: In future, temporarily set 5000 as ut off until scalability problem is fixed https://bit.ly/3EYGjnm
        maxResults = 5000;
        sort = "publicationDate%20desc";

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFilterQuery(solrSearchBuilder, searchConfiguration.getDefaultFacet(), "study");
        solrSearchBuilder.append("&fl=").append(fieldList);
        addQuery(solrSearchBuilder, query);

        if (sort != null) {
            addSortQuery(solrSearchBuilder, sort);
        }

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }


    @RequestMapping(value = "api/search/sort", produces = MediaType.APPLICATION_JSON_VALUE)
    @CrossOrigin
    public void doSortSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "facet", required = false) String facet,
            @RequestParam(value = "group", required = false, defaultValue = "false") boolean useGroups,
            @RequestParam(value = "group.by", required = false) String groupBy,
            @RequestParam(value = "group.limit", required = false, defaultValue = "10") int groupLimit,
            @RequestParam(value = "pvalfilter", required = false) String pval,
            @RequestParam(value = "orfilter", required = false) String orRange,
            @RequestParam(value = "betafilter", required = false) String betaRange,
            @RequestParam(value = "datefilter", required = false) String dateRange,
            @RequestParam(value = "genomicfilter", required = false) String genomicRange,
            @RequestParam(value = "traitfilter[]", required = false) String[] traits,
            @RequestParam(value = "genotypingfilter[]", required = false) String[] genotypingTechnologies,
            @RequestParam(value = "sort", required = false) String sort,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        addFacet(solrSearchBuilder, searchConfiguration.getDefaultFacet());
        addFilterQuery(solrSearchBuilder, "resourcename", facet);
        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        if (useGroups) {
            addGrouping(solrSearchBuilder, groupBy, groupLimit);
        }
        else {
            addRowsAndPage(solrSearchBuilder, maxResults, page);
        }

        if (pval != "") {
            getLog().debug(pval);
            addPvalueFilterQuery(solrSearchBuilder, pval);
        }
        /**TO DO - when we split OR and beta, modify this controller to reflect that change!!***/
        if (orRange != "") {
            getLog().debug(orRange);

            addFilterQuery(solrSearchBuilder, "orPerCopyNum", orRange);
//            addFilterQuery(solrSearchBuilder, "orType", "true");
        }
        if (betaRange != "") {
            getLog().debug(betaRange);

            addFilterQuery(solrSearchBuilder, "betaNum", betaRange);
//            addFilterQuery(solrSearchBuilder, "orType", "false");
        }
        if (dateRange != "") {
            getLog().debug(dateRange);

            addFilterQuery(solrSearchBuilder, "publicationDate", dateRange);
        }
        if(genomicRange != "") {
            getLog().debug(genomicRange);
            addGenomicRangeFilterQuery(solrSearchBuilder, genomicRange);
        }
        if (traits != null && traits.length != 0) {
            getLog().trace(String.valueOf(traits));

            addFilterQuery(solrSearchBuilder, "traitName_s", traits);
        }

        if (genotypingTechnologies != null && genotypingTechnologies.length != 0) {
            getLog().trace(String.valueOf(genotypingTechnologies));

            addFilterQuery(solrSearchBuilder, "genotypingTechnologies", genotypingTechnologies);
        }

        if (sort != "") {
            addSortQuery(solrSearchBuilder, sort);
        }


        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    @RequestMapping(value = "api/search/latest", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doLatestSolrSearch(@RequestParam("q") String query,
                                   @RequestParam(value = "jsonp",
                                           required = false,
                                           defaultValue = "false") boolean useJsonp,
                                   @RequestParam(value = "callback", required = false) String callbackFunction,
                                   @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
                                   @RequestParam(value = "page", required = false, defaultValue = "1") int page,
                                   @RequestParam(value = "group",
                                           required = false,
                                           defaultValue = "false") boolean useGroups,
                                   @RequestParam(value = "group.by", required = false) String groupBy,
                                   @RequestParam(value = "group.limit",
                                           required = false,
                                           defaultValue = "10") int groupLimit,
                                   @RequestParam(value = "dateFilter", required = false) String dateRange,
                                   @RequestParam(value = "sort", required = false) String sort,
                                   HttpServletResponse response) throws IOException {

        StringBuilder solrSearchBuilder = buildSlimSearchRequest();
        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addFacet(solrSearchBuilder, searchConfiguration.getDefaultFacet());
        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        if (useGroups) {
            addGrouping(solrSearchBuilder, groupBy, groupLimit);
        }
        else {
            addRowsAndPage(solrSearchBuilder, maxResults, page);
        }

        addFilterQuery(solrSearchBuilder, "catalogPublishDate", "study_catalogPublishDate", dateRange);

        addSortQuery(solrSearchBuilder, sort);

        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    @RequestMapping(value = "api/search/alltraits", produces = MediaType.APPLICATION_JSON_VALUE)
    public void doAllTraitsSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "facet", required = false) String facet,
            @RequestParam(value = "facet.sort", required = false, defaultValue = "count") String sort,
            @RequestParam(value = "facet.limit", required = false, defaultValue = "1000") int limit,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFacet(solrSearchBuilder, "traitName_s");
        addFacetLimit(solrSearchBuilder, limit);
        addFacetSort(solrSearchBuilder, sort);
        addFilterQuery(solrSearchBuilder, "resourcename", "study");
        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    @RequestMapping(value = "api/search/moreresults", produces = MediaType.APPLICATION_JSON_VALUE)
    @CrossOrigin
    public void doMoreResultsSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "facet", required = false) String facet,
            @RequestParam(value = "pvalfilter", required = false) String pval,
            @RequestParam(value = "orfilter", required = false) String orRange,
            @RequestParam(value = "betafilter", required = false) String betaRange,
            @RequestParam(value = "datefilter", required = false) String dateRange,
            @RequestParam(value = "genomicfilter", required = false) String genomicRange,
            @RequestParam(value = "traitfilter[]", required = false) String[] traits,
            @RequestParam(value = "genotypingfilter[]", required = false) String[] genotypingTechnologies,
            @RequestParam(value = "sort", required = false) String sort,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        addFilterQuery(solrSearchBuilder, "resourcename", facet);
        addRowsAndPage(solrSearchBuilder, maxResults, page);


        if (pval != "") {
            getLog().debug(pval);
            addPvalueFilterQuery(solrSearchBuilder, pval);
        }
        /**TO DO - when we split OR and beta, modify this controller to reflect that change!!***/
        if (orRange != "") {
            getLog().debug(orRange);

            addFilterQuery(solrSearchBuilder, "orPerCopyNum", orRange);
//            addFilterQuery(solrSearchBuilder, "orType", "true");
        }
        if (betaRange != "") {
            getLog().debug(betaRange);

            addFilterQuery(solrSearchBuilder, "betaNum", betaRange);
//            addFilterQuery(solrSearchBuilder, "orType", "false");
        }
        if (dateRange != "") {
            getLog().debug(dateRange);

            if (dateRange.contains("NOW")) {
                if (facet.equals("diseasetrait")) {
                    addFilterQuery(solrSearchBuilder, "study_catalogPublishDate", dateRange);
                }
                else {
                    addFilterQuery(solrSearchBuilder, "catalogPublishDate", dateRange);
                }
            }
            else {
                addFilterQuery(solrSearchBuilder, "publicationDate", dateRange);
            }
        }
        if(genomicRange != "") {
            getLog().debug(genomicRange);
            addGenomicRangeFilterQuery(solrSearchBuilder, genomicRange);
        }
        if (traits != null && traits.length != 0) {
            getLog().trace(String.valueOf(traits));

            addFilterQuery(solrSearchBuilder, "traitName_s", traits);
        }

        if (sort != "") {
            addSortQuery(solrSearchBuilder, sort);
        }

        if(facet.equals("association")){
            addDefaultSort(solrSearchBuilder);
        }

        if (genotypingTechnologies != null && genotypingTechnologies.length != 0) {
            getLog().trace(String.valueOf(genotypingTechnologies));

            addFilterQuery(solrSearchBuilder, "genotypingTechnologies", genotypingTechnologies);
        }

        addQuery(solrSearchBuilder, query);

        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }

    private void addSortQuery(StringBuilder solrSearchBuilder, String sort) {
        if (sort.contains("pValue")) {
//            String dir = sort.substring(sort.length() - 4);
            String dir = sort.substring(6);


            String pvalsort = "pValueExponent".concat(dir).concat("%2C+pValueMantissa").concat(dir);

            solrSearchBuilder.append("&sort=").append(pvalsort);
        }
        else {
            solrSearchBuilder.append("&sort=").append(sort);
        }
    }

    private void addDefaultSort(StringBuilder solrSearchBuilder){
        String pvalsort = "pValueExponent+asc%2C+pValueMantissa+asc";

        solrSearchBuilder.append("&sort=").append(pvalsort);
    }

    private void addSelectFields(StringBuilder solrSearchBuilder, String query) {
        solrSearchBuilder.append("&defType=edismax" +
                "&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest" +
                "&bq=label_s%3A%22" + query + "%22%5E2%20synonym_s%3A%22" + query + "%22");


    }

    private void addFacet(StringBuilder solrSearchBuilder, String facet) {
        // add configuration
        solrSearchBuilder.append("&facet=true&facet.field=").append(facet);
    }

    private void addFacetMincount(StringBuilder solrSearchBuilder, int min) {
        solrSearchBuilder.append("&facet.mincount=").append(min);
    }

    private void addFacetLimit(StringBuilder solrSearchBuilder, int limit) {
        solrSearchBuilder.append("&facet.limit=").append(limit);
    }

    private void addFacetSort(StringBuilder solrSearchBuilder, String sort) {
        solrSearchBuilder.append("&facet.sort=").append(sort);
    }

    private void addReturnFields(StringBuilder solrSearchBuilder, Collection<String> fieldList) {
        String list = "";
        for (String field : fieldList) {
            list.concat(field).concat("+");
        }
        solrSearchBuilder.append("&fl=").append(list);
    }

    private void addHighlights(StringBuilder solrSearchBuilder, Collection<String> highlights) {
        solrSearchBuilder.append("&hl=true")
                .append("&hl.simple.pre=%3Cb%3E")
                .append("&hl.simple.post=%3C%2Fb%3E")
                .append("&hl.fl=");

        String hlfs = "";

        for (String highlight : highlights) {
            hlfs.concat(highlight).concat("+");
        }

        solrSearchBuilder.append(hlfs);
    }

    private void addHighlights(StringBuilder solrSearchBuilder, Collection<String> highlights, Integer hlSnippets) {
        solrSearchBuilder.append("&hl=true")
                .append("&hl.simple.pre=%3Cb%3E")
                .append("&hl.simple.post=%3C%2Fb%3E")
                .append("&hl.snippets="+hlSnippets.toString())
                .append("&hl.fl=");

        solrSearchBuilder.append(String.join(",", highlights));
    }


    private void addJsonpCallback(StringBuilder solrSearchBuilder, String callbackFunction) {
        if (callbackFunction == null) {
            throw new IllegalParameterCombinationException("If jsonp = true, you must specify a callback function " +
                    "name with callback parameter");
        }
        else {
            solrSearchBuilder.append("&json.wrf=").append(callbackFunction);
        }
    }

    private void addGrouping(StringBuilder solrSearchBuilder, String groupBy, int maxResults) {
        solrSearchBuilder.append("&rows=10000")
                .append("&group=true")
                .append("&group.limit=").append(maxResults)
                .append("&group.field=").append(groupBy);
    }

    private void addFields(StringBuilder solrSearchBuilder, String fields) {
        solrSearchBuilder.append("&fl=").append(fields);
    }


    private void addRowsAndPage(StringBuilder solrSearchBuilder, int maxResults, int page) {
        solrSearchBuilder.append("&rows=").append(maxResults)
                .append("&start=").append((page - 1) * maxResults);
    }

    private void addFilterQuery(StringBuilder solrSearchBuilder, String filterOn, String filterBy) {
        solrSearchBuilder.append("&fq=").append(filterOn).append("%3A").append(filterBy);
    }

    private void addFilterQuery(StringBuilder solrSearchBuilder, String filterOn, String[] filterBy) {
        int counter = 0;
        String filterString = "";
        for (String filter : filterBy) {
            if (counter == 0) {
                filterString = filterString.concat(filterOn).concat("%3A%22").concat(filter).concat("%22");
                counter++;
            }
            else {
                filterString =
                        filterString.concat("+OR+").concat(filterOn).concat("%3A%22").concat(filter).concat("%22");
                counter++;
            }
        }
        getLog().trace(filterString);
        solrSearchBuilder.append("&fq=").append(filterString);

    }

    private void addPvalueFilterQuery(StringBuilder solrSearchBuilder, String pval) {
        String mant = pval.split("e")[0];
        String exp = pval.split("e")[1];

        String filterString = "pValueExponent:%7B*%20TO%20"  //{* TO
                .concat(exp)
                .concat("%7D+OR+(pValueMantissa%3A%5B*%20TO%20")   //}+OR+(pvalue_mantissa:[* TO%
                .concat(mant)
                .concat("%5D+AND+pValueExponent%3A%5B")
                .concat(exp)
                .concat("%20TO%20")
                .concat(exp)
                .concat("%5D)");

        solrSearchBuilder.append("&fq=").append(filterString);
    }

    private void addGenomicRangeFilterQuery(StringBuilder solrSearchBuilder, String genomicRange){
        String chrom = null;
        String bp = null;
        if(genomicRange.contains("-")){
            chrom = genomicRange.split("-")[0];
            bp = genomicRange.split("-")[1];
        }
        else{
            bp = genomicRange;
        }
        String filterString = "";

        if(chrom != null){
            filterString = "chromosomeName:".concat(chrom).concat("+AND+");
        }

        filterString = filterString.concat("chromosomePosition:").concat(bp);

        solrSearchBuilder.append("&fq=").append(filterString);
    }


    private void addFilterQuery(StringBuilder solrSearchBuilder, String filterOn, String filterOnAlt, String filterBy) {
        solrSearchBuilder.append("&fq=")
                .append(filterOn)
                .append("%3A")
                .append(filterBy)
                .append("+OR+")
                .append(filterOnAlt)
                .append("%3A")
                .append(filterBy);

    }

    private void addQuery(StringBuilder solrSearchBuilder, String query) throws IOException {
        try {
            solrSearchBuilder.append("&q=").append(URLEncoder.encode(query, "UTF-8"));
        }
        catch (UnsupportedEncodingException e) {
            throw new IOException("Invalid query string - " + query, e);
        }
    }

    private void addSpecificQuery(StringBuilder solrSearchBuilder, String query) throws IOException {
        try {
            solrSearchBuilder.append("&q=%22").append(URLEncoder.encode(query, "UTF-8"));
            solrSearchBuilder.append("%22");
        }
        catch (UnsupportedEncodingException e) {
            throw new IOException("Invalid query string - " + query, e);
        }
    }

    private void dispatchSearch(String searchString, OutputStream out) throws IOException {
        getLog().trace(searchString);
        System.out.println("Search String: "+searchString);
        CloseableHttpClient httpclient = HttpClients.createDefault();
        HttpGet httpGet = new HttpGet(searchString);
        if (System.getProperty("http.proxyHost") != null) {
            HttpHost proxy;
            if (System.getProperty("http.proxyPort") != null) {
                proxy = new HttpHost(System.getProperty("http.proxyHost"), Integer.parseInt(System.getProperty
                        ("http.proxyPort")));
            }
            else {
                proxy = new HttpHost(System.getProperty("http.proxyHost"));
            }
            httpGet.setConfig(RequestConfig.custom().setProxy(proxy).build());
        }

        try (CloseableHttpResponse response = httpclient.execute(httpGet)) {
            getLog().debug("Received HTTP response: " + response.getStatusLine().toString());
            HttpEntity entity = response.getEntity();
            entity.writeTo(out);
            EntityUtils.consume(entity);
        }
    }

    @RequestMapping(value = "api/search/advancefilter", produces = MediaType.APPLICATION_JSON_VALUE,method = {RequestMethod.GET,RequestMethod.POST})
    public void doEfoSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10000") int maxResults,
            @RequestParam(value = "fq", required = false, defaultValue = "") String fq,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "group.limit", required = false, defaultValue = "100") int groupLimit,
            @RequestParam(value = "group.field", required = false, defaultValue = "resourcename") String groupField,
            @RequestParam(value = "facet.field", required = false, defaultValue = "resourcename") String facetField,
            @RequestParam(value = "hl.fl", required = false, defaultValue = "shortForm,efoLink,mappedUri") String hlFl,
            @RequestParam(value = "hl.snippets", required = false, defaultValue = "1") int hlSnippets,
            @RequestParam(value = "fl", required = false, defaultValue = "") String fl,
            @RequestParam(value = "raw", required = false, defaultValue = "") String raw,
            HttpServletResponse response) throws IOException {
        StringBuilder solrSearchBuilder = buildFatSearchRequest();

        //TODO: Remove in future - Temporarily set 5000 as ut off until scalability problem is fixed https://bit.ly/3TnkjH7
        if (groupLimit != 1) groupLimit = 5000;

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }

        if(!fq.isEmpty()){
            addFilterQuery(solrSearchBuilder,searchConfiguration.getDefaultFacet(),fq.split(":")[1]);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addQuery(solrSearchBuilder, query);
        addGrouping(solrSearchBuilder, groupField, groupLimit);
        addFacet(solrSearchBuilder, facetField);
        Collection<String> highlights = new HashSet<>(Arrays.asList(hlFl.split(",")));
        addHighlights(solrSearchBuilder,highlights,hlSnippets);

        if (fl != "") {
            solrSearchBuilder.append("&fl=").append(URLEncoder.encode(fl, "UTF-8"));
        }

        if (raw != "") {
            solrSearchBuilder.append("&").append(URLEncoder.encode(raw, "UTF-8"));
        }

        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());
    }



    @ExceptionHandler
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    private String handleIllegalParameterCombinationException(IllegalParameterCombinationException e) {
        getLog().error("An illegal parameter combination was received", e);
        return "An illegal parameter combination was received: " + e.getMessage();
    }

    @ExceptionHandler
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    private String handleIOException(IOException e) {
        getLog().error("An IOException occurred during solr search communication", e);
        return "Your search could not be performed - we encountered a problem.  Weve been notified and will attempt " +
                "to rectify the problem as soon as possible.  If problems persist, please email gwas-info@ebi.ac.uk";
    }

    //    @RequestMapping(value = "api/search/downloads", produces = MediaType.TEXT_PLAIN_VALUE)
    @RequestMapping(value = "api/search/downloads", method = {RequestMethod.GET})
//    @CrossOrigin
    public void getSearchResults(
            @RequestParam("q") String query,
            @RequestParam(value = "pvalfilter", required = false) String pval,
            @RequestParam(value = "orfilter", required = false) String orRange,
            @RequestParam(value = "betafilter", required = false) String betaRange,
            @RequestParam(value = "datefilter", required = false) String dateRange,
            @RequestParam(value = "genomicfilter", required = false) String genomicRange,
            @RequestParam(value = "traitfilter[]", required = false) String[] traits,
            @RequestParam(value = "genotypingfilter[]", required = false) String[] genotypingTechnologies,
            @RequestParam(value = "dateaddedfilter", required = false) String addedDateRange,
            @RequestParam(value = "efo", defaultValue = "false") boolean efo,
            @RequestParam(value = "facet", required = true) String facet,
            @RequestParam(value = "ancestry", defaultValue = "false") boolean ancestry,
            @RequestParam(value = "cohortsAndSs", required = false) boolean includeCohortsAndSs,
            @RequestParam(value = "includeGxE", required = false) boolean includeGxE,
            HttpServletResponse response) throws IOException {

        StringBuilder solrSearchBuilder = buildFatSearchRequest();

        int maxResults = 1000000;
        int page = 1;

        if(facet.contains("_new_format")){
            addFilterQuery(solrSearchBuilder, "resourcename", "study");
        }else {
            addFilterQuery(solrSearchBuilder, "resourcename", facet);
        }
        addRowsAndPage(solrSearchBuilder, maxResults, page);

        if (pval != "") {
            getLog().debug(pval);
            addPvalueFilterQuery(solrSearchBuilder, pval);
        }
        /**TO DO - when we split OR and beta, modify this controller to reflect that change!!***/
        if (orRange != "") {
            getLog().debug(orRange);

            addFilterQuery(solrSearchBuilder, "orPerCopyNum", orRange);
//            addFilterQuery(solrSearchBuilder, "orType", "true");
        }
        if (betaRange != "") {
            getLog().debug(betaRange);

            addFilterQuery(solrSearchBuilder, "betaNum", betaRange);
//            addFilterQuery(solrSearchBuilder, "orType", "false");
        }
        if (dateRange != "") {
            getLog().debug(dateRange);
            addFilterQuery(solrSearchBuilder, "publicationDate", dateRange);
        }
        if(genomicRange != "") {
            getLog().debug(genomicRange);
            addGenomicRangeFilterQuery(solrSearchBuilder, genomicRange);
        }
        if (traits != null && traits.length != 0) {
            getLog().trace(String.valueOf(traits));

            addFilterQuery(solrSearchBuilder, "traitName_s", traits);
        }
        if (addedDateRange != "") {
            getLog().debug(addedDateRange);
            addFilterQuery(solrSearchBuilder, "catalogPublishDate", addedDateRange);

        }
        if (genotypingTechnologies != null && genotypingTechnologies.length != 0) {
            getLog().trace(String.valueOf(genotypingTechnologies));

            addFilterQuery(solrSearchBuilder, "genotypingTechnologies", genotypingTechnologies);
        }

        addQuery(solrSearchBuilder, query);

        String searchString = solrSearchBuilder.toString();

        /*this step is necessary as something about calling the URL directly rather than through $.getJSON messes
        up the URL encoding but explicitly URL encoding causes other interference
        */
        searchString = searchString.replace(" ", "+");

        // dispatch search
        //        return dispatchSearch(searchString);
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        Date date = new Date();
        String now = dateFormat.format(date);
        String fileName;
        String queryTag;

        if (query.contains("*")) {
            if (addedDateRange != "") {
                fileName = "gwas-downloaded_".concat(now).concat("-recentStudies.tsv");
            }
            else if (traits != null && traits.length != 0){
                fileName = "gwas-downloaded_".concat(now).concat("-selectedTraits.tsv");
            }
            else{
                if(efo && (!facet.equals("study_new_format"))){
                    fileName = "gwas_catalog_v1.0.2-".concat(facet).concat("-downloaded_").concat(now).concat(".tsv");
                }else if(facet.equals("study_new_format")){
                    fileName = "gwas_catalog_v1.0.3-study-downloaded_".concat(now).concat(".tsv");
                }else if(facet.equals("ancestry_new_format")){
                    fileName = "gwas_catalog_v1.0.3-ancestry-downloaded_".concat(now).concat(".tsv");
                }
                else {
                    fileName = "gwas_catalog_v1.0-".concat(facet).concat("-downloaded_").concat(now).concat(".tsv");
                }
            }
        }
        else if (ancestry){
            fileName = "gwas_catalog-ancestry-downloaded_".concat(now).concat(".tsv");

        }
        else {
            if (query.split(",").length > 1) {
                queryTag = query.split(",")[0] + "-withChildTraits";
            }
            else {
                queryTag = query;
            }

            fileName = "gwas-".concat(facet).concat("-downloaded_").concat(now)
                    .concat("-")
                    .concat(queryTag)
                    .concat(".tsv");
        }
        response.setContentType("text/tsv");
        response.setHeader("Content-Disposition", "attachement; filename=" + fileName);

        System.out.println("** query: "+solrSearchBuilder);

        dispatchDownloadSearch(searchString, response.getOutputStream(), efo, facet, ancestry, includeCohortsAndSs, includeGxE);
    }


    @RequestMapping(value = "api/search/downloads", method = RequestMethod.POST)
    @ResponseStatus(value=HttpStatus.OK)
    @ResponseBody
    public void testDownloadData(@RequestBody String query, HttpServletResponse response) throws IOException {

        String facet = "association";
        boolean efo = true;
        boolean ancestry = false;

        StringBuilder solrSearchBuilder = buildFatSearchRequest();

        int maxResults = 1000000;
        int page = 1;

        addFilterQuery(solrSearchBuilder, "resourcename", facet);
        addRowsAndPage(solrSearchBuilder, maxResults, page);
        String[] splitQuery;
        splitQuery = query.split("q=");
        String newString= splitQuery[1];
        newString = URLEncoder.encode(newString,"UTF-8");
        newString=newString.replace("%252C", ",");
        query = newString;


        addQuery(solrSearchBuilder,query);

        String searchString = solrSearchBuilder.toString();
        /*this step is necessary as something about calling the URL directly rather than through $.getJSON messes
        up the URL encoding but explicitly URL encoding causes other interference
        */
        searchString = searchString.replace(" ", "+");

        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        Date date = new Date();
        String now = dateFormat.format(date);
        String fileName;
        String queryTag;

        if (query.split(",").length > 1) {
            queryTag = query.split(",")[0] + "-withChildTraits";
        }
        else {
            queryTag = query;
        }

        fileName = "gwas-".concat(facet).concat("-downloaded_").concat(now)
                .concat("-")
                .concat(queryTag)
                .concat(".tsv");

        response.setContentType("text/tsv");
        response.setHeader("Content-Disposition", "attachement; filename=" + fileName);

        System.out.println("** query-Trait Download: "+solrSearchBuilder);

        dispatchDownloadSearch(searchString, response.getOutputStream(), efo, facet, ancestry, false, false);
    }



    private void dispatchDownloadSearch(String searchString, OutputStream outputStream, boolean efo, String facet, boolean ancestry, boolean includeCohortsAndSs, boolean includeGxE) throws IOException {
        getLog().trace(searchString);
        CloseableHttpClient httpclient = HttpClients.createDefault();
        HttpGet httpGet = new HttpGet(searchString);
        if (System.getProperty("http.proxyHost") != null) {
            HttpHost proxy;
            if (System.getProperty("http.proxyPort") != null) {
                proxy = new HttpHost(System.getProperty("http.proxyHost"), Integer.parseInt(System.getProperty
                        ("http.proxyPort")));
            }
            else {
                proxy = new HttpHost(System.getProperty("http.proxyHost"));
            }
            httpGet.setConfig(RequestConfig.custom().setProxy(proxy).build());
        }

        String file = null;
        try (CloseableHttpResponse response = httpclient.execute(httpGet)) {
            getLog().debug("Received HTTP response: " + response.getStatusLine().toString());
            HttpEntity entity = response.getEntity();

            BufferedReader br = new BufferedReader(new InputStreamReader(entity.getContent()));
            PrintWriter outputWriter = new PrintWriter(outputStream);

            JsonStreamingProcessorService jsonProcessor =
                    new JsonStreamingProcessorService(br, efo, facet, ancestry, includeCohortsAndSs, includeGxE, new BufferedWriter(outputWriter));
            jsonProcessor.processJson();
            outputWriter.flush();
            outputWriter.close();
        }
//            String output;
//            while ((output = br.readLine()) != null) {
//
//                JsonProcessingService jsonProcessor = new JsonProcessingService(output, efo, facet, ancestry);
//                file = jsonProcessor.processJson();
//
//            }
//
//            EntityUtils.consume(entity);
//        }
//        if (file == null) {
//
//            //TO DO throw exception here and add error handler
//            file =
//                    "Some error occurred during your request. Please try again or contact the GWAS Catalog team for assistance";
//        }
//
//        PrintWriter outputWriter = new PrintWriter(outputStream);
//
//        outputWriter.write(file);
//        outputWriter.flush();
    }

    // From Tburdett algorithm. Extract the traitName from the association and study.
    @RequestMapping(value = "api/search/parentSearch", produces = MediaType.APPLICATION_JSON_VALUE)
    @CrossOrigin
    public void doParentSearchSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "sort", required = false) String sort,
            HttpServletResponse response) throws IOException {

        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }
        //fq=-resourcename%3AefoTrait&fl=groupValue&wt=json&indent=true&group=true&group.field=traitName_s&fl=mappedUri,synonym
        //q=text%3ASoranzo&fq=-resourcename%3AefoTrait&fl=groupValue&wt=json&indent=true&group=true&group.field=traitName_s&fl=mappedUri,synonym
        addFilterQuery(solrSearchBuilder, "-resourcename", "efoTrait");
        addFilterQuery(solrSearchBuilder, "-resourcename", "diseaseTrait");
        addGrouping(solrSearchBuilder, "traitName_s", 1);
        addFields(solrSearchBuilder, "efoLink,mappedUri,synonym,groupValue,parent,mappedLabel,accessionId,author_s,pubmedId");
        addSpecificQuery(solrSearchBuilder, query);

        System.out.println(solrSearchBuilder.toString());
        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());

    }


    // From Tburdett ida. Show the studies related to the selected trait
    @RequestMapping(value = "api/search/studyByTraitSearch", produces = MediaType.APPLICATION_JSON_VALUE)
    @CrossOrigin
    public void doStudiesByTraitSearchSolrSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "jsonp", required = false, defaultValue = "false") boolean useJsonp,
            @RequestParam(value = "callback", required = false) String callbackFunction,
            @RequestParam(value = "max", required = false, defaultValue = "10") int maxResults,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "sort", required = false) String sort,
            HttpServletResponse response) throws IOException {

        StringBuilder solrSearchBuilder = buildSlimSearchRequest();

        if (useJsonp) {
            addJsonpCallback(solrSearchBuilder, callbackFunction);
        }

        addRowsAndPage(solrSearchBuilder, maxResults, page);
        addFilterQuery(solrSearchBuilder, "resourcename", "study");
        addGrouping(solrSearchBuilder, "pubmedId", 1);
        addFields(solrSearchBuilder, "accessionId,author_s,pubmedId,publicationLink");
        addSpecificQuery(solrSearchBuilder, query);

        System.out.println(solrSearchBuilder.toString());
        // dispatch search
        dispatchSearch(solrSearchBuilder.toString(), response.getOutputStream());

    }

}
