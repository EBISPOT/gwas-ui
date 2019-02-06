/** DRY. From Xin original code. We must refactor all these 'action'result.js in a common way! */

var global_fl;
var global_raw;

global_fl = 'pubmedId,title,author_s,orcid_s,publication,publicationDate,catalogPublishDate,authorsList,' +
    'initialSampleDescription,replicateSampleDescription,ancestralGroups,countriesOfRecruitment,' +
    'ancestryLinks,' + 'fullPvalueSet,' + 'genotypingTechnologies,' + 'authorAscii_s,' +
    'association_rsId,' + //size per study
    'traitName,mappedLabel,mappedUri,traitUri,shortForm,' +
    'label,' + 'efoLink,parent,id,resourcename,';
global_fl = global_fl + 'riskFrequency,qualifier,pValueMantissa,pValueExponent,snpInteraction,multiSnpHaplotype,rsId,strongestAllele,context,region,ensemblMappedGenes,reportedGene,merged,currentSnp,studyId,chromosomeName,chromosomePosition,chromLocation,positionLinks,author_s,publication,publicationDate,catalogPublishDate,publicationLink,accessionId,initialSampleDescription,replicateSampleDescription,ancestralGroups,countriesOfRecruitment,numberOfIndividuals,traitName_s,mappedLabel,mappedUri,traitUri,shortForm,labelda,synonym,efoLink,id,resourcename,range,orPerCopyNum,betaNum,betaUnit,betaDirection'
global_raw = 'fq:resourcename:association or resourcename:study'


/**
 * Other global setting
 */
var pageRowLimit=5;

$(document).ready(() => {

//jump to the top of the page
$('html,body').scrollTop(0);

var searchTerm = getTextToSearch('#query');

// console.log("Loading search module!");
if (searchTerm != '') {
    // console.log("Start search for the text " + searchTerm);
    var elements = {};
    searchTerm.split(',').forEach((term) => {
        elements[term] = term;
}
)
    //first load
    // console.log(elements);
    executeQuery(elements, true);
}
});

/**
 * The elem to search is defined by the url, as a main entry of the page. It is stored in the div id
 * in the date attribute of the <global_elem_info_tag_id>`
 * @return Eg. String efoID - 'EFO_0000400'
 * @example getElemToSearch()
 */

getTextToSearch = function(divId){
    return $(divId).text();
}

executeQuery = function(data={}, initLoad=false) {
      // console.log("executeQuery");
      updatePage(initLoad);
}



updatePage = function(initLoad=false) {
    
    //start spinner. The spinner will be stoped whenever the data is ready, thus closed by the coresponding data loading function.
    if(initLoad){
        showLoadingOverLay('#summary-panel-loading');
//            showLoadingOverLay('#highlight-study-panel-loading');
    }
    showLoadingOverLay('#study-table-loading');
    showLoadingOverLay('#association-table-loading');
    
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
function getDataSolr(main, initLoad=false) {
    // initLoad will be pass to processEfotraitData, controlling whether to upload the triat information(initload)
    // or just reload the tables(adding another efo term)
    
    var searchQuery = 'pubmedId:'+main;
    
    // console.log("Solr research request received for " + searchQuery);
    return promisePost( gwasProperties.contextPath + 'api/search/advancefilter',
        {
            'q': searchQuery,
            'max': 99999,
            'group.limit': 99999,
            'group.field': 'resourcename',
            'facet.field': 'resourcename',
            'hl.fl': 'shortForm,efoLink',
            'hl.snippets': 100,
            'fl' : global_fl == undefined ? '*':global_fl,
            // 'fq' : global_fq == undefined ? '*:*':global_fq,
            'raw' : global_raw == undefined ? '' : global_raw,
        },'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
        // Check if Solr returns some results
        if (data.grouped.resourcename.groups.length == 0) {
            $('#lower_container').html("<h2>Publication with Pubmed ID <em>"+main+"</em> cannot be found in the GWAS Catalog.</h2>");
        }
        else {
            processSolrData(data, initLoad);
            //downloads link : utils-helper.js
            setDownloadLink(searchQuery);
        }
        // console.log("Solr research done for " + searchQuery);
        return data;
    }).catch(function(err) {
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
function processSolrData(data, initLoad=false) {
    var isInCatalog=true;
    
    data_association = [];
    data_study = [];
    data_association.docs = [];
    data_study.docs = [];
    
    if (data.grouped.resourcename.matches == 0) {
        isInCatalog = false;
    }
    //split the solr search by groups
    //data_efo, data_study, data_association, data_diseasetrait;
    data_facet = data.facet_counts.facet_fields.resourcename;
    data_highlighting = data.highlighting;
    
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
    
    //remove association that annotated with efos which are not in the list
    var remove = Promise.resolve();
    
    remove.then(()=>{
        //If no solr return,greate a fake empyt array so tables/plot are empty
        if(!isInCatalog) {
        data_association.docs = []
        data_study.docs = []
    }
    
    var PAGE_TYPE = "publication";

    //update association/study table
    displayDatatableAssociations(data_association.docs);
    displayDatatableStudies(data_study.docs, PAGE_TYPE);
    checkSummaryStatsDatabase(data_study.docs);
    displaySummaryPublication(data_study.docs);
    
    //work out highlight study
    //var highlightedStudy = findHighlightedStudiesForEFO(getMainEFO());
    //displayHighlightedStudy(highlightedStudy);
    //display summary information like 'EFO trait first reported in GWAS Catalog in 2007, 5 studies report this efotrait'
    //getSummary(findStudiesForEFO(getMainEFO()));
    
})

}

/**
 * display study summary
 * @param {Object} data - study solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displaySummaryPublication(data,clearBeforeInsert) {
    var study_count = data.length;
    var publication = data[0];
    var first_author = publication.author_s;
    if ('orcid_s' in publication) {
        // the variable is defined
        var orchid = create_orcid_link(publication.orcid_s,16);
        first_author = first_author +orchid;
    }
    $("#publication-author").html(first_author);
    $("#publication-pubmedid").html(publication.pubmedId);
    $("#publication-title").html(publication.title);
    $("#top-panel-pub-title").html(publication.title);  // display title in header
    $("#publication-journal").html(publication.publication);
    $("#publication-datepublication").html(publication.publicationDate.split('T')[0]);
    if ('authorsList' in publication) {
        // require toggle-resize.js
        var reduce_text= displayAuthorsListAsList(publication.authorsList);
        reduce_text = addShowMoreLink(reduce_text, 500, "...");
        $("#publication-authors-list").html(reduce_text);
    }
    // Display Summary stats icon if any study in publication has fullPvalueSet: true
    var fullpvalset=checkFullPValueStatus(data);
    $("#study-summary-stats").html(fullpvalset);


    $("#pubmedid_button").attr('onclick',     "window.open('"+gwasProperties.NCBI_URL+publication.pubmedId+"',    '_blank')");
    $("#europepmc_button").attr('onclick',     "window.open('"+gwasProperties.EPMC_URL+publication.pubmedId+"',    '_blank')");
    
    hideLoadingOverLay('#summary-panel-loading');
    
}


function checkFullPValueStatus(data) {
    var summaryStatsIcon = "<span>-</span>";
    for (var i=0; i < data.length; i++) {
        if (data[i].fullPvalueSet == true) {
            summaryStatsIcon = "<a href='#study_panel'><span style='font-size: 20px;' " +
                "class='glyphicon glyphicon-signal clickable'></span></a>";
            return summaryStatsIcon;
        }
    }
    return summaryStatsIcon;
}
