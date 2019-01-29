/**
 * Display trait table
 * @param {Object} data - association solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displayDatatableTraits(data, HEADER_VALUE, cleanBeforeInsert) {

    //by default, we clean the table before inserting data
    if (cleanBeforeInsert === undefined) {
        cleanBeforeInsert = true;
    }


    if (cleanBeforeInsert) {
        $('#efotrait-table').bootstrapTable('removeAll');
    }


    // Preprocess data before adding to table
    var preprocessedData = preprocessData(data);

    var trait_count = 0;

    if (data != undefined) {
        trait_count = preprocessedData.length
    }

    $(".efotrait_count").html(trait_count);

    if (trait_count < 2) {
        $(".efotrait_label").html("Trait");
    }


    var data_json = [];

    if (preprocessedData != undefined) {
        $.each(preprocessedData, function (index, data_row) {

            var tmp = {};

            tmp['mappedTraits'] = data_row.efo_traits.join(', ');

            tmp['reportedTraits'] = data_row.reported_traits.join(', ');

            tmp['numberAssociations'] = data_row.num_associations;

            // Populate the table
            data_json.push(tmp)
        });
    }

    var association_header = "Association count with "+HEADER_VALUE;

    $('#efotrait-table').bootstrapTable({
        exportDataType: 'all',
        filterControl: true,
        columns: [{
            field: 'mappedTraits',
            title: 'Trait label(s)',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'reportedTraits',
            title: 'Reported trait',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'numberAssociations',
            title: association_header,
            sortable: true,
            filterControl: 'input'
        }],
        data: data_json,

    });

    $('#efotrait-table').bootstrapTable('load', data_json)
    if (data_json.length > 5) {
        $('#efotrait-table').bootstrapTable('refreshOptions', {
            pagination: true,
            pageSize: pageRowLimit,
            pageList: [5, 10, 25, 50, 100, 'All']
        })
    }
    // Add custom tooltip text for button
    $('.keep-open').attr('title', 'Add/Remove Columns');
    hideLoadingOverLay('#efotrait-table-loading')
}



function preprocessData(data) {

    var seen = [];
    var all_efo_trait_data = [];

    $.each(data, function (index, association_doc) {
        var efo_trait_data = {};

        var efo_id = association_doc.shortForm.sort();

        // join EFO Id to form unique key
        var efo_id_key = efo_id.join("_");

        // add only unique efo_id_key
        if ($.inArray(efo_id_key, seen) == -1) {
            seen.push(efo_id_key);

            // Get mapped EFO traits
            var efo_traits = association_doc.mappedLabel;

            // Get reportedTraits
            var reported_traits = getReportedTrait(association_doc);

            // Get count of associations
            var rsId = association_doc.rsId;

            // Build-up EFO Trait object, this will become 1 row in table
            efo_trait_data = {
                trait_id: efo_id_key,
                efo_traits: efo_traits,
                reported_traits: reported_traits,
                num_associations: rsId.length
            };
            all_efo_trait_data.push(efo_trait_data);
        }
        else {
            // Get object from all_efo_trait_data
            var index = all_efo_trait_data.findIndex(x => x.trait_id === efo_id_key);

            // Get reportedTraits
            var reported_traits = getReportedTrait(association_doc);

            // Get count of associations
            var rsId = association_doc.rsId;
            var new_association_count = rsId.length + all_efo_trait_data[index]['num_associations'];


            // Update Object
            all_efo_trait_data[index]['num_associations'] = new_association_count;

            var existing_reported_traits = all_efo_trait_data[index]['reported_traits'];

            // Add only unique Reported Traits to list
            if ($.inArray(reported_traits[0], existing_reported_traits) == -1) {
                existing_reported_traits.push(reported_traits[0]);
            }
            all_efo_trait_data[index]['reported_traits'] = existing_reported_traits;

        }
    });

    return all_efo_trait_data;
}


function getReportedTrait(association_doc) {
    // Reported traits
    var traits = [];
    var reportedTraits = association_doc.traitName;
    if (reportedTraits) {
        $.each(reportedTraits, function (index, trait) {
            traits.push(trait);
        });
    } else {
        traits.push("-");
    }
    return traits;
}