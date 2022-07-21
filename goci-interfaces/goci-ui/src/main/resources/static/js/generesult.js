/** DRY. From Xin original code. We must refactor all these 'action'result.js in a common way! */



$(document).ready(() => {
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
    showLoadingOverLay('#study-table-loading');
    showLoadingOverLay('#association-table-loading');
    showLoadingOverLay('#efotrait-table-loading');

    var main = getTextToSearch('#query');
    
    //******************************
    // when solr data ready, process solr data and update badges in the selection cart
    //******************************
    var solrPromise = getDataSolr(main, initLoad);
    
}


/**
 * Make solr query.
 * @param {String} mainEFO
 * @param {[]String} additionalEFO
 * @param {[]String} descendants
 * @param {Boolean} initLoad
 * @returns {Promise}
 */
function getDataSolr(main, initLoad=false) {
    // initLoad will be pass to processEfotraitData, controlling whether to upload the triat information(initload)
    // or just reload the tables(adding another efo term)
    
    var searchQuery = main;

    // Step 1: returning list of variants mapped to the queried gene:
    var slimData = getSlimSolrData(searchQuery)
    // var mappedRsIDs = slimData.rsIDs

    return promisePost( gwasProperties.contextPath + 'api/search/advancefilter',
        {
            'q': "ensemblMappedGenes: \""+searchQuery + "\" OR association_ensemblMappedGenes: \""+searchQuery + "\"",
            'max': 99999,
            'group.limit': 99999,
            'group.field': 'resourcename',
            'facet.field': 'resourcename',
            'hl.fl': 'shortForm,efoLink',
            'hl.snippets': 100,
            'fl' : global_fl == undefined ? '*':global_fl,
            // 'fq' : global_fq == undefined ? '*:*':global_fq,
            'raw' : global_raw == undefined ? '' : global_raw,
        },'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
        // Check if Solr returns some results
        if (data.grouped.resourcename.groups.length == 0 ) {
            $('#lower_container').html("<h2>The Gene name <em>"+searchQuery+"</em> cannot be found in the GWAS Catalog database</h2>");
        }
        else {
            processSolrData(data, initLoad, searchQuery,slimData); // gene name is now added to the process solr data function.
            //downloads link : utils-helper.js
            setDownloadLink('ensemblMappedGenes:' + main);
        }
        return data;
    }).catch(function(err) {
        throw(err);
    })
    
}

/**
 * Parse the Solr results and display the data on the HTML page
 * @param {{}} data - solr result
 * @param {Boolean} initLoad
 */

/**
 * Parse the Solr results and display the data on the HTML page
 * @param {{}} data - solr result
 * @param {Boolean} initLoad
 */
function processSolrData(data, initLoad=false, searchTerm, slimData) {
    var isInCatalog=true;
    
    data_association = [];
    data_study = [];
    data_association.docs = [];
    data_study.docs = [];
    
    if (data.grouped.resourcename.matches == 0) {
        isInCatalog = false;
    }
    //split the solr search by groups
    //data_study, data_association
    data_facet = data.facet_counts.facet_fields.resourcename;
    data_highlighting = data.highlighting;
    //TODO not repeat yourself!!!!
    $.each(data.grouped.resourcename.groups, (index, group) => {
        switch (group.groupValue) {
            case "efotrait":
                data_efo = group.doclist;
                break;
            case "study":
                data_study = group.doclist;
                break;
            case "association":
                data_association = group.doclist;
                break;
                //not sure we need this!
            case "diseasetrait":
                data_diseasetrait = group.doclist;
                break;
            default:
            }
        });
    
    //remove association that annotated with efos which are not in the list
    var remove = Promise.resolve();

    remove.then(()=>{
        //If no solr return,greate a fake empyt array so tables/plot are empty
        if(!isInCatalog) {
        data_association.docs = []
        data_study.docs = []
    }

    var PAGE_TYPE = "gene";
    
    // Adding data tables:
    displayDatatableTraits(data_association.docs, searchTerm);
    displayDatatableAssociations(data_association.docs);
    displayDatatableStudies(data_study.docs, PAGE_TYPE);

    // Generate info panel:
    generateGeneInformationTable(slimData, data_study);
})

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
    var geneUrl = gwasProperties.IMPC_ID_URI +gene +'/impclink';
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
function generateGeneInformationTable(slimData, studies) {

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

    // Loop through all studies and parse out Reported traits:
    var reported_traits = [];
    for ( var study of studies.docs) {
        if ($.inArray(study.traitName_s, reported_traits) == -1) {
            reported_traits.push(study.traitName_s);
        }
    }

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
