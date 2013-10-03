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
                $("#BlahPageDiv").css({"bottom":"60px"});
            }
            UpdateBlahPage();
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
                var imageName = G.GetSafeProperty(theString, "m", "");
                if (imageName != "") {
                    var  newImage = BlahguaConfig.imageURL + imageName + "-A.jpg";
                    $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                    $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                }

                $("#FullBlahProfileString").text(theString.d);
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
                    var userImage = G.GetSafeProperty(theString, "m", "");
                    if (userImage != "") {
                        newImage = BlahguaConfig.imageURL + userImage + "-A.jpg";
                    } else {
                        newImage = G.GetGenericUserImage();
                    }
                    $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                } else {
                    // anonymous
                    document.getElementById("FullBlahNickName").innerHTML = "someone";
                    var newImage = G.GetGenericUserImage();
                    $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                }
                LoadOpenPage();
            }, function (theErr) {
                $("#FullBlahProfileString").text("someone");
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
            $(".BlahPageFooter .BlahButton").removeClass("BlahBtnSelected");
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
                            BodyDetails.InitializePage();
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
                            $("#BlahDetailCommentsBtn").addClass("BlahBtnSelected");
                            CommentDetails.InitializePage();
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
                            $("#BlahDetailStatsBtn").addClass("BlahBtnSelected");
                            StatsDetails.InitializePage();
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