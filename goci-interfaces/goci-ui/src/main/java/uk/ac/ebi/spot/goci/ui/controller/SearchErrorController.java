package uk.ac.ebi.spot.goci.ui.controller;

import org.springframework.boot.autoconfigure.web.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

//@Controller
public class SearchErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError() {
        //do something like logging
        return "redirect:/docs";
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }
}