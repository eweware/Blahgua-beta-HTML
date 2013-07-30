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
                var $commentTextArea = $("#CommentTextArea");

             $("#CommentImage").change(comments.UploadCommentImage);
             $("#ImagePreviewDiv").click(function(theEvent) {
                 document.getElementById('CommentImage').click();
             } );

             $(".image-delete-btn").click(function(theEvent) {
                 theEvent.stopImmediatePropagation();
                 $("#ImagePreviewDiv").addClass("no-image").css({"background-image":"none"});
                 $("#ImagePreviewDiv span").text("no image");
                 $("#ImagePreviewDiv i").hide();
                 $("#CommentImage").val("");
                 $("#objectId").val("");
                 return false;
             });

                $("#AddCommentBtn").click(function(theEvent) {
                    exports.CurrentCommentText = "";
                    $("#CommentImage").attr("disabled", false)
                    document.getElementById("AddCommentBtn").disabled = true;
                    $commentTextArea.disabled = true;
                    comments.DoAddComment(function(newComment) {
                        $("#CharCountDiv").text(4000);
                        comments.UpdateBlahComments(newComment);
                        $("#CommentTextArea").empty().height("40px").removeAttr('disabled').focus();
                        $("#ImagePreviewDiv").addClass("no-image").css({"background-image":"none"});
                        $("#ImagePreviewDiv span").text("no image");
                        $("#ImagePreviewDiv i").hide();
                        $("#CommentImage").val("");
                        $("#objectId").val("");
                    });
                });
            }



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
                        if (!document.getElementById("AddCommentBtn").disabled) {
                            $("#AddCommentBtn").click();
                        }
                    }
                });
                $("#CommentTextArea").val(exports.CurrentCommentText);
                RefreshForCommentText()
            } else {
                $("#SignInToCommentArea").show();
                $(".sign-in-comment-button").click(SignInToComment);
                $("#CreateCommentArea").hide();
                titleBottom =  document.getElementById("SignInToCommentArea").getBoundingClientRect().bottom;
            }

            var curTop = document.getElementById("CommentHeaderArea").getBoundingClientRect().bottom;
            var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
            var maxSize = curBottom - curTop + "px";
            $("#CommentContainer").css({ 'max-height': maxSize, 'min-height':maxSize});
            $("#CommentTextArea").focus();

            if (G.CurrentBlah.hasOwnProperty("C") && G.CurrentBlah.C > 0)
			{
			    $("#CommentTextArea").attr("placeholder","Enter comment text here"); 
                $(".comment-sort-area").show();
			}
            else
			{
			    $("#CommentTextArea").attr("placeholder","Be the first to comment"); 
                $(".comment-sort-area").hide();
			}
            comments.UpdateBlahComments();

        };

        var RefreshForCommentText = function() {
            var textField =  document.getElementById("CommentTextArea");
            var charCount =  textField.value.length;
            var tooManyOrFew = ((charCount < 0) || (charCount > 4000));
            document.getElementById("AddCommentBtn").disabled = tooManyOrFew;
            var color = "rgb(124,124,124)";
            if (tooManyOrFew)
                color = "rgb(248,120,88)";
            $("#CharCountDiv").text(4000 - charCount).css({"color": color});
            exports.CurrentCommentText = textField.value;
        };

        var UpdateCommentSort = function() {
            comments.SetCommentSort($("#SortBySelect").val(), $("#SortOrderSelect").val());
        };



        var SignInToComment = function() {
            exports.SuggestUserSignIn("Sign in to comment.");
        };

        return {
            InitializePage: InitializePage
        }
    }
);
