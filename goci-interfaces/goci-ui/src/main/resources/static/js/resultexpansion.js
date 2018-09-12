/**
 * Created by dwelter on 17/02/15.
 */


$(document).ready(function() {
    $('#expand-table').click(function() {
        //if the table is collapsed, expand it
        if ($(this).hasClass('table-collapsed')) {
            loadAdditionalResults("study", true);
        }
        //else collapse it
        else {
            //$('#study-table-body').find('.hidden-resource').collapse('hide');
            $('#study-table-body').find('.hidden-study-row').collapse('hide');
            $('#study-table-body').find('span.tgb').removeClass('glyphicon-minus').addClass('glyphicon-plus');
            $(this).addClass('table-collapsed');
            $(this).empty().text("Expand all studies");

            if (!window.location.hash) {
                $('#study-table-body').find('tr:gt(29)').remove();
                $('#study-summaries').addClass('more-results');
                $('.study-toggle').empty().text("Show more results");
            }
        }
    });

    $('.study-toggle').click(function() {

        if ($('#study-summaries').hasClass('more-results')) {
            console.log("More results to load");
            loadAdditionalResults("study", false);
            $(this).empty().text("Show fewer results");
        }
        else {
            $(this).empty().text("Show more results");
            $('#study-summaries').addClass('more-results');
            if ($('#filter-form').hasClass('in-use')) {
                doFiltering();
            }
            else if ($('#study-summaries').find('th').find('span.sorted').length != 0) {
                var id = $('#study-summaries').find('span.sorted').parent('th').attr('id');
                var field = id;

                if (id.indexOf('-') != -1) {
                    field = id.split('-')[0];
                }

                if ($('#study-summaries').find('span.sorted').hasClass('asc')) {
                    field = field.concat('+asc');
                }
                else {
                    field = field.concat('+desc');
                }
                doSortingSearch("study", field, id);
            }
            else {
                loadResults();
            }
        }
    });

    $('.association-toggle').click(function() {
        if ($('#association-summaries').hasClass('more-results')) {
            console.log("More results to load");
            loadAdditionalResults("association", false);
            $(this).empty().text("Show fewer results");
        }
        else {
            $(this).empty().text("Show more results");
            $('#association-summaries').addClass('more-results');
            if ($('#filter-form').hasClass('in-use')) {
                doFiltering();
            }
            else if ($('#association-summaries').find('th').find('span.sorted').length != 0) {
                var id = $('#association-summaries').find('span.sorted').parent('th').attr('id');
                var field = id;

                if (id.indexOf('-') != -1) {
                    field = id.split('-')[0];
                }

                if ($('#association-summaries').find('span.sorted').hasClass('asc')) {
                    field = field.concat('+asc');
                }
                else {
                    field = field.concat('+desc');
                }
                doSortingSearch("association", field, id);
            }
            else {
                loadResults();
            }
        }
    });

    $('.efotrait-toggle').click(function() {
        if ($('#efotrait-summaries').hasClass('more-results')) {
            console.log("More results to load");
            loadAdditionalResultsTraitNoEFODocs(true);
            $(this).empty().text("Show fewer results");

        }
        else {
            $(this).empty().text("Show more results");
            loadAdditionalResultsTraitNoEFODocs(false);
        }
    });


});


function loadAdditionalResults(facet, expand) {
    var sort = '';
    var id = '';

    //check if there's already a sort on the table
    if ($('#' + facet + '-summaries').find('span.sorted').length != 0) {
        id = $('#' + facet + '-summaries').find('span.sorted').parent('th').attr('id');
        sort = id;
        if (id.indexOf('-') != -1) {
            sort = id.split('-')[0];
        }
        if ($('#' + facet + '-summaries').find('span.sorted').hasClass('asc')) {
            sort = sort.concat('+asc');
        }
        else {
            sort = sort.concat('+desc');
        }
    }
    var queryTerm = $('#query').text();

    var pval = processPval();
    var or = processOR();
    var beta = processBeta();
    var date = processDate();
    var region = processGenomicRegion();
    var traits = processTraitDropdown();
    var genotypingTechnologies = processGenotypingTechnologyDropdown();
    

    if ($('#filter').text() != '') {

        if ($('#filter').text() != 'recent' && traits == '') {
            var terms = $('#filter').text();
            terms = terms.replace(/\s/g, '+');

            traits = terms.split('|');
        }
        else if ($('#filter').text() == 'recent' && date == '') {
            date = "[NOW-1MONTH+TO+*]";

            if (sort == '') {
                sort = "catalogPublishDate+desc";
            }
        }
    }

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
    // spinner
    $("#"+facet+"_spinner").show();
    $("#"+facet+"-table").hide();
    $.getJSON('api/search/moreresults',
              {
                  // 'q': searchTerm,
                  'q': searchPhrase,
                  'max': 1000,
                  'facet': facet,
                  'pvalfilter': pval,
                  'orfilter': or,
                  'betafilter': beta,
                  'datefilter': date,
                  'genomicfilter': region,
                  'traitfilter[]': traits,
                  'genotypingfilter[]': genotypingTechnologies,
                  'sort': sort
              })
            .done(function(data) {
                addResults(data, expand, id);
                $("#"+facet+"_spinner").hide();
                $("#"+facet+"-table").show();
            })
            .fail(function (jqXHR, textStatus, err) {
                 alert("Something went wrong.");
            })
            .always(function () {
                $("#"+facet+"-table").show();
                $("#"+facet+"_spinner").hide();
                });
}

function addResults(data, expand, id) {
    if (data.error != null) {
        var sorter = $('#' + id).find('span.sorted');
        sorter.removeClass('asc desc glyphicon-arrow-up glyphicon-arrow-down').addClass("glyphicon-sort unsorted");
    }
    else {
        var documents = data.response.docs;
        console.log("Got a bunch of docs: " + documents.length);

        setDownloadLink(data.responseHeader.params);

        $('#study-summaries').removeClass('more-results');

        var divResult = $('#resultQuery').empty();

        for (var j = 0; j < documents.length; j++) {
                try {
                    var doc = documents[j];
    
                    var table = $('<table class="border-search-box">');
                    var tbody = table.append('<tbody />').children('tbody');
                    var row = $("<tr>");
                    var linkFullPValue = '';
                    var genotypingIcon = '';
    
    
                    if (doc.resourcename == "publication") {
                        var fullpvalset = doc.fullPvalueSet;
                        if(fullpvalset == 1) {
            
                            var a = (doc.authorAscii_s).replace(/\s/g,"");
                            //var dir = a.concat("_").concat(doc.pmid).concat("_").concat(doc.accessionId);
            
                            var ftplink = "<a href='ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/"
                                .concat("' target='_blank'</a>");
            
                            linkFullPValue = ftplink.concat("<span class='glyphicon glyphicon-signal clickable context-help'" +
                                " data-toggle='tooltip'" +
                                "data-original-title='Click for summary statistics'></span></a>");
            
                        }
        
                        if ((doc.genotypingTechnologies.indexOf("Targeted genotyping array") > -1) ||
                            (doc.genotypingTechnologies.indexOf("Exome genotyping array") > -1) ) {
                            genotypingIcon="<a href='#'><span class='glyphicon targeted-icon-GWAS_target_icon clickable context-help'" +
                                " data-toggle='tooltip'" +
                                "data-original-title='Targeted or exome array study'></span></a>";
                        }
        
        
                        var pubLabsUrl= gwasProperties.contextPath+"publications/"+doc.pmid;
                        row.append($("<td rowspan='2' style='width: 3%'>").html(''));
                        row.append($("<td style=\"width: 94%\">").html("<h3><span class='letter-circle'>&nbsp;P&nbsp;</span><a href="+pubLabsUrl+">"+doc.title+"</a></h3>"));
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
    
    
                    tbody.append(row);
                    // Function to parse the description
                    var rowDescription = $("<tr>");
                    var descriptionTruncated = doc.description;

                    // Add custom formatting for Variant description
                    if (doc.resourcename == "variant") {
                        var descriptionElements = descriptionTruncated.split("|");
                        var variantDescription = "<b>Location: </b>"+descriptionElements[0] +
                            "; <b>Cytogenetic region:</b>" + descriptionElements[1] +
                            "; <b>Most severe consequence: </b>" + descriptionElements[2] +
                            "; <b>Mapped gene(s): </b>" + descriptionElements[3];
                        console.log("** VarDesc: "+variantDescription);
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
                    if (linkFullPValue != "") {
                        descriptionTruncated = descriptionTruncated+"&nbsp;"+linkFullPValue;
                    }
                    if (genotypingIcon != "") {
                        descriptionTruncated = descriptionTruncated + "&nbsp;"+genotypingIcon;
                    }
    
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


    }
}

