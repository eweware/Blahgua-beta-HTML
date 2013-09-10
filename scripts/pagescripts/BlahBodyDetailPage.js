/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('BlahBodyDetailPage',
    ["globals", "ExportFunctions", "blahgua_restapi", "comments"],
    function (G, exports, blahgua_rest, comments) {

        var InitializePage = function() {
            G.CurrentComments = null;
            if (G.CurrentBlah == null) {
                console.log("Error:  No Post!");
                return;
            }
            if (G.IsUserLoggedIn) 
			{
            // bind methods
            $("#PromoteBlahImage").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                SetBlahVote(1);
            });
            $("#DemoteBlahImage").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                SetBlahVote(-1);
            });
			}
			else
			{
			$("#PromoteBlahImage").click(function(theEvent) {
               G.PromptUser("Sign in to participate."," Sign in","Cancel",function(){
                   theEvent.stopImmediatePropagation();
                exports.SuggestUserSignIn("Sign in to participate.")});
            });
            $("#DemoteBlahImage").click(function(theEvent) {
			G.PromptUser("Sign in to participate."," Sign in","Cancel",function(){
                theEvent.stopImmediatePropagation();
               exports.SuggestUserSignIn("Sign in to participate.")});
			
            });
			}

            // add share this button
            var shareURL;
            shareURL = G.GetItemImage(G.CurrentBlah, "D");
            if (shareURL == "") {
                shareURL = BlahguaConfig.fragmentURL + "images/Blahgua+logo.PNG";
            }
            stWidget.addEntry({
                "service":"sharethis",
                "element":document.getElementById('ShareBlah'),
                "url": BlahguaConfig.shareURL + "?blahId=" + G.CurrentBlah._id,
                "title":G.UnCodifyText(G.GetSafeProperty(G.CurrentBlah, "T","A post from blahgua")),
                "type":"large",
                "text": "Share this post" ,
                "image":shareURL,
                "onhover": false,

                "summary":G.GetSafeProperty(G.CurrentBlah, "F","") });


            $("#SuggestSignInDiv").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
               exports.SuggestUserSignIn("Sign in to participate.")
            });


            var isOwnBlah;


            if (G.IsUserLoggedIn) {
                isOwnBlah = (G.CurrentBlah.A == G.CurrentUser._id);

            } else {
                isOwnBlah = false;

            }
            var image = G.GetItemImage(G.CurrentBlah, "D");



            if (G.IsUserLoggedIn) {

                $("#BlahRowVote").show();
                $("#BlahRowSignIn").hide();
                $("#UploadImageTable").show();
                $("#SignInToCommentArea").hide();

                if (isOwnBlah) {
                    if (image != "") {
                        $("#UploadImageTable").hide();
                    }
                } else {
                    $("#UploadImageTable").hide();
                }
            } else {

                $("#BlahRowSignIn").hide();
	            $("#UploadImageTable").hide();
                $("#SignInToCommentArea").show();

                $(".sign-in-comment-button").click(function(theEvent){
                    theEvent.stopImmediatePropagation();
                    exports.SuggestUserSignIn("Sign in to participate.");

                });
            }

            UpdateVoteBtns();

            var imageEl = document.getElementById("blahFullImage");
            if (image == "") {
                imageEl.style.display = "none";
                $(".blah-body-divider").hide();
            } else {
                imageEl.style.display = "absolute";
                $(".blah-body-divider").hide();
                var theRect = document.getElementById("FullBlahContent").getBoundingClientRect();
                var maxSize = Math.round(theRect.width * .95);
                $("#blahFullImage").css({"max-width":maxSize + "px"});
                imageEl.src = image;

            }
              if (G.CurrentBlah.hasOwnProperty("C") && G.CurrentBlah.C > 0) {
			   $("#CommentTextArea").attr("placeholder","Enter comment text here");
			  }
			  else {
			    $("#CommentTextArea").attr("placeholder","Be the first to comment");
			  }
            var bodyTextDiv = document.getElementById("BlahFullBody");
            if (G.CurrentBlah.hasOwnProperty("F")) {
                var bodyText = G.CurrentBlah.F;
                if (bodyText && (bodyText != "")) {
                     bodyText = G.UnCodifyText(bodyText);
                }
                bodyTextDiv.innerHTML = bodyText;
            } else {
                bodyTextDiv.innerHTML = "";
                bodyTextDiv.style.display = "none";
            }

            // check if it is a special type
            switch (exports.GetBlahTypeStr()) {
                case "predicts":
                    require(['BlahTypePredict'], function(PredictModule) {
                        $("#AdditionalInfoArea").load(BlahguaConfig.fragmentURL + "pages/BlahTypePredictPage.html #BlahTypePredict",
                            function() { PredictModule.InitPredictPage(); });
                    });
                    break;
                case "polls":
                    require(['BlahTypePoll'], function(PollModule) {
                        $("#AdditionalInfoArea").load(BlahguaConfig.fragmentURL + "pages/BlahTypePollPage.html #BlahTypePoll",
                            function() { PollModule.InitPollPage(); });
                    });
                    break;
                default:
                    $("#AdditionalInfoArea").html("<div class='no-item-div'></div>");
                    break;
            }

            // fix any sizing issues
            if (G.IsShort) {
                // reparent that footer.
                $("#BlahPageFooter").before($("#FullBlahBlahTableFooter"));
                $("#ShortScreenScrollDiv").css({"bottom":"76px"});
            } else {
                var curTop = document.getElementById("FullBlahContent").getBoundingClientRect().top;
                var curBottom = document.getElementById("FullBlahBlahTableFooter").getBoundingClientRect().top;
                var maxSize = curBottom - curTop + "px";
                $("#FullBlahContent").css({
                    'max-height': maxSize,
                    'min-height': maxSize });
            }


            // handle the top comments
            if (G.GetSafeProperty(G.CurrentBlah, "C", 0) == 0)
                $(".top-comments-header").hide();
            comments.UpdateTopComments();

            if (G.IsUserLoggedIn) {
                $("#CreateCommentArea").show();
                if (G.IsMobile) {
                    //$("#CharCountDiv").text("(3-4000 chars)");
                } else  {
                    document.getElementById("AddCommentBtn").disabled = true;
                    //$("#CommentTextArea").focus();
                    $("#CommentTextArea").keydown(function(theEvent) {
                        if (theEvent.ctrlKey && theEvent.keyCode == 13) {
                            if (!document.getElementById("AddCommentBtn").disabled) {
                                $("#AddCommentBtn").click();
                            }
                        }
                    });
                    $("#CommentTextArea").keyup(RefreshForCommentText);
                }

                $("#CommentTextArea").val(exports.CurrentCommentText);
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
                        $("#CommentImage").attr("disabled", false);
                        document.getElementById("AddCommentBtn").disabled = true;
                        document.getElementById("CommentTextArea").disabled = true;
                        comments.DoAddComment(function(newComment) {
                            comments.InsertNewComment(newComment);
                            $(".top-comments-header").show();
                            $("#CommentTextArea").empty().removeAttr("disabled");
                            if (!G.IsMobile) {
                                $("#CommentTextArea").focus();
                            }

                            $("#ImagePreviewDiv").addClass("no-image").css({"background-image":"none"});
                            $("#ImagePreviewDiv span").text("no image");
                            $("#ImagePreviewDiv i").hide();
                            $("#CommentImage").val("");
                            $("#objectId").val("");
                            RefreshForCommentText();
                        });
                    }

                });
                RefreshForCommentText();
            }
        };

        var RefreshForCommentText = function() {
            var textField =  document.getElementById("CommentTextArea");
            var charCount =  textField.value.length;
            var tooManyOrFew = ((charCount < 3) || (charCount > 1500));
            if (G.IsMobile) {
                document.getElementById("AddCommentBtn").disabled = false;
            } else {
                document.getElementById("AddCommentBtn").disabled = tooManyOrFew;
            }
            $("#CharCountDiv").text(1500 - charCount).css({"color": color});

            var color = "rgb(124,124,124)";
            if (tooManyOrFew)
                color = "rgb(248,120,88)";

            exports.CurrentCommentText = textField.value;

            return tooManyOrFew;
        };


        var UpdateVoteBtns = function() {
            var $promoBtn =  $("#PromoteBlahImage");
            var $demoBtn = $("#DemoteBlahImage");

            if (G.IsUserLoggedIn) {
                if (G.CurrentBlah.A == G.CurrentUser._id) {
                    // own blah - can't vote
                    $promoBtn.addClass("disabled");
                    $demoBtn.addClass("disabled");
                } else {
                    // not own blah - can vote.  Did they?
                    var userVote = G.GetSafeProperty(G.CurrentBlah, "uv", 0);
                    if (userVote && (userVote != 0)) {
                        $promoBtn.addClass("disabled");
                        $demoBtn.addClass("disabled");
                        if (userVote == 1) {
                            $promoBtn.addClass("checked");
                            $demoBtn.addClass("disabled");
                        } else {
                            $promoBtn.addClass("disabled");
                            $demoBtn.addClass("checked");
                        }
                    } else {
                        // user can vote
                        $promoBtn.removeClass("disabled");
                        $demoBtn.removeClass("disabled");
                    }
                }
            } else {
                // not logged in - can't vote
                /*
                promoBtn.src = BlahguaConfig.fragmentURL + "img/black_promote_disabled.png";
                promoBtn.disabled = true;
                demoBtn.src = BlahguaConfig.fragmentURL + "img/black_demote_disabled.png";
                demoBtn.disabled = true;
                */
            }
        };

        var SetBlahVote = function(theVote) {
            if (!$(window.event.srcElement).hasClass("disabled")) {
                blahgua_rest.SetBlahVote(G.CurrentBlah._id, theVote, function(json) {
                    ga('send', 'event', 'blahvote', 'blah', theVote, 1);
                    var oldVote;
                    G.CurrentBlah["uv"] = theVote;
                    if (theVote == 1) {
                        oldVote = G.GetSafeProperty(G.CurrentBlah, "P", 0);
                        oldVote++;
                        G.CurrentBlah["P"] = oldVote;
                    } else {
                        oldVote = G.GetSafeProperty(G.CurrentBlah, "D", 0);
                        oldVote++;
                        G.CurrentBlah["D"] = oldVote;
                    }
                    UpdateVoteBtns();

                }, exports.OnFailure);
            }
        };


        return {
            InitializePage: InitializePage
        }
    }
);
