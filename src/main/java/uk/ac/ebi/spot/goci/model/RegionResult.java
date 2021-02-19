package uk.ac.ebi.spot.goci.model;

public class RegionResult extends SearchResult {

    private String facet = "region";

    private String regionId;

    public String getRegionId() { return regionId; }

    public void setRegionId(String regionId) { this.regionId = regionId; }
}
