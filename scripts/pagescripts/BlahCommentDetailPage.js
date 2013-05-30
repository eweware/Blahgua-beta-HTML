/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('BlahCommentDetailPage',
    ["globals", "ExportFunctions", "comments"],
    function (G, exports, comments) {

        var InitializePage = function() {
            // bind events
            $("#SortBySelect").change(function(theEvent) {
                UpdateCommentSort();
            });

            $("#SortOrderSelect").change(function(theEvent) {
                UpdateCommentSort();
            });

            $("#FilterBox").keyup(function(theEvent) {
                comments.SetCommentFilter($("#FilterBox").val());
            });

         if (G.IsUserLoggedIn)  {
                $("#AddCommentBtn").click(function(theEvent) {
                    exports.CurrentCommentText = "";
                    document.getElementById("AddCommentBtn").disabled = true;
                    document.getElementById("CommentTextArea").disabled = true;
                    comments.DoAddComment(function(newComment) {
                        comments.UpdateBlahComments(newComment);
                        $("#CommentTextArea").empty().height("40px").removeAttr('disabled').focus();
                    });
                });
            }

            var curTop = document.getElementById("CommentHeaderArea").getBoundingClientRect().bottom;
            var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
            var maxSize = curBottom - curTop + "px";
            $("#CommentContainer").css({ 'max-height': maxSize, 'min-height':maxSize});
            $("#CommentTextArea").focus();

            var titleBottom;

            // update the input area
            if (G.IsUserLoggedIn) {
                document.getElementById("AddCommentBtn").disabled = true;
                $("#SignInToCommentArea").hide();
                $("#CreateCommentArea").show();
                titleBottom =  document.getElementById("CreateCommentArea").getBoundingClientRect().bottom;
                $("#CommentTextArea").keyup(RefreshForCommentText);
                $("#CommentTextArea").keydown(function(theEvent) {
                    if (theEvent.ctrlKey && theEvent.keyCode == 13) {
                        $("#AddCommentBtn").click();
                    }
                });
                $("#CommentTextArea").val(exports.CurrentCommentText);
                RefreshForCommentText()
            } else {
                $("#SignInToCommentArea").show();
                $(".sign-in-button").click(SignInToComment);
                $("#CreateCommentArea").hide();
                titleBottom =  document.getElementById("SignInToCommentArea").getBoundingClientRect().bottom;
            }

            if (G.CurrentBlah.hasOwnProperty("C") && G.CurrentBlah.C > 0)
                $(".comment-sort-area").show();
            else
                $(".comment-sort-area").hide();
            comments.UpdateBlahComments();

        };

        var RefreshForCommentText = function() {
            // disable button if there is not enough text
            var textField =  document.getElementById("CommentTextArea");
            document.getElementById("AddCommentBtn").disabled = (textField.value.length < 3);

            //  the following will help the text expand as typing takes place
            while($(textField).outerHeight() < textField.scrollHeight) {
                $(textField).height($(textField).height()+1);
            }
            exports.CurrentCommentText = textField.value;
            // handle the sizing
            var curTop = document.getElementById("CommentHeaderArea").getBoundingClientRect().bottom;
            var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
            var maxSize = curBottom - curTop + "px";
            $("#CommentContainer").css({ 'max-height': maxSize, 'min-height':maxSize});
        };

        var UpdateCommentSort = function() {
            comments.SetCommentSort($("#SortBySelect").val(), $("#SortOrderSelect").val());
        };



        var SignInToComment = function() {
            exports.SuggestUserSignIn("Sign in to comment");
        };

        return {
            InitializePage: InitializePage
        }
    }
);
