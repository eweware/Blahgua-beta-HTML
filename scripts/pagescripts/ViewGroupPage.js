/**
 * Created by Dave on 12/8/2014.
 */

define('ViewGroupPage',
    ["globals", "constants", "ExportFunctions", "blahgua_restapi"],
    function (G, K, exports, blahgua_rest) {

        var newChannel = null;
        var perms = null;
        var channelImporters = null;
        var curImporter = null;
        var importItems = null;

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
                curImporter.feedname = "untitled feed";
                curImporter.channel = newChannel._id;
                curImporter.feedtype = 0;
                curImporter.autoimport = false;
                curImporter.importfrequency = 0;
                curImporter.importusername = "";
                curImporter.importpassword = "";
                curImporter.importasuser = false;

                curImporter.RSSurl = "<rss url>";
                curImporter.summarizepage = true;
                curImporter.appendurl = true;
                curImporter.urlfield = "url";
                curImporter.titlefield = "title";
                curImporter.bodyfield = "description";
                curImporter.imagefield = "images[0].url";

                PopulateActivityFeedArea();
                AppendNewImporterToList(curImporter);
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
                                var theHTML = CreateImporterHeaderHTML(value);
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
            });

            $("#ImporterDetailTable").hide();

            $("#LoadRSSBtn").click(HandleRSSLoad);

            $("#SaveImporterBtn").click(HandleSaveImporter);

            $("#DeleteImporterBtn").click(HandleDeleteImporter);

            $("#ImportDataBtn").click(HandleRSSImport);

        };

        var HandleSaveImporter = function(theEvent) {
            SaveFeedDataToRecord();
            RefreshImporterName();
            if (curImporter.hasOwnProperty("_id")) {
                // existing importer - update it
                blahgua_rest.UpdateChannelImporter(curImporter,
                    function(newChan) {
                        console.log("Saved OK!");

                    },
                    function (theErr) {
                        console.log("sad face - not saved");
                    });
            } else {
                // new importer - create it
                blahgua_rest.AddChannelImporter(newChannel._id, curImporter,
                    function(newChan) {
                        console.log("Saved OK!");

                    },
                    function (theErr) {
                        console.log("sad face - not saved");
                    });
            }

        };

        var HandleDeleteImporter = function(theEvent) {

        };

        var RefreshImporterName = function() {
            var theIndex = channelImporters.indexOf(curImporter);
            $("#ImportersList span[data-item='" + theIndex + "']").text(curImporter.feedname);
        };

        var AppendNewImporterToList = function(newImporter) {
            channelImporters.push(newImporter);
            var theIndex = channelImporters.indexOf(newImporter);
            var theHTML = CreateImporterHeaderHTML(newImporter);
            $("#ImportersList tbody").append(theHTML);

            $("#ImportersList span[data-item='" + theIndex + "']").click(function (theEvent) {
                var theItemIndex = $(this).attr("data-item");
                curImporter = channelImporters[theItemIndex];

                PopulateActivityFeedArea();
            });
        };

        var CreateImporterHeaderHTML = function (theImporter) {
            var theIndex = channelImporters.indexOf(theImporter);
            var theHTML = "<tr><td>";
            theHTML += "<span data-item='" + theIndex + "'>" + theImporter.feedname + "</span>";
            theHTML += "</td></tr>";

            return theHTML;
        };

        var SaveFeedDataToRecord = function () {
            curImporter.feedname = $("#RSSFeedName").val();
            curImporter.autoimport = $("#RSSAutoImport").val();
            curImporter.importfrequency = $("#RSSAutoImportSchedule").val();
            curImporter.importasuser = $("#RSSImportAsUser").val();
            curImporter.importusername = $("#RSSImportUsername").val();
            curImporter.importpassword = $("#RSSImportPassword").val();

            // rss items
            curImporter.RSSurl = $("#RSSURL").val();
            curImporter.urlfield = $("#RSSURLfield").val();
            curImporter.summarizepage = $("#RSSSummarizePage").attr("checked");
            curImporter.titlefield = $("#RSSTitleField").val();
            curImporter.imagefield = $("#RSSImageField").val();
            curImporter.bodyfield = $("#RSSBodyField").val();

            $("#RSSAppendURL").attr("checked", G.GetSafeProperty(curImporter, "appendurl", true));


        };


        var PopulateActivityFeedArea = function() {

            // general items
            $("#RSSFeedName").val(curImporter.feedname);
            $("#RSSAutoImport").val(curImporter.autoimport);
            $("#RSSAutoImportSchedule").val(curImporter.importfrequency);
            $("#RSSImportAsUser").val(curImporter.importasuser);
            $("#RSSImportUsername").val(curImporter.importusername);
            $("#RSSImportPassword").val(curImporter.importpassword);

            // rss items
            $("#RSSURL").val(curImporter.RSSurl);
            $("#RSSURLfield").val(curImporter.urlfield);
            $("#RSSSummarizePage").attr("checked", G.GetSafeProperty(curImporter, "summarizepage", true));
            $("#RSSTitleField").val(curImporter.titlefield);
            $("#RSSImageField").val(curImporter.imagefield);
            $("#RSSBodyField").val(curImporter.bodyfield);

            $("#RSSAppendURL").attr("checked", G.GetSafeProperty(curImporter, "appendurl", true));

            $("#ImporterDetailTable").show();

        };

        var ClearImporterArea = function() {
            $("#RssURLfield").val("");
        };

        var HandleRSSLoad = function (theEvent) {
            var theURL = $("#RSSURL").val();
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
            importItems = $("#RSSBody tbody").toArray();
            ImportRSSItems();

        };

        var ImportRSSItems = function() {
            var curItem = importItems.pop();
            $(curItem).fadeTo(400, 0.5);
            var title = $(curItem).find("input").val();
            var imageURL = $(curItem).find("img").attr("src");
            var body = $(curItem).find("textarea").val();
            var docURL = $(curItem).find("a").attr("href");

            if (imageURL != null) {
                var theImage = new Image();
                theImage.src = theImage.src = imageURL;
                var imageWidth = theImage.width;
                var imageHeight = theImage.height;

                if ((imageWidth + imageHeight) > 512) {
                    blahgua_rest.GetImageURL(imageURL, function(newURL) {
                        CreateImportBlah(title, body, newURL, docURL);
                    });
                }
                else {
                    // image too small...
                    CreateImportBlah(title, body, "", docURL);
                }

            } else {
                CreateImportBlah(title, body, "", docURL);
            }
        };

        var truncate = function (str, limit) {
            var bits, i;

            bits = str.split('');
            if (bits.length > limit) {
                for (i = bits.length - 1; i > -1; --i) {
                    if (i > limit) {
                        bits.length = i;
                    }
                    else if (' ' === bits[i]) {
                        bits.length = i;
                        break;
                    }
                }
                bits.push('…');
            }
            return bits.join('');
        };

        var CreateImportBlah = function (title, body, imageURL, appendedURL) {
            var blahType = K.BlahType.says;

            var blahHeadline = title;
            if (blahHeadline.length > 64) {
                blahHeadline = truncate(title, 63);
            }

            var blahBody = body;

            if (appendedURL != "") {
                blahBody += "\n\n" + appendedURL;
            }
            blahBody = G.CodifyText(blahBody);
            var blahGroup = newChannel._id;
            var options = new Object();

            /* todo:  handle badges and public/private
            var badges = $("#ShowBadgeArea .badge-item");
            if (badges.length > 0) {
                var badgeArray = [];
                badges.each(function(index, item) {
                    var theID =  $(item).attr("data-badge-id");
                    var isChecked = $(item).find("i").hasClass("icon-check");
                    if (isChecked)
                        badgeArray.push(theID);
                });
                if (badgeArray.length > 0)
                    options["B"] = badgeArray;
            }


            if ($("#ShowBadgeArea .anonymous-item").find("i").hasClass("icon-check")) {
                //options["XX"] = false;
            } else {
                options["XX"] = true;
            }

            if ($("#ShowBadgeArea .mature-item").find("i").hasClass("icon-check")) {
                options["XXX"] = true;
            } else {
                //options["XXX"] = false;
            }
             */

            options["XX"] = false;

            if (imageURL != "") {
                options["M"] = [imageURL];
            }
            blahgua_rest.CreateUserBlah(blahHeadline, blahType, blahGroup, blahBody, options, OnCreateBlahOK, HandleCreateBlahFailure);
        };

        var OnCreateBlahOK = function(theBlah) {
            if (importItems.length > 0)
                ImportRSSItems(importItems);
            else
                importItems = null;
        };


        var HandleCreateBlahFailure = function(theError) {
            if (importItems.length > 0)
                ImportRSSItems(importItems);
            else
                importItems = null;
        };


        return {

            InitializePage: InitializePage
        }
    }
);