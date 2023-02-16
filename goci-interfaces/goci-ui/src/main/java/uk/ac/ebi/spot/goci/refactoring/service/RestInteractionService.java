package uk.ac.ebi.spot.goci.refactoring.service;

import uk.ac.ebi.spot.goci.model.solr.SolrData;

public interface RestInteractionService {

    public SolrData callSolrAPI(String uri);

    public String getFatSolrUri();


}
