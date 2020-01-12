(function ($) {
    $(function () {
        var numPerPage = 5;
        $('.modal').modal({
            dismissible: false
        });
        $('.datepicker').datepicker({
            format: 'mm/dd/yyyy'
        });
        var handoutsRef = firebase.database().ref('handouts/');
        var filesRef = firebase.storage().ref('handouts/');
        function refreshUpdates(snapshot) {
            $(".handouts-table tbody").empty();
            $(".handouts-table thead .badge").remove();
            var table_rows = [];
            var count = 0;
            snapshot.forEach(function (childSnapshot) {
                var v = childSnapshot.val();
                var new_tr = "<tr data-id=\"" + childSnapshot.key + "\"><td>" + v["date"] + "</td><td><a href=\"" + v["file"] + "\" target=\"_blank\" class=\"handout-link\">" + v["title"] + "</a>" + (v["advanced"] ? "&nbsp;&nbsp;<span class=\"new badge red\" data-badge-caption=\"Advanced\"></span>" : "");
                // $(".handouts-table tbody").prepend(new_tr);
                var tr_obj = new Object();
                tr_obj.data = new_tr;
                tr_obj.date = v["date"];
                table_rows.push(tr_obj);
                count++;
            });
            table_rows.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
            var latest_date = table_rows[0].date;
            table_rows.forEach(function (item, index) {
                // $(".handouts-table tbody").append(item.data + (item.date == latest_date ? "&nbsp;&nbsp;<span class=\"new badge\"></span>" : "") + "</td></tr>");
                $(".handouts-table tbody").append(item.data + "</td></tr>");
            });
            $(".handouts-table tbody > tr").each(function () {
                var link = $(this).find("a");
                var file = link.attr("href");
                filesRef.child(file).getDownloadURL().then(function (url) {
                    link.attr("href", url);
                });
            });
            $("#adminmodal-delete select").empty();
            $(".handouts-table tbody > tr").each(function () {
                var data_id = $(this).attr("data-id");
                var title = $(this).find("td a").text();
                var option = $("<option></option>");
                option.attr("value", data_id);
                option.text(title);
                $("#adminmodal-delete select").append(option);
            });
            $('#adminmodal-delete select').formSelect();
            if (count % numPerPage != 0) {
                var numEntriesLeft = -(count % numPerPage) + numPerPage;
                for (var i =0; i< numEntriesLeft; i++){
                    $(".handouts-table tbody").append(`<tr style="display: table-row; visibility: hidden;"><td>Filler</td><td>Filler</td></tr>`);
                }
            }
            $(".handouts-table").pageMe({
                pagerSelector: '#myPager',
                activeColor: 'black',
                prevText: 'Previous',
                nextText: 'Next',
                showPrevNext: true,
                hidePageNumbers: false,
                perPage: numPerPage
            });
            $(".progress").remove();

        }
        handoutsRef.once('value', refreshUpdates);

        $("#admin-login").click(function () {
            var userEmail = $("#email").val();
            var userPass = $("#password").val();

            firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                // [START_EXCLUDE]
                if (errorCode === 'auth/wrong-password') {
                    $("#loginmodal").find(".alert").text("Wrong password.");
                } else if (errorCode === 'auth/user-not-found') {
                    $("#loginmodal").find(".alert").text("User not found.");
                } else if (errorCode === 'auth/invalid-email') {
                    $("#loginmodal").find(".alert").text("Invalid email.");
                } else {
                    $("#loginmodal").find(".alert").text("Incorrect credentials.");
                }
                $("#loginmodal").find(".alert").removeClass("hide");
            });
        });

        $("#admin-login-close").click(function () {
            $("#email").val('');
            $("#password").val('');
        });

        $("#admin-logout-btn").click(function () {
            firebase.auth().signOut();
        });

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                // User is signed in.
                // var displayName = user.displayName;
                // var email = user.email;
                // var emailVerified = user.emailVerified;
                // var photoURL = user.photoURL;
                // var isAnonymous = user.isAnonymous;
                // var uid = user.uid;
                // var providerData = user.providerData;
                $(".admin-panel").removeClass("hide");
                $("#loginmodal").modal('close');
                $("#loginmodal").addClass("hide");
                $("#admin-login-btn").addClass("hide");
                $("#admin-logout-btn").removeClass("hide");

                function postUpdate(title, date, advanced, file) {
                    var updateData = {
                        title: title,
                        date: date,
                        advanced: advanced,
                        file: file
                    }
                    var newPostKey = handoutsRef.push().key;
                    handoutsRef.child(newPostKey).set(updateData);
                    // M.toast({ html: 'Please refresh the page.' })
                    handoutsRef.once('value', refreshUpdates);
                }

                function clearAddUpdateModal() {
                    $("#update-title").val('');
                    $("#update-date").val('');
                    $("#update-files").val('');
                }

                $("#admin-submit").click(function () {
                    var title = $("#update-title").val();
                    var date = $("#update-date").val();
                    var file = $("#update-files").prop("files")[0];
                    if (title.length > 0 && date.length > 0 && file != null) {
                        var preload = `<div class="container"><div class="preloader-wrapper active center-align">
                        <div class="spinner-layer spinner-red-only">
                          <div class="circle-clipper left">
                            <div class="circle"></div>
                          </div><div class="gap-patch">
                            <div class="circle"></div>
                          </div><div class="circle-clipper right">
                            <div class="circle"></div>
                          </div>
                        </div>
                      </div></div>`;
                        $("#adminmodal .modal-content").empty();
                        $("#adminmodal .modal-content").append(preload);
                        $("#admin-submit").addClass("disabled");
                        $("#admin-close").addClass("disabled");
                        filesRef.child(file.name).put(file).then(function (param) {
                            postUpdate(title, date, $("#advanced-checked").is(":checked"), file.name);
                            $("#adminmodal").modal('close');
                        }).catch(function (error) {
                            M.toast({ html: 'An error occurred. Please refresh the page.' });
                        });
                    } else $("#adminmodal .alert").removeClass("hide").text("There are empty fields.");

                    clearAddUpdateModal();
                });

                $("#admin-close").click(function () {
                    clearAddUpdateModal();
                });

                $("#admin-delete").click(function () {
                    var delval = $('#adminmodal-delete select').find(":selected").val();
                    var update = handoutsRef.child(delval);
                    update.child('file').once('value', function (childSnapshot) {
                        var fileName = childSnapshot.val();
                        filesRef.child(fileName).delete();
                        update.remove();
                        $('#adminmodal-delete').modal('close');
                        handoutsRef.once('value', refreshUpdates);
                    });
                });
            } else {
                // User is signed out.
                // ...
                $(".admin-panel").addClass("hide");
                $("#admin-login-btn").removeClass("hide");
                $("#loginmodal").removeClass("hide");
                $("#admin-logout-btn").addClass("hide");
            }
        });

    }); // end of document ready
})(jQuery); // end of jQuery name space