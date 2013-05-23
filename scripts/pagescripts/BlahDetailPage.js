/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('BlahDetailPage',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var InitializePage = function(whichPage) {
            // bind events
            $(".blah-closer").click(function(theEvent) {
                $("#AdditionalInfoArea").empty();
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

            UpdateBlahPage();
        }

        var UpdateBlahPage = function() {
            var headlineText = document.getElementById("BlahFullHeadline");
            headlineText.innerHTML = CurrentBlah.T;
            var nickNameStr = CurrentBlahNickname;
            var blahTypeStr = exports.GetBlahTypeStr();
            var isOwnBlah;
            var blahChannelStr = exports.GetChannelNameFromID(CurrentBlah.G);


            if (IsUserLoggedIn) {
                isOwnBlah = (CurrentBlah.A == CurrentUser._id);
            } else {
                isOwnBlah = false;
            }

            if (isOwnBlah) {
                nickNameStr += " (you)";
            }

            // stats
            //document.getElementById("FullBlahViewerCount").innerHTML = getSafeProperty(CurrentBlah, "V", 0); // change to actual viewers
            document.getElementById("FullBlahNickName").innerHTML = nickNameStr;
            document.getElementById("BlahSpeechAct").innerHTML = blahTypeStr + " in " + blahChannelStr;

            // update the opens
            blahgua_rest.AddBlahViewsOpens(CurrentBlah._id, 0, 1, null, null);// to do - check for errors


            // fetch the user image
            blahgua_rest.GetBlahAuthor(CurrentBlah._id, function(theAuthor) {
                var newImage = GetUserImage(theAuthor, "A");
                if (newImage == "")
                    newImage = GetGenericUserImage();

                $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});

            }, function (theErr) {
                newImage = GetGenericUserImage();

                $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
            });

            var curDate = new Date(getSafeProperty(CurrentBlah, "c", Date.now()));
            var dateString = ElapsedTimeString(curDate);
            $("#FullBlahDateStr").text(dateString);

            // update badges, if any
            if (CurrentBlah.hasOwnProperty("B"))
                UpdateBlahBadges();
            else
                UpdateDescriptionString();
        };

        var LoadOpenPage = function() {
            var curTop = document.getElementById("FullBlahHeader").getBoundingClientRect().bottom - 25;
            $("#BlahPageDiv").css({ 'top': curTop + "px"});
            // see if we were supposed to go elsewhere
            if (BlahOpenPage == "")
                BlahOpenPage = "Overview";

            SetBlahDetailPage(BlahOpenPage);
            BlahOpenPage = "Overview";
        };

        var UpdateDescriptionString = function() {
            // update the badges & date
            blahgua_rest.getUserDescriptorString(CurrentBlah.A, function(theString) {
                $("#FullBlahProfileString").text(theString.d);
                LoadOpenPage();
            }, function (theErr) {
                $("#FullBlahProfileString").text("an anonymous blahger");
                LoadOpenPage();
            });

        };

        var UpdateBlahBadges = function() {
            var badgeList = CurrentBlah.B;
            for (var curIndex in badgeList) {
                CreateAndAppendBadgeDescription(badgeList[curIndex]);
            }
            UpdateDescriptionString();
        };

        var CreateAndAppendBadgeDescription = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var badgeName = getSafeProperty(fullBadge, "N", "unnamed badge");
                var newHTML = "<tr class='badge-info-row'>";
                newHTML += "<td><img style='width:16px; height:16px;' src='" + fragmentURL + "/img/black_badge.png'</td>";
                newHTML += "<td style='width:100%'>verified <span class='badge-name-class'>"+ badgeName + "</span></td>";

                $("#BlahFacetTable").append(newHTML);
                var curTop = document.getElementById("FullBlahHeader").getBoundingClientRect().bottom - 25;
                $("#BlahPageDiv").css({ 'top': curTop + "px"});
            }, function (theErr) {
                // TODO:  handle badge load error
            });
        };

        var SetBlahDetailPage = function(whichPage) {
            $(".BlahPageFooter .BlahButton").removeClass("BlahBtnSelected");
            switch (whichPage) {
                case "Overview":
                    BlahFullItem.curPage = "Overview";
                    require(["BlahBodyDetailPage"], function(BodyDetails) {
                        $("#BlahPageDiv").load(fragmentURL + "/pages/BlahBodyDetailPage.html #FullBlahBodyDiv", function() {
                            $("#BlahDetailSummaryBtn").addClass("BlahBtnSelected");
                            BodyDetails.InitializePage();
                        });
                    })

                    break;
                case "Comments":
                    BlahFullItem.curPage = "Comments";
                    require(["BlahCommentDetailPage"], function(CommentDetails){
                        $("#BlahPageDiv").load(fragmentURL + "/pages/BlahCommentDetailPage.html #FullBlahCommentDiv", function() {
                            $("#BlahDetailCommentsBtn").addClass("BlahBtnSelected");
                            CommentDetails.InitializePage();
                        });
                    });

                    break;
                case "Stats":
                    BlahFullItem.curPage = "Stats";
                    require(["BlahStatsDetailPage"], function(StatsDetails){
                        $("#BlahPageDiv").load(fragmentURL + "/pages/BlahStatsDetailPage.html #FullBlahStatsDiv", function() {
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