/**
 * Created by Dave on 12/8/2014.
 */

define('CreateGroupPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {



        var InitializePage = function(theGroupType) {
            $(G.BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.CloseBlah();
            });

            $("#BlahFullItem").show();



        };





        return {

            InitializePage: InitializePage
        }
    }
);