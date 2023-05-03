package uk.ac.ebi.spot.goci.ui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import uk.ac.ebi.spot.goci.model.EfoTraitResult;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

@Controller
public class EfoTraitControllerV2 {

    private SearchConfiguration searchConfiguration;

    @Autowired
    public EfoTraitControllerV2(SearchConfiguration searchConfiguration) {
        this.searchConfiguration = searchConfiguration;
    }

//    @RequestMapping(value = "efotraits", produces = MediaType.TEXT_HTML_VALUE)
//    public String search() {
//        return "efotraits";
//    }

    @RequestMapping(value = "v2/efotraits/{efoId}", produces = MediaType.TEXT_HTML_VALUE)
    public String search(Model model,
                         @PathVariable(required = false) String efoId,
                         @RequestParam(required = false) String filter,
                         @RequestParam(required = false, defaultValue = "") String included,
                         @RequestParam(required = false, defaultValue = "") String checked) {
        EfoTraitResult efoTraitResult = new EfoTraitResult();
        efoTraitResult.setQuery(efoId);
        efoTraitResult.setFilter(filter);
        efoTraitResult.setEfoId(efoId);
        efoTraitResult.setIncluded(included);
        efoTraitResult.setChecked(checked);
        model.addAttribute("result", efoTraitResult);
        return "efotrait-page-v2";
    }

}
