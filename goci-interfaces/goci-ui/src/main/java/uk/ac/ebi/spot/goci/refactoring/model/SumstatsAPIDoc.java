package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SumstatsAPIDoc implements Serializable {

    private static final long serialVersionUID = -5827311384802796505L;

    @JsonProperty("_embedded")
    private SumstatsResponseDoc sumstatsResponseDoc;

    @JsonProperty("_links")
    private Links links;

}
