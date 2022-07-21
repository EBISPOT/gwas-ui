package uk.ac.ebi.spot.goci.ui.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.RestTemplate;
import uk.ac.ebi.spot.goci.ui.component.ImpcIdentifierMap;
import uk.ac.ebi.spot.goci.ui.service.GeneImpcLinkService;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Arrays;
import java.util.Map;

@Service
public class GeneImpcLinkServiceImpl implements GeneImpcLinkService {

    private static final Logger log = LoggerFactory.getLogger(GeneImpcLinkServiceImpl.class);

    @Autowired
    ImpcIdentifierMap impcIdentifierMap;

    @Value("${impc.bukupload.uri}")
    private String endpoint;

    @Autowired
    RestTemplate restTemplate;

    /** Service makes a call to Impc File based API & extracts the content of file in to a HashMap
     *
     */
    public void populateGeneImpcMap() {
        RequestCallback callback = clientHttpRequest -> clientHttpRequest.getHeaders()
                .setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM));

           File file = restTemplate.execute(endpoint, HttpMethod.GET, callback, clientHttpResponse -> {
                File ret = File.createTempFile("download", "tmp");
                StreamUtils.copy(clientHttpResponse.getBody(), new FileOutputStream(ret));
                return ret;
            });

        if(file != null) {
            Map<String, String> impcGeneMap = impcIdentifierMap.createImpcGeneMap(file);
            impcIdentifierMap.setImpcGeneMap(impcGeneMap);
            log.info("Data Loaded in Impc Map");
        }

    }
}
