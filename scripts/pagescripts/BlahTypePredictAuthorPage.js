/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePredictAuthorPage',
    ["ExportFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var validateCallback = null;

        var  InitializePage = function(callback) {
            validateCallback = callback;
            $("#PredictionEndDateInput").change(validateCallback);

        };

        var PrepareCreateBlahJSON = function() {
            var options = new Object();
            var theDateStr = $("#PredictionEndDateInput").val();
            var theDate = new Date(theDateStr);
            options["E"] = theDate;

            return options;
        };

        var ValidateCreate = function() {
            var msg = "";
            var theDateStr = $("#PredictionEndDateInput").val();
            if (theDateStr == "")
                msg = "Predictions must have a date.  ";
            else {
                var theDate = new Date(theDateStr);

                if (theDate <= Date.now())
                    msg = "Predictions must be in the future."
            }

            return msg;
        }


        return {
            InitializePage: InitializePage,
            ValidateCreate: ValidateCreate,
            PrepareCreateBlahJSON: PrepareCreateBlahJSON
        }
    }
);