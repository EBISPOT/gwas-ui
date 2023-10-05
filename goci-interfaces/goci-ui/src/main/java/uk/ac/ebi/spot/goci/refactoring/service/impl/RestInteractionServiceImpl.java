package uk.ac.ebi.spot.goci.refactoring.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.model.OLSTermApiDoc;
import uk.ac.ebi.spot.goci.refactoring.model.RestApiEFOTraitDoc;
import uk.ac.ebi.spot.goci.refactoring.model.SumstatsAPIDoc;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

@Service
public class RestInteractionServiceImpl implements RestInteractionService {

    private static final Logger log = LoggerFactory.getLogger(RestInteractionServiceImpl.class);

    @Autowired
    RestTemplate restTemplate;

    @Autowired
    SearchConfiguration searchConfiguration;


    public OLSTermApiDoc callOlsRestAPI(String uri, String efoId) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> httpEntity = new HttpEntity<>(null, headers);
        ResponseEntity<OLSTermApiDoc> responseEntity = null;
        MultiValueMap<String, String> paramsMap = new LinkedMultiValueMap<>();
        paramsMap.add("id",efoId);
        paramsMap.add("size","500");
        String olsUri = UriComponentsBuilder.fromHttpUrl(uri).queryParams(paramsMap).build().toUriString();
        log.info("The OLS API call uri is ->"+olsUri);
        try {
            responseEntity = restTemplate.exchange(olsUri, HttpMethod.GET, httpEntity, new ParameterizedTypeReference
                    <OLSTermApiDoc>() {
            });
        }catch(Exception ex){
            log.error("Exception in Rest API call"+ex.getMessage(),ex);
        }
        log.info("responseEntity status code"+responseEntity.getStatusCodeValue());
        log.info("responseEntity Body"+responseEntity.hasBody());
        return responseEntity.getBody();
    }

    public RestApiEFOTraitDoc callRestAPIEFOTraits(String uri) {
        //String uri = searchConfiguration.getRestAPILink();
        log.info("The Rest API call uri is ->"+uri);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> httpEntity = new HttpEntity<>(null, headers);
        ResponseEntity<RestApiEFOTraitDoc> responseEntity = null;

        try {
            responseEntity = restTemplate.exchange(uri, HttpMethod.GET, httpEntity, new ParameterizedTypeReference
                    <RestApiEFOTraitDoc>() {
            });
        }catch(Exception ex){
            log.error("Exception in Rest API call"+ex.getMessage(),ex);
        }
        log.info("responseEntity status code"+responseEntity.getStatusCodeValue());
        log.info("responseEntity Body"+responseEntity.hasBody());
        return responseEntity.getBody();

    }


    public SumstatsAPIDoc callSSAPI(String uri) {
        log.info("The SS API call uri is ->"+uri);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> httpEntity = new HttpEntity<>(null, headers);
        ResponseEntity<SumstatsAPIDoc> responseEntity = null;
        try {
            responseEntity = restTemplate.exchange(uri, HttpMethod.GET, httpEntity, new ParameterizedTypeReference
                    <SumstatsAPIDoc>() {
            });
        }catch(Exception ex){
            log.error("Exception in Rest API call"+ex.getMessage(),ex);
        }
        log.info("responseEntity status code"+responseEntity.getStatusCodeValue());
        log.info("responseEntity Body"+responseEntity.hasBody());
        return responseEntity.getBody();
    }

    @Override
    public SolrData callSolrAPI(String uri) {
        log.info("The Solr API call after refactoring is"+uri);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> httpEntity = new HttpEntity<>(null, headers);
        ResponseEntity<SolrData> responseEntity = null;
        try {
            responseEntity = restTemplate.exchange(uri, HttpMethod.GET, httpEntity, new ParameterizedTypeReference
                    <SolrData>() {
            });
        }catch(Exception ex){
            log.error("Exception in Rest API call"+ex.getMessage(),ex);
        }
        log.info("responseEntity status code"+responseEntity.getStatusCodeValue());
        log.info("responseEntity Body"+responseEntity.hasBody());
      return responseEntity.getBody();
    }


    public SolrData callSolrAPIwithPayload(String uri , MultiValueMap<String, String> paramsMap) {
        log.info("The Solr API call after refactoring is"+uri);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity<>(paramsMap, headers);
        ResponseEntity<SolrData> responseEntity = null;
        try {
//            StringBuilder stringBuilder = new StringBuilder();
//            for(String str : paramsMap.keySet()){
//                stringBuilder.append(str).append("=").append(paramsMap.getFirst(str)).append("&");
//            }
//            System.out.println("Copy this: " + stringBuilder);
            responseEntity = restTemplate.exchange(uri, HttpMethod.POST, httpEntity, new ParameterizedTypeReference
                <SolrData>() {
            });

        }catch(Exception ex){
            log.error("Exception in Rest API call"+ex.getMessage(),ex);
        }
        log.info("responseEntity status code"+responseEntity.getStatusCodeValue());
        log.info("responseEntity Body"+responseEntity.hasBody());
        return responseEntity.getBody();
    }
    public String getFatSolrUri() {
        StringBuilder solrSearchBuilder = new StringBuilder();
        solrSearchBuilder.append(searchConfiguration.getGwasSearchFatServer().toString())
                .append("/select?");
        return solrSearchBuilder.toString();
    }
}
