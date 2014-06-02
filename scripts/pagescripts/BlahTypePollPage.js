/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePoll',
    ["constants", "globals", "ExportFunctions", "blahgua_restapi"],
    function (K, G, exports, blahgua_rest) {

        var totalVotes = 0;

        var InitPollPage = function() {
            if (G.CurrentBlah.hasOwnProperty("I")) {
                totalVotes = 0;
                var choices = G.CurrentBlah.I;
                var votes = G.CurrentBlah.J;
                var newChoice;
                var maxVotes = 0, curVotes;
                for (var curIndex in votes) {
                    curVotes = votes[curIndex];
                    totalVotes += curVotes;
                    if (curVotes > maxVotes) {
                        maxVotes = curVotes;
                    }
                }



                var targetTable =  $(".poll-result-table");
                var newHTML = "";
                for (var curIndex in choices) {
                    newChoice = CreatePollChoiceElement(choices[curIndex],votes[curIndex], maxVotes, curIndex);
                    newHTML += newChoice;
                }
                targetTable[0].innerHTML = newHTML;


                // add methods
                if(!G.IsUserLoggedIn) {
                    $(".poll-checkbox-wrapper").click(function(theEvent) {
                        G.PromptUser("Sign in to participate."," Sign in","Cancel",function(){
                            theEvent.stopImmediatePropagation();
                            exports.SuggestUserSignIn("Sign in to participate.")});
                    });
                } else {
                    $(".poll-checkbox").click(function(theEvent) {
                        theEvent.stopImmediatePropagation();
                        if($(theEvent.target).attr("disabled") != "disabled") {
                            $('.poll-checkbox').attr('disabled', 'disabled');

                            var theVote = $(theEvent.target).parents("tr.poll-result-row").attr("data-poll-vote");

                            blahgua_rest.SetUserPollVote(G.CurrentBlah._id, theVote,
                                function(json) {
                                    blahgua_rest.GetBlah(G.CurrentBlahId, function(theBlah) {
                                        G. CurrentBlah = theBlah;
                                        UpdatePollPage();
                                    }, function(theErr) {
                                        //todo: handle this error
                                        UpdatePollPage();
                                    });
                                }, function (theErr) {
                                    //todo:  poll specific errors
                                    exports.OnFailure(theErr);
                                }
                            );
                        }

                    });
                }


                UpdatePollPage();
            }
        }

        var UpdatePollChart = function() {
            var votes = G.CurrentBlah.J;
            var newChoice;
            var maxVotes = 0, curVotes, totalVotes = 0;
            var maxWidth = document.getElementById("BlahTypePoll").getBoundingClientRect().width - 100;
            var curWidth;

            for (var curIndex in votes) {
                curVotes = votes[curIndex];
                totalVotes += curVotes;
                if (curVotes > maxVotes) {
                    maxVotes = curVotes;
                }
            }

            $(".poll-result-row").each(function(index, item) {
                var myIndex = Number(item.getAttribute("data-poll-vote"));
                var curVote = G.CurrentBlah.J[myIndex];
                var ratio = curVote/ maxVotes;
                var curRatio = Math.floor(maxWidth * ratio);
                var newWidth = curRatio + "px";
                var votePercent = Math.floor((curVote / totalVotes) * 100) + "%";
                if (curVote > 0) {
                    $(item).find(".poll-vote-text").text(votePercent).removeClass("no-votes");
                }

                else
                    $(item).find(".poll-vote-text").html("no&nbsp;votes").addClass("no-votes");
                $(item).find(".poll-chart-div").animate({width: newWidth}, 200);
            });
        };

        var UpdatePollPage = function() {
            var maxWidth = document.getElementById("BlahTypePoll").getBoundingClientRect().width - 100;
            if (G.IsUserLoggedIn) {
                blahgua_rest.GetUserPollVote(G.CurrentBlah._id, function (json) {
                    if (json.hasOwnProperty("W")) {
                        // user voted - show their vote icon, disable
                        var selector = "[data-poll-vote=" + json.W + "] .poll-title";
                        $(".poll-checkbox").css({"color":"gray"});
                        $('.poll-checkbox').unbind('click');
                        UpdatePollChart();
                         selector = "[data-poll-vote=" + json.W + "] .poll-checkbox";
                        $(selector).addClass("icon-check").removeClass("icon-check-empty");
                    } else {
                        // user did not vote - they can vote!
                        $(".poll-chart-div").css({width: (maxWidth / 2 ) + "px"});
                        $(".poll-vote-text").html("<i class='icon-question-sign unknown-qty-icon' title='vote to see results'></i>");
                    }
                });
            } else {
                // user is not logged in - can't vote or see results
                $('.poll-checkbox').unbind('click');
                $(".poll-checkbox").css({"color":"gray"});
                $(".poll-chart-div").css({width: (maxWidth / 2 ) + "px"});
                $(".poll-vote-text").html("<i class='icon-question-sign unknown-qty-icon' title='sign in and vote to see results'></i>");
            }
        };

        var CreatePollChoiceElement = function(pollChoice, curVotes, maxVotes, choiceIndex) {
            var description = G.GetSafeProperty(pollChoice, "T", "");
            var newHTML = "";
            newHTML += "<tr class='poll-result-row' data-poll-vote='" + choiceIndex + "'>" +
                "<td><table>" +
                "  <tr>" +
                "    <td class='poll-checkbox-wrapper'>" +
                "      <i class='icon-check-empty poll-checkbox'></i>" +
                "    </td>" +
                '    <td class="poll-chart-holder">' +
                '      <div class="poll-chart-div" style="width:0%"></div>' +
                '      <span class="poll-vote-text">' + curVotes + '</span>' +
                '    </td>' +
                '  </tr>' +
                '  <tr>' +
                '    <td></td><td><span class="poll-title response">' + pollChoice.G + '</span><span class="poll-description">' + description + '</span></td>' +
                '  </tr>' +
                "</table></td></tr>";

            return newHTML;
        };


        return {
            InitPollPage: InitPollPage

        }
    }
);