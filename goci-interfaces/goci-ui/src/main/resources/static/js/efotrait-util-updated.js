/**
 * Created by Trish on 20-May-2020
 */


var global_color_url_batch = gwasProperties.GWAS_REST_API + '/parentMappings';
// var global_color_url = gwasProperties.GWAS_REST_API + '/parentMapping/';
var global_color_url = 'https://www.ebi.ac.uk/gwas/rest/api/parentMapping/';

var global_gwas_trait_api = `${gwasProperties.GWAS_REST_API}/efoTraits/`;
if (gwasProperties.host.includes('localhost')) {
    global_gwas_trait_api = 'https://www.ebi.ac.uk/gwas/rest/api/efoTraits/';
}

var global_ols_api = 'https://www.ebi.ac.uk/ols/api/';
var global_ols = 'https://www.ebi.ac.uk/ols/';
var global_ols_efo_term = 'https://www.ebi.ac.uk/ols/ontologies/efo/terms?iri=';
var global_ols_seach_api =  global_ols_api + 'search';
var global_ols_restful_api_ontology =  global_ols_api + 'ontologies';
var global_ols_api_efo_terms = 'https://www.ebi.ac.uk/ols/api/ontologies/efo/terms/';
var global_ols_efo_hierarchical_descendents = 'https://www.ebi.ac.uk/ols/api/ontologies/efo/hierarchicalDescendants';

var global_efo_info_tag_id = '#efo-info';
var global_epmc_api = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
var global_oxo_api = 'https://www.ebi.ac.uk/spot/oxo/api/';

// Global variable to store a list of a parent and it's
// child EFO Ids to use as a query parameter to download
// all child trait association data
var global_parent_with_all_child_trait_ids = [];

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


/**
 * Linkout to OLS page for the main EFO term
 */
$('#ols-link').click(() => {
    // Single encode EFO term URI for use with OLS Web site
    let efoTermUri = 'http://www.ebi.ac.uk/efo/';
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
 * Page is ready to run methods
 */
$(document).ready(() => {
    console.log("** EFO TEST TRAIT PAGE LOADED **");

    // Get trait information
    const initialCBState = true;
    displayEFOInfo(initialCBState);
});



/**
 * Toggle the data display to either add or remove child EFO trait data from the display
 * in the Association, Study, and LocusZoom plot.
 */
toggleDataDisplay = function () {
    // TODO: When clicked, show loading for data tables, LocusZoom, and "Download Catalog data" button

    var checkBox = document.getElementById("toggle-data-display");
    var text = document.getElementById("text");
    if (checkBox.checked == true){
        text.style.display = "block";
    } else {
        text.style.display = "none";
    }
    console.log("** CheckBox State-1: ", checkBox.checked);
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
 * Show loading overlay for panels dependent on data from Fat Solr.
 */
showGroupedPanelLoadingOverlay = function() {
    // showLoadingOverLay('#highlight-study-panel-loading');
    showLoadingOverLay('#toggle-data-display-section');
    showLoadingOverLay('#association-table-loading');
    showLoadingOverLay('#study-table-loading');
    showLoadingOverLay('#locus-plot-row-loading');
};

/**
 * Hide loading overlay for panels dependent on data from Fat Solr.
 */
hideGroupedPanelLoadingOverlay = function() {
    // hideLoadingOverLay('#highlight-study-panel-loading');
    hideLoadingOverLay('#toggle-data-display-section');
    hideLoadingOverLay('#association-table-loading');
    hideLoadingOverLay('#study-table-loading');
    hideLoadingOverLay('#locus-plot-row-loading');
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
    showLoadingOverLay('#highlighted-study-section-loading');
    showGroupedPanelLoadingOverlay();

    const efoId = getMainEFO();

    // Get data from GWAS REST API for term fields
    getEFOInfo(efoId)
        .then((efoInfo) => {
        $('#top-panel-trait-label').html(efoInfo.trait);
        $("#efotrait-label").html(efoInfo.trait);
        $("#efotrait-id").html(efoInfo.shortForm);
    });

    // Get data from Solr slim for term fields
    getTraitDataSolrSlim(efoId);

    // Get data from OLS for term fields
    getEFOAttributesFromOLS(efoId);

    // Get EFO term mappings from OXO
    getTermMappings(efoId);


    // Add handle to checkbox to later determine isChecked status and whether to display child trait data
    let myCheckbox = document.getElementById('toggle-data-display');


    // Get EFO child traits data from OLS to (1) display in term info panel and (2) use for data tables and download file data generation
    const allTermIds = [], allChildTermObj = {};
    const olsParam = `?id=${efoId}&size=500`;
    let efo_child_traits_url = `${global_ols_efo_hierarchical_descendents}${olsParam}`;

    // Get all child term information from OLS REST API
    const childTraitResults = getChildTraits(efoId, efo_child_traits_url, allTermIds, allChildTermObj);
    Promise.resolve(childTraitResults).then(function(childResults) {
        hideLoadingOverLay('#summary-panel-loading'); // Done loading data for trait info panel

        // Get all EFO trait terms used in GOCI database from GWAS REST API
        const allEFOIDs = [], allEFOLabels = [];
        const efoTraitsParam = `?size=500`;
        let efoTraits_url = `${global_gwas_trait_api}${efoTraitsParam}`;

        const allEfoTraitResponse = getAllEFOTraits(efoTraits_url, allEFOIDs, allEFOLabels);
        Promise.resolve(allEfoTraitResponse).then(function(allEfoTraitResults) {

            // Filter list of allIds against list of all child term IDs
            let filteredTraitIds = childResults[0].filter(Id => allEfoTraitResults[0].includes(Id));

            // Based on filteredTraitIds, get list of filteredTraitLabels for all IDs
            let filteredTraitLabels = [];
            for (const id of filteredTraitIds) {
                // Get child term label from lookup
                let label = childResults[1][id];
                filteredTraitLabels.push(label);
            }

            // Set display of Child traits here so only child term labels with data are displayed
            $("#efo-child-trait-label").html(longContentList(
                "gwas_child_traits_div", filteredTraitLabels.sort(), 'child traits')
            );


            // Add mainEFO to filtered Trait Id list before query to Fat Solr
            filteredTraitIds.push(efoId);

            // Get data from Fat Solr for filteredTraits list with mainEFO in the list
            let displayData = getEfoTraitDataSolr(filteredTraitIds);
            Promise.resolve(displayData).then(function() {
                hideLoadingOverLay('#highlighted-study-section-loading');
                hideGroupedPanelLoadingOverlay();
            });


            // Change data display based on checkbox state to show/hide child trait data
            myCheckbox.addEventListener('change', e => {
                showGroupedPanelLoadingOverlay();

                if (e.target.checked) {
                    console.log("** Checkbox is CHECKED!");

                    let displayData = getEfoTraitDataSolr(filteredTraitIds);
                    Promise.resolve(displayData).then(function() {
                        hideGroupedPanelLoadingOverlay();
                    });
                } else {
                    console.log("** Checkbox is NOT checked");

                    let displayData = getEfoTraitDataSolr(efoId);
                    Promise.resolve(displayData).then(function() {
                        hideGroupedPanelLoadingOverlay();
                    });
                }
            });

        });
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
    // console.log("** TEST efoTermsToFilter: ", efoTermsToFilter);

    return getAvailableEFOs(efoTermsToFilter).then(function(availableEFOs){
        // console.log("** TEST All EFOs with trait data: ", availableEFOs);
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
getAvailableEFOs=function(){
    console.log("** Called getAvailableEFOs...");

    var dataPromise = getDataFromTag(global_efo_info_tag_id,'availableEFOs');


    if(dataPromise == undefined){
        //lazy load
        // console.log('Loading all available EFOs in Gwas Catalog...')
        //xintodo refactor this to use post
        console.log("** getAvailableEFOs URL: ", window.location.pathname.split('/efotraits/')[0] + '/api/search/advancefilter');

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

            console.log("** TEST getAvailableEFOs - tmp: ", tmp);

            return tmp;
        }).catch(function(err){
            console.error('Error when loading all available EFOs! ' + err);
        });

        //add to tag
        $(global_efo_info_tag_id).data('availableEFOs',dataPromise);

    }else{
        console.debug('Loading all available EFOs from cache.')
        console.log("** dataPromise cache: ", dataPromise);
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

    // return promiseGet(global_gwas_trait_api).then(JSON.parse).then(function (response) {
    await promiseGet(efoTraitUrl).then(JSON.parse).then(function (response) {
        // console.log("** TEST getAllEFOTraits: ", response._embedded.efoTraits);

        $.each(response._embedded.efoTraits, function (index, term) {
            allShortForm.push(term.shortForm);
            allTraitLabels.push(term.trait);
        });

        // Store all child term IDs
        allEFOIDs.push(...allShortForm);
        // console.log("** TEST getAllEFOTraits allEFOIDs-LEN: ", allEFOIDs.length);
        allEFOLabels.push(...allTraitLabels);
        // console.log("** TEST getAllEFOTraits allEFOLabels-LEN: ", allEFOLabels.length);

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
    // console.log("GWAS REST API URL: ", gwas_trait_url)

    return promiseGet(gwas_trait_url).then(JSON.parse).then(function (response) {
        // console.log("** TEST getEFOInfo: ", response)
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
            // console.log("** Slim Data: ", data.response.docs)
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
    let efoTermUri = 'http://www.ebi.ac.uk/efo/';
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
 * Query OLS for child traits to display and use
 * when generating data for the "Download data" button
 * @param efoId
 */
// was getHierarchicalDescendants()
getChildTraits = async function(efoId, olsHierarchicalDescendantsUrl, allTermIds, allChildTermObj) {
    let childTraitIds = [];
    let childTermObj = {};

    await promiseGet(olsHierarchicalDescendantsUrl).then(JSON.parse)
        .then(function (response) {

            // Get all term labels for result page
            $.each(response._embedded.terms, function (index, term) {
                childTraitIds.push(term.short_form);
                childTermObj[term.short_form] = term.label;
            });

            // Store all child term IDs
            allTermIds.push(...childTraitIds);

            // Store all child term IDs and labels
            Object.assign(allChildTermObj, childTermObj);


            // TODO: Work on download file
            // prepareDownloadData(parent_with_all_child_trait_ids);

            // Page through all results from OLS getHierarchichalDescendents endpoint
            const nextPage = response._links.next.href;

            if (nextPage) {
                return getChildTraits(efoId, nextPage, allTermIds, allChildTermObj);
            }
        })
        .catch(function (err) {
        console.debug('Error getting info for: ' + olsHierarchicalDescendantsUrl + '. ' + err);
    });
    return [allTermIds, allChildTermObj]
};


/**
 * Query OXO to get term mappings.
 * @param efoId
 */
getTermMappings = function(efoId) {
    return promiseGet(global_oxo_api + 'mappings',
        { 'fromId': efoId.replace('_',':'),}
    ).then(JSON.parse).then(function(data) {
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
    })
};





/**
 * Query Fat Solr for data for Associations and Studies data tables.
 * @param {String} mainEFO
 * @param {[]String} additionalEFO
 * @param {[]String} descendants
 * @param {Boolean} initLoad
 * @returns {Promise}
 */
function getEfoTraitDataSolr(mainEFO) {

    let searchQuery = mainEFO;
    // console.log("** getEfoTraitDataSolr URL: ", gwasProperties.contextPath+'api/search/advancefilter');

    // Debug information
    if (typeof searchQuery === 'string') {
        console.log("** getEfoTraitDataSolr searchQuery-LEN: ", 1);
        // console.log("** getEfoTraitDataSolr searchQuery value: ", searchQuery);
    } else {
        console.log("** getEfoTraitDataSolr searchQuery-LEN: ", searchQuery.length);
        // console.log("** getEfoTraitDataSolr searchQuery values: ", searchQuery);
    }

    return Promise.all([searchQuery]).then(() => {
        return promisePost( gwasProperties.contextPath+'api/search/advancefilter',
            {
                'q': searchQuery,
                'max': 99999,
                'group.limit': 99999,
                'group.field': 'resourcename',
                'facet.field': 'resourcename',
                'hl.fl': 'shortForm,efoLink,mappedUri',
                'hl.snippets': 100,
                'fl' : global_fl == undefined ? '*':global_fl,
                // 'fq' : global_fq == undefined ? '*:*':global_fq,
                'raw' : global_raw == undefined ? '' : global_raw,
            },'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
            if( data.grouped.resourcename.groups.length == 0 ){
                $('#lower_container').html("<h2>The EFO trait <em>"+searchQuery+"</em> cannot be found in the GWAS Catalog database</h2>");
            } else{
                // processSolrData(data, initLoad);
                processSolrData(data, false);
                return data;
            }
        }).catch(function(err) {
            console.error('Error when searching solr for: ' + searchQuery + '. ' + err);
            throw(err);
        })
    })
}


/**
 * Parse the Solr results and display the data on the HTML page
 * @param {{}} data - solr result
 * @param {Boolean} initLoad
 */
function processSolrData(data, initLoad=false) {

    var isInCatalog=true;
    if (data.grouped.resourcename.matches == 0) {
        isInCatalog = false
    }
    //split the solr search by groups
    //data_efo, data_study, data_association, data_diseasetrait;
    data_facet = data.facet_counts.facet_fields.resourcename;
    data_highlighting = data.highlighting;

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

    if($('#cb-remove-nonunique-association').is(":checked")){
        remove = removeAssociationWithNonSelectedEFO();
    }


    remove.then(()=>{
        // If no solr return, generate a fake empty array so tables/plot are empty
        if(!isInCatalog) {
            data_association.docs = []
            data_study.docs = []
        }

        //update association/study table
        displayDatatableAssociations(data_association.docs);
        displayDatatableStudies(data_study.docs, );

        //work out highlight study
        var highlightedStudy = findHighlightedStudiesForEFO(getMainEFO());
        // if(initLoad && highlightedStudy!= undefined){
        if(highlightedStudy!= undefined){
            displayHighlightedStudy(highlightedStudy);
            //display summary information like 'EFO trait first reported in GWAS Catalog in 2007, 5 studies report this efotrait'
            getSummary(findStudiesForEFO(getMainEFO()));
        }

        // GOCI_CM_TW_Integration_Plot_no_association
        if ('docs' in data_association) {
            // we add preferEFO for each association, generate the association data for popup of data points in the locus plot.
            var allUniqueEFO = {}
            data_association.docs.forEach((d, i) => {
                d.preferedEFO = findHighlightEFOForAssociation(d.id, data_highlighting)[0];
                d.numberEFO = findAllEFOsforAssociation(d.id, data_association).length;
                allUniqueEFO[d.preferedEFO] = 1;
                //add any string data that will be use in the locus plot popover
                d.popoverHTML = buildLocusPlotPopoverHTML(d);
            });

            //get all ancestries of all associations
            var allAncestries = {};
            data_association.docs.map((d) => {
                if(d.ancestralGroups != undefined){
                    d.ancestralGroups.map((a) => {
                        if(allAncestries[a] == undefined)
                            allAncestries[a] = [];
                        allAncestries[a].push(d.id)})
                }
            });

            prepareAncestryFilter(allAncestries);

            // Getting color for the main EFO and add to ALL associations.
            getColourForEFO(getMainEFO()).then((response) => {
                data_association.docs.forEach(function (d, i) {
                    d.preferedColor = response.colour;
                    d.preferedParentUri = response.parentUri;
                    d.preferedParentLabel = response.parent;
                    d.category = response.parent;
                })
            }).catch((err) => {
                console.warn(`Error loading colour for Locus zoom plot from ${global_color_url}. ${err}. Using default colour.`)
            }).then(() => {
                reloadLocusZoom('#plot', data_association);
            });

        } else {
            $("#plot").html('<span>No Associations for this EFO Trait</span>');
            hideLoadingOverLay("#locus-plot-row-loading");
        }
    })

}


/**
 * Display highlighted study on the page
 * @param highlightedStudy
 * @example findHighlightedStudiesForEFO(getMainEFO()) give you an example study doc
 */
displayHighlightedStudy = function() {
    var highlightedStudy = findHighlightedStudiesForEFO(getMainEFO());
    console.log("** highlightedStudy: ", highlightedStudy);

    $('#efotrait-highlighted-study-title').html(highlightedStudy.title);
    $('#efotrait-highlighted-study-author').html(highlightedStudy.author_s +' (PMID:'+highlightedStudy.pubmedId+')');
    $('#efotrait-highlighted-study-catalogPublishDate').html(highlightedStudy.publicationDate.split('T')[0]);
    var link = gwasProperties.contextPath + 'studies/' + highlightedStudy.accessionId;
    $('#efotrait-highlighted-study-accessionId').html(setInternalLinkText(link, highlightedStudy.accessionId));

    EPMC.getByPumbedId(highlightedStudy.pubmedId).then((data) => {
        var paperDetail = data.resultList.result[0];

        $('#efotrait-highlighted-study-abstract').html(EPMC.searchResult.abstractText(data));
        return paperDetail;
    }).catch((err) => {
        console.warn(`Error when loading data from EPMC! ${err}`);
    }).then(() => {
        hideLoadingOverLay('#highlight-study-panel-loading');
    });
};

/**
 * work out which study is the highlighted study for an efo trait.
 * Currently find the one with largest initial sample size.
 * This require the solr search data.
 * @param String efoid
 * @return {Object} - study_solr_doc
 * @example findHighlightedStudiesForEFO('EFO_0000400')
 */
findHighlightedStudiesForEFO = function(efoid) {
    var studies = findStudiesForEFO(efoid);
    var sorted_index = studySorting.sortByInitialSampleSize(studies);

    console.log("** HS: ", studies[sorted_index[0]]);
    return studies[sorted_index[0]];
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
    // console.log("** findStudiesForEFO:", data_highlighting);

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

    var rsid = association.rsId==undefined? '' : association.rsId[0];
    text.append(_addNameValuePairHTML('Variant and risk allele', association.strongestAllele));
    text.append(_addNameValuePairHTML('Location',association.chromLocation));
    text.append(_addNameValuePairHTML('P-value',association.pValueMantissa+' x 10'+"<sup>"+association.pValueExponent+"</sup>"));
    text.append(_addNameValuePairHTML('Mapped gene(s)',association.ensemblMappedGenes));
    text.append(_addNameValuePairHTML('Reported trait', association.traitName_s));
    text.append(_addNameValuePairHTML('Trait(s)', association.mappedLabel.toString()));
    text.append(_addNameValuePairHTML('Study accession', association.accessionId));
    text.append(_addNameValuePairHTML('PubMed ID', association.pubmedId));
    text.append(_addNameValuePairHTML('Author',association.author_s));
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
            //efo colour is has been loaded perviously
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


