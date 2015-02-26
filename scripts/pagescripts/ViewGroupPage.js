/**
 * Created by Dave on 12/8/2014.
 */

define('ViewGroupPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {



        var InitializePage = function(theGroup) {
            $(G.BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.CloseBlah();
            });

            $("#BlahFullItem").show();

            $(".fullBlahgerName").text(theGroup.N);



        };





        return {

            InitializePage: InitializePage
        }
    }
);