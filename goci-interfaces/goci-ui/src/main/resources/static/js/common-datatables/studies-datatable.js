/** First refactoring action: common js - DRY. From Xin original code
 *  Datatable action to rendering studies panel.
 * */

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
    var study_id = study.id;
    if (jQuery.inArray(study_id, study_ids) == -1) {
        study_ids.push(study_id);
        // Author
        var author = study.author_s;
        var publicationDate = study.publicationDate;
        var pubDate = publicationDate.split("-");
        var pubmedId = study.pubmedId;
        var study_author = setQueryUrl(author, author);
        study_author += '<div><small>'+setExternalLink(EPMC_URL+pubmedId,'PMID:'+pubmedId)+'</small></div>';
        
        tmp['Author'] = study_author;
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
        tmp['study'] = '<a href="'+contextPath+'studies/'+study.accessionId+'"><span class="gwas-icon-GWAS_Study_2017"></span>&nbsp;'+study.accessionId+'</a>';
    
    
        // Journal
        tmp['Journal'] = study.publication;
        
        // Title
        tmp['Title'] = study.title;
        
        // Reported trait
        tmp['reported_trait'] = study.traitName_s;
        
        //Mapped EFO trait. Check if in the future might be more than 1
        tmp['efo'] = '<a href="'+contextPath+'efotraits/'+study.shortForm[0]+'"><span class="gwas-icon-GWAS_Trait_2017"></span>&nbsp;'+study.shortForm[0]+'</a>';
        
        
        // Number Associations
        tmp['nr_associations'] = nr_association.toString();
        
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
        var ancestral_groups_text = '-';
        if (study.ancestralGroups) {
            ancestral_groups_text = displayArrayAsList(study.ancestralGroups);
            if(study.ancestralGroups.length>1)
                ancestral_groups_text = ancestral_groups_text.html()
        }
        tmp['ancestral_groups_text'] = ancestral_groups_text;
        
        data_json.push(tmp)
    }
});
    // Study count //
    $(".study_count").html(study_ids.length);
    
    if (study_ids.length == 1) {
        $(".study_label").html("Study");
    }
    
    $('#study-table').bootstrapTable({
        exportDataType: 'all',
        columns: [{
            field: 'study',
            title: 'Study accession',
            sortable: true
            },
            {
            field: 'Author',
            title: 'Publication',
            sortable: true
        }, {
            field: 'publi',
            title: 'Publication date',
            sortable: true
        }, {
            field: 'Journal',
            title: 'Journal',
            sortable: true
        },{
            field: 'Title',
            title: 'Title',
            sortable: true,
            width:"1000", //This works when the table is not nested into other tag, for example, in a simple Div
        },
            {
                field: 'reported_trait',
                title: 'Reported trait',
                sortable: true
            },
            {
                field: 'efo',
                title: 'Mapped EFO trait',
                sortable: true
            },
            {
            field: 'initial_sample_text',
            title: 'Discovery sample description',
            sortable: true,
            visible: false
        },{
            field: 'replicate_sample_text',
            title: 'Replication sample description',
            sortable: true,
            visible: false
        },{
            field: 'ancestral_groups_text',
            title: 'Discovery sample number and ancestry',
            sortable: true,
            visible: false
        },{
            field: 'nr_associations',
            title: 'Association count',
            sortable: true
        }
        ],
        data: data_json,
        
    });
    $('#study-table').bootstrapTable('load',data_json)
    if(data_json.length>5){
        $('#study-table').bootstrapTable('refreshOptions',{pagination: true,pageSize: pageRowLimit,pageList: [5,10,25,50,100,'All']})
    }
    hideLoadingOverLay('#study-table-loading')
}
