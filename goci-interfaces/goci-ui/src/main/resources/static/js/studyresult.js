/** DRY. From Xin original code. We must refactor all these 'action'result.js in a common way! */

var global_fl;
var global_raw;

global_fl = 'pubmedId,title,author_s,orcid_s,publication,publicationDate,catalogPublishDate,authorsList,' +
    'initialSampleDescription,replicateSampleDescription,ancestralGroups,countriesOfRecruitment,' +
    'ancestryLinks,genotypingTechnologies,platform,fullPvalueSet,authorAscii_s,' +
    'traitName,mappedLabel,mappedUri,traitUri,shortForm,' +
    'label,' + 'efoLink,parent,id,resourcename,';
global_fl = global_fl + 'riskFrequency,qualifier,pValueMantissa,pValueExponent,snpInteraction,multiSnpHaplotype,rsId,strongestAllele,context,region,entrezMappedGenes,reportedGene,merged,currentSnp,studyId,chromosomeName,chromosomePosition,chromLocation,positionLinks,author_s,publication,publicationDate,catalogPublishDate,publicationLink,accessionId,initialSampleDescription,replicateSampleDescription,ancestralGroups,countriesOfRecruitment,numberOfIndividuals,traitName_s,mappedLabel,mappedUri,traitUri,shortForm,labelda,synonym,efoLink,id,resourcename'
global_raw = 'fq:resourcename:association or resourcename:study'


/**
 * Other global setting
 */
var pageRowLimit = 5;

$(document).ready(() => {

//jump to the top of the page
$('html,body').scrollTop(0);

var searchTerm = getTextToSearch('#query');

console.log("Loading search module!");
if (searchTerm != '') {
    console.log("Start search for the text " + searchTerm);
    var elements = {};
    searchTerm.split(',').forEach((term) => {
        elements[term] = term;
});
    //first load
    console.log(elements);
    executeQuery(elements, true);
}
});

/**
 * The elem to search is defined by the url, as a main entry of the page. It is stored in the div id
 * in the date attribute of the <global_elem_info_tag_id>`
 * @return Eg. String efoID - 'EFO_0000400'
 * @example getElemToSearch()
 */

getTextToSearch = function(divId) {
    return $(divId).text();
}

executeQuery = function(data = {}, initLoad = false) {
    console.log("executeQuery");
    updatePage(initLoad);
}



updatePage = function(initLoad = false) {
    
    //start spinner. The spinner will be stoped whenever the data is ready, thus closed by the coresponding data loading function.
    if (initLoad) {
        showLoadingOverLay('#summary-panel-loading');
        //            showLoadingOverLay('#highlight-study-panel-loading');
    }
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
function getDataSolr(main, initLoad = false) {
    // initLoad will be pass to processEfotraitData, controlling whether to upload the triat information(initload)
    // or just reload the tables(adding another efo term)
    
    var searchQuery = main;
    console.log("Solr research request received for " + searchQuery);
    //Please use the contextPath !
    var URLService = gwasProperties.contextPath+'api/search/advancefilter';
    return promisePost(URLService, {
        'q': searchQuery,
        'max': 99999,
        'group.limit': 99999,
        'group.field': 'resourcename',
        'facet.field': 'resourcename',
        'hl.fl': 'shortForm,efoLink',
        'hl.snippets': 100,
        'fl': global_fl == undefined ? '*' : global_fl,
        // 'fq' : global_fq == undefined ? '*:*':global_fq,
        'raw': global_raw == undefined ? '' : global_raw,
    }, 'application/x-www-form-urlencoded').then(JSON.parse).then(function(data) {
        // Check if Solr returns some results
        if (data.grouped.resourcename.groups.length == 0) {
            $('#lower_container').html("<h2>The study accession <em>"+searchQuery+"</em> cannot be found in the GWAS Catalog database</h2>");
        }
        else {
           processSolrData(data, initLoad);
           //downloads link : utils-helper.js
           setDownloadLink(searchQuery);
           displayDatatableAssociations(data_association.docs);
           displaySummaryStudy(data_study.docs);
           console.log("Solr research done for " + searchQuery);
           return data;
        }
    }).catch(function(err) {
        console.error('Error when seaching solr for' + searchQuery + '. ' + err);
        throw (err);
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
function processSolrData(data, initLoad = false) {
    var isInCatalog = true;
    
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
            //Xin: not sure we need this!
           case "diseasetrait":
               data_diseasetrait = group.doclist;
               break;
           default:
        }
    });
    
    //remove association that annotated with efos which are not in the list
    var remove = Promise.resolve();
    
    remove.then(() => {
        //If no solr return,greate a fake empyt array so tables/plot are empty
        if (!isInCatalog) {
            data_association.docs = []
            data_study.docs = []
        }
    })

}

/**
 * display study summary
 * @param {Object} data - study solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displaySummaryStudy(data, clearBeforeInsert) {
    var study_count = data.length;
    var study = data[0];
    var first_author = study.author_s;

    if ('orcid_s' in study) {
        // the variable is defined
        var orchid = create_orcid_link(study.orcid_s, 16);
        first_author = first_author + orchid;
    }
    $("#study-author").html(first_author);
    $("#study-title").html(study.title);
    $("#study-journal").html(study.publication);
    var pubmedIdLink = '<a href="'+gwasProperties.contextPath+'publications/'+study.pubmedId+'">'+study.pubmedId+'</a>';
    $("#study-pubmedid").html(pubmedIdLink);
    $("#study-datepublication").html(study.publicationDate.split('T')[0]);
    if ('authorsList' in study) {
        console.log(study.authorsList);
        // require toggle-resize.js
        var reduce_text= displayAuthorsListAsList(study.authorsList);
        reduce_text = addShowMoreLink(reduce_text, 500, "...");
        $("#study-authors-list").html(reduce_text);
    }
    $("#study-reported-trait").html(study.traitName);
    var traitsList=setTraitsLink(study);
    $("#study-traits").html(traitsList);
    
    var genotyping=getGenotypingTech(study);
    $("#study-genotyping-tech").html(genotyping);
    $("#study-genotyping-platform").html(study.platform);
    $("#study-sample-description").html(study.initialSampleDescription);
    setAncentrySection(study);
    var fullpvalset = study.fullPvalueSet;
    if(fullpvalset == 1) {
        
        var a = (study.authorAscii_s).replace(/\s/g,"");
        var dir = a.concat("_").concat(study.pubmedId).concat("_").concat(study.accessionId);
        
        var ftplink = "<a href='ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/"
            .concat(dir).concat("' target='_blank'>");
        
        linkFullPValue = ftplink.concat("FTP download<span class='glyphicon glyphicon-signal clickable context-help'></span></a>&nbsp;");
    
        $("#study-summary-stats").html(linkFullPValue);
        var summaryStatData = getSummaryStatsInfo(study.accessionId,$("#study-summary-stats"));
       
        
        
    }
    
    $("#pubmedid_button").attr('onclick', "window.open('" + gwasProperties.NCBI_URL + study.pubmedId + "',    '_blank')");
    $("#europepmc_button").attr('onclick',     "window.open('"+gwasProperties.EPMC_URL+study.pubmedId+"',    '_blank')");
    
    hideLoadingOverLay('#summary-panel-loading');
    
}

function getGenotypingTech(study) {
// below the details of the study
    var genotypingTechnologiesList = "";
    var genotypingIcon = "";
    var hasTargetArrayIcon = false;
    if (study.genotypingTechnologies != null) {
        var priorityGenotypingTech = "";
        for (var i = 0; i < study.genotypingTechnologies.length; i++) {
            if (study.genotypingTechnologies[i] == 'Genome-wide genotyping array') {
                priorityGenotypingTech = study.genotypingTechnologies[i] + ", ";
            }
            else {
                hasTargetArrayIcon = true;
                genotypingTechnologiesList = genotypingTechnologiesList.concat(study.genotypingTechnologies[i]);
                if (study.studyDesignComment != null) {
                    
                    genotypingTechnologiesList = genotypingTechnologiesList.concat(" [").concat(study.studyDesignComment.trim()).concat("]");
                }
                genotypingTechnologiesList = genotypingTechnologiesList.concat(", ")
            }
        }
        
        genotypingTechnologiesList = priorityGenotypingTech + genotypingTechnologiesList;
        
        genotypingTechnologiesList = genotypingTechnologiesList.slice(0, -2);
    }
    
    if (hasTargetArrayIcon) {
        genotypingIcon = "<a href='#'><span class='glyphicon icon-GWAS_target_icon clickable context-help'" +
            " data-toggle='tooltip'" +
            "data-original-title='Targeted or exome array study'></span></a>";
    }
    return genotypingTechnologiesList;
}


function setTraitsLink(study) {
    var mappedTraits="";
    var mappedTraits = study.mappedLabel;
    if (mappedTraits) {
        $.each(mappedTraits, function (index, trait) {
            var link = gwasProperties.contextPath + 'efotraits/' + study.mappedUri[index].split('/').slice(-1)[0];
            mappedTraits[index] = setExternalLinkText(link, trait);
        });
        mappedTraits = mappedTraits.join(', ');
    } else {
        mappedTraits = '-';
    }
    return mappedTraits;
}

function setAncentrySection(study) {
    var pubdate = study.publicationDate.substring(0, 10);
    if (study.ancestryLinks != null) {
        var initial = '';
        var replication = '';
        var iniancestries = [];
        var replancestries = [];
        
        for (var j = 0; j < study.ancestryLinks.length; j++) {
            var link = study.ancestryLinks[j].split("|");
            
            var coo = link[1];
            var cor = link[2];
            var ancestry = link[3];
            var num = link[4];
            
            if (link[0] == 'initial') {
                var existing = false;
                var index;
                
                for (var s = 0; s < iniancestries.length; s++) {
                    if (iniancestries[s]["ancestry"] == ancestry) {
                        existing = true;
                        index = s;
                        break;
                    }
                }
                
                if (existing) {
                    var current = iniancestries[index]["number"];
                    var total = parseInt(current) + parseInt(num);
                    iniancestries[index]["number"] = total;
                    
                    if (cor.indexOf(',') != -1) {
                        cor = cor.split(",");
                        for (var i = 0; i < cor.length; i++) {
                            if (iniancestries[index]["country"].indexOf(cor[i]) == -1) {
                                iniancestries[index]["country"].push(cor[i]);
                            }
                        }
                    }
                    else {
                        if (iniancestries[index]["country"].indexOf(cor) == -1) {
                            iniancestries[index]["country"].push(cor);
                        }
                    }
                }
                else {
                    var corar = [];
                    if (cor.indexOf(',') != -1) {
                        corar = cor.split(",");
                    }
                    else {
                        corar[0] = cor;
                    }
                    
                    var ances = {"ancestry": ancestry, "number": num, "country": corar};
                    iniancestries.push(ances);
                }
                
            }
            
            else {
                var existing = false;
                var index;
                
                for (var t = 0; t < replancestries.length; t++) {
                    if (replancestries[t]["ancestry"] == ancestry) {
                        existing = true;
                        index = t;
                        break
                    }
                }
                
                if (existing) {
                    var current = replancestries[t]["number"];
                    var total = parseInt(current) + parseInt(num);
                    replancestries[t]["number"] = total;
                    
                    if (cor.indexOf(',') != -1) {
                        cor = cor.split(",");
                        for (var j = 0; j < cor.length; j++) {
                            if (replancestries[t]["country"].indexOf(cor[j]) == -1) {
                                replancestries[t]["country"].push(cor[j]);
                            }
                        }
                    }
                    else {
                        if (replancestries[t]["country"].indexOf(cor) == -1) {
                            replancestries[t]["country"].push(cor);
                        }
                    }
                }
                else {
                    var corar = [];
                    if (cor.indexOf(',') != -1) {
                        corar = cor.split(",");
                    }
                    else {
                        corar[0] = cor;
                    }
                    
                    var ances = {"ancestry": ancestry, "number": num, "country": corar};
                    replancestries.push(ances);
                }
            }
        }
        
        
        for (var n = 0; n < iniancestries.length; n++) {
            if (n == 0) {
                initial = initial.concat(iniancestries[n]["number"]).concat(' ').concat(iniancestries[n]["ancestry"]);
            }
            else {
                initial =
                    initial.concat(', ').concat(iniancestries[n]["number"]).concat(' ').concat(iniancestries[n]["ancestry"]);
            }
            
            for (var m = 0; m < iniancestries[n]["country"].length; m++) {
                if (m == 0) {
                    initial = initial.concat(' (').concat(iniancestries[n]["country"][m]);
                }
                else {
                    initial = initial.concat(', ').concat(iniancestries[n]["country"][m]);
                }
            }
            initial = initial.concat(')');
        }
        
        if (initial == '') {
            initial = initial.concat("NR");
        }
        
        
        for (var p = 0; p < replancestries.length; p++) {
            if (p == 0) {
                replication =
                    replication.concat(replancestries[p]["number"]).concat(' ').concat(replancestries[p]["ancestry"]);
            }
            else {
                replication =
                    replication.concat(', ').concat(replancestries[p]["number"]).concat(' ').concat(replancestries[p]["ancestry"]);
            }
            
            for (var q = 0; q < replancestries[p]["country"].length; q++) {
                if (q == 0) {
                    replication = replication.concat(' (').concat(replancestries[p]["country"][q]);
                }
                else {
                    replication = replication.concat(', ').concat(replancestries[p]["country"][q]);
                }
            }
            replication = replication.concat(')');
            
        }
        
        if (replication == '') {
            replication = replication.concat("NR");
        }
        
        var ancestry_flag = '';
        // flag pre-2011 studies!
        if ($.datepicker.parseDate("yy-mm-dd", pubdate) < $.datepicker.parseDate("yy-mm-dd", "2011-01-01")) {
            ancestry_flag = "<span class='glyphicon glyphicon-exclamation-sign context-help' " +
                "data-toggle='tooltip' data-original-title='Pre-2011 ancestry not double-curated'></span>"
        }
        
        $("#study-ancestry").html(initial.concat(ancestry_flag));
        $("#study-sample-replication").html(study.replicateSampleDescription);
        $("#study-ancestry-replication").html(replication.concat(ancestry_flag));
    }
    else {
        $("#study-sample-replication").html(study.replicateSampleDescription);
    }
}



