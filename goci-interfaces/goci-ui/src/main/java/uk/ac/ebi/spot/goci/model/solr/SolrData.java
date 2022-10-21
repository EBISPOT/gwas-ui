package uk.ac.ebi.spot.goci.model.solr;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({
        "responseHeader",
        "response"
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class SolrData {

    @JsonProperty("responseHeader")
    private ResponseHeader responseHeader;
    @JsonProperty("response")
    private Response response;

}



