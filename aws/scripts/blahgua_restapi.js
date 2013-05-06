// rest call wrappers for blahgua


function BlahguaObject() {
    // properties
    this.baseURL = "http://beta.blahgua.com/v2/";
    this.currentChannel = "";
    //this.baseURL = "../v2/";

    // methods
    this.CallPostMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "POST",
            url: this.baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
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

    this.CallGetMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "GET",
            url: this.baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (OnSuccess != null) {
                    OnSuccess(result);
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

    this.CallPutMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "PUT",
            url: this.baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (OnSuccess != null) {
                    OnSuccess(result);
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

    this.CallDeleteMethod = function (methodName, paramString, OnSuccess, OnFailure) {
        /// <summary>Calls the specified method on the page with the specified parameters</summary>
        /// <param name="methodName">the name of the method to call</param>
        /// <param name="paramString">the parameter string.  Use "{}" for an empty string</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>


        $.ajax({
            type: "DELETE",
            url: this.baseURL + methodName,
            data: paramString,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (OnSuccess != null) {
                    OnSuccess(result);
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






    //  ACTUAL WORKING FUNCTIONS
    this.GetUserStats = function (start, end, OnSuccess, OnFailure) {
        /// <summary>Returns the stats of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user stats object</returns>
        var paramStr = '?stats=true&s=' + start + '&e=' + end;
        var method = "users/info" + paramStr;
        this.CallGetMethod(method, "{}", OnSuccess, OnFailure);
    };

    this.GetChannelTypes = function (OnSuccess, OnFailure) {
        /// <summary>Returns the types of groups available</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the group types</returns>
        var paramStr = '{}';
        this.CallGetMethod("groupTypes", paramStr, OnSuccess, OnFailure);
    };

    this.GetChannelsForType = function (ChannelType, OnSuccess, OnFailure) {
        /// <summary>Returns the types of groups available</summary>
        /// <param name="GroupType">The ID of the group type</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the group types</returns>
        var paramStr = '{}';
        var methodName = "groups?type=" + ChannelType;
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };


    this.getAuthorities = function (OnSuccess, OnFailure) {
        var paramStr =  "{}";
        this.CallGetMethod("badges/authorities", paramStr, OnSuccess, OnFailure);

    }

    this.createBadgeForUser = function (authId, badgeId, OnSuccess, OnFailure) {
        var param = new Object();
        param["I"] = authId;
        if (badgeId != null)
            param["T"] = badgeId;
        var paramStr = JSON.stringify(param);

        $.ajax({
            type: "POST",
            url: this.baseURL + "badges",
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
    }

    this.getBadgeById = function (badgeId, OnSuccess, OnFailure) {
        var paramStr =  "{}";
        this.CallGetMethod("badges/" + badgeId, paramStr, OnSuccess, OnFailure);

    }


    this.CreateUserProfile = function (profileObj, OnSuccess, OnFailure) {
        /// <summary>Returns the profile for the session user</summary>
        /// <param name="userID">The id of the user, or "" for the session user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user's profile object</returns>
        var paramStr =  JSON.stringify(profileObj);
        this.CallPostMethod("users/profile/info", paramStr, OnSuccess, OnFailure);
    };

    this.UpdateUserProfile = function (profileObj, OnSuccess, OnFailure) {
        /// <summary>Returns the profile for the session user</summary>
        /// <param name="userID">The id of the user, or "" for the session user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user's profile object</returns>
        var paramStr =  JSON.stringify(profileObj);
        this.CallPutMethod("users/profile/info", paramStr, OnSuccess, OnFailure);
    };

    this.GetUserProfile = function (userID, OnSuccess, OnFailure) {
        /// <summary>Returns the profile for the session user</summary>
        /// <param name="userID">The id of the user, or "" for the session user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user's profile object</returns>
        var paramStr = '{}';
        this.CallGetMethod("users/profile/info", paramStr, OnSuccess, OnFailure);
    };

    this.GetProfileSchema = function (OnSuccess, OnFailure) {
        /// <summary>Returns the profile schema object</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the profile schema object</returns>
        var paramStr = null;
        this.CallGetMethod("users/profile/schema", paramStr, OnSuccess, OnFailure);
    };

    this.AddBlahComment = function (commentText, blahId, OnSuccess, OnFailure) {
        /// <summary>Adds the specified comment to the current session blah</summary>
        /// <param name="commentText">the text to add</param>
        /// <param name="commentVote">The comment vote (should be 0)</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"T":"' + commentText + '", "B":"' + blahId + '"}';
        this.CallPostMethod("comments", paramStr, OnSuccess, OnFailure);
    };


    this.SetUserPredictionVote = function (blahID, theVote, OnSuccess, OnFailure) {
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
        var method = "blahs/" + blahID + "/predicts"
        this.CallPutMethod(method, JSON.stringify(paramObj), OnSuccess, OnFailure);
    };

    this.SetUserExpiredPredictionVote = function (blahID, theVote, OnSuccess, OnFailure) {
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
        var method = "blahs/" + blahID + "/predicts"
        this.CallPutMethod(method, JSON.stringify(paramObj), OnSuccess, OnFailure);
    };

    this.GetUserPredictionVote = function (blahID, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="userID">the ID of the user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>{"p": poll-option-index, "t": datetime-when-voted}</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/predicts";
        this.CallGetMethod(method, paramStr, OnSuccess, OnFailure);
    };

    this.getUserDescriptorString = function (userId, OnSuccess, OnFailure) {
        /// <summary>Returns info about the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{"I":"' + userId + '"}';
        var methodName = "users/descriptor";
        this.CallPostMethod(methodName, paramStr, OnSuccess, OnFailure);
    };



    this.AddBlahViewsOpens = function (blahID, numViews, numOpens, OnSuccess, OnFailure) {
        /// <summary>Adds the specified number of views and opens to the blah's stats</summary>
        /// <param name="blahID">The ID of the blah to modify</param>
        /// <param name="numViews">The number of views to add</param>
        /// <param name="numOpens">The number of opens to add</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"V":' + numViews + ', "O":' + numOpens + '}';
        var methodname = "blahs/" + blahID;
        this.CallPutMethod(methodname, paramStr, OnSuccess, OnFailure);
    };


    this.GetChannelInfo = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Returns info about the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{}';
        var methodName = "groups/" + ChannelID;
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.GetUserChannelInfo = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Returns info about the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{}';
        var methodName = "userGroups/" + ChannelID;
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };


    this.SetBlahVote = function (blahId, newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="blahId">the id of the blah</param>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"uv":' + newVote + '}';

        var methodName = "blahs/" + blahId;
        this.CallPutMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.SetCommentVote = function (commentID, newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var param = new Object();

        param["C"] = newVote;

        var methodName = "comments/" + commentID;
        this.CallPutMethod(methodName, JSON.stringify(param), OnSuccess, OnFailure);
    };



    this.RemoveUserFromChannel = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Leaves the specified group</summary>
        /// <param name="GroupID">the id of the group to leave</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = "{'g':'" + ChannelID + "'}";
        var methodName = "userGroups";
        this.CallDeleteMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.JoinUserToChannel = function (channelId, OnSuccess, OnFailure) {
        /// <summary>Joins the session user to the group</summary>
        /// <param name="userId">The ID of the user</param>
        /// <param name="channelId">The ID of the group to join</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{"G": "' + channelId + '"}';
        this.CallPostMethod("userGroups", paramStr, OnSuccess, OnFailure);
    };

    this.GetAllChannels = function (OnSuccess, OnFailure) {
        /// <summary>Returns all groups in the system</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>List of all of the groups</returns>
        var paramStr = '{}';
        this.CallGetMethod("groups", paramStr, OnSuccess, OnFailure);
    };

    this.getUserInfo = function (OnSuccess, OnFailure) {
        /// <summary>returns a user record on the logged in user</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>user object</returns>
        var paramStr = '{}';
        var method = "users/info";
        this.CallGetMethod(method, paramStr, OnSuccess, OnFailure);
    };


    this.loginUser = function (userName, password, OnSuccess, OnFailure) {
        /// <summary>Creates a new user</summary>
        /// <param name="userName">The internal name of the new user</param>
        /// <param name="password">password of the user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the user</returns>
        var paramStr = '{"N":"' + userName + '", "pwd":"' + password + '"}';
        this.CallPostMethod("users/login", paramStr, OnSuccess, OnFailure);
    };

    this.logoutUser = function (OnSuccess, OnFailure) {
        /// <summary>Logs out the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the user</returns>
        var paramStr = '{}';
        this.CallPostMethod("users/logout", paramStr, OnSuccess, OnFailure);
    };

    this.CheckUsernameExists = function(theName, OnSuccess, OnFailure) {
        var paramStr = '{"U":"' + theName + '"}';
        this.CallPostMethod("users/check/username", paramStr, OnSuccess, OnFailure);

    }


    this.CreateUser = function (userName, password, OnSuccess, OnFailure) {
        /// <summary>Creates a new user</summary>
        /// <param name="userName">The  name of the new user</param>
        /// <param name="password">The user's password</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the new user</returns>
        var paramStr = '{"N":"' + userName + '", "pwd":"' + password + '"}';
        this.CallPostMethod("users", paramStr, OnSuccess, OnFailure);
    };


    this.SetUserPollVote = function (blahID, optionIndex, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="optionIndex">the zero-based index of the option the user is voting on</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>nothing</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/pollVote/" + optionIndex;
        this.CallPutMethod(method, paramStr, OnSuccess, OnFailure);
    };

    this.GetUserPollVote = function (blahID, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>{"p": poll-option-index, "t": datetime-when-voted}</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/pollVote";
        this.CallGetMethod(method, paramStr, OnSuccess, OnFailure);
    };

    this.GetBlahTypes = function (OnSuccess, OnFailure) {
        /// <summary>Returns the currently available blah types</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>an array of blah types</returns>
        var paramStr = '{}';
        this.CallGetMethod("blahs/types", paramStr, OnSuccess, OnFailure);
    };


    this.CreateUserBlah = function (blahText, blahType, blahGroup, bodyText, infoObj, OnSuccess, OnFailure) {
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

        this.CallPostMethod("blahs", JSON.stringify(param), OnSuccess, OnFailure);
    };



    this.GetViewersOfUser = function (OnSuccess, OnFailure) {
        /// <summary>Returns the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the json for the user object</returns>
        var paramStr = null;
        //var methodName = "users/" + this.currentUser;
        //this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
        // temp for now
        var userCount = Math.floor(Math.random() * 100)  + 5;
        OnSuccess(userCount);
    };

    this.GetViewersOfChannel = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Returns the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the json for the user object</returns>
        var paramStr = null;
        var methodName = "groups/" + ChannelID + "/viewerCount";
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);

    };

    this.GetViewersOfBlah = function (BlahID, OnSuccess, OnFailure) {
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


    this.GetUserBlahs = function (OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var methodName = "blahs";
        this.CallGetMethod(methodName, "{}", OnSuccess, OnFailure);
    };

    this.GetUserComments = function (OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var methodName = "comments";
        this.CallGetMethod(methodName, "{}", OnSuccess, OnFailure);
    };


    this.GetUserChannels = function (OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var methodName = "userGroups";
        this.CallGetMethod(methodName, "{}", OnSuccess, OnFailure);
    };

    this.GetFeaturedChannels = function (OnSuccess, OnFailure) {
        /// <summary>Returns the channels for an anonymous user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var paramStr = '{}';
        var methodName = "groups/featured";
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.GetUsers = function (OnSuccess, OnFailure) {
        ///
        var paramStr = '{}';
        this.CallGetMethod("users", paramStr, OnSuccess, OnFailure);
    };

    this.GetNextBlahs = function (OnSuccess, OnFailure) {
        ///
        var paramStr = new Object();
        paramStr["start"] = 0;
        paramStr["count"] = 100;
        paramStr["groupId"] = this.currentChannel;
        var methodName = "users/inbox";
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.GetBlahComments = function (blahId, OnSuccess, OnFailure) {
        /// <summary>Returns the comments of the current blah</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>a list of the comments, if any</returns>
        var paramStr = 'blahId=' + blahId;
        var methodName = "comments";
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.GetBlah = function (BlahID, OnSuccess, OnFailure) {
        /// <summary>Returns the current session blah</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the blah object</returns>
        var paramStr = '{}';
        var methodName = "blahs/" + BlahID;
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };


    this.GetBlahWithStats = function (BlahID, StartDate, EndDate, OnSuccess, OnFailure) {

        var paramStr = '';
//        var methodName = "blahs/" + BlahID  + "?stats=true&s=" + StartDate + "&e=" + EndDate;

        var methodName = "blahs/" + BlahID  + "?stats=true";
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
    };





}



var Blahgua;

Blahgua = new BlahguaObject();
