/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePredict',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var HandleVoteFailed = function(theErr) {
            // todo:  check for the failure...
            exports.OnFailure(theErr);
        };

        var InitPredictPage = function() {
            // add the event handlers
            $('.current-choices img').click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                if($(theEvent.target).attr("disabled") != "disabled") {
                    $('.current-choices img').attr('disabled', 'disabled');
                    var myVote = $(theEvent.target).parents('tr').attr('data-predict-vote');
                    blahgua_rest.SetUserPredictionVote(G.CurrentBlahId, myVote, function() {
                        var theProp;
                        switch(myVote) {
                            case "y":
                                theProp = "4";
                                break;
                            case "n":
                                theProp = "5";
                                break;
                            default:
                                theProp = "6";
                        }
                        G.CurrentBlah[theProp] = G.GetSafeProperty(G.CurrentBlah, theProp, 0) + 1;
                        UpdatePredictPage();
                    }, HandleVoteFailed);
                }
            });

            $('.expired-choices img').click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                var myVote = $(theEvent.target).parents('tr').attr('data-predict-vote');
                blahgua_rest.SetUserExpiredPredictionVote(G.CurrentBlahId, myVote, function() {
                    var theProp;
                    switch(myVote) {
                        case "y":
                            theProp = "1";
                            break;
                        case "n":
                            theProp = "2";
                            break;
                        default:
                            theProp = "3";
                    }
                    G.CurrentBlah[theProp] = G.GetSafeProperty(G.CurrentBlah, theProp, 0) + 1;
                    UpdatePredictPage();
                }, HandleVoteFailed);
            });
            UpdatePredictPage();
        };

        var UpdatePredictPage = function() {
            $("#PredictCheckBoxClass").hide();
            // update the prediction divs
            var expDateVal = G.GetSafeProperty(G.CurrentBlah, "E", Date.now());
            var expDate = new Date(expDateVal);
            var elapStr = G.ElapsedTimeString(expDate);
            var isPast = (expDate < new Date(Date.now()));

            if (isPast) {
                $("#ElapsedTimeText").text("should have happened ");
                $("#PredictVotePrompt").text("Did it happen?");
                $("#PredictVoteTable").hide();
                $("#ExpPredictVoteTable").show();
                $('.current-choices img').unbind('click');
            } else {
                $("#ElapsedTimeText").text("happening within ");
                $("#PredictVotePrompt").text("Do you agree?");
                $("#PredictVoteTable").show();
                $("#ExpPredictVoteTable").hide();
                $('.expired-choices img').unbind('click');
            }

            $("#elapsedTime").text(elapStr);
            $("#predictionDate").text(expDate.toLocaleDateString());

            // update the bars
            var yesVotes = G.GetSafeProperty(G.CurrentBlah, "4", 0);
            var noVotes = G.GetSafeProperty(G.CurrentBlah, "5", 0);
            var maybeVotes = G.GetSafeProperty(G.CurrentBlah, "6", 0);
            var totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
            var yesRatio = 0;
            var noRatio = 0;
            var maybeRatio = 0;

            if (totalVotes > 0) {
                yesRatio = Math.floor((yesVotes / totalVotes) * 100);
                noRatio = Math.floor((noVotes / totalVotes) * 100);
                maybeRatio = Math.floor((maybeVotes / totalVotes) * 100);
            }

            if (yesVotes > 0)
                $("#PredictYesSpan").empty().animate({'width': yesRatio + "%"}, 250);
            else
                $("#PredictYesSpan").html("no&nbsp;votes&nbsp;yet");

            if (noVotes > 0)
                $("#PredictNoSpan").empty().animate({'width': noRatio + "%"}, 250);
            else
                $("#PredictNoSpan").html("no&nbsp;votes&nbsp;yet");

            if (maybeVotes > 0)
                $("#PredictMaybeSpan").empty().animate({'width': maybeRatio + "%"}, 250);
            else
                $("#PredictMaybeSpan").html("no&nbsp;votes&nbsp;yet");



            // expired ui
            yesVotes = G.GetSafeProperty(G.CurrentBlah, "1", 0);
            noVotes = G.GetSafeProperty(G.CurrentBlah, "2", 0);
            maybeVotes = G.GetSafeProperty(G.CurrentBlah, "3", 0);
            totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
            yesRatio = 0;
            noRatio = 0;
            maybeRatio = 0;

            if (totalVotes > 0) {
                yesRatio = Math.floor((yesVotes / totalVotes) * 100);
                noRatio = Math.floor((noVotes / totalVotes) * 100);
                maybeRatio = Math.floor((maybeVotes / totalVotes) * 100);
            }
            if (yesVotes > 0)
                $("#ExpPredictYesSpan").empty().animate({'width': yesRatio + "%"}, 250);
            else
                $("#ExpPredictYesSpan").html("no&nbsp;votes&nbsp;yet");

            if (noVotes > 0)
                $("#ExpPredictNoSpan").empty().animate({'width': noRatio + "%"}, 250);
            else
                $("#ExpPredictNoSpan").html("no&nbsp;votes&nbsp;yet");

            if (maybeVotes > 0)
                $("#ExpPredictMaybeSpan").empty().animate({'width': maybeRatio + "%"}, 250);
            else
                $("#ExpPredictMaybeSpan").html("no&nbsp;votes&nbsp;yet");


            if (G.IsUserLoggedIn) {
                // update the user's vote
                blahgua_rest.GetUserPredictionVote(G.CurrentBlah._id,
                    function(json) {
                        // update the vote
                        var userVote = G.GetSafeProperty(json, "D", null);
                        var expVote = G.GetSafeProperty(json, "Z", null);
                        if (userVote) {
                            $('.current-choices img').unbind('click');
                            switch (userVote) {
                                case "y":
                                     $("#PredictYesImg").addClass("checked").show();

                                    break;
                                case "n":
                                    $("#PredictNoImg").addClass("checked").show();
                                    break;
                                case "u":
                                    $("#PredictMaybeImg").addClass("checked").show();
                                    break;
                            }
                        } else if (G.CurrentBlah.A == G.CurrentUser._id) {
                            $('.current-choices img').unbind('click');
                            $("#PredictVotePrompt").text("The result so far:");
                        }
                        else {
                            // no vote yey
                            $("#PredictYesImg").show();
                            $("#PredictNoImg").show();
                            $("#PredictMaybeImg").show();
                        }

                        if (expVote) {
                            $('.expired-choices img').unbind('click');
                            switch (expVote) {
                                case "y":
                                    $("#ExpPredictYesImg").addClass("checked").show();
                                    break;
                                case "n":
                                    $("#ExpPredictNoImg").addClass("checked").show();
                                    break;
                                case "u":
                                    $("#ExpPredictMaybeImg").addClass("checked").show();
                                    break;
                            }
                        } else if (G.CurrentBlah.A == G.CurrentUser._id) {
                            $('.current-choices img').unbind('click');
                            $("#PredictVotePrompt").text("The result so far:");
                        } else  {
                            // no vote yey
                            $("#ExpPredictYesImg").show();
                            $("#ExpPredictNoImg").show();
                            $("#ExpPredictMaybeImg").show();
                        }
                    }, function(theErr) {
                        $("#PredictYesImg").hide();
                        $("#PredictNoImg").hide();
                        $("#PredictMaybeImg").hide();
                        $("#ExpPredictYesImg").hide();
                        $("#ExpPredictNoImg").hide();
                        $("#ExpPredictMaybeImg").hide()
                    });
            }
        };

        return {
            InitPredictPage: InitPredictPage

        }
    }
);