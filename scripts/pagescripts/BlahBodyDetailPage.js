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
                alert("Error:  No Blah!");
                return;
            }

            // bind methods
            $("#PromoteBlahImage").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                SetBlahVote(1);
            });
            $("#DemoteBlahImage").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                SetBlahVote(-1);
            });

            // add share this button
            var shareURL;
            shareURL = G.GetItemImage(G.CurrentBlah, "D");
            if (shareURL == "") {
                shareURL = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/images/Blahgua+logo.PNG";
            }
            stWidget.addEntry({
                "service":"sharethis",
                "element":document.getElementById('ShareBlah'),
                "url":"https://beta.blahgua.com?blahId=" + G.CurrentBlah._id,
                "title":G.UnCodifyText(G.GetSafeProperty(G.CurrentBlah, "T","A Blah from Blahgua")),
                "type":"large",
                "text": "Share this blah" ,
                "image":shareURL,
                "onhover": false,

                "summary":G.GetSafeProperty(G.CurrentBlah, "F","") });


            $("#SuggestSignInDiv").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
               exports.SuggestUserSignIn("Sign in to promote, demote and comment")
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


                if (isOwnBlah) {
                    if (image != "") {
                        $("#UploadImageTable").hide();
                    }
                } else {
                    $("#UploadImageTable").hide();
                }
            } else {
                $("#BlahRowVote").hide();
                $("#BlahRowSignIn").show();
                $("#UploadImageTable").hide();
                $("#CreateCommentArea").hide();
            }

            UpdateVoteBtns();

            var imageEl = document.getElementById("blahFullImage");
            if (image == "") {
                imageEl.style.display = "none";
                $(".blah-body-divider").show();
            } else {
                imageEl.style.display = "absolute";
                $(".blah-body-divider").hide();
                imageEl.src = image;
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
            }

            // check if it is a special type
            switch (exports.GetBlahTypeStr()) {
                case "predicts":
                    require(['BlahTypePredict'], function(PredictModule) {
                        $("#AdditionalInfoArea").load(G.FragmentURL + "/pages/BlahTypePredictPage.html #BlahTypePredict",
                            function() { PredictModule.InitPredictPage(); });
                    });
                    break;
                case "polls":
                    require(['BlahTypePoll'], function(PollModule) {
                        $("#AdditionalInfoArea").load(G.FragmentURL + "/pages/BlahTypePollPage.html #BlahTypePoll",
                            function() { PollModule.InitPollPage(); });
                    });
                    break;
                default:
            }

            // fix any sizing issues
            var winHeight = $(window).height() - 16;
            var curTop = document.getElementById("FullBlahContent").getBoundingClientRect().top;
            var curBottom = document.getElementById("FullBlahBlahTableFooter").getBoundingClientRect().top;
            var maxSize = curBottom - curTop + "px";
            $("#FullBlahContent").css({
                'max-height': maxSize,
                'min-height': maxSize });

            // handle the top comments
            if (G.GetSafeProperty(G.CurrentBlah, "C", 0) == 0)
                $(".top-comments-header").hide();
            comments.UpdateTopComments();
            document.getElementById("AddCommentBtn").disabled = true;
            if (G.IsUserLoggedIn) {
                $("#AddCommentBtn").disabled;
                $("#CreateCommentArea").show();
                $("#CommentTextArea").focus();
                $("#CommentTextArea").keydown(function(theEvent) {
                   if (theEvent.ctrlKey && theEvent.keyCode == 13) {
                       if (!document.getElementById("AddCommentBtn").disabled) {
                           $("#AddCommentBtn").click();
                       }
                   }
                });
                $("#CommentTextArea").keyup(RefreshForCommentText);
                $("#CommentTextArea").val(exports.CurrentCommentText);
                $("#CommentImage").change(comments.UploadCommentImage);

                $("#AddCommentBtn").click(function(theEvent) {
                    exports.CurrentCommentText = "";
                    document.getElementById("AddCommentBtn").disabled = true;
                    document.getElementById("CommentTextArea").disabled = true;
                    comments.DoAddComment(function(newComment) {
                        comments.InsertNewComment(newComment);
                        $(".top-comments-header").show();
                        $("#CharCountDiv").text(4000);
                        $("#CommentTextArea").empty().height("40px").removeAttr('disabled').focus();
                        $("#CommentImage").val("").change();
                    });
                });
                RefreshForCommentText();
            } else {
                $("#CreateCommentArea").hide();
            }
        };

        var RefreshForCommentText = function() {
            var textField =  document.getElementById("CommentTextArea");
            var charCount =  textField.value.length;
            var tooManyOrFew = ((charCount < 3) || (charCount > 4000));
            document.getElementById("AddCommentBtn").disabled = tooManyOrFew;
            var color = "#000000";
            if (tooManyOrFew)
                color = "#FF0000";
            $("#CharCountDiv").text(4000 - charCount).css({"color": color});
            exports.CurrentCommentText = textField.value;
        };


        var UpdateVoteBtns = function() {
            var promoBtn =  document.getElementById("PromoteBlahImage");
            var demoBtn = document.getElementById("DemoteBlahImage");

            if (G.IsUserLoggedIn) {
                if (G.CurrentBlah.A == G.CurrentUser._id) {
                    // own blah - can't vote
                    promoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_promote_disabled.png";
                    promoBtn.disabled = true;
                    demoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_demote_disabled.png";
                    demoBtn.disabled = true;
                } else {
                    // not own blah - can vote.  Did they?
                    var userVote = G.GetSafeProperty(G.CurrentBlah, "uv", 0);
                    if (userVote && (userVote != 0)) {
                        demoBtn.disabled = true;
                        promoBtn.disabled = true;
                        if (userVote == 1) {
                            promoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_promote_checked.png";
                            demoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_demote_disabled.png";
                        } else {
                            promoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_promote_disabled.png";
                            demoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_demote_checked.png";
                        }
                    } else {
                        // user can vote
                        promoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_promote.png";
                        promoBtn.disabled = false;
                        demoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_demote.png";
                        demoBtn.disabled =false;
                    }
                }
            } else {
                // not logged in - can't vote
                /*
                promoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_promote_disabled.png";
                promoBtn.disabled = true;
                demoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_demote_disabled.png";
                demoBtn.disabled = true;
                */
            }
        };

        var SetBlahVote = function(theVote) {
            if (!window.event.srcElement.disabled) {
                blahgua_rest.SetBlahVote(G.CurrentBlah._id, theVote, function(json) {
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
