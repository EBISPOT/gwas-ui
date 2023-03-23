package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OLSResponseDoc implements Serializable {

    private static final long serialVersionUID = -1936362074043321834L;

    @JsonProperty("terms")
    private List<TermApiDoc> terms = null;
}
