package uk.ac.ebi.spot.goci.refactoring.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import org.joda.time.LocalDate;
import org.springframework.hateoas.ResourceSupport;
import org.springframework.hateoas.core.Relation;
import uk.ac.ebi.spot.goci.refactoring.model.EFOKeyLabel;
import uk.ac.ebi.spot.goci.refactoring.util.JsonJodaLocalDateSerializer;

import java.io.Serializable;
import java.util.List;

@EqualsAndHashCode
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"riskAllele","riskFrequency","pValueExponent","pValue","pValueAnnotation","orValue","beta",
"ci","mappedGenes","traitName","efoTraits","bgTraits","locations","author","publicationDate","accessionId","riskAlleleSep",
"chromLocation","pubmedId"})
@Relation(value = "association", collectionRelation = "associations")
public class AssociationSolrDTO extends ResourceSupport implements Serializable {

    @JsonProperty("riskAllele")
    public List<EFOKeyLabel> riskAllele;
    @JsonProperty("riskFrequency")
    private String riskFrequency;
    @JsonProperty("pValue")
    private Integer pValue;
    @JsonProperty("pValueExponent")
    private Integer pValueExponent;
    @JsonProperty("pValueAnnotation")
    private String pValueAnnotation;
    @JsonProperty("orValue")
    private String orValue;
    @JsonProperty("beta")
    private String beta;
    @JsonProperty("ci")
    private String ci;
    @JsonProperty("mappedGenes")
    private List<String> mappedGenes;
    @JsonProperty("traitName")
    private List<String> traitName;
    @JsonProperty("efoTraits")
    private List<EFOKeyLabel> efoTraits;
    @JsonProperty("bgTraits")
    private List<EFOKeyLabel> bgTraits;
    @JsonProperty("locations")
    private List<String> locations;
    @JsonProperty("author")
    private String author;
    @JsonProperty("publicationDate")
    @JsonSerialize(using = JsonJodaLocalDateSerializer.class)
    private LocalDate publicationDate;
    @JsonProperty("pubmedId")
    private String pubmedId;
    @JsonProperty("accessionId")
    private String accessionId;
    @JsonProperty("riskAlleleSep")
    private String riskAlleleSep;

    @JsonProperty("chromLocation")
    private List<String> chromLocation;

    public AssociationSolrDTO(@JsonProperty("riskAllele") List<EFOKeyLabel> riskAllele,
                              @JsonProperty("riskFrequency") String riskFrequency,
                              @JsonProperty("pValue") Integer pValue,
                              @JsonProperty("pValueExponent")  Integer pValueExponent,
                              @JsonProperty("pValueAnnotation") String pValueAnnotation,
                              @JsonProperty("orValue") String orValue,
                              @JsonProperty("beta") String beta,
                              @JsonProperty("ci")  String ci,
                              @JsonProperty("mappedGenes") List<String> mappedGenes,
                              @JsonProperty("traitName") List<String> traitName,
                              @JsonProperty("efoTraits") List<EFOKeyLabel> efoTraits,
                              @JsonProperty("bgTraits") List<EFOKeyLabel> bgTraits,
                              @JsonProperty("locations") List<String> locations,
                              @JsonProperty("author") String author,
                              @JsonProperty("publicationDate") LocalDate publicationDate,
                              @JsonProperty("pubmedId") String pubmedId,
                              @JsonProperty("accessionId") String accessionId,
                              @JsonProperty("riskAlleleSep") String riskAlleleSep,
                              @JsonProperty("chromLocation") List<String> chromLocation) {
        this.riskAllele = riskAllele;
        this.riskFrequency = riskFrequency;
        this.pValue = pValue;
        this.pValueExponent = pValueExponent;
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
        this.publicationDate = publicationDate;
        this.pubmedId = pubmedId;
        this.accessionId = accessionId;
        this.riskAlleleSep = riskAlleleSep;
        this.chromLocation = chromLocation;
    }

    public List<EFOKeyLabel> getRiskAllele() {
        return riskAllele;
    }

    public void setRiskAllele(List<EFOKeyLabel> riskAllele) {
        this.riskAllele = riskAllele;
    }

    public String getRiskFrequency() {
        return riskFrequency;
    }

    public void setRiskFrequency(String riskFrequency) {
        this.riskFrequency = riskFrequency;
    }

    public Integer getpValue() {
        return pValue;
    }

    public void setpValue(Integer pValue) {
        this.pValue = pValue;
    }

    public Integer getpValueExponent() {
        return pValueExponent;
    }

    public void setpValueExponent(Integer pValueExponent) {
        this.pValueExponent = pValueExponent;
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

    public List<String> getMappedGenes() {
        return mappedGenes;
    }

    public void setMappedGenes(List<String> mappedGenes) {
        this.mappedGenes = mappedGenes;
    }

    public List<String> getTraitName() {
        return traitName;
    }

    public void setTraitName(List<String> traitName) {
        this.traitName = traitName;
    }

    public List<EFOKeyLabel> getEfoTraits() {
        return efoTraits;
    }

    public void setEfoTraits(List<EFOKeyLabel> efoTraits) {
        this.efoTraits = efoTraits;
    }

    public List<EFOKeyLabel> getBgTraits() {
        return bgTraits;
    }

    public void setBgTraits(List<EFOKeyLabel> bgTraits) {
        this.bgTraits = bgTraits;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public LocalDate getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(LocalDate publicationDate) {
        this.publicationDate = publicationDate;
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

    public String getRiskAlleleSep() {
        return riskAlleleSep;
    }

    public void setRiskAlleleSep(String riskAlleleSep) {
        this.riskAlleleSep = riskAlleleSep;
    }


    public List<String> getChromLocation() {
        return chromLocation;
    }

    public void setChromLocation(List<String> chromLocation) {
        this.chromLocation = chromLocation;
    }
}
