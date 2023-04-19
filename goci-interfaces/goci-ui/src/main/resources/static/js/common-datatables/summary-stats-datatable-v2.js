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
