package uk.ac.ebi.spot.goci.refactoring.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.service.impl.SolrRegionServiceImpl;

import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class SolrQueryParamBuilder {

    private static final Logger log = LoggerFactory.getLogger(SolrQueryParamBuilder.class);
    public final static String REGEX_REGION = "([XY0-9]{1,2}):(\\d+)-(\\d+)";

    final Pattern pattern = Pattern.compile(REGEX_REGION, Pattern.CASE_INSENSITIVE);

    public String buildQueryParam(String type, String param) {

        if(type.equals("REGION")) {
            return createChromosomeQuery(param);
        }
        else if(type.equals("PMID")) {
            return String.format("pubmedId:%s", param);
        }
        else if(type.equals("VARIANT")) {
            return  String.format("rsId:\"%s\" OR association_rsId :\"%s\"", param, param);
        }

        return null;

    }

    public String buildAccessionIdQueryParam(Set<String> accessionIds ) {
        String concatAccids = accessionIds.stream().collect(Collectors.joining(" OR "));
        log.info("Accession Ids concat ->"+concatAccids);
        return concatAccids;
    }


    public String createChromosomeQuery(String chromRange) {
        final Matcher matcher = pattern.matcher(chromRange);
        if (matcher.find()) {
        return String.format("chromosomeName: %s AND chromosomePosition:[ %s TO %s ]",matcher.group(1), matcher.group(2), matcher.group(3));
        }
        return null;
    }
}