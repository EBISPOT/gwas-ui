package uk.ac.ebi.spot.goci.refactoring.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.EqualsAndHashCode;
@EqualsAndHashCode
@Builder
@JsonPropertyOrder({
    "riskAllele",
        "pValue",
        "pValueAnnotation",
        "riskFrequency",
        "orValue",
        "beta",
        "ci",
        "mappedGenes",
        "traitName",
        "efoTraits",
        "bgTraits",
        "accessionId",
        "locations",
        "pubmedId",
        "author"
})
public class AssociationTableExportDTO {

    @JsonProperty("riskAllele")
    public String riskAllele;
    @JsonProperty("riskFrequency")
    private String riskFrequency;
    @JsonProperty("pValue")
    private String pValue;
    @JsonProperty("pValueAnnotation")
    private String pValueAnnotation;
    @JsonProperty("orValue")
    private String orValue;
    @JsonProperty("beta")
    private String beta;
    @JsonProperty("ci")
    private String ci;
    @JsonProperty("mappedGenes")
    private String mappedGenes;
    @JsonProperty("traitName")
    private String traitName;
    @JsonProperty("efoTraits")
    private String efoTraits;
    @JsonProperty("bgTraits")
    private String bgTraits;
    @JsonProperty("locations")
    private String locations;
    @JsonProperty("author")
    private String author;
    @JsonProperty("pubmedId")
    private String pubmedId;
    @JsonProperty("accessionId")
    private String accessionId;


    public AssociationTableExportDTO(@JsonProperty("riskAllele") String riskAllele,
                              @JsonProperty("riskFrequency") String riskFrequency,
                              @JsonProperty("pValue") String pValue,
                              @JsonProperty("pValueAnnotation") String pValueAnnotation,
                              @JsonProperty("orValue") String orValue,
                              @JsonProperty("beta") String beta,
                              @JsonProperty("ci")  String ci,
                              @JsonProperty("mappedGenes") String mappedGenes,
                              @JsonProperty("traitName") String traitName,
                              @JsonProperty("efoTraits") String efoTraits,
                              @JsonProperty("bgTraits") String bgTraits,
                              @JsonProperty("locations") String locations,
                              @JsonProperty("author") String author,
                              @JsonProperty("pubmedId") String pubmedId,
                              @JsonProperty("accessionId") String accessionId) {
        this.riskAllele = riskAllele;
        this.riskFrequency = riskFrequency;
        this.pValue = pValue;
        this.pValueAnnotation = pValueAnnotation;
        this.orValue = orValue;
        this.beta = beta;
        this.ci = ci;
        this.mappedGenes = mappedGenes;
        this.traitName = traitName;
        this.efoTraits = efoTraits;
        this.bgTraits = bgTraits;
        this.locations = locations;
        this.author = author;
        this.pubmedId = pubmedId;
        this.accessionId = accessionId;
    }

    public String getRiskAllele() {
        return riskAllele;
    }

    public void setRiskAllele(String riskAllele) {
        this.riskAllele = riskAllele;
    }

    public String getRiskFrequency() {
        return riskFrequency;
    }

    public void setRiskFrequency(String riskFrequency) {
        this.riskFrequency = riskFrequency;
    }

    public String getpValue() {
        return pValue;
    }

    public void setpValue(String pValue) {
        this.pValue = pValue;
    }


    public String getpValueAnnotation() {
        return pValueAnnotation;
    }

    public void setpValueAnnotation(String pValueAnnotation) {
        this.pValueAnnotation = pValueAnnotation;
    }

    public String getOrValue() {
        return orValue;
    }

    public void setOrValue(String orValue) {
        this.orValue = orValue;
    }

    public String getBeta() {
        return beta;
    }

    public void setBeta(String beta) {
        this.beta = beta;
    }

    public String getCi() {
        return ci;
    }

    public void setCi(String ci) {
        this.ci = ci;
    }

    public String getMappedGenes() {
        return mappedGenes;
    }

    public void setMappedGenes(String mappedGenes) {
        this.mappedGenes = mappedGenes;
    }

    public String getTraitName() {
        return traitName;
    }

    public void setTraitName(String traitName) {
        this.traitName = traitName;
    }

    public String getEfoTraits() {
        return efoTraits;
    }

    public void setEfoTraits(String efoTraits) {
        this.efoTraits = efoTraits;
    }

    public String getBgTraits() {
        return bgTraits;
    }

    public void setBgTraits(String bgTraits) {
        this.bgTraits = bgTraits;
    }

    public String getLocations() {
        return locations;
    }

    public void setLocations(String locations) {
        this.locations = locations;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getPubmedId() {
        return pubmedId;
    }

    public void setPubmedId(String pubmedId) {
        this.pubmedId = pubmedId;
    }

    public String getAccessionId() {
        return accessionId;
    }

    public void setAccessionId(String accessionId) {
        this.accessionId = accessionId;
    }


}
