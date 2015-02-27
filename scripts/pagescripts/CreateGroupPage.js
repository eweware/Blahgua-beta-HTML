/**
 * Created by Dave on 12/8/2014.
 */

define('CreateGroupPage',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {
        var newChannel = null;
        var channelTypeId = null;

        var InitializePage = function(theGroupType) {
            channelTypeId = theGroupType;
            $(G.BlahFullItem).disableSelection();
            $(".blah-closer").click(function(theEvent) {
                exports.ShowMangeChannelsUI(newChannel);
            });

            $("#BlahFullItem").show();

            $("#ChannelJoinNeedsBadges").change(function() {
                if (this.checked)
                    $("#join-badge-div").show();
                else
                    $("#join-badge-div").hide();
            });

            $("#ChannelPostNeedsBadges").change(function() {
                if (this.checked)
                    $("#post-badge-div").show();
                else
                    $("#post-badge-div").hide();
            });

            $("#ChannelCommentNeedsBadges").change(function() {
                if (this.checked)
                    $("#comment-badge-div").show();
                else
                    $("#comment-badge-div").hide();
            });

            $("#ChannelNeedsModeration").change(function() {
                if (this.checked)
                    $("#moderation-div").show();
                else
                    $("#moderation-div").hide();
            });

            $("#ChannelModerateNeedsBadges").change(function() {
                if (this.checked)
                    $("#moderate-badge-div").show();
                else
                    $("#moderate-badge-div").hide();
            });

            $("#join-badge-div").hide();
            $("#post-badge-div").hide();
            $("#comment-badge-div").hide();
            $("#moderation-div").hide();
            $("#moderation-badge-div").hide();


            $("#AddJoinBadgeBtn").click(function(theEvent) {
                var newString = $("#ChannelJoinBadgeList").val();
                $("#join-badge-area").append($('<option>').text(newString));
                $("#ChannelJoinBadgeList").val("");
            });

            $("#DeleteJoinBadgeBtn").click(function(theEvent) {
                $("#join-badge-area option:selected").remove();
            });

            $("#AddPostBadgeBtn").click(function(theEvent) {
                var newString = $("#ChannelPostBadgeList").val();
                $("#post-badge-area").append($('<option>').text(newString));
                $("#ChannelPostBadgeList").val("");
            });

            $("#DeletePostBadgeBtn").click(function(theEvent) {
                $("#post-badge-area option:selected").remove();
            });

            $("#AddCommentBadgeBtn").click(function(theEvent) {
                var newString = $("#ChannelCommentBadgeList").val();
                $("#comment-badge-area").append($('<option>').text(newString));
                $("#ChannelCommentBadgeList").val("");
            });

            $("#DeleteCommentBadgeBtn").click(function(theEvent) {
                $("#comment-badge-area option:selected").remove();
            });

            $("#AddModerateBadgeBtn").click(function(theEvent) {
                var newString = $("#ChannelModerateBadgeList").val();
                $("#moderate-badge-area").append($('<option>').text(newString));
                $("#ChannelModerateBadgeList").val("");
            });

            $("#DeleteModerateBadgeBtn").click(function(theEvent) {
                $("#moderate-badge-area option:selected").remove();
            })


            $("#CreateChannelBtn").click(function(theEvent) {
                $("#CreateChannelBtn").prop('disabled', true);
                var channelParams = new Object();
                var channelName = $("#ChannelNameField").val();
                var channelDesc = $("#ChannelDescriptionField").val();
                if ($("#ChannelIsMature").is(":checked"))
                    channelParams["XXX"] = true;
                if ($("#ChannelIsPrivate").is(":checked"))
                    channelParams["PP"] = true;

                var halfLife = $("#ChannelHalflifeField").val();
                if ((halfLife != "") && (halfLife != "0"))
                    channelParams["CE"] = parseInt(halfLife.trim());

                var adminListStr = $("#ChannelAdminsField").val().trim();
                if (adminListStr != "") {
                    var adminList = adminListStr.split(" ");
                    if (adminList.length > 0)
                        channelParams["GA"] = adminList;
                }

                if ($("#ChannelJoinNeedsBadges").is(":checked")) {
                    var badgeList = $.map($("#join-badge-area option"), function(option) {
                        return option.value;
                    });

                    channelParams["PJ"] = badgeList;
                }

                if ($("#ChannelPostNeedsBadges").is(":checked")) {
                    var badgeList = $.map($("#post-badge-area option"), function(option) {
                        return option.value;
                    });

                    channelParams["PB"] = badgeList;
                }

                if ($("#ChannelCommentNeedsBadges").is(":checked")) {
                    var badgeList = $.map($("#comment-badge-area option"), function(option) {
                        return option.value;
                    });

                    channelParams["PC"] = badgeList;
                }


                if ($("#ChannelNeedsModeration").is(":checked")) {
                    channelParams["MX"] = true;
                    if ($("#ChannelModerateNeedsBadges").is(":checked")) {
                        var badgeList = $.map($("#moderate-badge-area option"), function (option) {
                            return option.value;
                        });
                    }

                    channelParams["PM"] = badgeList;
                    var commentVal = $("#ChannelCommentModStyle").val();
                    if (commentVal != "none")
                        channelParams["CMX"] = parseInt(commentVal);
                }


                blahgua_rest.CreateChannel(channelName, channelDesc, channelTypeId, channelParams, OnChannelCreateOk, OnChannelCreateFail);
            });

        };

        var OnChannelCreateOk = function(theNewChannel) {
            // do nothing actually
            exports.ShowMangeChannelsUI(newChannel);
        }

        var OnChannelCreateFail = function(theErr) {
            window.alert("Channel Create Failed.");
            $("#CreateChannelBtn").prop('disabled', false);
        }





        return {

            InitializePage: InitializePage
        }
    }
);