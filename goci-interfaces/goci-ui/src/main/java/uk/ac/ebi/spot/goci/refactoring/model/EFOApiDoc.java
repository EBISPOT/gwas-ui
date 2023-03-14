package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EFOApiDoc {

    private static final long serialVersionUID = 5071624639554781876L;

    @JsonProperty("trait")
    private String trait;

    @JsonProperty("uri")
    private String uri;

    @JsonProperty("shortForm")
    private String shortForm;

    public EFOApiDoc(@JsonProperty("trait") String trait,
                     @JsonProperty("uri") String uri,
                     @JsonProperty("shortForm") String shortForm) {
        this.trait = trait;
        this.uri = uri;
        this.shortForm = shortForm;
    }

    public String getTrait() {
        return trait;
    }

    public void setTrait(String trait) {
        this.trait = trait;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getShortForm() {
        return shortForm;
    }

    public void setShortForm(String shortForm) {
        this.shortForm = shortForm;
    }
}
