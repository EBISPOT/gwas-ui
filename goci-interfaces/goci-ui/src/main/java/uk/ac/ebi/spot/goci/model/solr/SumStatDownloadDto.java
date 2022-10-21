package uk.ac.ebi.spot.goci.model.solr;

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
@JsonPropertyOrder({
        "First Author",
        "PubMed ID",
        "Study Accession",
        "Publication Date",
        "Journal",
        "Title",
        "Reported Trait",
        "Trait(s)",
        "Trait URI",
        "Data Access"
})
public class SumStatDownloadDto {

    @JsonProperty("First Author")
    private String authorS;

    @JsonProperty("PubMed ID")
    private String pubmedId;

    @JsonProperty("Study Accession")
    private String accessionId;

    @JsonProperty("Publication Date")
    private String publicationDate;

    @JsonProperty("Journal")
    private String publication;

    @JsonProperty("Title")
    private String title;

    @JsonProperty("Trait(s)")
    private String mappedLabel;

    @JsonProperty("Reported Trait")
    private String traitNameS;

    @JsonProperty("Trait URI")
    private String mappedUri;

    @JsonProperty("Data Access")
    private String dataAccess;

    //   http://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/GCST004001-GCST005000/GCST004198
}
