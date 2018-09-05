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
        //var study_author = setQueryUrl(author, author);
        //study_author += '<div><small>'+setExternalLink(gwasProperties.EPMC_URL+pubmedId,'PMID:'+pubmedId)+'</small></div>';
    
        var genotypingIcon ="";
        if ((study.genotypingTechnologies.indexOf("Targeted genotyping array") > -1) ||
            (study.genotypingTechnologies.indexOf("Exome genotyping array") > -1) ) {
            genotypingIcon="<a href='#'><span class='glyphicon targeted-icon-GWAS_target_icon clickable context-help'" +
                " data-toggle='tooltip'" +
                "data-original-title='Targeted or exome array study'></span></a>";
        }
        
        var linkFullPValue = "";
        var fullpvalset = study.fullPvalueSet;
        if(fullpvalset == 1) {
        
            var a = (study.authorAscii_s).replace(/\s/g,"");
            var dir = a.concat("_").concat(study.pubmedId).concat("_").concat(study.accessionId);
        
            var ftplink = "<a href='ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/"
                .concat(dir).concat("' target='_blank'</a>");
        
            linkFullPValue = ftplink.concat("<span class='glyphicon glyphicon-signal clickable context-help'" +
                " data-toggle='tooltip'" +
                "data-original-title='Click for summary statistics'></span></a>");
        
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
                mappedTraits[index] = setExternalLinkText(link, trait);
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

    $('#study-table').bootstrapTable({
        exportDataType: 'all',
        columns: [{
            field: 'study',
            title: 'Study accession',
            sortable: true
        }, {
            field: 'Author',
            title: 'First author',
            sortable: true
        }, {
            field: 'publi',
            title: 'Publication date',
            sortable: true
        }, {
            field: 'Journal',
            title: 'Journal',
            sortable: true
        }, {
            field: 'Title',
            title: 'Title',
            sortable: true,
            width: "1000", //This works when the table is not nested into other tag, for example, in a simple Div
        }, {
            field: 'reported_trait',
            title: 'Reported trait',
            sortable: true
        }, {
            field: 'mappedTraits',
            title: 'Trait(s)',
            sortable: true
        }, {
            field: 'initial_sample_text',
            title: 'Discovery sample description',
            sortable: true,
            visible: false
        }, {
            field: 'replicate_sample_text',
            title: 'Replication sample description',
            sortable: true,
            visible: false
        }, {
            field: 'initial_ancestral_links_text',
            title: 'Discovery sample number and ancestry',
            sortable: true,
            visible: false
        }, {
            field: 'replicate_ancestral_links_text',
            title: 'Replication sample number and ancestry',
            sortable: true,
            visible: false

        }, {
            field: 'nr_associations',
            title: 'Association count',
            sortable: true
        }],
        data: data_json,
    });

    $('#study-table').bootstrapTable('load',data_json)
    if(data_json.length>5){
        $('#study-table').bootstrapTable('refreshOptions',{pagination: true,pageSize: pageRowLimit,pageList: [5,10,25,50,100,'All']})
    }
    hideLoadingOverLay('#study-table-loading')
}
