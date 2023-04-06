package uk.ac.ebi.spot.goci.ui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import uk.ac.ebi.spot.goci.model.RegionResult;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

/**
 * Created by Daniel on 12/06/2018.
 * Based on the variant controller
 */
@Controller
public class RegionControllerV2 {


    private SearchConfiguration searchConfiguration;

    @Autowired
    public RegionControllerV2(SearchConfiguration searchConfiguration) {
        this.searchConfiguration = searchConfiguration;
    }

    @RequestMapping(value = "/v2/regions/{regionId:.+}", produces = MediaType.TEXT_HTML_VALUE)
    public String search(Model model,
                         @PathVariable(required = false) String regionId,
                         @RequestParam(required = false) String filter) {
        RegionResult regionResult = new RegionResult();
        regionResult.setQuery(regionId);
        regionResult.setFilter(filter);
        regionResult.setRegionId(regionId);
        model.addAttribute("result", regionResult);
        return "region-page-v2";
    }

}
