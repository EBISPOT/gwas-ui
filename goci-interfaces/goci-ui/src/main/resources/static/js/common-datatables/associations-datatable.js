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
        asso_count = data.numFound
    }

    if (parseInt(asso_count) > 5000){
        let textDesc = `Warning: only the first 5000 could be displayed, out of ${asso_count} rows, please click the download catalog button to download the full data set`;
        $('#cut-off-notification').html(gociBootstrapNotify(textDesc));
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
        $.each(data.docs, function (index, asso) {

            //if association does not have rsid, skip
            if (asso.strongestAllele == undefined) {
                return true
            }

            var tmp = {};

            // Risk allele
            var riskAllele = asso.strongestAllele[0];

            // This line will remove the space from the risk allele (see GOCI-2480)
            riskAllele = riskAllele.replace(" -", "-");

            // there may be more than one variants for an association:
            var separator = ' x '; // SNP x SNP interactions are separated by ' x '
            if ( riskAllele.match(';') ){
                separator = ';'; // haplotypes are separated by ';'
            }
            var riskAlleles = riskAllele.split(separator);

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

            // Reconstructing the multi snp association:
            if ( separator == ';'){ separator = ', '}
            tmp['riskAllele'] = items.join(separator);


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

            // Confidence interval:
            var ci = (asso.range) ? asso.range : '-';
            tmp['ci'] = ci;

            // Parsing mapped genes - gene names have links pointing to the gene pages.
            // Handling unmapped, snp x snp, haplotype and regular associations.
            var mappedGenes = asso.ensemblMappedGenes;
            if ( typeof mappedGenes == 'undefined' ){ // no mapping available: kgp10698118
                tmp['mappedGenes'] = '-';
            }
            else if (mappedGenes.length === 1 && mappedGenes[0].match(" x ")){ // snp x snp interaction: rs2282015-G
                var combinedGenes = [];
                for ( var mappedComponents of mappedGenes[0].split(" x ")){
                    combinedGenes.push(generateLinkedGene(mappedComponents.split(" - "), " - "));
                }
                tmp['mappedGenes'] = combinedGenes.join(" x ");
            }
            else if (mappedGenes.length === 1 && mappedGenes[0].match("; ")){ // haplotype associations: rs2446581
                tmp['mappedGenes'] = generateLinkedGene(mappedGenes[0].split("; "), "; ");
            }
            else { // Ordinary variants, potentially multiple mapped genes: rs3897478
                tmp['mappedGenes'] = generateLinkedGene(mappedGenes);
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
            tmp['mappedTraits'] = setTraitsLink(asso);

            // Mapped background traits
            tmp['mappedBkgTraits'] = setBackgroundTraitsLink(asso);

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
                        parsedPositions.push(chrom + ':' + bpLocation)
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
    // generate filename:
    var filename = getFilename('associations');

    var bkg_trait_help = '<span class="glyphicon glyphicon-question-sign" data-toggle="tooltip" ' +
        'data-container="body" title="A trait that is not directly analysed in the GWAS, but is shared by all study ' +
        'participants as a common characteristic."></span>'

    $('#association-table').bootstrapTable({
        exportDataType: 'all',
        exportOptions: {
            fileName: filename
        },
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
            field: 'mappedBkgTraits',
            title: 'Background trait(s) ' + bkg_trait_help,
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

function gociBootstrapNotify(textDesc) {

    let div = document.createElement("div");
    div.setAttribute("class", "alert alert-warning");
    div.setAttribute("role", "alert");
    let text = document.createTextNode(textDesc);
    div.appendChild(text);
    return div;
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

// Generate link for a given gene names passed as array:
function generateLinkedGene(geneNames, separator = ', '){
    var linkedGenes = [];
    for ( var gene of geneNames){
        var linkObject = $('<a></a>').attr("href", gwasProperties.contextPath + 'genes/' + gene)
            .append(gene);
        linkedGenes.push(linkObject.prop('outerHTML'))
    }
    return (linkedGenes.join(separator));
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

/*
 This generates the file name using the date, table type and page identifier
  */
function getFilename(table) {
    // get current date
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    curr_month = curr_month < 10 ? '0' + curr_month : curr_month;

    var curr_year = d.getFullYear();
    var date = `${curr_year}-${curr_month}-${curr_date}`;
    // Set other parameters:
    var pathArray = window.location.pathname.split('/');
    var docType = pathArray[2];
    var query = pathArray[3];
    return (`${docType}_${query}-${table}-${date}`);
}
