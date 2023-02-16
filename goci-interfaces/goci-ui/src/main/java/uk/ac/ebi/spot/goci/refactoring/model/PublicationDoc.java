package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uk.ac.ebi.spot.goci.model.solr.Doc;

import java.io.Serializable;
import java.util.List;
import java.util.Set;


@JsonIgnoreProperties(ignoreUnknown = true)
public class PublicationDoc extends Doc implements Serializable  {

    private static final long serialVersionUID = -1692280665315726098L;
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

    public PublicationDoc(@JsonProperty("traitUri") Set<String> traitUris,
                          @JsonProperty("shortForm") Set<String> shortForms,
                          @JsonProperty("label") List<String> labels,
                          @JsonProperty("synonym") List<String> synonym,
                          @JsonProperty("efoLink") List<String> efoLink,
                          @JsonProperty("parent") List<String> parent,
                          @JsonProperty("description") List<String> descriptions,
                          @JsonProperty("id") String id,
                          @JsonProperty("resourcename") String resourcename,
                          String pubmedId,
                          String title,
                          String authorS,
                          String authorAsciiS,
                          String publication,
                          String publicationDate,
                          String accessionId,
                          Integer associationCount,
                          String traitNameS,
                          List<String> mappedLabel,
                          List<String> mappedUri) {
        super(traitUris, shortForms, labels, synonym, efoLink, parent, descriptions, id, resourcename);
        this.pubmedId = pubmedId;
        this.title = title;
        this.authorS = authorS;
        this.authorAsciiS = authorAsciiS;
        this.publication = publication;
        this.publicationDate = publicationDate;
        this.accessionId = accessionId;
        this.associationCount = associationCount;
        this.traitNameS = traitNameS;
        this.mappedLabel = mappedLabel;
        this.mappedUri = mappedUri;
    }

    public String getPubmedId() {
        return pubmedId;
    }

    public void setPubmedId(String pubmedId) {
        this.pubmedId = pubmedId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthorS() {
        return authorS;
    }

    public void setAuthorS(String authorS) {
        this.authorS = authorS;
    }

    public String getAuthorAsciiS() {
        return authorAsciiS;
    }

    public void setAuthorAsciiS(String authorAsciiS) {
        this.authorAsciiS = authorAsciiS;
    }

    public String getPublication() {
        return publication;
    }

    public void setPublication(String publication) {
        this.publication = publication;
    }

    public String getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(String publicationDate) {
        this.publicationDate = publicationDate;
    }

    public String getAccessionId() {
        return accessionId;
    }

    public void setAccessionId(String accessionId) {
        this.accessionId = accessionId;
    }

    public Integer getAssociationCount() {
        return associationCount;
    }

    public void setAssociationCount(Integer associationCount) {
        this.associationCount = associationCount;
    }

    public String getTraitNameS() {
        return traitNameS;
    }

    public void setTraitNameS(String traitNameS) {
        this.traitNameS = traitNameS;
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
}
