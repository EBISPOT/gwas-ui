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

    console.log("Attempting to load documentation...");

    return function(data, textStatus, jqXHR) {
        // Parsing path to generate breadcrumbs:
        var pathName = window.location.pathname;
        pathName = pathName.replace('/gwas/',''); // Removing home link
        pathName = pathName.replace("_", " "); // Removing underscores
        pathName = pathName.replace('doc', 'documentation'); // Changing doc to documentation
        if (pathName.match('download')){
            pathName = pathName.replace('documentation', 'downloads'); // Changing downloads when required.
        }
        var pathComponents = pathName.split('/');

        for ( var i = 0; i < pathComponents.length; i++ ){
            // Selecting component:
            var pathComponent = pathComponents[i];

            // Generate breadcrumb title:
            var pathTitle = pathComponent.replace('doc', 'documentation');

            pathTitle = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);
            console.log("** Crumb component: " + pathTitle);
            // Generate breadcrumb link:
            var URL = gwasProperties.contextPath;
            if ( i + 1 == pathComponents.length ){
                $("#breadcrumb ol").append(`<li>${pathComponent}</li>`);
            }
            else{
                URL = URL + "/" + pathComponent;
                $("#breadcrumb ol").append(`<li><a href="${URL}">${pathComponent}</a></li>`);
            }
        }
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