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
        var boost_field = ' OR title:"'.concat(queryTerm).concat('"');
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
        var boost_field = ' OR title:"'.concat(queryTerm).concat('"');
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

        // if (data.responseHeader.params.fq == "resourcename:study" ||
        //         $.inArray("resourcename:study", data.responseHeader.params.fq) != -1) {
        //     console.log("Processing data for: "+data.responseHeader.params.fq);
            // var studyTable = $('#study-table-body').empty(); //only removes the first table, each result is now a table
            $('#study-summaries').removeClass('more-results');

            var divResult = $('#resultQuery').empty();

            for (var j = 0; j < documents.length; j++) {
                try {
                    var doc = documents[j];

                    var table = $('<table class="gwas2table" id="study-table">');
                    var tbody = table.append('<tbody />').children('tbody');
                    var row = $("<tr>");
                    if (doc.resourcename == "study") {
                        var studyLabsUrl = gwasProperties.contextPath+"studies/"+doc.accessionId

                        row.append($("<td align=\"center\" style=\"width: 12%\">").html('<img  src="/gwas-ui/icons/GWAS_study_2017.png" width="48" height="48">'));
                        row.append($("<td style=\"width: 88%\">").html("<h3><a href="+studyLabsUrl+">"+doc.title+"</a></h3>"));
                    }
                    if (doc.resourcename == "publication") {
                        var pubLabsUrl = gwasProperties.contextPath+"publications/"+doc.pmid

                        row.append($("<td align=\"center\" style=\"width: 12%\">").html('<img src="/gwas-ui/icons/GWAS_publication_2017.png" width="48" height="48">'));
                        row.append($("<td style=\"width: 88%\">").html("<h3><a href="+pubLabsUrl+">"+doc.title+"</a></h3>"));
                    }
                    if (doc.resourcename == "trait") {
                        var efoLabsUrl = gwasProperties.contextPath+"efotraits/"+doc.shortForm

                        row.append($("<td align=\"center\" style=\"width: 12%\">").html('<img  src="/gwas-ui/icons/GWAS_trait_2017.png" width="48" height="48">'));
                        row.append($("<td style=\"width: 88%\">").html("<h3><a href="+efoLabsUrl+">"+doc.title+"</a></h3>"));
                    }
                    if (doc.resourcename == "variant") {
                        row.append($("<td align=\"center\" style='width: 12%'>").html('<img src="/gwas-ui/icons/GWAS_variant_2017.png" width="48" height="48">'));
                        row.append($("<td style=\"width: 88%\">").html("<h3>"+doc.title+"</h3>"));
                    }
                    if (doc.resourcename == "gene") {
                        row.append($("<td align=\"center\" style='width: 12%'>").html('<img src="/gwas-ui/icons/dna13.png" width="48" height="48">'));
                        row.append($("<td style=\"width: 88%\">").html("<h3>"+doc.title+"</h3>"));
                    }

                    tbody.append(row);
                    var rowDescription = $("<tr>");
                    rowDescription.append($("<td style=\"width: 12%\">").html(""));
                    rowDescription.append($("<td style=\"width: 88%\">").html("<h4>"+doc.description+"</h4>"));
                    // console.log(rowDescription)
                    tbody.append(rowDescription);
                    divResult.append(table);
                    divResult.append("<br>");


                }
                catch (ex) {
                    console.log("Failure to process document " + ex);
                }
            }
        // }

        // TODO: Check if still needed with change to document types, we no longer have "association"
        // else if (data.responseHeader.params.fq == "resourcename:association" ||
        //         $.inArray("resourcename:association", data.responseHeader.params.fq) != -1) {
        //     console.log("Processing associations");
        //     var associationTable = $('#association-table-body').empty();
        //     $('#association-summaries').removeClass('more-results');
        //
        //     for (var j = 0; j < documents.length; j++) {
        //         try {
        //             var doc = documents[j];
        //             processAssociation(doc, associationTable);
        //         }
        //         catch (ex) {
        //             console.log("Failure to process document " + ex);
        //         }
        //     }
        // }
        //
        // if (expand) {
        //     $('.study-toggle').empty().text("Show fewer results");
        //     $('#study-table-body').find('.hidden-study-row').collapse('show');
        //     $('#study-table-body').find('span.tgb').removeClass('glyphicon-plus').addClass('glyphicon-minus');
        //     $('#expand-table').removeClass('table-collapsed').addClass('table-expanded');
        //     $('#expand-table').empty().text("Collapse all studies");
        // }
    }
}

