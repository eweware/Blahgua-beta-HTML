/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahStatsDetailPage',
    [
        "GlobalFunctions",
        "blahgua_restapi",
        "stats"
    ],
    function (exports, blahgua_rest, stats) {

        var InitializePage = function (){

            // bind the methods

            // handle the sizing
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


            if (IsUserLoggedIn && (UserProfile == null)) {
                blahgua_rest.GetUserProfile(CurrentUser._id, function(json) {
                    UserProfile = json;
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
            var startDate = new Date(Date.now() - (numStatsDaysToShow * (24 * 3600 * 1000)));

            var startDateStr = createDateString(startDate);
            var endDateStr = createDateString(endDate);
            blahgua_rest.GetBlahWithStats(CurrentBlah._id, startDateStr, endDateStr, function(json) {
                CurrentBlah = json;
                UpdateBlahStats();
            }, function(theErr) {
                // can't actually show stats...
                UpdateBlahStats();
            });
        };

        var UpdateBlahStats = function() {
            // Overall Standing
            var curStats = getSafeProperty(CurrentBlah,"L", null);
            var curStr = getSafeProperty(CurrentBlah, "S", 0);
            var recentStr = getSafeProperty(CurrentBlah, "R", 0);
            var uv = getSafeProperty(CurrentBlah, "P", 0);
            var dv = getSafeProperty(CurrentBlah, "D", 0);

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

            if ((uv > 0) || (dv > 0)) {
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
                        minorTickInterval:1
                    },

                    series: [{
                        type: 'bar',
                        data: [{color: '#00FF00', y: uv},
                            {color: '#FF0000', y: dv}]

                    }]
                });
            }


            // Audience Engagement
            if (curStats && curStats.length > 0) {
                var endDate = new Date(Date.now());
                var startDate = new Date(Date.now() - (numStatsDaysToShow * (24 * 3600 * 1000)));
                var viewData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, CurrentBlah, "V");
                var openData = stats.GetDailyStatValuesForTimeRange(startDate, endDate, CurrentBlah, "O");
                var commentsMade = stats.GetDailyStatValuesForTimeRange(startDate, endDate, CurrentBlah, "C");
                var catAxis = stats.makeDateRangeAxis(startDate, endDate);

                $('#BlahActivityDiv').empty().highcharts({
                    title: {
                        text:"Audience Activity"
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
                        data: viewData,
                        name: "#blahs viewed"
                    },
                        {
                            type: 'areaspline',
                            data: openData,
                            name: "#blahs opened"
                        } ,

                        {
                            type: 'column',
                            data: commentsMade,
                            name: "#comments",
                            yAxis: 1
                        }]
                });
            }


            // Voter Demographics
            if (IsUserLoggedIn && UserProfile.hasOwnProperty("B") && (UserProfile["B"] != -1))
                $("#DemoGenderChartArea").highcharts(stats.MakeDemoChartOptions(CurrentBlah, "Gender", "B"));
            else
                $("#DemoGenderChartArea").html(stats.GenerateShareDemoHTML("Gender", "B"));

            if (IsUserLoggedIn && UserProfile.hasOwnProperty("D") && (UserProfile["D"] != -1))
                $("#DemoEthnicityChartArea").highcharts(stats.MakeDemoChartOptions(CurrentBlah, "Ethnicity", "D"));
            else
                $("#DemoEthnicityChartArea").html(stats.GenerateShareDemoHTML("Ethnicity", "D"));

            /*
             if (IsUserLoggedIn && UserProfile.hasOwnProperty("C") && (UserProfile["C"] != -1))
             $("#DemoGenderChartArea").highcharts(MakeDemoChartOptions(CurrentBlah, "Age", "C"));
             else
             $("#DemoGenderChartArea").html(GenerateShareDemoHTML("Age", "C"));
             */

            if (IsUserLoggedIn && UserProfile.hasOwnProperty("J") && (UserProfile["J"] != -1))
                $("#DemoCountryChartArea").highcharts(stats.MakeDemoChartOptions(CurrentBlah, "Country", "J"));
            else
                $("#DemoCountryChartArea").html(stats.GenerateShareDemoHTML("Country", "J"));

        };


        var CreateDemoData = function(whichDemo) {
            var curResult = [];
            var curData;
            var curIndexName;
            var o, p,c;
            if (CurrentBlah.hasOwnProperty('_d') && (ProfileSchema != null)) {
                for(curIndex in ProfileSchema[whichDemo].DT) {
                    curData = new Object();
                    curIndexName = ProfileSchema[whichDemo].DT[curIndex];
                    curData.name = curIndexName;
                    curData.data = [];
                    o = getSafeProperty(CurrentBlah._d._o[whichDemo], curIndex,0);
                    p = getSafeProperty(CurrentBlah._d._u[whichDemo], curIndex,0);
                    c = getSafeProperty(CurrentBlah._d._c[whichDemo], curIndex,0);
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
