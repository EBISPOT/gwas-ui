/** First refactoring action: common js - DRY. From Xin original code
 *  Datatable action to rendering studies panel.
 * */

/**
 * display study table
 * @param {Object} data - study solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displayDatatableStudies(data, PAGE_TYPE, cleanBeforeInsert=true) {
    //by default, we clean the table before inserting data
    var study_ids = [];
    if(cleanBeforeInsert){
        $('#study-table').bootstrapTable('removeAll');
    }
    
    var data_json = []
    $.each(data, (index, study) => {
        var tmp={};
    var study_id = study.id;
    if (jQuery.inArray(study_id, study_ids) == -1) {
        study_ids.push(study_id);
        // Author
        var author = study.author_s;
        var publicationDate = study.publicationDate;
        var pubDate = publicationDate.split("-");
        var pubmedId = study.pubmedId;
        //var study_author = setQueryUrl(author, author);
        //study_author += '<div><small>'+setExternalLink(gwasProperties.EPMC_URL+pubmedId,'PMID:'+pubmedId)+'</small></div>';
    
        var genotypingIcon ="";
        if ((study.genotypingTechnologies.indexOf("Targeted genotyping array") > -1) ||
            (study.genotypingTechnologies.indexOf("Exome genotyping array") > -1) ) {
            genotypingIcon="<span style='font-size: 12px' class='glyphicon targeted-icon-GWAS_target_icon context-help'" +
                " data-toggle='tooltip'" +
                "data-original-title='Targeted or exome array study'></span>";
        }

        // declare default value
        var linkFullPValue = "NA";
        var fullpvalset = study.fullPvalueSet;
        if(fullpvalset == 1) {

            var a = (study.authorAscii_s).replace(/\s/g,"");
            var dir = a.concat("_").concat(study.pubmedId).concat("_").concat(study.accessionId);

            var ftplink = "<a href='ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/"
                .concat(dir).concat("' target='_blank'</a>");

            linkFullPValue = ftplink.concat("FTP Download");
        }

        // Add column for Summary Stats access
        tmp['link'] = linkFullPValue;
        
        
        tmp['Author'] = study.author_s;
        var nr_association = 0;
        if ('association_rsId' in study) {
             var arraysize= study.association_rsId;
             nr_association = arraysize.length;
        }
        
        // Publication date
        var p_date = study.publicationDate;
        var publi = p_date.split('T')[0];
        tmp['publi'] = publi;
    
        // AccessionID
        //tmp['study'] = '<a href="'+contextPath+'studies/'+study.accessionId+'"><span class="gwas-icon-GWAS_Study_2017"></span>&nbsp;'+study.accessionId+'</a>';
        tmp['study'] = '<a href="'+gwasProperties.contextPath+'studies/'+study.accessionId+'">'+study.accessionId+'</a>'+genotypingIcon;
        
        // Journal
        tmp['Journal'] = study.publication;
        
        // Title
        tmp['Title'] = study.title;
        
        // Reported trait
        tmp['reported_trait'] = study.traitName_s;
        
        var mappedTraits = study.mappedLabel;
        if (mappedTraits) {
            $.each(mappedTraits, function (index, trait) {
                var link = gwasProperties.contextPath + 'efotraits/' + study.mappedUri[index].split('/').slice(-1)[0];
                mappedTraits[index] = setInternalLinkText(link, trait);
            });
            tmp['mappedTraits'] = mappedTraits.join(', ');
        } else {
            tmp['mappedTraits'] = '-';
        }
        
        // Number Associations
        tmp['nr_associations'] = nr_association;

        // Initial sample desc
        var splitDescription = [];
        var descriptionToDisplay = [];
        var initial_sample_text = '-';
        if (study.initialSampleDescription) {

            // Split after each sample number, splitDescription[0] is an empty string
            splitDescription = study.initialSampleDescription.split(/([1-9][0-9]{0,2}(?:,[0-9]{3})*)/);
            for (var i = 1; i < splitDescription.length; i++) {
                if ( i % 2 == 0) {
                    // Join the sample number and it's description as one item
                    var item = splitDescription[i-1]+splitDescription[i].replace(/(,\s+$)/, "");
                    descriptionToDisplay.push(" ".concat(item));
                }
            }
            initial_sample_text = displayArrayAsList(descriptionToDisplay);

            if(splitDescription.length > 3 ) {
                initial_sample_text = initial_sample_text.html();
            }
        }
        tmp['initial_sample_text'] = initial_sample_text;
        
        
        // Replicate sample desc
        var replicate_sample_text = '-';
        if (study.replicateSampleDescription) {
            replicate_sample_text = displayArrayAsList(study.replicateSampleDescription.split(', '));
            if(study.replicateSampleDescription.split(', ').length>1)
                replicate_sample_text = replicate_sample_text.html()
        }
        tmp['replicate_sample_text'] = replicate_sample_text;
        
        
        // ancestralGroups
        // var ancestral_groups_text = '-';
        // if (study.ancestralGroups) {
        //     ancestral_groups_text = displayArrayAsList(study.ancestralGroups);
        //     if(study.ancestralGroups.length>1)
        //         ancestral_groups_text = ancestral_groups_text.html()
        //
        // }
        // tmp['ancestral_groups_text'] = ancestral_groups_text;


        // ancestryLinks
        var initial_ancestral_links_text = '-';
        var replicate_ancestral_links_text = '-';

        if (study.ancestryLinks) {
            var ancestry_and_sample_number_data = displayAncestryLinksAsList(study.ancestryLinks);

            initial_ancestral_links_text = ancestry_and_sample_number_data.initial_data_text;
            replicate_ancestral_links_text = ancestry_and_sample_number_data.replicate_data_text;

            if (typeof initial_ancestral_links_text === 'object') {
                initial_ancestral_links_text = initial_ancestral_links_text.html();
            }

            if (typeof replicate_ancestral_links_text === 'object') {
                replicate_ancestral_links_text = replicate_ancestral_links_text.html();
            }
        }
        tmp['initial_ancestral_links_text'] = initial_ancestral_links_text;
        tmp['replicate_ancestral_links_text'] = replicate_ancestral_links_text;
        
        data_json.push(tmp)
    }
});
    // Study count //
    $(".study_count").html(study_ids.length);
    
    if (study_ids.length == 1) {
        $(".study_label").html("Study");
    }

    // Display different default columns on different pages
    var defaultVisible = true;
    var defaultNotVisible = false;

    if (PAGE_TYPE == 'publication') {
        defaultVisible = false;
        defaultNotVisible = true;
    }

    var pub_date_help = '<span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" ' +
                                'data-container="body" title="Journal publication date YYYY-MM-DD"></span>'


    $('#study-table').bootstrapTable({
        exportDataType: 'all',
        filterControl: true,
        columns: [{
            field: 'Author',
            title: 'First author',
            sortable: true,
            visible: defaultVisible,
            filterControl: 'input'
        },  {
            field: 'study',
            title: 'Study accession',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'publi',
            title: 'Publication date '+pub_date_help,
            sortable: true,
            visible: defaultVisible,
            filterControl: 'input'
        }, {
            field: 'Journal',
            title: 'Journal',
            sortable: true,
            visible: defaultVisible,
            filterControl: 'input'
        }, {
            field: 'Title',
            title: 'Title',
            sortable: true,
            width: "1000", //This works when the table is not nested into other tag, for example, in a simple Div
            visible: defaultVisible,
            filterControl: 'input'
        }, {
            field: 'reported_trait',
            title: 'Reported trait',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'mappedTraits',
            title: 'Trait(s)',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'initial_sample_text',
            title: 'Discovery sample description',
            sortable: true,
            visible:  false,
            filterControl: 'input'
        }, {
            field: 'replicate_sample_text',
            title: 'Replication sample description',
            sortable: true,
            visible: false,
            filterControl: 'input'
        }, {
            field: 'initial_ancestral_links_text',
            title: 'Discovery sample number and ancestry',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'replicate_ancestral_links_text',
            title: 'Replication sample number and ancestry',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'nr_associations',
            title: 'Association count',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'link',
            title: 'Summary statistics',
            sortable: true,
            filterControl: 'input'
        } ],
        data: data_json,
    });

    $('#study-table').bootstrapTable('load',data_json)
    if(data_json.length>5){
        $('#study-table').bootstrapTable('refreshOptions',{pagination: true,pageSize: pageRowLimit,pageList: [5,10,25,50,100,'All']})
    }
    // Add custom tooltip text for button
    $('.keep-open').attr('title','Add/Remove Columns');
    hideLoadingOverLay('#study-table-loading')
}

/**
 * display FTP and API access links
 * @param {Object} data - study solr docs
 */
function checkSummaryStatsDatabase(data) {
    $.each(data, (index, summary_stats) => {
        var a = (summary_stats.authorAscii_s).replace(/\s/g, "");
    var dir = a.concat("_").concat(summary_stats.pubmedId).concat("_").concat(summary_stats.accessionId);
    checkIfStudyLoaded(summary_stats.accessionId, index, dir);
});
}

function checkIfStudyLoaded(study_accession, index, dir) {
    return promiseGet('/gwas/summary-statistics/api/studies/' + study_accession,
        {}, 'application/x-www-form-urlencoded').then(JSON.parse).then(function (data) {
        // Only studies loaded in the Summary stats db will have a 200 response
        updateColumn(index, dir);
        return data;
    }).catch(function (err) {
    })
}

function updateColumn(index, dir) {
    var ftplink = "<a href='ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/"
        .concat(dir).concat("' target='_blank'>");
    var linkFullPValue = ftplink.concat("FTP Download</a>");
    var apiLink = "&nbsp;&nbsp;or&nbsp;&nbsp;<a href='http://www.ebi.ac.uk/gwas/summary-statistics/docs' target='_blank'>API access</a>";

    $('#study-table').bootstrapTable('updateRow', {
        index: index,
        row: {
            link: linkFullPValue+apiLink
        }
    });
}