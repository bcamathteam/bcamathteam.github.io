var list_of_files = [];

/*
Find: \\textbf\{([^}]*)\}
Replace: \\textbf{$1}
*/

function waitForElementToDisplay(selector, time) {
    if (document.querySelector(selector) != null) {
        $(selector).modal();
        return;
    }
    else {
        setTimeout(function () {
            waitForElementToDisplay(selector, time);
        }, time);
    }
}

(function ($) {
    $(function () {

        fetch('assets/list_of_blogs.txt').then(response => response.text()).then(function (text) {
            var lines = text.split('\n');
            for (var j = 0; j < lines.length; j++) {
                list_of_files.push(lines[j]);
            }
        }).then(function () {
            list_of_files.forEach(function (listItem, i) {
                var current_id = i;
                var title, author, date, preview, content = "";
                fetch('blogs/' + list_of_files[i] + '.txt').then(response => response.text()).then(function (text) {
                    var lines = text.split('\n');
                    for (var j = 0; j < lines.length; j++) {
                        var line = lines[j];
                        if (line === "Title") {
                            title = lines[j + 1];
                        } else if (line === "Date") {
                            date = lines[j + 1];
                        } else if (line === "Author") {
                            author = lines[j + 1];
                        } else if (line === "Preview") {
                            preview = lines[j + 1];
                        } else if (line === "Content") {
                            for (var k = j + 1; k < lines.length; k++) {
                                if (lines[k] === "") {
                                    content += "<br><br>";
                                } else {
                                    content += lines[k];
                                }
                            }
                            break;
                        }
                    }
                }).then(function () {
                    $("#blog_posts").append(`<div id="modal` + current_id + `" class="modal full"><div class="modal-content"><div class="container"><h4>` + title + `</h4><h6>By ` + author + `</h6> <i class="material-icons">access_time</i> Updated ` + date + `<br><br>` + content + `</div></div><div class="modal-footer"><div class="container"><a href="#!" class="modal-close waves-effect waves-green btn orange lighten-3 black-text">Close</a></div></div></div>`);
                    $("#blog_posts").append(`<div class="col s12"><div class="card orange lighten-3 z-depth-2 hoverable"><div class="card-content black-text"><span class="card-title">` + title + `</span><h6>By ` + author + `</h6><p><i class="material-icons">access_time</i> Updated ` + date + `</p><br><p>` + preview + `</p></div><div class="card-action"><a class="black-text modal-trigger" href="#modal` + current_id + `">Read more</a></div></div></div>`)
                });
            });
            for (var m = 0; m < list_of_files.length; m++) {
                console.log('#modal' + m);
                waitForElementToDisplay('#modal' + m, 100);
            }
            $('body').append(`<script src="/js/blog_modal.js"></script>`);
        });
    }); // end of document ready
})(jQuery); // end of jQuery name space



