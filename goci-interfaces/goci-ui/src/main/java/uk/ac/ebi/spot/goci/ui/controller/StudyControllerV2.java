package uk.ac.ebi.spot.goci.ui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import uk.ac.ebi.spot.goci.model.StudyResult;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

/**
 * Created by Cinzia on 15/11/2017.
 */
@Controller
public class StudyControllerV2 {


    private SearchConfiguration searchConfiguration;

    @Autowired
    public StudyControllerV2(SearchConfiguration searchConfiguration) {
        this.searchConfiguration = searchConfiguration;
    }

    @RequestMapping(value = "studies", produces = MediaType.TEXT_HTML_VALUE)
    public String search() {
        return "studies";
    }

    @RequestMapping(value = "/v2/studies/{accessionId}", produces = MediaType.TEXT_HTML_VALUE)
    public String search(Model model,
                         @PathVariable(required = false) String accessionId,
                         @RequestParam(required = false) String filter,
                         @RequestParam(required = false, defaultValue = "") String included,
                         @RequestParam(required = false, defaultValue = "") String checked) {
        StudyResult studyResult = new StudyResult();
        studyResult.setQuery(accessionId);
        studyResult.setFilter(filter);
        studyResult.setAccessionId(accessionId);
        model.addAttribute("result", studyResult);
        return "study-page-v2";
    }
}
