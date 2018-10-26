package uk.ac.ebi.spot.goci.model;

public class GeneResult extends SearchResult {

    private String facet = "gene";

    private String geneId;

    public String getGeneId() { return geneId; }

    public void setGeneId(String geneId) { this.geneId = geneId; }
}
