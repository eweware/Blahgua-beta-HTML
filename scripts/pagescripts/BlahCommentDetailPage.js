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
                var titleBottom;

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

             if (!G.IsUploadCapable) {
                 $("#ImagePreviewDiv").hide();
                 $(".hidden-upload").hide();
             }
             $("#CommentImage").change(comments.UploadCommentImage);


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
                if (!RefreshForCommentText()) {
                    exports.CurrentCommentText = "";
                    $("#CommentImage").attr("disabled", false)
                    document.getElementById("AddCommentBtn").disabled = true;
                    $commentTextArea.disabled = true;
                    comments.DoAddComment(function(newComment) {
                        comments.UpdateBlahComments(newComment);
                        $("#CommentTextArea").empty().removeAttr('disabled').focus();
                        $("#ImagePreviewDiv").addClass("no-image").css({"background-image":"none"});
                        $("#ImagePreviewDiv span").text("no image");
                        $("#ImagePreviewDiv i").hide();
                        $("#CommentImage").val("");
                        $("#objectId").val("");
                        RefreshForCommentText();
                    });
                }
            });

             $("#SignInToCommentArea").hide();
             $("#CreateCommentArea").show();
             if (!G.IsMobile) {
                 $("#CommentTextArea").focus();
                 document.getElementById("AddCommentBtn").disabled = true;
                 $("#CommentTextArea").keyup(RefreshForCommentText);
                 $("#CommentTextArea").keydown(function(theEvent) {
                     if (theEvent.ctrlKey && theEvent.keyCode == 13) {
                         if (!document.getElementById("AddCommentBtn").disabled) {
                             $("#AddCommentBtn").click();
                         }
                     }
                 });
             }
             $("#CommentTextArea").val(exports.CurrentCommentText);
             RefreshForCommentText();

        } else {
         // user is not logged in
             $("#SignInToCommentArea").show();
             $(".sign-in-comment-button").click(SignInToComment);
             //$("#CreateCommentArea").hide();
             titleBottom =  document.getElementById("SignInToCommentArea").getBoundingClientRect().bottom;


         }


            if (G.IsShort) {
                // reparent that footer.
                $("#FullBlahBlahTableFooter").remove();
                $("#ShortScreenScrollDiv").css({"bottom":"42px"});
                $("#FullBlahCommentsContainer").css({ 'overflow-x': 'visible' , 'overflow-y': 'visible'});
            } else {
                var curTop = document.getElementById("FullBlahCommentsContainer").getBoundingClientRect().top;
                var curBottom = document.getElementById("BlahPageFooter").getBoundingClientRect().top;
                var maxSize = curBottom - curTop + "px";
                $("#FullBlahCommentsContainer").css({ 'max-height': maxSize , 'min-height': maxSize});
            }


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
            var tooManyOrFew = ((charCount < 3) || (charCount > 1500));
            if (G.IsMobile)
                document.getElementById("AddCommentBtn").disabled = false;
            else
                document.getElementById("AddCommentBtn").disabled = tooManyOrFew;
            var color = "rgb(124,124,124)";
            if (tooManyOrFew)
                color = "rgb(248,120,88)";
            $("#CharCountDiv").text(1500 - charCount).css({"color": color});
            exports.CurrentCommentText = textField.value;
            return tooManyOrFew;
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
