package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.util.MultiValueMap;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.model.OLSTermApiDoc;
import uk.ac.ebi.spot.goci.refactoring.model.RestApiEFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SumstatsAPIDoc;

public interface RestInteractionService {

    SolrData callSolrAPI(String uri);

    SolrData callSolrAPIwithPayload(String uri , MultiValueMap<String, String> paramsMap);

    String getFatSolrUri();


    RestApiEFOTraitDoc callRestAPIEFOTraits(String uri);

    OLSTermApiDoc callOlsRestAPI(String uri, String efoId);

    SumstatsAPIDoc callSSAPI(String uri);


}
