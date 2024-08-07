package uk.ac.ebi.spot.goci.refactoring.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import org.springframework.hateoas.ResourceSupport;
import org.springframework.hateoas.core.Relation;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;

import java.io.Serializable;
import java.util.List;
@EqualsAndHashCode
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Relation(value = "efoData", collectionRelation = "efos")
public class EFOTraitSolrDTO extends ResourceSupport implements Serializable {

    @JsonProperty("efoTraits")
    private List<EFOKeyLabel> efoTraits;

    @JsonProperty("reportedTrait")
    private List<String> reportedTrait;

    @JsonProperty("associationCount")
    private Integer associationCount;


    public EFOTraitSolrDTO(@JsonProperty("efoTraits") List<EFOKeyLabel> efoTraits,
                           @JsonProperty("reportedTrait") List<String> reportedTrait,
                           @JsonProperty("associationCount") Integer associationCount) {
        this.efoTraits = efoTraits;
        this.reportedTrait = reportedTrait;
        this.associationCount = associationCount;
    }

    public List<EFOKeyLabel> getEfoTraits() {
        return efoTraits;
    }

    public void setEfoTraits(List<EFOKeyLabel> efoTraits) {
        this.efoTraits = efoTraits;
    }

    public List<String> getReportedTrait() {
        return reportedTrait;
    }

    public void setReportedTrait(List<String> reportedTrait) {
        this.reportedTrait = reportedTrait;
    }

    public Integer getAssociationCount() {
        return associationCount;
    }

    public void setAssociationCount(Integer associationCount) {
        this.associationCount = associationCount;
    }
}
