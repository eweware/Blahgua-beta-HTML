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
                $(".poll-result").append(newHTML);
               RefreshPollEvents();

            });

            $(document).on("click", ".poll-result-row .delete-btn", function(theEvent) {
                var $el = $(theEvent.target);
                $el.closest(".poll-result-row").remove();
            });

            RefreshPollEvents();
        };

        var RefreshPollEvents = function() {
            UpdatePollChoiceBtn();
            $('.delete-poll-vote').click(function(theEvent) {
                $(theEvent.target).closest(".poll-result-row").remove();
                $('.poll-title').each(function (index, item) {
                    $(item).attr("placeholder", "option " + (index + 1));
                });
            });
            $(".poll-title").change(validateCallback).keydown(validateCallback);
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
            var $polls = $(".poll-title");
            if ($polls.length < 2) {
                msg = "A poll must have at least two responses."
            } else {
                $polls.each(function(index, item) {
                    if (item.value == "")
                        msg = "Each poll response must have a title.  ";
                });
            }

            return msg;
        }

        var CreatePollChoiceElement = function() {
            var numItems = $(".poll-result-row").length + 1;
            var newHTML = "";
            newHTML += '<div class="poll-result-row">' +
                            '<div class="title"><input type="text" class="poll-title" placeholder="option ' + numItems + '">' +
                                '<div class="delete-btn" onclick=""></div>' +
                             '</div>' +
                            '<div class="description"><input type="text" class="poll-description" placeholder="optional descriptive text"></div>' +
                        '</div>';
            return newHTML;
        };

        return {
            InitializePage: InitializePage,
            ValidateCreate: ValidateCreate,
            PrepareCreateBlahJSON: PrepareCreateBlahJSON
        }
    }


);