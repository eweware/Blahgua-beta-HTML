/**
 * Created by Dave on 12/8/2014.
 */

define('ManageChannelsPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var AllChannelList = null;
        var UserChannelList = null;

        var isAdmin = false;

        var RefreshContent = function(theChannel) {
            $(G.BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.CloseBlah();
            });

            $("#BlahFullItem").show();

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

            isAdmin = G.GetSafeProperty(G.CurrentUser, "ad", false);

            UpdateUserChannelList();


        };

        var UpdateUserChannelList = function() {
            var channeList = $("#UserChannelList");
            channeList.empty();

            blahgua_rest.GetUserChannels(UpdateUserChannelsFromData);
        };

        var UpdateAllChannelList = function() {
            var channeList = $("#UserChannelList");
            channeList.empty();

            blahgua_rest.GetAllChannels(UpdateAllChannelsFromData);
        };

        var UpdateAllChannelsFromData = function (channelList) {
            if (blahgua_rest.ChannelTypes == undefined) {
                blahgua_rest.GetChannelTypes(function(typeList) {
                    blahgua_rest.ChannelTypes = typeList;
                    UpdateAllChannelsFromData(channelList);
                });
                return;
            }
            this.AllChannelList = channelList;
            $("#ManageAllChannelsHeader span").text("All Channels (" + channelList.length + ")" );
            var newHTML = "";
            var newEl = null;
            var channelTypeListDiv = $("#AllChannelsList");
            var channelListDiv = null;
            var subCount = 0;
            var isLockedType = false;
            $.each(blahgua_rest.ChannelTypes, function (typeIndex, channelType) {
                newEl = createChannelType(channelType);
                channelTypeListDiv[0].appendChild(newEl);
                subCount = 0;
                channelListDiv = $(newEl).find("tbody");
                $.each(channelList, function(index, element) {
                    if (element.Y == channelType._id) {
                        subCount++;
                        newHTML = createGlobalChannelHTML(index, element);
                        channelListDiv.append(newHTML);
                    }
                });
                if (subCount == 0) {
                    newHTML = createEmptyResultHTML();
                    channelListDiv.append(newHTML);
                }
                isLockedType = G.GetSafeProperty(channelType, "ad", false);
                if (isAdmin || (!isLockedType)) {
                    newHTML = createAddChannelHTML(channelType);
                    channelListDiv.append(newHTML);
                    $(newEl).find(".channel-control").click(function (theEvent) {
                        theEvent.stopImmediatePropagation();
                        var theID = $(this).attr("data-channel-type");
                        CreateNewGroup(theID);
                    });
                }

                $(newEl).find(".user-blah-row").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    var theID = $(this).attr("data-channel-id");
                    OpenExistingGroup(theID);
                });

                $(newEl).find(".join-channel-btn").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    var theId = $(this).parents(".user-blah-row").attr("data-channel-id");
                    blahgua_rest.JoinUserToChannel(theId, function(newChannel) {
                        window.alert("Hey, someone joined a channel!");
                    });
                });

                $(newEl).find(".leave-channel-btn").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    var theId = $(this).parents(".user-blah-row").attr("data-channel-id");
                    blahgua_rest.RemoveUserFromChannel(theId, function(newChannel) {
                        window.alert("Hey, someone left a channel!");
                    });
                });
            });

        };


        var UpdateUserChannelsFromData = function (channelList) {
            UserChannelList = channelList;
            $("#ManageUserChannelsHeader span").text("Your Channels (" + channelList.length + ")" );
            var newHTML = "";
            var channelListDiv = $("#UserChannelList");
            $.each(channelList, function(index, element) {
                newHTML = createUserChannelHTML(index, element);
                channelListDiv.append(newHTML);
            });
            channelListDiv.find(".user-blah-row").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                var theID = $(this).attr("data-channel-id");
                OpenExistingGroup(theID);
            });

            UpdateAllChannelList();
        };

        var createAddChannelHTML = function(channelType) {
            var newHTML = "";
            newHTML += "<tr><td>";
            newHTML += "<button class='channel-control' data-channel-type='" + channelType._id + "'>Add Channel</button>";
            newHTML += "</td></tr>";

            return newHTML;
        };

        var createEmptyResultHTML = function() {
            var newHTML = "";


            newHTML += "<tr class='empty-channel-type-row'>";
            newHTML += "<td class='empty-channeltype-text-column'>";
            newHTML += "<div class='empty-channeltype-title-text'>";
            newHTML += "There are currently no channels of this type.";
            newHTML += "</div></td></tr>";
            return newHTML;
        };

        var createChannelType = function(theChannelType) {
            var newEl = document.createElement("tr");
            var newHTML = "";
            var channelName = G.GetSafeProperty(theChannelType, "N");
            var channelDescription = G.GetSafeProperty(theChannelType, "D");
            newHTML += "<td><table class='channel-type-row-table'><thead>";

            newHTML += "<tr class='channel-type-row' data-channel-id='" + theChannelType._id + "'>";
            newHTML += "<td class='channeltype-text-column'>";
            newHTML += "<div class='channeltype-text'>";
            newHTML += channelName;
            newHTML += "</div></td></tr></thead>";
            newHTML += "<tbody></tbody></table>"
            newEl.innerHTML = newHTML;
            return newEl;
        };


        var createUserChannelHTML = function(theIndex, theChannel) {
            var newHTML = "";
            var adBlah = G.GetSafeProperty(theChannel, "GAB");
            var channelName = G.GetSafeProperty(theChannel, "N");
            var channelDescription = G.GetSafeProperty(theChannel, "D");

            newHTML += "<tr class='user-blah-row' data-channel-id='" + theChannel._id + "'>";
            newHTML += "<td><table><tbody><tr>";
            var channelImageURL = "https://s3-us-west-2.amazonaws.com/app.goheard.com/images/silhouette.jpg";

            newHTML += "<td rowspan='2'>";
            newHTML += "<div class='blah-preview-image' style='background-image: url(\"" + channelImageURL + "\")'>";
            newHTML += "</td>";
            newHTML += "<td class='channel-text-column'>";
            newHTML += "<div class='channel-title-text'>";
            newHTML += "<a href='javascript:void(null)'>";
            newHTML += channelName;
            newHTML += "</a></div></td></tr>";
            newHTML += "<tr><td class='channel-text-column'><div class='channel-description-text'>";
            newHTML += channelDescription;
            newHTML += "</div>";
            newHTML += "</td>";

            if (UserChannelList.length > 1) {
                // insert leave channel UI
                newHTML += "<td>"
                newHTML += "<button>Leave</button>";
                newHTML += "</td>"
            }

            newHTML += "</tr>";
            newHTML += "</tbody></table></td></tr>";
            return newHTML;
        };

        var UserIsOnChannel = function(channelId) {
          var isOn = false;

            for (var i = 0; i < UserChannelList.length; i++) {
                if (UserChannelList[i]._id == channelId)
                return true;
            }
            return isOn;
        };

        var createGlobalChannelHTML = function(theIndex, theChannel) {
            var newHTML = "";
            var adBlah = G.GetSafeProperty(theChannel, "GAB");
            var channelName = G.GetSafeProperty(theChannel, "N");
            var channelDescription = G.GetSafeProperty(theChannel, "D");

            newHTML += "<tr class='user-blah-row' data-channel-id='" + theChannel._id + "'>";
            newHTML += "<td><table><tbody><tr>";
            var channelImageURL = "https://s3-us-west-2.amazonaws.com/app.goheard.com/images/silhouette.jpg";

            newHTML += "<td rowspan='2'>";
            newHTML += "<div class='blah-preview-image' style='background-image: url(\"" + channelImageURL + "\")'>";
            newHTML += "</td>";
            newHTML += "<td class='channel-text-column'>";
            newHTML += "<div class='channel-title-text'>";
            newHTML += "<a href='javascript:void(null)'>";
            newHTML += channelName;
            newHTML += "</a></div></td>";
            // join/leave button
            var isOnChannel = UserIsOnChannel(theChannel._id);
            newHTML += "<td rowspan='2'>";
            newHTML += "<button class='join-channel-btn'";
            if (isOnChannel)
                newHTML += " style='display:none;'";
            newHTML += ">Join</button>";
            newHTML += "<button class='leave-channel-btn'";
            if (!isOnChannel)
                newHTML += " style='display:none;'";
            else if (UserChannelList.length == 1)
                newHTML += " disabled='true'";
            newHTML += ">Leave</button>";
            newHTML += "</td>";

            newHTML += "</tr>";
            newHTML += "<tr><td class='channel-text-column'><div class='channel-description-text'>";
            newHTML += channelDescription;
            newHTML += "</div>";
            newHTML += "</td>";
            newHTML += "</tr>";
            newHTML += "</tbody></table></td></tr>";
            return newHTML;
        };


        var CreateNewGroup = function(groupTypeId) {
            $("#LightBox").show();
            var basePage = "CreateGroupPage.html";
            if (G.IsShort)
                basePage = "CreateGroupPage.html"

            $("#BlahPreviewExtra").empty();

            require(["CreateGroupPage"], function(CreateGroupPage) {
                $(BlahFullItem).load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #CreateChannelDiv", function() {
                    ga('send', 'pageview', {
                        'page': '/creategroup',
                        'title': groupTypeId
                    });

                    $(G.BlahFullItem).disableSelection();
                    $(G.BlahFullItem).fadeIn("fast", function() {
                        CreateGroupPage.InitializePage(groupTypeId);
                    });
                });
            });
        };

        var GetGroupFromId = function(theGroupId) {
            for (var i = 0; i < this.AllChannelList.length; i++) {
                if (this.AllChannelList[i]._id == theGroupId)
                    return this.AllChannelList[i];
            }
          return null;
        };

        var OpenExistingGroup = function(theGroupId) {
            var theGroup = GetGroupFromId(theGroupId);
            $("#LightBox").show();
            var basePage = "ViewGroupPage.html";
            if (G.IsShort)
                basePage = "ViewGroupPage.html"

            $("#BlahPreviewExtra").empty();

            require(["ViewGroupPage"], function(ViewGroupPage) {
                $(BlahFullItem).load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #ViewChannelDiv", function() {
                    ga('send', 'pageview', {
                        'page': '/groupinfo',
                        'title': theGroupId
                    });

                    $(G.BlahFullItem).disableSelection();
                    $(G.BlahFullItem).fadeIn("fast", function() {
                        ViewGroupPage.InitializePage(theGroup);
                    });
                });
            });
        };




        return {

            RefreshContent: RefreshContent
        }
    }
);