package uk.ac.ebi.spot.goci.refactoring.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.ac.ebi.spot.goci.refactoring.model.*;
import uk.ac.ebi.spot.goci.refactoring.service.RestAPIEFOService;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RestAPIEFOServiceImpl implements RestAPIEFOService {

    private static final Logger log = LoggerFactory.getLogger(RestAPIEFOServiceImpl.class);

    @Autowired
    SearchConfiguration searchConfiguration;

    @Autowired
    RestInteractionService restInteractionService;

    public Map<String, String>  callOlsRestAPI(String uri, Map<String, String> olsTerms, String efoId) {
     OLSTermApiDoc olsTermApiDoc =  restInteractionService.callOlsRestAPI(uri, efoId);
     if(olsTermApiDoc != null ) {
         //log.info("Inside callOlsRestAPI olsTermApiDoc not null block");
         Map<String, String> olsEFOids =  retreiveOlsTerms(olsTermApiDoc);
         if(olsEFOids != null && !olsEFOids.isEmpty()) {
             olsEFOids.forEach((k,v) -> {
                 olsTerms.put(k, v);
             });
         }
         Links links = olsTermApiDoc.getLinks();
         while(links != null && links.getNext() != null) {
             return callOlsRestAPI(links.getNext().getHref(), olsTerms, efoId);
         }
         if(links != null && links.getNext() == null) {
             return olsTerms;
         }
     }
     return null;
    }

    public Map<String, String> callEFORestAPI(String uri, Map<String, String> shortforms) {
        RestApiEFOTraitDoc restApiEFOTraitDoc = restInteractionService.callRestAPIEFOTraits(uri);
        if(restApiEFOTraitDoc != null ){
            //log.info("Inside callEFORestAPI restApiEFOTraitDoc not null block");
            Map<String, String> efoIds =  retreiveShortForms(restApiEFOTraitDoc);
            if(efoIds != null && !efoIds.isEmpty()) {
                efoIds.forEach((k,v) -> {
                    shortforms.put(k, v);
                });
            }
            Links links = restApiEFOTraitDoc.getLinks();
            while(links != null && links.getNext() != null) {
               return callEFORestAPI(links.getNext().getHref(), shortforms);
            }
            if(links != null && links.getNext() == null) {
                return shortforms;
            }
        }
        return null;
    }


    private Map<String, String> retreiveShortForms(RestApiEFOTraitDoc restApiEFOTraitDoc) {
        ResponseDoc responseDoc = restApiEFOTraitDoc.getResponseDoc();
        if(responseDoc != null ){
            return Optional.ofNullable(responseDoc.getEfoTraits())
                    .map(efoApiDocs -> efoApiDocs.stream()
                                    .collect(Collectors.toMap(EFOApiDoc::getShortForm, EFOApiDoc::getTrait,
                                            (existing, replacement) -> existing)))
                    .orElse(null);
        }
        return null;
    }


    private Map<String, String> retreiveOlsTerms(OLSTermApiDoc olsTermApiDoc) {
        OLSResponseDoc responseDoc = olsTermApiDoc.getResponseDoc();

        return Optional.ofNullable(responseDoc.getTerms())
                .map(terms -> terms.stream()
                        .collect(Collectors.toMap(TermApiDoc::getShortForm, TermApiDoc::getLabel,
                                (existing, replacement) -> existing)))
                .orElse(null);
    }
}
