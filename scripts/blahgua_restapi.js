﻿// rest call wrappers for blahgua

define('blahgua_restapi', [], function () {
    // properties
    var baseURL = "http://beta.blahgua.com/v2/";
    var currentChannel = "";
    //this.baseURL = "../v2/";

    // methods
    var CallPostMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "POST",
            url: baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",

            success: function (theObj, didIt, status) {
                if (OnSuccess != null) {
                    OnSuccess(theObj, didIt, status);
                }
            },
            error: function (theErr) {
                if (OnFailure != null) {
                    OnFailure(theErr);
                }
            }
        });
    };

    var CallGetMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "GET",
            url: baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (OnSuccess != null) {
                    OnSuccess(result);
                }
            },
            error: function (theErr) {
                if (OnFailure != null) {
                    OnFailure(theErr);
    }
}
        });
    };

    var CallPutMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "PUT",
            url: baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (OnSuccess != null) {
                    OnSuccess(result);
                }
            },
            error: function (theErr) {
                if (OnFailure != null) {
                    OnFailure(theErr);
                }
            }
        });
    };

    var CallDeleteMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "DELETE",
            url: baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (OnSuccess != null) {
                    OnSuccess(result);
                }
            },
            error: function (theErr) {
                if (OnFailure != null) {
                    OnFailure(theErr);
                }
            }
        });
    };






    //  ACTUAL WORKING FUNCTIONS
    var GetUserStats = function (start, end, OnSuccess, OnFailure) {
        /// <summary>Returns the stats of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user stats object</returns>
        var paramStr = '?stats=true&s=' + start + '&e=' + end;
        var method = "users/info" + paramStr;
        CallGetMethod(method, "{}", OnSuccess, OnFailure);
    };

    var GetChannelTypes = function (OnSuccess, OnFailure) {
        /// <summary>Returns the types of groups available</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the group types</returns>
        var paramStr = '{}';
        CallGetMethod("groupTypes", paramStr, OnSuccess, OnFailure);
    };

    var GetChannelsForType = function (ChannelType, OnSuccess, OnFailure) {
        /// <summary>Returns the types of groups available</summary>
        /// <param name="GroupType">The ID of the group type</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the group types</returns>
        var paramStr = '{}';
        var methodName = "groups?type=" + ChannelType;
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };


    var getAuthorities = function (OnSuccess, OnFailure) {
        var paramStr =  "{}";
        CallGetMethod("badges/authorities", paramStr, OnSuccess, OnFailure);

    };

    var createBadgeForUser = function (authId, badgeId, OnSuccess, OnFailure) {
        var param = new Object();
        param["I"] = authId;
        if (badgeId != null)
            param["T"] = badgeId;
        var paramStr = JSON.stringify(param);

        $.ajax({
            type: "POST",
            url: baseURL + "badges",
            data: paramStr,
            contentType: "application/json; charset=utf-8",
            success: function (theObj) {
                if (OnSuccess != null) {
                    OnSuccess(theObj);
                }
            },
            error: function (theErr) {
                if (theErr.status >= 500) {
                    GlobalReset();
                } else {
                    if (OnFailure != null) {
                        OnFailure(theErr);
                    }
                }
            }
        });
    };

    var getBadgeById = function (badgeId, OnSuccess, OnFailure) {
        var paramStr =  "{}";
        CallGetMethod("badges/" + badgeId, paramStr, OnSuccess, OnFailure);

    };


    var CreateUserProfile = function (profileObj, OnSuccess, OnFailure) {
        /// <summary>Returns the profile for the session user</summary>
        /// <param name="userID">The id of the user, or "" for the session user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user's profile object</returns>
        var paramStr =  JSON.stringify(profileObj);
        CallPostMethod("users/profile/info", paramStr, OnSuccess, OnFailure);
    };

    var UpdateUserProfile = function (profileObj, OnSuccess, OnFailure) {
        /// <summary>Returns the profile for the session user</summary>
        /// <param name="userID">The id of the user, or "" for the session user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user's profile object</returns>
        var paramStr =  JSON.stringify(profileObj);
        CallPutMethod("users/profile/info", paramStr, OnSuccess, OnFailure);
    };

    var GetUserProfile = function (userID, OnSuccess, OnFailure) {
        /// <summary>Returns the profile for the session user</summary>
        /// <param name="userID">The id of the user, or "" for the session user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user's profile object</returns>
        var paramStr = '{}';
        CallGetMethod("users/profile/info", paramStr, OnSuccess, OnFailure);
    };

    var GetProfileSchema = function (OnSuccess, OnFailure) {
        /// <summary>Returns the profile schema object</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the profile schema object</returns>
        var paramStr = null;
        CallGetMethod("users/profile/schema", paramStr, OnSuccess, OnFailure);
    };

    var AddBlahComment = function (commentText, blahId, OnSuccess, OnFailure) {
        /// <summary>Adds the specified comment to the current session blah</summary>
        /// <param name="commentText">the text to add</param>
        /// <param name="commentVote">The comment vote (should be 0)</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"T":"' + commentText + '", "B":"' + blahId + '"}';
        CallPostMethod("comments", paramStr, OnSuccess, OnFailure);
    };


    var SetUserPredictionVote = function (blahID, theVote, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="userID">the ID of the user</param>
        /// <param name="optionIndex">the zero-based index of the option the user is voting on</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>nothing</returns>
        var paramObj = new Object();
        paramObj["t"] = "pre";
        paramObj["v"] = theVote;
        var method = "blahs/" + blahID + "/predicts";
        CallPutMethod(method, JSON.stringify(paramObj), OnSuccess, OnFailure);
    };

    var SetUserExpiredPredictionVote = function (blahID, theVote, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="userID">the ID of the user</param>
        /// <param name="optionIndex">the zero-based index of the option the user is voting on</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>nothing</returns>
        var paramObj = new Object();
        paramObj["t"] = "post";
        paramObj["v"] = theVote;
        var method = "blahs/" + blahID + "/predicts";
        CallPutMethod(method, JSON.stringify(paramObj), OnSuccess, OnFailure);
    };

    var GetUserPredictionVote = function (blahID, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="userID">the ID of the user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>{"p": poll-option-index, "t": datetime-when-voted}</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/predicts";
        CallGetMethod(method, paramStr, OnSuccess, OnFailure);
    };

    var getUserDescriptorString = function (userId, OnSuccess, OnFailure) {
        /// <summary>Returns info about the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{"I":"' + userId + '"}';
        var methodName = "users/descriptor";
        CallPostMethod(methodName, paramStr, OnSuccess, OnFailure);
    };



    var AddBlahViewsOpens = function (blahID, numViews, numOpens, OnSuccess, OnFailure) {
        /// <summary>Adds the specified number of views and opens to the blah's stats</summary>
        /// <param name="blahID">The ID of the blah to modify</param>
        /// <param name="numViews">The number of views to add</param>
        /// <param name="numOpens">The number of opens to add</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"V":' + numViews + ', "O":' + numOpens + '}';
        var methodname = "blahs/" + blahID;
        CallPutMethod(methodname, paramStr, OnSuccess, OnFailure);
    };


    var GetChannelInfo = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Returns info about the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{}';
        var methodName = "groups/" + ChannelID;
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    var GetUserChannelInfo = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Returns info about the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{}';
        var methodName = "userGroups/" + ChannelID;
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };


    var SetBlahVote = function (blahId, newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="blahId">the id of the blah</param>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"uv":' + newVote + '}';

        var methodName = "blahs/" + blahId;
        CallPutMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    var SetCommentVote = function (commentID, newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var param = new Object();
        /*
        if (newVote == 1)
            param["U"] =1;
        else if (newVote == -1)
            param["D"] = 1;
            */
        param["C"] = newVote;

        var methodName = "comments/" + commentID;
        CallPutMethod(methodName, JSON.stringify(param), OnSuccess, OnFailure);
    };



    var RemoveUserFromChannel = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Leaves the specified group</summary>
        /// <param name="GroupID">the id of the group to leave</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = "{'g':'" + ChannelID + "'}";
        var methodName = "userGroups";
        CallDeleteMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    var JoinUserToChannel = function (channelId, OnSuccess, OnFailure) {
        /// <summary>Joins the session user to the group</summary>
        /// <param name="userId">The ID of the user</param>
        /// <param name="channelId">The ID of the group to join</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{"G": "' + channelId + '"}';
        CallPostMethod("userGroups", paramStr, OnSuccess, OnFailure);
    };

    var GetAllChannels = function (OnSuccess, OnFailure) {
        /// <summary>Returns all groups in the system</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>List of all of the groups</returns>
        var paramStr = '{}';
        CallGetMethod("groups", paramStr, OnSuccess, OnFailure);
    };

    var getUserInfo = function (OnSuccess, OnFailure) {
        /// <summary>returns a user record on the logged in user</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>user object</returns>
        var paramStr = '{}';
        var method = "users/info";
        CallGetMethod(method, paramStr, OnSuccess, OnFailure);
    };


    var loginUser = function (userName, password, OnSuccess, OnFailure) {
        /// <summary>Creates a new user</summary>
        /// <param name="userName">The internal name of the new user</param>
        /// <param name="password">password of the user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the user</returns>
        var paramStr = '{"N":"' + userName + '", "pwd":"' + password + '"}';
        CallPostMethod("users/login", paramStr, OnSuccess, OnFailure);
    };

    var isUserLoggedIn = function (OnSuccess, OnFailure) {
        /// <summary>Creates a new user</summary>
        /// <param name="userName">The internal name of the new user</param>
        /// <param name="password">password of the user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the user</returns>

        CallGetMethod("users/login/check", "{}", OnSuccess, OnFailure);
    };

    var logoutUser = function (OnSuccess, OnFailure) {
        /// <summary>Logs out the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the user</returns>
        var paramStr = '{}';
        CallPostMethod("users/logout", paramStr, OnSuccess, OnFailure);
    };

    var CheckUsernameExists = function(theName, OnSuccess, OnFailure) {
        var paramStr = '{"U":"' + theName + '"}';
        CallPostMethod("users/check/username", paramStr, OnSuccess, OnFailure);

    };


    var CreateUser = function (userName, password, OnSuccess, OnFailure) {
        /// <summary>Creates a new user</summary>
        /// <param name="userName">The  name of the new user</param>
        /// <param name="password">The user's password</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the new user</returns>
        var paramStr = '{"N":"' + userName + '", "pwd":"' + password + '"}';
        CallPostMethod("users", paramStr, OnSuccess, OnFailure);
    };


    var SetUserPollVote = function (blahID, optionIndex, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="optionIndex">the zero-based index of the option the user is voting on</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>nothing</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/pollVote/" + optionIndex;
        CallPutMethod(method, paramStr, OnSuccess, OnFailure);
    };

    var GetUserPollVote = function (blahID, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>{"p": poll-option-index, "t": datetime-when-voted}</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/pollVote";
        CallGetMethod(method, paramStr, OnSuccess, OnFailure);
    };

    var GetBlahTypes = function (OnSuccess, OnFailure) {
        /// <summary>Returns the currently available blah types</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>an array of blah types</returns>
        var paramStr = '{}';
        CallGetMethod("blahs/types", paramStr, OnSuccess, OnFailure);
    };


    var CreateUserBlah = function (blahText, blahType, blahGroup, bodyText, infoObj, OnSuccess, OnFailure) {
        /// <summary>Joins the session user to the group</summary>
        /// <param name="blahText">The text of the new blah</param>
        /// <param name="blahType">The ID of the type of the new blah</param>
        /// <param name="blahGroup">The ID of the group for the new blah</param>
        /// <param name="bodyText">The text of the blah body</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A new blah object</returns>
        var param = new Object();
        param["G"] = blahGroup;
        param["T"] = blahText;
        param["Y"] = blahType;
        if (infoObj != null) {
            for (propName in infoObj) {
                param[propName] = infoObj[propName];
            }
        }
        if (bodyText != "") {
            param["F"] = bodyText;
        }

        CallPostMethod("blahs", JSON.stringify(param), OnSuccess, OnFailure);
    };



    var GetViewersOfUser = function (OnSuccess, OnFailure) {
        /// <summary>Returns the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the json for the user object</returns>
        var paramStr = null;
        //var methodName = "users/" + this.currentUser;
        //CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
        // temp for now
        var userCount = Math.floor(Math.random() * 100)  + 5;
        OnSuccess(userCount);
    };

    var GetViewersOfChannel = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Returns the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the json for the user object</returns>
        var paramStr = null;
        var methodName = "groups/" + ChannelID + "/viewerCount";
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);

    };

    var GetViewersOfBlah = function (BlahID, OnSuccess, OnFailure) {
        /// <summary>Returns the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the json for the user object</returns>
        var paramStr = null;
        //var methodName = "users/" + this.currentUser;
        //this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
        // temp for now
        var userCount = Math.floor(Math.random() * 1000)  + 50;
        OnSuccess(userCount);
    };


    var GetUserBlahs = function (OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var methodName = "blahs";
        CallGetMethod(methodName, "{}", OnSuccess, OnFailure);
    };

    var GetUserComments = function (OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var paramStr = 'authorId=' + CurrentUser._id;
        var methodName = "comments";
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };


    var GetUserChannels = function (OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var methodName = "userGroups";
        CallGetMethod(methodName, "{}", OnSuccess, OnFailure);
    };

    var GetFeaturedChannels = function (OnSuccess, OnFailure) {
        /// <summary>Returns the channels for an anonymous user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var paramStr = '{}';
        var methodName = "groups/featured";
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    var GetUsers = function (OnSuccess, OnFailure) {
        ///
        var paramStr = '{}';
        CallGetMethod("users", paramStr, OnSuccess, OnFailure);
    };

    var GetNextBlahs = function (OnSuccess, OnFailure) {
        ///
        var paramStr = new Object();
        paramStr["start"] = 0;
        paramStr["count"] = 100;
        paramStr["groupId"] = this.currentChannel;
        var methodName = "users/inbox";
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    var GetBlahComments = function (blahId, OnSuccess, OnFailure) {
        /// <summary>Returns the comments of the current blah</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>a list of the comments, if any</returns>
        var paramStr = new Object();
        paramStr["blahId"] = blahId;
        //paramStr["userId"] = CurrentUser._id;

        var methodName = "comments";
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    var GetBlah = function (BlahID, OnSuccess, OnFailure) {
        /// <summary>Returns the current session blah</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the blah object</returns>
        var paramStr = '{}';
        var methodName = "blahs/" + BlahID;
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };


    var GetBlahWithStats = function (BlahID, StartDate, EndDate, OnSuccess, OnFailure) {

        var paramStr = '';
       var methodName = "blahs/" + BlahID  + "?stats=true&s=" + StartDate + "&e=" + EndDate;

        //var methodName = "blahs/" + BlahID  + "?stats=true";
        CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    return {
        currentChannel: currentChannel,
        GetUserStats:  GetUserStats ,
        GetChannelTypes:  GetChannelTypes ,
        GetChannelsForType:  GetChannelsForType ,
        getAuthorities:  getAuthorities ,
        createBadgeForUser:  createBadgeForUser ,
        getBadgeById:  getBadgeById ,
        CreateUserProfile:  CreateUserProfile ,
        UpdateUserProfile:  UpdateUserProfile ,
        GetUserProfile:  GetUserProfile ,
        GetProfileSchema:  GetProfileSchema ,
        AddBlahComment:  AddBlahComment ,
        SetUserPredictionVote:  SetUserPredictionVote ,
        SetUserExpiredPredictionVote: SetUserExpiredPredictionVote ,
        GetUserPredictionVote:  GetUserPredictionVote ,
        getUserDescriptorString:  getUserDescriptorString ,
        AddBlahViewsOpens:  AddBlahViewsOpens ,
        GetChannelInfo:  GetChannelInfo ,
        GetUserChannelInfo:  GetUserChannelInfo ,
        SetBlahVote: SetBlahVote,
        SetCommentVote:  SetCommentVote ,
        RemoveUserFromChannel:  RemoveUserFromChannel ,
        JoinUserToChannel:  JoinUserToChannel ,
        GetAllChannels:  GetAllChannels ,
        getUserInfo:  getUserInfo ,
        loginUser:  loginUser ,
        isUserLoggedIn:  isUserLoggedIn ,
        logoutUser:  logoutUser ,
        CheckUsernameExists:  CheckUsernameExists ,
        CreateUser:  CreateUser ,
        SetUserPollVote:  SetUserPollVote ,
        GetUserPollVote:  GetUserPollVote ,
        GetBlahTypes:  GetBlahTypes ,
        CreateUserBlah:  CreateUserBlah ,
        GetViewersOfUser:  GetViewersOfUser ,
        GetViewersOfChannel:  GetViewersOfChannel ,
        GetViewersOfBlah:  GetViewersOfBlah ,
        GetUserBlahs:  GetUserBlahs ,
        GetUserComments:  GetUserComments ,
        GetUserChannels:  GetUserChannels ,
        GetFeaturedChannels:  GetFeaturedChannels ,
        GetUsers:  GetUsers ,
        GetNextBlahs:  GetNextBlahs ,
        GetBlahComments:  GetBlahComments ,
        GetBlah:  GetBlah ,
        GetBlahWithStats: GetBlahWithStats
    }
});