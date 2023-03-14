package uk.ac.ebi.spot.goci.refactoring.service;

import java.util.List;
import java.util.Map;

public interface SolrSearchEFOTraitService {

    Map<String, String> getOLSTerms(String efoId);

    List<String> getChildTraits(Map<String, String> olsTerms);

    List<String> getChildTraitLabels(List<String> childTraits);
}
