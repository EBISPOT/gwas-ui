/**
 * Created by dwelter on 24/02/15.
 */


function processStudy(study, table) {
    var row = $("<tr>");
    //row.addClass('mainrow');
    var hiddenrow = $("<tr>");

    // if (table.find('.mainrow').length >= 5) {
    //    row.addClass('accordion-body');
    //    row.addClass('collapse');
    //    row.addClass('hidden-resource');
    // }


    var europepmc = "http://www.europepmc.org/abstract/MED/".concat(study.pubmedId);
    var ncbi="https://www.ncbi.nlm.nih.gov/pubmed/?term=".concat(study.pubmedId);

    var authorsList = study.authorsList.map( collaborator => { return collaborator.split(" | ")[0];}).toString();

    var authorsearch = "<span><a href='search?query=".concat(study.author).concat("' rel=\"tooltip\" title=\"").concat(authorsList).concat("\">").concat(study.author).concat(
        " et al.</a></span>");

    var epmclink = "<span><a href='".concat(europepmc).concat("' title='Go to EuropePMC' target='_blank'>").concat(
        "<img alt='externalLink' class='link-icon' src='icons/europepmcx20.png' th:src='@{icons/europepmcx20.png}'/></a></span>");
    var ncbilink = "<span><a href='".concat(ncbi).concat("' title='Go to NCBI' target='_blank'>").concat(
        "<img alt='externalLink' class='link-icon' src='icons/ncbix20.png' th:src='@{icons/ncbix20.png}'/></a></span>");


    var pubdate = study.publicationDate.substring(0, 10);
    var pubmedIdLink = '<a href="'+gwasProperties.contextPath+'publications/'+study.pubmedId+'" title="Go to the publication page">'+study.pubmedId+'&nbsp;<span class="gwas-icon-GWAS_Publication_2017"></span></a>';
    
    var accessionLink = '<a href="'+gwasProperties.contextPath+'studies/'+study.accessionId+'" title="Go to the study page">'+study.accessionId+'&nbsp;<span class="gwas-icon-GWAS_Study_2017"></span></a>';
    var pubmed = study.pubmedId;
    // To change
    //row.append($("<td>").html(authorsearch.concat(' (PMID: ').concat(study.pubmedId).concat(') &nbsp;&nbsp;').concat(
    //        ncbilink).concat('&nbsp;&nbsp;').concat(epmclink)));

    // GOCI-2138
    var viewPapers = '<div class=\"btn-group\"> <button type=\"button\" data-toggle=\"dropdown\" class=\"btn btn-xs btn-default dropdown-toggle\"><span><img alt=\"externalLink\" class=\"link-icon\" src=\"icons/external1.png\" th:src=\"@{icons/external1.png}\"/></span></button><ul class=\"dropdown-menu\"> <li><a target=\"_blank\" href=\"http://europepmc.org/abstract/MED/'+study.pubmedId+'\">View in Europe PMC</a></li> <li><a target=\"_blank\" href=\"http://www.ncbi.nlm.nih.gov/pubmed/?term='+study.pubmedId+'\">View in PubMed</a></li></ul></div>';

    row.append($("<td>").html(authorsearch));

    row.append($("<td>").html(pubmed.concat('&nbsp;').concat(viewPapers)));

    // below the details of the study
    var genotypingTechnologiesList = "";
    var genotypingIcon= "";
    var hasTargetArrayIcon = false;
    if (study.genotypingTechnologies != null) {
        var priorityGenotypingTech = "";
        for (var i = 0; i < study.genotypingTechnologies.length; i++) {
            if (study.genotypingTechnologies[i] == 'Genome-wide genotyping array') {
                priorityGenotypingTech = study.genotypingTechnologies[i] + ", ";
            }
            else {
                hasTargetArrayIcon = true;
                genotypingTechnologiesList = genotypingTechnologiesList.concat(study.genotypingTechnologies[i]);
                if (study.studyDesignComment != null) {

                    genotypingTechnologiesList = genotypingTechnologiesList.concat(" [").concat(study.studyDesignComment.trim()).concat("]");
                }
                genotypingTechnologiesList = genotypingTechnologiesList.concat(", ")
            }
        }

        genotypingTechnologiesList = priorityGenotypingTech + genotypingTechnologiesList;

        genotypingTechnologiesList = genotypingTechnologiesList.slice(0, -2);
    }

    if (hasTargetArrayIcon) {
        genotypingIcon = "<a href='#'><span class='glyphicon icon-GWAS_target_icon clickable context-help'" +
            " data-toggle='tooltip'" +
            "data-original-title='Targeted or exome array study'></span></a>";
    }

    var accessionInfo = (study.accessionId).concat(" ").concat(genotypingIcon);
    row.append($("<td>").html(accessionInfo));

    row.append($("<td>").html(pubdate));
    row.append($("<td>").html(study.publication));
    row.append($("<td>").html(study.title));
    var traitSearchURI = encodeURIComponent(study.traitName).replace(/[!'()*]/g, escape);
    var traitsearch = "<span><a href='search?query=".concat(traitSearchURI).concat("'>").concat(study.traitName).concat(
        "</a></span>");
    row.append($("<td>").html(traitsearch));


    //TO DO - uncomment once FTP structure & Solr variable are available

    var fullpvalset = study.fullPvalueSet;
    // var fullpvalset = 1;

    var pvalueflag = '';

    if(fullpvalset == 1) {


        var a = (study.authorAscii_s).replace(/\s/g,"");
        var dir = a.concat("_").concat(study.pubmedId).concat("_").concat(study.accessionId);

        var ftplink = "<a href='ftp://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/"
            .concat(dir).concat("' target='_blank'</a>");

        pvalueflag = ftplink.concat("<span class='glyphicon glyphicon-signal clickable context-help'" +
            " data-toggle='tooltip'" +
            "data-original-title='Click for summary statistics'></span></a>");

    }


    var count = study.associationCount;
    //var associationsearch = "<span><a href='search?query=".concat(study.id.substring(0,6)).concat("'>").concat(count).concat("</a></span>");
    var associationLink = (count + " ").concat(pvalueflag);
    row.append($("<td>").html(associationLink));

    //row.append($("<td>").html(study.associationCount));

    var id = (study.id).replace(':', '-');
    var plusicon = "<button class='row-toggle btn btn-default btn-xs accordion-toggle' data-toggle='collapse' data-target='.".concat(
        id).concat(".hidden-study-row' aria-expanded='false' aria-controls='").concat(study.id).concat(
        "'><span class='glyphicon glyphicon-plus tgb'></span></button>");

    row.append($("<td>").html(plusicon));
    table.append(row);


    hiddenrow.addClass(id);
    hiddenrow.addClass('collapse');
    hiddenrow.addClass('accordion-body');
    hiddenrow.addClass('hidden-study-row');

    var innerTable = $("<table>").addClass('sample-info');

    innerTable.append($("<tr>").append($("<th>").attr('style', 'width: 30%').html("Initial sample description")).append(
        $("<td>").html(study.initialSampleDescription)));

    if (study.ancestryLinks != null) {
        var initial = '';
        var replication = '';
        var iniancestries = [];
        var replancestries = [];

        for (var j = 0; j < study.ancestryLinks.length; j++) {
            var link = study.ancestryLinks[j].split("|");

            var coo = link[1];
            var cor = link[2];
            var ancestry = link[3];
            var num = link[4];

            if (link[0] == 'initial') {
                var existing = false;
                var index;

                for (var s = 0; s < iniancestries.length; s++) {
                    if (iniancestries[s]["ancestry"] == ancestry) {
                        existing = true;
                        index = s;
                        break;
                    }
                }

                if (existing) {
                    var current = iniancestries[index]["number"];
                    var total = parseInt(current) + parseInt(num);
                    iniancestries[index]["number"] = total;

                    if (cor.indexOf(',') != -1) {
                        cor = cor.split(",");
                        for (var i = 0; i < cor.length; i++) {
                            if (iniancestries[index]["country"].indexOf(cor[i]) == -1) {
                                iniancestries[index]["country"].push(cor[i]);
                            }
                        }
                    }
                    else {
                        if (iniancestries[index]["country"].indexOf(cor) == -1) {
                            iniancestries[index]["country"].push(cor);
                        }
                    }
                }
                else {
                    var corar = [];
                    if (cor.indexOf(',') != -1) {
                        corar = cor.split(",");
                    }
                    else {
                        corar[0] = cor;
                    }

                    var ances = {"ancestry": ancestry, "number": num, "country": corar};
                    iniancestries.push(ances);
                }

            }

            else {
                var existing = false;
                var index;

                for (var t = 0; t < replancestries.length; t++) {
                    if (replancestries[t]["ancestry"] == ancestry) {
                        existing = true;
                        index = t;
                        break
                    }
                }

                if (existing) {
                    var current = replancestries[t]["number"];
                    var total = parseInt(current) + parseInt(num);
                    replancestries[t]["number"] = total;

                    if (cor.indexOf(',') != -1) {
                        cor = cor.split(",");
                        for (var j = 0; j < cor.length; j++) {
                            if (replancestries[t]["country"].indexOf(cor[j]) == -1) {
                                replancestries[t]["country"].push(cor[j]);
                            }
                        }
                    }
                    else {
                        if (replancestries[t]["country"].indexOf(cor) == -1) {
                            replancestries[t]["country"].push(cor);
                        }
                    }
                }
                else {
                    var corar = [];
                    if (cor.indexOf(',') != -1) {
                        corar = cor.split(",");
                    }
                    else {
                        corar[0] = cor;
                    }

                    var ances = {"ancestry": ancestry, "number": num, "country": corar};
                    replancestries.push(ances);
                }
            }
        }


        for (var n = 0; n < iniancestries.length; n++) {
            if (n == 0) {
                initial = initial.concat(iniancestries[n]["number"]).concat(' ').concat(iniancestries[n]["ancestry"]);
            }
            else {
                initial =
                    initial.concat(', ').concat(iniancestries[n]["number"]).concat(' ').concat(iniancestries[n]["ancestry"]);
            }

            for (var m = 0; m < iniancestries[n]["country"].length; m++) {
                if (m == 0) {
                    initial = initial.concat(' (').concat(iniancestries[n]["country"][m]);
                }
                else {
                    initial = initial.concat(', ').concat(iniancestries[n]["country"][m]);
                }
            }
            initial = initial.concat(')');
        }

        if (initial == '') {
            initial = initial.concat("NR");
        }


        for (var p = 0; p < replancestries.length; p++) {
            if (p == 0) {
                replication =
                    replication.concat(replancestries[p]["number"]).concat(' ').concat(replancestries[p]["ancestry"]);
            }
            else {
                replication =
                    replication.concat(', ').concat(replancestries[p]["number"]).concat(' ').concat(replancestries[p]["ancestry"]);
            }

            for (var q = 0; q < replancestries[p]["country"].length; q++) {
                if (q == 0) {
                    replication = replication.concat(' (').concat(replancestries[p]["country"][q]);
                }
                else {
                    replication = replication.concat(', ').concat(replancestries[p]["country"][q]);
                }
            }
            replication = replication.concat(')');

        }

        if (replication == '') {
            replication = replication.concat("NR");
        }

        var ancestry_flag = '';
        // flag pre-2011 studies!
        if($.datepicker.parseDate("yy-mm-dd", pubdate) < $.datepicker.parseDate("yy-mm-dd", "2011-01-01")){
            ancestry_flag = "<span class='glyphicon glyphicon-exclamation-sign context-help' " +
                "data-toggle='tooltip' data-original-title='Pre-2011 ancestry not double-curated'></span>"
        }

        innerTable.append($("<tr>").append($("<th>").attr('style', 'width: 30%').html(
            "Initial ancestry (country of recruitment)")).append($("<td>").html(initial.concat(ancestry_flag))));
        innerTable.append($("<tr>").append($("<th>").attr('style',
            'width: 30%').html("Replication sample description")).append($(
            "<td>").html(study.replicateSampleDescription)));
        innerTable.append($("<tr>").append($("<th>").attr('style', 'width: 30%').html(
            "Replication ancestry (country of recruitment)")).append($("<td>").html(replication.concat(ancestry_flag))));
    }
    else {
        innerTable.append($("<tr>").append($("<th>").attr('style',
            'width: 30%').html("Replication sample description")).append($(
            "<td>").html(study.replicateSampleDescription)));

    }

    // above build the value
    if (genotypingTechnologiesList != "") {

        innerTable.append($("<tr>").append($("<th>").attr('style', 'width: 30%').html("Genotyping technology")).append(
            $("<td>").html(genotypingTechnologiesList)));
    }

    innerTable.append($("<tr>").append($("<th>").attr('style', 'width: 30%').html("Platform [SNPs passing QC]")).append(
        $("<td>").html(study.platform)));

    hiddenrow.append($('<td>').attr('colspan', 9).attr('style', 'border-top: none').append(innerTable));

    table.append(hiddenrow);
}

function processAssociation(association, table) {
    var row = $("<tr>");
    //if (table.find('tr').length >= 5) {
    //    row.addClass('accordion-body');
    //    row.addClass('collapse');
    //    row.addClass('hidden-resource');
    //}

    if (association.rsId != null && association.strongestAllele != null) {
        if ((association.rsId[0].indexOf(';') == -1) && (association.rsId[0].indexOf(' x ') == -1)) {
            var rsidsearch = '<span><a href=\"'+gwasProperties.contextPath+'variants/'+association.rsId[0]+'\" title=\"Go to the variant page\"><span class=\"gwas-icon-GWAS_Variant_2017\"></span>&nbsp;'+association.rsId[0]+'</a></span>';
            var dbsnp = "<span><a href='https://www.ensembl.org/Homo_sapiens/Variation/Summary?v=".concat(association.rsId[0]).concat(
                "'  target='_blank'>").concat(
                "<img alt='externalLink' class='link-icon' src='icons/external1.png' th:src='@{icons/external1.png}'/></a></span>");
            row.append($("<td>").html(rsidsearch.concat('&nbsp;&nbsp;').concat(dbsnp)));
        }
        else {
            var content = '';
            var rsIds = '';
            var alleles = '';
            var type = '';
            var description = '';

            //this is for a multi-SNP haplotype
            if (association.rsId[0].indexOf(';') != -1) {
                rsIds = association.rsId[0].split(';');
                alleles = association.strongestAllele[0].split(';');
                type = ';';

                if (association.locusDescription != null && association.locusDescription.indexOf('aplotype') != -1) {
                    description = association.locusDescription;
                }
            }
            //this is for an interaction
            else if (association.rsId[0].indexOf(' x ') != -1) {
                rsIds = association.rsId[0].split(' x ');
                alleles = association.strongestAllele[0].split(' x ');
                type = 'x';
            }

            for (var i = 0; i < alleles.length; i++) {
                for (var j = 0; j < rsIds.length; j++) {
                    if (alleles[i].trim().indexOf(rsIds[j].trim()) != -1) {
                        var rsidsearch = "<span><a href='search?query=".concat(rsIds[j].trim()).concat("'>").concat(
                            alleles[i].trim()).concat("</a></span>");
                        var ensembl = "<span><a href='http://www.ensembl.org/Homo_sapiens/Variation/Summary?v=".concat(
                            rsIds[j].trim()).concat("'  target='_blank'>").concat(
                            "<img alt='externalLink' class='link-icon' src='icons/external1.png' th:src='@{icons/external1.png}'/></a></span>");
                        if (content == '') {
                            content = content.concat(rsidsearch.concat('&nbsp;&nbsp;').concat(ensembl));
                        }
                        else {
                            if (type == 'x') {
                                content =
                                    content.concat(' x ').concat(rsidsearch.concat('&nbsp;&nbsp;').concat(ensembl));
                            }
                            else {
                                content =
                                    content.concat('; <br>').concat(rsidsearch.concat('&nbsp;&nbsp;').concat(ensembl));
                            }
                        }
                    }
                }
            }
            if (description != '') {
                content = content.concat('&nbsp;&nbsp;(').concat(description).concat(')');
            }
            row.append($("<td>").html(content));

        }
    }
    else if (association.rsId != null && association.strongestAllele == null) {
        row.append($("<td>").html(association.rsId));
    }
    else {
        row.append($("<td>"));
    }
    row.append($("<td>").html(association.riskFrequency));

    var mantissa = association.pValueMantissa;
    var exponent = association.pValueExponent;

    var pval = "".concat(mantissa).concat(" x10").concat("<sup>").concat(exponent).concat("</sup>");

    if (association.qualifier != null && association.qualifier != '') {
        pval = pval.toString().concat(" ").concat(association.qualifier[0]);
    }
    row.append($("<td>").html(pval));

    if (association.orPerCopyNum != null) {
        var or = (association.orPerCopyNum).toString();
        if (association.orDescription != null) {
            var or = or.concat(" ").concat(association.orDescription);
        }
        row.append($("<td>").html(or));
        row.append($("<td>").html(''));
    }
    else if (association.betaNum != null){
        row.append($("<td>").html(''));
        var beta = (association.betaNum).toString();
        if (association.betaUnit != null) {
            var beta = beta.toString().concat(" ").concat(association.betaUnit);
        }
        if (association.betaDirection != null) {
            var beta = beta.toString().concat(" ").concat(association.betaDirection);
        }
        if (association.orDescription != null) {
            var beta = beta.toString().concat(" ").concat(association.orDescription);
        }
        row.append($("<td>").html(beta));

    }
    else{
        row.append($("<td>").html(''));
        row.append($("<td>").html(''));
    }
    row.append($("<td>").html(association.range));
    if (association.region != null) {
        if (association.region[0].indexOf(' x ') != -1) {
            var regions = association.region[0].split(' x ');

            var region = '';
            for(var r = 0; r < regions.length; r++){
                var regionsearch = "<span><a href='search?query=".concat(region).concat("'>").concat(regions[r].trim()).concat(
                    "</a></span>");

                if(region == ''){
                    region = regionsearch;
                }
                else{
                    region = region.concat(" x ").concat(regionsearch);
                }
            }

            row.append($("<td>").html(region));
        }
        else if (association.region[0].indexOf(',') != -1) {
            var regions = association.region[0].split(', ');

            var region = '';
            for(var r = 0; r < regions.length; r++){
                var regionsearch = "<a href='search?query=".concat(region).concat("'>").concat(regions[r].trim()).concat(
                    "</a>");

                if(region == ''){
                    region = "<span>".concat(regionsearch);
                }
                else{
                    region = region.concat(", ").concat(regionsearch);
                }
            }
            region = region.concat("</span>");

            row.append($("<td>").html(region));
        }
        else {
            var regionsearch = "<span><a href='search?query=".concat(association.region).concat("'>").concat(association.region).concat(
                "</a></span>");
            row.append($("<td>").html(regionsearch));
        }
    }
    else {
        row.append($("<td>"));
    }

    var location = '';
    if (association.positionLinks != null) {
        for (var k = 0; k < association.positionLinks.length; k++) {
            var chromName = association.positionLinks[k].split("|")[0];
            var position = association.positionLinks[k].split("|")[1];

            var pattern = new RegExp("^\\d+$");

            if (pattern.test(chromName) || chromName == 'X' || chromName == 'Y') {

                var min = parseInt(position) - 500;
                var max = parseInt(position) + 500;
                var locationsearch = min.toString().concat("-").concat(max.toString());

                if (chromName != null && chromName != '') {
                    locationsearch = chromName.concat(':').concat(locationsearch);
                }

                var ensembl = "<span><a href='https://www.ensembl.org/Homo_sapiens/Location/View?r=".concat(locationsearch).concat(
                    "'  target='_blank'>").concat(
                    "<img alt='externalLink' class='link-icon' src='icons/external1.png' th:src='@{icons/external1.png}'/></a></span>");

                var locString = chromName;
                if (position == '') {
                    position = "?";
                }
                locString = locString.concat(":").concat(position);
                var locURL = locString.concat('&nbsp;&nbsp;').concat(ensembl);

                if(association.snpInteraction || association.multiSnpHaplotype){
                    if(location == ''){
                        location = association.chromLocation[0];
                    }

                    location = location.replace(locString, locURL);
                }

                else{
                    location = location.concat(locURL);

                }

            }
        }
    }
    else {
        location = location.concat("?:?");
    }


    row.append($("<td>").html(location));

    //row.append($("<td>"));
    row.append($("<td>").html(association.context));

    var repgene = '';


    if (association.reportedGene != null) {
        if (association.reportedGeneLinks != null) {
            if (association.reportedGeneLinks.length == association.reportedGene.length) {

                for (var j = 0; j < association.reportedGeneLinks.length; j++) {
                    var gene = association.reportedGeneLinks[j].split("|")[0];
                    var geneId = association.reportedGeneLinks[j].split("|")[1];

                    var repgenesearch = "<span><a href='search?query=".concat(gene).concat("'>").concat(gene).concat(
                        "</a></span>");
                    var ensembl = "<span><a href='https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=".concat(geneId).concat(
                        "'  target='_blank'>").concat(
                        "<img alt='externalLink' class='link-icon' src='icons/external1.png' th:src='@{icons/external1.png}'/></a></span>");

                    if (repgene == '') {
                        repgene = repgenesearch.concat('&nbsp;&nbsp;').concat(ensembl);
                    }

                    else {
                        repgene = repgene.concat(", ").concat(repgenesearch).concat('&nbsp;&nbsp;').concat(ensembl);
                    }
                }
            }
            else {
                for (var j = 0; j < association.reportedGene.length; j++) {
                    if(repgene == ''){
                        repgene = association.reportedGene[j];
                    }
                    else{
                        repgene = repgene.concat(", ").concat(association.reportedGene[j]);
                    }
                }

                for (var j = 0; j < association.reportedGeneLinks.length; j++) {
                    var gene = association.reportedGeneLinks[j].split("|")[0];
                    var geneId = association.reportedGeneLinks[j].split("|")[1];

                    var repgenesearch = "<span><a href='search?query=".concat(gene).concat("'>").concat(gene).concat(
                        "</a></span>");
                    var ensembl = "<span><a href='https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=".concat(geneId).concat(
                        "'  target='_blank'>").concat(
                        "<img alt='externalLink' class='link-icon' src='icons/external1.png' th:src='@{icons/external1.png}'/></a></span>");

                    var geneString = repgenesearch.concat('&nbsp;&nbsp;').concat(ensembl);

                    repgene = repgene.replace(gene, geneString);
                }
            }
        }
        else {
            if (association.reportedGene[0].indexOf("NR") != -1) {
                repgene = association.reportedGene[0];
            }
            else {
                for (var j = 0; j < association.reportedGene.length; j++) {
                    var repgenesearch = "<span><a href='search?query=".concat(association.reportedGene[j]).concat("'>").concat(
                        association.reportedGene[j]).concat("</a></span>");
                    if (repgene == '') {
                        repgene = repgenesearch;
                    }

                    else {
                        repgene = repgene.concat(", ").concat(repgenesearch);
                    }
                }
            }
        }
    }
    row.append($("<td>").html(repgene));

    var mapgene = '';
    if (association.ensemblMappedGeneLinks != null && association.ensemblMappedGenes != null) {
        var upstream = '';
        var downstream = '';
        var mapped = '';
        var lit = ''
        for (var k = 0; k < association.ensemblMappedGenes.length; k++) {
            var emg = association.ensemblMappedGenes[k];

            if(emg.indexOf(' - ') > -1 || emg.indexOf(' x ') > -1 || emg.indexOf('; ') > -1){
                //type = 'delim';
                if(lit == '') {
                    lit = emg;
                }
                else{
                    lit = lit.concat(", ").concat(emg);
                }
            }
            else{
                for (var j = 0; j < association.ensemblMappedGeneLinks.length; j++) {
                    if(association.ensemblMappedGeneLinks[j].indexOf(emg) > -1 || lit != ''){
                        var gene = association.ensemblMappedGeneLinks[j].split("|")[0];
                        var geneId = association.ensemblMappedGeneLinks[j].split("|")[1];
                        var dist = association.ensemblMappedGeneLinks[j].split("|")[2];
                        var chromName = association.ensemblMappedGeneLinks[j].split("|")[3];

                        var pattern = new RegExp("^\\d+$");

                        if (pattern.test(chromName) || chromName == 'X' || chromName == 'Y') {

                            var mapgenesearch = "<span><a href='search?query=".concat(gene).concat("'>").concat(gene).concat(
                                "</a></span>");
                            var ensembl = "<span><a href='https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=".concat(geneId).concat(
                                "'  target='_blank'>").concat(
                                "<img alt='externalLink' class='link-icon' src='icons/external1.png' th:src='@{icons/external1.png}'/></a></span>");

                            if (dist == 0) {
                                if (mapped == '') {
                                    mapped = mapgenesearch.concat('&nbsp;&nbsp;').concat(ensembl);
                                }
                                else {
                                    mapped =
                                        mapped.concat(", ").concat(mapgenesearch).concat('&nbsp;&nbsp;').concat(ensembl);
                                }
                            }
                            else if (dist > 0) {
                                upstream = mapgenesearch.concat('&nbsp;&nbsp;').concat(ensembl);
                            }
                            else {
                                downstream = mapgenesearch.concat('&nbsp;&nbsp;').concat(ensembl);
                            }

                        }

                    }

                }
            }
        }

        if(mapped != ''){
            mapgene = mapped;
        }
        else if(upstream != '' && downstream != ''){
            mapgene = upstream.concat(" - ").concat(downstream);
        }
        else if(upstream != '' && downstream == '') {
            mapgene = upstream.concat(" - N/A");
        }
        else if(upstream == '' && downstream != ''){
            mapgene = ("N/A - ").concat(downstream);
        }

        else if(lit != ''){
            mapgene = lit;

            if(mapped != ''){
                mapgene = mapgene.concat(', ').concat(mapped);
            }
        }

    }
    else if (association.ensemblMappedGenes != null) {
        for (var j = 0; j < association.ensemblMappedGenes.length; j++) {
            var mapgenesearch = "<span><a href='search?query=".concat(association.ensemblMappedGenes[j]).concat("'>").concat(
                association.ensemblMappedGenes[j]).concat("</a></span>");
            if (mapgene == '') {
                mapgene = mapgenesearch;
            }

            else {
                mapgene = mapgene.concat("-").concat(mapgenesearch);
            }
        }
    }
    else {
        mapgene = "No mapped genes";
    }
    row.append($("<td>").html(mapgene));

    if (association.traitName != null) {
        var traitSearchURI = encodeURIComponent(association.traitName).replace(/[!'()*]/g, escape);
        var traitsearch = "<span><a href='search?query=".concat(traitSearchURI).concat("'>").concat(association.traitName).concat(
            "</a></span>");
        row.append($("<td>").html(traitsearch));
    }
    else {
        row.append($("<td>"));
    }

    var studydate = association.publicationDate.substring(0, 4);
    var author = association.author[0].concat(' (PMID: ').concat(association.pubmedId).concat("), ").concat(studydate);

    var searchlink = "<span><a href='search?query=".concat(association.pubmedId).concat("'>").concat(author).concat(
        "</a></span>");

    var viewPapers = '<div class=\"btn-group\"> <button type=\"button\" data-toggle=\"dropdown\" class=\"btn btn-xs btn-default dropdown-toggle\"><span><img alt=\"externalLink\" class=\"link-icon\" src=\"icons/external1.png\" th:src=\"@{icons/external1.png}\"/></span></button><ul class=\"dropdown-menu\"> <li><a target=\"_blank\" href=\"http://europepmc.org/abstract/MED/'+association.pubmedId+'\">View in Europe PMC</a></li> <li><a target=\"_blank\" href=\"http://www.ncbi.nlm.nih.gov/pubmed/?term='+association.pubmedId+'\">View in PubMed</a></li></ul></div>';

    row.append($("<td>").html(searchlink.concat('&nbsp;&nbsp;').concat(viewPapers)));

    var accessionLink = '<a href="'+gwasProperties.contextPath+'studies/'+association.accessionId+'" title="Go to the study page"><span class="gwas-icon-GWAS_Study_2017"></span>&nbsp;'+association.accessionId+'</a>';
    row.append($("<td>").html(accessionLink));

    table.append(row);
}

