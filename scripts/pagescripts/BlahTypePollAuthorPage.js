/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePollAuthorPage',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var  InitializePage = function() {
            $(".add-poll-choice-btn").click(function(theEvent) {
                var newHTML = CreatePollChoiceElement();
                $(".poll-result-table").append(newHTML);
                UpdatePollChoiceBtn();
            })
        };

        var UpdatePollChoiceBtn = function() {
            if ( $(".poll-result-row").length >= 10)
                $(".add-poll-choice-btn").attr('disabled','disabled');
            else
                $(".add-poll-choice-btn").removeAttr('disabled');
        };

        var PrepareCreateBlahJSON = function() {
            var pollItems = [];
            var curPollItem;
            $(".poll-result-row").each(function(index, item) {
                curPollItem = new Object();
                curPollItem["G"] = $(item).find(".poll-title").val();
                curPollItem["T"] = $(item).find(".poll-description").val();
                pollItems.push(curPollItem);
            });

            options = new Object();
            options["I"] = pollItems;

            return options;
        };

        var ValidateCreate = function() {
            var msg = "";
            $(".poll-title").each(function(index, item) {
                if (item.val() == "")
                msg = "each poll response must have a title";
            });

            return msg;
        }

        var CreatePollChoiceElement = function() {
            var newHTML = "";
            newHTML += "<tr class='poll-result-row'>" +
                "<td> " +
                "<table> "+
                    "<tr>  " +
                        '<td><input type="text" class="poll-title" placeholder="option 1"></td>' +
                            '<td class="poll-chart-holder">' +
                                '<div class="poll-chart-div" style="width:20%"> ' +
                                    '<span class="poll-vote-text">no votes</span> ' +
                                '</div> ' +
                            '</td> ' +
                            '<td><button class="delete-poll-vote"></button></td> ' +
                        '</tr> ' +
                        '<tr>' +
                            '<td></td>' +
                            '<td><input type="text" class="poll-description" placeholder="optional descriptive text"></td>' +
                            '</tr> ' +
                        '</table> ' +
                    '</td>' +
                '</tr>';

            return newHTML;
        };

        return {
            InitializePage: InitializePage,
            ValidateCreate: ValidateCreate,
            PrepareCreateBlahJSON: PrepareCreateBlahJSON
        }
    }
);