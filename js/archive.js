(function ($) {
    $(function () {

        $.getJSON('/assets/handouts.json', function(data) {         
            $.each(data["handouts"], function(i,v) {
                var new_tr = "<tr><td>"+v["date"]+"</td><td><a href=\"/assets/handouts/"+v["file"]+"\" target=\"_blank\">"+v["title"]+(v["advanced"] ? "*" : "")+"</a></td></tr>";
                $(".handouts-table tbody").append(new_tr)
            });
        });

    }); // end of document ready
})(jQuery); // end of jQuery name space