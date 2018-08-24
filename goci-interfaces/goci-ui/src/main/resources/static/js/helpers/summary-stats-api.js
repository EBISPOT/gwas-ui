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
    console.log("Query Summary Stats REST API by study accession id " + study_accession);
    return promiseGet('/gwas/summary-statistics/api/studies/'+study_accession,
        {},'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
        //processVariantData(data,searchQuery);
        console.log("Summary stats result for " + study_accession);
        var nexContent = div.html();
        nexContent = nexContent+ "&nbsp;&nsbp; Found REST API summary stats";
        div.html(nexContent);
        return data;
    }).catch(function(err) {
        console.error('Error when seaching Summary Stats data for' + study_accession + '. ' + err);
        throw(err);
    })
}


/**
 * display study table
 * @param {Object} data - study solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displayDatatableStudies(data, cleanBeforeInsert=true) {
    //by default, we clean the table before inserting data
    var study_ids = [];
    if(cleanBeforeInsert){
        $('#study-table').bootstrapTable('removeAll');
    }
    
    var data_json = []
    $.each(data, (index, study) => {
        var tmp={};

    });

}
