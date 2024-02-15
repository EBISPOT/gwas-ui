
package uk.ac.ebi.spot.goci.refactoring.dto;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.component.SumstatsIdentifierMap;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchPublicationController;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchVariantController;
import uk.ac.ebi.spot.goci.refactoring.util.SolrEntityTransformerUtility;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.util.BackendUtil;

import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class StudySolrDTOAssembler extends RepresentationModelAssemblerSupport<StudyDoc, StudySolrDTO> {

    private static final Logger log = LoggerFactory.getLogger(StudySolrDTOAssembler.class);
    //private final static String INITIAL_SAMPLE_DESC_REGEX = "([1-9][0-9]{0,9}(?:,[0-9]{3,5})*)";
    private final static String INITIAL_SAMPLE_DESC_REGEX = "([1-9][0-9]{0,9}(?:,[0-9]{3,5}))";
    final Pattern pattern = Pattern.compile(INITIAL_SAMPLE_DESC_REGEX);

    @Autowired
    SearchConfiguration searchConfiguration;
    @Autowired
    SolrEntityTransformerUtility solrEntityTransformerUtility;
    @Autowired
    SumstatsIdentifierMap sumstatsIdentifierMap;

    public StudySolrDTOAssembler() {
        super(SolrSearchVariantController.class, StudySolrDTO.class);
    }

    @Override
    public StudySolrDTO toModel(StudyDoc studyDoc)  {

        StudySolrDTO studySolrDTO = assemble(studyDoc);
       // studySolrDTO.add(linkTo(methodOn(SolrSearchVariantController.class)).withSelfRel());
        return studySolrDTO;

//        try {
//            final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(
//                    ControllerLinkBuilder.methodOn(SolrSearchVariantController.class).searchStudies(null, "rsidxxxx", null, null));
//            Resource<StudySolrDTO> resource = new Resource<>(studySolrDTO);
//            resource.add(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).withSelfRel());
//            return resource;
//        } catch(IOException ex ){
//            log.error("IO Exception "+ex.getMessage(),ex);
//        }
//        return null;
    }

    public StudySolrDTO assemble(StudyDoc studyDoc ){
        return StudySolrDTO.builder()
                .accessionId(studyDoc.getAccessionId())
                .reportedTrait(studyDoc.getTraitName_s())
                .journal(studyDoc.getPublication())
                .firstAuthor(Optional.ofNullable(studyDoc.getAuthorS()).orElse("NA"))
                .title(studyDoc.getTitle())
                .associationCount(studyDoc.getAssociationCount())
                .pubmedId(studyDoc.getPubmedId())
                .publicationDate(Optional.ofNullable(studyDoc.getPublicationDate()).map(solrEntityTransformerUtility::formatPubDate).orElse(null))
                .summaryStatistics(studyDoc.getFullPvalueSet() ? getSummaryStatsFTPDetails(studyDoc.getAccessionId()) : "NA")
                .efoTraits(Optional.ofNullable(studyDoc.getEfoLink()).map(solrEntityTransformerUtility::getEFOLinks)
                        .orElse(solrEntityTransformerUtility.getEFOLinksfromUri(studyDoc.getMappedLabel(),studyDoc.getMappedUri())))
                .bgTraits(Optional.ofNullable(studyDoc.getMappedBkgLabels()).map( bgLinks -> solrEntityTransformerUtility.getEFOLinksfromUri
                        (studyDoc.getMappedBkgLabels(),studyDoc.getMappedBkgUris())).orElse(null))
                .initialSampleDescription(Optional.ofNullable(studyDoc.getInitialSampleDescription()).map(this::populateInitialSampleDesc)
                        .orElse(null))
                .replicateSampleDescription(Optional.ofNullable(studyDoc.getReplicateSampleDescription()).map(this::populateReplicationSampleDesc)
                        .orElse(null))
                .discoverySampleAncestry(Optional.ofNullable(studyDoc.getAncestryLinks()).map(this::populateAncestryAndInitialSampleNumber)
                        .orElse(null))
                .replicationSampleAncestry(Optional.ofNullable(studyDoc.getAncestryLinks()).map(this::populateAncestryAndReplicationSampleNumber)
                        .orElse(null))
                .genotypingTechnologies(studyDoc.getGenotypingTechnologies())
                .ssApiFlag(getSSApiFlag(studyDoc.getAccessionId()))
                .agreedToCc(studyDoc.getAgreedToCc())
                .build();
    }

    private Boolean getSSApiFlag(String accessionId) {
      String ssAccessId =  Optional.ofNullable(sumstatsIdentifierMap.getSumstatsMap())
                .map( ssmap -> ssmap.get(accessionId))
                .filter(accId -> accId != null)
                .orElse(null);

      if(ssAccessId != null)
          return true;
      else
          return false;
    }

    private String getBooleanText(Boolean flag){
        if(flag != null) {
            if (flag)
                return "yes";
            else
                return "no";
        }
        return "-";
    }

    public StudyTableExportDTO assembleStudyExport(StudyDoc studyDoc) {

      return  StudyTableExportDTO.builder()
                .accessionId(studyDoc.getAccessionId())
                .reportedTrait(studyDoc.getTraitName_s())
                .journal(studyDoc.getPublication())
                .firstAuthor(Optional.ofNullable(studyDoc.getAuthorS()).orElse("NA"))
                .title(studyDoc.getTitle())
                .associationCount(studyDoc.getAssociationCount())
                .pubmedId(studyDoc.getPubmedId())
                .publicationDate(Optional.ofNullable(studyDoc.getPublicationDate().substring(0,studyDoc.getPublicationDate().indexOf("T") )).orElse(null))
                .summaryStatistics(studyDoc.getFullPvalueSet() ? getSummaryStatsFTPDetails(studyDoc.getAccessionId()) : "NA")
                .efoTraits(parseLabelsFromEFO(Optional.ofNullable(studyDoc.getEfoLink()).map(solrEntityTransformerUtility::getEFOLinks)
                        .orElse(solrEntityTransformerUtility.getEFOLinksfromUri(studyDoc.getMappedLabel(),studyDoc.getMappedUri()))))
                .bgTraits(parseLabelsFromEFO(Optional.ofNullable(studyDoc.getMappedBkgLabels()).map( bgLinks -> solrEntityTransformerUtility.getEFOLinksfromUri
                        (studyDoc.getMappedBkgLabels(),studyDoc.getMappedBkgUris())).orElse(null)))
                .initialSampleDescription(convertListToString(Optional.ofNullable(studyDoc.getInitialSampleDescription()).map(this::populateInitialSampleDesc)
                        .orElse(null)))
                .replicateSampleDescription(convertListToString(Optional.ofNullable(studyDoc.getReplicateSampleDescription()).map(this::populateReplicationSampleDesc)
                        .orElse(null)))
                .discoverySampleAncestry(convertListToString(Optional.ofNullable(studyDoc.getAncestryLinks()).map(this::populateAncestryAndInitialSampleNumber)
                        .orElse(null)))
                .replicationSampleAncestry(convertListToString(Optional.ofNullable(studyDoc.getAncestryLinks()).map(this::populateAncestryAndReplicationSampleNumber)
                        .orElse(null)))
                .genotypingTechnologies(convertListToString(studyDoc.getGenotypingTechnologies()))
                .ssApiFlag(getBooleanText(getSSApiFlag(studyDoc.getAccessionId())))
                .agreedToCc(getBooleanText(studyDoc.getAgreedToCc()))
                .build();

    }

    private String getSummaryStatsFTPDetails(String accessionId) {
        String ftpDir = getDirectoryBin(accessionId);
        String ftpLink = searchConfiguration.getSummaryStatsFTPLink().concat(ftpDir).concat("/").concat(accessionId);
        return ftpLink;
    }

    private String getDirectoryBin(String accessionId) {
        String accId = accessionId.substring(accessionId.indexOf("GCST")+4);
        int gsctNum = Integer.parseInt(accId);
        int lowerRange = (int) (Math.floor((gsctNum-1)/1000))*1000+1;
        int upperRange = (int) (Math.floor((gsctNum-1)/1000)+1)*1000;
        String range = "GCST"+StringUtils.leftPad(String.valueOf(lowerRange),6,"0")
                +"-GCST"+StringUtils.leftPad(String.valueOf(upperRange),6,"0");
        return range;
    }
    private List<String> populateInitialSampleDesc(String sampleDesc) {

        //log.info("sampleDesc is ->"+sampleDesc);
        List<String> text = new ArrayList<>();
        String[] desc = sampleDesc.split(INITIAL_SAMPLE_DESC_REGEX);
        for(int i =0; i < desc.length ; i++) {
            desc[i] = desc[i].replaceAll("(,\\s+$)", "");
            if(!desc[i].trim().isEmpty())
                text.add(desc[i]);
        }
        List<String> sampleNumbers = new ArrayList<>();
        final Matcher matcher = pattern.matcher(sampleDesc);
        while (matcher.find()) {
            for (int i = 1; i <= matcher.groupCount(); i++) {
                sampleNumbers.add(matcher.group(i));
            }
        }

        List<String> sampleDescriptions = new ArrayList<>();

        for(int i = 0; i < sampleNumbers.size(); i++) {
            String freetext = "";
           // log.info("sampleNumbers ["+i+"]->"+sampleNumbers.get(i));
           // log.info("text ["+i+"]->"+text.get(i));
            if(text.size() > sampleNumbers.size() ){
                freetext = sampleNumbers.get(i)+ text.get(i+1);
            } else {
                freetext = sampleNumbers.get(i) + text.get(i);
            }
            sampleDescriptions.add(freetext);
        }

        return sampleDescriptions;
    }

    private List<String> populateReplicationSampleDesc(String sampleDesc) {
        return Arrays.asList(sampleDesc.split(", "));
    }

    private List<String> populateAncestryAndInitialSampleNumber(List<String> ancestryLinks) {

        return  ancestryLinks.stream()
                .filter((ancestryText) -> ancestryText.startsWith("initial"))
                .map((text) -> {
                StringBuilder initialSampleText = new StringBuilder();
                String[] freetext = text.split("\\|");
                initialSampleText.append(freetext[4]);
                initialSampleText.append(" ");
                initialSampleText.append(freetext[3]);
            return initialSampleText.toString();
        }).collect(Collectors.toList());
    }

    private List<String> populateAncestryAndReplicationSampleNumber(List<String> ancestryLinks) {

        return  ancestryLinks.stream()
                .filter((ancestryText) -> ancestryText.startsWith("replication"))
                .map((text) -> {
                    StringBuilder replicateSampleText = new StringBuilder();
                    String[] freetext = text.split("\\|");
                    replicateSampleText.append(freetext[4]);
                    replicateSampleText.append(" ");
                    replicateSampleText.append(freetext[3]);
            return replicateSampleText.toString();
        }).collect(Collectors.toList());
    }

    private String parseLabelsFromEFO(List<EFOKeyLabel> efoKeyLabels) {
        if(efoKeyLabels != null) {
            return efoKeyLabels.stream().filter(Objects::nonNull).
                    map(EFOKeyLabel::getLabel).
                    collect(Collectors.joining(","));
        }
            return "-";
    }


    private String convertListToString(List<String> anyList) {
        if(anyList != null) {
         return anyList.stream().collect(Collectors.joining(","));
        }
            return "-";
    }

}

