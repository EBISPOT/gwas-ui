package uk.ac.ebi.spot.goci.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.ac.ebi.spot.goci.model.solr.SolrData;
import uk.ac.ebi.spot.goci.model.solr.SumStatDownloadDto;
import uk.ac.ebi.spot.goci.refactoring.model.PublicationDoc;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class SolrService {

    private final ObjectMapper mapper = new ObjectMapper();
    @Autowired
    SearchConfiguration searchConfiguration;

    public String dispatchSearch(String searchString) throws IOException {
        log.trace(searchString);
        System.out.println("Search String: "+searchString);
        CloseableHttpClient httpclient = HttpClients.createDefault();
        HttpGet httpGet = new HttpGet(searchString);
        if (System.getProperty("http.proxyHost") != null) {
            HttpHost proxy;
            if (System.getProperty("http.proxyPort") != null) {
                proxy = new HttpHost(System.getProperty("http.proxyHost"), Integer.parseInt(System.getProperty
                        ("http.proxyPort")));
            }
            else {
                proxy = new HttpHost(System.getProperty("http.proxyHost"));
            }
            httpGet.setConfig(RequestConfig.custom().setProxy(proxy).build());
        }

        String content = "";
        try (CloseableHttpResponse response = httpclient.execute(httpGet)) {
            log.debug("Received HTTP response: " + response.getStatusLine().toString());
            HttpEntity entity = response.getEntity();
            content = EntityUtils.toString(entity);
            EntityUtils.consume(entity);
        }
        return content;
    }

    public List<SumStatDownloadDto> assembleSumStatDownloadDto(String solrDataString) throws IOException{
        SolrData solrData = mapper.readValue(solrDataString, SolrData.class);
        List<?> solrDocs =  solrData.getResponse().getDocs();
        List<PublicationDoc> pubDocs = mapper.convertValue(solrDocs, new TypeReference<List<PublicationDoc>>() {});
        List<SumStatDownloadDto> sumStatDownloadDtos = new ArrayList<>();
        pubDocs.forEach(solrDoc -> {
            String accId = solrDoc.getAccessionId().substring(solrDoc.getAccessionId().indexOf("GCST")+4);
            int gsctNum = Integer.parseInt(accId);
            int lowerRange = (int) (Math.floor((gsctNum-1)/1000))*1000+1;
            int upperRange = (int) (Math.floor((gsctNum-1)/1000)+1)*1000;
            String range = "GCST"+ StringUtils.leftPad(String.valueOf(lowerRange),6,"0")
                    +"-GCST"+StringUtils.leftPad(String.valueOf(upperRange),6,"0");
            String ftpLink = searchConfiguration.getSummaryStatsFTPLink().concat(range).concat("/").concat(solrDoc.getAccessionId());
            sumStatDownloadDtos.add(
                    SumStatDownloadDto.builder()
                            .authorS(solrDoc.getAuthorS())
                            .pubmedId(solrDoc.getPubmedId())
                            .accessionId(solrDoc.getAccessionId())
                            .publicationDate(solrDoc.getPublicationDate())
                            .publication(solrDoc.getPublication())
                            .title(solrDoc.getTitle())
                            .mappedLabel(solrDoc.getMappedLabel().toString())
                            .traitNameS(solrDoc.getTraitNameS())
                            .mappedUri(solrDoc.getMappedUri().toString())
                            .dataAccess(ftpLink)
                            .build()
            );
        });
        return sumStatDownloadDtos;
    }
}
