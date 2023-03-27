package uk.ac.ebi.spot.goci.ui.constants;

public class SearchUIConstants {

    public static final String API_V1 = "/v1";

    public static final String API_V2 = "/api/v2";

    public static final String SEARCH = "/search";

    public static final String VARIANTS = "/variants";

    public static final String REGIONS = "/regions";

    public static final String EFOTRAITS = "/efotraits";

    public static final String GENES = "/genes";

    public static final String SUMMARY_STATISTICS = "/summaryStatistics";

    public static final String INCLUDE_CHILD_TRAITS = "includeChildTraits";

    public static final String INCLUDE_BG_TRAITS = "includeBgTraits";
    public static final String PUBLICATIONS = "/publications";

    public static final String SEARCH_STUDY = "/study";

    public static final String LINKS_PARENT = "parent";
    public static final String GENE_MOUSE_ORTHOLOG_URI = "/impc-mouse-orthologs";
    public static final String PARAM_OPERATION = "operation";
    public static final String PURGE = "purge";

    public static final String FACET_STUDY = "study";
    public static final String FACET_ASSOCIATION = "association";

    public static final String ASSOCIATION_SOLR_FIELDS = "strongestAllele, riskFrequency, pValueMantissa, pValueExponent, qualifier, "
            + "orPerCopyNum, orDescription, betaNum, betaUnit, betaDirection, range, ensemblMappedGenes, traitName, "
            + "efoLink, mappedLabel, mappedUri, mappedBkgLabel, mappedBkgUri, positionLinks, author_s, publicationDate, pubmedId, "
            + "accessionId";

    public static final String SUMSTATS_SOLR_FIELDS = "accessionId,author_s,authorAscii_s,pubmedId,title,publication,"
            + "publicationDate,mappedLabel,mappedUri,traitName_s,associationCount,agreedToCc0,fullPvalueSet";

    public static final String LOCUS_ZOOM_SOLR_FIELDS = "chromLocation, pValueExponent, pValueMantissa, strongestAllele," +
            "ensemblMappedGenes,traitName_s,mappedLabel,accessionId,pubmedId,author_s,publicationDate";

    public static final String ACCESSION_ID = "accessionId";


    public static final String MAX_STUDY_COUNT = "50000";

    public static final String EFO_FIELDS = "traitName, mappedUri, mappedLabel, rsId, shortForm";


}