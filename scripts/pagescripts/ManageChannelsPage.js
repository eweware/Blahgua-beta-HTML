/**
 * Created by Dave on 12/8/2014.
 */

define('ManageChannelsPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {



        var RefreshContent = function(message) {
            $("#BlahFullItem").show();


        };



        return {

            RefreshContent: RefreshContent
        }
    }
);