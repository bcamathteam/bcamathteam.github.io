(function ($) {
    $(function () {
        $('.modal').modal();
        $('.datepicker').datepicker({
            format: 'mm/dd/yy'
        });
        var updatesRef = firebase.database().ref('updates/');
        var filesRef = firebase.storage().ref('attachments/');

        function refreshUpdates(snapshot) {
            $(".updates-row").empty();
            var files = {};
            var counter = 0;
            snapshot.forEach(function (childSnapshot) {
                var i = counter;
                var v = childSnapshot.val();
                var new_tr = `<div class="col s12 m6" data-id="` + childSnapshot.key + `">
                <div class="card orange lighten-3 z-depth-2 hoverable">
                    <div class="card-content black-text">
                        <span class="card-title">`+ v["title"] + " (" + v["date"] + ")" + (i == snapshot.numChildren() - 1 ? "<span class=\"new badge\"></span>" : "") + `</span>
                        <p>`+ v["content"] + `</p>`
                if (v["files"]) files[childSnapshot.key] = v["files"];
                new_tr += `</div></div></div>`;
                $(".updates-row").prepend(new_tr);
                counter++;
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

            $("#adminmodal-delete select").empty();
            $(".updates-row > div").each(function () {
                var title = $(this).find(".card-title").text();
                var dataid = $(this).attr("data-id");
                var option = $("<option></option>");
                option.attr("value", dataid);
                option.text(title);
                $("#adminmodal-delete select").append(option);
            });
            $('#adminmodal-delete select').formSelect();

            $(".preloader-container").remove();
            $("#results").removeClass("hide");
        }
        updatesRef.once('value', refreshUpdates);

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

                function postUpdate(title, content, date, files) {
                    var updateData = {
                        title: title,
                        content: content,
                        date: date,
                        files: files
                    }
                    var newPostKey = updatesRef.push().key;
                    updatesRef.child(newPostKey).set(updateData);
                    updatesRef.once('value', refreshUpdates);
                }

                function clearAddUpdateModal() {
                    $("#update-title").val('');
                    $("#update-text").val('');
                    $("#update-date").val('');
                    $("#update-files").val('');
                }

                $("#admin-submit").click(function () {
                    var title = $("#update-title").val();
                    var content = $("#update-text").val();
                    var date = $("#update-date").val();
                    var files = $("#update-files").prop("files");
                    var file_names = [];
                    $.each(files, function (i, v) {
                        filesRef.child(v.name).put(v);
                        file_names.push(v.name);
                    });
                    if (title.length > 0 && content.length > 0 && date.length > 0) {
                        postUpdate(title, content, date, file_names);
                        $("#adminmodal").modal('close');
                    } else $("#adminmodal .alert").removeClass("hide").text("There are empty fields.");

                    clearAddUpdateModal();
                });

                $("#admin-close").click(function () {
                    clearAddUpdateModal();
                });

                $("#admin-delete").click(function () {
                    var delval = $('#adminmodal-delete select').find(":selected").val();
                    var update = updatesRef.child(delval);
                    update.child('files').once('value', function (childSnapshot) {
                        if (childSnapshot.val()) { // If there exist files to delete from storage
                            var counter = 0;
                            childSnapshot.val().forEach(function (fileName) {
                                filesRef.child(fileName).delete();
                                // .then(function() {
                                //     console.log("deleted successfully");
                                // }).catch(function(error) {
                                //     console.log("ERROR");
                                // });
                                if (counter === childSnapshot.numChildren() - 1) {
                                    update.remove();
                                    $('#adminmodal-delete').modal('close');
                                    updatesRef.once('value', refreshUpdates);
                                }
                                else counter++;
                            });
                        } else {
                            update.remove();
                            $('#adminmodal-delete').modal('close');
                            updatesRef.once('value', refreshUpdates);
                        }

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
        }); email - password.html
    }); // end of document ready
})(jQuery); // end of jQuery name space