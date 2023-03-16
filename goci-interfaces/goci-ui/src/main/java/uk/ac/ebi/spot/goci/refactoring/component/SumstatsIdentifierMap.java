package uk.ac.ebi.spot.goci.refactoring.component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.service.SumstatsAPIService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.cache.SSMapperCache;

import java.util.HashMap;
import java.util.Map;

@Component
public class SumstatsIdentifierMap {

    private static final Logger log = LoggerFactory.getLogger(SumstatsIdentifierMap.class);
    private Map<String, String> sumstatsMap = null;

    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    SumstatsAPIService sumstatsAPIService;

    public void populateSumstatsMap() {

        Map<String, String> ssMap = new HashMap<>();
        sumstatsMap = sumstatsAPIService.getSumstatsMap(searchConfiguration.getSumstatsAPILink());
        //sumstatsMap.forEach((k,v) -> log.info("The ssApi accession is ->"+k));
    }

    public Map<String, String> getSumstatsMap() {
        return sumstatsMap;
    }
}
