/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPage',
    ["GlobalFunctions"],
    function (exports) {

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
            $(BlahFullItem).fadeIn("fast", function() {
                SetSelfDetailPage(whichPage);
            });
        };

        var SetSelfDetailPage = function(whichPage) {
            $(".BlahPageFooter .BlahButton").removeClass("BlahBtnSelected");
            switch (whichPage) {
                case "Profile":
                    BlahFullItem.curPage = "Profile";
                    require(["SelfPageDetails"], function(DetailsPage){
                        $("#SelfPageDiv").load(fragmentURL + "/pages/SelfPageDetails.html #SelfPageDetailsDiv", function() {
                            $("#SelfProfileBtn").addClass("BlahBtnSelected");
                            DetailsPage.InitializePage();
                        });
                    });

                    break;
                case "History":
                    BlahFullItem.curPage = "History";
                    require(["SelfPageHistory"], function(HistoryPage){
                        $("#SelfPageDiv").load(fragmentURL + "/pages/SelfPageHistory.html #SelfPageHistoryDiv", function() {
                            $("#SelfHistoryBtn").addClass("BlahBtnSelected");
                            HistoryPage.InitializePage();
                        });
                    });

                    break;
                case "Stats":
                    BlahFullItem.curPage = "Stats";
                    require(["SelfPageStats"], function(StatsPage){
                        $("#SelfPageDiv").load(fragmentURL + "/pages/SelfPageStats.html #SelfPageStatsDiv", function() {
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