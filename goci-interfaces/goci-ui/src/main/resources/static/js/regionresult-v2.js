/** DRY. From Xin original code. We must refactor all these 'action'result.js in a common way! */


$(document).ready(() => {
    $('#study_panel').hide();
    $('#efotrait_panel').hide();

    $('html,body').scrollTop(0);
    var searchTerm = getTextToSearch('#query');

    // console.log("Query:" + searchTerm);
    // console.log("Loading search module!");
    if (searchTerm != '') {

        // console.log("Start search for the text " + searchTerm);
        var elements = {};
        searchTerm.split(',').forEach((term) => {
            elements[term] = term;
        });

        // console.log(elements);
        executeQuery(elements, true);
    }
    const associationTable = $('#association-table-v2').DataTable();
    const studyTable = $('#study-table-v2').DataTable();
    const efoTable = $('#efotrait-table-v2').DataTable();
    var empty = 0;
    // if (!associationTable.page.info().recordsTotal && !studyTable.page.info().recordsTotal && !efoTable.page.info().recordsTotal)
    //     $('#lower_container').html("<h2>No associations could be found in the region: <em>"+searchTerm+"</em> in the GWAS Catalog database</h2>");
    efoTable.on( 'draw', function () {
        if (efoTable.page.info().recordsTotal === 0) empty++;
        displayLowerContainer(empty);
    });
    studyTable.on( 'draw', function () {
        if (studyTable.page.info().recordsTotal === 0) empty++;
        displayLowerContainer(empty);
    });
    associationTable.on( 'draw', function () {
        if (associationTable.page.info().recordsTotal === 0) empty++;
        displayLowerContainer(empty);
    });

});
function displayLowerContainer(empty) {
    if (empty === 3) $('#lower_container').html("<h2>No associations could be found in the region: <em>" + getTextToSearch('#query') +"</em> in the GWAS Catalog database</h2>");
}

/**
 * The elem to search is defined by the url, as a main entry of the page. It is stored in the div id
 * in the date attribute of the <global_elem_info_tag_id>`
 * @return Eg. String efoID - 'EFO_0000400'
 * @example getElemToSearch()
 */

getTextToSearch = function(divId){
    return $(divId).text();
}

executeQuery = function(data={}, initLoad=false) {
    updatePage(initLoad);
}



updatePage = function(initLoad=false) {

    //start spinner. The spinner will be stopped whenever the data is ready, thus closed by the corresponding data loading function.
    if(initLoad){
        showLoadingOverLay('#summary-panel-loading');
    }
    
    var main = getTextToSearch('#query');
    
    //******************************
    // when solr data ready, process solr data and update badges in the selection cart
    //******************************
    getDataSolr(main, initLoad);
}


/*
Extracting data from the fat solr based on the query term
 */
function getDataSolr(main, initLoad=false) {
    // initLoad will be pass to processEfotraitData, controlling whether to upload the triat information(initload)
    // or just reload the tables(adding another efo term)
    
    var searchQuery = main;
    var q = '';
    var regionTest = /([XY0-9]{1,2}):(\d+)-(\d+)/gi; // matches regions 6:234511-23500
    var cytobandTest = /([XY0-9]{1,2})([PQ][0-9]+\.[0-9]+)/gi; // matches cytobands eg 6p33.1

    // console.log("Solr research request received for " + searchQuery);

    // Testing if the query was a cytoband or region:
    if (searchQuery.match(cytobandTest) ){
        q = searchQuery;
    }
    else if (searchQuery.match(regionTest) ){
        var coordinates = regionTest.exec(searchQuery);
        q =  "chromosomeName: "+coordinates[1]+" AND chromosomePosition:[ "+coordinates[2]+" TO "+coordinates[3]+" ]"
    }
    else {
        $('#lower_container').html("<h2>The provided query term <em>"+searchQuery+"</em> cannot be interpreted as a region.</h2>");
    }
    generateRegionInformationTable(searchQuery);
    setDownloadLink(q);
}

// Helper function to retrieve Ensembl data through the REST API
// SYNC!!
function getEnsemblREST( URL ){
    var result = null;
    $.ajax({
        url: URL,
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data) {
            result = data;
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
function generateRegionInformationTable(searchQuery) {

    var regionTest = /([XY0-9]{1,2}):(\d+)-(\d+)/gi; // matches regions 6:234511-23500
    var cytobandTest = /([XY0-9]{1,2})([PQ][0-9]+\.[0-9]+)/gi; // matches cytobands eg 6p33.1
    var chromosome = '';
    var start = '';
    var end = '';

    // console.log("Solr research request received for " + searchQuery);

    // Testing if the query was a cytoband or region:
    if ( searchQuery.match(cytobandTest) ){
        // If cytological band is queried, it has a name:
        $("#cytobandName").html(`${searchQuery}`);

        // Extracting coordinates for a given cytoband from Ensembl:
        var bandElements = cytobandTest.exec(searchQuery);
        var cbURL = gwasProperties.EnsemblRestBaseURL + '/info/assembly/homo_sapiens/' + bandElements[1] + '?content-type=application/json&bands=1';
        var assemblyInfo =  getEnsemblREST(cbURL);

        // Parse REST response:
        for( var band of assemblyInfo.karyotype_band ){
            if (band.id == bandElements[2]){
                chromosome = band.seq_region_name;
                start = band.start;
                end = band.end;
            }
        }
    }
    else if (searchQuery.match(regionTest) ){
        var coordinates = regionTest.exec(searchQuery);
        chromosome = coordinates[1];
        start = coordinates[2];
        end = coordinates[3];
    }

    var coordinate = `${chromosome}:${start}-${end}`;
    $("#genomicCoordinates").html(`${coordinate}`);

    // Adding cross references pointing to Ensembl:
    var EnsemblregionLink = `Location/View?r=${chromosome}%3A${start}-${end}`;
    $("#ensembl_button").attr('onclick', "window.open('" + gwasProperties.EnsemblURL + EnsemblregionLink + "',    '_blank')");

    // Adding cross references pointing to NCBI:
    var NCBIregionLink = `https://www.ncbi.nlm.nih.gov/genome/gdv/browser/?context=genome&acc=GCA_000001405.27&chr=${chromosome}&from=${start}&to=${end}`;
    $("#entrez_button").attr('onclick', "window.open('" + NCBIregionLink + "',    '_blank')");

    // OK, loading is complete:
    hideLoadingOverLay('#summary-panel-loading');
}
