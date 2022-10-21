$(document).ready(function() {
    
    var localFrameworkVersion = 'other'; // 1.1 or 1.2 or compliance or other
    // if you select compliance or other we will add some helpful
    // CSS styling, but you may need to add some CSS yourself
    var newDataProtectionNotificationBanner = document.createElement('script');
    newDataProtectionNotificationBanner.src = 'https://ebi.emblstatic.net/web_guidelines/EBI-Framework/v1.3/js/ebi-global-includes/script/5_ebiFrameworkNotificationBanner.js?legacyRequest='+localFrameworkVersion;
    document.head.appendChild(newDataProtectionNotificationBanner);
    newDataProtectionNotificationBanner.onload = function() {
        ebiFrameworkRunDataProtectionBanner('other'); // invoke the banner
        //$('#data-protection-banner').css("background-color", "#E7F7F9");
        //$('#data-protection-banner').css("color", "black");
        //$('#data-protection-banner').removeClass().addClass('data-protection-banner-gwas');
    };
    
    
    $("a").tooltip({
        'selector': '',
        'placement': 'top',
        'container':'body'
    });
    
    $('.auto-tooltip').tooltip();
    
    displayGenotyping();

    $('#search-button').click(function() {
        doSearch();
    });
    
    $('#search-box').keydown(function(event){
        if(event.keyCode == 13) {
            if($('#search-box').val().length >0) {
                doSearch();
            } else {return false;}
        }
    });

    /*
    Functions to capture search term from the header:
     */
    $('#header-search-button').click(function () {
        doSearch();
    });
    $('#header-search-box').keydown(function (event) {
        if (event.keyCode == 13){
            if( $('#header-search-box').val().length > 0) {
                doSearch();
            }
            else {
                useAutoCompleteInput();
            }
        }
    });
    
    $('.toplevel-view').hover(function() {
        $(this).addClass("background-color-complementary-accent", 300, "easeOutExpo");
    }, function() {
        $(this).removeClass("background-color-complementary-accent", 300, "easeOutExpo");
    });

    var shiftWindow = function() {
        scrollBy(0, -100)
    };
    window.addEventListener("hashchange", shiftWindow);
    function load() {
        if (window.location.hash) {
            shiftWindow();
        }
    }

    // Bug change column with id=associationID
    if($("#homepageStats").length){
        $.getJSON(gwasProperties.contextPath+'api/search/stats')
                .done(function(stats) {
                          setStats(stats);
                      });
    }

    $('body').tooltip({
                          selector: '[data-toggle="tooltip"]'
                      });
    $('[data-toggle="tooltip"]').tooltip({
                                             container: 'body'
                                         });

});

function displayGenotyping() {
    if($("#genotyping-dropdown").length > 0) {
        $('#genotyping-dropdown ul').empty();
        $('#genotyping-dropdown ul').append($("<li>").html('<input type="checkbox" class="genotyping-check" value="Exome genotyping array"/>&nbsp;Exome genotyping array'));
        $('#genotyping-dropdown ul').append($("<li>").html('<input type="checkbox" class="genotyping-check" value="Genome-wide genotyping array"/>&nbsp;Genome-wide genotyping array'));
        $('#genotyping-dropdown ul').append($("<li>").html('<input type="checkbox" class="genotyping-check" value="Targeted genotyping array"/>&nbsp;Targeted genotyping array'));
    }
}

function useAutoCompleteInput(){
    if(window.location.pathname.indexOf("/diagram") > -1){
        doFilter();
    }
    else{
        console.log("** useAutoCompleteInput - else")
        doSearch();
    }
}

function doSearch() {
    var searchTerm = "*";
    if( $("#search-box").length ) {
        searchTerm = $("#search-box").val();
    }
    else if ($("#header-search-box").length) {
        searchTerm = $("#header-search-box").val();
    }

    // redirect to search page
    var ORIGIN = window.location.origin;
    //console.log("** Search term: " + ORIGIN + "/gwas/search?query=" + searchTerm)
    window.location = ORIGIN + "/gwas/search?query=" + searchTerm;

}

function toggleSidebar(ts) {
    if ($(ts).hasClass('panel-collapsed')) {
        // expand the panel
        $(ts).parents('.panel').find('.panel-body').slideDown();
        $(ts).removeClass('panel-collapsed');
        $(ts).find('span').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        $(ts).parents('#filter-bar').removeClass('col-md-1').addClass('col-md-3');
        $(ts).parents('#filter-bar').siblings('#results-area').removeClass('col-md-11').addClass('col-md-9');

    }
    else {
        // collapse the panel
        $(ts).parents('.panel').find('.panel-body').slideUp();
        $(ts).addClass('panel-collapsed');
        $(ts).find('span').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        $(ts).parents('#filter-bar').removeClass('col-md-3').addClass('col-md-1');
        $(ts).parents('#filter-bar').siblings('#results-area').removeClass('col-md-9').addClass('col-md-11');
    }
}

function toggleDiv(ts) {
    var divId = '#'+ts;
    var buttonId = '#button-'+ts;
    if ($(divId).hasClass('collapse')) {
        $(divId).removeClass('collapse').addClass('expanded');
        $(divId).show();
        $(buttonId).find('span').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
    else {
        // collapse the panel
        $(divId).removeClass('expanded').addClass('collapse');
        $(divId).hide();
        $(buttonId).find('span').removeClass('glyphicon-minus').addClass('glyphicon-plus');
    }
}

function setStats(data) {
    try {
        $('#lastUpdateDate').text(data.date);
        $('#studyCount').text(data.studies);
        $('#associationCount').text(data.associations);
        $('#genomeAssembly').text(data.genebuild);
        $('#dbSNP').text(data.dbsnpbuild);
    }
    catch (ex) {
        console.log("Failure to process build variables " + ex);
    }
}


// GOCI-197 FTP Link Restructuring
function getDirectoryBin(gcstId){
    const gcst = gcstId.substring(gcstId.indexOf("GCST")+4);
    const lowerRange = (Math.floor((parseInt(gcst)-1)/1000))*1000+1;
    const upperRange = ((Math.floor((parseInt(gcst)-1)/1000))+1)*1000;
    const range = 'GCST'+lowerRange.toString().padStart(6, '0')+'-GCST'+upperRange.toString().padStart(6, '0');
    return range
}

function bootstrapNotify() {
    let div = document.createElement("div");
    div.setAttribute("className", "alert alert-warning");
    div.setAttribute("role", "alert");

    let startText = document.createTextNode("Warning: only the first 3000 rows could be displayed, please");
    let link = document.createElement("a");
    link.setAttribute("className", "alert-link");
    let linkText = document.createTextNode("click the download link here");
    link.appendChild(linkText);

    let trailingText = document.createTextNode("to download the full data set.");
    div.appendChild(startText);
    div.appendChild(link);
    div.appendChild(trailingText);

    return div;
}


