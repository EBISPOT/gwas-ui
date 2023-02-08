package uk.ac.ebi.spot.goci.refactoring.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.io.IOException;
import java.util.List;

@Service
public class SolrSearchServiceImpl implements SolrSearchService {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchServiceImpl.class);
    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    RestInteractionService restInteractionService;

    ObjectMapper objectMapper = new ObjectMapper();

    public Page<StudyDoc> searchStudies(String rsId, Pageable pageable, SearchStudyDTO searchStudyDTO) throws IOException {
       String query = String.format("rsId:\"%s\" OR association_rsId :\"%s\"", rsId, rsId);
        String sortDirection = "";
        String sortProperty = "";
        Sort sort = pageable.getSort();
        if(sort != null) {
            Sort.Order orderAsscn = sort.getOrderFor("associationCount");
            Sort.Order orderPvalue = sort.getOrderFor("fullPvalueSet");
            if(orderAsscn != null) {
                sortDirection =  orderAsscn.isAscending() ? "asc" : "desc";
                sortProperty = "associationCount";
            }
            if(orderPvalue != null) {
                sortDirection =  orderPvalue.isAscending() ? "asc" : "desc";
                sortProperty = "fullPvalueSet";
            }
        }
       String uri = buildURIComponent( pageable.getPageSize(),  pageable.getPageNumber()+1, query, searchStudyDTO, sortProperty, sortDirection);
       SolrData data =  restInteractionService.callSolrAPI(uri);
       if( data != null &&  data.getResponse() != null ) {
           log.info("Response data Count"+data.getResponse().getNumFound());
           List<? > docs =  data.getResponse().getDocs();
           List<StudyDoc> studyDocs = objectMapper.convertValue(docs, new TypeReference<List<StudyDoc>>(){{}});
           Page<StudyDoc> page = new PageImpl<>(studyDocs, pageable, data.getResponse().getNumFound());
           return page;
       } else {
           return null;
       }
    }


    private String buildURIComponent( int maxResults, int page, String query, SearchStudyDTO searchStudyDTO,
                                     String sortProperty, String sortDirection) {
        StringBuilder solrSearchBuilder = new StringBuilder();
        solrSearchBuilder.append(searchConfiguration.getGwasSearchFatServer().toString())
                .append("/select?");
        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(solrSearchBuilder.toString())
                .queryParams(buildQueryParams( maxResults, page, query, searchStudyDTO, sortProperty, sortDirection))
                .build();
        return uriComponents.toUriString();
    }

    private MultiValueMap<String, String> buildQueryParams( int maxResults, int page, String query, SearchStudyDTO searchStudyDTO ,
                                                           String sortProperty, String sortDirection) {
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("wt","json");
        paramsMap.add("rows",String.valueOf(maxResults));
        int start = (page - 1) * maxResults;
        paramsMap.add("start", String.valueOf(start));
        String fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_STUDY;
        if(searchStudyDTO != null) {
            fq = buildFilterQuery(fq, searchStudyDTO);
            log.info("The final fq value after applying filters is"+fq);
        }
        String fl = "*";
        String sortParam = sortProperty + " "+ sortDirection;
        paramsMap.add("q",query );
        paramsMap.add("fq",fq );
        paramsMap.add("fl",fl );
        if(!sortParam.trim().isEmpty()) {
            paramsMap.add("sort", sortParam);
        }
        return paramsMap;
    }

    private String buildFilterQuery(String filterQuery, SearchStudyDTO searchStudyDTO) {
        StringBuilder filterQueryBuilder = new StringBuilder();
        String accessionId = searchStudyDTO.getAccessionId();
        String reportedTrait = searchStudyDTO.getReportedTrait();
        String efoTrait = searchStudyDTO.getEfoTrait();
        String bgTrait = searchStudyDTO.getBgTrait();
        filterQueryBuilder.append(filterQuery);

        if(accessionId != null && reportedTrait != null && efoTrait != null && bgTrait != null) {
            filterQueryBuilder.append(String.format(" AND accessionId:\"%s\" AND traitName:\"*%s*\" AND " +
                            "mappedLabel:\"*%s*\" AND mappedBkgLabel:\"*%s*\"",accessionId, reportedTrait,
                            efoTrait,  bgTrait));

        } else if(reportedTrait != null && efoTrait != null && bgTrait != null ) {
            filterQueryBuilder.append(String.format(" AND traitName:\"*%s*\" AND " +
                            "mappedLabel:\"*%s*\" AND mappedBkgLabel:\"*%s*\"", reportedTrait,
                    efoTrait,  bgTrait));
        }else if(reportedTrait != null && efoTrait != null ) {
            filterQueryBuilder.append(String.format(" AND traitName:\"*%s*\" AND " +
                            "mappedLabel:\"*%s*\"", reportedTrait,
                    efoTrait));
        }
        else if(reportedTrait != null && bgTrait != null ) {
            filterQueryBuilder.append(String.format(" AND traitName:\"*%s*\" AND " +
                            "mappedBkgLabel:\"*%s*\"", reportedTrait,
                    bgTrait));
        }else if(efoTrait != null && bgTrait != null ) {
            filterQueryBuilder.append(String.format(" AND mappedLabel:\"*%s*\" AND " +
                            "mappedBkgLabel:\"*%s*\"", efoTrait,
                    bgTrait));
        }else if(reportedTrait != null ) {
            filterQueryBuilder.append(String.format(" AND traitName:\"*%s*\"", reportedTrait));
        }else if(efoTrait != null ) {
            filterQueryBuilder.append(String.format(" AND mappedLabel:\"*%s*\"", efoTrait));
        }else if(bgTrait != null ) {
            filterQueryBuilder.append(String.format(" AND mappedBkgLabel:\"*%s*\"", bgTrait));
        }else {
            if(accessionId != null) {
                filterQueryBuilder.append(String.format(" AND accessionId:\"%s\"", accessionId));
            }
        }

        return filterQueryBuilder.toString();

    }


}
