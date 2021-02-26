package uk.ac.ebi.spot.goci.model;

public class SnpResult extends SearchResult {
    private String facet = "association";

    private String rsId;

    public String getRsId() { return rsId; }

    public void setRsId(String rsId) {
        this.rsId = rsId;
    }



}
