/** First refactoring action: common js - DRY. From Xin original code
 *  Datatable action to rendering association panel.
 * */


/**
 * display association table
 * @param {Object} data - association solr docs
 * @param {Boolean} cleanBeforeInsert
 */
function displayDatatableAssociations(data, cleanBeforeInsert) {
    //by default, we clean the table before inserting data
    if (cleanBeforeInsert === undefined) {
        cleanBeforeInsert = true;
    }

    var asso_count = 0;

    if (data != undefined) {
        asso_count = data.length
    }

    $(".association_count").html(asso_count);

    if (asso_count < 2) {
        $(".association_label").html("Association");
    }

    if (cleanBeforeInsert) {
        $('#association-table').bootstrapTable('removeAll');
    }

    var data_json = [];
    if (data != undefined) {
        $.each(data, function (index, asso) {

            //if association does not have rsid, skip
            if (asso.strongestAllele == undefined) {
                return true
            }

            var tmp = {};

            // Risk allele
            var riskAllele = asso.strongestAllele[0];

            // This line will remove the space from the risk allele (see GOCI-2480)
            riskAllele = riskAllele.replace(" -", "-")

            // there may be more than one riskAllele value
            var riskAlleles = riskAllele.split(";");

            var items = [];
            for (var i = 0; i < riskAlleles.length; i++) {
                var riskAlleleLabel = riskAlleles[i];
                var riskAllele_rsid = riskAlleles[i];

                if (riskAlleleLabel.match(/\w+-.+/)) {
                    // Split Risk Allele from Variant
                    var lastIndex = riskAlleleLabel.lastIndexOf('-');

                    riskAllele_rsid = riskAlleleLabel.substr(0, lastIndex).trim().replace(" ", "");

                    // bold only the risk allele and not the dash separator
                    riskAlleleLabel = '-<b>' + riskAlleleLabel.substr(lastIndex + 1, riskAlleleLabel.length).trim() + '</b>';

                    var riskAlleleDisplayLabel = riskAllele_rsid + riskAlleleLabel;
                }


                riskAllele = setInternalLinkText(gwasProperties.contextPath + 'variants/' + riskAllele_rsid, riskAlleleDisplayLabel);
                items.push(riskAllele);
            }

            tmp['riskAllele'] = items.join(', ');


            // Risk allele frequency
            tmp['riskAlleleFreq'] = asso.riskFrequency;

            // p-value
            var pValue = asso.pValueMantissa;
            tmp['pValueAnnotation'] = "";
            if (pValue) {
                var pValueExp = " x 10<sup>" + asso.pValueExponent + "</sup>";
                pValue += pValueExp;
                if (asso.qualifier) {
                    if (asso.qualifier[0].match(/\w/)) {
                        tmp['pValueAnnotation'] = " " + asso.qualifier.join(',');
                    }
                }
                tmp['pValue'] = pValue;
            } else {
                tmp['pValue'] = '-';
            }

            // OR
            var orValue = asso.orPerCopyNum;
            if (orValue) {
                if (asso.orDescription) {
                    orValue += " " + asso.orDescription;
                }
                tmp['orValue'] = orValue;
            } else {
                tmp['orValue'] = '-';
            }

            // Beta
            var beta = asso.betaNum;
            if (beta) {
                if (asso.betaUnit) {
                    beta += " " + asso.betaUnit;
                }
                if (asso.betaDirection) {
                    beta += " " + asso.betaDirection;
                }
                tmp['beta'] = beta;
            } else {
                tmp['beta'] = '-';
            }

            // CI
            var ci = (asso.range) ? asso.range : '-';
            tmp['ci'] = ci;


            // Reported genes
            var genes = [];
            var reportedGenes = asso.reportedGene;
            if (reportedGenes) {
                $.each(reportedGenes, function (index, gene) {
                    genes.push(setQueryUrl(gene));
                });
                tmp['reportedGenes'] = genes.join(', ');
            } else {
                tmp['reportedGenes'] = '-';

            }

            // Mapped genes
            var genes = [];
            var mappedGenes = asso.entrezMappedGenes;
            if (mappedGenes) {
                $.each(mappedGenes, function (index, gene) {
                    genes.push(gene);
                });
                tmp['mappedGenes'] = genes.join(', ');
            } else {
                tmp['mappedGenes'] = '-';

            }

            // Reported traits
            var traits = [];
            var reportedTraits = asso.traitName;
            if (reportedTraits) {
                $.each(reportedTraits, function (index, trait) {
                    traits.push(trait);
                });
                tmp['reportedTraits'] = traits.join(', ');
            } else {
                tmp['reportedTraits'] = '-';
            }

            // Mapped traits
            var mappedTraits = asso.mappedLabel;
            if (mappedTraits) {
                $.each(mappedTraits, function (index, trait) {
                    var link = gwasProperties.contextPath + 'efotraits/' + asso.mappedUri[index].split('/').slice(-1)[0]
                    mappedTraits[index] = setInternalLinkText(link, trait);
                });
                tmp['mappedTraits'] = mappedTraits.join(', ');
            } else {
                tmp['mappedTraits'] = '-';
            }

            // Adding genomic location to the table (but excluding mappings to patch regions)
            var genomicCoordinate = 'Mapping not available';
            if (asso.positionLinks){
                var parsedPositions = []
                var positions = asso.positionLinks;
                $.each(positions, function (index, position) {
                    // split position: "6|31237209|6p21.33",
                    positionValues = position.split('|');
                    var chrom = positionValues[0]
                    var bpLocation = positionValues[1]

                    // Test if the mapping is on a chromosome:
                    if ( chrom.length < 3 ){
                        parsedPositions.unshift(chrom + ':' + bpLocation)
                    }
                })

                // Updating coordinate string:
                if ( parsedPositions.length > 0 ){
                    genomicCoordinate = parsedPositions.join('|')
                }
            }
            tmp['location'] = genomicCoordinate;

            // Study
            var author = asso.author_s;
            tmp['author'] = author;
            var publicationDate = asso.publicationDate;
            var pubDate = publicationDate.split("-");
            var pubmedId = asso.pubmedId;
            //var study = setQueryUrl(author, author + " - " + pubDate[0]);
            //study += '<div><small>'+setExternalLink(gwasProperties.EPMC_URL+pubmedId,'PMID:'+pubmedId)+'</small></div>';
            var study = '<a href="' + gwasProperties.contextPath + 'studies/' + asso.accessionId + '">' + asso.accessionId + '</a>';
            tmp['study'] = study;
            var publication = '<a href="' + gwasProperties.contextPath + 'publications/' + asso.pubmedId + '">' + asso.pubmedId + '</a>';
            tmp['publication'] = publication;

            var studyId = asso.studyId;

            // Populate the table
            data_json.push(tmp)


        });
    }
    $('#association-table').bootstrapTable({
        exportDataType: 'all',
        filterControl: true,
        columns: [{
            field: 'riskAllele',
            title: 'Variant and risk allele',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'pValue',
            title: 'P-value',
            sortable: true,
            sorter: "pValueSorter",
            filterControl: 'input'
        }, {
            field: 'pValueAnnotation',
            title: 'P-value annotation',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'riskAlleleFreq',
            title: 'RAF',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'orValue',
            title: 'OR',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'beta',
            title: 'Beta',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'ci',
            title: 'CI',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'mappedGenes',
            title: 'Mapped gene',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'reportedTraits',
            title: 'Reported trait',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'mappedTraits',
            title: 'Trait(s)',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'study',
            title: 'Study accession',
            sortable: true,
            filterControl: 'input'
        }, {
            field: 'publication',
            title: 'PubMed ID',
            sortable: true,
            visible: false,
            filterControl: 'input'
        }, {
            field: 'author',
            title: 'First Author',
            sortable: true,
            visible: false,
            filterControl: 'input'
        },{
            field: 'location',
            title: 'Location',
            sortable: true,
            visible: true,
            filterControl: 'input'
        }],
        data: data_json,

    });

    $('#association-table').bootstrapTable('load', data_json)
    if (data_json.length > 5) {
        $('#association-table').bootstrapTable('refreshOptions', {
            pagination: true,
            pageSize: pageRowLimit,
            pageList: [5, 10, 25, 50, 100, 'All']
        })
    }
    // Add custom tooltip text for button
    $('.keep-open').attr('title', 'Add/Remove Columns');
    hideLoadingOverLay('#association-table-loading')
}

// This function returns matissa and exponent [mantissa, exponent]
function splitPValue(pValue) {
    try {
        var index = pValue.indexOf("</sup>");
        pValue = pValue.substr(0, index);
        composedValue = pValue.split(" x 10<sup>");
    }
    catch (ext) {
        return [0, 0];
    }
    return composedValue;
}

// compare two value a and b.
// Split text into mantissa, exponent.
// Compare exponent and after the mantissa. If a and b are equal no order
function pValueSorter(a, b) {
    var value1 = splitPValue(a);
    var value2 = splitPValue(b);
    if (parseInt(value1[1]) > parseInt(value2[1])) return 1;
    if (parseInt(value1[1]) < parseInt(value2[1])) return -1;
    if (parseInt(value1[0]) > parseInt(value2[0])) return 1;
    if (parseInt(value1[0]) < parseInt(value2[0])) return -1;
    return 0;
}
