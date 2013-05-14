/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePollAuthorPage',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var  InitializePage = function() {

        };

        var PrepareCreateBlahJSON = function() {
            var pollItems = [];
            var curPollItem;
            var pollDivs = document.getElementsByName("PollItem");
            for (i = 0; i < pollDivs.length; i++) {
                curPollItem = new Object();
                curPollItem["G"] = pollDivs[i].childNodes[0].value;
                curPollItem["T"] = pollDivs[i].childNodes[2].value;
                pollItems.push(curPollItem);
            }
            options = new Object();
            options["I"] = pollItems;

            return options;
        };

        return {
            InitializePage: InitializePage,
            PrepareCreateBlahJSON: PrepareCreateBlahJSON
        }
    }
);