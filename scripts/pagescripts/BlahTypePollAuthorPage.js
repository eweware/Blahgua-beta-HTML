/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */


define('BlahTypePollAuthorPage',
    [],
    function () {

        var validateCallback = null;

        var  InitializePage = function(callback) {

            validateCallback = callback;

            $(".add-poll-choice-btn").click(function(theEvent) {
                var newHTML = CreatePollChoiceElement();
                $(".poll-result-table").append(newHTML);
                UpdatePollChoiceBtn();
                $('.delete-poll-vote').click(function(theEvent) {
                    $(theEvent.target).closest(".poll-result-row").remove();
                    $('.poll-title').each(function (index, item) {
                        $(item).attr("placeholder", "option " + (index + 1));
                    });
                });
                $(".poll-title").change(validateCallback).keydown(validateCallback);

            });
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
                if (item.value == "")
                msg = "Each poll response must have a title.  ";
            });

            return msg;
        }

        var CreatePollChoiceElement = function() {
            var numItems = $(".poll-result-row").length + 1;
            var newHTML = "";
            newHTML += "<tr class='poll-result-row'>" +
                "<td> " +
                "<table> "+
                    "<tr>  " +
                        '<td><input type="text" class="poll-title" placeholder="option ' + numItems + '"></td>' +
                            '<td style="width:16px"></td>' +
                            '<td style="width:100px"><button class="delete-poll-vote inline-button">remove</button></td> ' +
                        '</tr> ' +
                        '<tr>' +
                            '<td colspan="2"><input type="text" class="poll-description" placeholder="optional descriptive text"></td>' +
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