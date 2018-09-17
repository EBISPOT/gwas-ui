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
        
        var linkFullPValue = "";
        var fullpvalset = study.fullPvalueSet;
        if(fullpvalset == 1) {
        
            linkFullPValue = "<span style='font-size: 12px' class='glyphicon glyphicon-signal clickable context-help'" +
                " data-toggle='tooltip'" +
                "data-original-title='Click for summary statistics'></span>";
        
        }
        
        
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
        tmp['nr_associations'] = nr_association.toString()+linkFullPValue;
        
        // Initial sample desc
        var initial_sample_text = '-';
        if (study.initialSampleDescription) {
            
            initial_sample_text = displayArrayAsList(study.initialSampleDescription.split(', '));
            if(study.initialSampleDescription.split(', ').length>1)
                initial_sample_text = initial_sample_text.html()
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

            if (study.ancestryLinks.length > 1) {
                initial_ancestral_links_text = initial_ancestral_links_text.html();
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


    $('#study-table').bootstrapTable({
        exportDataType: 'all',
        filterControl: true,
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
            title: 'Publication date',
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
            visible: defaultVisible,
            filterControl: 'input'
        }, {
            field: 'replicate_sample_text',
            title: 'Replication sample description',
            sortable: true,
            visible: defaultVisible,
            filterControl: 'input'
        }, {
            field: 'initial_ancestral_links_text',
            title: 'Discovery sample number and ancestry',
            sortable: true,
            visible: defaultNotVisible,
            filterControl: 'input'
        }, {
            field: 'replicate_ancestral_links_text',
            title: 'Replication sample number and ancestry',
            sortable: true,
            visible: defaultNotVisible,
            filterControl: 'input'
        }, {
            field: 'nr_associations',
            title: 'Association count',
            sortable: true,
            filterControl: 'input'
        }],
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
