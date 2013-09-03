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
            var widthDelta = 32;
            if (G.IsNarrow) {
                if (G.IsiPad || G.IsiPad)
                    widthDelta = 0;
                else
                    widthDelta = 16;
            }
            $(".chart-box").width(newWidth - widthDelta);

            if (G.IsShort) {
                // reparent that footer.
                $("#FullBlahBlahTableFooter").remove();
                $("#ShortScreenScrollDiv").css({"bottom":"42px"});
                $("#FullBlahStatsContainer").css({ 'overflow-x': 'visible' , 'overflow-y': 'visible'});
            } else {
                var curTop = document.getElementById("FullBlahStatsContainer").getBoundingClientRect().top;
                var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
                var maxSize = curBottom - curTop + "px";
                $("#FullBlahStatsContainer").css({ 'max-height': maxSize , 'min-height': maxSize});
            }

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
            var uv = G.GetSafeProperty(G.CurrentBlah, "P", 0);
            var dv = G.GetSafeProperty(G.CurrentBlah, "D", 0);
            if (curStr < .01)
                curStr = .01;


            $("#BlahStandingDiv").highcharts({
                title: {
                    text:"blahgua Score",
                    align:"left",
                    style:{fontFamily:"Arimo"}
                },
                legend: {
                    enabled:false
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false
                        },
                        enableMouseTracking: false
                    }
                },
                credits: {
                    enabled:false
                },
                tooltip: {
                    enabled: false
                },
                chart:{
                    spacingRight:20,
                    backgroundColor: 'transparent'
                },

                xAxis :{
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                yAxis: {
                    min:0,
                    max:100,
                    title: { text: null}

                },
                series: [{
                    type: 'bar',
                    pointWidth: 36,
                    data: [{color: '#f87858', y: Math.floor(curStr * 100)}]
                }]
            });
            G.AppendChartMask("#BlahStandingDiv", "");


            $("#BlahVoteMixDiv").empty().height("200px").highcharts({
                title: {
                    text:"Promotes & Demotes",
                    align:"left",
                    style:{fontFamily:"Arimo"}
                },
                chart:{
                    backgroundColor: 'transparent'
                },
                legend: {
                    enabled:false
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false
                        },
                        enableMouseTracking: false
                    }
                },
                credits: {
                    enabled:false
                },
                tooltip: {
                    enabled: false
                },
                xAxis: {
                    categories: ['promotes', 'demotes']
                },
                yAxis: {
                    min: 0,
                    minRange:10,
                    minorTickInterval:1,
                    title: { text: null}
                },

                series: [{
                    type: 'bar',
                    data: [{color: '#7ad000', y: uv},
                        {color: '#f87858', y: dv}]

                }]
            });

            if ((uv == 0) && (dv == 0)) {
                G.AppendChartMask("#BlahVoteMixDiv", "No votes yet.");
            }
            else
                G.AppendChartMask("#BlahVoteMixDiv", "");


            // Audience Engagement
            var views = G.GetSafeProperty(G.CurrentBlah,"V", 0);
            var opens = G.GetSafeProperty(G.CurrentBlah, "O", 0);
            if (views < opens)
                views = opens;

            var ratio = Math.round((opens / views) * 10000) / 100;
            $(".conversion-percent").text(ratio + "%");
            $(".conversion-desc").text("Opened " + opens + " times out of " + views + " impressions");


            var endDate = new Date(Date.now());
            var startDate = new Date(Date.now() - (G.NumStatsDaysToShow * (24 * 3600 * 1000)));
            var viewData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, G.CurrentBlah, "V");
            var openData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, G.CurrentBlah, "O");
            var commentsMade = stats.GetDailyStatValuesForTimeRange(startDate, endDate, G.CurrentBlah, "C");
            var catAxis = stats.makeDateRangeAxis(startDate, endDate);

            $('#BlahActivityViewsDiv').highcharts(stats.MakeStatChartOptions("Impressions", viewData, catAxis));
            if (G.DataZeroOrEmpty(viewData))
                G.AppendChartMask("#BlahActivityViewsDiv", "No impressions in this period.");
            else
                G.AppendChartMask("#BlahActivityViewsDiv", "");

            $('#BlahActivityOpensDiv').highcharts(stats.MakeStatChartOptions("Opens", openData, catAxis));
            if (G.DataZeroOrEmpty(openData))
                G.AppendChartMask("#BlahActivityOpensDiv", "No opens in this period.");
            else
                G.AppendChartMask("#BlahActivityOpensDiv", "");

            $('#BlahActivityCommentsDiv').highcharts(stats.MakeStatChartOptions("Comments", commentsMade, catAxis));
            if (G.DataZeroOrEmpty(commentsMade))
                G.AppendChartMask("#BlahActivityCommentsDiv", "No comments in this period.");
            else
                G.AppendChartMask("#BlahActivityCommentsDiv", "");



            // Voter Demographics
            if (G.IsUserLoggedIn) {
                var showLegend = true;
                $("#SignInForDemoDiv").hide();

                showLegend = stats.MaybeShowDemoChart(G.CurrentBlah, "#DemoGenderChartArea", "Gender", "B", showLegend);
                showLegend = stats.MaybeShowDemoChart(G.CurrentBlah, "#DemoEthnicityChartArea", "Ethnicity", "D", showLegend);
                showLegend = stats.MaybeShowDemoChart(G.CurrentBlah, "#DemoAgeChartArea", "Age", "C", showLegend);
                showLegend = stats.MaybeShowDemoChart(G.CurrentBlah, "#DemoCountryChartArea", "Country", "J", showLegend);
                stats.MaybeShowDemoChart(G.CurrentBlah, "#DemoIncomeChartArea", "Income", "E", showLegend);


            } else {
                // hide these all
                $("#SignInForDemoDiv").show();
                $("#AboutAudienceSection .chart-box").hide();

            }


        };






        return {
            InitializePage: InitializePage
        }
    }
);
