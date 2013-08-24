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
            var theErr = G.ValidateForm($("#NewUserForm"));
            if (theErr == "") {
                ClearErrorMessage();
                var userName = $("#userName").val();
                var pwd = $("#pwd").val();
                blahgua_rest.CreateUser(userName, pwd, HandleCreateUserOK, HandleCreateUserFail);
            } else {
                ShowErrorMessage(theErr);
            }

        };

        var SignInExistingUser = function(theEvent) {
            theEvent.stopImmediatePropagation();
            var theErr = G.ValidateForm($("#ExistingUserForm"));
            if (theErr == "") {
                ClearErrorMessage();
                var userName = $("#userName2").val();
                var pwd = $("#pwd2").val();
                blahgua_rest.loginUser(userName, pwd, HandleUserLoginOK, HandleUserLoginFail);
            } else {
                ShowErrorMessage(theErr);
            }
        };

        var HandleCreateUserOK = function(json) {
            var userName = $("#userName").val();
            var pwd = $("#pwd").val();
            if ($('#rememberme2').is(':checked')) {
                var userObject = {};
                userObject['userId'] = userName;
                userObject['pwd'] = pwd;

                $.cookie("loginkey",  G.Cryptify("Sheep", JSON.stringify(userObject)), { expires: 3600*24*30, path: '/'});
                $.removeCookie('isTemp');
            } else {
                $.removeCookie("loginkey");
                $.removeCookie('isTemp');
            }
            $("#userName2").val(userName);
            $("#pwd2").val(pwd);
            blahgua_rest.loginUser(userName, pwd, HandleCreatedUserLoginOK, HandleCreatedUserLoginFail);
        };

        var HandleCreatedUserLoginOK = function() {
            var email = $("#recoveryemail").val();
            if (email != "") {
                // set recovery email
                blahgua_rest.setRecoveryInfo(email, FinalizeLogin, function(theErr) {
                    alert("Unable to set recovery info.  Logging in anyway.");
                    FinalizeLogin();
                });
            } else {
                FinalizeLogin();
            }
        };

        var HandleCreateUserFail = function(theErr) {
            switch (theErr.status) {
                case 202:
                    // this is not an error, just malformed JSON
                    HandleCreateUserOK();
                    break;
                case 409:
                    ShowErrorMessage("Username already exists");
                    break;
                default:
                    exports.OnFailure(theErr);
            }
        };

        var HandleCreatedUserLoginFail = function(theErr) {
            //TODO: any of these error messages would be bizarre to the user...
            switch (theErr.status) {
                case 202:
                    // this is not an error, just malformed JSON
                    HandleCreatedUserLoginOK();
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

        var ClearErrorMessage = function(){
            $(".error-msg-div").css({"opacity":"0"});
            $(".error-msg-span").empty();
        };

        var ShowErrorMessage = function(theText) {
            $(".error-msg-span").empty().text(theText);
            $(".error-msg-div").css({"opacity":"1"});
        };

        var FinalizeLogin = function() {
            G.IsUserLoggedIn = true;
            blahgua_rest.GetProfileSchema(function(theSchema) {
                G.ProfileSchema = theSchema.fieldNameToSpecMap;
                blahgua_rest.getUserInfo(RefreshPageForNewUser, exports.OnFailure);
            }, exports.OnFailure);

        };


        var HandleUserLoginOK = function(json, successOk, status) {

            var userName = $("#userName2").val();
            var pwd = $("#pwd2").val();
            if ($('#rememberme2').is(':checked')) {
                var userObject = {};
                userObject['userId'] = userName;
                userObject['pwd'] = pwd;

                $.cookie("loginkey",  G.Cryptify("Sheep", JSON.stringify(userObject)), { expires: 3600*4*30, path: '/'});
                $.removeCookie('isTemp');
            } else {
                $.removeCookie("loginkey");
                $.removeCookie('isTemp');
            }
            FinalizeLogin();
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
            var theErr = G.ValidateForm($("#RecoverPasswordForm"));
            if (theErr == "") {
                $(this).attr("disabled", true);
                var userName = $("#uname2").val();
                var email = $("#email").val();
                blahgua_rest.recoverUser(userName, email, function(theResult) {
                    ShowErrorMessage("Reset instructions will be sent to the email account on file.");
                }, function (theErr) {
                    if (theErr.status == 409) {
                        ShowErrorMessage("Account has no email address on file.")
                    } else
                        ShowErrorMessage("Reset instructions will be sent to the email account on file. ");
                })
            } else {
                ShowErrorMessage(theErr);
            }
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
                if (!G.IsMobile)
                    $(selector).find("input:visible:first").focus();
                MaybeEnableButton();
            });

            if (G.IsMobile) {
                // todo:  iPhone & iPad specific validation
                $("#BlahFullItem").css({"overflow-y":"auto"});
                MaybeEnableButton();
            } else {
                $(".content_frame").keydown(function(theEvent) {
                    if (theEvent.which == 13) {
                        var thisVal = $(".toggle-active").attr("data-toggle-value");
                        var selector = ".toggle-content[data-toggle-value=" + thisVal + "]";
                        $(selector).find(".action-default:visible").click();
                    } else {
                        MaybeEnableButton();
                    }
                });
            }



            $(".toggle-btn.toggle-active").click(); // init

            $("#CancelNewUser").click(CancelSignIn);
            $("#CancelSignIn").click(CancelSignIn);
            $("#CancelForgot").click(CancelSignIn);
            $("#NewUserBtn").click(CreateNewUser);
            $("#SignInBtn").click(SignInExistingUser);
            $("#CancelRecoverBtn").click(HideRecoveryInfo);
            $("#ShowAccountRecoveryBtn").click(ShowRecoveryInfo);
            $("#RecoverPasswordBtn").click(RecoverPassword);
            $("#RecoveryInfo").click(function(theEvent) {
                G.PromptUser("blahgua does not require an email address to fully use the system.  However, if you forget your password, it will not be recoverable if we do not have an email address on file.<br/><br/>" +
                    "Your recovery email can be different than the email you use to obtain badges, and can be changed or removed at any time.",
                    "Got it");
            });
            $("[data-validate]").blur(function(theEvent) {
                G.ValidateField($(this));
            });

            MaybeEnableButton();

        };

        var isValidEmailAddress = function(emailAddress) {
            var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
            return pattern.test(emailAddress);
        };

        var MaybeEnableButton = function() {
            var $form;
            if ($(".toggle-btn[data-toggle-value=existing]").hasClass("toggle-active")) {
                // check recovery
                if ($("#RecoverPasswordForm").is(":visible"))
                    // recover
                    $form = $("#RecoverPasswordForm");
                else
                    $form = $("#ExistingUserForm");
            }
            else
                $form = $("#NewUserForm");

            var $btn = $form.find(".action-default");
            var errMsg = G.ValidateForm($form);
            if (errMsg == "")
            {
                $btn.removeAttr("disabled");
                ClearErrorMessage();
            }
            else
            {
                $btn.attr("disabled", true);

            }

            // button on phone is always enabled
            if (G.IsMobile)
                $btn.removeAttr("disabled");

        };

        var ShowRecoveryInfo = function(theEvent) {
            if (G.IsMobile)
                $("#RecoverPasswordForm").show();
            else
                $("#RecoverPasswordForm").show().find("input:visible:first").focus();
            $("#ExistingUserForm").hide();
            MaybeEnableButton();
        };

        var HideRecoveryInfo = function(theEvent) {
            $("#RecoverPasswordForm").hide();
            if (G.IsMobile)
                $("#ExistingUserForm").show();
            else
                $("#ExistingUserForm").show().find("input:visible:first").focus();
            MaybeEnableButton();
        };

        return {

            RefreshSignupContent: RefreshSignupContent
        }
    }
);