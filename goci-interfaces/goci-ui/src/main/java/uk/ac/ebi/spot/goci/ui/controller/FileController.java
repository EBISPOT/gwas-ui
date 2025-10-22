package uk.ac.ebi.spot.goci.ui.controller;

import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.CharBuffer;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Created by emma on 24/02/15.
 *
 * @author emma
 *         <p>
 *         Controller used to handle download of files and generation of stats
 */
@Controller
public class FileController {

    // These parameters are read from application.properties file
    @Value("${download.associations.v1.full}")
    private Resource fullAssociationFileDownload;

    @Value("${download.associations.v1.split}")
    private Resource splitAssociationFileDownload;

    @Value("${download.associations.alternative.full}")
    private Resource fullAltAssociationFileDownload;

    @Value("${download.associations.alternative.split}")
    private Resource splitAltAssociationFileDownload;

    @Value("${download.studies}")
    private Resource studiesFileDownload;

    @Value("${download.studiesAlternative}")
    private Resource alternativeStudiesDownload;

    @Value("${download.studiesAlternativeWithCohortsAndSs}")
    private Resource alternativeStudiesWithCohortsAndSsDownload;

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

//    @Value("${summary.stats.fullpvalue.file}")
//    private Resource summaryStatsFullPValueFile;
//
    @Value("${download.unpublished.studies}")
    private Resource unpublishedStudiesFileDownload;

    @Value("${download.new_unpublished.studies}")
    private Resource newUnpublishedStudiesFileDownload;

    @Value("${download.unpublished.ancestries}")
    private Resource unpublishedAncestriesFileDownload;

    @Value("${download.new_unpublished.ancestries}")
    private Resource newUnpublishedAncestriesFileDownload;

    @Value("${download.new_format.studies}")
    private Resource newStudiesFileDownload;

    @Value("${download.new_format.studiesWithCohortsAndSs}")
    private Resource newStudiesWithCohortsAndSsDownload;

    @Value("${download.new_format.ancestries}")
    private Resource newAncestriesFileDownload;

    @Value("${download.new_format.ancestriesWithoutCohorts}")
    private Resource ancestriesWithoutCohortsFileDownload;

//    @Value("${download.ensemblmapping}")
//    private Resource ensemblMappingFileDownload;

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
    @RequestMapping(value = "api/search/downloads/associations/v1.0",
                    method = RequestMethod.GET)
    public void getAssociationDownload(HttpServletResponse response,
                                @RequestParam(name = "split", defaultValue = "true") boolean split) throws IOException {
        final String FILE_NAME_PREFIX = "gwas_catalog_v1.0-associations_e";
        boolean filesAvailable = splitAssociationFileDownload.exists() && fullAssociationFileDownload.exists() && catalogStatsFile.exists();
        if (!filesAvailable) {
            throw new FileNotFoundException("Required download files are not available");
        }

        Properties properties = new Properties();
        try (InputStream statsIn = catalogStatsFile.getInputStream()) {
            properties.load(statsIn);
        }

        String releaseDate = properties.getProperty("releasedate");
        String ensemblBuild = properties.getProperty("ensemblbuild");

        String fileName = new StringBuilder(FILE_NAME_PREFIX)
                .append(ensemblBuild)
                .append("_r")
                .append(releaseDate)
                .append(split ? "_split.zip" : "_full.zip")
                .toString();
        Resource sourceStream = split ? splitAssociationFileDownload : fullAssociationFileDownload;

        buildDownload(fileName, sourceStream, response);
    }

    @RequestMapping(value = "api/search/downloads/associations/v1.0.2",
            method = RequestMethod.GET,
            produces = MediaType.TEXT_PLAIN_VALUE)
    public void getAlternativeDownload(HttpServletResponse response,
                                       @RequestParam(name = "split", defaultValue = "true") boolean split) throws IOException {
        final String FILE_NAME_PREFIX = "gwas_catalog_v1.0.2-associations_e";
        boolean filesAvailable = splitAltAssociationFileDownload.exists() && fullAltAssociationFileDownload.exists() && catalogStatsFile.exists();
        if (!filesAvailable) {
            throw new FileNotFoundException("Required download files are not available");
        }

        Properties properties = new Properties();
        try (InputStream statsIn = catalogStatsFile.getInputStream()) {
            properties.load(statsIn);
        }

        String releaseDate = properties.getProperty("releasedate");
        String ensemblBuild = properties.getProperty("ensemblbuild");

        String fileName = new StringBuilder(FILE_NAME_PREFIX)
                .append(ensemblBuild)
                .append("_r")
                .append(releaseDate)
                .append(split ? "_split.zip" : "_full.zip")
                .toString();
        Resource sourceStream = split ? splitAltAssociationFileDownload : fullAltAssociationFileDownload;

        buildDownload(fileName, sourceStream, response);
    }

//    @RequestMapping(value = "api/downloads/fullpvalue",
//            method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
//    public void getFullPValueStudiesDownload(HttpServletResponse response) throws IOException {
//        String responseString = null;
//        if (summaryStatsFullPValueFile.exists()) {
//            byte[] bytes = Files.readAllBytes(summaryStatsFullPValueFile.getFile().toPath());
//            IOUtils.copy(new BufferedInputStream(new ByteArrayInputStream(bytes)),
//                    new BufferedOutputStream(response.getOutputStream()));
////            buildJsonDownload(summaryStatsFullPValueFile.getInputStream(), response);
//            responseString = new String(bytes);
//        }
//        else {
//            throw new FileNotFoundException();
//        }
//    }

    @RequestMapping(value = "api/search/downloads/unpublished_studies",
            method = RequestMethod.GET)
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

    @RequestMapping(value = "api/search/downloads/unpublished_studies/v1.0.3.1",
            method = RequestMethod.GET)
    public void getNewUnpublishedStudiesDownload(HttpServletResponse response) throws IOException {
        if (newUnpublishedStudiesFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3.1-unpublished-studies-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, newUnpublishedStudiesFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @RequestMapping(value = "api/search/downloads/unpublished_ancestries",
            method = RequestMethod.GET)
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

    @RequestMapping(value = "api/search/downloads/unpublished_ancestries/v1.0.3.1",
            method = RequestMethod.GET)
    public void getNewUnpublishedAncestriesDownload(HttpServletResponse response) throws IOException {
        if (newUnpublishedAncestriesFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3.1-unpublished-ancestries-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, newUnpublishedAncestriesFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @RequestMapping(value = "api/search/downloads/studies_new",
            method = RequestMethod.GET)
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

    @RequestMapping(value = "api/search/downloads/studies/v1.0.3.1",
            method = RequestMethod.GET)
    public void getNewStudiesWithCohortAndSumstatsDownload(HttpServletResponse response) throws IOException {
        if (newStudiesWithCohortsAndSsDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3.1-studies-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, newStudiesWithCohortsAndSsDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @RequestMapping(value = "api/search/downloads/ancestries_new",
            method = RequestMethod.GET)
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

    @RequestMapping(value = "api/search/downloads/ancestries/v1.0.3.1",
            method = RequestMethod.GET)
    public void getNewAncestriesDownloadWithoutCohorts(HttpServletResponse response) throws IOException {
        if (ancestriesWithoutCohortsFileDownload.exists() && catalogStatsFile.exists()) {

            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);
            String fileName = "gwas-catalog-v1.0.3.1-ancestries-r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, ancestriesWithoutCohortsFileDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @RequestMapping(value = "api/search/downloads/studies",
                    method = RequestMethod.GET)
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

    @RequestMapping(value = "api/search/downloads/studies_alternative",
                    method = RequestMethod.GET)
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

    @RequestMapping(value = "api/search/downloads/studies/v1.0.2.1",
            method = RequestMethod.GET)
    public void getAlternativeStudiesWithCohortAndSumstatsDownload(HttpServletResponse response) throws IOException {
        if (alternativeStudiesWithCohortsAndSsDownload.exists() && catalogStatsFile.exists()) {
            String releasedate = getProperty(PropertyTypes.RELEASE_DATE);

            String fileName = "gwas_catalog_v1.0.2.1-studies_r".concat(releasedate).concat(".tsv");
            buildDownload(fileName, alternativeStudiesWithCohortsAndSsDownload, response);
        }
        else {
            throw new FileNotFoundException();
        }
    }

    @RequestMapping(value = "api/search/downloads/trait_mappings",
                    method = RequestMethod.GET)
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


    @RequestMapping(value = "api/search/downloads/full_NCBI",
                    method = RequestMethod.GET,
                    produces = MediaType.TEXT_PLAIN_VALUE)
    public void getFullNcbiDownload(HttpServletResponse response) throws IOException {

        if (fullFileDownloadNcbi.exists()) {
            Files.copy(fullFileDownloadNcbi.getFile().toPath(), new BufferedOutputStream(response.getOutputStream()));
        }
        else {
            throw new FileNotFoundException();
        }

    }

    @RequestMapping(value = "api/search/stats", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody Map<String, Object> getCatalogStats() {
        Map<String, Object> response = new HashMap<>();

        String releasedate;
        String studycount;
        String snpcount;
        String associationcount;
        String sscount;
        String genebuild;
        String dbsnpbuild;
        String ensemblbuild;
        String efoversion;

        Properties properties = new Properties();
        try {
            properties.load(catalogStatsFile.getInputStream());
            releasedate = properties.getProperty("releasedate");
            studycount = properties.getProperty("studycount");
            snpcount = properties.getProperty("snpcount");
            associationcount = properties.getProperty("associationcount");
            sscount = properties.getProperty("sscount");
            genebuild = properties.getProperty("genomebuild");
            dbsnpbuild = properties.getProperty("dbsnpbuild");
            ensemblbuild = properties.getProperty("ensemblbuild");
            efoversion = properties.getProperty("efoversion");

            response.put("date", releasedate);
            response.put("studies", studycount);
            response.put("snps", snpcount);
            response.put("associations", associationcount);
            response.put("sumstats", sscount);
            response.put("genebuild", genebuild);
            response.put("dbsnpbuild", dbsnpbuild);
            response.put("ensemblbuild", ensemblbuild);
            response.put("efoversion", efoversion);

        }
        catch (IOException e) {
            throw new RuntimeException(
                    "Unable to return catolog stats: failed to read catalog.stats.file resource", e);
        }

        return response;
    }

    @RequestMapping(value = "api/search/summaryStatsResources", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody Map<String, Object> getSummaryStatsResources() {
        Map<String, Object> response = new HashMap<>();

        List<String> resources = new ArrayList<>();

        try {
            if(summaryStatsFile.exists()){
                resources = Files.readAllLines(summaryStatsFile.getFile().toPath());
//                InputStream in = new BufferedInputStream(summaryStatsFile.getInputStream());
//                BufferedReader reader = new BufferedReader(new InputStreamReader(in));
//                String line;
//                while ((line = reader.readLine()) != null) {
//                    resources.add(line);
//                }
//                in.close();
//                reader.close();
                response.put("resources", resources);
            }
        }
        catch (IOException e) {
            throw new RuntimeException(
                    "Unable to return summary stats resources: failed to read summary.stats.file resource", e);
        }

        return response;
    }


    @RequestMapping(value = "api/search/downloads/ancestry",
                    method = RequestMethod.GET)
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


    @ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "File not found for download")
    @ExceptionHandler(FileNotFoundException.class)
    public void FileNotFoundException(FileNotFoundException fileNotFoundException) {
    }

    private void buildDownload(String fileName, InputStream inputStream, HttpServletResponse response)
            throws IOException {
        response.setContentType("text/tsv");
        response.setHeader("Content-Disposition", "attachement; filename=" + fileName);

        OutputStream outputStream;
        outputStream = response.getOutputStream();

        IOUtils.copy(new BufferedInputStream(inputStream), new BufferedOutputStream(outputStream));
        outputStream.flush();
        inputStream.close();
//        outputStream.close();
        response.setStatus(HttpStatus.OK.value());
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
