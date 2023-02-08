package uk.ac.ebi.spot.goci.refactoring.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.refactoring.service.RestInteractionService;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

@Service
public class RestInteractionServiceImpl implements RestInteractionService {

    private static final Logger log = LoggerFactory.getLogger(RestInteractionServiceImpl.class);

    @Autowired
    RestTemplate restTemplate;

    @Autowired
    SearchConfiguration searchConfiguration;



    @Override
    public SolrData callSolrAPI(String uri  ) {
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
}
