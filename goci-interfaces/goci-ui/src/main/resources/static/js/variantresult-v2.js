var EPMC = "http://www.europepmc.org/abstract/MED/";
var OLS  = "https://www.ebi.ac.uk/ols/search?q=";
var ENSVAR = "https://www.ensembl.org/Homo_sapiens/Variation/";
var DBSNP  = "http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs=";
var UCSC  = "https://genome.ucsc.edu/cgi-bin/hgTracks?hgFind.matches=";
var ENS_SHARE_LINK = 'Variant_specific_location_link/97NKbgkp09vPRy1xXwnqG1x6KGgQ8s7S';
var CONTEXT_RANGE = 500;

$(document).ready(function() {
    $('#study_panel').hide();
    $('#efotrait_panel').hide();
    $('#ld_panel').hide();
    var rsId = $('#query').text();
    setDownloadLink("rsId:" + rsId);
    if (rsId !== '') {
        // getVariantData(searchTerm);
        var slimSolrData = getSlimSolrData(rsId);
        var location = slimSolrData.position;
        var consequence = slimSolrData.consequence;
        var region = slimSolrData.region;
        var mappedGenes = slimSolrData.mappedGenes;
        if (location === 'NA:NA') {
            $("#variant-location").html('Variant does not map to the genome');
            $("._ld_graph").html('Variant does not map to the genome');
            region = '-';
            consequence = '-';
            mappedGenes = ['-']
        }
        else {
            $("#variant-location").html(location);
        }

        // Cytogenetic region
        var regionLink = $("<a></a>").attr("href", gwasProperties.contextPath + 'regions/' + region).append(region);
        $("#variant-region").html(regionLink);

        // Most severe consequence
        $("#variant-class").html(consequence);

        // Mapped genes
        if (mappedGenes.length != 0 && mappedGenes[0] != '-') {
            mappedGeneLinks = [];
            for ( gene of mappedGenes ){
                var link = gwasProperties.contextPath + 'genes/' + gene
                mappedGeneLinks.push(`<a href="${link}">${gene}</a>`);

            }
            $("#variant-mapped-genes").html(mappedGeneLinks.join(', '));
        }

        // buttons
        var chr = slimSolrData.chromosomeName[0];
        var pos = slimSolrData.position;

        var pos_start = pos - CONTEXT_RANGE;
        if (pos_start < 1) {
            pos_start = 1;
        }
        var pos_end = pos + CONTEXT_RANGE;
        var location = chr+':'+pos_start+'-'+pos_end;
        var ens_g_context = 'https://www.ensembl.org/Homo_sapiens/Location/View?db=core;r='+location+';v='+rsId+';mr='+chr+':'+pos+';share_config='+ENS_SHARE_LINK;

        // Summary panel
        $("#ensembl_button").attr('onclick',     "window.open('"+ENSVAR+"Explore?v="+rsId+"',    '_blank')");
        $("#ensembl_gc_button").attr('onclick',  "window.open('"+ens_g_context+"',               '_blank')");
        $("#ensembl_phe_button").attr('onclick', "window.open('"+ENSVAR+"Phenotype?v="+rsId+"',  '_blank')");
        $("#ensembl_gr_button").attr('onclick',  "window.open('"+ENSVAR+"Mappings?v="+rsId+"',   '_blank')");
        $("#ensembl_pg_button").attr('onclick',  "window.open('"+ENSVAR+"Population?v="+rsId+"', '_blank')");
        $("#ensembl_cit_button").attr('onclick', "window.open('"+ENSVAR+"Citations?v="+rsId+"',  '_blank')");
        $("#dbsnp_button").attr('onclick',       "window.open('"+DBSNP+rsId+"',                  '_blank')");
        $("#ucsc_button").attr('onclick',        "window.open('"+UCSC+rsId+"',                   '_blank')");
    }
    getVariantInfoFromEnsembl(rsId);
    displayLDPlot();

    $.getJSON(gwasProperties.contextPath+'api/search/stats')
        .done(function(data) {
            setGenomeStats(data);
        }).fail(function () {
        $('#genome-build-stats').text("GWAS Catalog data is currently mapped to unknown - unable to get data");
    });
});
//
function setGenomeStats(data) {
    try {
        $('#genome-build-stats').text("GWAS Catalog data is currently mapped to " +
            "Genome Assembly "+data.genebuild+" and dbSNP Build"+data.dbsnpbuild);
    }
    catch (ex) {
        $('#genome-build-stats').text("GWAS Catalog data is currently mapped to unknown - unable to process data");
    }
}

function getSlimSolrData(rsID) {
    var returnData = {
        'position' : '-',
        'region': '-',
        'consequence' : '-',
        'mappedGenes' : [],
        chromosomeName: '-'
    }
    $.ajax({
        url: '../api/search',
        data : {'q': "rsID:\"" + rsID + '\" AND resourcename:variant'},
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data){
            // Parse returned JSON;
            var doc = data.response.docs[0];
            returnData.position = doc.description.split("|")[0];
            returnData.region = doc.region;
            returnData.consequence = doc.consequence;
            returnData.mappedGenes = doc.description.split("|")[3].split(",")
            returnData.chromosomeName = doc.chromosomeName;
        }
    });
    return returnData;
}

function getVariantInfoFromEnsembl(rsId) {
    $.getJSON('https://rest.ensembl.org/variation/human/'+rsId+'?content-type=application/json')
        .done(function(data) {
            processVariantInfoFromEnsembl(rsId,data);
        })
        .fail(function() {
        });
}
//
function processVariantInfoFromEnsembl(rsId, data) {
    if (!data.error) {
        var var_id  = data.name;
        var alleles = 'NA';
        var strand  = '';
        $.each(data.mappings, function(index, mapping) {
            if (mapping.seq_region_name.match(/\w{1,2}/)) {
                alleles = mapping.allele_string;
                strand  = (mapping.strand == 1) ? 'forward' : 'reverse';
                strand  = '<span style="padding-left:5px"><small>('+strand+' strand)</small></span>';
                alleles += strand;
            }
        });
        var maf = (data.MAF) ? data.MAF : 'NA';
        var ma  = (data.minor_allele) ? data.minor_allele : 'NA';

        $("#variant-alleles").html(alleles);
        $("#variant-strand").html(strand);
        $("#minor-allele").html(ma);
        $("#minor-allele-freq").html(maf);

        if (var_id != rsId) {
            var var_link = setExternalLink(DBSNP+var_id,var_id);
            $("#merged-variant-label").show();
            $("#merged-variant").html(var_link);
        }
    }
}
