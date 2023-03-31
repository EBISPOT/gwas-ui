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
import uk.ac.ebi.spot.goci.refactoring.model.EFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SearchStudyDTO;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitsService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrTableExportService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;

import java.util.List;

@Service
public class SolrTableExportServiceImpl implements SolrTableExportService {

    private static final Logger log = LoggerFactory.getLogger(SolrSearchStudyServiceImpl.class);
    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    RestInteractionService restInteractionService;

    @Autowired
    SolrSearchEFOTraitsService solrSearchEFOTraitsService;

    ObjectMapper objectMapper = new ObjectMapper();

    public List<StudyDoc> fetchStudies(String query) {
        String uri = buildURIComponent();
        log.info("The Query is ->"+query);
        SolrData data = restInteractionService.callSolrAPIwithPayload(uri, buildQueryParams( query, "study"));
        if (data != null && data.getResponse() != null) {
            log.info("Response data Count" + data.getResponse().getNumFound());
            List<?> docs = data.getResponse().getDocs();
            List<StudyDoc> studyDocs = objectMapper.convertValue(docs, new TypeReference<List<StudyDoc>>() {{
            }});
            return studyDocs;
        }
        else{
            return null;
        }
    }

    public List<AssociationDoc> fetchAssociations(String query) {
        String uri = buildURIComponent();
        SolrData data = restInteractionService.callSolrAPIwithPayload(uri, buildQueryParams(query, "association"));
        if( data != null &&  data.getResponse() != null ) {
            log.info("Response data Count" + data.getResponse().getNumFound());
            List<?> docs = data.getResponse().getDocs();
            List<AssociationDoc> associationDocs = objectMapper.convertValue(docs, new TypeReference<List<AssociationDoc>>() {{
            }});
            return associationDocs;
        } else {
            return null;
        }
    }

    public List<EFOTraitDoc> fetchEFOTraits(String query) {
        String uri = buildURIComponent(query);
        SolrData data = restInteractionService.callSolrAPI(uri);
        if( data != null &&  data.getResponse() != null ) {
            log.info("Response data Count" + data.getResponse().getNumFound());
            List<?> docs = data.getResponse().getDocs();
            List<AssociationDoc> associationDocs = objectMapper.convertValue(docs, new TypeReference<List<AssociationDoc>>() {{
            }});
            List<EFOTraitDoc> efoTraitsDocs = solrSearchEFOTraitsService.createEFOTraitData(associationDocs, null, null);
            return efoTraitsDocs;
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


    private String buildURIComponent(String query) {
        String fatSolrUri = restInteractionService.getFatSolrUri();
        UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(fatSolrUri)
                .queryParams(buildQueryParams( query,"efo"))
                .build();
        return uriComponents.toUriString();
    }


    private MultiValueMap<String, String> buildQueryParams( String query, String dataType) {
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("wt","json");
        paramsMap.add("rows",String.valueOf(Integer.MAX_VALUE));
        String fq = "";
        String fl = "";
        if(dataType.equals("study")) {
            fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_STUDY;
            fl = "*";
        }
        if(dataType.equals("association")) {
            fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;
            fl = SearchUIConstants.ASSOCIATION_SOLR_FIELDS;
        }
        if(dataType.equals("efo")) {
            fq = searchConfiguration.getDefaultFacet()+":"+ SearchUIConstants.FACET_ASSOCIATION;
            fl = SearchUIConstants.EFO_FIELDS;
        }

        paramsMap.add("q",query );
        paramsMap.add("fq",fq );
        paramsMap.add("fl",fl );

        return paramsMap;
    }
}
