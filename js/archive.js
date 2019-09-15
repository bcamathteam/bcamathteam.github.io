(function ($) {
    $(function () {

        
        $.getJSON('/assets/handouts.json', function(data) {
            var latest_count = 0;
            var latest_date = "";
            $.each(data["handouts"].reverse(), function(i,v) {
                if (i === 0) {
                    latest_date = v["date"];
                }
                if (v["date"] === latest_date) {
                    latest_count++;
                }
                var new_tr = "<tr><td>"+v["date"]+"</td><td><a href=\"/assets/handouts/"+v["file"]+"\" target=\"_blank\">"+v["title"]+"</a>"+(v["advanced"] ? "&nbsp;&nbsp;<span class=\"new badge red\" data-badge-caption=\"Advanced\"></span>" : "")+"</td></tr>";
                $(".handouts-table tbody").append(new_tr)
            });
            var new_badge = "&nbsp;&nbsp;<span class=\"new badge\">"+latest_count+"</span>";
            $('.handouts-table thead tr td:nth-of-type(2)').html($('.handouts-table thead tr td:nth-of-type(2)').html()+new_badge);
        });

        

    }); // end of document ready
})(jQuery); // end of jQuery name space