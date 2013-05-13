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
            $(".CloseButton").click(function(theEvent) {
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

            // update the badges & date
            blahgua_rest.getUserDescriptorString(CurrentBlah.A, function(theString) {
                $("#FullBlahProfileString").text(theString.d);
            }, function (theErr) {
                $("#FullBlahProfileString").text("an anonymous blahger");
            })

            var curDate = new Date(getSafeProperty(CurrentBlah, "c", Date.now()));
            var dateString = ElapsedTimeString(curDate);
            $("#FullBlahDateStr").text(dateString);

            // see if we were supposed to go elsewhere
            if (BlahOpenPage == "")
                BlahOpenPage = "Overview";

            SetBlahDetailPage(BlahOpenPage);
            BlahOpenPage = "Overview";
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