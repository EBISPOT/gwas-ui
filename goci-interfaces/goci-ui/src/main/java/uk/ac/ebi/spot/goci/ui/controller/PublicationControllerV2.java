package uk.ac.ebi.spot.goci.ui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import uk.ac.ebi.spot.goci.model.PublicationResult;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

/**
 * Created by Cinzia on 15/11/2017.
 * Publication page for THOR/Orcid project
 */
@Controller
public class PublicationControllerV2 {


    private SearchConfiguration searchConfiguration;

    @Autowired
    public PublicationControllerV2(SearchConfiguration searchConfiguration) {
        this.searchConfiguration = searchConfiguration;
    }

    @RequestMapping(value = "/v2/publications/{pubmedId}", produces = MediaType.TEXT_HTML_VALUE)
    public String search(Model model,
                         @PathVariable(required = false) String pubmedId,
                         @RequestParam(required = false) String filter) {
        PublicationResult publicationResult = new PublicationResult();
        publicationResult.setQuery(pubmedId);
        publicationResult.setFilter(filter);
        publicationResult.setPumedId(pubmedId);
        model.addAttribute("result", publicationResult);
        return "publication-page-v2";
    }

}
