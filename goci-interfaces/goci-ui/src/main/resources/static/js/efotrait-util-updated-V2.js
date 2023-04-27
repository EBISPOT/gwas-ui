/**
 * Created by Trish on 20-May-2020
 */


var global_color_url_batch = gwasProperties.GWAS_REST_API + '/parentMappings';
var global_color_url = gwasProperties.GWAS_REST_API + '/parentMapping/';
// var global_color_url = 'https://www.ebi.ac.uk/gwas/rest/api/parentMapping/';
if (!gwasProperties.host.includes('ebi.ac.uk')) {
    global_color_url = 'http://gwas-snoopy:9780/gwas/rest/api/parentMapping/'
}

var global_gwas_trait_api = `${gwasProperties.GWAS_REST_API}/efoTraits/`;
if (gwasProperties.host.includes('localhost')) {
    global_gwas_trait_api = 'https://www.ebi.ac.uk/gwas/rest/api/efoTraits/';
}

var global_ols_efo_term = 'https://www.ebi.ac.uk/ols/ontologies/efo/terms?iri=';
var global_ols_api_efo_terms = 'https://www.ebi.ac.uk/ols/api/ontologies/efo/terms/';
var global_ols_efo_hierarchical_descendents = 'https://www.ebi.ac.uk/ols/api/ontologies/efo/hierarchicalDescendants';

var global_efo_info_tag_id = '#efo-info';
var global_epmc_api = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
var global_oxo_api = 'https://www.ebi.ac.uk/spot/oxo/api/';

/**
 * global variable storing solr query result.
 */
var data_efo={};
var data_study={};
var data_association={};
var data_diseasetrait={};
var data_facet={};
var data_highlighting={};

/**
 * Other global setting
 */
var pageRowLimit=5;

var childEfos = [];

/**
 * Linkout to OLS page for the main EFO term
 */
$('#ols-link').click(() => {
    // Single encode EFO term URI for use with OLS Web site
    let efoTermUri;
    if (getMainEFO().startsWith('MONDO')) {
        efoTermUri = 'http://purl.obolibrary.org/obo/'
    }
    else {
        efoTermUri = 'http://www.ebi.ac.uk/efo/';
    }
    let olsWebEfoTermUri = encodeURIComponent(efoTermUri);
    window.open(`${global_ols_efo_term}${olsWebEfoTermUri}`+ getMainEFO(), '_blank');
});

/**
 * Linkout to OXO page for the main EFO term
 */
$('#oxo-link').click(() => {
    window.open("https://www.ebi.ac.uk/spot/oxo/terms/" + getMainEFO() , '_blank');
});

/**
 * Linkout to Open Targets page for the main EFO term
 */
$('#ot-link').click(() => {
    window.open("https://www.targetvalidation.org/disease/" + getMainEFO() , '_blank');
});

/**
 * Query PGS Catalog to find matching Trait page
 */
function isTraitInPGS() {
    return promiseGet(gwasProperties.PGS_Trait_REST_URL+getMainEFO(), {}, false)
        .then(JSON.parse).then(function(data) {
            parsePgsTraitResult(data)
        }).catch(function (err) {
            throw(err);
        })
}

function parsePgsTraitResult(data) {
    let x = document.getElementById("pgs-trait-link-div");

    if (data.id) {
        x.style.display = "block";
        $("#pgs-trait-link").attr('onclick', "window.open('" + gwasProperties.PGS_Trait_URL + data.id + "', '_blank')");
    }
}

/**
 * Page is ready to run methods
 */
$(document).ready(() => {
    $('#study_panel').hide();
    $('#locus_panel').hide()
    $('#toggle-data-display').on('change', reloadTablesAndLocusZoom);
    $('#include-bg-traits').on('change', reloadTablesAndLocusZoom);
    // Conditional display of PGS link/button
    isTraitInPGS();

    // Get trait information
    const initialCBState = true;
    displayEFOInfo(initialCBState);
    prepareLocusZoom(false, true);
});

function reloadTablesAndLocusZoom() {
    const associationTable = $('#association-table-v2').DataTable();
    associationTable.ajax.reload();
    const studyTable = $('#study-table-v2').DataTable();
    studyTable.ajax.reload();
    let includeBgTraits = $('#include-bg-traits').is(':checked');
    let includeChildTraits = $('#toggle-data-display').is(':checked');
    setTraitDownloadLink(childEfos.concat([getMainEFO()]));
    prepareLocusZoom(includeBgTraits, includeChildTraits);
}



/**
 * Toggle the data display to either add or remove child EFO trait data from the display
 * in the Association, Study, and LocusZoom plot.
 */
toggleDataDisplay = function () {
    var checkBox = document.getElementById("toggle-data-display");
    var text = document.getElementById("text");
    if (checkBox.checked == true){
        text.style.display = "block";
    } else {
        // text.style.display = "none";
        text.style.display = "block";
    }
};



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
        imagePosition: "center center",             // String
        maxSize: "100px",                  // Integer/String
        minSize: "20px",                    // Integer/String
        resizeInterval: 10,                       // Integer
        size: "20%",                       // Integer/String
        zIndex: 1000,                        // Integer
    };
    $(tagID).LoadingOverlay("show",options);
};

/**
 * Hide an overlay spinner on a tag
 * https://gasparesganga.com/labs/jquery-loading-overlay/
 * @param {String} tagID
 * @returns undefined
 * @example hideLoadingOverLay('#efoInfo')
 */
hideLoadingOverLay = function(tagID){
    return $(tagID).LoadingOverlay("hide", true);
};

/**
 * Display trait count loading message
 * @param traitCount
 */
displayTraitCountLoading = function(traitCount, isDisplayed) {
    let loadingMessage = "Getting data for " + traitCount + " trait(s)";
    if (isDisplayed) {
        $("#trait_cnt_loaded").html(loadingMessage).fadeIn(500);
    }
    else {
        $("#trait_cnt_loaded").html(loadingMessage).fadeOut(200);
    }
};

/**
 * Show loading overlay for panels dependent on data from Fat Solr.
 */
showGroupedPanelLoadingOverlay = function() {
    showLoadingOverLay('#download_data');
    showLoadingOverLay('#toggle-data-display-section');
    showLoadingOverLay('#include-bgs-section');
    // showLoadingOverLay('#association-table-loading');
    // showLoadingOverLay('#study-table-loading');
    // showLoadingOverLay('#locus-plot-row-loading');
};

/**
 * Hide loading overlay for panels dependent on data from Fat Solr.
 */
hideGroupedPanelLoadingOverlay = function() {
    hideLoadingOverLay('#download_data');
    hideLoadingOverLay('#toggle-data-display-section');
    hideLoadingOverLay('#include-bgs-section');
    // hideLoadingOverLay('#association-table-loading');
    // hideLoadingOverLay('#study-table-loading');
    // hideLoadingOverLay('#locus-plot-row-loading');
};


/**
 * Get the main EFO defined by the query url.
 */
getMainEFO = function() {
    return $('#query').text();
};


/**
 * Display the EFO information in the Trait information panel.
 */
displayEFOInfo = function(initCBState) {
    showLoadingOverLay('#summary-panel-loading');
    showGroupedPanelLoadingOverlay();

    const efoId = getMainEFO();

    // Get data from GWAS REST API for term fields
    getEFOInfo(efoId)
        .then((efoInfo) => {
        $('#top-panel-trait-label').html(efoInfo.trait);
        $("#efotrait-label").html(efoInfo.trait);
        $("#efotrait-id").html(efoInfo.shortForm);
    });

    // Get reported traits data from Solr slim for term fields
    getTraitDataSolrSlim(efoId);

    // Get synonyms data from OLS for term fields
    getEFOAttributesFromOLS(efoId);

    // Get EFO term mappings from OXO
    getTermMappings(efoId);

    // TEST - Set-up Hidden form
    getDownloadCatalogData();

    promiseGet(gwasProperties.contextPath + 'api/v2/efotraits/' + getMainEFO() + '/traits/children', {}, false)
        .then(JSON.parse).then(function(data) {
            const childLabels = [];
            for (const e of data) {
                childLabels.push(e.label);
                childEfos.push(e.key);
            }
            setTraitDownloadLink(childEfos.concat([getMainEFO()]));
            $("#efo-child-trait-label").html(longContentList("gwas_child_traits_div", childLabels, 'child traits'));
            hideLoadingOverLay('#summary-panel-loading');
            hideGroupedPanelLoadingOverlay();
        }).catch(function (err) {
            throw(err);
        });

};


/**
 * Query Fat Solr to get data to download from "Download Catalog data" button.
 */
getDownloadCatalogData = function() {
    $("#form1").submit(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Disable download button while file is actively being downloaded
        $('#download_data').prop('disabled', true);

        // Use the values from the hidden form on the trait page, the value is set with "setTraitDownloadLink"
        const searchQuery = $("#queryInput").val();

        // Query Fat Solr using SolrSearchController
        return promisePost( gwasProperties.contextPath + 'api/search/downloads',
            {
                'q': searchQuery
            },'application/octet-stream').then(function(result) {

            const disposition=result.getResponseHeader('Content-Disposition');
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            let fileDownload = 'gwas-association-downloaded_2018-10-12-EFO.tsv';
            if (matches != null && matches[1]) {
                fileDownload = matches[1].replace(/['"]/g, '');
            }
            const download_file= new File([result.response], fileDownload, { type: 'text/tsv' });
            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                window.navigator.msSaveBlob(download_file, filename);
            } else {
                const URL = window.URL || window.webkitURL;
                const downloadUrl = URL.createObjectURL(download_file);

                if (fileDownload) {
                    // use HTML5 a[download] attribute to specify filename
                    const a = document.createElement("a");
                    // safari doesn't support this yet
                    if (typeof a.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = fileDownload;
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    window.location = downloadUrl;
                }
            }
            // Re-enable button after data file download is complete
            $('#download_data').prop('disabled', false);
        }).catch(function(err) {
            console.error('Error downloading file: ' + err);
            throw(err);
        })
    });
};






/**
 * When ploting with descendants, the number of efos increase dramatically.
 * This is to remove the efos that have no annotation in GWAS catalog,
 * thus querying/ploting only those have at lease one annotation
 * @param []String toBeFilter - array of efoIDs
 * @return []String - array of efoIDs that has at least one annotation in the GWAS CATALOG
 * @example filterAvailableEFOs(['EFO_0000400','EFO_1234567'])
 */
filterAvailableEFOs = function(efoTermsToFilter) {
    return getAvailableEFOs(efoTermsToFilter).then(function(availableEFOs){
        if(availableEFOs)
            return efoTermsToFilter.filter(function(n) {
                return Object.keys(availableEFOs).indexOf(n) !== -1;
            });
    })
};

/**
 * Query SOLR for all available efo traits.
 * @return Promise
 * @example http://localhost:8280/gwas/api/search/efotrait?&q=*:*&fq=resourcename:efotrait&group.limit=99999&fl=shortForm
 */
getAvailableEFOs = function() {
    var dataPromise = getDataFromTag(global_efo_info_tag_id,'availableEFOs');

    if (dataPromise == undefined) {
        dataPromise =  promisePost(window.location.pathname.split('/efotraits/')[0] + '/api/search/advancefilter', {
            'q': '*:*',
            'fq': 'resourcename:efotrait',
            'group.limit': 99999,
            'fl' : 'shortForm'
        },'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
            $.each(data.grouped.resourcename.groups, function(index, group) {
                switch (group.groupValue) {
                    case "efotrait":
                        available_efos_docs = group.doclist.docs;
                        break;
                    default:
                }
            });
            var tmp = {};
            available_efos_docs.forEach(function(doc) {
                if (doc.shortForm) {
                    tmp[doc.shortForm[0]] = doc;
                }
            });
            return tmp;
        }).catch(function(err){
            console.error('Error when loading all available EFOs! ' + err);
        });

        //add to tag
        $(global_efo_info_tag_id).data('availableEFOs',dataPromise);

    }else{
        console.debug('Loading all available EFOs from cache.')
    }
    return dataPromise;
};


/**
 * Query GWAS REST API to get all EFO terms
 * with trait data.
 * @returns []
 */
getAllEFOTraits = async function(efoTraitUrl, allEFOIDs, allEFOLabels){
    let allShortForm = [];
    let allTraitLabels = [];

    await promiseGet(efoTraitUrl).then(JSON.parse).then(function (response) {
        $.each(response._embedded.efoTraits, function (index, term) {
            allShortForm.push(term.shortForm);
            allTraitLabels.push(term.trait);
        });

        // Store all child term IDs
        allEFOIDs.push(...allShortForm);

        allEFOLabels.push(...allTraitLabels);

        // Page through all results
        const nextPage = response._links.next.href;

        if (nextPage) {
            return getAllEFOTraits(nextPage, allEFOIDs, allEFOLabels);
        }
    }).catch(function (err) {
        console.debug('Error getting info for: ' + err);
    });
    return [allEFOIDs, allEFOLabels];
};


/**
 * Query GWAS REST API for EFO term information.
 * Note: the GWAS REST API is used since the GWAS data
 * release and EFO release are not in sync so GWAS data
 * may include EFO terms not yet released in EFO on OLS.
 * @param efoId
  * @example getEFOInfo('EFO_0000400')
 */
getEFOInfo = function (efoId) {
    var gwas_trait_url = `${global_gwas_trait_api}${efoId}`;

    return promiseGet(gwas_trait_url).then(JSON.parse).then(function (response) {
        return response;
    }).catch(function (err) {
        console.debug('Error getting info for: ' + efoId + '. ' + err);
    })
};


/**
 * Query Solr Slim for EFO term information.
 * @param mainEFO
  */
getTraitDataSolrSlim = function (efoId) {
    var searchQuery = efoId;

    return promiseGet(gwasProperties.contextPath+'api/search',
        {
            'q': searchQuery,
            'max': 1,
            'resourcename': 'trait',
            'shortForm': searchQuery,
            'wt':'json',
            'dataType': 'jsonp',
        }, 'application/x-www-form-urlencoded').then(JSON.parse).then(function (data) {
        processSolrSlimData(data);
        return data;
    }).catch(function (err) {
        console.error('Error when searching Solr Slim for: ' + searchQuery + '. ' + err);
        throw(err);
    })
};


/**
 * Get list of Reported traits from Solr Slim
 * and set reported trait field.
 * @param data
 */
processSolrSlimData = function(data) {
    var reportedTraits = "";
    $.each(data.response.docs, (index, data) => {
        reportedTraits = data.reportedTrait;
    });

    if (reportedTraits) {
        $("#reported-traits").html(longContentList("gwas_reported_traits_div",
            reportedTraits.sort(),
            'reported traits'));
    }
};


/**
 * Query OLS for EFO term information for display of
 * other term attributes (e.g. description, synonyms) since
 * these are not stored in the GWAS (SPOTPRO) database and therefore
 * not returned from the GWAS REST API.
 * @param efoId
 */
getEFOAttributesFromOLS = function(efoId) {
    // Double encode EFO term URI for use with OLS API
    let efoTermUri;
    if (efoId.startsWith('MONDO')) {
        efoTermUri = 'http://purl.obolibrary.org/obo/'
    }
    else {
        efoTermUri = 'http://www.ebi.ac.uk/efo/';
    }
    let olsEfoTermUri = encodeURIComponent(encodeURIComponent(efoTermUri))

    var url = `${global_ols_api_efo_terms}${olsEfoTermUri}${efoId}`;
    return promiseGet(url).then(JSON.parse).then(function(response) {
        var efoSynonyms = response["synonyms"];
        var description = response["description"];

        if (efoSynonyms) {
            if (efoSynonyms.length > list_min) {
                $("#efotrait-synonym").html(longContentList("gwas_efotrait_synonym_div",
                    efoSynonyms.sort(),
                    'synonyms'));
            }
            else {
                $("#efotrait-synonym").html(efoSynonyms.join(", "));
            }
        }
        if (description) {
            $("#efotrait-description").html(displayArrayAsParagraph(
                'gwas_efotrait_description_div', description));
        }
    }).catch(function(err){
        console.debug('Error finding term in OLS: ', err);
    })
};


/**
 * Query OXO to get term mappings.
 * @param efoId
 */
getTermMappings = function(efoId) {
    return promiseGet(global_oxo_api + 'mappings',
        { 'fromId': efoId.replace('_',':'),}
    ).then(JSON.parse).then(function(data) {
        if (data._embedded && data._embedded.mappings) {
            let mappedTerms = data._embedded.mappings.reduce((filtered, term) => {
                const termCurie = term.toTerm.curie;

                if (!(termCurie.startsWith('MeSH'))) {
                    if (!(filtered.includes(termCurie))) {
                        filtered.push(termCurie);
                    }
                }
                return filtered;
            }, []);

            if (mappedTerms.length > 0) {
                $("#efotrait-oxo-mappings").html(longContentList(
                    "gwas_efotrait_oxo_mappings_div", mappedTerms.sort(), 'mapped terms')
                );
            }
        }
    })
};

function prepareLocusZoom(includeBgTraits, includeChildTraits) {
    showLoadingOverLay('#locus-plot-row-loading');
    Promise.resolve(getLocusZoomAssociations([], includeBgTraits, includeChildTraits, 0))
        .then(function (data) {
            data.forEach(d => {
                d.pValueMantissa = d.pValue;
                d.id = Math.random();
                d.popoverHTML = buildLocusPlotPopoverHTML(d);
            })
            getColourForEFO(getMainEFO()).then((response) => {
                data.forEach(d => {
                    d.preferedColor = response.colour;
                    d.preferedParentUri = response.parentUri;
                    d.preferedParentLabel = response.parent;
                    d.category = response.parent;
                })
            }).catch((err) => {
                console.warn(`Error loading colour for Locus zoom plot from ${global_color_url}. ${err}. Using default colour.`)
            }).then(() => {
                const cata = {};
                cata.docs = data;
                reloadLocusZoom('#plot', cata);
                hideLoadingOverLay('#locus-plot-row-loading');
            });
        });
}

getLocusZoomAssociations = async function(allAssociations, includeBgTraits, includeChildTraits, page) {
    let locusZoomAssociationsUrl = gwasProperties.contextPath + 'api/v2/efotraits/' + getMainEFO() + '/locuszoom/associations?'
    const searchParams = new URLSearchParams();
    searchParams.set('page', page);
    searchParams.set('size', '500');
    searchParams.set('includeBgTraits', includeBgTraits);
    searchParams.set('includeChildTraits', includeChildTraits);
    locusZoomAssociationsUrl += searchParams.toString();
    await promiseGet(locusZoomAssociationsUrl).then(JSON.parse).then(function (response) {
        allAssociations.push(...response._embedded.associations);
        // Page through all results
        if (response._links.next.href) {
            return getLocusZoomAssociations(allAssociations, includeBgTraits, includeChildTraits, ++page);
        }
    }).catch(function (err) {
        console.debug('Error getting info for: ' + err);
    });
    return allAssociations;
};

/**
 * Find studies for a given efoid from the solr result(global variable), return empty hash if the solr result is undefined
 * This function search the highlighting result from solr.
 * Require solr result.
 * @param {String} efoid
 * @returns {Hash} studies
 */
findStudiesForEFO = function(efoid) {
    var studies = {};

    if(data_highlighting==undefined)
        return studies;
    Object.keys(data_highlighting).forEach(function(key) {
        if (/^study/.test(key)) {
            if (data_highlighting[key].mappedUri != undefined) {
                data_highlighting[key].mappedUri.forEach(function (highlightedefo) {
                    if (highlightedefo.match(/<b>(\w*_\d*)<\/b>/)[1] == efoid) {
                        studies[key] = efoid;
                    }
                });
            }
        }
    })

    if (data_study.docs != undefined) {
        $.each(data_study.docs, function (index, value) {
            if ($.inArray(value.id, Object.keys(studies)) != -1) {
                studies[value.id] = value;
            }
        });
    }
    return studies;
};

/**
 * Study sorting functions.
 */
var studySorting = {

    add : function (a, b){
        return parseInt(a) + parseInt(b);
    },

    sortByPublishDate : function(array){
        var publishDate = {};

        $.each(array, function(index, value) {
            publishDate[value.id] = value.publicationDate;
        })

        var keysSorted = Object.keys(publishDate).sort(function(a, b) {
            return Date.parse(publishDate[b]) - Date.parse(publishDate[a])
        })
        return keysSorted;
    },


    sortByCatalogPublishDate : function(array){
        var catalogPublishDate = {};

        $.each(array, function(index, value) {
            catalogPublishDate[value.id] = value.catalogPublishDate;
        })

        var keysSorted = Object.keys(catalogPublishDate).sort(function(a, b) {
            return Date.parse(catalogPublishDate[b]) - Date.parse(catalogPublishDate[a])
        })
        return keysSorted;
    },

    // CM Patch: To remove ASAP. Data issue. Eg. study 15 ancestry
    sortByInitialSampleSize : function(array){
        // "initial|NR|NR|European|11522|NA"
        // "replication|NR|NR|European|4955|NA"
        var sampleSize = {};

        var isInitial = function(ancestryLinkString){
            // console.log(ancestryLinkString);
            return ancestryLinkString.match(/^initial/) != null
        }
        var InitialSampleSize = function(ancestryLinkString){
            return ancestryLinkString.split('|')[4]
        }



        $.each(array, function(index, value) {
            var total = 0;
            var init = value.ancestryLinks;

            if (init != undefined ) {
                total = init.filter(isInitial)
                    .map(InitialSampleSize)
                    .reduce(studySorting.add, 0);
            }
            sampleSize[index] = total;
        })

        //desc
        var keysSorted = Object.keys(sampleSize).sort(function(a, b){
            return parseInt(sampleSize[b]) - parseInt(sampleSize[a])
        });
        return keysSorted;
    },
};


var EPMC = {
    /**
     * Query PMC for paper info. PMC uses their own id, but can optionally accept pubmed id.
     * @param {String} pubmed_id
     * @returns {Promise}
     * @example EPMC.getFromEPMC('')
     */
    getByPumbedId : function(pubmed_id){
        return promiseGet(global_epmc_api,
            {
                'query': 'ext_id:'+pubmed_id + '%20src:med',
                'resulttype' :  'core',
                'format' : 'json'
            }).then(JSON.parse);
    },

    searchResult : {
        paper : function(EPMCresult){
            return EPMCresult.resultList.result[0];
        },
        citedByCount : function(EPMCresult){
            return EPMC.searchResult.paper(EPMCresult).citedByCount;
        },
        firstPublicationDate : function(EPMCresult){
            return EPMC.searchResult.paper(EPMCresult).firstPublicationDate;
        },
        journalInfo : function(EPMCresult){
            return EPMC.searchResult.paper(EPMCresult).journalInfo;
        },
        abstractText : function(EPMCresult){
            return EPMC.searchResult.paper(EPMCresult).abstractText;
        },
    },
};

/**
 * The association can link to multiple efo in the selection list. Return all hits.
 * xintodo can this be the most significant one?
 * xintodo refactor findAllEFOsforAssociation into this.
 * @param {String} associationid
 * @param {Object} solr_highlighting - solr search highlighting object
 * @returns {[]} array of efo ids
 * @private
 */
findHighlightEFOForAssociation = function(association_id,solr_highlighting) {
    var terms = solr_highlighting[association_id].mappedUri[0].split("/")[4]+"b>";
    var new_terms = [];
    new_terms.push(terms);

    return new_terms.map((termHighlighted) => {
        return termHighlighted.match(/<b>(\w*_\d*)<\/b>/);
    })
};


/**
 * an association can be annotated to more than one efo. find them all. This is using solr highlighting where the
 * efo for an association is wrap by <b/> tag.
 * require solr result.
 * @param {String} association_id - This is the solr id, not the rsid.
 * @param {Hash} data - solr search result, group association
 * @returns {array} efoids - an array of efoids annotated to the given association
 */
var findAllEFOsforAssociation = function(association_id,data_association) {
    var association_doc = data_association.docs.filter((association) => {
        return association.id == association_id
    })
    if(association_doc.length >0 && association_doc[0].efoLink != undefined){
        //"C-reactive protein measurement|EFO_0004458|http://www.ebi.ac.uk/efo/EFO_0004458"
        return association_doc[0].efoLink.map((efoLink) => {
            return efoLink.split('|')[1]
        })
    }else{
        return []
    }
};


/**
 * return html to display information for a data point(association) in the locus plot when moveover the datapoint
 * @param {Hash} association_solr_doc
 * @returns {String} The html as string
 */
buildLocusPlotPopoverHTML = function(association){
    _addNameValuePairHTML = function(name,value){
        if(value instanceof Array){
            value = value.join(',')
        }
        return "<div>" + name + ":<strong> " +  value + "</strong></div>";
    }
    var text = $('<div/>');

    text.append(_addNameValuePairHTML('Variant and risk allele', association.riskAllele[0]?.label));
    text.append(_addNameValuePairHTML('Location',association.chromLocation));
    text.append(_addNameValuePairHTML('P-value',association.pValue+' x 10'+"<sup>"+association.pValueExponent+"</sup>"));
    text.append(_addNameValuePairHTML('Mapped gene(s)',association.mappedGenes?.join(', ')));
    text.append(_addNameValuePairHTML('Reported trait', association.traitName?.join(', ')));
    text.append(_addNameValuePairHTML('Study accession', association.accessionId));
    text.append(_addNameValuePairHTML('PubMed ID', association.pubmedId));
    text.append(_addNameValuePairHTML('Author', association.author));
    text.append(_addNameValuePairHTML('Publication year', new Date(association.publicationDate).getFullYear()));
    return text.prop('outerHTML');
};

/**
 * Insert ancestry dropdown items, add onclick function
 * @param {Object} allAncestries - ancestry-associations mappings
 */
prepareAncestryFilter = function(allAncestries){
    //prepare the dropdown for ancestry filter and add click function to highlight ancestry group
    $('#ancestry-dropdown-menu').empty();
    Object.keys(allAncestries).map((ancestry)=>{
        var item = $('<li />')
        //store the ancestry-association in the ancestry item tag
        var a = $('<a />', {class: 'list-group-item highlightable', tabIndex: "-1", text: ancestry}).data(
            'associations',
            allAncestries[ancestry]).data(
            'ancestry',
            ancestry).appendTo(item);
        $('<span />', { class: 'badge cart-item-number-badge', text:allAncestries[ancestry].length , title:'Number of association'}).appendTo(a);
        item.appendTo($('#ancestry-dropdown-menu'));
        item.click((e) => {
            var a = $(e.currentTarget).children('a')
            //TOGGLE HIGHLIGHT
            if(a.hasClass("highlight")){
                a.removeClass("highlight");
                reloadLocusZoom('#plot', data_association)
            }else{
                $('.highlightable.highlight').removeClass("highlight");
                a.addClass("highlight");

                var highlightAssociations = a.data('associations');
                reloadLocusZoom('#plot', data_association, highlightAssociations,a.data('ancestry'));
            }
            return false;
        })

    })
    //enable dropdown
    hideLoadingOverLay('#btn-ancestry-dropdown');
};



/**
 * Get color for a give efo term by querying the parentMapping api.
 * The give back the prefered parent term and the predefined color of that parent term.
 * The color will be use in badges and plots, and it is consistence with the digram.
 * Lazy load.
 *
 * The loaning of the colour take a long time when the number of efo term increase.
 * Disease this (using a default colour, commented out) will increase the speed.
 * Need to optimize this for better performance.
 * @param {String} efoid
 * @returns {Promise} - json result.
 */
getColourForEFO = function(efoid) {
    var queryColour = function(efoid){
        console.debug('Loading Colour...')
        return promiseGet(global_color_url + efoid).then(JSON.parse).then(function(response) {
            console.log("** Response getColourForEFO: ", response);

            var tmp = {};
            tmp[efoid] = response;
            return tmp;
        })
    }

    var dataPromise = getPromiseFromTag(global_efo_info_tag_id, 'efo2colour');

    return dataPromise.then(function(data) {
        if ($.inArray(efoid, Object.keys(data)) == -1) {
            console.debug('Loading Colour...')
            dataPromise = queryColour(efoid);
            return dataPromise.then(function(data){
                //add to tag
                addPromiseToTag(global_efo_info_tag_id,dataPromise,'efo2colour');
                return data[efoid];
            })
        }else {
            //efo colour is has been loaded previously
            console.debug('Loading Colour from cache.')
            return data[efoid]
        }
    })
};




/**
 * Add a promise to a tag's data attribute. The data attribute contains a hash.
 * If the hash key exist, the new promise data is merged to the old one.
 * @param String tagID - the html tag used to store the data, with the '#'
 * @param Promise promise - the promise, fullfilled or pending
 * @param String key - the has key for Promise
 * @param Boolean overwriteWarning - Default value is false. if true, print log to idicate overwritting.
 * @return {Promise} - Promise containing merged data
 * @example addPromiseToTag('#efoInfo',promise,'key',false)
 */
addPromiseToTag = function(tagID, promise, key, overwriteWarning=false) {
    initInfoTag(tagID);

    var oldPromise = $(tagID).data(key) || new Promise(function(resolve){
        resolve({})
    });


    var result;
    var p = Promise.all([oldPromise,promise]).then(function(arrayPromise){
        oldData = arrayPromise[0]
        newData = arrayPromise[1]

        if(overwriteWarning){
            var overlap = Object.keys(oldData).filter(function(n) {
                return Object.keys(newData).indexOf(n) > -1;
            });
            if (overlap.length > 0) {
                overlap.forEach(function(d) {
                    // console.log(d + 'will be overwritten.')
                })
            }
        }
        result = $.extend({}, oldData, newData)
        return result;
    });


    p.then(function(){
        $(tagID).data(key,p);
        console.debug('adding promise to ' + key + ' tag ' + tagID);
    })
    return p;
}





/**
 * query a promise from a tag's data attribute with a key. The data attribute contains a hash.
 * If the hash key exist, the promise is returned, otherwise, a new empty resolved promise is returned.
 * @param String tagID - the html tag used to store the data, with the '#'
 * @param String key - the has key for promise
 * @return Promise
 * @example getPromiseFromTag('#efoInfo','key')
 */
getPromiseFromTag = function(tagID,key){
    initInfoTag(tagID);
    var dataPromise =  getDataFromTag(tagID,key)
    if (dataPromise == undefined) {
        dataPromise = new Promise(function(resolve){
            resolve({});
        })
    }
    return dataPromise;
};


/**
 * create a hidden div for cache, if there isn't already one
 */
initInfoTag = function(tagID){
    // console.log("** initInfoTag tagID: ", tagID);

    if ($(tagID).length == 0) {
        var cb = $('<div />',
            {id: tagID.substring(1)}).css({'display': 'none'}).appendTo($("body"));
    }
};


/**
 * query data from a tag's data attribute with a key. The data attribute contains a hash.
 * If the hash key exist, the date is returned, otherwise, a new empty hash is returned.
 * @param String tagID - the html tag used to store the data, with the '#'
 * @param String key - the has key for promise
 * @return {}
 * @example getDataFromTag('#efoInfo','key')
 */
getDataFromTag = function(tagID, key) {
    initInfoTag(tagID);
    key = key || ''
    var data = $(tagID).data();
    if (key == '')
        return data
    if (Object.keys(data).indexOf(key) == -1){
        // console.warn('The requested data with key ' + key + ' to ' + tagID + ' does not exist!');
        return undefined;
    }
    return data[key]
};



