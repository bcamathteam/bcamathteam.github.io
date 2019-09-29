(function ($) {
    $(function () {
        var updatesRef = firebase.database().ref('updates/');
        var filesRef = firebase.storage().ref('attachments/');

        updatesRef.once('value', function (snapshot) {
            var files = {};
            snapshot.forEach(function (childSnapshot) {
                var i = childSnapshot.key;
                var v = childSnapshot.val();
                var new_tr = `<div class="col s12 m6" data-id="` + i.toString() + `">
                <div class="card orange lighten-3 z-depth-3 ">
                    <div class="card-content black-text">
                        <span class="card-title">`+ v["title"] + " (" + v["date"] + ")" + (i == snapshot.numChildren() - 1 ? "<span class=\"new badge\"></span>" : "") + `</span>
                        <p>`+ v["content"] + `</p>`
                if (v["files"]) files[i.toString()] = v["files"];
                new_tr += `</div></div></div>`;
                $(".updates-row").prepend(new_tr);

            });
            $(".updates-row > div").each(function () {
                if (!$(this).hasClass("preloader-container")) {
                    var div_id = $(this).attr("data-id");
                    var current_div = $(this);
                    if (files[div_id]) {
                        $.each(files[div_id], function (ii, vv) {
                            filesRef.child(vv).getDownloadURL().then(function (url) {
                                var btn = `<a target="_blank" href="` + url + `" class="waves-effect waves-light btn"><i class="material-icons left">file_download</i>` + vv + `</a>`;
                                current_div.find('.card-content').append(btn);
                            });
                        });
                    }
                }
            });

            $(".preloader-container").remove();
            $("#results").removeClass("hide");
        });

    }); // end of document ready
})(jQuery); // end of jQuery name space