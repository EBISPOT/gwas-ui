package uk.ac.ebi.spot.goci.refactoring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.util.JsonListSerializer;

import java.util.List;

@EqualsAndHashCode
@Builder
@JsonPropertyOrder({
        "efoTraits",
        "reportedTrait",
        "associationCount"
})
public class EFOTableExportDTO {

    @JsonProperty("efoTraits")
    private String efoTraits;

    @JsonProperty("reportedTrait")
    private String reportedTrait;

    @JsonProperty("associationCount")
    private Integer associationCount;


    public EFOTableExportDTO(@JsonProperty("efoTraits") String efoTraits,
                           @JsonProperty("reportedTrait") String reportedTrait,
                           @JsonProperty("associationCount") Integer associationCount) {
        this.efoTraits = efoTraits;
        this.reportedTrait = reportedTrait;
        this.associationCount = associationCount;
    }

    public String getEfoTraits() {
        return efoTraits;
    }

    public void setEfoTraits(String efoTraits) {
        this.efoTraits = efoTraits;
    }

    public String getReportedTrait() {
        return reportedTrait;
    }

    public void setReportedTrait(String reportedTrait) {
        this.reportedTrait = reportedTrait;
    }

    public Integer getAssociationCount() {
        return associationCount;
    }

    public void setAssociationCount(Integer associationCount) {
        this.associationCount = associationCount;
    }
}
