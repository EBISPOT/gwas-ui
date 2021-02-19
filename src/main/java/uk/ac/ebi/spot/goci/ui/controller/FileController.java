package uk.ac.ebi.spot.goci.ui.controller;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.file.Files;
import java.util.*;

@Controller
public class FileController {

    @Value("${download.full}")
    private Resource fullFileDownload;

    @Value("${download.alternative}")
    private Resource alternativeFileDownload;

    @Value("${download.studies}")
    private Resource studiesFileDownload;

    @Value("${download.studiesAlternative}")
    private Resource alternativeStudiesDownload;

    @Value("${download.ancestry}")
    private Resource ancestryFileDownload;

    @Value("${download.efoMappings}")
    private Resource efoMappingsDownload;

    @Value("${download.NCBI}")
    private Resource fullFileDownloadNcbi;

    @Value("${catalog.stats.file}")
    private Resource catalogStatsFile;

    @Value("${summary.stats.file}")
    private Resource summaryStatsFile;

    @Value("${download.unpublished.studies}")
    private Resource unpublishedStudiesFileDownload;

    @Value("${download.unpublished.ancestries}")
    private Resource unpublishedAncestriesFileDownload;

    @Value("${download.new_format.studies}")
    private Resource newStudiesFileDownload;

    @Value("${download.new_format.ancestries}")
    private Resource newAncestriesFileDownload;

    enum PropertyTypes {
        RELEASE_DATE("releasedate"),
        ENSEMBL_BUILD("ensemblbuild");
        public final String label;
        private PropertyTypes(String label){
            this.label = label;
        }
    }
    private String getProperty(PropertyTypes property) throws IOException {
        if (catalogStatsFile.exists()) {
            Properties properties = new Properties();
            properties.load(catalogStatsFile.getInputStream());
            return properties.getProperty(property.label);
        }
        return null;
    }
    @GetMapping(value = "api/search/downloads/full")
    public void getFullDownload(HttpServletResponse response) throws IOException {
        if (fullFileDownload.exists() && catalogStatsFile.exists()) {

            Properties properties = new Properties();
            properties.load(catalogStatsFile.getInputStream());
            String releasedate = properties.getProperty("releasedate");
            String ensemblbuild = properties.getProperty("ensemblbuild");


            String fileName = "gwas_catalog_v1.0-associations_e".concat(ensemblbuild).concat("_r").concat(releasedate).concat(".tsv");
            buildDownload(fileName, fullFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @GetMapping(value = "api/search/downloads/unpublished_studies")
    public void getUnpublishedStudiesDownload(HttpServletResponse response) throws IOException {
        if (unpublishedStudiesFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3-unpublished-studies-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, unpublishedStudiesFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @GetMapping(value = "api/search/downloads/unpublished_ancestries")
    public void getUnpublishedAncestriesDownload(HttpServletResponse response) throws IOException {
        if (unpublishedAncestriesFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3-unpublished-ancestries-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, unpublishedAncestriesFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @GetMapping(value = "api/search/downloads/studies_new")
    public void getNewStudiesDownload(HttpServletResponse response) throws IOException {
        if (newStudiesFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3-studies-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, newStudiesFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }
    
    @GetMapping(value = "api/search/downloads/ancestries_new")
    public void getNewAncestriesDownload(HttpServletResponse response) throws IOException {
        if (newAncestriesFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3-ancestries-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, newAncestriesFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @GetMapping(value = "api/search/downloads/studies")
    public void getStudiesDownload(HttpServletResponse response) throws IOException {
        if (studiesFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas_catalog_v1.0-studies_r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, studiesFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }


    @GetMapping(value = "api/search/downloads/alternative",
                    produces = MediaType.TEXT_PLAIN_VALUE)
    public void getAlternativeDownload(HttpServletResponse response) throws IOException {
        if (alternativeFileDownload.exists() && catalogStatsFile.exists()) {

            Properties properties = new Properties();
            properties.load(catalogStatsFile.getInputStream());
            String releasedate = properties.getProperty("releasedate");
            String ensemblbuild = properties.getProperty("ensemblbuild");

            String fileName = "gwas_catalog_v1.0.2-associations_e".concat(ensemblbuild).concat("_r").concat(releasedate).concat(".tsv");
            buildDownload(fileName, alternativeFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @GetMapping(value = "api/search/downloads/studies_alternative")
    public void getAlternativeStudiesDownload(HttpServletResponse response) throws IOException {
        if (alternativeStudiesDownload.exists() && catalogStatsFile.exists()) {
            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);

            String fileName = "gwas_catalog_v1.0.2-studies_r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, alternativeStudiesDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @GetMapping(value = "api/search/downloads/trait_mappings")
    public void getTraitMappingsDownload(HttpServletResponse response) throws IOException {
        if (efoMappingsDownload.exists() && catalogStatsFile.exists()) {
            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);

            String fileName = "gwas_catalog_trait-mappings_r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, efoMappingsDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }


    @GetMapping(value = "api/search/downloads/full_NCBI",
                    produces = MediaType.TEXT_PLAIN_VALUE)
    public void getFullNcbiDownload(HttpServletResponse response) throws IOException {

        if (fullFileDownloadNcbi.exists()) {
            Files.copy(fullFileDownloadNcbi.getFile().toPath(), new BufferedOutputStream(response.getOutputStream()));
        }
        else {
            throw new FileNotFoundException();
        }

    }

    @GetMapping(value = "api/search/stats", produces = "application/json")
    public @ResponseBody
    Map<String, Object> getCatalogStats() {
        Map<String, Object> response = new HashMap<>();

        String releasedate;
        String studycount;
        String snpcount;
        String associationcount;
        String genebuild;
        String dbsnpbuild;
        String ensemblbuild;

        Properties properties = new Properties();
        try {
            properties.load(catalogStatsFile.getInputStream());
            releasedate = properties.getProperty("releasedate");
            studycount = properties.getProperty("studycount");
            snpcount = properties.getProperty("snpcount");
            associationcount = properties.getProperty("associationcount");
            genebuild = properties.getProperty("genomebuild");
            dbsnpbuild = properties.getProperty("dbsnpbuild");
            ensemblbuild = properties.getProperty("ensemblbuild");

            response.put("date", releasedate);
            response.put("studies", studycount);
            response.put("snps", snpcount);
            response.put("associations", associationcount);
            response.put("genebuild", genebuild);
            response.put("dbsnpbuild", dbsnpbuild);
            response.put("ensemblbuild", ensemblbuild);

        }
        catch (IOException e) {
            throw new RuntimeException(
                    "Unable to return catolog stats: failed to read catalog.stats.file resource", e);
        }

        return response;
    }

    @GetMapping(value = "api/search/summaryStatsResources", produces = "application/json")
    public @ResponseBody
    Map<String, Object> getSummaryStatsResources() {
        Map<String, Object> response = new HashMap<>();

        List<String> resources = new ArrayList<>();

        try {
            if(summaryStatsFile.exists()){
                resources = Files.readAllLines(summaryStatsFile.getFile().toPath());
                response.put("resources", resources);
            }
        }
        catch (IOException e) {
            throw new RuntimeException(
                    "Unable to return summary stats resources: failed to read summary.stats.file resource", e);
        }

        return response;
    }

    @GetMapping(value = "api/search/downloads/ancestry")
    public void getAncestryDownload(HttpServletResponse response) throws IOException {
        if (ancestryFileDownload.exists() && catalogStatsFile.exists()) {
            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);

            String fileName = "gwas_catalog-ancestry_r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, ancestryFileDownload, response);

        }
        else {
            throw new FileNotFoundException();
        }
    }

    private void buildDownload(String fileName, Resource inputFile, HttpServletResponse response) throws IOException {
        OutputStream output = new BufferedOutputStream(response.getOutputStream());
        response.setContentType("text/tsv");
        response.setHeader("Content-Disposition", "attachement; filename=" + fileName);
        Files.copy(inputFile.getFile().toPath(), output);
        response.setStatus(HttpStatus.OK.value());
        output.flush();
        output.close();
    }
}
