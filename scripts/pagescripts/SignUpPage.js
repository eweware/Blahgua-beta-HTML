/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:51 AM
 * To change this template use File | Settings | File Templates.
 */

define('SignUpPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var CreateNewUser = function() {
            var userName = $("#userName").val();
            var pwd = $("#pwd").val();
            blahgua_rest.CreateUser(userName, pwd, HandleCreateUserOK, HandleCreateUserFail);
        };

        var SignInExistingUser = function() {
            var userName = $("#userName2").val();
            var pwd = $("#pwd2").val();
            blahgua_rest.loginUser(userName, pwd, HandleUserLoginOK, HandleUserLoginFail);
        };

        var HandleCreateUserOK = function(json) {
            var userName = $("#userName").val();
            var pwd = $("#pwd").val();
            if ($('#rememberme2').is(':checked')) {
                var userObject = {};
                userObject['userId'] = userName;
                userObject['pwd'] = pwd;

                $.cookie("loginkey",  cryptify("Sheep", JSON.stringify(userObject)), { expires: 30, path: '/'});
                $.removeCookie('isTemp');
            } else {
                $.removeCookie("loginkey");
                $.removeCookie('isTemp');
            }
            $("#userName2").val(userName);
            $("#pwd2").val(pwd);
            blahgua_rest.loginUser(userName, pwd, HandleUserLoginOK, HandleUserLoginFail);
        };

        var HandleCreateUserFail = function(theErr) {
            switch (theErr.status) {
                case 202:
                    // this is not an error, just malformed JSON
                    HandleUserLoginOK();
                    break;
                case 409:
                    ShowErrorMessage("Username already exists");
                    break;
                default:
                    exports.OnFailure(theErr);
            }
        };

        var ClearErrorMessage = function(){
            $(".error-msg-div").css({"opacity":"0"});
        };

        var ShowErrorMessage = function(theText) {
            $(".error-msg-span").text(theText);
            $(".error-msg-div").css({"opacity":"1"});
        };


        var HandleUserLoginOK = function(json, successOk, status) {
            G.IsUserLoggedIn = true;
            blahgua_rest.GetProfileSchema(function(theSchema) {
                G.ProfileSchema = theSchema.fieldNameToSpecMap;
            }, function(theErr){
                exports.OnFailure(theErr);
            }) ;
            var userName = $("#userName2").val();
            var pwd = $("#pwd2").val();
            if ($('#rememberme2').is(':checked')) {
                var userObject = {};
                userObject['userId'] = userName;
                userObject['pwd'] = pwd;

                $.cookie("loginkey",  G.Cryptify("Sheep", JSON.stringify(userObject)), { expires: 30, path: '/'});
                $.removeCookie('isTemp');
            } else {
                $.removeCookie("loginkey");
                $.removeCookie('isTemp');
            }
            blahgua_rest.getUserInfo(RefreshPageForNewUser, function(theErr) {
                exports.OnFailure(theErr);
            });
        };

        var HandleUserLoginFail = function (theErr) {
            switch (theErr.status) {
                case 202:
                    // this is not an error, just malformed JSON
                    HandleUserLoginOK();
                    break;
                case 404:
                    // username not found
                    ShowErrorMessage("No user of that name");
                    break;
                case 401:
                    // incorrect password
                    ShowErrorMessage("Cannot login. Check password.");
                    break;
                default:
                    ShowErrorMessage("Login Failed. Check username and password.");
            }

        };


        var RefreshPageForNewUser = function(json) {
            exports.RefreshPageForNewUser(json);
        };

        var CancelSignIn = function() {
            exports.ClosePage();
        };

        var RecoverPassword = function() {
            $(this).attr("disabled", true);
            var userName = $("#uname2").val();
            var email = $("#email").val();
            blahgua_rest.recoverUser(userName, email, function(theResult) {
                ShowErrorMessage("reset instructions will be sent to the email account on file.");
            }, function (theErr) {
                ShowErrorMessage("reset instructions will be sent to the email account on file. ");
            })
        };

        var RefreshSignupContent = function(message) {
            $("#BlahFullItem").show();
            if ((message != null) && (message != "")) {
                $("#SignInMessageDiv").text(message);
                $("#SignInMessageDiv").fadeIn();
            } else {
                $("#SignInMessageDiv").hide();
            }
            $(".toggle-content").hide();

            $(".toggle-btn").click(function() {
                ClearErrorMessage();
                var thisSet = this.attributes["data-toggle-set"].value;
                var thisVal = this.attributes["data-toggle-value"].value;
                var selector = ".toggle-content[data-toggle-value=" + thisVal + "]";
                $(".toggle-content").hide();
                $(".toggle-btn").removeClass("toggle-active");
                $(this).addClass("toggle-active");
                $(selector).show();
               // $(selector).find("input:first").focus();
            })

            $(".content_frame").keydown(function(theEvent) {
                if (theEvent.which == 13) {
                    var thisVal = $(".toggle-active").attr("data-toggle-value");
                    var selector = ".toggle-content[data-toggle-value=" + thisVal + "]";
                    $(selector).find(".action-default").click();
                }
            });
            $(".content_frame").keyup(function(theEvent) {
                MaybeEnableButton();
            });

            $(".toggle-btn.toggle-active").click(); // init

            $("#CancelNewUser").click(CancelSignIn);
            $("#CancelSignIn").click(CancelSignIn);
            $("#CancelForgot").click(CancelSignIn);
            $("#NewUserBtn").click(CreateNewUser);
            $("#SignInBtn").click(SignInExistingUser);
            $("#ShowAccountRecoveryBtn").click(ShowRecoveryInfo)
            $("#RecoverPasswordBtn").click(RecoverPassword);
            MaybeEnableButton();
        };

        var isValidEmailAddress = function(emailAddress) {
            var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
            return pattern.test(emailAddress);
        };

        var MaybeEnableButton = function() {
            // signin
            if (($("#userName2").val() == "")  ||
                ($("#pwd2").val() == ""))
                $("#SignInBtn").attr("disabled", true);
            else
                $("#SignInBtn").removeAttr("disabled");

            // new user
            if ($("#pwd").val() != $("#pwd3").val()) {
                // passwords do not match
                $("#SignInBtn").attr("disabled", true);
                ShowErrorMessage("Passwords must match");
            } else {
                ClearErrorMessage();
                if (($("#userName").val() == "")  ||
                    ($("#pwd").val() == "") ||
                    ($("#pwd3").val() == ""))
                    $("#NewUserBtn").attr("disabled", true);
                else
                    $("#NewUserBtn").removeAttr("disabled");
            }

            // recover
            if (($("#uname2").val() == "")  ||
                !isValidEmailAddress($("#email").val()))
                $("#RecoverPasswordBtn").attr("disabled", true);
            else
                $("#RecoverPasswordBtn").removeAttr("disabled");
        };

        var ShowRecoveryInfo = function(theEvent) {
            var table =  $(theEvent.target).closest("table");
            table.find("tr").hide();
            table.find("tr.recover-password").show();
        };

        return {

            RefreshSignupContent: RefreshSignupContent
        }
    }
);