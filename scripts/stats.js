/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/13/13
 * Time: 4:36 PM
 * To change this template use File | Settings | File Templates.
 */


define('stats',
    ["globals" ],
    function (G) {

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
            var statStr;

            if (statsObj.L.hasOwnProperty("dy")) {
                // monthly stat
                statStr = G.CreateDateString(date, true);
                for (var index in statsObj.L) {
                    item = statsObj.L[index];
                    if (item._id.substring(item._id.length - 4) == statStr) {
                        // found the month
                        statVal = item.dy[date.getDate() - 1][stat];
                        break;
                    }
                }
            } else {
                // daily stat
                statStr = G.CreateDateString(date);
                for (var index in statsObj.L) {
                    var theItem = statsObj.L[index];

                    if (theItem.dy) {
                        // monthly stat
                        statStr = G.CreateDateString(date, true);
                        if (theItem._id.substring(theItem._id.length - 4) == statStr) {
                            // found the month
                            statVal = theItem.dy[date.getDate() - 1][stat];
                            break;
                        }
                    } else if (theItem._id.substring(theItem._id.length - 6) == statStr) {
                        // found the day
                        statVal = theItem[stat];
                        break;
                    }
                }
            }


            return statVal;
        };


        var MakeDemoSeries = function(whichObject, whichDemo) {
            // one series for upVote and downVote
            // one data point for each unique value of the demo
            var newSeries;
            var catLabels = [];
            if ( G.ProfileSchema.hasOwnProperty(whichDemo) &&
                G.ProfileSchema[whichDemo].hasOwnProperty("DT")) {
                catLabels = G.ProfileSchema[whichDemo].DT;
            } else if (whichDemo == "C") {
                // hardwire age for now
                //catLabels = {0: "65 & up", 1: "55-64", 2: "45-54", 3: "35-44", 4: "25-34", 5: "18-24", 6: "under 18", "-1": "Unspecified"}
                catLabels = {6: "under 18", 5: "18-24", 4: "25-34", 3: "35-44", 2: "45-54", 1: "55-64", 0: "65 & up", "-1": "Unspecified"}
            }

            var upVoteSet, downVoteSet;

            if (whichObject.hasOwnProperty("_d")) {
                upVoteSet = G.GetSafeProperty(whichObject._d._u, whichDemo, null);
                downVoteSet = G.GetSafeProperty(whichObject._d._d, whichDemo, null);
            } else {
                upVoteSet = new Object();
                downVoteSet = new Object();
            }
            var upData = [], downData = [];

            $.each(catLabels, function(index, item){
                upData.push(G.GetSafeProperty(upVoteSet, index, 0));
                downData.push(G.GetSafeProperty(downVoteSet, index, 0));
            });

            newSeries = [
                {"data":downData,"name":"demotes"},
                {"data":upData,"name":"promotes"}];

            return newSeries;
        };

        var MakeDemoCategories = function(whichDemo) {
            var catArray = [];

            if (G.ProfileSchema.hasOwnProperty(whichDemo) &&
                G.ProfileSchema[whichDemo].hasOwnProperty("DT")) {
                $.each(G.ProfileSchema[whichDemo].DT, function(index, item){
                    catArray.push(item);
                });
            } else if (whichDemo == "C") {
                // hardwire age for now
                //catArray = ["65 and over", "55-64", "45-54", "35-44", "25-34", "18-24", "under 18", "unspecified"];
                catArray = ["under 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65 and over", "unspecified"];
            }



            return catArray;
        };

        var GenerateShareDemoHTML = function(demoString, demoName) {
            var newHTML = "";

            newHTML += "<div class='request-demographic'>";
            newHTML += "<div>Set your profile " + demoString + " to see that of the audience.</div>";
            newHTML += "</div>";
            return newHTML;
        };

        var MakeStatChartOptions = function(chartTitle, chartData, catAxis) {
            var maxVal = GetMaxGraphRange(chartData, 4, 1.2);
            var newStats = {
                title: {
                    text:chartTitle,
                    align:"left",
                    style:{fontFamily:"Arimo"}
                },
                colors: ["#7db5e3"],
                chart: {
                    backgroundColor: 'transparent'
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
                legend: {
                    enabled: false
                },
                xAxis: {
                    categories: catAxis,
                    tickPixelInterval: 150
                },
                yAxis: {
                    min:0,
                    max:maxVal,
                    title: {text:null},
                    gridLineColor: 'transparent',
                    lineWidth:1
                },
                series: [{
                    type: 'areaspline',
                    data: chartData
                }]
            };

            return newStats;
        };

        var GetMaxGraphRange = function(series, minVal, incVal) {
            var max = minVal;

            if ((series[0] != undefined) && series[0].hasOwnProperty("data")) {
                // nested array
                var curArray, curMax;
                var arrayRank = series[0].data.length;

                for (var curIndex in series[0].data) {
                    curMax = 0;
                    for (var curSubItem in series)  {
                        curMax += series[curSubItem].data[curIndex];
                    }
                    if (curMax > max)
                        max == curMax;
                }
            }  else {
                for (var curVal in series) {
                    if (series[curVal] > max)
                        max = series[curVal];

                }
            }


            max *= incVal;
            return Math.ceil((max));
        };


        var MakeDemoChartOptions = function(targetObject, demoString, demoName) {
            var demoSeries = MakeDemoSeries(targetObject, demoName);
            var demoCat = MakeDemoCategories(demoName);
            var chartHeight = 125 + (25 * demoCat.length);
            var lineCount = 1;
            var textAngle = 0;
            var alignStr = "center";

            if (demoCat.length > 6)
                lineCount = 2;

            if (G.IsNarrow) {
                lineCount = 1;
                textAngle = -90;
                alignStr = "right";
            }
            var maxVal = GetMaxGraphRange(demoSeries, 4, 1.2);
            var newDemos = {
                chart: {
                    type: "column",
                    backgroundColor: 'transparent'
                },
                colors: ['#f87858', '#7ad000'],
                title: {
                    text:demoString,
                    align:"left",
                    style:{fontFamily:"Arimo"}
                },
                xAxis: {
                    categories:demoCat,
                    labels: {
                        staggerLines: lineCount,
                        align: alignStr,
                        rotation: textAngle
                    }
                },
                plotOptions: {
                    column: {
                        borderWidth: 0
                    },
                    series: {
                        stacking: 'normal',
                        marker: {
                            enabled: false
                        }
                    }
                },
                credits: {
                    enabled:false
                },

                yAxis: {
                    min:0,
                    max: maxVal,
                    title: {text:null},
                    gridLineColor: 'transparent',
                    lineWidth:1
                },
                series: demoSeries
            };

            return newDemos
        };

        var MaybeShowDemoChart = function(targetObject, DivName, DemoName, demoProp, legendNeeded) {
            if (G.UserProfile.hasOwnProperty(demoProp) && (G.UserProfile[demoProp] != -1)) {
                var options = MakeDemoChartOptions(targetObject, DemoName, demoProp, legendNeeded);
                if (!legendNeeded)
                    options["legend"] = {"enabled": false };
                $(DivName).highcharts(options);
                legendNeeded = false;
                if (G.DataZeroOrEmpty(options.series[0].data) && G.DataZeroOrEmpty(options.series[1].data))
                    G.AppendChartMask(DivName, "No votes from users who have shared their " + DemoName + ".");
                else
                    G.AppendChartMask(DivName, "");
            }
            else {
                $(DivName).html(GenerateShareDemoHTML(DemoName, demoProp));
            }
            return legendNeeded;
        };


        return {
            MaybeShowDemoChart: MaybeShowDemoChart,
            GetDailyStatValuesForTimeRange: GetDailyStatValuesForTimeRange,
            makeDateRangeAxis: makeDateRangeAxis,
            GetStatValue: GetStatValue,
            MakeDemoSeries: MakeDemoSeries,
            MakeDemoCategories: MakeDemoCategories ,
            MakeDemoChartOptions: MakeDemoChartOptions,
            GenerateShareDemoHTML: GenerateShareDemoHTML,
            MakeStatChartOptions: MakeStatChartOptions
        }
    }
);