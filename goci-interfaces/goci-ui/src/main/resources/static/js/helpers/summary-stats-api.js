/** This javascript requests promise-helper.js * */


/**
 * Make solr query.
 * @param {String} mainEFO
 * @param {[]String} additionalEFO
 * @param {[]String} descendants
 * @param {Boolean} initLoad
 * @returns {Promise}
 */
function getSummaryStatsInfo(study_accession, div) {
    //console.log("Query Summary Stats REST API by study accession id " + study_accession);
    return promiseGet('/gwas/summary-statistics/api/studies/'+study_accession,
        {},'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
        console.log("Summary stats result for " + study_accession);
        var nextContent = div.html();
        nextContent = nextContent+ "&nbsp;&nbsp;<a href='";
        nextContent = nextContent + gwasProperties.SUMMARY_STATS_URL+"/studies/"+study_accession+"' target='_blank'>";
        nextContent = nextContent + "Summary Stats REST API available here</a>";
        div.html(nextContent);
        return data;
    }).catch(function(err) {
        console.error('Error when seaching Summary Stats data for' + study_accession + '. ' + err);
        throw(err);
    })
}
