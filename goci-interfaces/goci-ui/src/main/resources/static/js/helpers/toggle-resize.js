// It might change soon.
function addShowMoreLink(content, showCharParam, ellipsestext) {
    var moretext = "Show more >";
    
    var html="";
    if(content.length > showCharParam) {
        
        var visible_text = content.substr(0, showCharParam);
        var extra_text = content.substr(showCharParam, content.length - showCharParam);
       

        html = visible_text + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + extra_text + '</span>&nbsp;&nbsp;<a href="javascript:void(0)" class="morelink">' + moretext + '</a></span>';
        
        
    }
    else {
        html = content;
    }
    
    return html;
}

$(document).ready(function() {
    // Configure/customize these variables.
    var showChar = 100;  // How many characters are shown by default
    
    $('.more').each(function() {
        var content = $(this).html();
        html_trunc=addShowMoreLink(content, showChar, "...");
        $(this).html(html_trunc);
    });
    
    
});

//Since the class is added dynamically,
// you need to use event delegation to register the event handler
$(document).on('click', ".morelink", function() {
    var lesstext = "Show less";
    var moretext = "Show more >";
    if($(this).hasClass("less")) {
        $(this).removeClass("less");
        $(this).html(moretext);
    } else {
        $(this).addClass("less");
        $(this).html(lesstext);
    }
    $(this).parent().prev().toggle();
    $(this).prev().toggle();
    return false;
});