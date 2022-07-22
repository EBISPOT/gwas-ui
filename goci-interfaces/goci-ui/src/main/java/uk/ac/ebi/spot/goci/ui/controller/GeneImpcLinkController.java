package uk.ac.ebi.spot.goci.ui.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.goci.ui.component.ImpcIdentifierMap;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.ui.service.GeneImpcLinkService;

import java.util.Optional;

@RestController
@RequestMapping(value = SearchUIConstants.API_V1 + SearchUIConstants.GENE_MOUSE_ORTHOLOG_URI)
public class GeneImpcLinkController {
    private static final Logger log = LoggerFactory.getLogger(GeneImpcLinkController.class);

    @Autowired
    ImpcIdentifierMap impcIdentifierMap;

    @Autowired
    GeneImpcLinkService geneImpcLinkService;


    /** API to do on demand load of Mouse Ortholog & Gene Map
     *
     */
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @GetMapping
    public void uploadImpcLinkMap(@RequestParam( value = SearchUIConstants.PARAM_OPERATION,
                                  required = true) String operation){
        if(operation.equals(SearchUIConstants.PURGE))
            geneImpcLinkService.populateGeneImpcMap();
    }

    /** API called UI to retreive Mouse Ortholog mapping for Gene
     *
     * @param geneId
     * @return
     */
    @ResponseStatus(HttpStatus.OK)
    @GetMapping(value = "/{geneId}")
    public String retreiveImpcLink(@PathVariable String geneId ) {
        String impcId;
        if (impcIdentifierMap.getImpcGeneMap() != null){
            impcId = Optional.ofNullable(impcIdentifierMap.getImpcGeneMap()
                    .get(geneId)).orElse("NA");
        }
        else{
            impcId = "NA";
        }
        log.info("Impc id->"+impcId);
        return impcId;
    }




}
