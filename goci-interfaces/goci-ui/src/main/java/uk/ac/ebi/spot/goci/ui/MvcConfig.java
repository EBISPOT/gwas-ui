package uk.ac.ebi.spot.goci.ui;

/**
 * Created by emma on 24/11/14.
 * <p>
 * Configuration class for configuring Spring MVC in the application.
 */

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
public class MvcConfig extends WebMvcConfigurerAdapter {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // core pages
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/home").setViewName("index");
        registry.addViewController("/search").setViewName("search");
        registry.addViewController("/diagram").setViewName("diagram");
        registry.addViewController("/downloads").setViewName("downloads");
        registry.addViewController("/search/traits").setViewName("traitlist");
        registry.addViewController("/downloads/summary-statistics").setViewName("summary-statistics");
        //registry.addRedirectViewController("/search/most-recent", "/search?query=*&filter=recent");
        registry.addViewController("/snp").setViewName("snp-page");
        registry.addViewController("/ancestry").setViewName("ancestry");
        registry.addViewController("/anniversary").setViewName("anniversary");
        registry.addViewController("/variants").setViewName("variants");
        registry.addViewController("/publications").setViewName("publications");
        registry.addViewController("/studies").setViewName("studies");
        // These pages must be removed. TODO
        //registry.addViewController("/publication-fake").setViewName("study-disambig");
        //registry.addViewController("/study-fake").setViewName("study-page-fake");
        //registry.addViewController("/empty").setViewName("empty");
        // dynamically generated docs pages
        registry.addViewController("/docs").setViewName("docs");
        registry.addViewController("/docs/about").setViewName("docs-template");
        registry.addViewController("/docs/file-downloads").setViewName("docs-template");
        registry.addViewController("/docs/diagram-downloads").setViewName("docs-template");
        registry.addViewController("/docs/faq").setViewName("docs-template");
        // Methods page
        registry.addViewController("/docs/methods").setViewName("methods");

        // Trick
        registry.addRedirectViewController("/docs/methods/criteria", "/docs/methods-criteria");
        registry.addViewController("/docs/methods-criteria").setViewName("docs-template");
        // Trick
        registry.addRedirectViewController("/docs/methods/curation", "/docs/methods-curation");
        registry.addViewController("/docs/methods-curation").setViewName("docs-template");
        // Trick
        registry.addRedirectViewController("/docs/methods/summary-statistics", "/docs/methods-summary-statistics");
        registry.addViewController("/docs/methods-summary-statistics").setViewName("docs-template");

        registry.addViewController("/docs/ontology").setViewName("docs-template");
        registry.addViewController("/docs/abbreviations").setViewName("docs-template");
        registry.addViewController("/docs/fileheaders").setViewName("docs-template");
        registry.addViewController("/docs/related-resources").setViewName("docs-template");
        // Redirect old programmatic-access to api
        registry.addRedirectViewController("/docs/programmatic-access", "/docs/api");
        registry.addViewController("/docs/api").setViewName("docs-template");
        registry.addViewController("/docs/api/summary-statistics").setViewName("docs-template");
        registry.addViewController("/docs/known-issues").setViewName("docs-template");
        registry.addViewController("/docs/mappingfileheaders").setViewName("docs-template");
        registry.addViewController("/docs/ancestry").setViewName("docs-template");
        registry.addViewController("/docs/pilots").setViewName("docs-template");
        registry.addViewController("/docs/ancestry-data").setViewName("docs-template");
        registry.addViewController("/docs/ancestry-recommendation").setViewName("docs-template");

    }
}