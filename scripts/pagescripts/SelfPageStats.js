/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPageStats',
    [
        "globals",
        "ExportFunctions",
        "blahgua_restapi",
        "stats"
    ],
    function (G, exports, blahgua_rest, stats) {

        var  InitializePage = function() {
            var newWidth = $(".accordion-body").width();
            $(".chart-box").width(newWidth - 32);
            UpdateSelfStats();
        };

        var UpdateSelfStats = function() {
            // load the stats
            var endDate = new Date(Date.now());
            var startDate = new Date(Date.now() - (G.NumStatsDaysToShow * (24 * 3600 * 1000)));

            var start = G.CreateDateString(startDate);
            var end = G.CreateDateString(endDate);
            blahgua_rest.GetUserStats(start, end, function(statsObj) {
                // refresh all of the stat markets and charts

                // Overall standings
                var userStrength = G.GetSafeProperty(statsObj, 'S', 0);
                var userContro = G.GetSafeProperty(statsObj, 'K', 0);

                $('#UserStandingDiv').highcharts({
                    chart: {
                        spacingRight:40,
                        backgroundColor: 'transparent'
                    },
                    title: {
                        text:null
                    },
                    legend: {
                        enabled:false
                    },
                    credits: {
                        enabled:false
                    },
                    tooltip: {
                        enabled: false
                    },
                    xAxis: {
                        categories: ['Reputation', 'Controversy']
                    },
                    yAxis: {
                        min:0,
                        max:100,
                        title: { text: null}
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: true,
                                format: '{y}%'
                            }
                        }
                    },
                    series: [{
                        type: 'bar',
                        data: [{color: '#7db5e3', y: Math.floor(userStrength * 100)},
                            {color: '#f8b800', y: Math.floor(userContro * 100)}]
                    }]
                });



                // Your Activity
                var viewData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["v", "V"]);
                var openData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["o", "O"]);
                var blahsMade = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "X");
                var commentsMade  = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "XX");
                var catAxis = stats.makeDateRangeAxis(startDate, endDate);

                $('#UserActivityViewDiv').highcharts(stats.MakeStatChartOptions("Posts Impressions", viewData, catAxis));
                if (G.DataZeroOrEmpty(viewData))
                    G.AppendChartMask("#UserActivityViewDiv", "No activity in this time period.");
                else
                    G.AppendChartMask("#UserActivityViewDiv", "");

                $('#UserActivityOpenDiv').highcharts(stats.MakeStatChartOptions("Posts Opened", openData, catAxis));
                if (G.DataZeroOrEmpty(openData))
                    G.AppendChartMask("#UserActivityOpenDiv", "No activity in this time period.");
                else
                    G.AppendChartMask("#UserActivityOpenDiv", "");


                $('#UserActivityPostCreatedDiv').highcharts(stats.MakeStatChartOptions("Posts Created", blahsMade, catAxis));
                if (G.DataZeroOrEmpty(blahsMade))
                    G.AppendChartMask("#UserActivityPostCreatedDiv", "No activity in this time period.");
                else
                    G.AppendChartMask("#UserActivityPostCreatedDiv", "");


                $('#UserActivityCommentsCreatedDiv').highcharts(stats.MakeStatChartOptions("Comments Created", commentsMade, catAxis));
                if (G.DataZeroOrEmpty(commentsMade))
                    G.AppendChartMask("#UserActivityCommentsCreatedDiv", "No activity in this time period.");
                else
                    G.AppendChartMask("#UserActivityCommentsCreatedDiv", "");

                // Your Blahs and Comments
                var otherUpVotes = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "T" );
                var otherDownVotes = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj,"DT");
                var otherViews = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "V");
                var otherOpens  = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "O");
                var otherComments  = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "C");

                var reverseDown = [];
                for (var curIndex in otherDownVotes) {
                    reverseDown.push(-otherDownVotes[curIndex]);
                }

                $('#UserBlahActivityViewsDiv').highcharts(stats.MakeStatChartOptions("Impressions", otherViews, catAxis));
                if (G.DataZeroOrEmpty(otherViews))
                    G.AppendChartMask("#UserBlahActivityViewsDiv", "No activity in this time period.");
                else
                    G.AppendChartMask("#UserBlahActivityViewsDiv", "");

                $('#UserBlahActivityOpensDiv').highcharts(stats.MakeStatChartOptions("Posts Opened", otherOpens, catAxis));
                if (G.DataZeroOrEmpty(otherOpens))
                    G.AppendChartMask("#UserBlahActivityOpensDiv", "No activity in this time period.");
                else
                    G.AppendChartMask("#UserBlahActivityOpensDiv", "");

                $('#UserBlahActivityCommentsDiv').highcharts(stats.MakeStatChartOptions("Comments", otherComments, catAxis));
                if (G.DataZeroOrEmpty(otherComments))
                    G.AppendChartMask("#UserBlahActivityCommentsDiv", "No activity in this time period.");
                else
                    G.AppendChartMask("#UserBlahActivityCommentsDiv", "");

                $('#UserBlahSentimentDiv').highcharts({
                    chart: {
                        backgroundColor: 'transparent'
                    },
                    colors: ["#7ad000", "#f87858"],
                    title: {
                        text:"User Sentiment",
                        align:"left",
                        style:{fontFamily:"Arimo"}
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    credits: {
                        enabled:false
                    },
                    xAxis: {
                        categories: catAxis
                    },
                    tooltip: {
                        enabled: false
                    },
                    yAxis: [{
                        title: { text: "votes"},
                        minRange:10
                    }],
                    series: [
                        {
                            type: 'areaspline',
                            data: otherUpVotes,
                            name: "promotes"
                        } ,
                        {
                            type: 'areaspline',
                            data: reverseDown,
                            name: "demotes"
                        }]
                });
                G.AppendChartMask("#UserBlahSentimentDiv", "");

                var showLegend = true;

                showLegend = stats.MaybeShowDemoChart(G.CurrentUser, "#DemoGenderChartArea", "Gender", "B", showLegend);
                showLegend = stats.MaybeShowDemoChart(G.CurrentUser, "#DemoEthnicityChartArea", "Ethnicity", "D", showLegend);
                showLegend = stats.MaybeShowDemoChart(G.CurrentUser, "#DemoAgeChartArea", "Age", "C", showLegend);
                showLegend = stats.MaybeShowDemoChart(G.CurrentUser, "#DemoCountryChartArea", "Country", "J", showLegend);
                stats.MaybeShowDemoChart(G.CurrentUser, "#DemoIncomeChartArea", "Income", "E", showLegend);


            }, function (theErr) {
                // indicate that the stats are not available
                var sorryText = "<div>Sorry, stats are not available now.</div>";
                $("#UserStandingDiv").append(sorryText);
                $("#UserActivityDiv").append(sorryText);
                $("#UserBlahActivityDiv").append(sorryText);
                $("#UserStatsTable").append("<tr><td>" + sorryText + "</td></tr>");

            });
            // headers
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
        };

        return {
            InitializePage: InitializePage
        }
    }
);