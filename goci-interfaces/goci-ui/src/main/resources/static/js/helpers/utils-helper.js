/*
The following variables are used by all dedicated pages:
 */
var global_fl;
var global_raw;

// This is the global variable storing solr fields:
global_fl = 'accessionId,ancestralGroups,ancestryLinks,associationCount,association_rsId,authorAscii_s,author_s,authorsList,' +
    'betaDirection,betaNum,betaUnit,catalogPublishDate,chromLocation,chromosomeName,chromosomePosition,context,' +
    'countriesOfRecruitment,currentSnp,efoLink,ensemblMappedGenes,fullPvalueSet,genotypingTechnologies,id,initialSampleDescription,' +
    'label,labelda,mappedLabel,mappedUri,merged,multiSnpHaplotype,numberOfIndividuals,orPerCopyNum,orcid_s,pValueExponent,' +
    'pValueMantissa,parent,positionLinks,publication,publicationDate,publicationLink,pubmedId,qualifier,range,region,' +
    'replicateSampleDescription,reportedGene,resourcename,riskFrequency,rsId,shortForm,snpInteraction,strongestAllele,studyId,' +
    'synonym,title,traitName,traitName_s,traitUri,platform';
global_raw = 'fq:resourcename:association or resourcename:study';

// Number of rows displayed on the datatables
pageRowLimit = 5;

/** DRY. From Xin original code. Helper to share between modules! */
/**
 * Display an overlay spinner on a tag
 * https://gasparesganga.com/labs/jquery-loading-overlay/
 * @param {String} tagID
 * @returns undefined
 * @example showLoadingOverLay('#efoInfo')
 */
showLoadingOverLay = function(tagID){
    var options = {
        color: "rgba(255, 255, 255, 0.8)",   // String
        custom: "",                // String/DOM Element/jQuery Object
        fade: [100, 1500],                      // Boolean/Integer/String/Array
        fontawesome: "",                          // String
//            image: "data:image/gif;base32,...",  // String
        imagePosition: "center center",             // String
        maxSize: "100px",                  // Integer/String
        minSize: "20px",                    // Integer/String
        resizeInterval: 10,                       // Integer
        size: "20%",                       // Integer/String
        zIndex: 1000,                        // Integer
    }
    $(tagID).LoadingOverlay("show",options);
}


/**
 * Hide an overlay spinner on a tag
 * https://gasparesganga.com/labs/jquery-loading-overlay/
 * @param {String} tagID
 * @returns undefined
 * @example hideLoadingOverLay('#efoInfo')
 */
hideLoadingOverLay = function(tagID){
    return $(tagID).LoadingOverlay("hide", true);
}

// Generate an internal link to the GWAS search page
function setQueryUrl(query, label) {
    if (!label) {
        label = query;
    }
    return '<a href="/gwas/search?query='+query+'">'+label+'</a>';
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

// Generate an internal link (text only)
function setInternalLinkText(url,label) {
    return '<a href="'+url+'">'+label+'</a>';
}

// Generate an external link (text only)
function setExternalLinkText(url,label) {
    return '<a href="'+url+'" target="_blank">'+label+'</a>';
}

// Generate an external link (icon only)
function setExternalLinkIcon(url) {
    return '<a href="'+url+'" class="glyphicon glyphicon-new-window external-link" title="External link" target="_blank"></a>';
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

/*
The mapped trait links are extracted from efoLink if that is present. If not, mappedLabel and mappedUri is used as
source of information.
 */
function setTraitsLink(study) {

    // A collection of EFO trait labels and the corresponding short links:
    var efoLabelUriPairs = {};

    // Formatted links to trait pages:
    var efoTraitLinks = [];

    // Check if the efoUri exists:
    if ('efoLink' in study){
        $.each(study.efoLink, function (index, efoLink) {
            var label = efoLink.split("|")[0];
            var link = efoLink.split("|")[1];
            efoLabelUriPairs[label] = link;
        });
    }
    // If efoUri does not exists, use mappedLabel and mappedUri instead
    else {
        $.each(study.mappedLabel, function (index, label) {
            var link = study.mappedUri[index].split("/").pop();
            efoLabelUriPairs[label] = link;
        });
    }

    // Generating links to mapped trait labels:
    $.each(efoLabelUriPairs, function (label, link) {
        var traitPageLink = gwasProperties.contextPath + 'efotraits/' + link;
        efoTraitLinks.push(setExternalLinkText(traitPageLink, label));
    });

    return efoTraitLinks.join(", ");
}


// Display the Ancestry array as a HTML list
function displayAncestryLinksAsList(data_array) {
    var initial_data_text = '';
    var replicate_data_text = '';

    if (data_array) {
        // Curation protocol: if there is one set of ancestry it will be initial/discovery
        // study is not eligible without initial/discovery stage whereas replication stage is optional
        if (data_array.length == 1) {
            var initial;

            var initial_list = $('<ul/>');
            initial_list.css('padding-left', '0px');


            if (data_array[0].startsWith('initial')) {
                initial = data_array[0].split('|');
                initial = initial[4] + ' ' + initial[3];
                initial_list.append(newItem(initial))
            }

            initial_data_text = initial_list;
            replicate_data_text = "-";
        }
        else if (data_array.length > 1) {
            var initial_list = $('<ul/>');
            initial_list.css('padding-left', '0px');

            var replicate_list = $('<ul/>');
            replicate_list.css('padding-left', '0px');

            var replicate_count = 0;

            for (var i = 0; i < data_array.length; i++) {
                var initial;
                var replicate;
                if (data_array[i].startsWith('initial')) {
                    // Example data: initial|NR|U.S.|Hispanic or Latin American|6499|NA
                    initial = data_array[i].split('|');
                    initial = initial[4] + ' ' + initial[3];
                    initial_list.append(newItem(initial))
                }
                else {
                    replicate_count++;
                    replicate = data_array[i].split('|');
                    replicate = replicate[4] + ' ' + replicate[3];
                    replicate_list.append(newItem(replicate))
                }
            }
            initial_data_text = initial_list;
            if (replicate_count == 0) {
                replicate_list = "-";
            }
            replicate_data_text = replicate_list;
        }
    }
    return {initial_data_text: initial_data_text, replicate_data_text: replicate_data_text};
}


// Display the input array as a HTML list
function displayAuthorsListAsList(data_array) {
    var data_text = '';
    
    if (data_array) {
        if (data_array.length == 1) {
            data_text = data_array[0];
        }
        else if (data_array.length > 1) {
            var list = "";
            $.each(data_array, function(index, value) {
                var author_orchid = value.split(" | ");
                if(typeof author_orchid[3] === 'undefined') {
                    list = list.concat(author_orchid[0] + ", ");
                }
                else {
                    var orchid = '&nbsp;<a href="https://orcid.org/'+author_orchid[3]+'" target="_blank"><img alt="Orcid profile" src="https://orcid.org/sites/default/files/images/orcid_16x16.png" width="16" height="16" hspace="4" /></a>';
                    list = list.concat(author_orchid[0] + orchid +", ");
                }
                
                
            });
            data_text = list.slice(0, -2);
        }
    }
    return data_text;
}

// Toogle a table and scroll to it.
function toggle_and_scroll (id) {
    if ($(id +" div:first-child").find('span').hasClass('panel-collapsed')) {
        toggleSidebar(id + ' span.clickable');
    }
    $(window).scrollTop($(id).offset().top - 70);
}

// Create a list item tag (<li>) and add content in it
function newItem(content) {
    return $("<li></li>").html(content);
}


function setDownloadLink(query) {
    var baseUrl = gwasProperties.contextPath+'api/search/downloads?';
    var q = "q=".concat(query);
    
    var facet = '&facet=association';
    var efo = '&efo=true';
    var params = '&pvalfilter=&orfilter=&betafilter=&datefilter=&genomicfilter=&genotypingfilter[]=&traitfilter[]=&dateaddedfilter=';
    
    
    var url = "window.open('".concat(baseUrl).concat(q).concat(params).concat(facet).concat(efo).concat("',    '_blank')");
    
    $("#download_data").attr('onclick', url);
    
}


function setTraitDownloadLink(queryParam) {
    if (queryParam.length >= 300) {
        $('#download_data').prop('disabled', true);
        $('#download_data').hide();
        $('#download_doc_page').show();
    }
    else {
        $('#download_doc_page').hide();
        $('#download_data').prop('disabled', false);

        var inputParams = queryParam.join(",");
        $("#queryInput").val(inputParams);
        $('#download_data').show();
    }
}


/**
 * Linkout to Downloads page
 */
$('#download_doc_page').click(() => {
    window.open("https://www.ebi.ac.uk/gwas/docs/file-downloads", '_blank');
})

