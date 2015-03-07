/**
 * Created by Dave on 12/8/2014.
 */

define('ViewGroupPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var newChannel = null;
        var perms = null;
        var channelImporters = null;
        var curImporter = null;

        var InitializePage = function(theGroup) {
            newChannel = theGroup;
            $(G.BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.ShowMangeChannelsUI(newChannel);
            });

            $("#BlahFullItem").show();

            $(".fullBlahgerName").text(theGroup.N);

            $("#CreateImporterBtn").click(function(theEvent) {
               // create a new importer
                ClearImporterArea();
                curImporter = new Object();
                curImporter.channel = newChannel._id;
                curImporter.feedtype = 0;
                curImporter.autoimport = false;
                curImporter.importfrequency = 0;
                curImporter.importusername = "";
                curImporter.importpassword = "";
                curImporter.importasuser = false;

                curImporter.RSSUrl = "<rss url>";
                curImporter.summarizepage = true;
                curImporter.appendurl = true;
                curImporter.urlfield = "url";
                curImporter.titlefield = "title";
                curImporter.bodyfield = "description";
                curImporter.imagefield = "images[0].url";

                PopulateActivityFeedArea();
            });

            $('.accordion h2').click(function(theEvent) {
                var parent = $(this).parent('.accordion');
                if (parent.hasClass("active")) {
                    // close it
                    parent.removeClass("active");
                } else {
                    // open it and close others
                    $(".active").removeClass("active");
                    parent.addClass("active");
                    this.scrollIntoView(true);
                }
            });


            blahgua_rest.GetChannelPermissionById(theGroup._id, function(thePerms)
            {
                perms = thePerms;
                if (perms.admin) {
                    $("#AdminPanel").show();

                    // load in the channel Importers
                    blahgua_rest.GetChannelImporters(theGroup._id, function(theImporters)
                    {
                        channelImporters = theImporters;
                        $("#ImportersList tbody").html(""); // clear

                        if ((channelImporters != null) && (channelImporters.length > 0)) {
                            $.each(channelImporters, function (key, value) {
                                // do something with them,...
                                var theHTML = "<tr><td>";
                                theHTML += "<span data-item='" + key + "'>" + value.urlfield + "</span>";
                                theHTML += "</td></tr>";
                                $("#ImportersList tbody").append(theHTML);
                            });

                            $("#ImportersList span").click(function (theEvent) {
                                var theItemIndex = $(this).attr("data-item");
                                curImporter = channelImporters[theItemIndex];

                                PopulateActivityFeedArea();
                            });
                        } else {
                            var theHTML = "<tr><td><span>No Importers Defined</span></td></tr>";
                            $("#ImportersList tbody").append(theHTML);
                        }
                    });

                    // moderation

                    // search

                    // application for membership

                }
                else
                    $("#AdminPanel").hide();
            })

            $("#LoadRSSBtn").click(HandleRSSLoad);

            $("#ImportDataBtn").click(HandleRSSImport);

        };

        var PopulateActivityFeedArea = function() {

            // general items
            $("#RSSAutoImport").val(curImporter.autoimport);
            $("#RSSAutoImportSchedule").val(curImporter.importfrequency);
            $("#RSSImportAsUser").val(curImporter.importasuser);
            $("#RSSImportUsername").val(curImporter.importusername);
            $("#RSSImportPassword").val(curImporter.importpassword);

            // rss items
            $("#RSSURL").val(curImporter.RSSUrl);
            $("#RSSURLfield").val(curImporter.urlfield);
            $("#RSSSummarizePage").attr("checked", G.GetSafeProperty(curImporter, "summarizepage", true));
            $("#RSSTitleField").val(curImporter.titlefield);
            $("#RSSImageField").val(curImporter.imagefield);
            $("#RSSBodyField").val(curImporter.bodyfield);

            $("#RSSAppendURL").attr("checked", G.GetSafeProperty(curImporter, "appendurl", true));

        };

        var ClearImporterArea = function() {
            $("#RssURLfield").val("");
        };

        var HandleRSSLoad = function (theEvent) {
            var theURL = $("#RSSURLfield").val();
            $.ajax({
                url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(theURL),
                dataType: 'json',
                success: function(data) {
                    //console.log(data.responseData.feed);
                    $("#RSSBody").html('<tr><td colspan="2" class="rss-preview-header">'+ data.responseData.feed.title +'</td></tr>');

                    $.each(data.responseData.feed.entries, function(key, value){
                        var thehtml = '<tr><td colspan="2">';
                        thehtml += '<table><tbody><tr><td><a href="'+value.link+'" target="_blank">'+value.title+'</a></td></tr></tbody></table>';
                        $("#RSSBody").append(thehtml);
                    });
                    var theItems = $("#RSSBody tbody");

                    $.each(theItems, function (theKey, theVal) {
                        var curHRef = $(theVal).find("a").attr("href");
                        if (curHRef != "") {
                            $.ajax({
                                url: 'http://api.embed.ly/1/extract?key=400ca94d281f4b77b94b351c345d6ba8&maxwidth=500&url=' + encodeURIComponent(curHRef),
                                dataType: 'json',
                                success: function(theObject) {
                                    var itemHTML = '<tr><td rowSpan="2">';
                                    itemHTML += '<img width="128" height="128" src="' +  theObject.images[0].url + '"/>';
                                    itemHTML += '</td>'
                                    itemHTML += '<td class="title-data"><input type="text" value="' + theObject.title + '"></td></tr>';
                                    itemHTML += '<tr><td><textarea rows="3">' + theObject.description + '</textarea></td></tr>';
                                    itemHTML += '<tr><td colspan="2"><a href="' + theObject.url + '" target="_blank">'+theObject.url+'</a></td></tr>'

                                    $(theVal).html(itemHTML);
                                }

                            });
                        }
                    });

                    $(".rss-preview-header").click(function(theEvent) {
                        $(this).closest("table").find("table").toggle();
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