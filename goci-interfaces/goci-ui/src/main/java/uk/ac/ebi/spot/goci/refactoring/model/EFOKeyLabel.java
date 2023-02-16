package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EFOKeyLabel {
    @JsonProperty("key")
    private String key;
    @JsonProperty("label")
    private String label;

    public EFOKeyLabel(@JsonProperty("key") String key,
                       @JsonProperty("label") String label) {
        this.key = key;
        this.label = label;
    }
}
