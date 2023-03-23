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
public class ResponseDoc implements Serializable {

    private static final long serialVersionUID = 6496183143258703217L;

    @JsonProperty("efoTraits")
    private List<EFOApiDoc> efoTraits = null;



}
