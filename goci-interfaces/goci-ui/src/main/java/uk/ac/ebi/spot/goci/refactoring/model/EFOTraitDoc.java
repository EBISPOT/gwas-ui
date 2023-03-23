package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

public class EFOTraitDoc implements Serializable {

    private static final long serialVersionUID = -1797464057014210476L;

    @JsonProperty("efoTraits")
    private List<EFOKeyLabel> efoTraits;

    @JsonProperty("reportedTrait")
    private List<String> reportedTrait;

    @JsonProperty("associationCount")
    private Integer associationCount;


    public EFOTraitDoc(@JsonProperty("efoTraits") List<EFOKeyLabel> efoTraits,
                       @JsonProperty("reportedTrait") List<String> reportedTrait,
                       @JsonProperty("associationCount") Integer associationCount
                       ) {
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
