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
                    $("#moderation-badge-div").show();
                else
                    $("#moderation-badge-div").hide();
            });

            $("#join-badge-div").hide();
            $("#post-badge-div").hide();
            $("#comment-badge-div").hide();
            $("#moderation-div").hide();
            $("#moderation-badge-div").hide();

            $("#CreateChannelBtn").click(function(theEvent) {
                $("#CreateChannelBtn").prop('disabled', true);
                var channelParams = new Object();
                var channelName = $("#ChannelNameField").val();
                var channelDesc = $("#ChannelDescriptionField").val();

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