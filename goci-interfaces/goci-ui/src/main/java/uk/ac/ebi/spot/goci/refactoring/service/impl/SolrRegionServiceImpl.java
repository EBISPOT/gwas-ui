package uk.ac.ebi.spot.goci.refactoring.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.model.AssociationDoc;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrRegionService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.util.List;

@Service
public class SolrRegionServiceImpl implements SolrRegionService {

    private static final Logger log = LoggerFactory.getLogger(SolrRegionServiceImpl.class);
    @Autowired
    SearchConfiguration searchConfiguration;
    @Autowired
    RestInteractionService restInteractionService;

    ObjectMapper objectMapper = new ObjectMapper();

    public List<AssociationDoc> searchAssociations(String query) {
        String uri = buildURIComponent(query);
        SolrData data = restInteractionService.callSolrAPI(uri);
        if( data != null &&  data.getResponse() != null ) {
            log.info("Response data Count"+data.getResponse().getNumFound());
            List<? > docs =  data.getResponse().getDocs();
            List<AssociationDoc> associationDocs = objectMapper.convertValue(docs, new TypeReference<List<AssociationDoc>>(){{}});
            return associationDocs;
        } else {
            return null;
        }
    }


    private String buildURIComponent( String query) {
        String fatSolrUri = restInteractionService.getFatSolrUri();
        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(fatSolrUri)
                .queryParams(buildQueryParams(query))
                .build();
        return uriComponents.toUriString();
    }

    private MultiValueMap<String, String> buildQueryParams(String query) {
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("wt","json");
        paramsMap.add("rows",String.valueOf(Integer.MAX_VALUE));
        //int start = (page - 1) * maxResults;
        //paramsMap.add("start", String.valueOf(start));
        String fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;
        String fl = SearchUIConstants.ACCESSION_ID;
        //String fl = "*";
        paramsMap.add("q",query );
        paramsMap.add("fq",fq );
        paramsMap.add("fl",fl );

        return paramsMap;
    }

}
