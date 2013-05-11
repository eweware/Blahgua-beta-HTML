/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:51 AM
 * To change this template use File | Settings | File Templates.
 */

define('SignUpPage',
    ["blahgua_restapi","blahgua"],
    function (blahgua_rest, blahgua) {

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
        alert("User creation failed!");
    };



    var HandleUserLoginOK = function(json) {
        IsUserLoggedIn = true;
        Blahgua.GetProfileSchema(function(theSchema) {
            ProfileSchema = theSchema.fieldNameToSpecMap;
        }, OnFailure) ;
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

    var HandleUserLoginFail = function (json) {
        alert("Login Failed. Check username and password.");
    };


    var RefreshPageForNewUser = function(json) {
        // get the new channel list
        $("#BlahFullItem").hide();
        CurrentUser = json;
        refreshSignInBtn();
        GetUserChannels();
    };

    var RefreshSignupContent = function(message) {
        $("#BlahFullItem").show();
        if ((message != null) && (message != "")) {
            $("#SignInMessageDiv").text(message);
            $("#SignInMessageDiv").fadeIn();
        } else {
            $("#SignInMessageDiv").hide();
        }
    }


        return {
        CreateNewUser: CreateNewUser,
        SignInExistingUser: SignInExistingUser,
        RefreshSignupContent: RefreshSignupContent
    }
});