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

                // adjust the sizes
                var widths = $('.poll-title').map(function() {
                    return $(this).width();
                }).get();
                var maxWidth = Math.max.apply( Math, widths );
                $('.poll-title').width(maxWidth);

                // add methods
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

                UpdatePollPage();
            }
        }

        var UpdatePollChart = function() {
            var votes = G.CurrentBlah.J;
            var newChoice;
            var maxVotes = 0, curVotes;
            for (var curIndex in votes) {
                curVotes = votes[curIndex];
                if (curVotes > maxVotes) {
                    maxVotes = curVotes;
                }
            }

            $(".poll-result-row").each(function(index, item) {
                var myIndex = Number(item.getAttribute("data-poll-vote"));
                var curVote = G.CurrentBlah.J[myIndex];
                var ratio = curVote/ maxVotes;
                var curRatio = Math.floor(100 * ratio);
                var newWidth = curRatio + "%";
                if (curVote > 0)
                    $(item).find(".poll-vote-text").text(curVote).removeClass("no-votes");
                else
                    $(item).find(".poll-vote-text").html("no&nbsp;votes").addClass("no-votes");
                $(item).find(".poll-chart-div").animate({width: newWidth}, 200);
            });
        };

        var UpdatePollPage = function() {
            if (G.IsUserLoggedIn) {
                blahgua_rest.GetUserPollVote(G.CurrentBlah._id, function (json) {
                    if (json.hasOwnProperty("W")) {
                        // user voted - show their vote icon, disable
                        // all others, show chart
                        var selector = "[data-poll-vote=" + json.W + "] img";
                        var img = $(selector);
                        $(".poll-prompt").text("check out your vote:");
                        $(".poll-checkbox").hide();
                        img.addClass("checked").show();
                        $(".poll-chart-div").show()
                        $('.poll-checkbox').unbind('click');
                        UpdatePollChart();
                    } else if (G.CurrentBlah.A == G.CurrentUser._id) {
                        $(".poll-prompt").text("your poll results so far");
                        // user's own blah - can't vote
                        $(".poll-checkbox").hide();
                        $(".poll-chart-div").show();
                        $('.poll-checkbox').unbind('click');
                        UpdatePollChart();
                    } else {
                        // user did not vote - they can vote!
                        $(".poll-chart-div").css({width: "50%"});
                        $(".poll-vote-text").text("?");
                        $(".poll-prompt").text("vote to see the results!");
                        $(".poll-checkbox").show();
                        $(".poll-chart-div").show();
                    }
                });
            } else {
                // user isnot logged in - can't vote or see results
                $(".poll-prompt").text("Sign in to vote and see results")
                $(".poll-checkbox").hide();
                $(".poll-chart-div").hide();
            }
        };

        var CreatePollChoiceElement = function(pollChoice, curVotes, maxVotes, choiceIndex) {
            var description = G.GetSafeProperty(pollChoice, "T", "");
            var newHTML = "";
            newHTML += "<tr class='poll-result-row' data-poll-vote='" + choiceIndex + "'>" +
                "<td><table>" +
                "  <tr>" +
                "    <td class='poll-checkbox-wrapper'>" +
                "      <img class='poll-checkbox'>" +
                "    </td>" +
                '    <td><div class="poll-title">' + pollChoice.G + '</div></td>' +
                '    <td class="poll-chart-holder">' +
                '      <div class="poll-chart-div" style="width:0%">' +
                '      <span class="poll-vote-text">' + curVotes + '</span></div>' +
                '    </td>' +
                '  </tr>' +
                '  <tr>' +
                '    <td></td><td colspan=2><span class="poll-description">' + description + '</span></td>' +
                '  </tr>' +
                "</table></td></tr>";

            return newHTML;
        };




        return {
            InitPollPage: InitPollPage

        }
    }
);