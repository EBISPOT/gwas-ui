package uk.ac.ebi.spot.goci.ui.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.web.bind.annotation.RequestMapping;

public class SearchErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError() {
        return "redirect:/docs";
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }
}