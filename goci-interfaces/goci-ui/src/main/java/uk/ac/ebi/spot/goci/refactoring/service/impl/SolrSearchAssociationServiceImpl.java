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
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchAssociationService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.util.List;

@Service
public class SolrSearchAssociationServiceImpl implements SolrSearchAssociationService {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchStudyServiceImpl.class);
    @Autowired
    SearchConfiguration searchConfiguration;
    @Autowired
    RestInteractionService restInteractionService;

    ObjectMapper objectMapper = new ObjectMapper();


    public Page<AssociationDoc> searchAssociations(String query, Pageable pageable, SearchAssociationDTO searchAssociationDTO) {
        log.info("Query->"+query);
        String uri = buildURIComponent();
        SolrData data = restInteractionService.callSolrAPIwithPayload(uri, buildQueryParams( pageable.getPageSize(), pageable.getPageNumber() + 1, query, searchAssociationDTO, buildSortParam(pageable)));
        if( data != null &&  data.getResponse() != null ) {
            log.info("Response data Count"+data.getResponse().getNumFound());
            List<? > docs =  data.getResponse().getDocs();
            List<AssociationDoc> associationDocs = objectMapper.convertValue(docs, new TypeReference<List<AssociationDoc>>(){{}});
            Page<AssociationDoc> page = new PageImpl<>(associationDocs, pageable, data.getResponse().getNumFound());
            return page;
        } else {
            return null;
        }
    }


    private String buildURIComponent() {
        String fatSolrUri = restInteractionService.getFatSolrUri();
        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(fatSolrUri)
                //.queryParams(buildQueryParams( maxResults, page, query, searchAssociationDTO, sortParam))
                .build();
        return uriComponents.toUriString();
    }



    public MultiValueMap<String, String> buildQueryParams(int maxResults, int page, String query, SearchAssociationDTO searchAssociationDTO ,
                                                           String sortParam) {
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("wt","json");
        paramsMap.add("rows",String.valueOf(maxResults));
        int start = (page - 1) * maxResults;
        paramsMap.add("start", String.valueOf(start));
        String fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;
        if(searchAssociationDTO != null) {
            fq = buildFilterQuery(fq, searchAssociationDTO);
            log.info("The final fq value after applying filters is"+fq);
        }
        String fl = SearchUIConstants.ASSOCIATION_SOLR_FIELDS;
        //String fl = "*";
        paramsMap.add("q",query );
        paramsMap.add("fq",fq );
        paramsMap.add("fl",fl );
        if(!sortParam.trim().isEmpty()) {
            paramsMap.add("sort", sortParam);
        }
        return paramsMap;
    }

    public String buildFilterQuery(String filterQuery, SearchAssociationDTO searchAssociationDTO) {
        StringBuilder filterQueryString = new StringBuilder();
        String riskAllele = searchAssociationDTO.getRiskAllele();
        String pValueAnnotation = searchAssociationDTO.getPValueAnnotation();
        String mappedGene = searchAssociationDTO.getMappedGene();
        String accessionId = searchAssociationDTO.getAccessionId();
        String reportedTrait = searchAssociationDTO.getReportedTrait();
        String efoTrait = searchAssociationDTO.getEfoTrait();
        String bgTrait = searchAssociationDTO.getBgTrait();
        filterQueryString.append(filterQuery);

        if(riskAllele != null ) {
            if(riskAllele.contains(" "))
                filterQueryString.append(String.format(" AND strongestAllele:\"*%s*\"", riskAllele));
            else
                filterQueryString.append(String.format(" AND strongestAllele:*%s*", riskAllele));
        }
        if(pValueAnnotation != null ) {
            if(pValueAnnotation.contains(" "))
                filterQueryString.append(String.format(" AND qualifier:\"*%s*\"", pValueAnnotation));
            else
                filterQueryString.append(String.format(" AND qualifier:*%s*", pValueAnnotation));
        }
        if(mappedGene != null ) {
            if(mappedGene.contains(" "))
                filterQueryString.append(String.format(" AND ensemblMappedGenes:\"*%s*\"", mappedGene));
            else
                filterQueryString.append(String.format(" AND ensemblMappedGenes:*%s*", mappedGene));
        }
        if(reportedTrait != null ) {
            if(reportedTrait.contains(" "))
                filterQueryString.append(String.format(" AND traitName:\"*%s*\"", reportedTrait));
            else
                filterQueryString.append(String.format(" AND traitName:*%s*", reportedTrait));
        }
        if(efoTrait != null ) {
            if(efoTrait.contains(" "))
                filterQueryString.append(String.format(" AND mappedLabel:\"*%s*\"", efoTrait));
            else
                filterQueryString.append(String.format(" AND mappedLabel:*%s*", efoTrait));
        }
        if(bgTrait != null ) {
            if(bgTrait.contains(" "))
                filterQueryString.append(String.format(" AND mappedBkgLabel:\"*%s*\"", bgTrait));
            else
                filterQueryString.append(String.format(" AND mappedBkgLabel:*%s*", bgTrait));
        }
        if(accessionId != null ) {
            filterQueryString.append(String.format(" AND accessionId:\"*%s*\"", accessionId));
        }
        return filterQueryString.toString();
    }

    public String buildSortParam(Pageable pageable) {
        Sort sort = pageable.getSort();
        String sortParam = "";
        String sortProperty = "";
        if(sort != null) {
            Sort.Order orderPvalue = sort.getOrderFor("pvalue");
            Sort.Order orderRAF = sort.getOrderFor("raf");
            Sort.Order orderBeta = sort.getOrderFor("beta");
            Sort.Order orderOr = sort.getOrderFor("or");
            Sort.Order orderFirstAuthor = sort.getOrderFor("firstAuthor");

            if(orderPvalue != null) {
                sortProperty = orderPvalue.isAscending() ? "asc" : "desc";
                sortParam = String.format("pValueExponent %s,pValueMantissa %s", sortProperty, sortProperty);
            }

            if(orderRAF != null) {
                sortProperty = orderRAF.isAscending() ? "asc" : "desc";
                sortParam = String.format("riskFrequency %s", sortProperty);
            }

            if(orderBeta != null) {
                sortProperty = orderBeta.isAscending() ? "asc" : "desc";
                sortParam = String.format("betaNum %s", sortProperty);
            }

            if(orderOr != null) {
                sortProperty = orderOr.isAscending() ? "asc" : "desc";
                sortParam = String.format("orPerCopyNum %s", sortProperty);
            }

            if(orderFirstAuthor != null) {
                sortProperty = orderFirstAuthor.isAscending() ? "asc" : "desc";
                sortParam = String.format("author_s %s", sortProperty);
            }

             }
        return sortParam;
    }

}



