/** DRY. From Xin original code. We must refactor all these 'action'result.js in a common way! */

$(document).ready(() => {
    $('#study_panel').hide();

//jump to the top of the page
    $('html,body').scrollTop(0);

    var searchTerm = getTextToSearch('#query');
    if (searchTerm !== '') {
        var elements = {};
        searchTerm.split(',').forEach((term) => {
                elements[term] = term;
            }
        )
        executeQuery(elements, true);
    }
});

/**
 * The elem to search is defined by the url, as a main entry of the page. It is stored in the div id
 * in the date attribute of the <global_elem_info_tag_id>`
 * @return Eg. String efoID - 'EFO_0000400'
 * @example getElemToSearch()
 */
getTextToSearch = function (divId) {
    return $(divId).text();
}

executeQuery = function (data = {}, initLoad = false) {
    updatePage(initLoad);
}

updatePage = function (initLoad = false) {
    //start spinner. The spinner will be stoped whenever the data is ready, thus closed by the coresponding data loading function.
    if (initLoad) {
        showLoadingOverLay('#summary-panel-loading');
    }

    var main = getTextToSearch('#query');

    //******************************
    // when solr data ready, process solr data and update badges in the selection cart
    //******************************
    var solrPromise = getDataSolr(main, initLoad);

}


/**
 * Make solr query.
 * @param {String} mainEFO
 * @param {[]String} additionalEFO
 * @param {[]String} descendants
 * @param {Boolean} initLoad
 * @returns {Promise}
 */
function getDataSolr(main, initLoad = false) {
    // initLoad will be pass to processEfotraitData, controlling whether to upload the triat information(initload)
    // or just reload the tables(adding another efo term)

    var searchQuery = 'pubmedId:' + main;

    // slim solr for fullPvalueSet
    promiseGet(gwasProperties.contextPath+'api/search',
        {
            'q': 'pmid:' + main,
            'max': 1,
            'resourcename': 'publication',
            'wt':'json',
            'dataType': 'jsonp',
        }, 'application/x-www-form-urlencoded').then(JSON.parse).then(function (data) {
        var summaryStatsIcon = "<span>-</span>";
        if (data.response.docs[0].fullPvalueSet) summaryStatsIcon = "<a href='#study_panel'><span style='font-size: 20px;' " +
            "class='glyphicon glyphicon-signal clickable'></span></a>";
        $("#study-summary-stats").html(summaryStatsIcon);
    }).catch(function (err) {
        console.error('Error when searching Solr Slim for: ' + "pmid:" + main + '. ' + err);
        throw(err);
    })
    // console.log("Solr research request received for " + searchQuery);
    return promisePost(gwasProperties.contextPath + 'api/search/advancefilter',
        {
            'q': 'pubmedId:' + main + ' AND resourcename: study',
            'max': 1,
            'group.limit': 1,
            'group.field': 'resourcename',
        }, 'application/x-www-form-urlencoded').then(JSON.parse).then(function (data) {
        // Check if Solr returns some results
        if (data.grouped.resourcename.groups.length == 0) {
            $('#lower_container').html("<h2>Publication with Pubmed ID <em>" + main + "</em> cannot be found in the GWAS Catalog.</h2>");
        } else {
            processSolrData(data, initLoad);
            //downloads link : utils-helper.js
            setDownloadLink(searchQuery);
        }
        // console.log("Solr research done for " + searchQuery);
        return data;
    }).catch(function (err) {
        // console.error('Error when seaching solr for' + searchQuery + '. ' + err);
        throw(err);
    })

}

/**
 * Parse the Solr results and display the data on the HTML page
 * @param {{}} data - solr result
 * @param {Boolean} initLoad
 */

/**
 * Parse the Solr results and display the data on the HTML page
 * @param {{}} data - solr result
 * @param {Boolean} initLoad
 */
function processSolrData(data) {
    data_study = data.grouped.resourcename.groups[0].doclist;
    displaySummaryPublication(data_study.docs);
}

/**
 * display study summary
 * @param {Object} data - study solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displaySummaryPublication(data) {
    var publication = data[0];
    var first_author = publication.author_s;
    if ('orcid_s' in publication) {
        // the variable is defined
        var orchid = create_orcid_link(publication.orcid_s, 16);
        first_author = first_author + orchid;
    }
    $("#publication-author").html(first_author);
    $("#publication-pubmedid").html(publication.pubmedId);
    $("#publication-title").html(publication.title);
    $("#top-panel-pub-title").html(publication.title);  // display title in header
    $("#publication-journal").html(publication.publication);
    $("#publication-datepublication").html(publication.publicationDate.split('T')[0]);
    if ('authorsList' in publication) {
        // require toggle-resize.js
        var reduce_text = displayAuthorsListAsList(publication.authorsList);
        reduce_text = addShowMoreLink(reduce_text, 500, "...");
        $("#publication-authors-list").html(reduce_text);
    }

    $("#pubmedid_button").attr('onclick', "window.open('" + gwasProperties.NCBI_URL + publication.pubmedId + "',    '_blank')");
    $("#europepmc_button").attr('onclick', "window.open('" + gwasProperties.EPMC_URL + publication.pubmedId + "',    '_blank')");

    hideLoadingOverLay('#summary-panel-loading');

    // Get PGS Catalog Publication page identifier
    getPgsPublicationId(publication.pubmedId);

}

/**
 * Query PGS Catalog to find matching Publication page
 * @param {String} pmid
 */
function getPgsPublicationId(pmid) {
    return promiseGet(gwasProperties.PGS_Publication_REST_URL + pmid, {}, false)
        .then(JSON.parse).then(function (data) {
            parsePgsPublicationResult(data)
        }).catch(function (err) {
            throw(err);
        })
}

function parsePgsPublicationResult(data) {
    let x = document.getElementById("pgs_publication_button_div");

    if (data.results[0]) {
        if ('id' in data.results[0]) {
            x.style.display = "block";
            $("#pgs_publication_button").attr('onclick', "window.open('" + gwasProperties.PGS_Publication_URL + data.results[0].id + "', '_blank')");
        }
    } else {
        x.style.display = "none";
        $("#pgs_publication_button").attr('onclick', "window.open('" + gwasProperties.PGS_Publication_URL + "" + "', '_blank')");
    }
}
