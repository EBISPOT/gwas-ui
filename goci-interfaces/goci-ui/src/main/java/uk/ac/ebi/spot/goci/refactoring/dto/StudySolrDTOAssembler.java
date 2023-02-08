
package uk.ac.ebi.spot.goci.refactoring.dto;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.LocalDate;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceAssembler;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.model.StudyDoc;
import uk.ac.ebi.spot.goci.refactoring.rest.SolrSearchStudyController;
import uk.ac.ebi.spot.goci.ui.SearchConfiguration;
import uk.ac.ebi.spot.goci.ui.constants.SearchUIConstants;
import uk.ac.ebi.spot.goci.util.BackendUtil;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
@Component
public class StudySolrDTOAssembler implements ResourceAssembler<StudyDoc, Resource<StudySolrDTO>> {


    private static final Logger log = LoggerFactory.getLogger(StudySolrDTOAssembler.class);
    private final static String INITIAL_SAMPLE_DESC_REGEX = "([1-9][0-9]{0,2}(?:,[0-9]{3})*)";
    final Pattern pattern = Pattern.compile(INITIAL_SAMPLE_DESC_REGEX);

    @Autowired
    SearchConfiguration searchConfiguration;

    private final static DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ssZ");

    @Override
    public Resource<StudySolrDTO> toResource(StudyDoc studyDoc)  {


        StudySolrDTO studySolrDTO = StudySolrDTO.builder()
                                        .accessionId(studyDoc.getAccessionId())
                                        .reportedTrait(studyDoc.getTraitName_s())
                                        .journal(studyDoc.getPublication())
                                        .firstAuthor(Optional.ofNullable(studyDoc.getAuthorS()).orElse("NA"))
                                        .title(studyDoc.getTitle())
                                        .associationCount(studyDoc.getAssociationCount())
                                        .pubmedId(studyDoc.getPubmedId())
                                        .publicationDate(Optional.ofNullable(studyDoc.getPublicationDate()).map(this::formatPubDate).orElse(null))
                                        .summaryStatistics(studyDoc.getFullPvalueSet() ? getSummaryStatsFTPDetails(studyDoc.getAccessionId()) : "NA")
                                        .efoTraits(Optional.ofNullable(studyDoc.getEfoLink()).map(this::getEFOLinks)
                                                .orElse(this.getEFOLinksfromUri(studyDoc.getMappedLabel(),studyDoc.getMappedUri())))
                                        .bgTraits(Optional.ofNullable(studyDoc.getMappedBkgLabels()).map( bgLinks -> this.getBgLinksfromUri
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
                                        .build();
        try {
            final ControllerLinkBuilder lb = ControllerLinkBuilder.linkTo(
                    ControllerLinkBuilder.methodOn(SolrSearchStudyController.class).searchStudies(null, studyDoc.getAssociation_rsId().get(0), null, null));
            Resource<StudySolrDTO> resource = new Resource<>(studySolrDTO);
            resource.add(BackendUtil.underBasePath(lb, searchConfiguration.getProxy_prefix()).withRel(SearchUIConstants.LINKS_PARENT));
            return resource;
        } catch(IOException ex ){
            log.error("IO Exception "+ex.getMessage(),ex);
        }
        return null;
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

    private List<EFOKeyLabel> getEFOLinks(List<String> efoLink) {

        return efoLink.stream().map(this::splitEFOText)
                .collect(Collectors.toList());
    }

    private List<EFOKeyLabel> getEFOLinksfromUri(List<String> efoMappedLabel, List<String> efoMappedUri) {
        List<EFOKeyLabel> arr = new ArrayList<>();
       for(int i = 0; i < efoMappedLabel.size(); i++) {
           String efoId = efoMappedUri.get(i).substring(efoMappedUri.get(i).lastIndexOf("/")+1);
           arr.add(new EFOKeyLabel(efoId,efoMappedLabel.get(i)));
       }
       return arr;
    }

    private List<EFOKeyLabel> getBgLinksfromUri(List<String> bgMappedLabel, List<String> bgMappedUri) {
        List<EFOKeyLabel> arr = new ArrayList<>();
        for(int i = 0; i < bgMappedLabel.size(); i++) {
            String bgId = bgMappedUri.get(i).substring(bgMappedUri.get(i).lastIndexOf("/")+1);
            arr.add(new EFOKeyLabel(bgId,bgMappedLabel.get(i)));
        }
        return arr;
    }

    private EFOKeyLabel splitEFOText(String efoText) {
       String[] text = efoText.split("\\|");
       return new EFOKeyLabel(text[1],text[0]);
    }


    private List<String> populateInitialSampleDesc(String sampleDesc) {
        List<String> text = new ArrayList<>();
        String[] desc = sampleDesc.split(INITIAL_SAMPLE_DESC_REGEX);
        for(int i =0; i < desc.length ; i++) {
            desc[i] = desc[i].replaceAll(",", "");
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
            String freetext = sampleNumbers.get(i)+ text.get(i);
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

    private LocalDate formatPubDate(String pubDate) {
        return LocalDate.parse(pubDate, dtf );
    }

}

