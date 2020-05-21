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
var global_ols_seach_api =  global_ols_api + 'search';
var global_ols_restful_api_ontology =  global_ols_api + 'ontologies';
var global_ols_efo_terms = 'https://www.ebi.ac.uk/ols/api/ontologies/efo/terms/';
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
var data_efo={}
var data_study={}
var data_association={}
var data_diseasetrait={}
var data_facet={}
var data_highlighting={}

/**
 * Other global setting
 */
var pageRowLimit=5;


$(document).ready(() => {
    console.log("** EFO TEST TRAIT PAGE LOADED **")
    // Get trait information
    displayEFOInfo();
});


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

/**
 * Get the main EFO defined by the query url.
 */
getMainEFO = function() {
    console.log("** getMainEFO: ", $('#query').text());
    return $('#query').text();
};


/**
 * Display the EFO information in the Trait information panel.
 */
displayEFOInfo = function() {
    showLoadingOverLay('#summary-panel-loading');

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

    // Get EFO child traits data from OLS
    const allTermLabels = [], allTermIds = [];
    const olsParam = `?id=${efoId}&size=500`;
    let efo_child_traits_url = `${global_ols_efo_hierarchical_descendents}${olsParam}`;

    let allTermAndChildIds = getChildTraits(efoId, efo_child_traits_url, allTermLabels, allTermIds);

    // Pass all Ids to other methods
    var allIds = Promise.resolve(allTermAndChildIds);
    allIds.then(function(allIds) {
        hideLoadingOverLay('#summary-panel-loading');
        testMethod(allIds);
    });

    // Get EFO term mappings
    displayOXO();
};

testMethod = function(all) {
    // console.log("** ALL ** ", all.length);
}


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
        // console.log("* GWAS REST API Response: ", response)
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

    var url = `${global_ols_efo_terms}${olsEfoTermUri}${efoId}`;
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
getChildTraits = async function(efoId, olsHierarchicalDescendantsUrl, allTermLabels, allTermIds) {
    let subTraitLabels = [];
    let parentAndAllChildTraitIds = [];

    // Store mainEfo in list of all Ids
    if (!(allTermIds.includes(efoId))) {
        allTermIds.push(efoId);
    }

    await promiseGet(olsHierarchicalDescendantsUrl).then(JSON.parse)
        .then(function (response) {
            // Get all term labels for result page
            $.each(response._embedded.terms, function (index, term) {
                subTraitLabels.push(term.label);
                parentAndAllChildTraitIds.push(term.short_form);
            });

            // Store all child term labels
            allTermLabels.push(...subTraitLabels);

            // Display all child term labels on page
            $("#efo-child-trait-label").html(longContentList(
                "gwas_child_traits_div", allTermLabels.sort(), 'child traits')
            );

            // Store all child term IDs
            allTermIds.push(...parentAndAllChildTraitIds);

            // prepareDownloadData(parent_with_all_child_trait_ids);

            // Page through all results from OLS getHierarchichalDescendents endpoint
            const nextPage = response._links.next.href;

            if (nextPage) {
                return getChildTraits(efoId, nextPage, allTermLabels, allTermIds);
            }
        })
        .catch(function (err) {
        console.debug('Error getting info for: ' + olsHierarchicalDescendantsUrl + '. ' + err);
    });
    return allTermIds;
};


/**
 * Get term mappings from OXO
 */
displayOXO = function() {
    getOXO(getMainEFO()).then((data) => {
        console.log("** MD:", data)

        var container = $('#btn-oxo-expand');
        var totalMapping = parseInt(data.page.totalElements);
        var xrefs = [];
        var xrefs_mesh = []
        if(totalMapping > 0){
            xrefs = data._embedded.mappings.map((xref) => {
                return xref.toTerm.curie
            })

            xrefs_mesh = xrefs.filter((xref_id) => {
                return xref_id.startsWith("MeSH")
            });
        }

        // remove duplicate Ids and sort
        var uniqueXrefs = Array.from(new Set(xrefs));
        uniqueXrefs = uniqueXrefs.sort();

        // remove parent EFO ID from XRef list
        var parentEFOIndex = uniqueXrefs.indexOf(getMainEFO().replace('_',':'));
        uniqueXrefs.splice(parentEFOIndex, 1);

        // update totalMapping count
        totalMapping = uniqueXrefs.length;

        if(totalMapping > 0) {
            $('#oxo-list').append(displayArrayAsList(uniqueXrefs))
        }



        //we want to show a mesh here
        if(totalMapping > 0){
            if(xrefs_mesh.length > 0){
                var xref_mesh = xrefs_mesh[0];
                container.html(`<!--<b> ${xref_mesh} </b> and <b>${totalMapping}</b>  more ontology Xrefs--> `);
                // container.html(`${xref_mesh} ...`);
                container.html(`<span style="padding-right: 8px;"> <b> ${totalMapping} </b> mappings </span>`);
            }else{
                container.html(`<span style="padding-right: 8px;"> <b> ${totalMapping} </b> mappings </span>`);
            }
            container.append(showHideDiv('oxo-graph'));

        }else{
            container.html(`No ontology mappings found.`);
        }

        $('#button-oxo-graph').click(() => {
            //To redraw the oxo graph so that it is center to the div
            drawGraph(getMainEFO().replace('_',':'),1);
        });
    })
};



/**
 * Query oxo for cross reference of an given term.
 * Note, oxo uses 'EFO:0000400' instead of 'EFO_0000400'.
 * Lazy load.
 * @param {String} efoid
 * @returns {Promise}
 */
getOXO = function(efoid){
    var queryOXO = function(efoid){
        return promiseGet(global_oxo_api + 'mappings',
            {
                'fromId': efoid.replace('_',':'),
            }
        ).then(JSON.parse).then(function(data){
            var tmp = {}
            tmp[efoid] = data;
            return tmp;
        });
    }


    var dataPromise = getPromiseFromTag(global_efo_info_tag_id, 'efo2OXO');
    return dataPromise.then(function(data) {
        if ($.inArray(efoid, Object.keys(data)) == -1) {
            //efo info is not currently loaded
            // console.log('Loading oxo for ' + efoid)
            dataPromise = queryOXO(efoid);
            return dataPromise.then(function(data){
                //add to tag
                addPromiseToTag(global_efo_info_tag_id,dataPromise,'efo2OXO');
                return data[efoid];
            })
        }else {
            //efo colour is has been loaded perviously
            // console.debug('Loading oxo from cache for ' + efoid);
            return data[efoid]
        }
    })
};




/**
 * query a promise from a tag's data attribute with a key. The data attribute contains a hash.
 * If the hash key exist, the promise is returned, otherwise, a new empty resolved promise is returned.
 * @param String tagID - the html tag used to store the data, with the '#'
 * @param String key - the has key for promise
 * @return Promise
 * @example getPromiseFromTag('#efoInfo','key')
 */
getPromiseFromTag = function(tagID,key){
    // initInfoTag(tagID);
    var dataPromise =  getDataFromTag(tagID,key)
    if (dataPromise == undefined) {
        dataPromise = new Promise(function(resolve){
            resolve({});
        })
    }
    return dataPromise;
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
    // initInfoTag(tagID);

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
    // initInfoTag(tagID);
    key = key || ''
    var data = $(tagID).data();
    if (key == '')
        return data
    if (Object.keys(data).indexOf(key) == -1){
        // console.warn('The requested data with key ' + key + ' to ' + tagID + ' does not exist!');
        return undefined;
    }
    return data[key]
}





