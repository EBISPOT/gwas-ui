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
        "status",
        "QTime",
        "params"
})
public class ResponseHeader {

    @JsonProperty("status")
    private Integer status;
    @JsonProperty("QTime")
    private Integer qTime;
    @JsonProperty("params")
    private Params params;

}
