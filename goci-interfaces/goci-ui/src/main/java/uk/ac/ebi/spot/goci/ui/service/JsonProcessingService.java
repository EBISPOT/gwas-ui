package uk.ac.ebi.spot.goci.ui.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by dwelter on 24/02/15.
 */
public class JsonProcessingService {

    private String json;
    private boolean includeAnnotations;
    private String type;
    private String newline;
    private boolean isMultiSnpHaplotype;
    private boolean isSnpInteraction;
    private boolean includeAncestry;
    private boolean includeCohortsAndSs;
    private boolean includeGxE;

    public JsonProcessingService(String json, boolean includeAnnotations, String type, boolean includeAncestry, boolean includeCohortsAndSs, boolean includeGxE) {
        this.json = json;
        this.includeAnnotations = includeAnnotations;
        this.type = type;
        this.includeAncestry = includeAncestry;
        this.includeCohortsAndSs = includeCohortsAndSs;
        this.includeGxE = includeGxE;
        newline = System.getProperty("line.separator");

    }

    public String processJson() throws IOException {
        String header;

        if(type.equals("study") && !includeAncestry){
            header =
                    "DATE ADDED TO CATALOG\tPUBMEDID\tFIRST AUTHOR\tDATE\tJOURNAL\tLINK\tSTUDY\tDISEASE/TRAIT\tINITIAL SAMPLE SIZE\tREPLICATION SAMPLE SIZE\tPLATFORM [SNPS PASSING QC]\tASSOCIATION COUNT";
        }
        else if(type.equals("study_new_format")){
            if (!includeCohortsAndSs)
                header = "DATE ADDED TO CATALOG\tPUBMED ID\tFIRST AUTHOR\tDATE\tJOURNAL\tLINK\tSTUDY\tDISEASE/TRAIT\tINITIAL SAMPLE SIZE\tREPLICATION SAMPLE SIZE\tPLATFORM [SNPS PASSING QC]\tASSOCIATION COUNT\tMAPPED_TRAIT\tMAPPED_TRAIT_URI\tSTUDY ACCESSION\tGENOTYPING TECHNOLOGY\tSUMMARY STATS LOCATION\tSUBMISSION DATE\tSTATISTICAL MODEL\tBACKGROUND TRAIT\tMAPPED BACKGROUND TRAIT\tMAPPED BACKGROUND TRAIT URI";
            else
                // same as above but without SUMMARY STATS LOCATION as will be added by includeCohortsAndSs
                header = "DATE ADDED TO CATALOG\tPUBMED ID\tFIRST AUTHOR\tDATE\tJOURNAL\tLINK\tSTUDY\tDISEASE/TRAIT\tINITIAL SAMPLE SIZE\tREPLICATION SAMPLE SIZE\tPLATFORM [SNPS PASSING QC]\tASSOCIATION COUNT\tMAPPED_TRAIT\tMAPPED_TRAIT_URI\tSTUDY ACCESSION\tGENOTYPING TECHNOLOGY\tSUBMISSION DATE\tSTATISTICAL MODEL\tBACKGROUND TRAIT\tMAPPED BACKGROUND TRAIT\tMAPPED BACKGROUND TRAIT URI";
        } else if(type.equals("ancestry_new_format")){
            header =
                    "STUDY ACCESSION\tPUBMED ID\tFIRST AUTHOR\tDATE\tINITIAL SAMPLE DESCRIPTION\tREPLICATION SAMPLE DESCRIPTION\tSTAGE\tNUMBER OF INDIVIDUALS\tBROAD ANCESTRAL CATEGORY\tCOUNTRY OF ORIGIN\tCOUNTRY OF RECRUITMENT\tADDITIONAL ANCESTRY DESCRIPTION\tANCESTRY DESCRIPTOR\tFOUNDER/GENETICALLY ISOLATED POPULATION\tNUMBER OF CASES\tNUMBER OF CONTROLS\tSAMPLE DESCRIPTION\tCOHORT(S)\tCOHORT-SPECIFIC REFERENCE";
        }
        else if(includeAncestry){
            header =
                    "STUDY ACCESSION\tPUBMEDID\tFIRST AUTHOR\tDATE\tINITIAL SAMPLE DESCRIPTION\tREPLICATION SAMPLE DESCRIPTION\tSTAGE\tNUMBER OF INDIVDUALS\tBROAD ANCESTRAL CATEGORY\tCOUNTRY OF ORIGIN\tCOUNTRY OF RECRUITMENT\tADDITONAL ANCESTRY DESCRIPTION";
        }
        else{
            header =
                    "DATE ADDED TO CATALOG\tPUBMEDID\tFIRST AUTHOR\tDATE\tJOURNAL\tLINK\tSTUDY\tDISEASE/TRAIT\tINITIAL SAMPLE SIZE\tREPLICATION SAMPLE SIZE\tREGION\tCHR_ID\tCHR_POS\tREPORTED GENE(S)\tMAPPED_GENE\tUPSTREAM_GENE_ID\tDOWNSTREAM_GENE_ID\tSNP_GENE_IDS\tUPSTREAM_GENE_DISTANCE\tDOWNSTREAM_GENE_DISTANCE\tSTRONGEST SNP-RISK ALLELE\tSNPS\tMERGED\tSNP_ID_CURRENT\tCONTEXT\tINTERGENIC\tRISK ALLELE FREQUENCY\tP-VALUE\tPVALUE_MLOG\tP-VALUE (TEXT)\tOR or BETA\t95% CI (TEXT)\tPLATFORM [SNPS PASSING QC]\tCNV";
        }

        if((includeAnnotations) && (!type.equals("study_new_format"))){
            header = header.concat("\tMAPPED_TRAIT\tMAPPED_TRAIT_URI\tSTUDY ACCESSION\tGENOTYPING TECHNOLOGY");
        }

        header = header.concat("\r\n");

        StringBuilder result = new StringBuilder();
        result.append(header);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(json);
        JsonNode responseNode = node.get("response");
        JsonNode docs = responseNode.get("docs");


        for (JsonNode doc : docs) {
            StringBuilder line = new StringBuilder();

            if(type.equals("study") && !includeAncestry) {
                processStudyJson(line, doc);
            }
            else if(includeAncestry){

                if(doc.get("ancestryLinks") != null){
                    for(JsonNode a : doc.get("ancestryLinks")){
                        if(type.equals("ancestry_new_format")){
                            processAncestryJson(line, doc, a, type);
                        }else {
                            processAncestryJson(line, doc, a);
                        }
                    }
                }

            }
            else if(type.equals("study_new_format")){
                processStudyJson(line, doc, true);
            }
            else {
                processAssociationJson(line, doc);
            }
            result.append(line.toString());
        }

        return result.toString();


    }

    public void processStudyJson(StringBuilder line, JsonNode doc) throws IOException{
        processStudyJson(line, doc, false);
    }

    public void processStudyJson(StringBuilder line, JsonNode doc, boolean newFormat) throws IOException{

        line.append(getDate(doc));
        line.append("\t");

        String pubmedid = getPubmedId(doc);
        line.append(pubmedid);
        line.append("\t");
        line.append(getAuthor(doc));
        line.append("\t");
        line.append(getPublicationDate(doc));
        line.append("\t");
        line.append(getJournal(doc));
        line.append("\t");

        String publink = "www.ncbi.nlm.nih.gov/pubmed/".concat(pubmedid);

        line.append(publink);
        line.append("\t");

        line.append(getTitle(doc));
        line.append("\t");

        line.append(getTrait(doc));
        line.append("\t");

        String init = getInitSample(doc);
        if (init.contains(newline)) {
            init = init.replaceAll("\n", "").replaceAll("\r", "");
        }

        line.append(init);
        line.append("\t");

        String rep = getRepSample(doc);
        if (rep.contains(newline)) {
            rep = rep.replaceAll("\n", "").replaceAll("\r", "");
        }
        line.append(rep);
        line.append("\t");

        String platform = getPlatform(doc);
        if (platform.contains(newline)) {
            platform = platform.replaceAll("\n", "").replaceAll("\r", "");
        }
        line.append(platform);

        line.append("\t");

        line.append(getAssocCount(doc));

        if(includeAnnotations){
            line.append("\t");

            Map<String, String> traits = getEfoTraits(doc);

            line.append(traits.get("trait"));
            line.append("\t");
            line.append(traits.get("uri"));
            line.append("\t");
            line.append(getAccessionId(doc));
            line.append("\t");
            line.append(getGenotypingTechonologies(doc));
        }
        if(newFormat){
            if (!includeCohortsAndSs)
                line.append("\t").append(getSummaryStatsLocation(doc));
            line.append("\t").append(getSubmissionDate(doc));
            line.append("\t").append(getStatisticalModel(doc));
            line.append("\t").append(getBackgroundTrait(doc));
            Map<String, String> bkgTraits = getBackgroundEfoTraits(doc);
            line.append("\t").append(bkgTraits.get("labels"));
            line.append("\t").append(bkgTraits.get("uris"));
        }
        if (includeCohortsAndSs) {
            line.append("\t").append(getCohort(doc));
            line.append("\t").append(getFullPvalueSet(doc));
            line.append("\t").append(getFtpLink(doc));
        }
        if(includeGxE) {
            line.append("\t").append(getGxE(doc));
        }
        line.append("\r\n");

    }
    public void processAncestryJson(StringBuilder line, JsonNode doc, JsonNode ancestryRow) throws IOException {
        processAncestryJson(line, doc, ancestryRow, "");
    }

    public void processAncestryJson(StringBuilder line, JsonNode doc, JsonNode ancestryRow, String type) throws IOException {

        String pubmedid = getPubmedId(doc);

        line.append(getAccessionId(doc));
        line.append("\t");
        line.append(pubmedid);
        line.append("\t");
        line.append(getAuthor(doc));
        line.append("\t");
        line.append(getPublicationDate(doc));
        line.append("\t");

        String init = getInitSample(doc);
        if (init.contains(newline)) {
            init = init.replaceAll("\n", "").replaceAll("\r", "");
        }

        line.append(init);
        line.append("\t");

        String rep = getRepSample(doc);
        if (rep.contains(newline)) {
            rep = rep.replaceAll("\n", "").replaceAll("\r", "");
        }
        line.append(rep);
        line.append("\t");

        String[] ancestry = ancestryRow.asText().trim().split("\\|");

        String stage = ancestry[0];
        line.append(stage);
        line.append("\t");

        String sampleSize = "";

        if(!ancestry[4].equals("NA")){
            sampleSize = ancestry[4];
        }
        line.append(sampleSize);
        line.append("\t");

        String ancestralGroup = "";

        if(ancestry[3] != "NA") {
            ancestralGroup = ancestry[3];
            if(ancestralGroup.contains(newline)){
                ancestralGroup = ancestralGroup.replaceAll("\n", "").replaceAll("\r", "");
            }
        }
        line.append(ancestralGroup);
        line.append("\t");

        String coo = ancestry[1];
        line.append(coo);
        line.append("\t");

        String cor = ancestry[2];
        line.append(cor);
        line.append("\t");

        String description = "";

        String dateString = getPublicationDate(doc);
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");

        Date publicationDate = null;
        Date minDate = null;
        try {
            publicationDate = format.parse(dateString);
            minDate = format.parse("2017-01-01");
        }
        catch (ParseException e) {
            e.printStackTrace();
        }


        if((ancestry.length == 6) && !ancestry[5].equals("NA") && (publicationDate.compareTo(minDate) > 0)){
            description = ancestry[5];
            if(description.contains(newline)){
                description = description.replaceAll("\n", "").replaceAll("\r", "");
            }
        }
        line.append(description);
//        line.append("\t");

        if ("ancestry_new_format".equals(type)){
            //for ANCESTRY DESCRIPTOR header which isnt filled to avoid misalignment of next columns
            //TODO must fill with appropriate value or clear header
            line.append('\t').append(" ");
            line.append('\t').append(getFounder(doc));
            line.append('\t').append(getCases(doc));
            line.append('\t').append(getControls(doc));
            line.append('\t').append(getSampleDescription(doc));
            line.append('\t').append(getCohort(doc));
            line.append('\t').append(getCohortReference(doc));
        } else if ("ancestry_new_format_no_cohorts".equals(type)) {
            //for ANCESTRY DESCRIPTOR header which isnt filled to avoid misalignment of next columns
            //TODO must fill with appropriate value or clear header
            line.append('\t').append(" ");
            line.append('\t').append(getFounder(doc));
            line.append('\t').append(getCases(doc));
            line.append('\t').append(getControls(doc));
            line.append('\t').append(getSampleDescription(doc));
        }

        line.append("\r\n");
    }

        public void processAssociationJson(StringBuilder line, JsonNode doc) throws IOException {
        setMultiSnpHaplotype(getBoolean(doc,"multiSnpHaplotype"));
        setSnpInteraction(getBoolean(doc, "snpInteraction"));

        line.append(getDate(doc));
        line.append("\t");

        String pubmedid = getPubmedId(doc);
        line.append(pubmedid);
        line.append("\t");
        line.append(getAuthor(doc));
        line.append("\t");
        line.append(getPublicationDate(doc));
        line.append("\t");
        line.append(getJournal(doc));
        line.append("\t");

        String publink = "www.ncbi.nlm.nih.gov/pubmed/".concat(pubmedid);

        line.append(publink);
        line.append("\t");

        line.append(getTitle(doc));
        line.append("\t");

        line.append(getTrait(doc));
        line.append("\t");

        String init = getInitSample(doc);
        if (init.contains(newline)) {
            init = init.replaceAll("\n", "").replaceAll("\r", "");
        }

        line.append(init);
        line.append("\t");

        String rep = getRepSample(doc);
        if (rep.contains(newline)) {
            rep = rep.replaceAll("\n", "").replaceAll("\r", "");
        }
        line.append(rep);
        line.append("\t");

        Map<String, String> chromLocation = getChromDetails(doc);

        line.append(chromLocation.get("region"));
        line.append("\t");
        line.append(chromLocation.get("chromName"));
        line.append("\t");
        line.append(chromLocation.get("chromPos"));
        line.append("\t");

        line.append(getRepGene(doc));
        line.append("\t");


        Map<String, MappedGene> mappedGenes = getMappedGenes(doc);

        if(mappedGenes.get("ingene").getName() != ""){
            line.append(mappedGenes.get("ingene").getName());
        }
        else if (mappedGenes.get("upstream").getName() != "" && mappedGenes.get("downstream").getName() != ""){
            line.append(mappedGenes.get("upstream").getName().concat(" - ").concat(mappedGenes.get("downstream")
                                                                                           .getName()));
        }
        else if (mappedGenes.get("upstream").getName() != "" && mappedGenes.get("downstream").getName() == ""){
            line.append(mappedGenes.get("upstream").getName().concat(" - NA"));
        }
        else if (mappedGenes.get("upstream").getName() == "" && mappedGenes.get("downstream").getName() != ""){
            line.append(("NA - ").concat(mappedGenes.get("downstream").getName()));
        }
        else {
            line.append("");
        }

        line.append("\t");

        line.append(mappedGenes.get("upstream").getId());
        line.append("\t");
        line.append(mappedGenes.get("downstream").getId());
        line.append("\t");
        line.append(mappedGenes.get("ingene").getId());
        line.append("\t");

        line.append(mappedGenes.get("upstream").getDistance());
        line.append("\t");

        line.append(mappedGenes.get("downstream").getDistance());
        line.append("\t");

        line.append(getStrongestAllele(doc));
        line.append("\t");

        String rsId = getRsId(doc);
        line.append(rsId);
        line.append("\t");

        Map<String, String> mergedSnps = getMergedCurrent(doc);

        //            line.append(doc.get("merged").asText().trim());
        line.append(mergedSnps.get("merged"));
        line.append("\t");

//        if (rsId.indexOf("rs") == 0 && rsId.indexOf("rs", 2) == -1) {
//            line.append(rsId.substring(2));
//        }
//        else {
//            line.append("");
//        }
        line.append(mergedSnps.get("current"));
        line.append("\t");

        String context = getContext(doc);
        line.append(context);
        line.append("\t");

        if(isMultiSnpHaplotype || isSnpInteraction){
            line.append("");
        }
        else if (mappedGenes.get("ingene").getName() != "") {
            line.append("0");
        }
        else {
            line.append("1");
        }
        line.append("\t");

        line.append(getRiskFreq(doc));
        line.append("\t");

        String pvalue = getPvalue(doc);

        line.append(pvalue);
        line.append("\t");

         String mlog = getPvalueMlog(doc);
         line.append(mlog);
         line.append("\t");

        line.append(getQualifier(doc));
        line.append("\t");
        line.append(getOR(doc));
        line.append("\t");
        line.append(getCI(doc));
        line.append("\t");

        String platform = getPlatform(doc);
        if (platform.contains(newline)) {
            platform = platform.replaceAll("\n", "").replaceAll("\r", "");
        }
        line.append(platform);
        line.append("\tN");


        if(includeAnnotations){
            line.append("\t");

            Map<String, String> traits = getEfoTraits(doc);

            line.append(traits.get("trait"));
            line.append("\t");
            line.append(traits.get("uri"));
            line.append("\t");
            line.append(getAccessionId(doc));
            line.append("\t");
            line.append(getGenotypingTechonologies(doc));
        }

        line.append("\r\n");

    }

    private String getPlatform(JsonNode doc) {
        String platform;

        if(doc.get("platform") != null){
            platform = doc.get("platform").asText().trim();
        }
        else {
            platform = "";
        }


         return platform;
    }


    private String getAssocCount(JsonNode doc) {
        String count;

        if(doc.get("associationCount") != null){
            count = doc.get("associationCount").asText().trim();
        }
        else{
            count = "";
        }
        return count;
    }


    private String getCI(JsonNode doc) {
        String ci = "";
        if (doc.get("range") != null) {
            ci = ci.concat(doc.get("range").asText().trim()).concat(" ");
        }
        if (doc.get("betaUnit") != null) {
            ci = ci.concat(doc.get("betaUnit").asText().trim()).concat(" ");
        }

        if (doc.get("betaDirection") != null) {
            ci = ci.concat(doc.get("betaDirection").asText().trim()).concat(" ");
        }
        if(doc.get("orDescription") != null){
            ci = ci.concat(doc.get("orDescription").asText().trim());
        }
        ci = ci.trim();
        return ci;
    }

    private String getOR(JsonNode doc) {
        String or;
        if (doc.get("orPerCopyNum") != null) {
            or = doc.get("orPerCopyNum").asText().trim();
        }
        else if (doc.get("betaNum") != null) {
            or = doc.get("betaNum").asText().trim();
        }
        else {
            or = "";
        }
        return or;
    }

    private String getQualifier(JsonNode doc) {
        String qualifier;
        if (doc.get("qualifier") != null) {
            qualifier = doc.get("qualifier").get(0).asText().trim();
        }
        else {
            qualifier = "";
        }
        return qualifier;
    }

    private String getPvalue(JsonNode doc) {
        String pvalue;
        if (doc.get("pValueMantissa") != null && doc.get("pValueExponent") != null) {
            String mant = doc.get("pValueMantissa").asText().trim();
            String exp = doc.get("pValueExponent").asText().trim();
            pvalue = mant.concat("E").concat(exp);
        }
        else {
            pvalue = "";
        }
        return pvalue;
    }

    private String getPvalueMlog(JsonNode doc){
        String pvalue;
        if (doc.get("pValueMantissa") != null && doc.get("pValueExponent") != null) {
            int mant = doc.get("pValueMantissa").asInt();
            int exp = doc.get("pValueExponent").asInt();
            double log = Math.log10(mant);
            double p = -(log + exp);
            pvalue = String.valueOf(p);
        }
        else {
            pvalue = "";
        }
        return pvalue;
    }

    private String getRiskFreq(JsonNode doc) {
        String riskFreq;
        if (doc.get("riskFrequency") != null) {
            riskFreq = doc.get("riskFrequency").asText().trim();
        }
        else {
            riskFreq = "";
        }
        return riskFreq;
    }

    private String getContext(JsonNode doc) {
        String context;
        if (doc.get("context") != null) {
            context = doc.get("context").get(0).asText().trim();

        }
        else {
            context = "";
        }
        return context;
    }

    private String getRsId(JsonNode doc) {
        String rsId;
        if (doc.get("rsId") != null) {
            rsId = doc.get("rsId").get(0).asText().trim();
        }
        else {
            rsId = "";
        }
        return rsId;
    }

    private String getStrongestAllele(JsonNode doc) {
        String strongestAllele;
        if (doc.get("strongestAllele") != null) {
            strongestAllele = doc.get("strongestAllele").get(0).asText().trim();
        }
        else {
            strongestAllele = "";
        }
        return strongestAllele;
    }

    private String getMapGene(JsonNode doc) {
        String genes = "";
        if (doc.get("ensemblMappedGenes") != null) {
            int it = 0;

            for(JsonNode m : doc.get("ensemblMappedGenes")) {
                if (it > 0) {
                    genes = genes.concat(", ");
                }
                genes = genes.concat(m.asText().trim());
                it++;
            }
        }

        return genes;
    }

    private String getRepGene(JsonNode doc) {
        String genes = "";
        if (doc.get("reportedGene") != null) {
            int it = 0;
            for (JsonNode gene : doc.get("reportedGene")) {
                if (it > 0) {
                    genes = genes.concat(", ");
                }
                genes = genes.concat(gene.asText().trim());
                it++;
            }
        }
        return genes;
    }


    private Map<String, String> getChromDetails(JsonNode doc) {
        String chromName = "";
        String chromPos = "";
        String region = "";
        Map<String, String> location = new HashMap<>();

        if (doc.get("positionLinks") != null) {
            //            if(doc.get("positionLinks").size() > 1){
            for (int i = 0; i < doc.get("positionLinks").size(); i++) {
                String loc = doc.get("positionLinks").get(i).asText().trim();

                String[] locs = loc.split("\\|");

                String chrom = locs[0];

                String pattern = "^\\d+$";

                Pattern p = Pattern.compile(pattern);
                Matcher m = p.matcher(chrom);

                if (m.find() || chrom.equals("X") || chrom.equals("Y")) {
                    if(isMultiSnpHaplotype || isSnpInteraction){
                        if(chromName.equals("")){
                            chromName = locs[0];
                            chromPos = locs[1];
                            if(doc.get("region") != null) {
                                region = doc.get("region").get(0).asText().trim();
                            }
                        }
                        else if (isMultiSnpHaplotype){
                            chromName = chromName.concat(";").concat(locs[0]);
                            chromPos = chromPos.concat(";").concat(locs[1]);
                        }
                        else {
                            chromName = chromName.concat(" x ").concat(locs[0]);
                            chromPos = chromPos.concat(" x ").concat(locs[1]);
                        }

                    }
                    else {
                        chromName = locs[0];
                        chromPos = locs[1];
                        region = locs[2];
                    }
                }
//                else {
//                    System.out.println(loc);
//                }
            }
        }

        location.put("chromName", chromName);
        location.put("chromPos", chromPos);
        location.put("region", region);

        return location;
    }

    private String getRepSample(JsonNode doc) {
        String sampleDesc;
        if (doc.get("replicateSampleDescription") != null) {
            sampleDesc = doc.get("replicateSampleDescription").asText().trim();
        }
        else {
            sampleDesc = "";
        }
        return sampleDesc;
    }

    private String getInitSample(JsonNode doc) {
        String sampleDesc;
        if (doc.get("initialSampleDescription") != null) {
            sampleDesc = doc.get("initialSampleDescription").asText().trim();
        }
        else {
            sampleDesc = "";
        }
        return sampleDesc;
    }

    private String getTrait(JsonNode doc) {
        String traitName;
        if (doc.get("traitName_s") != null) {
            traitName = doc.get("traitName_s").asText().trim();
        }
        else {
            traitName = "";
        }
        return traitName;
    }

    private String getTitle(JsonNode doc) {
        String title;
        if (doc.get("title") != null) {
            title = doc.get("title").asText().trim();
        }
        else {
            title = "";
        }
        return title;
    }


    private String getJournal(JsonNode doc) {
        String journal;
        if (doc.get("publication") != null) {
            journal = doc.get("publication").asText().trim();
        }
        else {
            journal = "";
        }
        return journal;

    }

    private String getAuthor(JsonNode doc) {
        String author;
        if (doc.get("authorAscii_s") != null) {
            author = doc.get("authorAscii_s").asText().trim();
        }
        else {
            author = "";
        }
        return author;
    }

    private String getPubmedId(JsonNode doc) {
        String pmid;
        if (doc.get("pubmedId") != null) {
            pmid = doc.get("pubmedId").asText().trim();
        }
        else {
            pmid = "";
        }
        return pmid;
    }

    private String getPublicationDate(JsonNode doc) {
        String date;
        if (doc.get("publicationDate") != null) {
            date = doc.get("publicationDate").asText().trim().substring(0, 10);

        }
        else {
            date = "";
        }
        return date;
    }

    private String getDate(JsonNode doc) {
        String date;
        if (doc.get("catalogPublishDate") != null) {
            date = doc.get("catalogPublishDate").asText().trim().substring(0, 10);
        }
        else {
            date = "";
        }
        return date;
    }

    private Map<String,String> getMergedCurrent(JsonNode doc) {
        String merged;
        String currentSnp;
        Map<String, String> mergedSnps = new HashMap<>();

        if(doc.get("merged") != null) {
            merged = doc.get("merged").asText().trim();
        }
        else{
            merged = "";
        }

        if(doc.get("currentSnp") != null){
            currentSnp = doc.get("currentSnp").get(0).asText().trim();
                if (currentSnp.indexOf("rs") == 0 && currentSnp.indexOf("rs", 2) == -1) {
                    currentSnp = currentSnp.substring(2);
                }
                else {
                    currentSnp = "";
                }
        }
        else {
            currentSnp = "";
        }

        mergedSnps.put("merged", merged);
        mergedSnps.put("current", currentSnp);

        return mergedSnps;
    }


    private Map<String, MappedGene> getMappedGenes(JsonNode doc) {
        List<String> actuallyMapped = new ArrayList<>();
        List<String> processed = new ArrayList<>();

        if (doc.get("ensemblMappedGenes") != null) {

            for(JsonNode m : doc.get("ensemblMappedGenes")) {
               actuallyMapped.add(m.asText().trim());
            }
        }

        Map<String, MappedGene> genes = new HashMap<>();
        MappedGene upstream = new MappedGene();
        MappedGene downstream = new MappedGene();
        MappedGene ingene = new MappedGene();

        if (doc.get("ensemblMappedGeneLinks") != null) {
            for (JsonNode geneLink : doc.get("ensemblMappedGeneLinks")) {
                String[] data = geneLink.asText().trim().split("\\|");

                String gene = data[0];

                if(actuallyMapped.contains(gene)){

                    String chrom = data[3];

                    String pattern = "^\\d+$";

                    Pattern p = Pattern.compile(pattern);
                    Matcher m = p.matcher(chrom);

                    if (m.find() || chrom.equals("X") || chrom.equals("Y")) {
                        processed.add(gene);
                        String geneId, geneDist;


                        geneId = data[1];
                        geneDist = data[2];


                        int dist = Integer.parseInt(geneDist);

                        if (dist == 0) {
                            ingene.setOrAppendId(geneId);
                            ingene.setDistance(geneDist);
                            ingene.setOrAppendName(gene);
                        }
                        else if (dist > 0) {
                            upstream.setId(geneId);
                            upstream.setDistance(geneDist);
                            upstream.setName(gene);
                        }
                        else {
                            downstream.setId(geneId);
                            downstream.setDistance(geneDist.substring(1));
                            downstream.setName(gene);
                        }
                    }
                }

            }
        }

        String lit = "";
        for(String am : actuallyMapped){
            if(!processed.contains(am)){
                if(lit.equals("")){
                    lit = am;
                }
                else {
                    lit = lit.concat(", ").concat(am);
                }
            }
        }
        if(!lit.equals("")){
            ingene.setOrAppendName(lit);
        }
        genes.put("upstream", upstream);
        genes.put("downstream", downstream);
        genes.put("ingene", ingene);

        return genes;
    }


    private Map<String, String> getEfoTraits(JsonNode doc) {
        Map<String, String> traits = new HashMap<>();

        String trait = "";
        String uri = "";

        if(doc.get("efoLink") != null){
            for(JsonNode efoLink : doc.get("efoLink")){
                String[] data = efoLink.asText().trim().split("\\|");

                if(trait == ""){
                    trait = data[0];
                    uri = data[2];
                }
                else{
                    trait = trait.concat(", ").concat(data[0]);
                    uri = uri.concat(", ").concat(data[2]);
                }
            }
        }

        traits.put("trait", trait);
        traits.put("uri", uri);

        return traits;
    }

    private Map<String, String> getBackgroundEfoTraits(JsonNode doc) {

        Map<String, String> traits = new HashMap<>();
        String labels = "";
        String uris = "";
        if (doc.get("mappedBkgLabel") != null) {
            for (JsonNode label: doc.get("mappedBkgLabel")) {
                if (labels.isEmpty()) {
                    labels = label.asText();
                }
                else {
                    labels = labels.concat(", ").concat(label.asText());
                }
            }
        }
        if (doc.get("mappedBkgUri") != null) {
            for (JsonNode uri: doc.get("mappedBkgUri")) {
                if (uris.isEmpty()) {
                    uris = uri.asText();
                }
                else {
                    uris = uris.concat(", ").concat(uri.asText());
                }
            }
        }
        traits.put("labels", labels);
        traits.put("uris", uris);
        return traits;
    }

    private String getAccessionId(JsonNode doc) {
        String accessionId = "";

        if(doc.get("accessionId") != null){
            accessionId = doc.get("accessionId").asText().trim();
        }

        return accessionId;
    }

    private String getGenotypingTechonologies(JsonNode doc) {
        String genotypingTechnologiesList = "";

        if (doc.get("genotypingTechnologies") != null) {
            String priorityGenotypingTech = "";
            for (int i = 0; i < doc.get("genotypingTechnologies").size(); i++) {
                if (doc.get("genotypingTechnologies").get(i).asText().trim().compareTo("Genome-wide genotyping array") == 0) {
                    priorityGenotypingTech = doc.get("genotypingTechnologies").get(i).asText().trim() + ", ";
                } else {
                    genotypingTechnologiesList = genotypingTechnologiesList.concat(doc.get("genotypingTechnologies").get(i).asText().trim());
                    if (doc.get("studyDesignComment") != null) {
                        genotypingTechnologiesList = genotypingTechnologiesList.concat(" [").concat(doc.get("studyDesignComment").asText().trim()).concat("]");
                    }
                    genotypingTechnologiesList = genotypingTechnologiesList.concat(", ");
                }
            }
            genotypingTechnologiesList = priorityGenotypingTech + genotypingTechnologiesList;

            genotypingTechnologiesList = genotypingTechnologiesList.substring(0,genotypingTechnologiesList.length()-2);
        }
        return genotypingTechnologiesList;

    }

    public boolean isMultiSnpHaplotype() {
        return isMultiSnpHaplotype;
    }

    private String getSummaryStatsLocation(JsonNode doc){
        // return getNodeValue(doc, "summary_stats_location");
        return getFtpLink(doc);
    }
    private String getSubmissionDate(JsonNode doc){
        return getNodeValue(doc, "submission_date");
    }
    private String getStatisticalModel(JsonNode doc){
        return getNodeValue(doc, "statistical_model");
    }
    private String getBackgroundTrait(JsonNode doc){
        return getNodeValue(doc, "background_trait");
    }
    private String getMappedBackgroundTrait(JsonNode doc){
        return getNodeValue(doc, "mapped_background_trait");
    }
    private String getMappedBackgroundTraitUri(JsonNode doc){
        return getNodeValue(doc, "mapped_background_trait_uri");
    }

    private String getFounder(JsonNode doc){
        return getNodeValue(doc, "founder_genetically_isolated_population");
    }
    private String getCases(JsonNode doc){
        return getNodeValue(doc, "cases");
    }
    private String getControls(JsonNode doc){
        return getNodeValue(doc, "controls");
    }
    private String getSampleDescription(JsonNode doc){
        return getNodeValue(doc, "sampleDescription");
    }
    private String getCohort(JsonNode doc){
        return getNodeValue(doc, "cohort");
    }
    private String getGxE(JsonNode doc){
        String val = getNodeValue(doc, "gxe");
        return "true".equals(val) ? "yes" : "no";
    }
    private String getFullPvalueSet(JsonNode doc){
        String val = getNodeValue(doc, "fullPvalueSet");
        return "true".equals(val) ? "yes" : "no";
    }
    private String getFtpLink(JsonNode doc){
        String val = getNodeValue(doc, "ftpLink");
        if (val == null || val.isEmpty()) return "NA";
        return val;
    }
    private String getCohortReference(JsonNode doc){
        return getNodeValue(doc, "cohort_specific_reference");
    }

    private String getNodeValue(JsonNode doc, String key){
        return doc.has(key) ? doc.get(key).asText("") : "";
    }

    private String getNodeValue(JsonNode doc, String key, String defaultValue){
        return doc.get(key).asText(defaultValue);
    }

    private Boolean getBoolean(JsonNode doc, String key){
        return doc.has(key) ? doc.get(key).asBoolean() : false;
    }

    public void setMultiSnpHaplotype(boolean multiSnpHaplotype) {
        isMultiSnpHaplotype = multiSnpHaplotype;
    }

    public boolean isSnpInteraction() {
        return isSnpInteraction;
    }

    public void setSnpInteraction(boolean snpInteraction) {
        isSnpInteraction = snpInteraction;
    }


    private class MappedGene{
        private String name, id, distance;

        public MappedGene(){
            name = "";
            id = "";
            distance = "";
        }

        public String getName() {
            return name;
        }

        public String getId() {
            return id;
        }

        public String getDistance() {
            return distance;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setId(String id) {
            this.id = id;
        }

        public void setDistance(String distance) {
            this.distance = distance;
        }

        public void setOrAppendId(String id){
            if(this.id.equals("")){
                this.id = id;
            }
            else{
                this.id = this.id.concat(", ").concat(id);
            }
        }

        public void setOrAppendName(String name){
            if(this.name.equals("")){
                this.name = name;
            }
            else{
                this.name = this.name.concat(", ").concat(name);
            }
        }
    }
}


