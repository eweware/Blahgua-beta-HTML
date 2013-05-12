/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePoll',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var UpdatePollPage = function(previewAreaName) {

            if (CurrentBlah.hasOwnProperty("I")) {
                var choices = CurrentBlah.I;
                var votes = CurrentBlah.J;
                var newChoice;
                var maxVotes = 0, curVotes;
                for (var curIndex in votes) {
                    curVotes = votes[curIndex];
                    if (curVotes > maxVotes) {
                        maxVotes = curVotes;
                    }
                }

                previewAreaName = "#" + previewAreaName;
                var targetTable =  $(previewAreaName).find("table");
                var newHTML = "";
                for (var curIndex in choices) {
                    newChoice = CreatePollChoiceElement(choices[curIndex],votes[curIndex], maxVotes, curIndex);
                   newHTML += newChoice;
                }
                targetTable[0].innerHTML = newHTML;

                if (IsUserLoggedIn)
                    blahgua_rest.GetUserPollVote(CurrentBlah._id, OnGetUserPollVoteOK);
            }
        };

        var OnGetUserPollVoteOK = function(json) {
            if (json.hasOwnProperty("W")) {
                // disable all vote buttons
                $(".PollVoteIcon").remove();
                $(".PollVoteText")[Number(json.W)].style.color = "#FF0000";
                $(".PollVoteText")[Number(json.W)].style.fontWeight = "bold";
            }
        };

        var CreatePollChoiceElement = function(pollChoice, curVotes, maxVotes, choiceIndex) {
            var maxWidth = $("body").width() - 280;
            var ratio = curVotes/ maxVotes;
            var curRatio = Math.floor(100 * ratio);
            var description = getSafeProperty(pollChoice, "T", "");

            var newHTML = "";
            newHTML += "<tr class='poll-result-row' data-poll-vote='" + choiceIndex + "'><table><tr>" +
                "<td rowspan=2 class='poll-checkbox-wrapper'>" +
                "<img class='poll-checkbox' src='http://blahgua-webapp.s3.amazonaws.com/img/unchecked.png'>" +
                "</td>" +
                '<td rowspan=2><span class="poll-title">' + pollChoice.G + '</span></td>' +
                '<td class="poll-chart-holder">' +
                '<div class="poll-chart-div" style="width:' + curRatio + '%"</div>' +
                '<span class="poll-vote-text">' + curVotes + '</span>' +
                '</td>' +
                '</tr>' +
                '<tr><td><span class="poll-description">' + description + '</span></td></tr>' +
                "</table></tr>";

            return newHTML;
        };

        var DoPollVote = function(theChoice) {
            var who = event.target || event.srcElement;

            blahgua_rest.SetUserPollVote(CurrentBlah._id, Number(who.id), OnSetUserPollVoteOk, OnPollVoteFail);
        };

        var OnSetUserPollVoteOk = function(json) {
            alert("Poll vote recorded");
        }

        var OnPollVoteFail = function(json) {
            alert("Poll vote failed!");
        };


        return {
            UpdatePollPage: UpdatePollPage

        }
    }
);