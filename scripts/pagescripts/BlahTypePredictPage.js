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
            $('.current-choices i').click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                if($(theEvent.target).attr("disabled") != "disabled") {
                    $('.current-choices i').attr('disabled', 'disabled');
                    var myVote = $(theEvent.target).parents('tr.poll-result-row').attr('data-predict-vote');
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

            $('.expired-choices i').click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                if($(theEvent.target).attr("disabled") != "disabled") {
                    $('.expired-choices i').attr('disabled', 'disabled');
                    var myVote = $(theEvent.target).parents('tr.poll-result-row').attr('data-predict-vote');
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
                }
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
            var maxWidth = document.getElementById("BlahTypePredict").getBoundingClientRect().width - 125;

            if (isPast) {
                $("#predictionPrompt").text("should have happened ");
                $("#PredictVoteTable").hide();
                $("#ExpPredictVoteTable").show();
                $('.current-choices img').unbind('click');
            } else {
                $("#predictionPrompt").text("happening by ");
                $("#PredictVoteTable").show();
                $("#ExpPredictVoteTable").hide();
                $('.expired-choices img').unbind('click');
            }

            $("#predictionDate").text(expDate.toLocaleDateString());
            $("#elapsedTime").text("(" + elapStr + ")");

            // update the bars
            var yesVotes = G.GetSafeProperty(G.CurrentBlah, "4", 0);
            var noVotes = G.GetSafeProperty(G.CurrentBlah, "5", 0);
            var maybeVotes = G.GetSafeProperty(G.CurrentBlah, "6", 0);
            var totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
            var yesRatio = 0;
            var noRatio = 0;
            var maybeRatio = 0;

            if (totalVotes > 0) {
                yesRatio = yesVotes / totalVotes;
                noRatio = noVotes / totalVotes;
                maybeRatio = maybeVotes / totalVotes;
            }

            if (yesVotes > 0)  {
                $("#PredictYesSpan").empty().animate({'width': (maxWidth * yesRatio) + "px"}, 250);
                $("#PredictYesLabel").text(Math.floor(yesRatio * 100) + "%");
            }
            else
                $("#PredictYesLabel").html("no&nbsp;votes");

            if (noVotes > 0) {
                $("#PredictNoSpan").empty().animate({'width': (maxWidth * noRatio) + "px"}, 250);
                $("#PredictNoLabel").text(Math.floor(noRatio * 100) + "%");
            }
            else
                $("#PredictNoLabel").html("no&nbsp;votes");

            if (maybeVotes > 0) {
                $("#PredictMaybeSpan").empty().animate({'width': (maxWidth * maybeRatio) + "px"}, 250);
                $("#PredictMaybeLabel").text(Math.floor(maybeRatio * 100) + "%");
            }
            else
                $("#PredictMaybeLabel").html("no&nbsp;votes");



            // expired ui
            yesVotes = G.GetSafeProperty(G.CurrentBlah, "1", 0);
            noVotes = G.GetSafeProperty(G.CurrentBlah, "2", 0);
            maybeVotes = G.GetSafeProperty(G.CurrentBlah, "3", 0);
            totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
            yesRatio = 0;
            noRatio = 0;
            maybeRatio = 0;

            if (totalVotes > 0) {
                yesRatio = yesVotes / totalVotes;
                noRatio = noVotes / totalVotes;
                maybeRatio = maybeVotes / totalVotes;
            }
            if (yesVotes > 0) {
                $("#ExpiredYesSpan").empty().animate({'width': (maxWidth * yesRatio) + "px"}, 250);
                $("#ExpiredYesLabel").text(Math.floor(yesRatio * 100) + "%");
            }
            else
                $("#ExpiredYesLabel").html("no&nbsp;votes");

            if (noVotes > 0) {
                $("#ExpiredNoLabel").text(Math.floor(noRatio * 100) + "%");
                $("#ExpiredNoSpan").empty().animate({'width': (maxWidth * noRatio) + "px"}, 250);
            }
            else
                $("#ExpiredNoLabel").html("no&nbsp;votes");

            if (maybeVotes > 0) {
                $("#ExpiredMaybeLabel").text(Math.floor(maybeRatio * 100) + "%");
                $("#ExpiredMaybeSpan").empty().animate({'width': (maxWidth * maybeRatio) + "px"}, 250);
            }
            else
                $("#ExpiredMaybeLabel").html("no&nbsp;votes");


            if (G.IsUserLoggedIn) {
                // update the user's vote
                blahgua_rest.GetUserPredictionVote(G.CurrentBlah._id,
                    function(json) {
                        // update the vote
                        var userVote = G.GetSafeProperty(json, "D", null);
                        var expVote = G.GetSafeProperty(json, "Z", null);
                        if (userVote) {
                            $('.current-choices i').unbind('click');
                            switch (userVote) {
                                case "y":
                                     $('#PredictVoteTable tr[data-predict-vote=y] i').addClass("icon-check").removeClass("icon-check-empty").show();
                                    break;
                                case "n":
                                    $('#PredictVoteTable tr[data-predict-vote=n] i').addClass("icon-check").removeClass("icon-check-empty").show();
                                    break;
                                case "u":
                                    $('#PredictVoteTable tr[data-predict-vote=u] i').addClass("icon-check").removeClass("icon-check-empty").show();
                                    break;
                            }
                        } else if (G.CurrentBlah.A == G.CurrentUser._id) {
                            $('.current-choices img').unbind('click');
                        }


                        if (expVote) {
                            $('.expired-choices i').unbind('click');
                            switch (expVote) {
                                case "y":
                                    $('#ExpPredictVoteTable tr[data-predict-vote=y] i').addClass("icon-check").removeClass("icon-check-empty").show();
                                    break;
                                case "n":
                                    $('#ExpPredictVoteTable tr[data-predict-vote=n] i').addClass("icon-check").removeClass("icon-check-empty").show();
                                    break;
                                case "u":
                                    $('#ExpPredictVoteTable tr[data-predict-vote=u] i').addClass("icon-check").removeClass("icon-check-empty").show();
                                    break;
                            }
                        } else if (G.CurrentBlah.A == G.CurrentUser._id) {
                            $('.current-choices img').unbind('click');
                            $('#BlahTypePredict i').hide();
                        }

                    }, G.OnFailure);
            }
        };

        return {
            InitPredictPage: InitPredictPage

        }
    }
);