/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahStatsDetailPage',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        function InitializePage() {
            // blah popularity over time
            $('#BlahStrengthDiv').highcharts({
                chart: {
                    type: 'area'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Popularity'
                },
                yAxis: {
                    title: {
                        text: 'strength'
                    }
                },
                series: [{
                    data: [1, 2,3,4,5,6,7,8,9,10]
                }]
            });

            // opens, views, comments
            $('#ViewChartDiv').highcharts({
                chart: {
                    type: 'line'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Views, Opens, and Comments'
                },
                yAxis: {
                    title: {
                        text: 'Count'
                    }
                },
                series: [{
                    name: 'views',
                    data: [1, 0, 4]
                }, {
                    name: 'opens',
                    data: [5, 7, 3]
                }, {
                    name: 'comments',
                    data: [5, 7, 3]
                }]
            });

            // demos
            var BlahGenderData = CreateDemoData("B");
            var BlahRaceData = CreateDemoData("D");
            var BlahIncomeData = CreateDemoData("E");
            var BlahAgeData = CreateDemoData("C");


            $('#BlahOpenChartDiv').highcharts({
                chart: {
                    type: 'bar'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Gender'
                },
                xAxis: {
                    categories: ['Open', 'Promote', 'Comment']
                },
                yAxis: {
                    title: {
                        text: 'count'
                    }
                },
                series: BlahGenderData
            });

            // comments
            $('#BlahCommentChartDiv').highcharts({
                chart: {
                    type: 'bar'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Race'
                },
                xAxis: {
                    categories: ['Open', 'Promote', 'Comment']
                },
                yAxis: {
                    title: {
                        text: 'count'
                    }
                },
                series: BlahRaceData
            });

            // Promotes
            $('#BlahPromoteChartDiv').highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Age'
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    categories: ['Open', 'Promote', 'Comment']
                },
                yAxis: {
                    title: {
                        text: 'count'
                    }
                },
                series: BlahAgeData
            });

            // demotes
            $('#BlahDemoteChartDiv').highcharts({
                chart: {
                    type: 'bar'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: 'Income'
                },
                xAxis: {
                    categories: ['Open', 'Promote', 'Comment']
                },
                yAxis: {
                    title: {
                        text: 'count'
                    }
                },
                series: BlahIncomeData
            });
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
        }

        return {
            InitializePage: InitializePage
        }
    }
);
