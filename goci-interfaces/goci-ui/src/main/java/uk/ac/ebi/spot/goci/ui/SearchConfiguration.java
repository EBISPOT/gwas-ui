package uk.ac.ebi.spot.goci.ui;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.support.ErrorPageFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import javax.validation.constraints.NotNull;
import java.net.URL;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 31/01/15
 */
@Component
public class SearchConfiguration {
    // GWAS Solr FAT
    @NotNull @Value("${search.server}")
    private URL fatServerSource;

    //GWAS Search Interface v.2: using Solr Slim
    @NotNull @Value("${search.server.slim}")
    private URL slimServerSource;

    @Value("${search.defaultFacet}")
    private String defaultFacet;


    // SLIM Solr
    public URL getGwasSearchSlimServer() {
        return slimServerSource;
    }

    // Fat Solr
    public URL getGwasSearchFatServer() {
        return fatServerSource;
    }

    public String getDefaultFacet() {
        return defaultFacet;
    }


    @Bean
    public ErrorPageFilter errorPageFilter() {
        return new ErrorPageFilter();
    }

    @Bean
    public FilterRegistrationBean disableSpringBootErrorFilter(ErrorPageFilter filter) {
        FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean();
        filterRegistrationBean.setFilter(filter);
        filterRegistrationBean.setEnabled(false);
        return filterRegistrationBean;
    }
}
