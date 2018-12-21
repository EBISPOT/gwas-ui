/**
 * Created by Laurent on 22/08/2016.
 */

var SearchState = {
    LOADING: {value: 0},
    NO_RESULTS: {value: 1},
    RESULTS: {value: 2}
};

var EPMC = "http://www.europepmc.org/abstract/MED/";
var OLS  = "https://www.ebi.ac.uk/ols/search?q=";
var ENSVAR = "https://www.ensembl.org/Homo_sapiens/Variation/";
var DBSNP  = "http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?rs=";
var UCSC   = "https://genome.ucsc.edu/cgi-bin/hgTracks?hgFind.matches=";
var ENS_SHARE_LINK = 'Variant_specific_location_link/97NKbgkp09vPRy1xXwnqG1x6KGgQ8s7S';
var CONTEXT_RANGE = 500;
var global_raw = 'fq:resourcename:association or resourcename:study'
var list_min = 5;
var pageRowLimit=5;

/**
 * Make solr query.
 * @param {String} mainEFO
 * @param {[]String} additionalEFO
 * @param {[]String} descendants
 * @param {Boolean} initLoad
 * @returns {Promise}
 */
function getDataSolr(main, initLoad=false) {
    
    var searchQuery = main;
    
    console.log("Solr research request received for " + searchQuery);
    return promisePost( gwasProperties.contextPath + 'api/search/advancefilter',
        {
            'q': '"' + searchQuery + '"' ,
            'max': 99999,
            'group.limit': 99999,
            'group.field': 'resourcename',
            'facet.field': 'resourcename',
            'hl.fl': 'shortForm,efoLink',
            'hl.snippets': 100,
            'fl' : '*',
            // 'fq' : global_fq == undefined ? '*:*':global_fq,
            'raw' : global_raw == undefined ? '' : global_raw,
        },'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
        //processSolrData(data, initLoad);
        processVariantData(data,searchQuery);
        console.log("Solr research done for " + searchQuery);
        return data;
    }).catch(function(err) {
        console.error('Error when searching solr for' + searchQuery + '. ' + err);
        throw(err);
    })
    
}



$(document).ready(function() {

    var searchTerm = $('#query').text();
    console.log("Loading search module!");
    console.log("rsID: "+searchTerm);
    if (searchTerm != '') {
        console.log("Start search for the variant "+searchTerm);
        getVariantData(searchTerm);
    }
    getVariantInfoFromEnsembl(searchTerm);
});

function getVariantData(rsId) {
    console.log("Solr research request received for " + rsId);
    setState(SearchState.LOADING);
    /*$.getJSON('../api/search/association',
              {
                  'q': "rsId:"+rsId,
                  'max': 1000
              })
              .done(function(data) {
                  console.log(data.response);
                  processVariantData(data.response,rsId);
              });
    */
    var solrPromise = getDataSolr(rsId, false);
    console.log("Solr research done for " + rsId);
}

// Parse the Solr results and display the data on the HTML page
function processVariantData(data,rsId) {
    // Check if Solr returns some results
    if (data.grouped.resourcename.groups.length == 0) {
        $('#lower_container').html("<h2>The variant <em>"+rsId+"</em> cannot be found in the GWAS Catalog database</h2>");
    }
    else {
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
        // Variant summary panel
        getVariantInfo(data_association.docs);
        // External links panel
        getLinkButtons(data_association.docs,rsId);

        displayDatatableAssociations(data_association.docs);
        displayDatatableStudies(data_study.docs);
        checkSummaryStatsDatabase(data_study.docs);
        //downloads link : utils-helper.js
        setDownloadLink(rsId);
    }
    $('[data-toggle="tooltip"]').tooltip();
}

// CM Patch: To remove ASAP. Solr index issue.
function getSolrProperty(data, property) {
    var property_value = '';
    var index = 0;
    var valid_index = 0;
    var data_size = data.length;

    if (data_size > 0) {
        while (index < data_size) {
            if (data[index].hasOwnProperty(property)) {
                valid_index = index;
                //property_value = data[index][property];
                index = data_size + 1;
            }
            else { index = index + 1; }
        }
    }

    return valid_index;

}


function getVariantInfo(data,rsId) {
    var valid_index = getSolrProperty(data,'context');
    var data_sample = data[valid_index];

    if (data_sample.chromLocation) {
        var location = data_sample.chromLocation[0];
    }

    if (data_sample.region) {
        var region = data_sample.region[0];
    }

    if (data_sample.context) {
        var func = data_sample.context[0];
    }

    var genes_mapped = [];
    var genes_mapped_url = [];
    var traits_reported = [];
    var traits_reported_url = [];
    var all_mapped_traits = [];
    $.each(data, function (index, doc) {
        // Mapped genes
        if (doc.hasOwnProperty('entrezMappedGenes')) {
            var gene_list = [];
            $.each(doc.entrezMappedGenes, function(index, gene) {
                // check if "gene" contains multiple values, e.g. ["GCKR; GCKR"]
                if (gene.indexOf(";") > 0) {
                    gene_list = gene.split("; ");

                    $.each(gene_list, function(index, split_gene) {
                        if (jQuery.inArray(split_gene, genes_mapped) == -1) {
                            genes_mapped.push(split_gene);
                        }
                    });
                }
                else {
                    if (jQuery.inArray(gene, genes_mapped) == -1) {
                        genes_mapped.push(gene);
                        // remove link
                        // genes_mapped_url.push(setQueryUrl(gene));
                        genes_mapped_url.push(gene);
                    }
                }
            });
        }

        // Mapped Traits
        var mapped_traits = doc.mappedLabel;
        if (doc.mappedLabel) {
            $.each(mapped_traits, function(index, mapped_trait) {
                var link = gwasProperties.contextPath + 'efotraits/' + doc.mappedUri[index].split('/').slice(-1)[0];
                mapped_traits[index] = setInternalLinkText(link, mapped_trait);
                // add unique traits only
                if (jQuery.inArray(mapped_traits[index], all_mapped_traits) == -1) {
                    all_mapped_traits.push(mapped_traits[index]);
                }
            });
        }
        // sort multi-word traits in alphabetical order
        all_mapped_traits.sort(function(a,b) {
            // extract trait label from URL
            var a_first_word_index = parseInt(a.indexOf(">")) + 1;
            var a_last_word_index = a.indexOf("</a>");
            var a_words = a.slice(a_first_word_index, a_last_word_index).toLowerCase();

            var b_first_word_index = parseInt(b.indexOf(">")) + 1;
            var b_last_word_index = b.indexOf("</a>");
            var b_words = b.slice(b_first_word_index, b_last_word_index).toLowerCase();

            // find shortest trait label
            var shortest_trait_label;
            if (a_words.split(' ').length < b_words.split(' ').length) {
                shortest_trait_label = a_words.split(' ').length;
            } else {
                shortest_trait_label = b_words.split(' ').length;
            }

            // find word index in trait label to compare for alphabetical ordering, some traits
            // start with the same word, e.g. coronary artery disease vs. coronary heart disease
            for (var i = 0; i < shortest_trait_label; i++) {
                if (a_words.split(' ')[i] == b_words.split(' ')[i]) {
                    continue;
                }
                else {
                    break;
                }
            }

            if (a_words.split(' ')[i] < b_words.split(' ')[i]) {
                return -1;
            }
            if (a_words.split(' ')[i] > b_words.split(' ')[i]) {
                return 1;
            }
            return 0;
        });
        $("#traits").html(all_mapped_traits.join(', '));

        // Reported traits
        var traits = [];
        if (doc.traitName) {
            $.each(doc.traitName, function(index, trait) {
                if (jQuery.inArray(trait, traits_reported) == -1) {
                    traits_reported.push(trait);
                    // remove link
                    // traits_reported_url.push(setQueryUrl(trait));
                    traits_reported_url.push(trait);
                }
            });
        }
    });
    genes_mapped_url.sort();
    traits_reported_url.sort();

    // Reported Traits display
    if (traits_reported.length <= list_min) {
        $("#variant-traits").html(traits_reported_url.join(', '));
    }
    else {
        $("#variant-traits").html(longContentList("gwas_traits_div", traits_reported_url, 'traits'));
    }

    // Location
    if (jQuery.type(location) == 'undefined') {
        $("#variant-location").html('Variant does not map to the genome');
        $("._ld_graph").html('Variant does not map to the genome');
    }
    else {
        $("#variant-location").html(location);
        displayLDPlot();
    }

    // Cytogenetic region
    $("#variant-region").html(region);

    // Most severe consequence
    if (func) {
        $("#variant-class").html(variationClassLabel(func));
    }

    // Mapped genes
    if (genes_mapped_url.length != 0) {
        $("#variant-mapped-genes").html(genes_mapped_url.join(', '));
    }

    $("#variant-summary-content").html(getSummary(data));
}


// Generate the summary sentence, at the bottom of the summary panel
function getSummary(data) {
    var first_report  = getFirstReportYear(data);
    var count_studies = countStudies(data);

    if (count_studies == 0) {
        count_studies = '';
    }
    else if (count_studies == 1) {
        count_studies = '<b>1</b> study reports this variant';
    }
    else if (count_studies > 1) {
        count_studies = '<a class="inpage-link" onclick="toggle_and_scroll('+"'"+'#study_panel'+"'"+')"><b>'+count_studies+'</b> studies report this variant</a>';
    }

    if (first_report != '' && count_studies != '') {
        first_report += ', ';
    }
    return first_report+count_studies;
}

// Create external link buttons
function getLinkButtons (data,rsId) {
    var valid_index = getSolrProperty(data,'chromosomeName');
    var data_sample = data[valid_index];
    if (data_sample.chromosomeName) {
        var chr = data_sample.chromosomeName[0];
    }
    if (data_sample.chromosomePosition) {
        var pos = data_sample.chromosomePosition[0];
    }
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
    // LD removed. SAB 2018
    //$("#ens_ld_button").attr('onclick',  "window.open('"+ENSVAR+"HighLD?v="+rsId+"', '_blank')");
}

// Pick up the most recent publication year
function getFirstReportYear(data) {
    var study_date = '';
    $.each(data, function(index,asso) {
        var p_date = asso.publicationDate;
        var year = p_date.split('-')[0];
        if (year < study_date || study_date == '') {
            study_date = year;
        }
    });
    if (study_date != '') {
        study_date = "Variant first reported in GWAS Catalog in <b>" + study_date + "</b>";
    }
    return study_date;
}

// Pick up the most recent publication year
function countStudies(data) {
    var study_text = '';
    var studies = [];
    $.each(data, function(index,asso) {
        var study_id = asso.studyId;
        if (jQuery.inArray(study_id, studies) == -1) {
            studies.push(study_id);
        }
    });
    return studies.length;
}

// Display the input array as a HTML list
function displayArrayAsList(data_array) {
    var data_text = '';

    if (data_array) {
        if (data_array.length == 1) {
            data_text = data_array[0];
        }
        else if (data_array.length > 1) {
            var list = $('<ul/>');
            list.css('padding-left', '0px');
            $.each(data_array, function(index, value) {
                list.append(newItem(value));
            });
            data_text = list;
        }
    }
    return data_text;
}

// Generate an internal link to the GWAS search page
function setQueryUrl(query, label) {
    if (!label) {
        label = query;
    }
    return '<a href="'+gwasProperties.contextPath+'search?query='+query+'">'+label+'</a>';
}

// Generate an internal link to page
function setTraitPageUrl(query, label) {
    if (!label) {
        label = query;
    }
    return '<a href="'+gwasProperties.contextPath+'efotraits/'+query+'">'+label+'</a>';
}

// Update the display of the variant functional class
function variationClassLabel(label) {
    var new_label = label.replace(/_/g, ' '); // Replace all the underscores by a space
    return new_label.charAt(0).toUpperCase() + new_label.slice(1);
}

// Generate an external link (text + icon)
function setExternalLink(url,label) {
    return '<a href="'+url+'" target="_blank">'+label+'</a>';

}

// Generate an external link (icon only)
function setExternalLinkIcon(url) {
    return '<a href="'+url+'" class="glyphicon glyphicon-new-window external-link" title="External link" target="_blank"></a>';
}

// Create a cell tag (<td>) and add content in it
function newCell(content) {
    return $("<td></td>").html(content);
}

// Create a list item tag (<li>) and add content in it
function newItem(content) {
    return $("<li></li>").html(content);
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

// Toogle a table and scroll to it.
function toggle_and_scroll (id) {
    if ($(id +" div:first-child").find('span').hasClass('panel-collapsed')) {
        toggleSidebar(id + ' span.clickable');
    }
    $(window).scrollTop($(id).offset().top - 70);
}

function getVariantInfoFromEnsembl(rsId) {
    $.getJSON('https://rest.ensembl.org/variation/human/'+rsId+'?content-type=application/json')
            .done(function(data) {
                console.log(data);
                processVariantInfoFromEnsembl(rsId,data);
            })
            .fail(function() {
                console.log('Call failed')
            });
    console.log("Ensembl REST query done to retrieve variant information");
}

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
            window.location = "variant";
    }
}

