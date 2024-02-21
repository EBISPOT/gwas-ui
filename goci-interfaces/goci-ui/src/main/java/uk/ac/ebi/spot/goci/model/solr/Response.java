package uk.ac.ebi.spot.goci.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonPropertyOrder({
        "numFound",
        "start",
        "docs"
})
public class Response {

    @JsonProperty("numFound")
    private Integer numFound;
    @JsonProperty("start")
    private Integer start;
    @JsonProperty("docs")
    private List<?> docs = null;
}
