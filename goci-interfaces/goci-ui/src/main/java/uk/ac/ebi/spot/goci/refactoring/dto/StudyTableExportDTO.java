package uk.ac.ebi.spot.goci.refactoring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.EqualsAndHashCode;


@EqualsAndHashCode
@Builder
@JsonPropertyOrder({
        "firstAuthor",
        "accessionId",
        "publicationDate",
        "journal",
        "title",
        "reportedTrait",
        "efoTraits",
        "bgTraits",
        "discoverySampleAncestry",
        "replicationSampleAncestry",
        "associationCount",
        "summaryStatistics",
        "ssApiFlag",
        "agreedToCc0",
        "genotypingTechnologies",
        "pubmedId",
        "initialSampleDescription",
        "replicateSampleDescription"
}
)

//@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyTableExportDTO {
    @JsonProperty("accessionId")
    private String accessionId;

    @JsonProperty("pubmedId")
    private String pubmedId;

    @JsonProperty("reportedTrait")
    private String reportedTrait;
    @JsonProperty("efoTraits")
    private String efoTraits;
    @JsonProperty("bgTraits")
    private String bgTraits;
    @JsonProperty("publicationDate")
    private String publicationDate;
    @JsonProperty("journal")
    private String journal;
    @JsonProperty("title")
    private String title;

    @JsonProperty("firstAuthor")
    private String firstAuthor;
    @JsonProperty("genotypingTechnologies")
    
    private String genotypingTechnologies;
    @JsonProperty("initialSampleDescription")
    
    private String initialSampleDescription;
    @JsonProperty("replicateSampleDescription")
    
    private String replicateSampleDescription;
    @JsonProperty("discoverySampleAncestry")
    
    private String discoverySampleAncestry;
    @JsonProperty("replicationSampleAncestry")
    
    private String replicationSampleAncestry;
    @JsonProperty("associationCount")
    private Integer associationCount;
    @JsonProperty("summaryStatistics")
    private String summaryStatistics;

    @JsonProperty("ssApiFlag")
    private String ssApiFlag;

    @JsonProperty("agreedToCc0")
    private String agreedToCc;


    public StudyTableExportDTO(@JsonProperty("accessionId") String accessionId,
                        @JsonProperty("pubmedId") String pubmedId,
                        @JsonProperty("reportedTrait") String reportedTrait,
                        @JsonProperty("efoTraits") String efoTraits,
                        @JsonProperty("bgTraits") String bgTraits,
                        @JsonProperty("publicationDate")  String publicationDate,
                        @JsonProperty("journal") String journal,
                        @JsonProperty("title") String title,
                        @JsonProperty("firstAuthor")  String firstAuthor,
                        @JsonProperty("genotypingTechnologies") String genotypingTechnologies,
                        @JsonProperty("initialSampleDescription") String initialSampleDescription,
                        @JsonProperty("replicateSampleDescription")  String replicateSampleDescription,
                        @JsonProperty("discoverySampleAncestry") String discoverySampleAncestry,
                        @JsonProperty("replicationSampleAncestry") String replicationSampleAncestry,
                        @JsonProperty("associationCount") Integer associationCount,
                        @JsonProperty("summaryStatistics") String summaryStatistics,
                        @JsonProperty("ssApiFlag") String ssApiFlag,
                        @JsonProperty("agreedToCc0") String agreedToCc) {
        this.accessionId = accessionId;
        this.pubmedId = pubmedId;
        this.reportedTrait = reportedTrait;
        this.efoTraits = efoTraits;
        this.bgTraits = bgTraits;
        this.publicationDate = publicationDate;
        this.journal = journal;
        this.title = title;
        this.firstAuthor = firstAuthor;
        this.genotypingTechnologies = genotypingTechnologies;
        this.initialSampleDescription = initialSampleDescription;
        this.replicateSampleDescription = replicateSampleDescription;
        this.discoverySampleAncestry = discoverySampleAncestry;
        this.replicationSampleAncestry = replicationSampleAncestry;
        this.associationCount = associationCount;
        this.summaryStatistics = summaryStatistics;
        this.ssApiFlag = ssApiFlag;
        this.agreedToCc = agreedToCc;
    }

    public String getAccessionId() {
        return accessionId;
    }

    public void setAccessionId(String accessionId) {
        this.accessionId = accessionId;
    }

    public String getPubmedId() {
        return pubmedId;
    }

    public void setPubmedId(String pubmedId) {
        this.pubmedId = pubmedId;
    }

    public String getReportedTrait() {
        return reportedTrait;
    }

    public void setReportedTrait(String reportedTrait) {
        this.reportedTrait = reportedTrait;
    }

    public String getEfoTraits() {
        return efoTraits;
    }

    public void setEfoTraits(String efoTraits) {
        this.efoTraits = efoTraits;
    }

    public String getBgTraits() {
        return bgTraits;
    }

    public void setBgTraits(String bgTraits) {
        this.bgTraits = bgTraits;
    }

    public String getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(String publicationDate) {
        this.publicationDate = publicationDate;
    }

    public String getJournal() {
        return journal;
    }

    public void setJournal(String journal) {
        this.journal = journal;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFirstAuthor() {
        return firstAuthor;
    }

    public void setFirstAuthor(String firstAuthor) {
        this.firstAuthor = firstAuthor;
    }

    public String getGenotypingTechnologies() {
        return genotypingTechnologies;
    }

    public void setGenotypingTechnologies(String genotypingTechnologies) {
        this.genotypingTechnologies = genotypingTechnologies;
    }

    public String getInitialSampleDescription() {
        return initialSampleDescription;
    }

    public void setInitialSampleDescription(String initialSampleDescription) {
        this.initialSampleDescription = initialSampleDescription;
    }

    public String getReplicateSampleDescription() {
        return replicateSampleDescription;
    }

    public void setReplicateSampleDescription(String replicateSampleDescription) {
        this.replicateSampleDescription = replicateSampleDescription;
    }

    public String getDiscoverySampleAncestry() {
        return discoverySampleAncestry;
    }

    public void setDiscoverySampleAncestry(String discoverySampleAncestry) {
        this.discoverySampleAncestry = discoverySampleAncestry;
    }

    public String getReplicationSampleAncestry() {
        return replicationSampleAncestry;
    }

    public void setReplicationSampleAncestry(String replicationSampleAncestry) {
        this.replicationSampleAncestry = replicationSampleAncestry;
    }

    public Integer getAssociationCount() {
        return associationCount;
    }

    public void setAssociationCount(Integer associationCount) {
        this.associationCount = associationCount;
    }

    public String getSummaryStatistics() {
        return summaryStatistics;
    }

    public void setSummaryStatistics(String summaryStatistics) {
        this.summaryStatistics = summaryStatistics;
    }

    public String getSsApiFlag() {
        return ssApiFlag;
    }

    public void setSsApiFlag(String ssApiFlag) {
        this.ssApiFlag = ssApiFlag;
    }

    public String getAgreedToCc() {
        return agreedToCc;
    }

    public void setAgreedToCc(String agreedToCc) {
        this.agreedToCc = agreedToCc;
    }
}
