package uk.ac.ebi.spot.goci.refactoring.component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.service.RestAPIEFOService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

import java.util.HashMap;
import java.util.Map;

@Component
public class EFOTraitIdentifierMap {

    private static final Logger log = LoggerFactory.getLogger(EFOTraitIdentifierMap.class);
    @Autowired
    RestAPIEFOService restAPIEFOService;

    Map<String, String> efoTraitMap;

    @Autowired
    SearchConfiguration searchConfiguration;

    public void populateEFOMap() {
        log.info("Inside populateEFOMap()");
        Map<String, String> efoMap = new HashMap<>();
        efoTraitMap = restAPIEFOService.callEFORestAPI(searchConfiguration.getRestAPILink(), efoMap);
        //efoTraitMap.forEach((k,v) -> log.info("The shortform is "+ k));
    }

    public Map<String, String> getEfoTraitMap() {
        return efoTraitMap;
    }
}
