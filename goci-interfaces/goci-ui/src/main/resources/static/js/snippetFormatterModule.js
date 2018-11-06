var FormatSnippet = (function(){
    // Processing variant
    var generateVariantSnippet = function (document) {
        console.log('[Info] The processed document is a variant');
    };
    // Processing gene
    var generateGeneSnippet = function (document) {
        console.log('[Info] The processed document is a gene');
    };
    // Processing publication

    //Processing trait


    // Public API
    return {
        generateRows : function(document, divResult) {
            var resourceName = document.resourcename;

            // Execute common stuffs:
            var table = $('<table class="border-search-box">');
            var tbody = table.append('<tbody />').children('tbody');
            var row = $("<tr>");

            // Execute resoucename specific stuff:
            console.log(resourceName)
            switch(resourceName){
                case 'variant': generateVariantSnippet(document)
            }
            divResult.append(table);
            divResult.append("<br>");
        }
    }
})();


// Example dataset:

var dataset = [
    {
        "description": "6:75850781|6q14.1|Intron variant|MYO6",
        "merged_rsID": "",
        "link": "variants/rs9350602",
        "chromosomePosition": "75850781",
        "id": "variant:19177",
        "associationCount": 1,
        "mappedGenes": [
            "MYO6|ENSG00000196586|4646"
        ],
        "title": "rs9350602",
        "region": "6q14.1",
        "rsID": "rs9350602",
        "chromosomeName": "6",
        "consequence": "Intron variant",
        "resourcename": "variant",
        "current_rsID": "rs9350602",
        "studyCount": 1,
        "_version_": 1615305378578301000
    },
    {
        "description": "6:75846902|6q14.1|Intron variant|MYO6",
        "merged_rsID": "",
        "link": "variants/rs3798440",
        "chromosomePosition": "75846902",
        "id": "variant:19176",
        "associationCount": 1,
        "mappedGenes": [
            "MYO6|ENSG00000196586|4646"
        ],
        "title": "rs3798440",
        "region": "6q14.1",
        "rsID": "rs3798440",
        "chromosomeName": "6",
        "consequence": "Intron variant",
        "resourcename": "variant",
        "current_rsID": "rs3798440",
        "studyCount": 1,
        "_version_": 1615305378582495200
    },
    {
        "description": "6:75786165|6q14.1|Intron variant|MYO6",
        "merged_rsID": "",
        "link": "variants/rs9443189",
        "chromosomePosition": "75786165",
        "id": "variant:53553",
        "associationCount": 1,
        "mappedGenes": [
            "MYO6|ENSG00000196586|4646"
        ],
        "title": "rs9443189",
        "region": "6q14.1",
        "rsID": "rs9443189",
        "chromosomeName": "6",
        "consequence": "Intron variant",
        "resourcename": "variant",
        "current_rsID": "rs9443189",
        "studyCount": 1,
        "_version_": 1615305378584592400
    },
    {
        "description": "6:75783454|6q14.1|Intron variant|MYO6",
        "merged_rsID": "",
        "link": "variants/rs149740635",
        "chromosomePosition": "75783454",
        "id": "variant:21542939",
        "associationCount": 1,
        "mappedGenes": [
            "MYO6|ENSG00000196586|4646"
        ],
        "title": "rs149740635",
        "region": "6q14.1",
        "rsID": "rs149740635",
        "chromosomeName": "6",
        "consequence": "Intron variant",
        "resourcename": "variant",
        "current_rsID": "rs149740635",
        "studyCount": 1,
        "_version_": 1615305379294478300
    },
    {
        "description": "6:75826616|6q14.1|Intron variant|MYO6",
        "merged_rsID": "",
        "link": "variants/rs1280049",
        "chromosomePosition": "75826616",
        "id": "variant:33624878",
        "associationCount": 1,
        "mappedGenes": [
            "MYO6|ENSG00000196586|4646"
        ],
        "title": "rs1280049",
        "region": "6q14.1",
        "rsID": "rs1280049",
        "chromosomeName": "6",
        "consequence": "Intron variant",
        "resourcename": "variant",
        "current_rsID": "rs1280049",
        "studyCount": 1,
        "_version_": 1615305379935158300
    },
    {
        "associationCount": 5,
        "entrez_id": "4646",
        "end": 75919537,
        "cytoband": "6q14.1",
        "ensemblID": "ENSG00000196586",
        "title": "MYO6",
        "biotype": "protein_coding",
        "description": "myosin VI|6:75749192-75919537|6q14.1|protein_coding",
        "ensemblDescription": "myosin VI",
        "start": 75749192,
        "synonymsGene": "MYO6|myosin VI|KIAA0389|DFNA22|DFNB37|deafness, autosomal recessive 37",
        "rsIDs": [
            "rs9350602",
            "rs3798440",
            "rs9443189",
            "rs149740635",
            "rs1280049"
        ],
        "chromosome": "6",
        "resourcename": "gene",
        "id": "gene:ENSG00000196586",
        "studyCount": 5,
        "crossRefs": "HGNC:7605|OTTHUMG00000015061|uc003pih.2|U90236|AB002387|NM_004999|CCDS34487|CCDS75481|MGI:104785|Q9UM54",
        "_version_": 1615305169391583200
    }
];

var testDoc = dataset[1];


$(document).ready(function() {
    var divResult = $('#resultQuery').empty();
    var mod = FormatSnippet
    mod.generateRows(testDoc, divResult)
})


let SnippetFormatter = class FormatSnippet {
    constructor(resultsTag, queryString) {
        this.tag = resultsTag;
        this.queryString = queryString;
        this.snippetCount = 0;
    }

    // Initializing the snippet:
    var __initSnippet = function(){
        this.table = $('<table class="border-search-box">');
        this.tbody = table.append('<tbody />').children('tbody');
        this.row = $("<tr>");
    }

    // Closing the snippet:
    var __closeSnippet = function(){
        tbody.append(rowDescription);
        this.divResult.append(this.table);
        this.divResult.append("<br>");
    }

    // Adding study count to description:
    var __addStudyCount(){

    }

    // Add association count to description:
    var __addAssociationCount(){

    }

    // Processing variant
    var generateVariantSnippet = function (document) {
        console.log('[Info] The processed document is a variant');

        // Adding title row:
        var variantsLabsUrl = gwasProperties.contextPath+"variants/"+doc.rsID
        this.row.append($("<td rowspan='2' style='width: 3%'>").html(''));
        this.row.append($("<td style=\"width: 94%\">").html("<h3><span class='letter-circle letter-circle-variant'>&nbsp;V&nbsp;</span><a href="+variantsLabsUrl+">"+doc.title+"</a></h3>"));
        this.row.append($("<td rowspan='2' style='width: 3%'>").html(''));
        this.tbody.append(row);

        // Adding description row:
        var rowDescription = $("<tr>");

        // Parsing description:
        var descriptionTruncated = doc.description;
        var descriptionElements = descriptionTruncated.split("|");
        if (descriptionElements[1] == "NA"){
            this.variantDescription = "This variant could not be mapped to the genome."
        }
        else {
            this.variantDescription = "<b>Location: </b>"+descriptionElements[0] +
                "; <b>Cytogenetic region:</b>" + descriptionElements[1] +
                "; <b>Most severe consequence: </b>" + descriptionElements[2] +
                "; <b>Mapped gene(s): </b>" + descriptionElements[3];
        }
        descriptionTruncated = variantDescription;
        descriptionTruncated=addShowMoreLink(descriptionTruncated, 200,"...");
        descriptionTruncated = "<p class='descriptionSearch'>"+descriptionTruncated+"</p>";

    };

    // Processing gene
    var generateGeneSnippet = function (document) {
        console.log('[Info] The processed document is a gene');
    };

    // Processing publication

    //Processing trait

    // Hiding too long description
    var addShowMoreLink = function (content, showCharParam, ellipsestext) {
        var moretext = "Show more >";

        var html="";
        if(content.length > showCharParam) {

            var visible_text = content.substr(0, showCharParam);
            var lastSpace = visible_text.lastIndexOf("\&nbsp;");
            if (lastSpace > -1) {
                showCharParam = lastSpace;
                visible_text = content.substr(0, showCharParam);
            }
            var extra_text = content.substr(showCharParam, content.length - showCharParam);

            html = visible_text + '<span class="moreellipses">' + ellipsestext
                + '&nbsp;</span><span class="morecontent"><span>' + extra_text
                + '</span>&nbsp;&nbsp;<a href="javascript:void(0)" class="morelink">'
                + moretext + '</a></span>';

        }
        else {
            html = content;
        }

        return html;
    }

    // Public API
    generateRows : function(document, divResult) {
        var resourceName = document.resourcename;

        // Execute common stuffs:
        var table = $('<table class="border-search-box">');
        var tbody = table.append('<tbody />').children('tbody');
        var row = $("<tr>");

        // Execute resoucename specific stuff:
        console.log(resourceName)
        switch(resourceName){
            case 'variant': generateVariantSnippet(document)
        }
        divResult.append(table);
        divResult.append("<br>");
    }
}