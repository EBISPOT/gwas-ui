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


}
