package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SearchStudyDTO {

    @JsonProperty("accessionId")
    private String accessionId;

    @JsonProperty("reportedTrait")
    private String reportedTrait;

    @JsonProperty("efoTrait")
    private String efoTrait;

    @JsonProperty("bgTrait")
    private String bgTrait;

    @JsonProperty("fullPvalueSet")
    private Boolean fullPvalueSet;

    @JsonProperty("discoverySampleAncestry")
    private String discoverySampleAncestry;

    @JsonProperty("replicationSampleAncestry")
    private String replicationSampleAncestry;

    @JsonProperty("firstAuthor")
    private String firstAuthor;

    @JsonProperty("gxe")
    private Boolean gxe;

    @JsonProperty("seqGwas")
    private Boolean seqGwas;

}
