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
                $.cookie("userId", userName, { expires: 30, path: '/'});
                $.cookie("password", pwd, { expires: 30, path: '/'});
                $.removeCookie('isTemp');
            } else {
                $.removeCookie("userId");
                $.removeCookie("password");
                $.removeCookie('isTemp');
            }
            $("#userName2").val(userName);
            $("#pwd2").val(pwd);
            blahgua_rest.loginUser(userName, pwd, HandleUserLoginOK, HandleUserLoginFail);
        };

        var HandleCreateUserFail = function(json) {
            switch (theErr.status) {
                case 202:
                    // this is not an error, just malformed JSON
                    HandleUserLoginOK();
                    break;
                default:
                    alert("User account creation failed.");
            }
        };



        var HandleUserLoginOK = function(json) {
            IsUserLoggedIn = true;
            blahgua_rest.GetProfileSchema(function(theSchema) {
                ProfileSchema = theSchema.fieldNameToSpecMap;
            }) ;
            var userName = $("#userName2").val();
            var pwd = $("#pwd2").val();
            if ($('#rememberme2').is(':checked')) {
                $.cookie("userId", userName, { expires: 30, path: '/'});
                $.cookie("password", pwd, { expires: 30, path: '/'});
                $.removeCookie('isTemp');
            } else {
                $.removeCookie("userId");
                $.removeCookie("password");
                $.removeCookie('isTemp');
            }
            blahgua_rest.getUserInfo(RefreshPageForNewUser);
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
        }

        var RecoverPassword = function() {
            alert("Not Implemented!");
        }

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
                if ($(this).hasClass) {
                    var thisSet = this.attributes["data-toggle-set"].value;
                    var thisVal = this.attributes["data-toggle-value"].value;
                    var selector = ".toggle-content[data-toggle-value=" + thisVal + "]";
                    $(".toggle-content").hide();
                    $(".toggle-btn").removeClass("toggle-active");
                    $(this).addClass("toggle-active");

                    $(selector).show();
                }
            })

            $(".toggle-btn.toggle-active").click(); // init

            $("#CancelNewUser").click(CancelSignIn);
            $("#CancelSignIn").click(CancelSignIn);
            $("#CancelForgot").click(CancelSignIn);
            $("#NewUserBtn").click(CreateNewUser);
            $("#SignInBtn").click(SignInExistingUser);
            $("#RecoverPasswordBtn").click(RecoverPassword);
        }

        return {

            RefreshSignupContent: RefreshSignupContent
        }
    }
);