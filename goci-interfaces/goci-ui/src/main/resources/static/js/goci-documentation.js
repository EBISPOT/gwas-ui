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
        /*
        The process of the generation of the breadcrumbs is a non-trivial issue, as the URL structure does not
        follow the website page hierarchy. Therefore we have to implement logic to interpret the context based on the URL.
         */

        // Extracting component names from URL:
        var pathName = window.location.pathname;
        pathName = pathName.replace('/gwas/',''); // Removing home link
        if (pathName.match('download')){
            pathName = pathName.replace('docs', 'downloads'); // Changing downloads when required.
        }
        var pathComponents = pathName.split('/');

        // Looping through all URL components and generate the breadcrumb component
        var URL = gwasProperties.contextPath; // The path will be extended by each component when generating the link
        for ( var i = 0; i < pathComponents.length; i++ ){

            // Selecting component:
            var pathComponent = pathComponents[i];

            // Generate breadcrumb title:
            var pathTitle = pathComponent.replace('docs', 'documentation');
            pathTitle = pathTitle.replace(/-/g, " ");
            pathTitle = pathTitle.charAt(0).toUpperCase() + pathTitle.slice(1);

            // Adding breadcrumb without and with link:
            if ( i + 1 == pathComponents.length ){
                $("#breadcrumb ol").append(`<li>${pathTitle}</li>`);
            }
            else{
                URL = URL + "/" + pathComponent;
                $("#breadcrumb ol").append(`<li><a href="${URL}">${pathTitle}</a></li>`);
            }
        }

        content.html(data);

        $.getJSON(gwasProperties.contextPath+'api/search/stats')
            .done(function(stats) {
                setBuilds(stats);
            });

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