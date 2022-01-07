/**
 * Display table of pre/unpublished studies with summary stats
 * @param data
 */

function displayDatatableUnpublishedSummaryStats(data) {
    var filename = buildFileName('list_gwas_unpublished_summary_statistics_');

    $.each(data, (index, summary_stats) => {var tmp = {};

        var cc0_label = '';
        const ftpDir = getDirectoryBin(summary_stats.study_accession);
        var ftpPath = gwasProperties.FTP_PATH_PREFIX.concat(ftpDir).concat('/').concat(summary_stats.file);

        var ftplink = "<a href='" + ftpPath.concat("' target='_blank'>") + "Download</a>";
        summary_stats['path'] = ftplink;
        // Account for cases where the body_of_work is empty
        if (summary_stats['body_of_work'] === undefined || summary_stats['body_of_work'].length == 0 ) {
            summary_stats['author'] = 'NA';
            summary_stats['pubmed_id'] = 'NA';
            summary_stats['title'] = 'NA';
        } else {
            // Account for cases where the first author value is null
            if ('first_author' in summary_stats['body_of_work'][0]) {
                summary_stats['author'] = summary_stats['body_of_work'][0]['first_author'];
            } else {
                summary_stats['author'] = 'NA';
            }
            summary_stats['pubmed_id'] = summary_stats['body_of_work'][0]['pubmed_id'];
            summary_stats['title'] = summary_stats['body_of_work'][0]['title'];
        }
        /** Added for Goci-184 Summary stats Colums addition **/
        if (summary_stats['unpublishedAncestries'] === undefined || summary_stats['unpublishedAncestries'].length == 0 ) {
            summary_stats['ancestry_category'] = 'NA';
            summary_stats['sample_size'] = 'NA';
        } else {
            summary_stats['ancestry_category'] = summary_stats['unpublishedAncestries'][0]['ancestry_category'];
            summary_stats['sample_size'] = summary_stats['unpublishedAncestries'][0]['sample_size'];
        }

        if(summary_stats.agreed_to_cc0)
            cc0_label = '<a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank">CC0</a>';
        else
            cc0_label = '<a href="https://www.ebi.ac.uk/about/terms-of-use" target="_blank">\n' +
                'EBI terms of use</a>';
        summary_stats['agreed_to_cc0'] = cc0_label;

        var d = new Date(summary_stats['createdDate']).toISOString();
        summary_stats['date_submitted'] = d.split('T')[0];

        let studyAccession = summary_stats['study_accession'];
        summary_stats['study_accession'] = '<a href="'+gwasProperties.contextPath+'studies/'+studyAccession+'">'+studyAccession+'</a>';

    });
    $('#summary-stats-unpublished-table').bootstrapTable('removeAll');
    $('#summary-stats-unpublished-table').bootstrapTable({
        exportDataType: 'all',
        exportOptions: {
            fileName: filename
        },
        columns: [
            {
                field: 'author',
                title: 'First Author',
                sortable: true
            },
            {
                field: 'date_submitted',
                title: 'Date Submitted',
                sortable: true
            },
            {
                field: 'study_accession',
                title: 'Study Accession',
                sortable: true
            },
            {
                field: 'title',
                title: 'Title',
                sortable: true,
                //          width:"120", //This works when the table is not nested into other tag, for example, in a simple Div
            },
            {
                field: 'trait',
                title: 'Reported trait',
                sortable: true
            },
            /** Added for Goci-184 Summary stats Colums addition **/
            {
                field: 'ancestry_category',
                title: 'Ancestry Category',
                sortable: true
            },
            {
                field: 'sample_size',
                title: 'No of Individuals',
                sortable: true
            },
            {
                field: 'path',
                title: 'FTP Path',
                visible: true
            },
            {
                field: 'agreed_to_cc0',
                title: 'Usage License',
                visible: false
            }
        ],
        data: data,

    });
    $('#summary-stats-unpublished-table').bootstrapTable('load',data);
    if(data.length>5){
        $('#summary-stats-unpublished-table').bootstrapTable('refreshOptions',{showRefresh: true,pagination:true,pageSize: pageRowLimit, pageList: [5,10,25,50,100,'All']})
    }
    // Add custom tooltip text for button
    $('.keep-open').attr('title','Add/Remove Columns');
    hideLoadingOverLay('#summary-stats-table-loading');

}
function buildFileName(base) {
    // get current date
    var d = new Date();
    var curr_date = d.getDate();
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var curr_month = monthNames[d.getMonth()];
    var curr_year = d.getFullYear();
    var date = (curr_date + "_" + curr_month + "_" + curr_year);

    var filename = base+date;
    return filename;
}
    /** First refactoring action: common js - DRY. From Xin original code
 *  Datatable action to rendering summary stats panel.
 *  SAB 2018. MVP.
 * */

/**
 * display summary_stats table
 * @param {Object} data - summary_stats solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displayDatatableSummaryStats(data, summaryStatsStudyAccessions) {
    //by default, we clean the table before inserting data
    var summary_stats_ids = [];
    $('#summary-stats-table').bootstrapTable('removeAll');

    var data_json = []
    $.each(data.response.docs, (index, summary_stats) => {
        var tmp={};
        var cc0_label =  '';
    var summary_stats_id = summary_stats.accessionId;
        summary_stats_ids.push(summary_stats_id);
        tmp['accessionId'] = '<a href="'+gwasProperties.contextPath+'studies/'+summary_stats_id+'">'+summary_stats_id+'</a>';
        tmp['author'] = summary_stats.author_s;
        tmp['pubmedId'] = summary_stats.pubmedId;
        tmp['title'] = summary_stats.title;
        tmp['journal'] = summary_stats.publication;


        if(summary_stats.agreedToCc0)
            cc0_label = '<a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank">CC0</a>';
        else
            cc0_label = '<a href="https://www.ebi.ac.uk/about/terms-of-use" target="_blank">\n' +
                'EBI terms of use</a>';
        tmp['agreedToCc0'] = cc0_label;
        // Publication date
    var p_date = summary_stats.publicationDate;
    var publi = p_date.split('T')[0];
    tmp['publication_date'] = publi;

    // var catalog_publish_date = summary_stats.catalogPublishDate;
    // var cp_date = catalog_publish_date.split('T')[0];
    // tmp['catalog_publish_date'] = cp_date;

    tmp['reported_trait'] = summary_stats.traitName_s;

    var mappedTraits = summary_stats.mappedLabel;
    if (mappedTraits) {
        $.each(mappedTraits, function (index, trait) {
            var link = gwasProperties.contextPath + 'efotraits/' + summary_stats.mappedUri[index].split('/').slice(-1)[0];
            mappedTraits[index] = setExternalLinkText(link, trait);
        });
        tmp['mappedTraits'] = mappedTraits.join(', ');
    } else {
        tmp['mappedTraits'] = '-';
    }
    // Number Associations
    var nr_association = 0;
    if ('association_rsId' in summary_stats) {
        var arraysize= summary_stats.association_rsId;
        nr_association = arraysize.length;
    }

    tmp['nr_associations'] = nr_association.toString();
    var a = (summary_stats.authorAscii_s).replace(/\s/g,"").replace(/\'/g, '&#39;');
    var dir = a.concat("_").concat(summary_stats.pubmedId).concat("_").concat(summary_stats.accessionId);
    var dir_name = getDirectoryBin(summary_stats.accessionId);
    // Data Access
    var ftpPath = gwasProperties.FTP_PATH_PREFIX.concat(dir_name).concat('/').concat(summary_stats.accessionId);

    var ftplink = "<a href='"+ftpPath.concat("' target='_blank'>");

    var linkFullPValue = ftplink.concat("FTP Download</a>");



    if ($.inArray(summary_stats_id, summaryStatsStudyAccessions) != -1) {
        var apiLink = "&nbsp;&nbsp;or&nbsp;&nbsp;<a href='http://www.ebi.ac.uk/gwas/summary-statistics/docs' target='_blank'>API access</a>";
        tmp['link'] = linkFullPValue+apiLink;
    } else {
        tmp['link'] = linkFullPValue;
    }

    // FTP Path
    tmp['ftpPath'] = ftpPath;

    data_json.push(tmp);

    });

    var filename = buildFileName('list_gwas_summary_statistics_');
    $('#summary-stats-table').bootstrapTable({
        exportDataType: 'all',
        exportOptions: {
            fileName: filename
        },
        columns: [
            {
                field: 'author',
                title: 'First Author',
                sortable: true
            },
            {
                field: 'pubmedId',
                title: 'PubMed ID',
                sortable: true
            },
            {
                field: 'accessionId',
                title: 'Study accession',
                sortable: true
            },
            {
                field: 'publication_date',
                title: 'Publication date',
                sortable: true
            },
            {
                field: 'journal',
                title: 'Journal',
                sortable: true
            },{
                field: 'title',
                title: 'Title',
                sortable: true,
      //          width:"120", //This works when the table is not nested into other tag, for example, in a simple Div
            },
            {
                field: 'mappedTraits',
                title: 'Trait(s)',
                sortable: true
            },
            {
                field: 'reported_trait',
                title: 'Reported trait',
                sortable: true
            },

    /** Commented as part of #256 Removing the "association count" column from the sumstats availability **/
//            {
//                field: 'nr_associations',
//                title: 'Association count',
//                sortable: true
//            },
            {
                field: 'link',
                title: 'Data access',
                sortable: true
            },
            {
                field: 'ftpPath',
                title: 'FTP Path',
                visible: false
            },
            {
                field: 'agreedToCc0',
                title: 'Usage License',
                visible: false
            }
        ],
        data: data_json,

    });

    $('#summary-stats-table').bootstrapTable('load',data_json);
    if(data_json.length>5){
        $('#summary-stats-table').bootstrapTable('refreshOptions',{showRefresh: true,pagination:true,pageSize: pageRowLimit, pageList: [5,10,25,50,100,'All']})
    }
    // Add custom tooltip text for button
    $('.keep-open').attr('title','Add/Remove Columns');
    hideLoadingOverLay('#summary-stats-table-loading');
}


