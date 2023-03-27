package uk.ac.ebi.spot.goci.refactoring.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import org.joda.time.LocalDate;
import org.springframework.hateoas.ResourceSupport;
import org.springframework.hateoas.core.Relation;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.util.JsonJodaLocalDateSerializer;

import java.io.Serializable;
import java.util.List;

@EqualsAndHashCode
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Relation(value = "study", collectionRelation = "studies")
public class StudySolrDTO extends ResourceSupport implements Serializable {

    @JsonProperty("accessionId")
    private String accessionId;

    @JsonProperty("pubmedId")
    private String pubmedId;

    @JsonProperty("reportedTrait")
    private String reportedTrait;
    @JsonProperty("efoTraits")
    private List<EFOKeyLabel> efoTraits;
    @JsonProperty("bgTraits")
    private List<EFOKeyLabel> bgTraits;
    @JsonProperty("publicationDate")
    @JsonSerialize(using = JsonJodaLocalDateSerializer.class)
    private LocalDate publicationDate;
    @JsonProperty("journal")
    private String journal;
    @JsonProperty("title")
    private String title;

    @JsonProperty("firstAuthor")
    private String firstAuthor;
    @JsonProperty("genotypingTechnologies")
    private List<String> genotypingTechnologies;
    @JsonProperty("initialSampleDescription")
    private List<String> initialSampleDescription;
    @JsonProperty("replicateSampleDescription")
    private List<String> replicateSampleDescription;
    @JsonProperty("discoverySampleAncestry")
    private List<String> discoverySampleAncestry;
    @JsonProperty("replicationSampleAncestry")
    private List<String> replicationSampleAncestry;
    @JsonProperty("associationCount")
    private Integer associationCount;
    @JsonProperty("summaryStatistics")
    private String summaryStatistics;

    @JsonProperty("ssApiFlag")
    private Boolean ssApiFlag;

    @JsonProperty("agreedToCc0")
    private Boolean agreedToCc;

    public StudySolrDTO(@JsonProperty("accessionId") String accessionId,
                        @JsonProperty("pubmedId") String pubmedId,
                        @JsonProperty("reportedTrait") String reportedTrait,
                        @JsonProperty("efoTraits") List<EFOKeyLabel> efoTraits,
                        @JsonProperty("bgTraits") List<EFOKeyLabel> bgTraits,
                        @JsonProperty("publicationDate") @JsonSerialize(using = JsonJodaLocalDateSerializer.class) LocalDate publicationDate,
                        @JsonProperty("journal") String journal,
                        @JsonProperty("title") String title,
                        @JsonProperty("firstAuthor")  String firstAuthor,
                        @JsonProperty("genotypingTechnologies") List<String> genotypingTechnologies,
                        @JsonProperty("initialSampleDescription") List<String> initialSampleDescription,
                        @JsonProperty("replicateSampleDescription") List<String> replicateSampleDescription,
                        @JsonProperty("discoverySampleAncestry") List<String> discoverySampleAncestry,
                        @JsonProperty("replicationSampleAncestry") List<String> replicationSampleAncestry,
                        @JsonProperty("associationCount") Integer associationCount,
                        @JsonProperty("summaryStatistics") String summaryStatistics,
                        @JsonProperty("ssApiFlag") Boolean ssApiFlag,
                        @JsonProperty("agreedToCc0") Boolean agreedToCc) {
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

    public String getReportedTrait() {
        return reportedTrait;
    }

    public void setReportedTrait(String reportedTrait) {
        this.reportedTrait = reportedTrait;
    }

    public List<EFOKeyLabel> getEfoTraits() {
        return efoTraits;
    }

    public void setEfoTraits(List<EFOKeyLabel> efoTraits) {
        this.efoTraits = efoTraits;
    }

    public List<EFOKeyLabel> getBgTraits() {
        return bgTraits;
    }

    public void setBgTraits(List<EFOKeyLabel> bgTraits) {
        this.bgTraits = bgTraits;
    }

    public LocalDate getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(LocalDate publicationDate) {
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

    public List<String> getInitialSampleDescription() {
        return initialSampleDescription;
    }

    public void setInitialSampleDescription(List<String> initialSampleDescription) {
        this.initialSampleDescription = initialSampleDescription;
    }

    public List<String> getReplicateSampleDescription() {
        return replicateSampleDescription;
    }

    public void setReplicateSampleDescription(List<String> replicateSampleDescription) {
        this.replicateSampleDescription = replicateSampleDescription;
    }

    public List<String> getDiscoverySampleAncestry() {
        return discoverySampleAncestry;
    }

    public void setDiscoverySampleAncestry(List<String> discoverySampleAncestry) {
        this.discoverySampleAncestry = discoverySampleAncestry;
    }

    public List<String> getReplicationSampleAncestry() {
        return replicationSampleAncestry;
    }

    public void setReplicationSampleAncestry(List<String> replicationSampleAncestry) {
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

    public String getFirstAuthor() {
        return firstAuthor;
    }

    public void setFirstAuthor(String firstAuthor) {
        this.firstAuthor = firstAuthor;
    }

    public List<String> getGenotypingTechnologies() {
        return genotypingTechnologies;
    }

    public void setGenotypingTechnologies(List<String> genotypingTechnologies) {
        this.genotypingTechnologies = genotypingTechnologies;
    }

    public String getPubmedId() {
        return pubmedId;
    }

    public void setPubmedId(String pubmedId) {
        this.pubmedId = pubmedId;
    }


    public Boolean getSsApiFlag() {
        return ssApiFlag;
    }

    public void setSsApiFlag(Boolean ssApiFlag) {
        this.ssApiFlag = ssApiFlag;
    }

    public Boolean getAgreedToCc() {
        return agreedToCc;
    }

    public void setAgreedToCc(Boolean agreedToCc) {
        this.agreedToCc = agreedToCc;
    }
}



