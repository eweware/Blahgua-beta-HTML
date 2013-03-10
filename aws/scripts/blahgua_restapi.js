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
                if (OnFailure != null) {
                    OnFailure(theErr);
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
                if (OnFailure != null) {
                    OnFailure(theErr);
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
                if (OnFailure != null) {
                    OnFailure(theErr);
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
                if (OnFailure != null) {
                    OnFailure(theErr);
                }
            }
        });
    };


    this.GetBlahs = function (channelStr, OnSuccess, OnFailure) {
        /// <summary>Returns a list of the blahs for the current user</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>A list of blahs</returns>
        var paramStr = '{"channelStr":"' + channelStr + '"}';
        this.CallPageMethod("GetBlahs", paramStr, OnSuccess, OnFailure);
    }

    this.SetSafeSessionBlah = function (targetBlah, OnSuccess, OnFailure) {
        /// <summary>Sets the session blah to the specified blah, checking if the user can see it</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        var paramStr = '{"id":"' + targetBlah + '"}';
        this.CallPageMethod("SafeSetSessionBlah", paramStr, OnSuccess, OnFailure);
    };

    this.SetSessionBlah = function (targetBlah, OnSuccess, OnFailure) {
        /// <summary>Sets the session blah to the specified blah, checking if the user can see it</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        var paramStr = '{"id":"' + targetBlah + '"}';
        this.CallPageMethod("SetSessionBlah", paramStr, OnSuccess, OnFailure);
    };

    this.GetSessionUser = function (OnSuccess, OnFailure) {
        /// <summary>Returns the User ID for the current session</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user ID as a string</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetSessionUser", paramStr, OnSuccess, OnFailure);
    };

    this.GetBlahTypes = function (OnSuccess, OnFailure) {
        /// <summary>Returns the currently available blah types</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>an array of blah types</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetBlahTypes", paramStr, OnSuccess, OnFailure);
    };

    this.GetProfileSchema = function (OnSuccess, OnFailure) {
        /// <summary>Returns the profile schema object</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the profile schema object</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetProfileSchema", paramStr, OnSuccess, OnFailure);
    };

    this.GetUserProfile = function (userID, OnSuccess, OnFailure) {
        /// <summary>Returns the profile for the session user</summary>
        /// <param name="userID">The id of the user, or "" for the session user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user's profile object</returns>
        var paramStr = '{"userID":"' + userID + '"}';
        this.CallPageMethod("GetUserProfile", paramStr, OnSuccess, OnFailure);
    };


   





    this.AddCommentViewsOpens = function (commentID, numViews, numOpens, OnSuccess, OnFailure) {
        /// <summary>Adds the specified number of views and opens to the blah's stats</summary>
        /// <param name="commentID">The ID of the comment to modify</param>
        /// <param name="numViews">The number of views to add</param>
        /// <param name="numOpens">The number of opens to add</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"commentID":"' + curComment._id + '", "numViews":' + numViews + ', "numOpens":' + numOpens + '}';
        this.CallPageMethod("AddCommentViewsOpens", paramStr, OnSuccess, OnFailure);
    };

    this.ShortenURLS = function (URLList, OnSuccess, OnFailure) {
        /// <summary>Returns the comments of the current blah</summary>
        /// <param name="URLList">A list of URLS to shorten</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>a list of the shortened URLs</returns>
        var dataObj = new Object();
        dataObj["URLlist"] = URLList;

        var paramStr = JSON.stringify(dataObj);
        this.CallPageMethod("ShortenURLS", paramStr, OnSuccess, OnFailure);
    };

    this.AddCommentViewsOpens = function (commentID, numViews, numOpens, OnSuccess, OnFailure) {
        /// <summary>Adds the specified number of views and opens to the blah's stats</summary>
        /// <param name="commentID">The ID of the comment to modify</param>
        /// <param name="numViews">The number of views to add</param>
        /// <param name="numOpens">The number of opens to add</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"commentID":"' + curComment._id + '", "numViews":' + numViews + ', "numOpens":' + numOpens + '}';
        this.CallPageMethod("AddCommentViewsOpens", paramStr, OnSuccess, OnFailure);
    };

    this.AddBlahComment = function (commentText, commentVote, OnSuccess, OnFailure) {
        /// <summary>Adds the specified comment to the current session blah</summary>
        /// <param name="commentText">the text to add</param>
        /// <param name="commentVote">The comment vote (should be 0)</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"commentText":"' + commentText + '", "newVote":' + commentVote + '}';
        this.CallPageMethod("AddBlahComment", paramStr, OnSuccess, OnFailure);
    };



    this.GetUserStats = function (OnSuccess, OnFailure) {
        /// <summary>Returns the stats of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>the user stats object</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetUserStats", paramStr, OnSuccess, OnFailure);
    };

    this.GetUserBlahs = function (OnSuccess, OnFailure) {
        /// <summary>Returns the blahs of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's blahs</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetUserBlahs", paramStr, OnSuccess, OnFailure);
    };

    this.GetUserComments = function (OnSuccess, OnFailure) {
        /// <summary>Returns the comments of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's comments</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetUserComments", paramStr, OnSuccess, OnFailure);
    };





    this.ValidateUserInChannel = function (code, OnSuccess, OnFailure) {
        /// <summary>validates the user in a group with a code</summary>
        /// <param name="code">the validation code</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"validationCode":"' + code + '"}';
        this.CallPageMethod("ValidateUserInGroup", paramStr, OnSuccess, OnFailure);
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



    this.GetChannelStats = function (ChannelID, OnSuccess, OnFailure) {
        /// <summary>Returns statistics on the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group stats object</returns>
        var paramStr = '{"groupID":"' + GroupID + '"}';
        this.CallPageMethod("GetGroupStats", paramStr, OnSuccess, OnFailure);
    };





    this.CreateChannelType = function (newType, OnSuccess, OnFailure) {
        /// <summary>Sets the session user to the specified user ID</summary>
        /// <param name="newType">the name of the new type</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>The ID of the new type</returns>
        var paramStr = '{"groupTypeName":"' + newType + '"}';
        this.CallPageMethod("CreateGroupType", paramStr, OnSuccess, OnFailure);
    };



    this.UpdateChannel = function (groupID, displayName, groupDesc, state, OnSuccess, OnFailure) {
        /// <summary>Updates group info</summary>
        /// <param name="groupID">the ID of the group</param>
        /// <param name="displayName">group short display name</param>
        /// <param name="groupDesc">group description</param>
        /// <param name="state">state of the group.  A = active</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"groupID":"' + groupID + '", "displayName":"' + displayName + '", "groupDesc":"' + groupDesc + '", "state":"' + state + '"}';
        this.CallPageMethod("UpdateGroup", paramStr, OnSuccess, OnFailure);
    };

    this.CreateChannel = function (groupTypeID, groupName, groupDesc, validationMethod, validationData, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"groupTypeID":"' + groupTypeID + '", "groupName":"' + groupName + '", "groupDesc":"' + groupDesc + '", "validationMethod":"' + validationMethod + '", "validationData":"' + validationData + '"}';
        this.CallPageMethod("CreateGroup", paramStr, OnSuccess, OnFailure);
    };



    this.IsUserInChannel = function (ChannelID, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"groupID":"' + GroupID + '"}';
        this.CallPageMethod("IsUserInGroup", paramStr, OnSuccess, OnFailure);
    };

    this.GetLongLatInfo = function (latitude, longitude, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"lat":' + latitude + ', "lng":' + longitude + '}';
        this.CallPageMethod("GetLongLatInfo", paramStr, OnSuccess, OnFailure);
    };

    this.RecoverWithCode = function (recCode, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"theCode":"' + recCode + '"}';
        this.CallPageMethod("RecoverWithCode", paramStr, OnSuccess, OnFailure);
    };

    this.RequestEmailRecovery = function (recEmail, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"emailAddr":"' + recEmail + '"}';
        this.CallPageMethod("RequestEmailRecovery", paramStr, OnSuccess, OnFailure);
    };

    this.GenerateNewPasscode = function (OnSuccess, OnFailure) {
        ///
        var paramStr = '{}';
        this.CallPageMethod("GenerateNewPasscode", paramStr, OnSuccess, OnFailure);
    };

    this.GetViewerCount = function (PageName, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"pageName":"' + PageName + '"}';
        this.CallPageMethod("GetViewerCount", paramStr, OnSuccess, OnFailure);
    };

    this.AddBlahViewsOpens = function (blahID, numViews, numOpens, OnSuccess, OnFailure) {
        /// <summary>Adds the specified number of views and opens to the blah's stats</summary>
        /// <param name="blahID">The ID of the blah to modify</param>
        /// <param name="numViews">The number of views to add</param>
        /// <param name="numOpens">The number of opens to add</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"numViews":' + numViews + ', "numOpens":' + numOpens + ', "blahID":"' + blahID + '"}';
        this.CallPageMethod("AddBlahViewsOpens", paramStr, OnSuccess, OnFailure);
    };



    //  ACTUAL WORKING FUNCTIONS

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

    this.SetBlahVote = function (blahId, newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="blahId">the id of the blah</param>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"v":' + newVote + '}';

        var methodName = "blahs/" + blahId;
        this.CallPutMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.SetCommentVote = function (commentID, newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var param = new Object();
        param["v"] = newVote;
        var methodName = "comments/" + commentID;
        this.CallPutMethod(methodName, param, OnSuccess, OnFailure);
    };



    this.removeUserFromChannel = function (userID, ChannelID, OnSuccess, OnFailure) {
        /// <summary>Leaves the specified group</summary>
        /// <param name="GroupID">the id of the group to leave</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = "{}";
        var methodName = "userGroups/" + userID + "/" + ChannelID;
        this.CallDeleteMethod(methodName, paramStr, OnSuccess, OnFailure);
    };

    this.JoinUserToChannel = function (userId, channelId, OnSuccess, OnFailure) {
        /// <summary>Joins the session user to the group</summary>
        /// <param name="userId">The ID of the user</param>
        /// <param name="channelId">The ID of the group to join</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{"userId": "'+ userId + '", "groupId": "' + channelId + '"}';
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
        var paramStr = '{"displayName":"' + userName + '", "pwd":"' + password + '"}';
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


    this.CreateUser = function (userName, password, OnSuccess, OnFailure) {
        /// <summary>Creates a new user</summary>
        /// <param name="userName">The  name of the new user</param>
        /// <param name="password">The user's password</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the new user</returns>
        var paramStr = '{"displayName":"' + userName + '", "pwd":"' + password + '"}';
        this.CallPostMethod("users", paramStr, OnSuccess, OnFailure);
    };


    this.SetUserPollVote = function (blahID, userID, optionIndex, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="userID">the ID of the user</param>
        /// <param name="optionIndex">the zero-based index of the option the user is voting on</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>nothing</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/pollVote/" + userID + "/" + optionIndex;
        this.CallPutMethod(method, paramStr, OnSuccess, OnFailure);
    };

    this.GetUserPollVote = function (blahID, userID, OnSuccess, OnFailure) {
        /// <summary>Returns the users vote on a poll, if any</summary>
        /// <param name="blahID">the ID of the blah</param>
        /// <param name="userID">the ID of the user</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>{"p": poll-option-index, "t": datetime-when-voted}</returns>
        var paramStr = '{}';
        var method = "blahs/" + blahID + "/pollVote/" + userID;
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
        //param["authorId"] = this.currentUser;
        param["groupId"] = blahGroup;
        param["text"] = blahText;
        param["typeId"] = blahType;
        if (infoObj != null) {
            for (propName in infoObj) {
                param[propName] = infoObj[propName];
            }
        }
        if (bodyText != "") {
            param["b"] = bodyText;
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





    this.GetUserChannels = function (userId, OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var paramStr = '{"state":"A"}';
        var methodName = "userGroups/" + userId;
        this.CallGetMethod(methodName, paramStr, OnSuccess, OnFailure);
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
        paramStr["end"] = 100;
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




}



var Blahgua;

Blahgua = new BlahguaObject();
