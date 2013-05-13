/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPageStats',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var  InitializePage = function() {
            UpdateSelfStats();
        };

        var UpdateSelfStats = function() {
            // load the stats
            var endDate = new Date(Date.now());
            var startDate = new Date(Date.now() - (numStatsDaysToShow * (24 * 3600 * 1000)));

            var start = createDateString(startDate);
            var end = createDateString(endDate);
            blahgua_rest.GetUserStats(start, end, function(statsObj) {
                // refresh all of the stat markets and charts

                // Overall standings
                var userStrength = getSafeProperty(statsObj, 'S', 0);
                var userContro = getSafeProperty(statsObj, 'K', 0);

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
                var viewData = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["v", "V"]);
                var openData = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["o", "O"]);
                var blahsMade = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "X");
                var commentsMade  = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "XX");
                var catAxis = makeDateRangeAxis(startDate, endDate);

                $('#UserActivityDiv').highcharts({
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
                            data: blahsMade,
                            name: "#blahs",
                            yAxis: 1
                        },
                        {
                            type: 'column',
                            data: commentsMade,
                            name: "#comments",
                            yAxis: 1
                        }]
                });

                // Your Blahs and Comments
                var otherUpVotes = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "T" );
                var otherDownVotes = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj,"DT");
                var otherViews = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "V");
                var otherOpens  = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "O");
                var otherComments  = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "C");

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
                if (UserProfile.hasOwnProperty("B") && (UserProfile["B"] != -1))
                    $("#DemoGenderChartArea").highcharts(MakeDemoChartOptions("Gender", "B"));
                else
                    $("#DemoGenderChartArea").html(GenerateShareDemoHTML("Gender", "B"));

                if (UserProfile.hasOwnProperty("D") && (UserProfile["D"] != -1))
                    $("#DemoEthnicityChartArea").highcharts(MakeDemoChartOptions("Ethnicity", "D"));
                else
                    $("#DemoEthnicityChartArea").html(GenerateShareDemoHTML("Ethnicity", "D"));

                /*
                 if (UserProfile.hasOwnProperty("C") && (UserProfile["C"] != -1))
                 $("#DemoGenderChartArea").highcharts(MakeDemoChartOptions("Age", "C"));
                 else
                 $("#DemoGenderChartArea").html(GenerateShareDemoHTML("Age", "C"));
                 */

                if (UserProfile.hasOwnProperty("J") && (UserProfile["J"] != -1))
                    $("#DemoCountryChartArea").highcharts(MakeDemoChartOptions("Country", "J"));
                else
                    $("#DemoCountryChartArea").html(GenerateShareDemoHTML("Country", "J"));



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
                $(".accordion-content").hide();
                $(this.parentElement).find(".accordion-content").show() ;

            });
        };

        var GenerateShareDemoHTML = function(demoString, demoName) {
            var newHTML = "";

            newHTML += "<div class='request-demographic'>";
            newHTML += "You need to set your own " + demoString + " on the user profile page in order to see the " + demoString + " of other users.";
            newHTML += "</div>";
            return newHTML;
        };

        var MakeDemoChartOptions = function(demoString, demoName) {
            var demoSeries = MakeDemoSeries(demoName);
            var demoCat = MakeDemoCategories(demoName);
            var chartHeight = 125 + (25 * demoCat.length);

            var newDemos = {
                colors: ["#FF0000", "#00FF00"],
                chart: {
                    type: "bar",
                    height:chartHeight
                },
                title: {
                    text:demoString
                },
                xAxis: {
                    categories:demoCat
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        marker: {
                            enabled: false
                        }
                    },
                    bar : {
                        pointPadding:0,
                        groupPadding:0
                    }
                },
                credits: {
                    enabled:false
                },

                yAxis: [{
                    title: { text: "votes"}
                }],
                series: demoSeries
            };

            return newDemos
        };


        var MakeDemoCategories = function(whichDemo) {
            var catArray = [];
            $.each(ProfileSchema[whichDemo].DT, function(index, item){
                catArray.push(item);
            });

            return catArray;
        };

        var MakeDemoSeries = function(whichDemo) {
            // one series for upVote and downVote
            // one data point for each unique value of the demo
            var newSeries;
            if (CurrentUser.hasOwnProperty("_d")) {
                var upVoteSet = getSafeProperty(CurrentUser._d._u, whichDemo, null);
                var downVoteSet = getSafeProperty(CurrentUser._d._d, whichDemo, null);
                var upData = [], downData = [];

                $.each(ProfileSchema[whichDemo].DT, function(index, item){
                    upData.push(getSafeProperty(upVoteSet, index, 0));
                    downData.push(-getSafeProperty(downVoteSet, index, 0));
                });

                newSeries = [
                    {"data":downData,"name":"demotes"},
                    {"data":upData,"name":"promotes"}];
            } else {
                newSeries = [];
            }

            return newSeries;
        };


        var GetDailyStatValuesForTimeRange = function(startTime, endTime, statsObj, statName) {
            var startMonth, startDay, newVal;
            var results = [];

            startMonth = startTime.getMonth();
            startDay = startTime.getDate();
            statName = [].concat(statName); // ensure array

            while (startTime <= endTime) {
                newVal = 0;
                for (var curStat in statName) {
                    newVal += GetStatValue(statsObj, startTime, statName[curStat]);
                }

                results.push(newVal);

                startTime = new Date(startTime.getTime() + 3600 * 24 * 1000); // add one day
                startMonth = startTime.getMonth();
                startDay = startTime.getDate();
            }

            return results;
        };

        var makeDateRangeAxis = function(startDate, endDate) {
            var newCat = [];


            while (startDate <= endDate) {
                newStr = startDate.getMonth() + 1 + "/" + startDate.getDate();
                newCat.push(newStr);
                startDate = new Date(startDate.getTime() + (24 * 3600 * 1000));
            }

            return newCat;
        };

        var GetStatValue = function(statsObj, date, stat) {
            var statVal = 0, item = 0;
            var statStr = createDateString(date, true);
            for (var index in statsObj.L) {
                item = statsObj.L[index];
                if (item._id.substring(item._id.length - 4) == statStr) {
                    // found the month
                    statVal = item.dy[date.getDate() - 1][stat];
                    break;
                }
            }
            return statVal;
        };

        return {
            InitializePage: InitializePage
        }
    }
);