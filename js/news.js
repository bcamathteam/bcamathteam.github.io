(function ($) {
    $(function () {
        var updatesRef = firebase.database().ref('updates/');

        updatesRef.once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var i = childSnapshot.key;
                var v = childSnapshot.val();
                var new_tr = `<div class="col s12 m6">
                <div class="card orange lighten-3 z-depth-3 ">
                    <div class="card-content black-text">
                        <span class="card-title">`+ v["title"] + " (" + v["date"] + ")" + (i == snapshot.numChildren() - 1 ? "<span class=\"new badge\"></span>" : "") + `</span>
                        <p>`+ v["content"] + `</p>`
                if (v["files"]) {
                    $.each(v["files"], function (ii, vv) {
                        new_tr += `<a target="_blank" href="/assets/handouts/` + vv + `" class="waves-effect waves-light btn"><i class="material-icons left">file_download</i>` + vv + `</a>`
                    });
                }

                new_tr += `</div></div></div>`;
                $(".updates-row").prepend(new_tr);
            });
        });

    }); // end of document ready
})(jQuery); // end of jQuery name space