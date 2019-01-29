$(document).ready(function() {
    var content = $("#docs-content");

    // read the window location to set the breadcrumb
    var path = window.location.pathname;
    /*var pagename = path.substr(path.lastIndexOf('/') + 1);
    var url = "content/".concat(pagename).concat("-content.html");
    console.log("Documentation should be loaded from " + url + "...");
   */
    index = path.indexOf('/docs/');
    page = path.substr(index+6);
    url= gwasProperties.contextPath+"docs/content/"+page+"-content.html";
    console.log("Documentation should be loaded from " + url + "...");
    
    // load the page content
    $.get(url, loadDocumentation(page, content)).fail(console.log("Failed to get content from " + url));
});

var loadDocumentation = function(pagename, content) {

    // Parsing path to generate breadcrumbs:
    var pathName = window.location.pathname;
    pathName = pathName.replace('/gwas/','')
    var pathComponents = pathName.split('/');

    for ( var i = 0; i < pathComponents.length; i++ ){
        // Selecting component:
        var pathComponent = pathComponents[i];

        // Generate breadcrumb title:
        var pathTitle = pathComponent.replace('doc', 'documentation');
        pathTitle = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);
        // <li id="docs-crumb"><a th:href="@{/docs}">Documentation</a></li>
    //       <li id="downloads-crumb" style="display: none"><a th:href="@{/downloads}">Downloads</a></li>
        //     <li id="current-page" class="active">Current page</li>
        // Generate breadcrumb link:
        var URL = gwasProperties.contextPath;
        if ( i + 1 == pathComponents.length ){
            $("#breadcrumb ul").append(`<li>${pathComponent}</li>`);
        }
        else{
            URL = URL + "/" + pathComponent;
            $("#breadcrumb ul").append(`<li><a href="${URL}">${pathComponent}</a></li>`);
        }



    }



    console.log("Attempting to load documentation...");

    return function(data, textStatus, jqXHR) {
        // set breadcrumb
        var displayName = pagename.replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });

        displayName = displayName.replace("-", " ");

        // if (displayName.toLowerCase() == "about") {
        //     $("#help-item").removeClass("active");
        //     $("#downloads-item").removeClass("active");
        //     $("#about-item").addClass("active");
        //     $("#downloads-crumb").hide();
        //     $("#docs-crumb").show();
        // }
        //
        // else
        if (displayName.toLowerCase() == "downloads" ||
            displayName.toLowerCase() == "file downloads" ||
            displayName.toLowerCase() == "diagram downloads" ||
            displayName.toLowerCase() == "summary statistics" ) {

            // $("#about-item").removeClass("active");
            $("#documentation-item").removeClass("active");
            $("#downloads-item").addClass("active");
            $("#docs-crumb").hide();
            $("#downloads-crumb").show();

        }
        else {
            // $("#about-item").removeClass("active");
            $("#downloads-item").removeClass("active");
            $("#documentation-item").addClass("active");
            $("#docs-crumb").show();
            $("#downloads-crumb").hide();
        }
        $("#current-page").text(displayName);



        console.log("Updated breadcrumb (" + displayName + ")");
        // load the data content
        console.log("Updating " + content + "...");
        //console.log(data);
        content.html(data);

        $.getJSON(gwasProperties.contextPath+'api/search/stats')
                .done(function(stats) {
                          setBuilds(stats);
                      });

        console.log("Done!");

    }

    function setBuilds(data) {
        try {
            $('#genomeBuild').text(data.genebuild);
            $('#dbSNP').text(data.dbsnpbuild);
        }
        catch (ex) {
            console.log("Failure to process build variables " + ex);
        }
    }
};