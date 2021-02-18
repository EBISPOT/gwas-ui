/** First refactoring action: common js - DRY. From Xin original code
 *  Datatable action to rendering studies panel.
 * */
/**
 * display study table
 * @param {Object} data - study solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displayDatatableStudies(data, PAGE_TYPE, cleanBeforeInsert = true) {

    // We keep track of studies added to the datatable:
    if( typeof loadedStudies == "undefined" ){ window.loadedStudies = getLoadedStudies() }
    if( typeof study_ids == "undefined" ){ window.study_ids = [] }

    // Process data to format for data table:
    var data_json = [];
    if( data ){
        data_json = prepareDataForTable(data);
    }

    // Study count //
    $(".study_count").html(data_json.length);
    if( study_ids.length == 1 ) {
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

    // Generate filename for the downloaded file:
    var filename = getFilename('studies');

    // Render table:
    $('#study-table').bootstrapTable({
        exportDataType: 'all',
        exportOptions: {
            fileName: filename,
        },
        columns: [{
            field: 'Author',
            title: 'First author',
            sortable: true,
            visible: defaultVisible,
            filterControl: 'input'
        }, {
            field: 'study',
            title: 'Study accession',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'publi',
            title: 'Publication date ' + pub_date_help,
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
            visible: false,
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
        }],
        data: data_json
    });
    $('#study-table').bootstrapTable('load',data_json);
    if (data_json.length > 5) {
        $('#study-table').bootstrapTable('refreshOptions', {
            showRefresh: true,
            pagination: true,
            pageSize: pageRowLimit,
            pageList: [5, 10, 25, 50, 100, 'All']
        })
    }

    // Add custom tooltip text for button
    $('.keep-open').attr('title', 'Add/Remove Columns');
    hideLoadingOverLay('#study-table-loading')
}

/*
This function is only called when there is at least one study document.
It returns the json object ingested by the datatable function
 */
function prepareDataForTable(data){

    // Return variable:
    var data_json = [];

    // Looping through the submitted documents
    $.each(data, (index, study) => {

        // data with one row in the data table:
        var tmp = {};

        // Skipping study if already processed:
        if (jQuery.inArray(study.id, study_ids) == -1){
            study_ids.push(study.id);
        }

        // Save study ID for further checks in global variable:


        // Do we need to add genotyping icon:
        var genotypingIcon = "";
        if ((study.genotypingTechnologies.indexOf("Targeted genotyping array") > -1) ||
            (study.genotypingTechnologies.indexOf("Exome genotyping array") > -1)) {
            genotypingIcon = "<span style='font-size: 12px' class='glyphicon targeted-icon-GWAS_target_icon context-help'" +
                " data-toggle='tooltip'" +
                "data-original-title='Targeted or exome array study'></span>";
        }

        // Is summary stats available:
        var linkFullPValue = "NA";
        if (study.fullPvalueSet == 1) {
            var a = (study.authorAscii_s).replace(/\s/g, "");
            const ftpdir = getDirectoryBin(study.accessionId);
            var dir = a.concat("_").concat(study.pubmedId).concat("_").concat(study.accessionId);
            var ftplink = "<a href='ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/".concat(ftpdir).concat('/').concat(dir).concat("' target='_blank'</a>");
            linkFullPValue = ftplink.concat("FTP Download");
        }

        // Is study loaded to the summary stats database:
        if (loadedStudies.indexOf(study.accessionId) > -1) {
            if (linkFullPValue === "NA") {
                linkFullPValue = "<a href='http://www.ebi.ac.uk/gwas/summary-statistics/docs' target='_blank'>API access</a>";
            } else {
                linkFullPValue = linkFullPValue.concat("&nbsp;&nbsp;or&nbsp;&nbsp;<a href='http://www.ebi.ac.uk/gwas/summary-statistics/docs' target='_blank'>API access</a>");
            }
        }
        tmp['link'] = linkFullPValue;

        // Adding author:
        tmp['Author'] = study.author_s ? study.author_s : "NA";

        // Number Associations:
        tmp['nr_associations'] = study.associationCount ? study.associationCount : 0;

        // Publication date:
        var publication_date_full = study.publicationDate;
        var publication_date = publication_date_full.split('T')[0];
        tmp['publi'] = publication_date;

        // AccessionID:
        tmp['study'] = '<a href="' + gwasProperties.contextPath + 'studies/' + study.accessionId + '">' + study.accessionId + '</a>' + genotypingIcon;

        // Journal:
        tmp['Journal'] = study.publication;

        // Title:
        tmp['Title'] = '<a href="' + gwasProperties.contextPath + 'publications/' + study.pubmedId + '">' + study.title + '</a>';

        // Reported trait:
        tmp['reported_trait'] = study.traitName_s;

        // Mapped trait:
        tmp['mappedTraits'] = setTraitsLink(study);

        // Initial sample desc
        var splitDescription = [];
        var descriptionToDisplay = [];
        var initial_sample_text = '-';
        if (study.initialSampleDescription) {
            // Split after each sample number, splitDescription[0] is an empty string
            splitDescription = study.initialSampleDescription.split(/([1-9][0-9]{0,2}(?:,[0-9]{3})*)/);
            for (var i = 1; i < splitDescription.length; i++) {
                if (i % 2 == 0) {
                    // Join the sample number and it's description as one item
                    var item = splitDescription[i - 1] + splitDescription[i].replace(/(,\s+$)/, "");
                    descriptionToDisplay.push(" ".concat(item));
                }
            }
            initial_sample_text = displayArrayAsList(descriptionToDisplay);
            if (splitDescription.length > 3) {
                initial_sample_text = initial_sample_text.html();
            }
        }
        tmp['initial_sample_text'] = initial_sample_text;

        // Replicate sample desc
        var replicate_sample_text = '-';
        if (study.replicateSampleDescription) {
            replicate_sample_text = displayArrayAsList(study.replicateSampleDescription.split(', '));
            if (study.replicateSampleDescription.split(', ').length > 1)
                replicate_sample_text = replicate_sample_text.html()
        }
        tmp['replicate_sample_text'] = replicate_sample_text;

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
    });

    return(data_json)
}

// GOCI-197 FTP Link Restructuring
function getDirectoryBin(gcstId){
    const gcst = gcstId.substring(gcstId.indexOf("GCST")+4);
    const lowerRange = (Math.floor(parseInt(gcst)/1000))*1000+1;
    const upperRange = ((Math.floor(parseInt(gcst)/1000))+1)*1000;
    const range = 'GCST'+lowerRange.toString().padStart(6, '0')+'-GCST'+upperRange.toString().padStart(6, '0');
    return range
}

function getLoadedStudies() {
    var result = [];
    var URL = gwasProperties.SUMMARY_STATS_URL + '/study_list';
    $.ajax({
        url: URL,
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data) {
            for (var study of data._embedded.studies) {
                result.push(study[0].study_accession)
            }
        },
        error: function(request) {
            console.log("[Warning] Retrieving data from the summary stats database failed. URL: " + URL);
        }
    });
    return result;
};

