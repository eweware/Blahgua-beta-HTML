/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePredict',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var HandleVoteFailed = function(theErr) {
            // todo:  check for the failure...
            exports.OnFailure(theErr);
        }
        var InitPredictPage = function() {
            // add the event handlers
            $('.current-choices img').click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                var myVote = $(theEvent.target).parents('tr').attr('data-predict-vote');
                blahgua_rest.SetUserPredictionVote(CurrentBlahId, myVote, function() {
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
                    CurrentBlah[theProp] = getSafeProperty(CurrentBlah, theProp, 0) + 1;
                    UpdatePredictPage();
                }, HandleVoteFailed);
            });

            $('.expired-choices img').click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                var myVote = $(theEvent.target).parents('tr').attr('data-predict-vote');
                blahgua_rest.SetUserExpiredPredictionVote(CurrentBlahId, myVote, function() {
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
                    CurrentBlah[theProp] = getSafeProperty(CurrentBlah, theProp, 0) + 1;
                    UpdatePredictPage();
                }, HandleVoteFailed);
            });
            UpdatePredictPage();
        }
        var UpdatePredictPage = function() {
            // update the prediction divs
            var expDateVal = getSafeProperty(CurrentBlah, "E", Date.now());
            var expDate = new Date(expDateVal);
            var elapStr = ElapsedTimeString(expDate);
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
            var yesVotes = getSafeProperty(CurrentBlah, "4", 0);
            var noVotes = getSafeProperty(CurrentBlah, "5", 0);
            var maybeVotes = getSafeProperty(CurrentBlah, "6", 0);
            var totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
            var yesRatio = 0;
            var noRatio = 0;
            var maybeRatio = 0;

            if (totalVotes > 0) {
                yesRatio = Math.floor((yesVotes / totalVotes) * 100);
                noRatio = Math.floor((noVotes / totalVotes) * 100);
                maybeRatio = Math.floor((maybeVotes / totalVotes) * 100);
            }
            $("#PredictYesSpan").animate({'width': yesRatio + "%"}, 250);
            $("#PredictNoSpan").animate({'width': noRatio + "%"}, 250);
            $("#PredictMaybeSpan").animate({'width': maybeRatio + "%"}, 250);
            //document.getElementById("PredictYesSpan").style.width = yesRatio + "%";
            //document.getElementById("PredictNoSpan").style.width = noRatio + "%";
            //document.getElementById("PredictMaybeSpan").style.width = maybeRatio + "%";

            // expired ui
            yesVotes = getSafeProperty(CurrentBlah, "1", 0);
            noVotes = getSafeProperty(CurrentBlah, "2", 0);
            maybeVotes = getSafeProperty(CurrentBlah, "3", 0);
            totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
            yesRatio = 0;
            noRatio = 0;
            maybeRatio = 0;

            if (totalVotes > 0) {
                yesRatio = Math.floor((yesVotes / totalVotes) * 100);
                noRatio = Math.floor((noVotes / totalVotes) * 100);
                maybeRatio = Math.floor((maybeVotes / totalVotes) * 100);
            }
            document.getElementById("ExpPredictYesSpan").style.width = yesRatio + "%";
            document.getElementById("ExpPredictNoSpan").style.width = noRatio + "%";
            document.getElementById("ExpPredictMaybeSpan").style.width = maybeRatio + "%";


            if (IsUserLoggedIn) {
                // update the user's vote
                blahgua_rest.GetUserPredictionVote(CurrentBlah._id,
                    function(json) {
                        // update the vote
                        var userVote = getSafeProperty(json, "D", null);
                        var expVote = getSafeProperty(json, "Z", null);
                        if (userVote) {
                            $('.current-choices img').unbind('click');
                            switch (userVote) {
                                case "y":
                                    document.getElementById("PredictYesImg").src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/checked.png";
                                    $("#PredictYesImg").show();
                                    $("#PredictNoImg").hide();
                                    $("#PredictMaybeImg").hide();
                                    break;
                                case "n":
                                    document.getElementById("PredictNoImg").src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/checked.png";
                                    $("#PredictNoImg").show();
                                    $("#PredictYesImg").hide();
                                    $("#PredictMaybeImg").hide();
                                    break;
                                case "u":
                                    document.getElementById("PredictMaybeImg").src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/checked.png";
                                    $("#PredictMaybeImg").show();
                                    $("#PredictNoImg").hide();
                                    $("#PredictYesImg").hide();
                                    break;
                            }
                        } else {
                            // no vote yey
                            $("#PredictYesImg").show();
                            $("#PredictNoImg").show();
                            $("#PredictMaybeImg").show();
                        }

                        if (expVote) {
                            $('.expired-choices img').unbind('click');
                            switch (expVote) {
                                case "y":
                                    document.getElementById("ExpPredictYesImg").src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/checked.png";
                                    $("#ExpPredictYesImg").show();
                                    $("#ExpPredictNoImg").hide();
                                    $("#ExpPredictMaybeImg").hide();
                                    break;
                                case "n":
                                    document.getElementById("ExpPredictNoImg").src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/checked.png";
                                    $("#ExpPredictNoImg").show();
                                    $("#ExpPredictYesImg").hide();
                                    $("#ExpPredictMaybeImg").hide();
                                    break;
                                case "u":
                                    document.getElementById("ExpPredictMaybeImg").src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/checked.png";
                                    $("#ExpPredictMaybeImg").show();
                                    $("#ExpPredictNoImg").hide();
                                    $("#ExpPredictYesImg").hide();
                                    break;
                            }
                        } else {
                            // no vote yey
                            $("#ExpPredictYesImg").show();
                            $("#ExpPredictNoImg").show();
                            $("#ExpPredictMaybeImg").show();
                        }
                    }, function(theErr) {
                        $("#PredictYesImg").show();
                        $("#PredictNoImg").show();
                        $("#PredictMaybeImg").show();
                        $("#ExpPredictYesImg").show();
                        $("#ExpPredictNoImg").show();
                        $("#ExpPredictMaybeImg").show()
                    });
            }

        }


        return {
            InitPredictPage: InitPredictPage

        }
    }
);