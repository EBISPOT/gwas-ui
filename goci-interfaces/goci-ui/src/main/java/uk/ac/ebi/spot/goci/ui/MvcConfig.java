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
        registry.addViewController("/diagram-v1").setViewName("diagram");
        registry.addViewController("/downloads").setViewName("downloads");
        registry.addViewController("/search/traits").setViewName("traitlist");
        registry.addViewController("/summary-statistics").setViewName("summary-statistics");
        registry.addViewController("/downloads/summary-statistics").setViewName("summary-statistics-table-v2");
        // TODO remove this V2
        registry.addViewController("/v2/downloads/summary-statistics").setViewName("summary-statistics-table-v2");
        //registry.addRedirectViewController("/search/most-recent", "/search?query=*&filter=recent");
        registry.addViewController("/snp").setViewName("snp-page");
        registry.addViewController("/population-descriptors").setViewName("ancestry");
        // redirect from /ancestry to /population-descriptors
        registry.addRedirectViewController("/ancestry", "/population-descriptors");
        // redirect from /populationdescriptors (written in GWAS paper) to /population-descriptors
        registry.addRedirectViewController("/populationdescriptors", "/population-descriptors");
        registry.addViewController("/anniversary").setViewName("anniversary");
        registry.addViewController("/variants").setViewName("variants");
        registry.addViewController("/publications").setViewName("publications");
        registry.addViewController("/studies").setViewName("studies");
        registry.addViewController("/genes").setViewName("genes");
        registry.addViewController("/regions").setViewName("regions");
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
        // Create a static page or check if you can add just the code
        registry.addViewController("/docs/methods").setViewName("methods");
        registry.addViewController("/docs/methods/criteria").setViewName("docs-template");
        registry.addViewController("/docs/methods/curation").setViewName("docs-template");
        registry.addViewController("/docs/methods/summary-statistics").setViewName("docs-template");
        registry.addViewController("/docs/methods/summary-statistics-format").setViewName("docs-template");

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
        // redirect from /docs/ancestry (written in GWAS paper) to /docs/population-descriptors
        registry.addRedirectViewController("/docs/ancestry", "/docs/population-descriptors");
        registry.addViewController("/docs/population-descriptors").setViewName("docs-template");
        registry.addViewController("/docs/pilots").setViewName("docs-template");
        registry.addViewController("/docs/ancestry-data").setViewName("docs-template");
        registry.addViewController("/docs/ancestry-recommendation").setViewName("docs-template");
        registry.addViewController("/docs/sharing-standards-workshop").setViewName("docs-template");

        registry.addViewController("/docs/submission-summary-statistics").setViewName("docs-template");
        registry.addViewController("/docs/summary-statistics-format").setViewName("docs-template");
        registry.addViewController("/docs/submission-summary-statistics-plus-metadata").setViewName("docs-template");
        registry.addViewController("/docs/submission").setViewName("docs-template");
        registry.addViewController("/docs/countries").setViewName("docs-template");


        registry.addViewController("/docs/gwas-ssf/summary-statistics-format").setViewName("docs-template");
        registry.addViewController("/docs/gwas-ssf/submission-summary-statistics").setViewName("docs-template");
        registry.addViewController("/docs/gwas-ssf/submission-summary-statistics-plus-metadata").setViewName("docs-template");
    }
}
