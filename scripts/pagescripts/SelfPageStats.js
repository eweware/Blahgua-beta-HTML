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
                    title: {
                        text:null
                    },
                    legend: {
                        enabled:false
                    },
                    credits: {
                        enabled:false
                    },
                    xAxis: {
                        categories: ['Strength', 'Controversy']
                    },
                    yAxis: {
                        min:0,
                        max:100,
                        title: { text: null}
                    },
                    series: [{
                        type: 'bar',
                        data: [{color: '#FF0000', y: userStrength * 100},
                            {color: '#0000FF', y: userContro * 100}]
                    }]
                });


                // Your Activity
                var viewData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["v", "V"]);
                var openData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["o", "O"]);
                var blahsMade = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "X");
                var commentsMade  = stats.GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "XX");
                var catAxis = stats.makeDateRangeAxis(startDate, endDate);

                $('#UserActivityDiv1').highcharts({
                    title: {
                        text:null
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        enabled:false
                    },
                    xAxis: {
                        categories: catAxis
                    },
                    yAxis: {
                        min:0,
                        title: { text: "posts opened"}
                    },
                    series: [{
                        type: 'areaspline',
                        data: openData,
                        name: "#blahs opened"
                    }]
                });

                $('#UserActivityDiv2').highcharts({
                    title: {
                        text:null
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
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        categories: catAxis
                    },
                    yAxis: {
                        min:0,
                        endOnTick: true,
                        title: { text: "posts created"}
                    },
                    series: [
                        {
                            type: 'column',
                            data: blahsMade,
                            name: "#blahs"
                        }]
                });

                $('#UserActivityDiv3').highcharts({
                    title: {
                        text:"Comments Created",
                        align:left,
                        style:{fontFamily:"Arimo"}
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        enabled:false
                    },
                    xAxis: {
                        categories: catAxis
                    },
                    yAxis: {
                        min:0,
                        endOnTick: true,
                        title: {text:null}
                    },
                    series: [
                        {
                            type: 'column',
                            data: commentsMade
                        }]
                });

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


                $('#UserBlahActivityDiv').highcharts({
                    title: {
                        text:"User Engagement"
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
                    yAxis: [{
                        min:0,
                        title: { text: "views & opens"}
                    },  {
                        min:0,
                        opposite: true,
                        endOnTick: true,
                        title: { text: "creation"}
                    }],
                    series: [{
                        type: 'areaspline',
                        data: otherViews,
                        name: "#blahs viewed"
                    },
                        {
                            type: 'areaspline',
                            data: otherOpens,
                            name: "#blahs opened"
                        } ,
                        {
                            type: 'column',
                            data: otherComments,
                            name: "#comments",
                            yAxis: 1
                        }]
                });

                $('#UserBlahSentimentDiv').highcharts({
                    colors: ["#00FF00", "#FF0000"],
                    title: {
                        text:"User Sentiment"
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
                    yAxis: [{
                        title: { text: "votes"}
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

                // Your Audience Demographics
                if (G.UserProfile.hasOwnProperty("B") && (G.UserProfile["B"] != -1))
                    $("#DemoGenderChartArea").highcharts(stats.MakeDemoChartOptions(G.CurrentUser, "Gender", "B"));
                else
                    $("#DemoGenderChartArea").html(stats.GenerateShareDemoHTML("Gender", "B"));

                if (G.UserProfile.hasOwnProperty("D") && (G.UserProfile["D"] != -1))
                    $("#DemoEthnicityChartArea").highcharts(stats.MakeDemoChartOptions(G.CurrentUser, "Ethnicity", "D"));
                else
                    $("#DemoEthnicityChartArea").html(stats.GenerateShareDemoHTML("Ethnicity", "D"));

                /*
                 if (UserProfile.hasOwnProperty("C") && (UserProfile["C"] != -1))
                 $("#DemoGenderChartArea").highcharts(MakeDemoChartOptions(CurrentUser, "Age", "C"));
                 else
                 $("#DemoGenderChartArea").html(GenerateShareDemoHTML("Age", "C"));
                 */

                if (G.UserProfile.hasOwnProperty("J") && (G.UserProfile["J"] != -1))
                    $("#DemoCountryChartArea").highcharts(stats.MakeDemoChartOptions(G.CurrentUser, "Country", "J"));
                else
                    $("#DemoCountryChartArea").html(stats.GenerateShareDemoHTML("Country", "J"));



                // your stats


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