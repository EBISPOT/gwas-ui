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
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchSumstatsService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.io.IOException;
import java.util.List;
@Service
public class SolrSearchSumstatsServiceImpl implements SolrSearchSumstatsService {
    private static final Logger log = LoggerFactory.getLogger(SolrSearchSumstatsServiceImpl.class);
    @Autowired
    RestInteractionService restInteractionService;
    @Autowired
    SearchConfiguration searchConfiguration;

    ObjectMapper objectMapper = new ObjectMapper();

    public Page<StudyDoc> searchStudies(String query, Pageable pageable, SearchStudyDTO searchStudyDTO) throws IOException {
        String uri = buildURIComponent();
        log.info("The Query is ->"+query);
        SolrData data = restInteractionService.callSolrAPIwithPayload(uri, buildQueryParams(pageable.getPageSize(), pageable.getPageNumber() + 1, query, searchStudyDTO, buildSortParam(pageable)));
        if (data != null && data.getResponse() != null) {
            log.info("Response data Count" + data.getResponse().getNumFound());
            List<?> docs = data.getResponse().getDocs();
            List<StudyDoc> studyDocs = objectMapper.convertValue(docs, new TypeReference<List<StudyDoc>>(){{}});
            Page<StudyDoc> page = new PageImpl<>(studyDocs, pageable, data.getResponse().getNumFound());
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



    private MultiValueMap<String, String> buildQueryParams(int maxResults, int page, String query, SearchStudyDTO searchStudyDTO ,
                                                           String sortParam) {
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
        String fl = SearchUIConstants.SUMSTATS_SOLR_FIELDS;
        //String fl = "*";
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
        String firstAuthor = searchStudyDTO.getFirstAuthor();
        filterQueryBuilder.append(filterQuery);

        if(accessionId != null) {
            filterQueryBuilder.append(String.format(" AND accessionId:\"*%s*\"",accessionId));
        }
        if(firstAuthor != null) {
            if(firstAuthor.contains(" "))
                filterQueryBuilder.append(String.format( " AND author:\"*%s*\"", firstAuthor));
            else
                filterQueryBuilder.append(String.format( " AND author:*%s*", firstAuthor));
        }
        if(reportedTrait != null) {
            if(reportedTrait.contains(" "))
                filterQueryBuilder.append(String.format(" AND traitName:\"*%s*\"",reportedTrait));
            else
                filterQueryBuilder.append(String.format(" AND traitName:*%s*",reportedTrait));
        }
        if(efoTrait != null) {
            if(efoTrait.contains(" "))
                filterQueryBuilder.append(String.format(" AND mappedLabel:\"*%s*\"",efoTrait));
            else
                filterQueryBuilder.append(String.format(" AND mappedLabel:*%s*",efoTrait));
        }
        if(bgTrait != null) {
            if(bgTrait.contains(" "))
                filterQueryBuilder.append(String.format(" AND mappedBkgLabel:\"*%s*\"",bgTrait));
            else
                filterQueryBuilder.append(String.format(" AND mappedBkgLabel:*%s*",bgTrait));
        }

        return filterQueryBuilder.toString();

    }

    private String  buildSortParam(Pageable pageable) {
        Sort sort = pageable.getSort();
        String sortParam = "";
        String sortProperty = "";
        if(sort != null) {
            Sort.Order orderAsscn = sort.getOrderFor("associationCount");
            Sort.Order orderPdate = sort.getOrderFor("publicationDate");
            Sort.Order orderFirstAuthor = sort.getOrderFor("firstAuthor");
            if(orderAsscn != null) {
                sortProperty =  orderAsscn.isAscending() ? "asc" : "desc";
                sortParam = String.format("associationCount %s", sortProperty);

                if(orderPdate != null) {
                    sortProperty =  orderPdate.isAscending() ? "asc" : "desc";
                    sortParam = String.format("publicationDate %s", sortProperty);
                }
                if(orderFirstAuthor != null) {
                    sortProperty =  orderFirstAuthor.isAscending() ? "asc" : "desc";
                    sortProperty = String.format("author_s %s", sortProperty);
                }
            }
        }else {
            sortParam = "publicationDate desc";
        }
        return sortParam;
    }

}
