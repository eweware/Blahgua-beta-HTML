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

            // bind the methods

            // handle the sizing
            var curTop = document.getElementById("FullBlahContent").getBoundingClientRect().top;
            var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
            var maxSize = curBottom - curTop;
            $("#FullBlahContent").css({ 'max-height': maxSize + 'px'});

            $('.accordion h2').click(function(theEvent) {
                $(".accordion-content").hide();
                $(this.parentElement).find(".accordion-content").show() ;
            });

            UpdateBlahStats();


        };

        var UpdateBlahStats = function() {

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
