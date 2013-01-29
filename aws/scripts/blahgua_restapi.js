// rest call wrappers for blahgua


function BlahguaObject() {
    // properties
    this.baseURL = "http://blahgua-rest.elasticbeanstalk.com/v2/";
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
            success: function (blahList) {
                if (OnSuccess != null) {
                    OnSuccess(blahList.d);
                }
            },
            error: function (theErr) {
                if (OnFailure != null) {
                    var response = {};
                    var message = "An error occured";
                    if (theErr.responseText != "") {
                        response = JSON.parse(theErr.responseText);
                        try {
                            message = JSON.parse(response.Message);
                        }
                        catch (exp) {
                            message = new Object();
                            message["_message"] = response.Message;
                        }
                    }

                    OnFailure(message);
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
                    var response = {};
                    var message = "An error occured";
                    if (theErr.responseText != "") {
                        response = JSON.parse(theErr.responseText);
                        try {
                            message = JSON.parse(response.Message);
                        }
                        catch (exp) {
                            message = new Object();
                            message["_message"] = response.Message;
                        }
                    }

                    OnFailure(message);
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
                    var response = {};
                    var message = "An error occured";
                    if (theErr.responseText != "") {
                        response = JSON.parse(theErr.responseText);
                        try {
                            message = JSON.parse(response.Message);
                        }
                        catch (exp) {
                            message = new Object();
                            message["_message"] = response.Message;
                        }
                    }

                    OnFailure(message);
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


   



    this.GetBlahComments = function (OnSuccess, OnFailure) {
        /// <summary>Returns the comments of the current blah</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>a list of the comments, if any</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetBlahComments", paramStr, OnSuccess, OnFailure);
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

    this.SetBlahVote = function (newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"newVote":' + newVote + '}';
        this.CallPageMethod("SetBlahVote", paramStr, OnSuccess, OnFailure);
    };

    this.SetCommentVote = function (commentID, newVote, OnSuccess, OnFailure) {
        /// <summary>Sets the user's vote for the current blah</summary>
        /// <param name="newVote">the new vote</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"commentID":"' + commentID + '", "newVote":' + newVote + '}';
        this.CallPageMethod("SetCommentVote", paramStr, OnSuccess, OnFailure);
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

    this.GetUserGroups = function (OnSuccess, OnFailure) {
        /// <summary>Returns the groups of the current user</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the user's groups</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetUserGroups", paramStr, OnSuccess, OnFailure);
    };

    this.LeaveGroup = function (GroupID, OnSuccess, OnFailure) {
        /// <summary>Leaves the specified group</summary>
        /// <param name="GroupID">the id of the group to leave</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"groupID":"' + GroupID + '"}';
        this.CallPageMethod("LeaveGroup", paramStr, OnSuccess, OnFailure);
    };

    this.SetSessionGroup = function (GroupID, OnSuccess, OnFailure) {
        /// <summary>Sets the specified group to the session group</summary>
        /// <param name="GroupID">the id of the group to set</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"groupID":"' + GroupID + '"}';
        this.CallPageMethod("SetSessionGroup", paramStr, OnSuccess, OnFailure);
    };

    this.ValidateUserInGroup = function (code, OnSuccess, OnFailure) {
        /// <summary>validates the user in a group with a code</summary>
        /// <param name="code">the validation code</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        var paramStr = '{"validationCode":"' + code + '"}';
        this.CallPageMethod("ValidateUserInGroup", paramStr, OnSuccess, OnFailure);
    };

    this.GetGroupTypes = function (OnSuccess, OnFailure) {
        /// <summary>Returns the types of groups available</summary>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the group types</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetGroupTypes", paramStr, OnSuccess, OnFailure);
    };

    this.GetGroupsForType = function (GroupType, OnSuccess, OnFailure) {
        /// <summary>Returns the types of groups available</summary>
        /// <param name="GroupType">The ID of the group type</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A list of the group types</returns>
        var paramStr = '{"id":"' + GroupType + '"}';
        this.CallPageMethod("GetGroupsForType", paramStr, OnSuccess, OnFailure);
    };

    this.GetGroupInfo = function (GroupID, OnSuccess, OnFailure) {
        /// <summary>Returns info about the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{"groupID":"' + GroupID + '"}';
        this.CallPageMethod("GetGroupInfo", paramStr, OnSuccess, OnFailure);
    };

    this.GetGroupStats = function (GroupID, OnSuccess, OnFailure) {
        /// <summary>Returns statistics on the specified group</summary>
        /// <param name="GroupID">The ID of the group </param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group stats object</returns>
        var paramStr = '{"groupID":"' + GroupID + '"}';
        this.CallPageMethod("GetGroupStats", paramStr, OnSuccess, OnFailure);
    };

    this.JoinUserToGroup = function (GroupID, email, OnSuccess, OnFailure) {
        /// <summary>Joins the session user to the group</summary>
        /// <param name="GroupID">The ID of the group to join</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A group object</returns>
        var paramStr = '{"groupID":"' + GroupID + '", "emailAddress":"' + email + '"}';
        this.CallPageMethod("JoinUserToGroup", paramStr, OnSuccess, OnFailure);
    };

    this.CreateUserBlah = function (blahText, blahType, blahGroup, bodyText, OnSuccess, OnFailure) {
        /// <summary>Joins the session user to the group</summary>
        /// <param name="blahText">The text of the new blah</param>
        /// <param name="blahType">The ID of the type of the new blah</param>
        /// <param name="blahGroup">The ID of the group for the new blah</param>
        /// <param name="bodyText">The text of the blah body</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>A new blah object</returns>
        var paramStr = '{"blahText":"' + blahText + '", "blahTypeID":"' + blahType + '", "blahGroupID":"' + blahGroup + '", "body":"' + bodyText + '"}';
        this.CallPageMethod("CreateUserBlah", paramStr, OnSuccess, OnFailure);
    };

    this.CreateUser = function (userName, email, isAdmin, OnSuccess, OnFailure) {
        /// <summary>Creates a new user</summary>
        /// <param name="userName">The internal name of the new user</param>
        /// <param name="email">The recovery email address of the new user</param>
        /// <param name="isAdmin">true if user should be made an admin</param>
        /// <param name="OnSuccess">Success callback</param>
        /// <param name="OnFailure">Failure callback</param>
        /// <returns>The ID of the new user</returns>
        var paramStr = '{"userName":"' + userName + '", "email":"' + email + '", "isAdmin":' + isAdmin + '}';
        this.CallPageMethod("CreateUser", paramStr, OnSuccess, OnFailure);
    };

    this.SetSessionUser = function (userID, OnSuccess, OnFailure) {
        /// <summary>Sets the session user to the specified user ID</summary>
        /// <param name="userID">the ID of the user to set</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        var paramStr = '{"id":"' + userID + '"}';
        this.CallPageMethod("SetSessionUser", paramStr, OnSuccess, OnFailure);
    };

    this.CreateGroupType = function (newType, OnSuccess, OnFailure) {
        /// <summary>Sets the session user to the specified user ID</summary>
        /// <param name="newType">the name of the new type</param>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>The ID of the new type</returns>
        var paramStr = '{"groupTypeName":"' + newType + '"}';
        this.CallPageMethod("CreateGroupType", paramStr, OnSuccess, OnFailure);
    };

    this.GetAllGroups = function (OnSuccess, OnFailure) {
        /// <summary>Returns all groups in the system</summary>
        /// <param name="OnSuccess">method to call when the function returns successfully</param>
        /// <param name="OnFailure">method to call on the event of a failure</param>
        /// <returns>List of all of the groups</returns>
        var paramStr = '{}';
        this.CallPageMethod("GetAllGroups", paramStr, OnSuccess, OnFailure);
    };

    this.UpdateGroup = function (groupID, displayName, groupDesc, state, OnSuccess, OnFailure) {
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

    this.CreateGroup = function (groupTypeID, groupName, groupDesc, validationMethod, validationData, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"groupTypeID":"' + groupTypeID + '", "groupName":"' + groupName + '", "groupDesc":"' + groupDesc + '", "validationMethod":"' + validationMethod + '", "validationData":"' + validationData + '"}';
        this.CallPageMethod("CreateGroup", paramStr, OnSuccess, OnFailure);
    };

    this.ClearSessionUser = function (OnSuccess, OnFailure) {
        ///
        var paramStr = '{}';
        this.CallPageMethod("ClearSessionUser", paramStr, OnSuccess, OnFailure);
    };

    this.IsUserInGroup = function (GroupID, OnSuccess, OnFailure) {
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

    this.AssertCurrentPage = function (PageName, OnSuccess, OnFailure) {
        ///
        var paramStr = '{"pageName":"' + PageName + '"}';
        this.CallPageMethod("AssertCurrentPage", paramStr, OnSuccess, OnFailure);
    };

    this.GetUsers = function (OnSuccess, OnFailure) {
        ///
        var paramStr = '{}';
        this.CallGetMethod("users", paramStr, OnSuccess, OnFailure);
    };

    this.GetBlahsForUser = function (UserID, OnSuccess, OnFailure) {
        ///
        var paramStr = '{}';
        var methodName = "users/" + UserID + "/inbox";
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

    this.UpdateUserProfile = function (profile, OnSuccess, OnFailure) {
        ///
        var dataObj = new Object();
        dataObj["profileObj"] = profile;// { test: 10, waste: 20 };
        //this.CallPageMethod("UpdateUserProfile", paramStr, OnSuccess, OnFailure);
        $.ajax({
            type: "POST",
            url: this.baseURL + "/" + "UpdateUserProfile",
            processData: false,
            data: JSON.stringify(dataObj),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (blahList) {
                if (OnSuccess != null) {
                    OnSuccess(blahList.d);
                }
            },
            error: function (theErr) {
                if (OnFailure != null) {
                    OnFailure(theErr);
                }
            }
        });
    };
}



var Blahgua;

Blahgua = new BlahguaObject();
