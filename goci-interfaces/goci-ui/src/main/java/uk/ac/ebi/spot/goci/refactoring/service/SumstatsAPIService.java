package uk.ac.ebi.spot.goci.refactoring.service;

import java.util.Map;

public interface SumstatsAPIService {

    Map<String, String> getSumstatsMap(String uri);
}
