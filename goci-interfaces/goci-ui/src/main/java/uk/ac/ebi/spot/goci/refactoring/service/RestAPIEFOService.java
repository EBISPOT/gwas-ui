package uk.ac.ebi.spot.goci.refactoring.service;

import java.util.Map;

public interface RestAPIEFOService {

    Map<String, String>  callOlsRestAPI(String uri, Map<String, String> olsTerms, String efoId) ;

    Map<String, String> callEFORestAPI(String uri, Map<String, String> shortforms);
}
