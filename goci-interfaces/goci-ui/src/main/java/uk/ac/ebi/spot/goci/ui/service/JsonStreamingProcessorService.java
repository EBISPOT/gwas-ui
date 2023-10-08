package uk.ac.ebi.spot.goci.ui.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;

public class JsonStreamingProcessorService {

    private BufferedReader input;
    private BufferedWriter output;
    private boolean includeAnnotations;
    private String type;
    private String newline;
    private boolean isMultiSnpHaplotype;
    private boolean isSnpInteraction;
    private boolean includeAncestry;
    private boolean includeCohortsAndSs;

    public JsonStreamingProcessorService(BufferedReader input, boolean includeAnnotations, String type,
                                         boolean includeAncestry, boolean includeCohortsAndSs, BufferedWriter output) {
        this.input = input;
        this.output = output;
        this.includeAnnotations = includeAnnotations;
        this.type = type;
        this.includeAncestry = includeAncestry;
        this.includeCohortsAndSs = includeCohortsAndSs;
        newline = System.getProperty("line.separator");
    }

    public void processJson() throws IOException {
        String header;
        if(type.equals("study") && !includeAncestry){
            header =
                    "DATE ADDED TO CATALOG\tPUBMEDID\tFIRST AUTHOR\tDATE\tJOURNAL\tLINK\tSTUDY\tDISEASE/TRAIT\tINITIAL SAMPLE SIZE\tREPLICATION SAMPLE SIZE\tPLATFORM [SNPS PASSING QC]\tASSOCIATION COUNT";
        }
        else if(type.equals("study_new_format")){
            header =
                    "DATE ADDED TO CATALOG\tPUBMED ID\tFIRST AUTHOR\tDATE\tJOURNAL\tLINK\tSTUDY\tDISEASE/TRAIT\tINITIAL SAMPLE SIZE\tREPLICATION SAMPLE SIZE\tPLATFORM [SNPS PASSING QC]\tASSOCIATION COUNT\tMAPPED_TRAIT\tMAPPED_TRAIT_URI\tSTUDY ACCESSION\tGENOTYPING TECHNOLOGY\tSUMMARY STATS LOCATION\tSUBMISSION DATE\tSTATISTICAL MODEL\tBACKGROUND TRAIT\tMAPPED BACKGROUND TRAIT\tMAPPED BACKGROUND TRAIT URI";
        }else if(type.equals("ancestry_new_format")){
            header = "STUDY ACCESSION\tPUBMED ID\tFIRST AUTHOR\tDATE\tINITIAL SAMPLE DESCRIPTION\tREPLICATION SAMPLE DESCRIPTION\tSTAGE\tNUMBER OF INDIVIDUALS\tBROAD ANCESTRAL CATEGORY\tCOUNTRY OF ORIGIN\tCOUNTRY OF RECRUITMENT\tADDITIONAL ANCESTRY DESCRIPTION\tANCESTRY DESCRIPTOR\tFOUNDER/GENETICALLY ISOLATED POPULATION\tNUMBER OF CASES\tNUMBER OF CONTROLS\tSAMPLE DESCRIPTION\tCOHORT(S)\tCOHORT-SPECIFIC REFERENCE";
        }
        else if (type.equals("ancestry_new_format_no_cohorts")) {
            header = "STUDY ACCESSION\tPUBMED ID\tFIRST AUTHOR\tDATE\tINITIAL SAMPLE DESCRIPTION\tREPLICATION SAMPLE DESCRIPTION\tSTAGE\tNUMBER OF INDIVIDUALS\tBROAD ANCESTRAL CATEGORY\tCOUNTRY OF ORIGIN\tCOUNTRY OF RECRUITMENT\tADDITIONAL ANCESTRY DESCRIPTION\tANCESTRY DESCRIPTOR\tFOUNDER/GENETICALLY ISOLATED POPULATION\tNUMBER OF CASES\tNUMBER OF CONTROLS\tSAMPLE DESCRIPTION";
        }
        else if(includeAncestry){
            header =
                    "STUDY ACCESSION\tPUBMEDID\tFIRST AUTHOR\tDATE\tINITIAL SAMPLE DESCRIPTION\tREPLICATION SAMPLE DESCRIPTION\tSTAGE\tNUMBER OF INDIVDUALS\tBROAD ANCESTRAL CATEGORY\tCOUNTRY OF ORIGIN\tCOUNTRY OF RECRUITMENT\tADDITONAL ANCESTRY DESCRIPTION";
        }
        else{
            header =
                    "DATE ADDED TO CATALOG\tPUBMEDID\tFIRST AUTHOR\tDATE\tJOURNAL\tLINK\tSTUDY\tDISEASE/TRAIT\tINITIAL SAMPLE SIZE\tREPLICATION SAMPLE SIZE\tREGION\tCHR_ID\tCHR_POS\tREPORTED GENE(S)\tMAPPED_GENE\tUPSTREAM_GENE_ID\tDOWNSTREAM_GENE_ID\tSNP_GENE_IDS\tUPSTREAM_GENE_DISTANCE\tDOWNSTREAM_GENE_DISTANCE\tSTRONGEST SNP-RISK ALLELE\tSNPS\tMERGED\tSNP_ID_CURRENT\tCONTEXT\tINTERGENIC\tRISK ALLELE FREQUENCY\tP-VALUE\tPVALUE_MLOG\tP-VALUE (TEXT)\tOR or BETA\t95% CI (TEXT)\tPLATFORM [SNPS PASSING QC]\tCNV";
        }
        if((includeAnnotations) && (!type.equals("study_new_format")) ){
            header = header.concat("\tMAPPED_TRAIT\tMAPPED_TRAIT_URI\tSTUDY ACCESSION\tGENOTYPING TECHNOLOGY");
        }
        if (includeCohortsAndSs) {
            header = header.concat("\tCOHORT\tFULL SUMMARY STATISTICS\tSUMMARY STATS LOCATION");
        }

        header = header.concat("\r\n");
        output.write(header);

        JsonProcessingService processor = new JsonProcessingService("", includeAnnotations, type, includeAncestry, includeCohortsAndSs);
        ObjectMapper mapper = new ObjectMapper();
        JsonParser parser = mapper.getFactory().createParser(input);
        while(parser.nextToken() != JsonToken.START_ARRAY) {
        }
        while(parser.nextToken() == JsonToken.START_OBJECT) {
            StringBuilder line = new StringBuilder();
            // read everything from this START_OBJECT to the matching END_OBJECT
            // and return it as a tree model ObjectNode
            ObjectNode doc = mapper.readTree(parser);
            // do whatever you need to do with this object
            if(type.equals("study") && !includeAncestry) {
                processor.processStudyJson(line, doc);
            }
            else if(includeAncestry || type.equals("ancestry_new_format")){

                if(doc.get("ancestryLinks") != null){
                    for(JsonNode a : doc.get("ancestryLinks")) {
                        if (type.equals("ancestry_new_format")) {
                            processor.processAncestryJson(line, doc, a, type);
                        } else {
                            processor.processAncestryJson(line, doc, a);
                        }
                    }
                }
            }
            else if(type.equals("study_new_format")){
                processor.processStudyJson(line, doc, true);
            }
            else {
                processor.processAssociationJson(line, doc);
            }
            output.write(line.toString());
            output.flush();
        }
        parser.close();
        output.flush();
    }

    public static void main(String[] args) {
        try {
            BufferedReader input = new BufferedReader(new FileReader("C:\\Users\\jstewart\\Downloads\\solr-download-data" +
                    ".json"));
            BufferedWriter output = new BufferedWriter(new FileWriter("out.txt"));

            JsonStreamingProcessorService processorService = new JsonStreamingProcessorService(input, true,
                    "association", false, false , output);
            processorService.processJson();
//            JsonProcessingService oldProcessor = new JsonProcessingService(input.readLine(), true,
//                    "association", false);
//            String result = oldProcessor.processJson();
            System.out.println("done");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
