/** DRY. From Xin original code. We must refactor all these 'action'result.js in a common way! */


showLoadingOverLay('#summary-panel-loading');
$(document).ready(() => {
    $('#study_panel').hide();
    $('#efotrait_panel').hide();
    // First time loading the page:
    updatePage(true);
});

/**
 * The elem to search is defined by the url, as a main entry of the page. It is stored in the div id
 * in the date attribute of the <global_elem_info_tag_id>`
 * @return Eg. String efoID - 'EFO_0000400'
 * @example getElemToSearch()
 */

getTextToSearch = function(divId){
    return $(divId).text();
}

updatePage = function(initLoad=false) {
    
    //start spinner. The spinner will be stopped whenever the data is ready, thus closed by the corresponding data loading function.
    if(initLoad){
        // The info panel is updated only in the initial loading
        showLoadingOverLay('#summary-panel-loading');
    }
    getSlimSolrData(getTextToSearch('#query'))
}

// Query slim solr to return rsIDs that are mapped to a given gene:
// WARNING: syncronous call!!
function getSlimSolrData(geneName) {
    var returnData = {};
    $.ajax({
        url: '../api/search',
        data : {'q': "title: \"" + geneName + '\" AND resourcename:gene'},
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data){
            // Parse returned JSON;
            returnData = data.response.docs[0];
            if (data.response.docs.length === 0 ) {
                $('#lower_container').html("<h2>The Gene name <em>"+geneName+"</em> cannot be found in the GWAS Catalog database</h2>");
            }
            else {
                generateGeneInformationTable(returnData); // gene name is now added to the process solr data function.
                //downloads link : utils-helper.js
                setDownloadLink('ensemblMappedGenes:' + getTextToSearch('#query'));
            }
        },
        error: function(request) {
            returnData['error'] = request.responseText
        }

    });

    return returnData;
}

// Helper function to retrieve Ensembl data through the REST API
// SYNC!!
function getEnsemblREST( URL ) {
    var result = null;
    $.ajax({
        url: URL,
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data) {
            result = data;
        },
        error: function(request){
            console.log("[Error] Retrieving data from Ensembl failed. URL: " + URL);
            console.log(request.responseText)
            result = [];
        }
    });
    return result;
}

function getImpcDetails(gene) {
    var geneUrl = gwasProperties.IMPC_ID_URI +gene;
    $.ajax({
        url: geneUrl,
        type: 'get',
        dataType: 'text',
        async: false,
        success: function(data) {
            result = data;
        },
        error: function(request){
            console.log("[Error] Retrieving data from Impc Url failed. URL: " + geneUrl);
            console.log(request.responseText)
            result = [];
        }
    });
    return result;

}

/**
 * This function fills up the gene table.
 * Input:
 *    Gene name      -  searchTerm
 *    Study document -  data_study.docs
 *
 * Behaviour:
 *    Fills up gene information table
 *    1) Extracts data from Ensembl based on gene name.
 *    2) Extracts cross reference data from Ensembl.
 *    3) Extracts reported traits from study documents.
 */
function generateGeneInformationTable(slimData) {

    // adding gene data to html:
    $("#geneSymbol").html(slimData.title);

    // Parsing description related fields:
    var descriptionFields = slimData.description.split("|");
    $("#description").html(descriptionFields[0])
    $("#location").html(descriptionFields[1]);
    // Hide the Button while loading
    $("#impc_button").hide();
    // Adding cytogenic region:
    var regionLink = $("<a></a>").attr("href", gwasProperties.contextPath + 'regions/' + descriptionFields[2]).append(descriptionFields[2]);
    $("#cytogenicRegion").html(regionLink);

    $("#biotype").html(descriptionFields[3]);

    // Extracting cross-references:
    var xrefQueryURL = gwasProperties.EnsemblRestBaseURL + '/xrefs/id/' + slimData.ensemblID + '?content-type=application/json'
    var xrefData = getEnsemblREST(xrefQueryURL);
    var entrezID = "NA";
    var OMIMID = "NA";
    var impcId = getImpcDetails(slimData.title);
    //console.log('impcId->'+impcId);

    for ( xref of xrefData ){
        if ( xref.dbname == "EntrezGene" ){
            entrezID = xref.primary_id
        }
        if ( xref.dbname == 'MIM_GENE' ){
            OMIMID = xref.primary_id
        }
    }

    // Adding automatic cross references pointing to Ensembl:
    $("#ensembl_button").attr('onclick', "window.open('"+gwasProperties.EnsemblURL+"Gene/Summary?db=core;g="+slimData.ensemblID +"',    '_blank')");
    $("#ensembl_phenotype_button").attr('onclick', "window.open('"+gwasProperties.EnsemblURL+"Gene/Phenotype?db=core;g="+slimData.ensemblID+"',    '_blank')");
    $("#ensembl_pathway_button").attr('onclick', "window.open('"+gwasProperties.EnsemblURL+"Gene/Pathway?db=core;g="+slimData.ensemblID+"',    '_blank')");
    $("#ensembl_regulation_button").attr('onclick', "window.open('"+gwasProperties.EnsemblURL+"Gene/Regulation?db=core;g="+slimData.ensemblID+"',    '_blank')");
    $("#ensembl_expression_button").attr('onclick', "window.open('"+gwasProperties.EnsemblURL+"Gene/ExpressionAtlas?db=core;g="+slimData.ensemblID+"',    '_blank')");

    // Adding automatic cross reference pointing to Open targets:
    $("#opentargets_button").attr('onclick', "window.open('"+gwasProperties.OpenTargetsURL+ slimData.ensemblID+"',    '_blank')");

    // Looping through the cross references and extract entrez id:
    if ( entrezID != "NA" ){
        $("#entrez_button").attr('onclick', "window.open('"+gwasProperties.EntrezURL+ entrezID + "',    '_blank')");
    }
    // Looping through the cross references and extract OMIM id:
    if ( OMIMID != "NA" ){
        $("#OMIM_button").attr('onclick', "window.open('"+gwasProperties.OMIMURL+ OMIMID + "',    '_blank')");
    }

    // Show button if MGIdentifier exists
    if (impcId != "NA" ) {
        $("#impc_button").show();
        $("#impc_button").attr('onclick', "window.open('"+gwasProperties.IMPC_URI+ impcId + "',    '_blank')");
    }

    // OK, loading is complete:
    hideLoadingOverLay('#summary-panel-loading');
}

// Create a hidden list of items - Used when we have to display a more or less long list of information
function longContentList (content_id, list, type) {

    var content_text = $('<span></span>');
    content_text.css('padding-right', '8px');
    content_text.html('<b>'+list.length+'</b> '+type);

    var content_div  = $('<div></div>');
    content_div.attr('id', content_id);
    content_div.addClass('collapse');

    var content_list = $('<ul></ul>');
    content_list.css('padding-left', '25px');
    content_list.css('padding-top', '6px');
    $.each(list, function(index, item) {
        content_list.append(newItem(item));
    });
    content_div.append(content_list);

    var container = $('<div></div>');
    container.append(content_text);
    container.append(showHideDiv(content_id));
    container.append(content_div);

    return container;
}

// Create a button to show/hide content
function showHideDiv(div_id) {
    var div_button = $("<button></button>");
    div_button.attr('title', 'Click to show/hide more information');
    div_button.attr('id', 'button-'+div_id);
    div_button.attr('onclick', 'toggleDiv("'+div_id+'")');
    div_button.addClass("btn btn-default btn-xs btn-study");
    div_button.html('<span class="glyphicon glyphicon-plus tgb"></span>');

    return div_button;
}
