package uk.ac.ebi.spot.goci.refactoring.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.component.EFOTraitIdentifierMap;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchAssociationDTO;
import uk.ac.ebi.spot.goci.refactoring.service.RestAPIEFOService;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.util.Comparator;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class SolrSearchEFOTraitServiceImpl implements SolrSearchEFOTraitService {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchEFOTraitServiceImpl.class);
    @Autowired
    RestAPIEFOService restAPIEFOService;

    @Autowired
    SearchConfiguration searchConfiguration;
    @Autowired
    EFOTraitIdentifierMap efoTraitIdentifierMap;
    @Autowired
    RestInteractionService restInteractionService;
    ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, String> getOLSTerms(String efoId) {
        Map<String, String> olsTermsMap = new Hashtable<>();
        return restAPIEFOService.callOlsRestAPI(searchConfiguration.getOlsAPILink(), olsTermsMap, efoId);
    }

    public List<String> getChildTraits(Map<String, String> olsTerms) {
        Map<String, String> efoMap = efoTraitIdentifierMap.getEfoTraitMap();
        return olsTerms.keySet().stream()
                .filter(shortform -> {
                    //log.info("The EFO which is child from OLS is ->"+shortform);
                    return efoMap.get(shortform) != null;
                })
                .collect(Collectors.toList());
    }

    public List<String> getChildTraitLabels(List<String> childTraits) {
        Map<String, String> efoMap = efoTraitIdentifierMap.getEfoTraitMap();
        return childTraits.stream().map(shortForm -> efoMap.get(shortForm))
                .collect(Collectors.toList());
    }

   public  Page<AssociationDoc> searchAssociations(String query, Pageable pageable) {
       log.info("Query->"+query);
       String uri = buildURIComponent();
       SolrData data = restInteractionService.callSolrAPIwithPayload(uri, buildQueryParams( pageable.getPageSize(), pageable.getPageNumber() + 1, query));
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
                //.queryParams(buildQueryParams( maxResults, page, query))
                .build();
        return uriComponents.toUriString();
    }

    private MultiValueMap<String, String> buildQueryParams(int maxResults, int page, String query) {
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("wt","json");
        paramsMap.add("rows",String.valueOf(maxResults));
        int start = (page - 1) * maxResults;
        paramsMap.add("start", String.valueOf(start));
        String fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;
        String fl = SearchUIConstants.LOCUS_ZOOM_SOLR_FIELDS;
        //String fl = "*";
        paramsMap.add("q",query );
        paramsMap.add("fq",fq );
        paramsMap.add("fl",fl );
        return paramsMap;
    }
}
