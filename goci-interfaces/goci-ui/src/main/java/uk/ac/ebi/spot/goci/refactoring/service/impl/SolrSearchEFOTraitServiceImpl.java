package uk.ac.ebi.spot.goci.refactoring.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.ac.ebi.spot.goci.refactoring.component.EFOTraitIdentifierMap;
import uk.ac.ebi.spot.goci.refactoring.service.RestAPIEFOService;
import uk.ac.ebi.spot.goci.refactoring.service.SolrSearchEFOTraitService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

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

}
