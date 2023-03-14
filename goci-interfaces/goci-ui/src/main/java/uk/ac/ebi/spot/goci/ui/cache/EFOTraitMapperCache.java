package uk.ac.ebi.spot.goci.ui.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.component.EFOTraitIdentifierMap;

import javax.annotation.PostConstruct;

@Component
public class EFOTraitMapperCache {

    private static final Logger log = LoggerFactory.getLogger(EFOTraitMapperCache.class);
    @Autowired
    EFOTraitIdentifierMap efoTraitIdentifierMap;

    @Scheduled(cron = "0 29 21 * * *")
    public void populateEFOTraitIdentifierMap() {
        efoTraitIdentifierMap.populateEFOMap();
    }

    @PostConstruct
    public void init() {
        try {
            efoTraitIdentifierMap.populateEFOMap();
        } catch (Exception ex) {
            log.error("Exception in populating efoTraitIdentifierMap " + ex.getMessage(), ex);
        }
    }
 }
