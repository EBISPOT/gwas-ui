package uk.ac.ebi.spot.goci.refactoring.service;

import org.springframework.util.MultiValueMap;
import uk.ac.ebi.spot.goci.model.solr.SolrData;

public interface RestInteractionService {

    SolrData callSolrAPI(String uri);

    SolrData callSolrAPIwithPayload(String uri , MultiValueMap<String, String> paramsMap);

    String getFatSolrUri();


}
