(function ($) {
    $(function () {
        $('.modal').modal();
        $('.datepicker').datepicker({
            format: 'mm/dd/yy'
        });
        var handoutsRef = firebase.database().ref('handouts/');
        var filesRef = firebase.storage().ref('handouts/');

        function refreshUpdates(snapshot) {
            $(".handouts-table tbody").empty();
            $(".handouts-table thead .badge").remove();
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
                var new_tr = "<tr data-id=\"" + childSnapshot.key + "\"><td>" + v["date"] + "</td><td><a href=\"" + v["file"] + "\" target=\"_blank\">" + v["title"] + "</a>" + (v["advanced"] ? "&nbsp;&nbsp;<span class=\"new badge red\" data-badge-caption=\"Advanced\"></span>" : "") + "</td></tr>";
                $(".handouts-table tbody").prepend(new_tr);
                counter++;
            });
            $(".handouts-table tbody > tr").each(function () {
                var link = $(this).find("a");
                var file = link.attr("href");
                filesRef.child(file).getDownloadURL().then(function (url) {
                    link.attr("href", url);
                });
            });
            var new_badge = "&nbsp;&nbsp;<span class=\"new badge\">" + latest_count + "</span>";
            $('.handouts-table thead tr td:nth-of-type(2)').html($('.handouts-table thead tr td:nth-of-type(2)').html() + new_badge);

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
                        filesRef.child(file.name).put(file);
                        postUpdate(title, date, $("#advanced-checked").is(":checked"), file.name);
                        $("#adminmodal").modal('close');
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