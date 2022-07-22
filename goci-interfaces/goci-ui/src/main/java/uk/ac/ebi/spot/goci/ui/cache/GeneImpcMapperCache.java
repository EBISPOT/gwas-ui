package uk.ac.ebi.spot.goci.ui.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.ui.component.ImpcIdentifierMap;
import uk.ac.ebi.spot.goci.ui.service.GeneImpcLinkService;

import javax.annotation.PostConstruct;

@Component
public class GeneImpcMapperCache {

    private static final Logger log = LoggerFactory.getLogger(GeneImpcMapperCache.class);

    @Autowired
    ImpcIdentifierMap impcIdentifierMap;

    @Autowired
    GeneImpcLinkService geneImpcLinkService;


    /** Cache to pull Mouse Ortholog mappings from IMPC API &
    populate a Hashmap with Gene as key & MGIdentifier as value
     **/
    @Scheduled(cron = "0 00 07 * * *")
    public void  populateGeneImpcMap() {
        geneImpcLinkService.populateGeneImpcMap();
    }

    /** Populate Mouse Ortholog mappings from IMPC API  on server startup
     **/
    @PostConstruct
    public void init() {
        try {
            geneImpcLinkService.populateGeneImpcMap();
        } catch(Exception ex) {
            log.error("Exception in populateGeneImpcMap "+ex.getMessage(),ex);
        }
    }
}
