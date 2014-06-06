/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('BlahCommentDetailPage',
    ["globals", "ExportFunctions","blahgua_restapi", "comments"],
    function (G, exports, blahgua_rest, comments) {


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

             $("#ShowBadgeAreaBtn").click(function(theEvent) {
                 if (!G.IsShort) {
                     var imageRect = $("#ShowBadgeAreaBtn")[0].getBoundingClientRect();
                     var newLeft = imageRect.left;
                     var newTop = imageRect.bottom;
                     $("#ShowBadgeArea").css({"left":newLeft + "px", "top":newTop + "px"});
                 }

                 $("#ShowBadgeAreaHolder").show().click(function(theEvent) {
                     if (theEvent.target.id == "ShowBadgeAreaHolder")
                         $(theEvent.target).hide();
                 });

                 $(".badge-item").click(function(theEvent) {
                     theEvent.stopImmediatePropagation();
                     var $icon = $(this).find("i");
                     if ($icon.hasClass("icon-check-empty")) {
                         $icon.addClass("icon-check").removeClass("icon-check-empty");
                     } else {
                         $icon.addClass("icon-check-empty").removeClass("icon-check");
                     }
                     RefreshBadgePreview();
                 });

                 $(".anonymous-item").click(function(theEvent) {
                     theEvent.stopImmediatePropagation();
                     var $icon = $(this).find("i");
                     if ($icon.hasClass("icon-check-empty")) {
                         $icon.addClass("icon-check").removeClass("icon-check-empty");
                     } else {
                         $icon.addClass("icon-check-empty").removeClass("icon-check");
                     }
                     RefreshBadgePreview();
                 });

             });

             UpdateBadgeArea();


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
                var curBottom = document.getElementById("FullBlahBlahTableFooter").getBoundingClientRect().top;
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

        var UpdateBadgeArea = function() {
            if (G.IsUserLoggedIn) {
                CreateAndAppendAnonPostHTML();
                if (G.CurrentUser.hasOwnProperty("B")) {
                    // add badges
                    $("#BadgesArea").empty();
                    $.each(G.CurrentUser.B, function(index, curBadge) {
                        CreateAndAppendBadgeHTML(curBadge);
                    });
                }
                RefreshBadgePreview();
            }

        };

        var CreateAndAppendBadgeHTML = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var newHTML = "";
                newHTML += "<div class='badge-item' data-badge-id='" + theBadge + "'>";
                newHTML += "<i class='icon-check-empty'></i>";
                newHTML += "<span>" + fullBadge.N + "</span>";
                newHTML += "</div>";

                $("#ShowBadgeArea").append(newHTML);
            });
        };


        var CreateBadgeDescription = function(theBadge) {
            var badgeName = $(theBadge).find("span").text();
            var newHTML = "<tr class='badge-info-row'>";
            newHTML += "<td>";
            newHTML += "<img style='width:16px; height:16px;' src='" + BlahguaConfig.fragmentURL + "img/black_badge.png'>";
            newHTML += "verified <span class='badge-name-class'>"+ badgeName + "</span>";
            newHTML += "</td></tr>";
            return newHTML;
        };

        var CreateAndAppendAnonPostHTML = function() {
            var newHTML = "";
            newHTML += "<div class='anonymous-item'>";
            newHTML += "<i class='icon-check-empty'></i>";
            newHTML += "<span>Use Profile</span>";
            newHTML += "</div>";

            $("#ShowBadgeArea").append(newHTML);
        };

        var RefreshBadgePreview = function() {
            // TODO:  refresh badge area for a comment
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
