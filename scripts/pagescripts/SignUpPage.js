/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:51 AM
 * To change this template use File | Settings | File Templates.
 */

define('SignUpPage',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

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
                    alert("sorry, that username already exists.");
                default:
                    exports.OnFailure(theErr);
            }
        };



        var HandleUserLoginOK = function(json, successOk, status) {
            IsUserLoggedIn = true;
            blahgua_rest.GetProfileSchema(function(theSchema) {
                ProfileSchema = theSchema.fieldNameToSpecMap;
            }, function(theErr){
                exports.OnFailure(theErr);
            }) ;
            var userName = $("#userName2").val();
            var pwd = $("#pwd2").val();
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
                case 401:
                    // incorrect password
                default:
                    alert("Login Failed. Check username and password.");
            }

        };


        var RefreshPageForNewUser = function(json) {
            exports.RefreshPageForNewUser(json);
        };

        var CancelSignIn = function() {
            exports.ClosePage();
        };

        var RecoverPassword = function() {
            var userName = $("#uname2").val();
            var email = $("#email").val();
            blahgua_rest.recoverUser(userName, email, function(theResult) {
                alert("reset instructions will be sent to the email account on file.");
            }, function (theErr) {
                alert("reset instructions will be sent to the email account on file. ");
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
                var thisSet = this.attributes["data-toggle-set"].value;
                var thisVal = this.attributes["data-toggle-value"].value;
                var selector = ".toggle-content[data-toggle-value=" + thisVal + "]";
                $(".toggle-content").hide();
                $(".toggle-btn").removeClass("toggle-active");
                $(this).addClass("toggle-active");
                $(selector).show();
                $(selector).find("input:first").focus();
            })

            $(".content_frame").keydown(function(theEvent) {
                if (theEvent.which == 13) {
                    var thisVal = $(".toggle-active").attr("data-toggle-value");
                    var selector = ".toggle-content[data-toggle-value=" + thisVal + "]";
                    $(selector).find(".action-default").click();
                }
            });

            $(".toggle-btn.toggle-active").click(); // init

            $("#CancelNewUser").click(CancelSignIn);
            $("#CancelSignIn").click(CancelSignIn);
            $("#CancelForgot").click(CancelSignIn);
            $("#NewUserBtn").click(CreateNewUser);
            $("#SignInBtn").click(SignInExistingUser);
            $("#ShowAccountRecoveryBtn").click(ShowRecoveryInfo)
            $("#RecoverPasswordBtn").click(RecoverPassword);
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