package uk.ac.ebi.spot.goci.ui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import uk.ac.ebi.spot.goci.model.GeneResult;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

/**
 * Created by Daniel on 10/11/2018.
 * Based on the variant controller
 */
@Controller
public class GeneController {


    private SearchConfiguration searchConfiguration;

    @Autowired
    public GeneController(SearchConfiguration searchConfiguration) {
        this.searchConfiguration = searchConfiguration;
    }

    //@RequestMapping(value = "genes", produces = MediaType.TEXT_HTML_VALUE)
    //public String search() {
    //    return "genes";
    //}

    @RequestMapping(value = "/genes/{geneId:.+}", produces = MediaType.TEXT_HTML_VALUE)
    public String search(Model model,
                         @PathVariable(required = false) String geneId,
                         @RequestParam(required = false) String filter) {
        GeneResult geneResult = new GeneResult();
        geneResult.setQuery(geneId);
        geneResult.setFilter(filter);
        geneResult.setGeneId(geneId);
        model.addAttribute("result", geneResult);
        return "gene-page-v2";
    }

}
