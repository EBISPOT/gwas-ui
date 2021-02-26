package uk.ac.ebi.spot.goci.model;

public class PublicationResult extends SearchResult {

    private String facet = "study";

    private String pumedId;

    public String getPumedId() { return pumedId; }

    public void setPumedId(String pumedId) { this.pumedId = pumedId; }
}

