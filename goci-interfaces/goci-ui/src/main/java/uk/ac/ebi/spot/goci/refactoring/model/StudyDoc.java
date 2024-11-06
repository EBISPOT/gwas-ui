package uk.ac.ebi.spot.goci.refactoring.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import uk.ac.ebi.spot.goci.model.solr.Doc;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Set;


@JsonIgnoreProperties(ignoreUnknown = true)
public class StudyDoc extends Doc implements Serializable {

    private static final long serialVersionUID = 5382415180633939692L;

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
    @JsonProperty("catalogPublishDate")
    private String catalogPublishDate;
    @JsonProperty("publicationLink")
    private List<String> publicationLink;
    @JsonProperty("platform")
    private String platform;
    @JsonProperty("accessionId")
    private String accessionId;
    @JsonProperty("fullPvalueSet")
    private Boolean fullPvalueSet;
    @JsonProperty("initialSampleDescription")
    private String initialSampleDescription;
    @JsonProperty("replicateSampleDescription")
    private String replicateSampleDescription;
    @JsonProperty("authorsList")
    private List<String> authorsList;
    @JsonProperty("ancestralGroups")
    private List<String> ancestralGroups;
    @JsonProperty("countriesOfRecruitment")
    private List<String> countriesOfRecruitment;
    @JsonProperty("numberOfIndividuals")
    private List<Integer> numberOfIndividuals;
    @JsonProperty("ancestryLinks")
    private List<String> ancestryLinks;
    @JsonProperty("genotypingTechnologies")
    private List<String> genotypingTechnologies;
    @JsonProperty("associationCount")
    private Integer associationCount;
    @JsonProperty("association_rsId")
    private List<String> association_rsId;
    @JsonProperty("traitName")
    private List<String> traitName;
    @JsonProperty("traitName_s")
    private String traitName_s;
    @JsonProperty("mappedLabel")
    private List<String> mappedLabel;
    @JsonProperty("mappedUri")
    private List<String> mappedUri;
    @JsonProperty("mappedBkgUri")
    private List<String> mappedBkgUris;
    @JsonProperty("mappedBkgLabel")
    private List<String> mappedBkgLabels;

    @JsonProperty("additionalAncestryDescription")
    private List<String> additionalAncestryDescription;
    @JsonProperty("association_strongestAllele")
    private List<String> strongestAlleles;
    @JsonProperty("association_context")
    private List<String> contexts;
    @JsonProperty("association_regions")
    private List<String> regions;
    @JsonProperty("association_ensemblMappedGenes")
    private List<String> ensemblMappedGenes;
    @JsonProperty("association_ensemblMappedGeneLinks")
    private List<String> ensemblMappedGeneLinks;
    @JsonProperty("association_reportedGene")
    private List<String> reportedGenes;
    @JsonProperty("association_reportedGeneLinks")
    private List<String> reportedGeneLinks;
    @JsonProperty("association_chromosomeName")
    private List<String> chromosomeNames;
    @JsonProperty("chromosomePositions")
    private List<String> chromosomePositions;
    @JsonProperty("association_positionLinks")
    private List<String> positionLinks;

    @JsonProperty("agreedToCc0")
    private Boolean agreedToCc;

    @JsonProperty("numberOfIndividualsInitial")
    private Integer numberOfIndividualsInitial;

    @JsonProperty("numberOfIndividualReplication")
    private Integer numberOfIndividualReplication;

    @JsonProperty("discovery-sample-ancestry")
    private List<String> discoverySampleAncestry;

    @JsonProperty("replication-sample-ancestry")
    private List<String> replicationSampleAncestry;


    @JsonProperty("gxe")
    private Boolean gxe;

    public StudyDoc(@JsonProperty("traitUri") Set<String> traitUris,
                    @JsonProperty("shortForm") Set<String> shortForms,
                    @JsonProperty("label") List<String> labels,
                    @JsonProperty("synonym") List<String> synonym,
                    @JsonProperty("efoLink") List<String> efoLink,
                    @JsonProperty("parent") List<String> parent,
                    @JsonProperty("description") List<String> descriptions,
                    @JsonProperty("id") String id,
                    @JsonProperty("resourcename") String resourcename,
                    @JsonProperty("pubmedId") String pubmedId,
                    @JsonProperty("title") String title,
                    @JsonProperty("author_s") String authorS,
                    @JsonProperty("authorAscii_s") String authorAsciiS,
                    @JsonProperty("publication") String publication,
                    @JsonProperty("publicationDate") String publicationDate,
                    @JsonProperty("catalogPublishDate") String catalogPublishDate,
                    @JsonProperty("publicationLink") List<String> publicationLink,
                    @JsonProperty("platform") String platform,
                    @JsonProperty("accessionId") String accessionId,
                    @JsonProperty("fullPvalueSet") Boolean fullPvalueSet,
                    @JsonProperty("initialSampleDescription") String initialSampleDescription,
                    @JsonProperty("replicateSampleDescription") String replicateSampleDescription,
                    @JsonProperty("authorsList") List<String> authorsList,
                    @JsonProperty("ancestralGroups") List<String> ancestralGroups,
                    @JsonProperty("countriesOfRecruitment") List<String> countriesOfRecruitment,
                    @JsonProperty("numberOfIndividuals") List<Integer> numberOfIndividuals,
                    @JsonProperty("ancestryLinks") List<String> ancestryLinks,
                    @JsonProperty("genotypingTechnologies") List<String> genotypingTechnologies,
                    @JsonProperty("associationCount") Integer associationCount,
                    @JsonProperty("association_rsId") List<String> association_rsId,
                    @JsonProperty("traitName") List<String> traitName,
                    @JsonProperty("traitName_s") String traitName_s,
                    @JsonProperty("mappedLabel") List<String> mappedLabel,
                    @JsonProperty("mappedUri") List<String> mappedUri,
                    @JsonProperty("mappedBkgUri") List<String> mappedBkgUris,
                    @JsonProperty("mappedBkgLabel") List<String> mappedBkgLabels,
                    @JsonProperty("additionalAncestryDescription") List<String> additionalAncestryDescription,
                    @JsonProperty("association_strongestAllele") List<String> strongestAlleles,
                    @JsonProperty("association_context") List<String> contexts,
                    @JsonProperty("association_regions") List<String> regions,
                    @JsonProperty("association_ensemblMappedGenes") List<String> ensemblMappedGenes,
                    @JsonProperty("association_ensemblMappedGeneLinks") List<String> ensemblMappedGeneLinks,
                    @JsonProperty("association_reportedGene") List<String> reportedGenes,
                    @JsonProperty("association_reportedGeneLinks") List<String> reportedGeneLinks,
                    @JsonProperty("association_chromosomeName") List<String> chromosomeNames,
                    @JsonProperty("chromosomePositions") List<String> chromosomePositions,
                    @JsonProperty("association_positionLinks") List<String> positionLinks,
                    @JsonProperty("agreedToCc0") Boolean agreedToCc,
                    @JsonProperty("numberOfIndividualsInitial") Integer numberOfIndividualsInitial,
                    @JsonProperty("numberOfIndividualReplication") Integer numberOfIndividualReplication,
                    @JsonProperty("discovery-sample-ancestry") List<String> discoverySampleAncestry,
                    @JsonProperty("gxe") Boolean gxe) {
        //super();
        super(traitUris, shortForms, labels, synonym, efoLink, parent, descriptions, id, resourcename);
        this.pubmedId = pubmedId;
        this.title = title;
        this.authorS = authorS;
        this.authorAsciiS = authorAsciiS;
        this.publication = publication;
        this.publicationDate = publicationDate;
        this.catalogPublishDate = catalogPublishDate;
        this.publicationLink = publicationLink;
        this.platform = platform;
        this.accessionId = accessionId;
        this.fullPvalueSet = fullPvalueSet;
        this.initialSampleDescription = initialSampleDescription;
        this.replicateSampleDescription = replicateSampleDescription;
        this.authorsList = authorsList;
        this.ancestralGroups = ancestralGroups;
        this.countriesOfRecruitment = countriesOfRecruitment;
        this.numberOfIndividuals = numberOfIndividuals;
        this.ancestryLinks = ancestryLinks;
        this.genotypingTechnologies = genotypingTechnologies;
        this.associationCount = associationCount;
        this.association_rsId = association_rsId;
        this.traitName = traitName;
        this.traitName_s = traitName_s;
        this.mappedLabel = mappedLabel;
        this.mappedUri = mappedUri;
        this.mappedBkgUris = mappedBkgUris;
        this.mappedBkgLabels = mappedBkgLabels;
        this.additionalAncestryDescription = additionalAncestryDescription;
        this.strongestAlleles = strongestAlleles;
        this.contexts = contexts;
        this.regions = regions;
        this.ensemblMappedGenes = ensemblMappedGenes;
        this.ensemblMappedGeneLinks = ensemblMappedGeneLinks;
        this.reportedGenes = reportedGenes;
        this.reportedGeneLinks = reportedGeneLinks;
        this.chromosomeNames = chromosomeNames;
        this.chromosomePositions = chromosomePositions;
        this.positionLinks = positionLinks;
        this.agreedToCc = agreedToCc;
        this.numberOfIndividualsInitial = numberOfIndividualsInitial;
        this.numberOfIndividualReplication = numberOfIndividualReplication;
        this.discoverySampleAncestry = discoverySampleAncestry;
        this.replicationSampleAncestry = replicationSampleAncestry;
        this.gxe = gxe;
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

    public String getCatalogPublishDate() {
        return catalogPublishDate;
    }

    public void setCatalogPublishDate(String catalogPublishDate) {
        this.catalogPublishDate = catalogPublishDate;
    }

    public List<String> getPublicationLink() {
        return publicationLink;
    }

    public void setPublicationLink(List<String> publicationLink) {
        this.publicationLink = publicationLink;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getAccessionId() {
        return accessionId;
    }

    public void setAccessionId(String accessionId) {
        this.accessionId = accessionId;
    }

    public Boolean getFullPvalueSet() {
        return fullPvalueSet;
    }

    public void setFullPvalueSet(Boolean fullPvalueSet) {
        this.fullPvalueSet = fullPvalueSet;
    }

    public String getInitialSampleDescription() {
        return initialSampleDescription;
    }

    public void setInitialSampleDescription(String initialSampleDescription) {
        this.initialSampleDescription = initialSampleDescription;
    }

    public String getReplicateSampleDescription() {
        return replicateSampleDescription;
    }

    public void setReplicateSampleDescription(String replicateSampleDescription) {
        this.replicateSampleDescription = replicateSampleDescription;
    }

    public List<String> getAuthorsList() {
        return authorsList;
    }

    public void setAuthorsList(List<String> authorsList) {
        this.authorsList = authorsList;
    }

    public List<String> getAncestralGroups() {
        return ancestralGroups;
    }

    public void setAncestralGroups(List<String> ancestralGroups) {
        this.ancestralGroups = ancestralGroups;
    }

    public List<String> getCountriesOfRecruitment() {
        return countriesOfRecruitment;
    }

    public void setCountriesOfRecruitment(List<String> countriesOfRecruitment) {
        this.countriesOfRecruitment = countriesOfRecruitment;
    }

    public List<Integer> getNumberOfIndividuals() {
        return numberOfIndividuals;
    }

    public void setNumberOfIndividuals(List<Integer> numberOfIndividuals) {
        this.numberOfIndividuals = numberOfIndividuals;
    }

    public List<String> getAncestryLinks() {
        return ancestryLinks;
    }

    public void setAncestryLinks(List<String> ancestryLinks) {
        this.ancestryLinks = ancestryLinks;
    }

    public List<String> getGenotypingTechnologies() {
        return genotypingTechnologies;
    }

    public void setGenotypingTechnologies(List<String> genotypingTechnologies) {
        this.genotypingTechnologies = genotypingTechnologies;
    }

    public Integer getAssociationCount() {
        return associationCount;
    }

    public void setAssociationCount(Integer associationCount) {
        this.associationCount = associationCount;
    }

    public List<String> getAssociation_rsId() {
        return association_rsId;
    }

    public void setAssociation_rsId(List<String> association_rsId) {
        this.association_rsId = association_rsId;
    }

    public List<String> getTraitName() {
        return traitName;
    }

    public void setTraitName(List<String> traitName) {
        this.traitName = traitName;
    }

    public String getTraitName_s() {
        return traitName_s;
    }

    public void setTraitName_s(String traitName_s) {
        this.traitName_s = traitName_s;
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

    public List<String> getMappedBkgUris() {
        return mappedBkgUris;
    }

    public void setMappedBkgUris(List<String> mappedBkgUris) {
        this.mappedBkgUris = mappedBkgUris;
    }

    public List<String> getMappedBkgLabels() {
        return mappedBkgLabels;
    }

    public void setMappedBkgLabels(List<String> mappedBkgLabels) {
        this.mappedBkgLabels = mappedBkgLabels;
    }

    public List<String> getAdditionalAncestryDescription() {
        return additionalAncestryDescription;
    }

    public void setAdditionalAncestryDescription(List<String> additionalAncestryDescription) {
        this.additionalAncestryDescription = additionalAncestryDescription;
    }

    public List<String> getStrongestAlleles() {
        return strongestAlleles;
    }

    public void setStrongestAlleles(List<String> strongestAlleles) {
        this.strongestAlleles = strongestAlleles;
    }

    public List<String> getContexts() {
        return contexts;
    }

    public void setContexts(List<String> contexts) {
        this.contexts = contexts;
    }

    public List<String> getRegions() {
        return regions;
    }

    public void setRegions(List<String> regions) {
        this.regions = regions;
    }

    public List<String> getEnsemblMappedGenes() {
        return ensemblMappedGenes;
    }

    public void setEnsemblMappedGenes(List<String> ensemblMappedGenes) {
        this.ensemblMappedGenes = ensemblMappedGenes;
    }

    public List<String> getEnsemblMappedGeneLinks() {
        return ensemblMappedGeneLinks;
    }

    public void setEnsemblMappedGeneLinks(List<String> ensemblMappedGeneLinks) {
        this.ensemblMappedGeneLinks = ensemblMappedGeneLinks;
    }

    public List<String> getReportedGenes() {
        return reportedGenes;
    }

    public void setReportedGenes(List<String> reportedGenes) {
        this.reportedGenes = reportedGenes;
    }

    public List<String> getReportedGeneLinks() {
        return reportedGeneLinks;
    }

    public void setReportedGeneLinks(List<String> reportedGeneLinks) {
        this.reportedGeneLinks = reportedGeneLinks;
    }

    public List<String> getChromosomeNames() {
        return chromosomeNames;
    }

    public void setChromosomeNames(List<String> chromosomeNames) {
        this.chromosomeNames = chromosomeNames;
    }

    public List<String> getChromosomePositions() {
        return chromosomePositions;
    }

    public void setChromosomePositions(List<String> chromosomePositions) {
        this.chromosomePositions = chromosomePositions;
    }

    public List<String> getPositionLinks() {
        return positionLinks;
    }

    public void setPositionLinks(List<String> positionLinks) {
        this.positionLinks = positionLinks;
    }

    public Boolean getAgreedToCc() {
        return agreedToCc;
    }

    public void setAgreedToCc(Boolean agreedToCc) {
        this.agreedToCc = agreedToCc;
    }


    public Integer getNumberOfIndividualsInitial() {
        return numberOfIndividualsInitial;
    }

    public void setNumberOfIndividualsInitial(Integer numberOfIndividualsInitial) {
        this.numberOfIndividualsInitial = numberOfIndividualsInitial;
    }

    public Integer getNumberOfIndividualReplication() {
        return numberOfIndividualReplication;
    }

    public void setNumberOfIndividualReplication(Integer numberOfIndividualReplication) {
        this.numberOfIndividualReplication = numberOfIndividualReplication;
    }

    public List<String> getDiscoverySampleAncestry() {
        return discoverySampleAncestry;
    }

    public void setDiscoverySampleAncestry(List<String> discoverySampleAncestry) {
        this.discoverySampleAncestry = discoverySampleAncestry;
    }

    public List<String> getReplicationSampleAncestry() {
        return replicationSampleAncestry;
    }

    public void setReplicationSampleAncestry(List<String> replicationSampleAncestry) {
        this.replicationSampleAncestry = replicationSampleAncestry;
    }

    public Boolean getGxe() {
        return gxe;
    }

    public void setGxe(Boolean gxe) {
        this.gxe = gxe;
    }
}
