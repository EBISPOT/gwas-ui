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

    
    if (window.history && window.history.pushState) {
        $(window).on('popstate', function() {
            applyFacet();
        });
    }
    
    // Search for everything.
    if ($('#query').text() == '') {
        $('#query').text('*');
    }
    loadResults();
});

function loadResults() {
    var searchTerm = $('#query').text();

    buildBreadcrumbs();

    if (searchTerm == '*') {
        if ($('#filter').text() == 'recent') {
            $('#search-term').text('most recent studies');

        }
        else {
            // $('#search-term').text('selected traits from list');
            $('#search-term').text('all results');
        }
    }

    //add the link to the specific page, for example, for snp, to variant-page
    // if(/^rs[0-9]/.test(searchTerm)){
    //     //xintodo this is currently beta so need to change
    //     $('#search-term').attr("href", "beta/variants/"+searchTerm);
    //     $("#search-term-popup").attr("data-original-title","Go to the variant page.");
    // }else{
    //     //we currently only ave variant page, so for other search, we disable the link and hide the popup
    //     $('#search-term').replaceWith('<span id=search-term th:text="*{query}">' + searchTerm +'</span>')
    //     $("#search-term-popup").attr("style","display: none");
    // }


    $('#welcome-container').hide();
    $('#search-results-container').show();
    $('#loadingResults').show();
    $('#search-box').val(searchTerm);


    if ($('#filter').text() != '') {
        if ($('#filter').text() == 'recent') {
            getMostRecentStudies();
        }
        else {
            console.log("Value from filter variable: " + $('#filter').text());
            var traits = $('#filter').text();
            traitOnlySearch(traits);
        }

    }
    else {
        $('#welcome-container').hide();
        $('#search-results-container').show();
        $('#loadingResults').show();

        solrSearch(searchTerm);
        if (window.location.hash) {
            console.log("Applying a facet");
            applyFacet();
        }
        else {
            $('#facet').text();
        }

    }
}

function buildBreadcrumbs() {
    // build breadcrumb trail
    console.log("Updating breadcrumbs...");
    $(".breadcrumb").empty();
    var breadcrumbs = $("ol.breadcrumb");
    // defaults
    breadcrumbs.append('<li><a href="home">GWAS</a></li>');
    breadcrumbs.append('<li><a href="search">Search</a></li>');
    var searchTerm = $('#query').text();

    if (!window.location.hash) {
        console.log("Final breadcrumb is for '" + searchTerm + "'");
        breadcrumbs.append('<li class="active">' + searchTerm + '</li>');
    }
    else {
        var facet = window.location.hash.substr(1);
        console.log("Need breadcrumbs for '" + searchTerm + "' and '" + facet + "'");
        breadcrumbs.append('<li><a href="search?query=' + searchTerm + '">' + searchTerm + '</a></li>');
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
        breadcrumbs.append(last);
    }
}

function solrSearch(queryTerm) {
    console.log("Solr research request received for " + queryTerm);
    if (queryTerm == '*') {
        var searchTerm = 'text:'.concat(queryTerm);
        var boost_field = ' OR title:"'.concat(queryTerm).concat('"')+' OR synonyms:"'.concat(queryTerm).concat('"');
        var searchPhrase = searchTerm.concat(boost_field)
    }
    else if(queryTerm.indexOf(':') != -1 && queryTerm.indexOf('-') != -1){
        var elements = queryTerm.split(':');
        var chrom = elements[0].trim();
        if(chrom == 23){
            chrom = 'X'
        }
        var bp1 = elements[1].split('-')[0].trim();
        var bp2 = elements[1].split('-')[1].trim();

        var searchPhrase = 'chromosomeName:'.concat(chrom).concat(' AND chromosomePosition:[').concat(bp1).concat(' TO ').concat(bp2).concat(']');
    }
    else {
        var searchTerm = 'text:"'.concat(queryTerm).concat('"');
        // Search using title field also in query
        var boost_field = ' OR title:"'.concat(queryTerm).concat('"')+' OR synonyms:"'.concat(queryTerm).concat('"');
        var searchPhrase = searchTerm.concat(boost_field);
    }
    setState(SearchState.LOADING);
    // $.getJSON('api/search', {'q': searchTerm})
    $.getJSON('api/search', {'q': searchPhrase})
            .done(function(data) {
                console.log(data);
                processData(data);
            });
}

function getMostRecentStudies() {
    console.log("Solr research request received for most recent studies");
    setState(SearchState.LOADING);

    var searchTerm = 'text:*';
    var dateRange = "[NOW-1MONTH+TO+*]";
    var sort = "catalogPublishDate+desc"

    $.getJSON('api/search/latest', {
                'q': searchTerm,
                'group': 'true',
                'group.by': 'resourcename',
                'group.limit': 5,
                'dateFilter': dateRange,
                'sort': sort
            })
            .done(function(data) {
                console.log(data);
                processData(data);
            });
}

function processData(data) {
    var documents = data.response.docs;

    setDownloadLink(data.responseHeader.params);
    console.log("Solr search returned " + documents.length + " documents");

    searchTermParam = data.responseHeader.params.q
    // formattedSearchTerm = searchTermParam.replace(/['"]+/g, '').split(":");
    // change parsing when using "title:searchTerm" in query
    formattedSearchTerm = searchTermParam.replace(/['"]+/g, '').split("OR");
    formattedSearchTerm = formattedSearchTerm[0].split(":");

    updateCountBadges(data.facet_counts.facet_fields.resourcename, formattedSearchTerm[1]);

    if(data.responseHeader.params.sort != null && data.responseHeader.params.sort.indexOf('pValue') != -1 && data.responseHeader.params.sort.indexOf('asc') != -1){
        $('#pValue').find('span.unsorted').removeClass('glyphicon-sort').addClass('glyphicon-arrow-up').removeClass('unsorted').addClass('sorted asc');
    }

    if (!$('#filter-form').hasClass('in-use')) {
        if (data.responseHeader.params.q.indexOf('*') != -1 && data.responseHeader.params.fq != null) {
            var fq = data.responseHeader.params.fq;

            if (fq.indexOf("catalogPublishDate") != -1) {
                var dateRange = "[NOW-1MONTH+TO+*]";
                generateTraitDropdown(data.responseHeader.params.q, null, dateRange);
            }
            else {
                if (fq.charAt(fq.length - 1) == '"') {
                    fq = fq.substr(0, fq.length - 1);
                }
                ;

                var terms = fq.split('"');
                var traits = []

                for (var i = 0; i < terms.length; i++) {
                    if (terms[i].indexOf('traitName') == -1) {
                        traits.push(terms[i].replace(/\s/g, '+'));
                    }
                }
                //generateTraitDropdown(data.responseHeader.params.q, traits, null);
            }
        }
        else {
            //generateTraitDropdown(data.responseHeader.params.q, null, null);
        }
    }

    if (documents.length != 0) {
        $(".results-container .table-toggle").hide();
        var divResult = $('#resultQuery').empty();

        for (var j = 0; j < documents.length; j++) {
            var doc = documents[j];
    
            try {
                var table = $('<table class="border-search-box">');
                var tbody = table.append('<tbody />').children('tbody');
                var row = $("<tr>");
                var linkFullPValue = '';
                var genotypingIcon = '';
        
        
                if (doc.resourcename == "publication") {
                    var fullpvalset = doc.fullPvalueSet;
                    if(fullpvalset == 1) {
                        linkFullPValue = "<span class='glyphicon glyphicon-signal context-help' " +
                            "style='font-size: 20px' data-toggle='tooltip' data-placement='bottom' " +
                            "data-original-title='Full summary statistics available'></span>";
                    }
            
                    if ((doc.genotypingTechnologies.indexOf("Targeted genotyping array") > -1) ||
                        (doc.genotypingTechnologies.indexOf("Exome genotyping array") > -1) ) {
                        genotypingIcon="<span class='glyphicon targeted-icon-GWAS_target_icon context-help' " +
                            "style='font-size: 20px' data-toggle='tooltip' data-placement='bottom'" +
                            "data-original-title='Targeted or exome array study'></span>";
                    }
            
            
                    var pubLabsUrl= gwasProperties.contextPath+"publications/"+doc.pmid;
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                    row.append($("<td style='width: 84%'>").html("<h3><span class='letter-circle'>&nbsp;P&nbsp;</span><a href="+pubLabsUrl+">"+doc.title+"</a></h3>"));

                    // Display Summary stat and Genotyping icons
                    if (genotypingIcon != "" && linkFullPValue != "") {
                        row.append($("<td style='width: 10%'>").html("<h3 class='pull-right'>"+genotypingIcon+
                            "&nbsp;&nbsp"+linkFullPValue+"</h3>"));
                    }

                    if (genotypingIcon != "" && linkFullPValue == "") {
                        row.append($("<td style='width: 10%'>").html("<h3 class='pull-right'>"+genotypingIcon+"</h3>"));
                    }

                    if (genotypingIcon == "" && linkFullPValue != "") {
                        row.append($("<td style='width: 10%'>").html("<h3 class='pull-right'>"+linkFullPValue+"</h3>"));
                    }
                    if (genotypingIcon == "" && linkFullPValue == "") {
                        // append h3 to have same CSS style
                        row.append($("<td style='width: 10%'>").html("<h3></h3>"));
                    }
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                }
                if (doc.resourcename == "trait") {
                    var efoLabsUrl = gwasProperties.contextPath+"efotraits/"+doc.shortForm
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                    row.append($("<td style=\"width: 94%\">").html("<h3><span class='letter-circle letter-circle-trait'>&nbsp;T&nbsp;</span><a href="+efoLabsUrl+">"+doc.title+"</a>&nbsp;&nbsp;<span class='badge letter-circle-trait'>"+doc.shortForm+"</span></h3>"));
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                }
                if (doc.resourcename == "variant") {
                    var variantsLabsUrl = gwasProperties.contextPath+"variants/"+doc.rsID
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                    row.append($("<td style=\"width: 94%\">").html("<h3><span class='letter-circle letter-circle-variant'>&nbsp;V&nbsp;</span><a href="+variantsLabsUrl+">"+doc.title+"</a></h3>"));
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                }
                if (doc.resourcename == "gene") {
                    var genesLabsUrl = gwasProperties.contextPath+"genes/"+doc.title
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                    row.append($("<td style=\"width: 94%\">").html("<h3><span class='letter-circle letter-circle-gene'>&nbsp;G&nbsp;</span><a href="+genesLabsUrl+">"+doc.title+"</a></h3>"));
                    row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                }
        
                tbody.append(row);
                // Function to parse the description
                var rowDescription = $("<tr>");
                var descriptionTruncated = doc.description;

                // Add custom formatting for Variant description
                if (doc.resourcename == "variant") {
                    var descriptionElements = descriptionTruncated.split("|");
                    if (descriptionElements[1] == "NA"){
                        var variantDescription = "This variant could not be mapped to the genome."
                    }
                    else {
                        var variantDescription = "<b>Location: </b>"+descriptionElements[0] +
                            "; <b>Cytogenetic region:</b>" + descriptionElements[1] +
                            "; <b>Most severe consequence: </b>" + descriptionElements[2] +
                            "; <b>Mapped gene(s): </b>" + descriptionElements[3];
                    }
                    descriptionTruncated = variantDescription;
                }

                // Add custom formatting for gene description
                if (doc.resourcename == "gene") {
                    var descriptionElements = descriptionTruncated.split("|");
                    var variantDescription = "<b>Description: </b>"+descriptionElements[0] +
                        "<br><b>Genomic location: </b>" + descriptionElements[1] +
                        "; <b>Cytogenetic region: </b>" + descriptionElements[2] +
                        "; <b>Biotype: </b>" + descriptionElements[3].replace(/_/g, " ");
                    descriptionTruncated = variantDescription;
                }

                descriptionTruncated=addShowMoreLink(descriptionTruncated, 200,"...");
                descriptionTruncated = "<p class='descriptionSearch'>"+descriptionTruncated+"</p>";
        
                var description_stats = "";
                if ('associationCount' in doc) {
                    description_stats = description_stats.concat("<br><p>Associations ").concat('<span class="badge background-color-primary-bold ">').concat(doc.associationCount).concat('</span>&nbsp;');
            
                }
        
                if ('studyCount' in doc) {
                    description_stats = description_stats.concat("&nbsp;&nbsp;Studies ").concat('<span class="badge background-color-primary-bold ">').concat(doc.studyCount).concat('</span>');
                }
        
                descriptionTruncated = descriptionTruncated+description_stats;
        
                descriptionTruncated = "<p class='descriptionSearch'>"+descriptionTruncated+"</p>";
        
                rowDescription.append($("<td style=\"width: 88%\">").html(descriptionTruncated));
                tbody.append(rowDescription);
                divResult.append(table);
                divResult.append("<br>");
            }
            catch (ex) {
                console.log("Failure to process document " + ex);
            }
        }

        setState(SearchState.RESULTS);
    }
    else {
        setState(SearchState.NO_RESULTS);
    }

    $('#loadingResults').hide();
    
    console.log("Data display complete");
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


function updateCountBadges(countArray, searchTerm) {
    console.log("Updating facet counts for " + (countArray.length / 2) + " badges");

    // Add search term to facet box
    // var searchTermForHeader = $('#' + 'result-header');
    // searchTermForHeader.append(searchTerm);


    for (var i = 0; i < countArray.length; i = i + 2) {
        var resource = countArray[i];
        var count = countArray[i + 1];

        var facet = $('#' + resource + '-facet span');
        facet.empty();
        facet.append(count);

        if ($('#' + resource + '-facet').hasClass("disabled")) {
            $('#' + resource + '-facet').removeClass("disabled");
            var summary = $('#' + resource + '-summaries');
            summary.removeClass("no-results");
            summary.show();
            $('#' + resource + '-facet').show();
        }

        if (count == 0) {
            $('#' + resource + '-facet').addClass("disabled");
            var summary = $('#' + resource + '-summaries');
            summary.addClass("no-results");
            summary.hide();
            $('#' + resource + '-facet').hide();
        }
    }
}

function generateTraitDropdown(queryTrait, subTraits, dateFilter) {
    $.getJSON('api/search/traitcount', {'q': queryTrait, 'traitfilter[]': subTraits, dateFilter: dateFilter})
            .done(function(data) {
                console.log(data);
                processTraitCounts(data);
            });
}

function processTraitCounts(data) {
    var traits = data.facet_counts.facet_fields.traitName_s;

    $('#trait-dropdown ul').empty();

    for (var i = 0; i < traits.length; i = i + 2) {
        var trait = traits[i];

        var val = trait;
        if(trait.indexOf("'") != -1){
             val = trait.replace("'","&#39;")
        }
        var count = traits[i + 1];
        $('#trait-dropdown ul').append($("<li>").html("<input type='checkbox' class='trait-check' value='".concat(val).concat(
                "'/>&nbsp;").concat(trait).concat(" (").concat(count).concat(")")));
    }
}

function setDownloadLink(searchParams) {
    console.log(searchParams);
    var baseUrl = 'api/search/downloads?';
    var q = "q=".concat(searchParams.q);

    var trait = '';
    var genotyping = '';
    var traitFilter = '&traitfilter[]=';
    var genotypingFilter = '&genotypingfilter[]=';
    var pval = '&pvalfilter=';
    var or = '&orfilter=';
    var beta = '&betafilter=';
    var date = '&datefilter=';
    var region = '&genomicfilter=';
    var addeddate = '&dateaddedfilter=';
    var facet = '&facet=association';

    pval = pval.concat(processPval());
    or = or.concat(processOR());
    beta = beta.concat(processBeta());
    region = region.concat(processGenomicRegion());
    var pubdate = date.concat(processDate());

    var traits = processTraitDropdown();
    var genotypingTechnologies = processGenotypingTechnologyDropdown();

    if (traits != '') {
        for (var t = 0; t < traits.length; t++) {
            trait = trait.concat(traitFilter).concat(traits[t]);
        }
    }
    else {
        trait = traitFilter;
    }
    
    if (genotypingTechnologies.length > 0) {
        for (var elem = 0; elem < genotypingTechnologies.length; elem++) {
            genotyping = genotyping.concat(genotypingFilter).concat(genotypingTechnologies[elem]);
        }
    }
    else {
        genotyping=genotypingFilter;
    }

    if (searchParams.q.indexOf('*') != -1 && $('#filter').text() != '') {

        console.log('Need to build the download link a bit differently because of ' + $('#filter').text());

        if ($('#filter').text() != 'recent' && traits == '') {
            console.log("Generating trait-based download link for " + $('#filter').text());
            var terms = $('#filter').text();
            terms = terms.replace(/\s/g, '+');
            var traits = terms.split('|');

            for (var i = 0; i < traits.length; i++) {
                console.log(traits[i]);
                trait = trait.concat(traitFilter).concat(traits[i]);
            }

        }
        else if ($('#filter').text() == 'recent') {
            console.log("Generating date-based download link for " + $('#filter').text());

            var addeddate = addeddate.concat("[NOW-1MONTH+TO+*]");
        }

    }
    
    // Version association v.1.0.2
    var efo = "&efo=true";

    var url = baseUrl.concat(q).concat(pval).concat(or).concat(beta).concat(pubdate).concat(region).concat(trait).concat(genotyping).concat(addeddate).concat(efo).concat(facet);
   
    $('#results-download').removeAttr('href').attr('href', url);

}


function setStats(data) {
    try {
        $('#releasedate-stat').text("Last data release on " + data.date);
        $('#studies-stat').text(data.studies + " publications");
        $('#snps-stat').text(data.snps + " SNPs");
        $('#associations-stat').text(data.associations + " unique SNP-trait associations");
        $('#genomebuild').text("Genome assembly " + data.genebuild);
        $('#dbsnpbuild').text("dbSNP Build " + data.dbsnpbuild);
        $('#ensemblbuild').text("Ensembl Build " + data.ensemblbuild);
        $('#catalog-stats').show();
    }
    catch (ex) {
        console.log("Failure to process stats " + ex);
    }
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function addLoadingDiv(divId) {
    var ctrl = $(divId);
    
    //uncomment for mask
    /*ctrl.append('<div class="exposeMask" style="width: ' + ctrl.width() + '; height: ' + ctrl.height() + '; opacity = .5;"></div>');*/
    
    var left = ((ctrl.width() / 2) - 50) + 'px';
    var top = ((ctrl.height() / 2) - 25) + 'px';
    loadingDiv = '<div class="ajaxLoadingMore" style="top: ' + top + '; left: ' + left + ';">Loading...</div>';
    ctrl.addClass('loading');
    ctrl.append(loadingDiv);
}


