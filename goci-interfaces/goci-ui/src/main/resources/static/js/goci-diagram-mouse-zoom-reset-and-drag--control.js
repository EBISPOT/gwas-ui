function resetZoom() {
    shape = document.getElementsByTagName("svg")[0];
    shape.setAttribute("viewBox", '17 -214 8933 8933');
}

var renderingComplete = false;
var maxScale = 100;
var currentScale = maxScale / 2;
var scalingFactor = 1.0;
var dragOffsetX = 0;
var dragOffsetY = 0;

function zoomIn() {
    var viewBox = document.getElementById('main_gwas_svg').getAttribute("viewBox");
    var elements = viewBox.split(' ');
    // get current top left corner X&Y values & width and height
    var origX = parseFloat(elements[0]);
    var origY = parseFloat(elements[1]);
    var width = parseFloat(elements[2]);
    var height = parseFloat(elements[3]);

    var centX = (width / 20) + origX;
    var centY = (height / 20) + origY;

    // update scaling factor
    scalingFactor = scalingFactor * 0.95;
    $("#scale").html(scalingFactor);
    // calculate new sizes
    // transform width and height by multiplying by 0.95
    var newWidth = width * 0.95;
    var newHeight = height * 0.95;

    var newX = centX - (newWidth / 2);
    var newY = centY - (newHeight / 2);

    if (newX < -255) {
        newX = 20
    }
    if (newY < -460) {
        newY = 20
    }

    var newViewBox = newX + " " + newY + " " + newWidth + " " + newHeight;
    document.getElementById('main_gwas_svg').setAttribute("viewBox", newViewBox);
    console.log("Zoom in over SVG event.  New zoom level: " + scalingFactor + ", viewBox now set to " + newViewBox);
    // make sure zoom bar matches currentScale
    if (currentScale > 0 && currentScale < maxScale) {
        //$(".zoom-range").attr("value", currentScale);
        console.log("Set zoom bar value to " + currentScale);
    }
}

function zoomOut() {
    var viewBox = document.getElementById('main_gwas_svg').getAttribute("viewBox");
    var elements = viewBox.split(' ');
    // get current top left corner X&Y values & width and height
    var origX = parseFloat(elements[0]);
    var origY = parseFloat(elements[1]);
    var width = parseFloat(elements[2]);
    var height = parseFloat(elements[3]);

    var centX = (width / 2) + origX;
    var centY = (height / 2) + origY;

    // update scaling factor
    scalingFactor = scalingFactor * 1.05;
    $("#scale").html(2);
    // calculate new sizes
    // transform width and height by multiplying by 1.05
    var newWidth = width * 1.05;
    var newHeight = height * 1.05;

    var newX = centX - (newWidth / 2);
    var newY = centY - (newHeight / 2);

    if (newX < -255) {
        newX = 20
    }
    if (newY < -460) {
        newY = 20
    }

    var newViewBox = newX + " " + newY + " " + newWidth + " " + newHeight;
    document.getElementById('main_gwas_svg').setAttribute("viewBox", newViewBox);
    console.log("Zoom out over SVG event.  New zoom level: " + scalingFactor + ", viewBox now set to " + newViewBox);
    // make sure zoom bar matches currentScale (between min and max)
    if (currentScale > 0 && currentScale < maxScale) {
        //$(".zoom-range").attr("value", currentScale);
        console.log("Set zoom bar value to " + currentScale);
    }
}

// bind mousewheel event handler
$('#diagram-area-content').mousewheel(function (ev, delta, deltaX, deltaY) {
    if (delta > 0) {
        currentScale++;
        $(".zoom-range").val(currentScale).trigger('change');
        zoomIn();
    } else if (delta < 0) {
        currentScale--;
        $(".zoom-range").val(currentScale).trigger('change');
        zoomOut();
    }

});


// bind drag handler
$('#diagram-area-content').drag(function (ev, dd) {
    console.log(dd);
    $("#xOffset").html(dd.deltaX);
    $("#yOffset").html(dd.deltaY);
    pan(dd.deltaX, dd.deltaY);
}, {relative: true}).drag("end", function (ev, dd) {
        updateOffset();
    }
);

function pan(deltaX, deltaY) {
    var viewBox = document.getElementById('main_gwas_svg').getAttribute("viewBox");
    var elements = viewBox.split(' ');
    var newX = (parseFloat(-deltaX) * scalingFactor) + parseFloat(dragOffsetX);
    var newY = (parseFloat(-deltaY) * scalingFactor) + parseFloat(dragOffsetY);

    $("#xOffsetSVG").html(newX);
    $("#yOffsetSVG").html(newY);
    // get width and height
    var newViewBox = newX + " " + newY + " " + elements[2] + " " + elements[3];
    document.getElementById('main_gwas_svg').setAttribute("viewBox", newViewBox);
    console.log("Pan over SVG event.  ViewBox now set to " + newViewBox);
}

function updateOffset() {
    var viewBox = document.getElementById('main_gwas_svg').getAttribute("viewBox");
    var elements = viewBox.split(' ');
    dragOffsetX = elements[0];
    dragOffsetY = elements[1];
}
