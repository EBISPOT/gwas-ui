package uk.ac.ebi.spot.goci.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;
import java.util.Set;


//@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class Doc implements Serializable {

    private static final long serialVersionUID = -992880480383084441L;

    @JsonProperty("traitUri")
    protected Set<String> traitUris;
    @JsonProperty("shortForm")
    protected Set<String> shortForms;
    @JsonProperty("label")
    protected List<String> labels;
    @JsonProperty("synonym")
    protected List<String> synonym;
    @JsonProperty("efoLink")
    protected List<String> efoLink;
    @JsonProperty("parent")
    protected List<String> parent;
    @JsonProperty("description")
    protected List<String> descriptions;
    @JsonProperty("id")
    protected String id;
    @JsonProperty("resourcename")
    protected String resourcename;

    public Doc(@JsonProperty("traitUri") Set<String> traitUris,
               @JsonProperty("shortForm") Set<String> shortForms,
               @JsonProperty("label") List<String> labels,
               @JsonProperty("synonym") List<String> synonym,
               @JsonProperty("efoLink") List<String> efoLink,
               @JsonProperty("parent") List<String> parent,
               @JsonProperty("description") List<String> descriptions,
               @JsonProperty("id") String id,
               @JsonProperty("resourcename") String resourcename) {
        this.traitUris = traitUris;
        this.shortForms = shortForms;
        this.labels = labels;
        this.synonym = synonym;
        this.efoLink = efoLink;
        this.parent = parent;
        this.descriptions = descriptions;
        this.id = id;
        this.resourcename = resourcename;

    }

    public Set<String> getTraitUris() {
        return traitUris;
    }

    public void setTraitUris(Set<String> traitUris) {
        this.traitUris = traitUris;
    }

    public Set<String> getShortForms() {
        return shortForms;
    }

    public void setShortForms(Set<String> shortForms) {
        this.shortForms = shortForms;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<String> getSynonym() {
        return synonym;
    }

    public void setSynonym(List<String> synonym) {
        this.synonym = synonym;
    }

    public List<String> getEfoLink() {
        return efoLink;
    }

    public void setEfoLink(List<String> efoLink) {
        this.efoLink = efoLink;
    }

    public List<String> getParent() {
        return parent;
    }

    public void setParent(List<String> parent) {
        this.parent = parent;
    }

    public List<String> getDescriptions() {
        return descriptions;
    }

    public void setDescriptions(List<String> descriptions) {
        this.descriptions = descriptions;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResourcename() {
        return resourcename;
    }

    public void setResourcename(String resourcename) {
        this.resourcename = resourcename;
    }
}
