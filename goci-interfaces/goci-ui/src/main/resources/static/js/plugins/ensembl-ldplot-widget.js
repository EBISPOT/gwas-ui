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
                    configuration: {
                        ID: (window.location.pathname.match(/variants\W(\w+)/) || []).pop(),
                        window_size: 50,
                        population: '1000GENOMES:phase_3:GBR',
                        svgSize: {
                            width: 850,
                            height: 400,
                            padding: 50
                        },
                        panelSize: {
                            width: 850,
                            tab_height: 30,
                            padding: 50
                        },
                        legend: {
                            color_by: "gwas"
                        },
                        help : {
                            population : { help_link: "//www.internationalgenome.org/faq/which-populations-are-part-your-study" },
                            ld  :        { help_link: "//www.ensembl.org/Help/View?id=279" }
                        },
                        download : {
                            enable : 1,
                            download_icon_class : '<span class="glyphicon glyphicon-download-alt" style="margin-right:7px"></span>', //replace this with the correct one from gwas
                            download_text : "Download LD Data"
                        },
                        filters: {
                            selected_filters: [],
                            parameter: "r2",   //"r2" or "d_prime"
                            sign_fix: 1, //no dropdown for above or below
                            parameter_sign: "above",
                            parameter_thr: "0.8"
                        }
                    }
                };
            });
    }
    catch(err) {
        $("._ld_graph").html('<div class="alert alert-danger" role="alert"><h4 class="has-warning">The LD widget is not available</h4><div>'+err+'</div></div>');
    }
}