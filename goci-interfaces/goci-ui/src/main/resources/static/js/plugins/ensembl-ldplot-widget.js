// LD Plot widget from Ensembl

function displayLDPlot() {
    try {
        Ensembl.newWidget(
            function() {
                return {
                    container: '._ld_graph',
                    widgetType: Ensembl.widgets.LDPlot
                }
            },

            function() {
                return {
                    configuration : {
                        //ID              : (window.location.search.match(/\Wv=(\w+)/) || []).pop() || 'rs2608307',
                        // "rs1042779"//"rs571247700" //"rs74251916"; //"rs1042779";
                        ID: (window.location.pathname.match(/variants\W(\w+)/) || []).pop(),
                        region_width    : 50,
                        region_width_options: ["500", "200","50","25"],
                        population      : '1000GENOMES:phase_3:GBR',
                        population_desc : 'British in England and Scotland (GBR)',
                        LDsvgSize       : {
                            //svgSize       : {
                            width        : 750,
                            height       : 450,
                            padding      : 50,
                            padding_left : 130
                        },
                        trackSvgSize: {
                            height  : 60,
                        },
                        tracks          : {
                            geneTrack        : true,
                            regulatoryTrack  : true,
                            anotherTrack     : false       //see example for SNP rs699
                        },
                        panelSize     : {
                            width       : 300,
                            tab_height  : 30,
                            padding     : 50
                        },
                        legend        : {
                            color_by      : "gwas",  //"gwas" ("consequence_type"  is removed)
                        },
                        help          : {
                            population : { link: "http://www.internationalgenome.org/faq/which-populations-are-part-your-study" },
                            variant_source: {text: "Filter plot by selecting/deselecting source"},
                            trait_category: {text: "Filter plot by selecting/deselecting trait category"}
                        },
                        download_ld   : {
                            enable  : true,
                            download_icon_class : '<span class="glyphicon glyphicon-download-alt" style="margin-right:7px"></span>',
                            download_text : "Download LD Data"
                        },
                        download_features   : {
                            enable  : true,
                            download_icon_class : '<span class="glyphicon glyphicon-download-alt" style="margin-right:7px"></span>',
                            download_text : "Download Overlapping Features"
                        },
                        filters       : {
                            selected_filters  : [], //example: ["#FFF", "ensembl"] others: "gwas", and the colours of the TRAIT categories (#FFFFB3)
                            parameter         : "r2",   //"r2"  or "d_prime"
                            parameter_thr     : "0.8",

                        }
                    }
                };
            });
    }
    catch(err) {
        $("._ld_graph").html('<div class="alert alert-danger" role="alert"><h4 class="has-warning">The LD widget is not available</h4><div>'+err+'</div></div>');
    }
}