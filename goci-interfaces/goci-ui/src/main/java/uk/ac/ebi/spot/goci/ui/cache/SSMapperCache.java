package uk.ac.ebi.spot.goci.ui.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.component.SumstatsIdentifierMap;

import javax.annotation.PostConstruct;

@Component
public class SSMapperCache {

    private static final Logger log = LoggerFactory.getLogger(SSMapperCache.class);
    @Autowired
    SumstatsIdentifierMap sumstatsIdentifierMap;

    @Scheduled(cron = "0 00 06 * * *")
    public void populateSSIdentifierMap() {
        sumstatsIdentifierMap.populateSumstatsMap();
    }


    @PostConstruct
    public void init() {
        try {
            sumstatsIdentifierMap.populateSumstatsMap();
        } catch (Exception ex) {
            log.error("Exception in populating sumstatsIdentifierMap " + ex.getMessage(), ex);
        }
    }
}
