package uk.ac.ebi.spot.goci.refactoring.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class SolrQueryParamBuilder {

    private static final Logger log = LoggerFactory.getLogger(SolrQueryParamBuilder.class);
    public final static String REGEX_REGION = "([XY0-9]{1,2}):(\\d+)-(\\d+)";

    public final static String REGEX_CYTOBAND = "([XY0-9]{1,2})([PQ][0-9]+\\.[0-9]+)";

    final Pattern pattern = Pattern.compile(REGEX_REGION, Pattern.CASE_INSENSITIVE);

    final Pattern cytoPattern = Pattern.compile(REGEX_CYTOBAND, Pattern.CASE_INSENSITIVE);

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
        else if(type.equals("EFOTRAIT")) {
            return String.format("shortForm:%s OR efoLink:%s OR mappedUri:%s",param, param, param);
        }
        else if(type.equals("BGTRAIT")) {
            return param;
        }
        else if(type.equals("GENE")) {
            return String .format("ensemblMappedGenes:\"%s\" OR association_ensemblMappedGenes:\"%s\"",param, param);
        }
        else if(type.equals("SUMSTATS")) {
            return "fullPvalueSet:true";
        }
        else if(type.equals("GCST")) {
            return String.format("accessionId:%s", param);
        }
        return null;

    }

    public String buildAccessionIdQueryParam(Set<String> accessionIds ) {
        String concatAccids = accessionIds.stream().collect(Collectors.joining(" OR "));
        log.info("Accession Ids concat ->"+concatAccids);
        return concatAccids;
    }

    public String buildEFOQueryParam(List<String> efoIds, Boolean includeBGtraits) {
        String concatEfoQuery =   efoIds.stream().collect(Collectors.joining(","));
        //return String.format("{!terms shortForm}%s OR {!terms efoLink}%s OR {!mappedUri efoLink}%s",concatEfoQuery, concatEfoQuery, concatEfoQuery);
       if(includeBGtraits != null ) {
           if (!includeBGtraits)
               return String.format("shortForm:%s OR efoLink:%s OR mappedUri:%s", concatEfoQuery, concatEfoQuery, concatEfoQuery);
           else
               return concatEfoQuery;
       } else {
           return String.format("shortForm:%s OR efoLink:%s OR mappedUri:%s", concatEfoQuery, concatEfoQuery, concatEfoQuery);
       }

    }


    public String createChromosomeQuery(String chromRange) {
        final Matcher matcher = pattern.matcher(chromRange);
        if (matcher.find()) {
        return String.format("chromosomeName: %s AND chromosomePosition:[ %s TO %s ]",matcher.group(1), matcher.group(2), matcher.group(3));
        }
        return null;
    }


    public Boolean checkCytoBandPattern(String cytoBand) {
        final Matcher matcher = cytoPattern.matcher(cytoBand);
        return matcher.find();
    }
}
