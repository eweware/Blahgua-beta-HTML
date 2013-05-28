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
            $("#FavoriteBlahImage").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                //todo: implement blah favorite
                alert("not implemented");
            });

            $("#SuggestSignInDiv").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                //todo: implement blah favorite
               exports.SuggestUserSignIn("Sign in to promote, demote and comment")
            });


            var isOwnBlah;


            if (G.IsUserLoggedIn) {
                isOwnBlah = (G.CurrentBlah.A == G.CurrentUser._id);

            } else {
                isOwnBlah = false;

            }
            var image = G.GetItemImage(G.CurrentBlah, "B");



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
            comments.UpdateTopComments();
            document.getElementById("AddCommentBtn").disabled = true;
            if (G.IsUserLoggedIn) {
                $("#AddCommentBtn").disabled;
                $("#CreateCommentArea").show();
                $("#CommentTextArea").focus();
                $("#CommentTextArea").keyup(function(e) {
                    // disable button if there is not enough text
                    document.getElementById("AddCommentBtn").disabled = (this.value.length < 3);

                    //  the following will help the text expand as typing takes place
                    while($(this).outerHeight() < this.scrollHeight) {
                        $(this).height($(this).height()+1);
                    };

                });

                $("#AddCommentBtn").click(function(theEvent) {
                    document.getElementById("AddCommentBtn").disabled = true;
                    document.getElementById("CommentTextArea").disabled = true;
                    comments.DoAddComment(function(newComment) {
                        comments.InsertNewComment(newComment);
                        $("#CommentTextArea").empty().height("40px").removeAttr('disabled').focus();
                    });

                });
            } else {
                $("#CreateCommentArea").hide();
            }
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
                promoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_promote_disabled.png";
                promoBtn.disabled = true;
                demoBtn.src = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/black_demote_disabled.png";
                demoBtn.disabled = true;
            }
        };

        var SetBlahVote = function(theVote) {
            if (!window.event.srcElement.disabled) {
                blahgua_rest.SetBlahVote(G.CurrentBlah._id, theVote, function(json) {
                    var oldVote;
                    G.CurrentBlah["uv"] = theVote;
                    if (theVote == 1) {
                        oldVote = G.GetSafeProperty(CurrentBlah, "P", 0);
                        oldVote++;
                        G.CurrentBlah["P"] = oldVote;
                    } else {
                        oldVote = G.GetSafeProperty(CurrentBlah, "D", 0);
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
