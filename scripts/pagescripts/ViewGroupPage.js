/**
 * Created by Dave on 12/8/2014.
 */

define('ViewGroupPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var newChannel = null;
        var perms = null;

        var InitializePage = function(theGroup) {
            this.newChannel = theGroup;
            $(G.BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.ShowMangeChannelsUI(newChannel);
            });

            $("#BlahFullItem").show();

            $(".fullBlahgerName").text(theGroup.N);

            blahgua_rest.GetChannelPermissionById(theGroup._id, function(thePerms)
            {
                perms = thePerms;
                if (perms.admin) {
                    $("#AdminPanel").show();
                }
                else
                    $("#AdminPanel").hide();
            })

            $("#LoadRSSBtn").click(HandleRSSLoad);

            $("#ImportDataBtn").click(HandleRSSImport);

        };


        var HandleRSSLoad = function (theEvent) {
            var theURL = $("#RSSURLfield").val();
            $.ajax({
                url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(theURL),
                dataType: 'json',
                success: function(data) {
                    //console.log(data.responseData.feed);
                    $("#RSSBody").html('<tr><td colspan="2">'+ data.responseData.feed.title +'</td></tr>');

                    $.each(data.responseData.feed.entries, function(key, value){
                        var thehtml = '<tr><td colspan="2"><a href="'+value.link+'" target="_blank">'+value.title+'</a></td></tr>';
                        $("#RSSBody").append(thehtml);
                    });
                    var theItems = $("#RSSBody a");

                    $.each(theItems, function (theKey, theVal) {
                        var curHRef = theVal.href;
                        if (curHRef != "") {
                            $.ajax({
                                url: 'http://api.embed.ly/1/extract?key=400ca94d281f4b77b94b351c345d6ba8&maxwidth=500&url=' + encodeURIComponent(curHRef),
                                dataType: 'json',
                                success: function(theObject) {
                                    $(theVal).title="done";
                                }

                            });
                        }
                    });
                }
            });
        };

        var HandleRSSImport = function (theEvent) {


        };


        return {

            InitializePage: InitializePage
        }
    }
);