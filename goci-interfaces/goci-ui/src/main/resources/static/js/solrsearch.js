/**
 * Created by dwelter on 20/01/15.
 */



var SearchState = {
    LOADING: {value: 0},
    NO_RESULTS: {value: 1},
    RESULTS: {value: 2}
};

$(document).ready(function() {
    console.log("solr search loaded and ready");
    

    $.getJSON(gwasProperties.contextPath+'api/search/stats')
            .done(function(data) {
                setStats(data);
            });

    // If searched nothing change it to everything:
    if ($('#query').text() == '') {
        $('#query').text('*');
    }

    loadResults();
});

function loadResults() {
    var searchTerm = $('#query').text();

    buildBreadcrumbs();

    if (searchTerm == '*') {
        $('#search-term').text('20 most recent publications in the Catalog');
    }

    $('#search-box').val(searchTerm);
    $('#welcome-container').hide();
    $('#search-results-container').show();
    $('#loadingResults').show();

    solrSearch(searchTerm);
}

function buildBreadcrumbs() {

    // build breadcrumb trail
    $(".breadcrumb").empty();
    var breadcrumbs = $("ol.breadcrumb");

    // default breadcrumb elements:
    breadcrumbs.append('<li><a href="home">GWAS</a></li>');
    breadcrumbs.append('<li><a href="search">Search</a></li>');

    // Extract search term and update if searched with a star:
    var searchTerm = $('#query').text();
    if ( searchTerm == '*' ){
        searchTerm = '20 most recent publications in the Catalog'
    }

    if (! window.location.hash) {
        console.log("Final breadcrumb is for '" + searchTerm + "'");
        breadcrumbs.append('<li class="active">' + sanitizeInput(searchTerm) + '</li>');
    }
    else {
        var facet = window.location.hash.substr(1);
        console.log("Need breadcrumbs for '" + searchTerm + "' and '" + facet + "'");

        breadcrumbs.append('<li><a href="search?query=' + searchTerm + '">' + sanitizeInput(searchTerm) + '</a></li>');
        var last = $("<li></li>").attr("class", "active");

        if (facet == "study") {
            last.text("Studies");
        }
        else if (facet == "variant") {
            last.text("Variants");
        }
        else if (facet == "publication") {
            last.text("Publications");
        }
        else if (facet == "trait") {
            last.text("Traits");
        }
        else if (facet == "gene") {
            last.text("Genes");
        }
        else if (facet == "region") {
            last.text("Genes");
        }
        breadcrumbs.append(last);
    }
}

function solrSearch(queryTerm) {
    console.log("Solr research request received for " + queryTerm);
    setState(SearchState.LOADING);
    if (queryTerm == '*') {

        $.getJSON('api/search/moreresults',
            {
                // 'q': searchTerm,
                'q': '*',
                'max': 20,
                'pvalfilter': '',
                'orfilter': '',
                'betafilter': '',
                'datefilter': '',
                'genomicfilter': '',
                'traitfilter[]': '',
                'genotypingfilter[]': '',
                'sort': 'publicationDate%20desc',
                'facet' : 'publication'
            })
            .done(function(data) {
                // Adding required fields to the returned dataset:
                data['facet_counts'] = { 'facet_fields' : { 'resourcename' : ['publication', 20, 'variant', 0, 'gene', 0, 'trait', 0, 'study', 0] }}

                console.log(data);
                processData(data);
            })
            .fail(function (jqXHR, textStatus, err) {
                alert("Something went wrong.");
            })
    }

    // This needs to be fixed.... this is just tragic..
    else if(queryTerm.match(/[XY0-9]\:[0-9]+-[0-9]+/gi)){
        var elements = queryTerm.split(':');

        // suitable for chr#: and #: as well:
        var chrom = elements[0].trim().toUpperCase().replace("CHR","");

        // We don't check if the submitted chromosome valid or not. We should though.
        // We need to test if the start position is smaller than the end.
        var bp1 = elements[1].split('-')[0].trim();
        var bp2 = elements[1].split('-')[1].trim();

        // Returning variants based on coordinates:
        var searchPhrase = "chromosomeName: "+chrom+" AND ( chromosomePosition:[ "+bp1+" TO "+bp2+" ] OR chromosomeEnd : [ "+bp1+" TO "+bp2+" ] OR chromosomeStart : [ "+bp1+" TO "+bp2+" ] )"

        $.getJSON('api/search', {'q': searchPhrase})
            .done(function(data) {
                console.log(data);
                processData(data);
            });
    }
    else {
        var searchTerm = 'text:"'.concat(queryTerm).concat('"');

        // Search using title field also in query
        var boost_field = ' OR title:"'.concat(queryTerm).concat('"')+' OR synonyms:"'.concat(queryTerm).concat('"');
        var searchPhrase = searchTerm.concat(boost_field);

        $.getJSON('api/search', {'q': searchPhrase, 'generalTextQuery': true})
            .done(function(data) {
                console.log(data);
                processData(data);
            });
    }
}

//
// The following module draws the search snippets on the results page.
//
// Input: list of solr slim documents.
//
var drawSnippets = (function () {

    // This is the main public function:
    var renderer = function(documents){

        // prepare page:
        $(".results-container .table-toggle").hide();
        var divResult = $('#resultQuery').empty();

        // Looping through all documents:
        for (var doc of documents) {

            // Prototyping table:
            var prototype = generateSnippet(doc.resourcename);

            switch(doc.resourcename) {
                case 'study':
                    prototype = study(prototype, doc)
                    break;

                case 'publication':
                    prototype = publication(prototype, doc);
                    break;

                case 'trait':
                    prototype = trait(prototype, doc);
                    break;

                case 'variant':
                    prototype = variant(prototype, doc);
                    break;

                case 'gene':
                    prototype = gene(prototype, doc);
                    break;

                case 'region':
                    prototype = region(prototype, doc);
                    break;

                default:
                    console.log("[Error] Failure to process document " + doc.resourcename);
            }

            // Adding formatted table to the page:
            divResult.append(prototype);
        }

        setState(SearchState.RESULTS);
    }

    // a function to create a blank snippet:
    var generateSnippet = function (resourceName) {

        // Creating table:
        var table =  $(`<table class="border-search-box" style = "display: table; margin-bottom: 20px;" id="${resourceName}">`);
        var tbody = table.append('<tbody />').children('tbody');

        // Select letter for resource name:
        var resourceNameLetter = resourceName[0].toUpperCase()

        // creating and populating a title row:
        var titleRow = $("<tr>");

        // Addind left edge cell:
        titleRow.append($("<td rowspan='2' style='width: 3%'>").html(''));

        // Adding the title cell:
        titleRow.append($("<td style=\"width: 94%\">").html(`<h3 id="titleCell"><span class="letter-circle letter-circle-${resourceName}">&nbsp;${resourceNameLetter}&nbsp;</span><a href=""></a></h3>`));

        // Adding the spacer cell for icons:
        titleRow.append($("<td style='width: 10%'>").html("<h3 class='pull-right' id='iconCell'></h3>"));

        // Adding right edge cell:
        titleRow.append($("<td rowspan='2' style='width: 3%'>").html(''));

        // Adding row to table body:
        tbody.append(titleRow);

        // creating and populating the description row:
        var descriptionRow = $("<tr>");
        var descriptionTruncated = "<p class='descriptionSearch'></p>";
        descriptionRow.append($("<td style=\"width: 88%\" id='descriptionCell' >").html(descriptionTruncated));
        descriptionRow.find('td#descriptionCell').append($("<p id='statsParagraph'>"));

        // Adding description row to the table:
        tbody.append(descriptionRow);

        return(table);
    };

    // Adding association and study counts:
    var addStats = function (doc, table) {

        // Adding association count:
        if ('associationCount' in doc) {
            table.find('p#statsParagraph').append('Associations <span class="badge background-color-primary-bold ">'+doc.associationCount + '</span>&nbsp;&nbsp;&nbsp;');
        }

        // Adding study count:
        if ('studyCount' in doc) {
            table.find('p#statsParagraph').append('Studies <span class="badge background-color-primary-bold ">'+doc.studyCount + '</span>');
        }
        return(table);
    }

    // Shortening description:
    // var addShowMoreLink = function (content, showCharParam, ellipsestext) {
    //     var moretext = "Show more >";
    //
    //     var html="";
    //     if(content.length > showCharParam) {
    //
    //         var visible_text = content.substr(0, showCharParam);
    //         var lastSpace = visible_text.lastIndexOf("\&nbsp;");
    //         if (lastSpace > -1) {
    //             showCharParam = lastSpace;
    //             visible_text = content.substr(0, showCharParam);
    //         }
    //         var extra_text = content.substr(showCharParam, content.length - showCharParam);
    //
    //         html = visible_text + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + extra_text + '</span>&nbsp;&nbsp;<a href="javascript:void(0)" class="morelink">' + moretext + '</a></span>';
    //     }
    //     else {
    //         html = content;
    //     }
    //     return html;
    // };

    // Updating snippet fields for studies:
    var study = function(table, doc) {

        // Update title:
        table.find('a').text(doc.accessionId);

        // Update publication URL:
        table.find('a').attr('href',gwasProperties.contextPath+"studies/"+doc.accessionId);

        // Update description:
        table.find('p.descriptionSearch').text(doc.title);

        // Defining full p-value set array icon:
        var linkFullPValue = "<span class='glyphicon glyphicon-signal context-help' " +
            "style='font-size: 20px' data-toggle='tooltip' data-placement='bottom' " +
            "data-original-title='Full summary statistics available'></span>";

        // Adding icons:
        if (doc.fullPvalueSet === true) {
            table.find('h3#iconCell').append(linkFullPValue+"&nbsp;&nbsp");
        }

        // Adding stats:
        table = addStats(doc, table)

        return(table);

    }

    // Updating snippet fields for publications:
    var publication = function(table, doc){

        // Update title:
        table.find('a').text(doc.title);

        // Update publication URL:
        table.find('a').attr('href',gwasProperties.contextPath+"publications/"+doc.pmid);

        // Update description:
        table.find('p.descriptionSearch').text(doc.description);

        // Defining targeted array icon:
        var genotypingIcon="<span class='glyphicon targeted-icon-GWAS_target_icon context-help' " +
            "style='font-size: 20px' data-toggle='tooltip' data-placement='bottom'" +
            "data-original-title='Targeted or exome array study'></span>";

        // Defining full p-value set array icon:
        var linkFullPValue = "<span class='glyphicon glyphicon-signal context-help' " +
            "style='font-size: 20px' data-toggle='tooltip' data-placement='bottom' " +
            "data-original-title='Full summary statistics available'></span>";

        // Adding icons:
        if (doc.fullPvalueSet == 1){
            table.find('h3#iconCell').append(linkFullPValue+"&nbsp;&nbsp");
        }
        if ((doc.genotypingTechnologies.indexOf("Targeted genotyping array") > -1) ||
            (doc.genotypingTechnologies.indexOf("Exome genotyping array") > -1) ){
            table.find('h3#iconCell').append(genotypingIcon);
        }

        // Adding stats:
        table = addStats(doc, table)

        return(table);

    }

    // Updating snippet fields for variants:
    var variant = function(table, doc) {

        // Update title:
        table.find('a').text(doc.title);

        // Update publication URL:
        table.find('a').attr('href', gwasProperties.contextPath+"variants/"+doc.rsID);

        // Update description:
        var descriptionElements = doc.description.split("|");
        if (descriptionElements[1] == "NA"){
            var variantDescription = "This variant could not be mapped to the genome."
        }
        else {
            var variantDescription = "<b>Location: </b>"+descriptionElements[0] +
                " <b>Cytogenetic region:</b>" + descriptionElements[1] +
                " <b>Most severe consequence: </b>" + descriptionElements[2] +
                " <b>Mapped gene(s): </b>" + descriptionElements[3];
        }
        table.find('p.descriptionSearch').append(variantDescription);

        // Adding stats:
        table = addStats(doc, table)

        return(table);

    }

    // Updating snippet fields for traits:
    var trait = function(table, doc) {

        // Update title:
        table.find('a').text(doc.title);

        // Update publication URL:
        table.find('a').attr('href', gwasProperties.contextPath+"efotraits/" + doc.shortForm );

        // Adding efo name to title:
        table.find('h3#titleCell').append("&nbsp;&nbsp;");
        table.find('h3#titleCell').append($("<span class='badge letter-circle-trait' id='efoID'>" + doc.shortForm + "</span>"));

        // Adding description
        var descriptionTruncated = doc.description;
        descriptionTruncated = addShowMoreLink(descriptionTruncated, 200,"...");
        table.find('p.descriptionSearch').append(descriptionTruncated);

        // Adding stats:
        table = addStats(doc, table)

        return(table);
    }

    // Updating snippet fields for genes:
    var gene = function(table, doc) {

        // Update title:
        table.find('a').text(doc.title);

        // Update gene URL:
        table.find('a').attr('href', gwasProperties.contextPath+"genes/"+doc.title);

        // Update description:
        var descriptionElements = doc.description.split("|");

        if (! descriptionElements[0]){
            descriptionElements[0] = "No description available";
        }

        var geneDescription = "<b>Description: </b>"+descriptionElements[0] +
            "</br><b>Location: </b>" + descriptionElements[1] +
            " <b>Cytogenetic region: </b>" + descriptionElements[2] +
            " <b>Biotype: </b>" + descriptionElements[3].replace(/_/g, " ");

        table.find('p.descriptionSearch').append(geneDescription);

        // Adding stats:
        table = addStats(doc, table)

        return(table);
    }

    // Updating snippet fields for regions:
    var region = function(table, doc) {

        // Update title:
        table.find('a').text(doc.title);

        // Update publication URL:
        table.find('a').attr('href', gwasProperties.contextPath+"regions/" + doc.title);

        // Update description:
        var regionDescription = "<b>Description: </b>" +doc.description +
            "<br><b>Chromosome: </b>" + doc.chromosomeName +
            " <b>Start: </b>" + doc.chromosomeStart +
            " <b>End: </b>" + doc.chromosomeEnd + '<br> ';

        table.find('p.descriptionSearch').append(regionDescription);

        return(table);

    }

    // Public function:
    return {
        renderer: renderer,
    }
})();

//
// Test if the query string is a genomic region. If yes, then it adds a fake
// region document to the document list.
//
// Input: search query, list of solr slim documents.
//
var testForRegion = (function () {

    // This is the main public function:
    var test = function(queryTerm, data) {
        var regionTest = /([XY0-9]{1,2}):(\d+)-(\d+)/gi; // matches regions 6:234511-23500
        var cytobandTest = /([XY0-9]{1,2})([PQ][0-9]+\.[0-9]+)/gi; // matches cytobands eg 6p33.1

        // test if queryTerm looks like a region:
        if (queryTerm.match(regionTest)) {

            var match = regionTest.exec(queryTerm);
            var chrom = match[1];
            var start = match[2];
            var end = match[3];


            // Testing for valid chromosomes:
            var chromosomes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y"]
            if (!chromosomes.includes(chrom)) {
                return (data)
            }

            // Testing if bp-s are numbers:
            if (isNaN(start) || isNaN(end)) {
                return (data)
            }

            // Testing if bp1 is smaller than bp2:
            if (parseInt(start) >= parseInt(end)) {
                return (data)
            }

            // At this point we know the query is a valid region. We now have to add a "fake" document:
            var fakeDoc = {
                "description": 'Custom genomic location',
                "chromosomeName": chrom,
                "chromosomeStart": start,
                "chromosomeEnd": end,
                "title": "chr" + chrom + ":" + start + "-" + end,
                "resourcename": "region"
            }

            // Adding doc:
            data.unshift(fakeDoc)
        }
        else if (queryTerm.match(cytobandTest)) {
            cytobandData = lookUpCytoband(queryTerm)

            // If no cytoban could be found:
            if (cytobandData.end.toString() == '-') {
                return (data)
            }

            // At this point we know the query is a valid region. We now have to add a "fake" document:
            var fakeDoc = {
                "description": 'Cytogenetic region',
                "chromosomeName": cytobandData.chrom,
                "chromosomeStart": cytobandData.start,
                "chromosomeEnd": cytobandData.end,
                "title": queryTerm,
                "resourcename": "region"
            }

            // Adding doc:
            data.unshift(fakeDoc)

        }

        return (data)
    }

    // This function extracts information of the cytoband from Ensembl:
    var lookUpCytoband = function (cytoband){

        // Parse cytoband name: 6p22.3
        var myRegexp = /([0-9XY]+)([pq][0-9]+\.*[0-9]*)/i;
        var match = myRegexp.exec(cytoband);

        // Populate this object with data to be returned:
        var returnData = {
            'chrom' : match[1],
            'band' : match[2],
            'start' : '-',
            'end' : '-',
            'stain' : '-'
        }

        // https://rest.ensembl.org/info/assembly/homo_sapiens/X?content-type=application/json&bands=1
        var assemblyQueryURL = gwasProperties.EnsemblRestBaseURL + "/info/assembly/homo_sapiens/" + returnData.chrom + "?content-type=application/json&bands=1"
        var assemblyData =  getEnsemblREST(assemblyQueryURL)

        // Test needed if assembly was found or not.
        if (assemblyData.error){
            console.log("[Error] REST query failed: " + assemblyQueryURL)
            console.log("[Error] Returned value: " + assemblyData.error)
            return(returnData)
        }

        // Looping through all cytobands to find the requested one:
        for ( band of assemblyData.karyotype_band){
            if(band.id == returnData.band){
                returnData.start = band.start;
                returnData.end = band.end;
                returnData.stain = band.stain;
            }
        }

        return(returnData)
    }

    // Extracting data from Ensembl:
    var getEnsemblREST = function (URL) {
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

    // Public function:
    return {
        test: test,
    }
})();

function processData(data) {

    // Extracting search term:
    var searchTerm = $('#query').text();

    // Extracting components from the solr response:
    var documents = data.response.docs;
    var resourceCounts = data.facet_counts.facet_fields.resourcename;

    if (!searchTerm.toUpperCase().startsWith('GCST')) {
        documents = documents.filter(doc => doc.resourcename !== 'study');
        resourceCounts[resourceCounts.indexOf('study') + 1] = 0;
    }

    // Test if the query is a region, if so, adding to the returned data:
    documents = testForRegion.test(searchTerm, documents)

    // if region document is added, we update the resourceCounts:
    if ( documents.length > 0 && documents[0].resourcename == 'region' ){
        resourceCounts = resourceCounts.concat(['region', 1]);
    }
    else {
        resourceCounts = resourceCounts.concat(['region', 0]);
    }

    // Updating the badges is a must:
    // (however needs to be checked...)
    updateCountBadges(resourceCounts);

    // Drawing all snippets if there is at least one document:
    if (documents.length != 0) {
        drawSnippets.renderer(documents)
    }
    else {
        setState(SearchState.NO_RESULTS);
    }

    // Once the snippets are done, we remove the spinner:
    $('#loadingResults').hide();
    
}

function setState(state) {
    var loading = $('#loading');
    var noresults = $('#noResults');
    var results = $('#results');
    console.log("Search state update...");
    console.log(state);
    switch (state.value) {
        case 0:
            loading.show();
            noresults.hide();
            results.hide();
            break;
        case 1:
            loading.hide();
            noresults.show();
            results.hide();
            break;
        case 2:
            loading.hide();
            noresults.hide();
            results.show();
            break;
        default:
            console.log("Unknown search state; redirecting to search page");
            window.location = "search";
    }
}

function updateCountBadges(countArray) {

    for (var i = 0; i < countArray.length; i = i + 2) {

        var resource = countArray[i];
        var count = countArray[i + 1];

        // Adding count:
        var facet = $('#' + resource + '-facet span');
        facet.empty();
        facet.append(count);

        // hide resource with zero count
        if (count == 0) {
            facet.addClass("disabled");
            $('#' + resource + '-facet').hide();
        }
    }
}

function setStats(data) {
    try {
        $('#releasedate-stat').text("Last data release on " + data.date);
        $('#studies-stat').text(data.studies + " publications");
        $('#snps-stat').text(data.snps + " SNPs");
        $('#associations-stat').text(data.associations + " associations");
        $('#genomebuild').text("Genome assembly " + data.genebuild);
        $('#dbsnpbuild').text("dbSNP Build " + data.dbsnpbuild);
        $('#ensemblbuild').text("Ensembl Build " + data.ensemblbuild);
        $('#catalog-stats').show();
    }
    catch (ex) {
        console.log("Failure to process stats " + ex);
    }
}

/*
A function to sanitize user input before it gets displayed on the website
 */
function sanitizeInput(input){
    input = input.replace(/>/g, "&gt;");
    input = input.replace(/</g, "&lt;");
    input = input.replace(/"/g, "&quot;");
    input = input.replace(/'/g, "&#x27;");
    input = input.replace(/&/g, "&amp;");
    input = input.replace(/\//g, "&#x2F;");
    return(input);
}

