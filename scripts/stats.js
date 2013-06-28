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

        /*
         $(function () {
         $('#container').highcharts({
         "chart":  {"type":"column"},
         "title":{"text":"Ethnicity"},
         "xAxis":{
         "categories":             ["Promote","Demote"]},
         "plotOptions":{"series":{"stacking":"normal",
         "marker":{"enabled":false}}},
         "credits":{"enabled":false},
         "yAxis":[{"minRange":10, min:0,"title":{"text":null}}],
         "series":[
         {"data":[1,10],"name":"Asian"},
         {"data":[4,2],"name":"Black"},
         {"data":[8,22],"name":"Hispanic"},
         {"data":[13,5],"name":"White"},
         {"data":[8,8],"name":"Other"},
         {"data":[29,13],"name":"Unspecified"}]} );
         });

         */

        var MakeDemoSeries = function(whichObject, whichDemo) {
            // one series for upVote and downVote
            // one data point for each unique value of the demo
            var newSeries;
            if (whichObject.hasOwnProperty("_d")) {
                var upVoteSet = G.GetSafeProperty(whichObject._d._u, whichDemo, null);
                var downVoteSet = G.GetSafeProperty(whichObject._d._d, whichDemo, null);
                var upData = [], downData = [];

                $.each(G.ProfileSchema[whichDemo].DT, function(index, item){
                    upData.push(G.GetSafeProperty(upVoteSet, index, 0));
                    downData.push(-G.GetSafeProperty(downVoteSet, index, 0));
                });

                newSeries = [
                    {"data":downData,"name":"demotes"},
                    {"data":upData,"name":"promotes"}];
            } else {
                newSeries = [];
            }

            return newSeries;
        };

        var MakeDemoCategories = function(whichDemo) {
            var catArray = [];
            /*
            $.each(G.ProfileSchema[whichDemo].DT, function(index, item){
                catArray.push(item);
            });
            */
            catArray = ["Promotes", "Demotes"];

            return catArray;
        };

        var GenerateShareDemoHTML = function(demoString, demoName) {
            var newHTML = "";

            newHTML += "<div class='request-demographic'>";
            newHTML += "Set your profile " + demoString + " to see that of the audience";
            newHTML += "</div>";
            return newHTML;
        };

        var MakeDemoChartOptions = function(targetObject, demoString, demoName) {
            var demoSeries = MakeDemoSeries(targetObject, demoName);
            var demoCat = MakeDemoCategories(demoName);
            var chartHeight = 125 + (25 * demoCat.length);

            var newDemos = {
                chart: {
                    type: "column",
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
                    }
                },
                credits: {
                    enabled:false
                },

                yAxis: [{
                    minRange:10,
                    minorTickInterval:1,
                    title: { text: null}
                }],
                series: demoSeries
            };

            return newDemos
        };


        return {
            GetDailyStatValuesForTimeRange: GetDailyStatValuesForTimeRange,
            makeDateRangeAxis: makeDateRangeAxis,
            GetStatValue: GetStatValue,
            MakeDemoSeries: MakeDemoSeries,
            MakeDemoCategories: MakeDemoCategories ,
            MakeDemoChartOptions: MakeDemoChartOptions,
            GenerateShareDemoHTML: GenerateShareDemoHTML
        }
    }
);