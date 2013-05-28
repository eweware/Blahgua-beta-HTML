/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var curStatPage = null;

        var  InitializePage = function(whichPage) {
            $(BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.CloseBlah();
            });
            $(".sign-in-button").click(function(theEvent) {
                exports.LogoutUser();
            });
            $("#SelfProfileBtn").click(function(theEvent){
                SetSelfDetailPage('Profile');
            });
            $("#SelfHistoryBtn").click(function(theEvent){
                SetSelfDetailPage('History');
            });
            $("#SelfStatsBtn").click(function(theEvent){
                SetSelfDetailPage('Stats');
            });

            curStatPage = whichPage;

            blahgua_rest.GetUserProfile(G.CurrentUser._id, OnGetOwnProfileOK, OnGetOwnProfileFailed);
        };



        var OnGetOwnProfileFailed = function(theErr) {
            if (theErr.status == 404) {
                // profile doesn't exist - add one!
                G.UserProfile = new Object();
                G.UserProfile["A"] = "someone";
                blahgua_rest.CreateUserProfile(G.UserProfile, OnGetOwnProfileOK, exports.OnFailure);
            }
        };


        var OnGetOwnProfileOK = function(theStats) {
            G.UserProfile = theStats;
            var nickName = G.GetSafeProperty(theStats, "A", "someone");
            $("#FullBlahNickName").text(nickName);
            //image
            var newImage = G.GetUserImage(G.CurrentUser, "A");
            if (newImage != "")
                $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});

            blahgua_rest.getUserDescriptorString(G.CurrentUser._id, function(theString) {
                $("#DescriptionSpan").text(theString.d);
            });

            $(BlahFullItem).fadeIn("fast", function() {
                SetSelfDetailPage(curStatPage);
            });
        }

        var SetSelfDetailPage = function(whichPage) {
            $(".BlahPageFooter .BlahButton").removeClass("BlahBtnSelected");
            switch (whichPage) {
                case "Profile":
                    G.BlahFullItem.curPage = "Profile";
                    require(["SelfPageDetails"], function(DetailsPage){
                        $("#SelfPageDiv").load(G.FragmentURL + "/pages/SelfPageDetails.html #SelfPageDetailsDiv", function() {
                            $("#SelfProfileBtn").addClass("BlahBtnSelected");
                            DetailsPage.InitializePage();
                        });
                    });

                    break;
                case "History":
                    G.BlahFullItem.curPage = "History";
                    require(["SelfPageHistory"], function(HistoryPage){
                        $("#SelfPageDiv").load(G.FragmentURL + "/pages/SelfPageHistory.html #SelfPageHistoryDiv", function() {
                            $("#SelfHistoryBtn").addClass("BlahBtnSelected");
                            HistoryPage.InitializePage();
                        });
                    });

                    break;
                case "Stats":
                    G.BlahFullItem.curPage = "Stats";
                    require(["SelfPageStats"], function(StatsPage){
                        $("#SelfPageDiv").load(G.FragmentURL + "/pages/SelfPageStats.html #SelfPageStatsDiv", function() {
                            $("#SelfStatsBtn").addClass("BlahBtnSelected");
                            StatsPage.InitializePage();
                        });
                    });

                    break;
            }
        };

        return {
            InitializePage: InitializePage
        }
    }
);