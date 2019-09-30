(function ($) {
    $(function () {
        var handoutsRef = firebase.database().ref('handouts/');
        var filesRef = firebase.storage().ref('handouts/');

        handoutsRef.once('value', function (snapshot) {
            var latest_count = 0;
            var latest_date = "";
            var counter = 0;
            snapshot.forEach(function (childSnapshot) {
                var i = counter;
                var v = childSnapshot.val();
                if (i === 0) {
                    latest_date = v["date"];
                }
                if (v["date"] === latest_date) {
                    latest_count++;
                } else {
                    latest_count = 1;
                    latest_date = v["date"];
                }
                var new_tr = "<tr><td>" + v["date"] + "</td><td><a href=\"" + v["file"] + "\" target=\"_blank\">" + v["title"] + "</a>" + (v["advanced"] ? "&nbsp;&nbsp;<span class=\"new badge red\" data-badge-caption=\"Advanced\"></span>" : "") + "</td></tr>";
                $(".handouts-table tbody").prepend(new_tr);
                counter++;
            });
            $(".handouts-table tbody > tr").each(function () {
                var link = $(this).find("a");
                var file = link.attr("href");
                filesRef.child(file).getDownloadURL().then(function(url) {
                    link.attr("href", url);
                });
            });
            var new_badge = "&nbsp;&nbsp;<span class=\"new badge\">" + latest_count + "</span>";
            $('.handouts-table thead tr td:nth-of-type(2)').html($('.handouts-table thead tr td:nth-of-type(2)').html() + new_badge);
            $(".progress").remove();
        });

    }); // end of document ready
})(jQuery); // end of jQuery name space