/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePredictAuthorPage',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var  InitializePage = function() {

        };

        var PrepareCreateBlahJSON = function() {
            var options = new Object();
            var theDateStr = $("#PredictionEndDateInput").val();
            var theDate = new Date(theDateStr);
            options["E"] = theDate;

            return options;
        };

        return {
            InitializePage: InitializePage,
            PrepareCreateBlahJSON: PrepareCreateBlahJSON
        }
    }
);