/**
 * Created by Dave on 12/8/2014.
 */

define('ViewGroupPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var newChannel = null;

        var InitializePage = function(theGroup) {
            this.newChannel = theGroup;
            $(G.BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.ShowMangeChannelsUI(newChannel);
            });

            $("#BlahFullItem").show();

            $(".fullBlahgerName").text(theGroup.N);



        };





        return {

            InitializePage: InitializePage
        }
    }
);