(function ($) {
    $(function () {
        $('.modal').modal({
            dismissible: false
        });
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
                                var btn = `<a target="_blank" href="` + url + `" class="waves-effect black-text yellow darken-3 waves-light btn"><i class="material-icons left">file_download</i>` + vv + `</a>`;
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
                    // M.toast({ html: 'Please refresh the page.' })
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

                    if (title.length > 0 && content.length > 0 && date.length > 0) {
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
                        var put_files = async function () {
                            for (var i = 0; i < files.length; ++i) {
                                v = files[i];
                                await filesRef.child(v.name).put(v).then(function (param) {
                                    file_names.push(v.name);
                                }).catch(function (error) {
                                    M.toast({ html: 'An error has occurred. Please refresh the page.' })
                                });
                            }
                        };
                        put_files().then(function () {
                            postUpdate(title, content, date, file_names);
                            $("#adminmodal").modal('close');
                            $("#adminmodal .modal-content").empty();
                            var form = `<div class="row">
                            <div class="input-field col s12">
                                <input type="text" id="update-title" class="validate">
                                <label for="update-title">Title</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s12">
                                <textarea id="update-text" class="materialize-textarea"></textarea>
                                <label for="update-text">Content</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s4">
                                <input id="update-date" type="text" class="datepicker">
                                <label for="update-date">Date</label>
                            </div>
                            <div class="file-field input-field col s8">
                                <div class="btn">
                                    <i class="material-icons">attach_file</i>
                                    <input id="update-files" type="file" multiple>
                                </div>
                                <div class="file-path-wrapper">
                                    <input class="file-path validate" type="text" placeholder="Attach files here">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col s12"><span>Please do not attach files which have previously been uploaded with the same name.</span></div>
                        </div>
                        <div class="row">
                            <div class="col s12">
                                <span class="alert hide"></span>
                            </div>
                        </div>`;
                            $("#adminmodal .modal-content").append(form);
                            $("#admin-submit").removeClass("disabled");
                            $("#admin-close").removeClass("disabled");
                        }).catch(function () {
                            M.toast({ html: 'An error has occurred. Please refresh the page.' })
                        });
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