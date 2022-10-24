package uk.ac.ebi.spot.goci.model.solr;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonPropertyOrder({
        "pubmedId",
        "title",
        "author_s",
        "authorAscii_s",
        "publication",
        "publicationDate",
        "accessionId",
        "associationCount",
        "traitName_s",
        "mappedLabel",
        "mappedUri"
})
@JsonIgnoreProperties(ignoreUnknown = true)
public class Doc {

    @JsonProperty("pubmedId")
    private String pubmedId;
    @JsonProperty("title")
    private String title;
    @JsonProperty("author_s")
    private String authorS;
    @JsonProperty("authorAscii_s")
    private String authorAsciiS;
    @JsonProperty("publication")
    private String publication;
    @JsonProperty("publicationDate")
    private String publicationDate;
    @JsonProperty("accessionId")
    private String accessionId;
    @JsonProperty("associationCount")
    private Integer associationCount;
    @JsonProperty("traitName_s")
    private String traitNameS;
    @JsonProperty("mappedLabel")
    private List<String> mappedLabel = null;
    @JsonProperty("mappedUri")
    private List<String> mappedUri = null;


}
