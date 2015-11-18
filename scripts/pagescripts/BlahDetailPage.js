/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('BlahDetailPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var CurrentPageScriptObj = null;

        var InitializePage = function(whichPage) {
            // bind events
            $(".blah-closer").click(function(theEvent) {
                $("#AdditionalInfoArea").empty();
                exports.CurrentCommentText = "";
                exports.CloseBlah();
            });

            $("#BlahDetailSummaryBtn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                SetBlahDetailPage('Overview');
            });
            $("#BlahDetailCommentsBtn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                SetBlahDetailPage('Comments');
            });
            $("#BlahDetailStatsBtn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                SetBlahDetailPage('Stats');
            });

            if(G.IsShort) {
                $("#BlahPageFooter").css({"height":"42px"});
                $("#BlahPageDiv").css({"bottom":"0px"});
            } else {
                $("#BlahPageFooter").css({"height":"60px"});
                $("#BlahPageDiv").css({"bottom":"70px"});
            }
            G.BlahFullItem.curPage = "";    // ensure that we have the initial page blank
            exports.UpdateBlahViewer(UpdateBlahChannelMessage);
            UpdateBlahPage();
        };

        var UpdateBlahChannelMessage = function(msgObj, env, channel) {
            if (channel == exports.CurrentBlahPushChannel) {

                var action = G.GetSafeProperty(msgObj, "action", "none");


                switch (action) {
                    case "comment":
                        var commentId = G.GetSafeProperty(msgObj, "commentid", 0);
                        var userId = G.GetSafeProperty(msgObj, "userid", 0);
                        if (userId != G.GetSafeProperty(G.CurrentUser, "_id", 0)) {
                            UpdateForNewComment(commentId);
                        }

                        break;

                }
            }
        };

        var UpdateForNewComment = function(commentid) {
            console.log("New comment - " + commentid);
            switch (G.BlahFullItem.curPage) {
                case "Overview":
                case "Comments":
                    if (CurrentPageScriptObj != null) {
                        CurrentPageScriptObj.HandleNewComment(commentid);
                    }
                    break;
            }
        }

        var UpdateBlahPage = function() {
            var headlineText = document.getElementById("BlahFullHeadline");
            headlineText.innerHTML = G.UnCodifyText(G.CurrentBlah.T, false);

            var blahTypeStr = exports.GetBlahTypeStr();
            var isOwnBlah;
            var blahChannelStr = exports.GetChannelNameFromID(G.CurrentBlah.G);


            if (G.IsUserLoggedIn) {
                isOwnBlah = (G.CurrentBlah.A == G.CurrentUser._id);
            } else {
                isOwnBlah = false;
            }

            // stats
            //document.getElementById("FullBlahViewerCount").innerHTML = G.GetSafeProperty(CurrentBlah, "V", 0); // change to actual viewers

            document.getElementById("BlahSpeechAct").innerHTML = blahTypeStr + " in " + blahChannelStr;

            // update the opens
            blahgua_rest.AddBlahViewsOpens(G.CurrentBlah._id, 0, 1, null, null);// to do - check for errors
            var curDate = new Date(G.GetSafeProperty(G.CurrentBlah, "c", Date.now()));
            var dateString = G.ElapsedTimeString(curDate);
            $("#FullBlahDateStr").text(dateString);

            // update badges, if any
            if (G.CurrentBlah.hasOwnProperty("B"))
                UpdateBlahBadges();
            else
                UpdateDescriptionString();
        };

        var LoadOpenPage = function() {
            if (!G.GetSafeProperty(G.CurrentChannel, "SAD", true)) {
                $("#FullBlahProfileString").hide();
            }


            if (G.IsShort) {
                $("#BlahPageDiv").css({ 'top': "0px", 'position':'static'});
            }
            else {
                var curTop = document.getElementById("FullBlahHeader").getBoundingClientRect().height;
                $("#BlahPageDiv").css({ 'top': curTop + "px"});
            }
            // see if we were supposed to go elsewhere
            if (G.BlahOpenPage == "")
                G.BlahOpenPage = "Overview";

            SetBlahDetailPage(G.BlahOpenPage);
            G.BlahOpenPage = "Overview";
        };

        var UpdateDescriptionString = function() {
            // update the badges & date

            blahgua_rest.getUserDescriptorString(G.CurrentBlah.A, function(theString) {
                var nickNameStr = "someone";
                if (G.IsUserLoggedIn) {
                    isOwnBlah = (G.CurrentBlah.A == G.CurrentUser._id);
                } else {
                    isOwnBlah = false;
                }
                nickNameStr = G.GetSafeProperty(theString, "K", nickNameStr);
                if (isOwnBlah)
                    nickNameStr += " (you)";

                if (!G.GetSafeProperty(G.CurrentBlah, "XX", false)) {
                    document.getElementById("FullBlahNickName").innerHTML = nickNameStr;
                    // get the author image
                    var imageName = G.GetItemImage(theString, "A", "m");
                    if (imageName == "")
                        imageName = G.GetGenericUserImage();

                    $("#BlahAuthorImage").css({"background-image": "url('" + imageName + "')"});
                    $("#FullBlahProfileString").text(theString.d);
                } else {
                    // anonymous
                    document.getElementById("FullBlahNickName").innerHTML = "someone";
                    var newImage = G.GetGenericUserImage();
                    $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                    $("#FullBlahProfileString").text("an unidentified person.");
                }
                LoadOpenPage();
            }, function (theErr) {
                $("#FullBlahProfileString").text("An anonymous person");
                LoadOpenPage();
            });
        };

        var UpdateBlahBadges = function() {
            var badgeList = G.CurrentBlah.B;
            for (var curIndex in badgeList) {
                CreateAndAppendBadgeDescription(badgeList[curIndex]);
            }
            UpdateDescriptionString();
        };

        var CreateAndAppendBadgeDescription = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var badgeName = G.GetSafeProperty(fullBadge, "N", "unnamed badge");
                var newHTML = "<tr class='badge-info-row'>";
                newHTML += "<td><img style='width:16px; height:16px;' src='" + BlahguaConfig.fragmentURL + "img/black_badge.png'>";
                newHTML += "verified <span class='badge-name-class'>"+ badgeName + "</span></td></tr>";

                $("#BlahFacetTable").append(newHTML);
                var curTop = document.getElementById("FullBlahHeader").getBoundingClientRect().bottom - 25;
                $("#BlahPageDiv").css({ 'top': curTop + "px"});
            }, function (theErr) {
                // TODO:  handle badge load error
            });
        };

        var SetBlahDetailPage = function(whichPage) {
            if (whichPage == G.BlahFullItem.curPage)
                return;
            ga('send', 'pageview', {
                'page': '/blah/' + whichPage,
                'title': G.CurrentBlah._id
            });
            var basePage;
            switch (whichPage) {
                case "Overview":
                    basePage = "BlahBodyDetailPage.html";
                    if (G.IsShort)
                        basePage = "BlahBodyDetailPageShort.html";
                    G.BlahFullItem.curPage = "Overview";
                    require(["BlahBodyDetailPage"], function(BodyDetails) {
                        $("#BlahPageDiv").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #FullBlahBodyDiv", function() {
                            $("#BlahDetailSummaryBtn").addClass("BlahBtnSelected");
                            $("#BlahDetailCommentsBtn").removeClass("BlahBtnSelected");
                            $("#BlahDetailStatsBtn").removeClass("BlahBtnSelected");
                            BodyDetails.InitializePage();
                            CurrentPageScriptObj = BodyDetails;
                        });
                    })
                    break;

                case "Comments":
                    basePage = "BlahCommentDetailPage.html";
                    if (G.IsShort)
                        basePage = "BlahCommentDetailPageShort.html";
                    G.BlahFullItem.curPage = "Comments";
                    require(["BlahCommentDetailPage"], function(CommentDetails){
                        $("#BlahPageDiv").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #FullBlahCommentDiv", function() {
                            $("#BlahDetailSummaryBtn").removeClass("BlahBtnSelected");
                            $("#BlahDetailCommentsBtn").addClass("BlahBtnSelected");
                            $("#BlahDetailStatsBtn").removeClass("BlahBtnSelected");
                            CommentDetails.InitializePage();
                            CurrentPageScriptObj = CommentDetails;
                        });
                    });
                    break;

                case "Stats":
                    basePage = "BlahStatsDetailPage.html";
                    if (G.IsShort)
                        basePage = "BlahStatsDetailPageShort.html";
                    G.BlahFullItem.curPage = "Stats";
                    require(["BlahStatsDetailPage"], function(StatsDetails){
                        $("#BlahPageDiv").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #FullBlahStatsDiv", function() {
                            $("#BlahDetailSummaryBtn").removeClass("BlahBtnSelected");
                            $("#BlahDetailCommentsBtn").removeClass("BlahBtnSelected");
                            $("#BlahDetailStatsBtn").addClass("BlahBtnSelected");
                            StatsDetails.InitializePage();
                            CurrentPageScriptObj = StatsDetails;
                        });
                    });
                    break;
            }
        };

        exports.SetBlahDetailPage = SetBlahDetailPage;

        return {
            InitializePage: InitializePage
        }
    }
);