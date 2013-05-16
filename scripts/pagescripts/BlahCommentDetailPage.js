/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('BlahCommentDetailPage',
    ["GlobalFunctions", "comments"],
    function (exports, comments) {

        var InitializePage = function() {
            // bind events

            var curTop;
            if (IsUserLoggedIn)  {
                $("#AddCommentBtn").click(function(theEvent) {
                    comments.DoAddComment(comments.UpdateBlahComments);
                });
                curTop = document.getElementById("CommentContainer").getBoundingClientRect().top;
            } else
                curTop = document.getElementById("SignInToCommentArea").getBoundingClientRect().top;

            var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
            var maxSize = curBottom - curTop;
            $("#CommentContainer").css({ 'max-height': maxSize + 'px'});
            $("#CommentTextArea").focus();

            // update the input area
            if (IsUserLoggedIn) {
                document.getElementById("AddCommentBtn").disabled = true;
                $("#SignInToCommentArea").hide();
                $("#CreateCommentArea").show();
                $("#CommentTextArea").keyup(function(e) {
                    // disable button if there is not enough text
                    document.getElementById("AddCommentBtn").disabled = (this.value.length < 3);

                    //  the following will help the text expand as typing takes place
                    while($(this).outerHeight() < this.scrollHeight) {
                        $(this).height($(this).height()+1);
                    };
                    // handle the sizing
                    var titleBottom =  document.getElementById("CreateCommentArea").getBoundingClientRect().bottom;
                    $(".comment-container").css({ 'top': titleBottom + 'px'});
                });
            } else {
                $("#SignInToCommentArea").show();
                $(".sign-in-button").click(SignInToComment);
                $("#CreateCommentArea").hide();
            }

            var titleBottom =  document.getElementById("CreateCommentArea").getBoundingClientRect().bottom;
            $(".comment-container").css({ 'top': titleBottom + 'px'});
            comments.UpdateBlahComments();

        };

        var SignInToComment = function() {
            exports.SuggestUserSignIn("Sign in to comment on a blah!");
        };

        return {
            InitializePage: InitializePage
        }
    }
);
