

define('badges',
    ["ExportFunctions"],
    function (exports) {
    var spinner = null;
    var spinner_options = {
        lines: 9, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };
    var ba_email_address = null;
    var ba_verification_code = null;

    var ba_submit1 = function () {
        ba_start_spinner();
        var ev = $("input[name=e]").val();
        var tkv = document.getElementById('ba_tk').value;
        var endpoint = document.getElementById('ba_end').value;
        var query = '?tk='+tkv+'&e='+ev;
        ba_rest('POST', endpoint + '/badges/credentials'+query, null, ba_okf, ba_errf);
    }

    var ba_submit2 = function () {
        ba_start_spinner();
        var code = ba_verification_code;
        var tkv = document.getElementById('ba_tk').value;
        var endpoint = document.getElementById('ba_end').value;
        var query = '?tk='+tkv+'&c='+ba_verification_code;
        ba_rest('POST', endpoint + '/badges/verify'+query, null, ba_okf, ba_errf);
    }

    var ba_submit3 = function () {
        ba_start_spinner();
        var e = document.getElementById('ba_e').value;
        var d = document.getElementById('ba_d').value;
        var endpoint = document.getElementById('ba_end').value;
        var query = '?e='+e+"&d="+d;
        ba_rest('POST', endpoint + '/badges/support'+query, null, ba_okf, ba_errf);
    }

    var ba_cancel_submit = function (code) {
        if (ba_dialog_closed) {
            ba_dialog_closed(code);
        } else {
            $("#badgedialog").empty();
            throw "missing ba_dialog_closed";
        }
    };

    var ba_okf = function (result, a, b) {
        ba_stop_spinner();
        $("#badgedialog").html(result);
    };

    var ba_errf = function (a, b, c) {
        ba_stop_spinner();
        alert('ERROR! STATUS='+a.status+' ('+a.statusText+'): '+a.responseText);
    };

    var ba_start_spinner = function () {
        var el = document.getElementById('ba_form');
        if (el) {
            if (spinner == null) {
                spinner =  new Spinner(spinner_options).spin(el);
            } else {
                spinner.spin(el)
            }
        }
    };

    var ba_stop_spinner = function () {
        if (spinner) {
            spinner.stop();
        }
    };


    var ba_rest = function (method, path, entity, okFunction, errorFunction) {
        $.ajax({
            type : method,
            url : path,
            crossDomain: true,
            contentType : "text/plain",
            success : okFunction,
            error : errorFunction
        });
    };

    var dialog_html = function() {
        var newHTML = "";
        newHTML += "<form style='margin: 2em' id='ba_form' action='http://www.badge-authority.net/v1/badges/credentials' method='post'>";
        newHTML += "<p>To see if you qualify for a badge, please enter your email address below. Don't worry if your domain is not yet supported: You can enter a request to add it in the next page.</p>";
        newHTML += "<p>If your email address <i>does</i> qualify, you will be emailed a code to enter in the following page.</p>";
        newHTML += "<p></p>";
        newHTML += "<div style='margin-top:1em'>Email Address: ";
        newHTML += "<input id='ba_e' type='text' size='30'/>";
        newHTML += "<p style='margin:1em 2em'>";
        newHTML += "<b>Privacy Statement:</b> Only badges (not your email address) will be sent to blahgua.</p>";
        newHTML += "<div style='margin-top: 1em'>";
        newHTML += "<input type='hidden' id='ba_end' name='end' value='http://www.badge-authority.net/v1'/>";
        newHTML += "<input type='hidden' id='ba_tk' name='tk' value='blahgua.comt1UmDzCJeudWBUipW-yia4BVfmc'/>";
        newHTML += "<input type='button' id='ba_submitbtn' value='Submit'/>";
        newHTML += "<input type='button' id='ba_cancelbtn' value='Cancel'/>";
        newHTML += "</div>";
        newHTML += "</div>";
        newHTML += "</form>";

        return newHTML;
    };

    return {
        ba_okf: ba_okf,
        ba_errf: ba_errf,
        ba_cancel_submit: ba_cancel_submit,
        ba_submit1: ba_submit1,
        ba_submit2: ba_submit2,
        ba_submit3: ba_submit3,
        dialog_html: dialog_html,
        ba_stop_spinner: ba_stop_spinner,
        ba_start_spinner: ba_start_spinner,
        ba_rest: ba_rest


    }
});
