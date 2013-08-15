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
                var pageTop = $("#DescriptionSpan")[0].getBoundingClientRect().bottom;
                if(G.IsShort) {
                    $(".BlahPageFooter").css({"height":"42px"});
                    $("#SelfPageDiv").css({"bottom":"0px", "top":pageTop + "px"});
                } else {
                    $(".BlahPageFooter").css({"height":"60px"});
                    $("#SelfPageDiv").css({"bottom":"60px", "top":pageTop + "px"});
                }

                $(BlahFullItem).fadeIn("fast", function() {
                    SetSelfDetailPage(curStatPage);
                });
            });


        }



        var SetSelfDetailPage = function(whichPage) {
            $(".BlahPageFooter .BlahButton").removeClass("BlahBtnSelected");
            var basePage;
            switch (whichPage) {
                case "Profile":
                    basePage = "SelfPageDetails.html";
                    if (G.IsShort)
                        basePage = "SelfPageDetailsShort.html";
                    G.BlahFullItem.curPage = "Profile";
                    require(["SelfPageDetails"], function(DetailsPage){
                        $("#SelfPageDiv").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #SelfPageDetailsDiv", function() {
                            $("#SelfProfileBtn").addClass("BlahBtnSelected");
                            DetailsPage.InitializePage();
                        });
                    });

                    break;
                case "History":
                    basePage = "SelfPageHistory.html";
                    if (G.IsShort)
                        basePage = "SelfPageHistoryShort.html";
                    G.BlahFullItem.curPage = "History";
                    require(["SelfPageHistory"], function(HistoryPage){
                        $("#SelfPageDiv").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #SelfPageHistoryDiv", function() {
                            $("#SelfHistoryBtn").addClass("BlahBtnSelected");
                            HistoryPage.InitializePage();
                        });
                    });

                    break;
                case "Stats":
                    basePage = "SelfPageStats.html";
                    if (G.IsShort)
                        basePage = "SelfPageStatsShort.html";
                    G.BlahFullItem.curPage = "Stats";
                    require(["SelfPageStats"], function(StatsPage){
                        $("#SelfPageDiv").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #SelfPageStatsDiv", function() {
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