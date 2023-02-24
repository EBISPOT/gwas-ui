package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import uk.ac.ebi.spot.goci.model.solr.Doc;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Set;

public class AssociationDoc extends Doc implements Serializable {

    private static final long serialVersionUID = 4225997643547695670L;

    @JsonProperty("strongestAllele")
    private List<String> strongestAllele;
    @JsonProperty("riskFrequency")
    private String riskFrequency;
    @JsonProperty("pValueMantissa")
    private Integer pValueMantissa;
    @JsonProperty("pValueExponent")
    private Integer pValueExponent;
    @JsonProperty("qualifier")
    private List<String> qualifier;
    @JsonProperty("orPerCopyNum")
    private Float orPerCopyNum;
    @JsonProperty("orDescription")
    private String orDescription;
    @JsonProperty("betaNum")
    private Float betaNum;
    @JsonProperty("betaUnit")
    private String betaUnit;
    @JsonProperty("betaDirection")
    private String betaDirection;
    @JsonProperty("range")
    private String range;
    @JsonProperty("ensemblMappedGenes")
    private List<String> ensemblMappedGenes;
    @JsonProperty("traitName")
    private List<String> traitNames;
    @JsonProperty("mappedLabel")
    private List<String> mappedLabel;
    @JsonProperty("mappedUri")
    private List<String> mappedUri;
    @JsonProperty("mappedBkgLabel")
    private List<String> mappedBkgLabel;
    @JsonProperty("mappedBkgUri")
    private List<String> mappedBkgUri;
    @JsonProperty("positionLinks")
    private List<String> positionLinks;
    @JsonProperty("author_s")
    private String author_s;
    @JsonProperty("publicationDate")
    private String publicationDate;
    @JsonProperty("pubmedId")
    private String pubmedId;
    @JsonProperty("accessionId")
    private String accessionId;
    @JsonProperty("studyId")
    private String studyId;

    @JsonProperty("rsId")
    private List<String> rsIds;

    public AssociationDoc(@JsonProperty("traitUri") Set<String> traitUris,
                          @JsonProperty("shortForm") Set<String> shortForms,
                          @JsonProperty("label") List<String> labels,
                          @JsonProperty("synonym") List<String> synonym,
                          @JsonProperty("efoLink") List<String> efoLink,
                          @JsonProperty("parent") List<String> parent,
                          @JsonProperty("description") List<String> descriptions,
                          @JsonProperty("id") String id,
                          @JsonProperty("resourcename") String resourcename,
                          @JsonProperty("strongestAllele") List<String> strongestAllele,
                          @JsonProperty("riskFrequency") String riskFrequency,
                          @JsonProperty("pValueMantissa") Integer pValueMantissa,
                          @JsonProperty("pValueExponent") Integer pValueExponent,
                          @JsonProperty("qualifier") List<String> qualifier,
                          @JsonProperty("orPerCopyNum") Float orPerCopyNum,
                          @JsonProperty("orDescription") String orDescription,
                          @JsonProperty("betaNum") Float betaNum,
                          @JsonProperty("betaUnit") String betaUnit,
                          @JsonProperty("betaDirection") String betaDirection,
                          @JsonProperty("range") String range,
                          @JsonProperty("ensemblMappedGenes") List<String> ensemblMappedGenes,
                          @JsonProperty("traitName") List<String> traitNames,
                          @JsonProperty("mappedLabel") List<String> mappedLabel,
                          @JsonProperty("mappedUri") List<String> mappedUri,
                          @JsonProperty("mappedBkgLabel") List<String> mappedBkgLabel,
                          @JsonProperty("mappedBkgUri") List<String> mappedBkgUri,
                          @JsonProperty("positionLinks") List<String> positionLinks,
                          @JsonProperty("author_s") String author_s,
                          @JsonProperty("publicationDate") String publicationDate,
                          @JsonProperty("pubmedId") String pubmedId,
                          @JsonProperty("accessionId") String accessionId,
                          @JsonProperty("studyId") String studyId,
                          @JsonProperty("rsId") List<String> rsIds) {
        super(traitUris, shortForms, labels, synonym, efoLink, parent, descriptions, id, resourcename);
        this.strongestAllele = strongestAllele;
        this.riskFrequency = riskFrequency;
        this.pValueMantissa = pValueMantissa;
        this.pValueExponent = pValueExponent;
        this.qualifier = qualifier;
        this.orPerCopyNum = orPerCopyNum;
        this.orDescription = orDescription;
        this.betaNum = betaNum;
        this.betaUnit = betaUnit;
        this.betaDirection = betaDirection;
        this.range = range;
        this.ensemblMappedGenes = ensemblMappedGenes;
        this.traitNames = traitNames;
        this.mappedLabel = mappedLabel;
        this.mappedUri = mappedUri;
        this.mappedBkgLabel = mappedBkgLabel;
        this.mappedBkgUri = mappedBkgUri;
        this.positionLinks = positionLinks;
        this.author_s = author_s;
        this.publicationDate = publicationDate;
        this.pubmedId = pubmedId;
        this.accessionId = accessionId;
        this.studyId = studyId;
        this.rsIds = rsIds;
    }

    public List<String> getStrongestAllele() {
        return strongestAllele;
    }

    public void setStrongestAllele(List<String> strongestAllele) {
        this.strongestAllele = strongestAllele;
    }

    public String getRiskFrequency() {
        return riskFrequency;
    }

    public void setRiskFrequency(String riskFrequency) {
        this.riskFrequency = riskFrequency;
    }

    public Integer getpValueMantissa() {
        return pValueMantissa;
    }

    public void setpValueMantissa(Integer pValueMantissa) {
        this.pValueMantissa = pValueMantissa;
    }

    public Integer getpValueExponent() {
        return pValueExponent;
    }

    public void setpValueExponent(Integer pValueExponent) {
        this.pValueExponent = pValueExponent;
    }

    public List<String> getQualifier() {
        return qualifier;
    }

    public void setQualifier(List<String> qualifier) {
        this.qualifier = qualifier;
    }

    public Float getOrPerCopyNum() {
        return orPerCopyNum;
    }

    public void setOrPerCopyNum(Float orPerCopyNum) {
        this.orPerCopyNum = orPerCopyNum;
    }

    public String getOrDescription() {
        return orDescription;
    }

    public void setOrDescription(String orDescription) {
        this.orDescription = orDescription;
    }

    public Float getBetaNum() {
        return betaNum;
    }

    public void setBetaNum(Float betaNum) {
        this.betaNum = betaNum;
    }

    public String getBetaUnit() {
        return betaUnit;
    }

    public void setBetaUnit(String betaUnit) {
        this.betaUnit = betaUnit;
    }

    public String getBetaDirection() {
        return betaDirection;
    }

    public void setBetaDirection(String betaDirection) {
        this.betaDirection = betaDirection;
    }

    public String getRange() {
        return range;
    }

    public void setRange(String range) {
        this.range = range;
    }

    public List<String> getEnsemblMappedGenes() {
        return ensemblMappedGenes;
    }

    public void setEnsemblMappedGenes(List<String> ensemblMappedGenes) {
        this.ensemblMappedGenes = ensemblMappedGenes;
    }

    public List<String> getTraitNames() {
        return traitNames;
    }

    public void setTraitNames(List<String> traitNames) {
        this.traitNames = traitNames;
    }

    public List<String> getMappedLabel() {
        return mappedLabel;
    }

    public void setMappedLabel(List<String> mappedLabel) {
        this.mappedLabel = mappedLabel;
    }

    public List<String> getMappedUri() {
        return mappedUri;
    }

    public void setMappedUri(List<String> mappedUri) {
        this.mappedUri = mappedUri;
    }

    public List<String> getMappedBkgLabel() {
        return mappedBkgLabel;
    }

    public void setMappedBkgLabel(List<String> mappedBkgLabel) {
        this.mappedBkgLabel = mappedBkgLabel;
    }

    public List<String> getMappedBkgUri() {
        return mappedBkgUri;
    }

    public void setMappedBkgUri(List<String> mappedBkgUri) {
        this.mappedBkgUri = mappedBkgUri;
    }

    public List<String> getPositionLinks() {
        return positionLinks;
    }

    public void setPositionLinks(List<String> positionLinks) {
        this.positionLinks = positionLinks;
    }

    public String getAuthor_s() {
        return author_s;
    }

    public void setAuthor_s(String author_s) {
        this.author_s = author_s;
    }

    public String getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(String publicationDate) {
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

    public String getStudyId() {
        return studyId;
    }

    public void setStudyId(String studyId) {
        this.studyId = studyId;
    }

    public List<String> getRsIds() {
        return rsIds;
    }

    public void setRsIds(List<String> rsIds) {
        this.rsIds = rsIds;
    }
}
