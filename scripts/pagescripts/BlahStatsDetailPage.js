/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahStatsDetailPage',
    [
        "constants",
        "globals",
        "ExportFunctions",
        "blahgua_restapi",
        "stats"
    ],
    function (K, G, exports, blahgua_rest, stats) {

        var InitializePage = function (){

            // bind the methods

            // handle the sizing
            var newWidth = $(".accordion-body").width();
            $(".chart-box").width(newWidth - 32);

            var curTop = document.getElementById("FullBlahStatsContainer").getBoundingClientRect().top;
            var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
            var maxSize = curBottom - curTop + "px";
            $("#FullBlahStatsContainer").css({ 'max-height': maxSize , 'min-height': maxSize});

            $('.accordion h2').click(function(theEvent) {
                var parent = $(this).parent('.accordion');
                if (parent.hasClass("active")) {
                    // close it
                    parent.removeClass("active");
                } else {
                    // open it and close others
                    $(".active").removeClass("active");
                    parent.addClass("active");
                    this.scrollIntoView(true);
                }
            });

            if (G.IsUserLoggedIn && (G.UserProfile == null)) {
                blahgua_rest.GetUserProfile(G.CurrentUser._id, function(json) {
                    G.UserProfile = json;
                    RefreshUserStats();
                }, function(theErr) {
                    // todo: be more robuts with profile load failure
                    exports.OnFailure(theErr);
                });
            } else {
                RefreshUserStats();
            }


        };

        var RefreshUserStats = function() {
            var endDate = new Date(Date.now());
            var startDate = new Date(Date.now() - (G.NumStatsDaysToShow * (24 * 3600 * 1000)));

            var startDateStr = G.CreateDateString(startDate);
            var endDateStr = G.CreateDateString(endDate);
            blahgua_rest.GetBlahWithStats(G.CurrentBlah._id, startDateStr, endDateStr, function(json) {
                G.CurrentBlah = json;
                UpdateBlahStats();
            }, function(theErr) {
                // can't actually show stats...
                UpdateBlahStats();
            });
        };

        var UpdateBlahStats = function() {
            // Overall Standing
            var curStats = G.GetSafeProperty(G.CurrentBlah,"L", null);
            var curStr = G.GetSafeProperty(G.CurrentBlah, "S", 0);
            var recentStr = G.GetSafeProperty(G.CurrentBlah, "R", 0);
            var uv = G.GetSafeProperty(G.CurrentBlah, "P", 0);
            var dv = G.GetSafeProperty(G.CurrentBlah, "D", 0);

            $("#BlahStandingDiv").highcharts({
                title: {
                    text:"Blah Strength (100%)"
                },
                legend: {
                    enabled:false
                },
                credits: {
                    enabled:false
                },
                xAxis: {
                    categories: ['Current', 'Recent']
                },
                yAxis: {
                    min:0,
                    max:100,
                    title: { text: null}
                },
                series: [{
                    type: 'bar',
                    data: [{color: '#FF0000', y: curStr * 100},
                        {color: '#0000FF', y: recentStr * 100}]
                }]
            });


            $("#BlahVoteMixDiv").empty().height("200px").highcharts({
                title: {
                    text:"Promotes & Demotes"
                },
                legend: {
                    enabled:false
                },
                credits: {
                    enabled:false
                },
                xAxis: {
                    categories: ['promotes', 'demotes']
                },
                yAxis: {
                    min: 0,
                    minRange:10,
                    minorTickInterval:1,
                    min:0
                },

                series: [{
                    type: 'bar',
                    data: [{color: '#00FF00', y: uv},
                        {color: '#FF0000', y: dv}]

                }]
            });

            if ((uv == 0) && (dv == 0)) {
                G.AppendChartMask("#BlahVoteMixDiv", "No votes yet");
            }


            // Audience Engagement
            var views = G.GetSafeProperty(G.CurrentBlah,"V", 0);
            var opens = G.GetSafeProperty(G.CurrentBlah, "O", 0);
            var ratio = Math.round((opens / views) * 10000) / 100;
            $(".conversion-percent").text(ratio + "%");
            $(".conversion-desc").text("Opened " + opens + " times out of " + views + " impressions");

            if (curStats && curStats.length > 0) {
                var endDate = new Date(Date.now());
                var startDate = new Date(Date.now() - (G.NumStatsDaysToShow * (24 * 3600 * 1000)));
                var viewData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, G.CurrentBlah, "V");
                var openData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, G.CurrentBlah, "O");
                var commentsMade = stats.GetDailyStatValuesForTimeRange(startDate, endDate, G.CurrentBlah, "C");
                var catAxis = stats.makeDateRangeAxis(startDate, endDate);

                $('#BlahActivityViewsDiv').highcharts(stats.MakeStatChartOptions("Impressions", viewData, catAxis));
                $('#BlahActivityOpensDiv').highcharts(stats.MakeStatChartOptions("Opens", openData, catAxis));
                $('#BlahActivityCommentsDiv').highcharts(stats.MakeStatChartOptions("Comments", commentsMade, catAxis));

            }


            // Voter Demographics
            if (G.IsUserLoggedIn && G.UserProfile.hasOwnProperty("B") && (G.UserProfile["B"] != -1))
                $("#DemoGenderChartArea").highcharts(stats.MakeDemoChartOptions(G.CurrentBlah, "Gender", "B"));
            else
                $("#DemoGenderChartArea").html(stats.GenerateShareDemoHTML("Gender", "B"));

            if (G.IsUserLoggedIn && G.UserProfile.hasOwnProperty("D") && (G.UserProfile["D"] != -1))
                $("#DemoEthnicityChartArea").highcharts(stats.MakeDemoChartOptions(G.CurrentBlah, "Ethnicity", "D"));
            else
                $("#DemoEthnicityChartArea").html(stats.GenerateShareDemoHTML("Ethnicity", "D"));


             if (G.IsUserLoggedIn && G.UserProfile.hasOwnProperty("C") && (G.UserProfile["C"] != -1))
                $("#DemoAgeChartArea").highcharts(stats.MakeDemoChartOptions(G.CurrentBlah, "Age", "C"));
             else
                $("#DemoAgeChartArea").html(stats.GenerateShareDemoHTML("Age", "C"));


            if (G.IsUserLoggedIn && G.UserProfile.hasOwnProperty("J") && (G.UserProfile["J"] != -1))
                $("#DemoCountryChartArea").highcharts(stats.MakeDemoChartOptions(G.CurrentBlah, "Country", "J"));
            else
                $("#DemoCountryChartArea").html(stats.GenerateShareDemoHTML("Country", "J"));

        };


        var CreateDemoData = function(whichDemo) {
            var curResult = [];
            var curData;
            var curIndexName;
            var o, p,c;
            if (G.CurrentBlah.hasOwnProperty('_d') && (G.ProfileSchema != null)) {
                for(curIndex in G.ProfileSchema[whichDemo].DT) {
                    curData = new Object();
                    curIndexName = G.ProfileSchema[whichDemo].DT[curIndex];
                    curData.name = curIndexName;
                    curData.data = [];
                    o = G.GetSafeProperty(G.CurrentBlah._d._o[whichDemo], curIndex,0);
                    p = G.GetSafeProperty(G.CurrentBlah._d._u[whichDemo], curIndex,0);
                    c = G.GetSafeProperty(G.CurrentBlah._d._c[whichDemo], curIndex,0);
                    if ((o > 0) || (p > 0) || (c > 0)) {
                        curData.data.push(o);
                        curData.data.push(p);
                        curData.data.push(c);
                        curResult.push(curData);
                    }
                }
            }

            return curResult;
        };

        return {
            InitializePage: InitializePage
        }
    }
);
