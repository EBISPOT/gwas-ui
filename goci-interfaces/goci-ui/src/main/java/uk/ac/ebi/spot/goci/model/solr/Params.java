package uk.ac.ebi.spot.goci.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({
        "q",
        "fl",
        "start",
        "fq",
        "rows",
        "wt"
})
public class Params {

    @JsonProperty("q")
    private String q;
    @JsonProperty("fl")
    private String fl;
    @JsonProperty("start")
    private String start;
    @JsonProperty("fq")
    private String fq;
    @JsonProperty("rows")
    private String rows;
    @JsonProperty("wt")
    private String wt;

}
