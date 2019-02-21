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

    // generate filename:
    var filename = getFilename('traits');

    $('#efotrait-table').bootstrapTable({
        exportDataType: 'all',
        exportOptions: {
            fileName: filename
        },
        filterControl: true,
        columns: [{
            field: 'mappedTraits',
            title: 'Trait label(s)',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'reportedTraits',
            title: 'Reported trait(s)',
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
    var all_mapped_traits = [];

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

            if (association_doc.mappedLabel) {
                $.each(efo_traits, function(index, mapped_trait) {
                    var link = gwasProperties.contextPath + 'efotraits/' + association_doc.mappedUri[index].split('/').slice(-1)[0];
                    efo_traits[index] = setInternalLinkText(link, mapped_trait);
                    // add unique traits only
                    if (jQuery.inArray(efo_traits[index], all_mapped_traits) == -1) {
                        all_mapped_traits.push(efo_traits[index]);
                    }
                });
            }
            // sort multi-word traits in alphabetical order
            all_mapped_traits.sort(function(a,b) {
                // extract trait label from URL
                var a_first_word_index = parseInt(a.indexOf(">")) + 1;
                var a_last_word_index = a.indexOf("</a>");
                var a_words = a.slice(a_first_word_index, a_last_word_index).toLowerCase();

                var b_first_word_index = parseInt(b.indexOf(">")) + 1;
                var b_last_word_index = b.indexOf("</a>");
                var b_words = b.slice(b_first_word_index, b_last_word_index).toLowerCase();

                // find shortest trait label
                var shortest_trait_label;
                if (a_words.split(' ').length < b_words.split(' ').length) {
                    shortest_trait_label = a_words.split(' ').length;
                } else {
                    shortest_trait_label = b_words.split(' ').length;
                }

                // find word index in trait label to compare for alphabetical ordering, some traits
                // start with the same word, e.g. coronary artery disease vs. coronary heart disease
                for (var i = 0; i < shortest_trait_label; i++) {
                    if (a_words.split(' ')[i] == b_words.split(' ')[i]) {
                        continue;
                    }
                    else {
                        break;
                    }
                }

                if (a_words.split(' ')[i] < b_words.split(' ')[i]) {
                    return -1;
                }
                if (a_words.split(' ')[i] > b_words.split(' ')[i]) {
                    return 1;
                }
                return 0;
            });

            // Get reportedTraits
            var reported_traits = getReportedTrait(association_doc);

            // Get count of associations
            var association_count = association_doc.rsId.length;

            // Build-up EFO Trait object, this will become 1 row in table
            efo_trait_data = {
                trait_id: efo_id_key,
                efo_traits: efo_traits,
                reported_traits: reported_traits,
                num_associations: association_count
            };
            all_efo_trait_data.push(efo_trait_data);
        }
        else {
            // Get object from all_efo_trait_data
            var index = all_efo_trait_data.findIndex(x => x.trait_id === efo_id_key);

            // Get reportedTraits
            var reported_traits = getReportedTrait(association_doc);

            // Get count of associations
            var association_count = association_doc.rsId.length;


            // Update Object
            var new_association_count = association_count + all_efo_trait_data[index]['num_associations'];
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