/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('BlahPreview',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var OpenFocusedBlah = function() {
            window.event.cancelBubble = true;
            if (BlahPreviewTimeout != null) {
                clearTimeout(BlahPreviewTimeout);
                BlahPreviewTimeout = null;
            }
            BlahReturnPage = "BlahRoll";
            exports.OpenBlah(FocusedBlah);
        };

        var HandleVoteFailure = function(theErr) {
            exports.OnFailure(theErr);
        };

        var HandleBlahLoadFailure = function(theErr) {
            exports.OnFailure(theErr);
        };

        var HandleAddViewFailure = function(theErr) {
            exports.OnFailure(theErr);
        };

        var SetBlahPreviewVote = function(theVote) {
            if (!window.event.srcElement.disabled) {
                blahgua_rest.SetBlahVote(CurrentBlah._id, theVote, function(json) {
                    var oldVote;
                    CurrentBlah["uv"] = theVote;
                    if (theVote == 1) {
                        oldVote = getSafeProperty(CurrentBlah, "P", 0);
                        oldVote++;
                        CurrentBlah["P"] = oldVote;
                    } else {
                        oldVote = getSafeProperty(CurrentBlah, "D", 0);
                        oldVote++;
                        CurrentBlah["D"] = oldVote;
                    }
                    UpdatePreviewVoteBtns();

                }, HandleVoteFailure);
            }
        };


        var UpdatePreviewVoteBtns = function() {
             var promoBtn =  document.getElementById("PreviewPromoteBlah");
            var demoBtn = document.getElementById("PreviewDemoteBlah");

            if (IsUserLoggedIn) {
                if (CurrentBlah.A == CurrentUser._id) {
                    // own blah - can't vote
                    promoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_promote_disabled.png";
                    promoBtn.disabled = true;
                    demoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_demote_disabled.png";
                    demoBtn.disabled = true;
                } else {
                    // not own blah - can vote.  Did they?
                    var userVote = getSafeProperty(CurrentBlah, "uv", 0);
                    if (userVote && (userVote != 0)) {
                        demoBtn.disabled = true;
                        promoBtn.disabled = true;
                        if (userVote == 1) {
                            promoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_promote_checked.png";
                            demoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_demote_disabled.png";
                        } else {
                            promoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_promote_disabled.png";
                            demoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_demote_checked.png";
                        }
                    } else {
                        // user can vote
                        promoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_promote.png";
                        promoBtn.disabled = false;
                        demoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_demote.png";
                        demoBtn.disabled =false;
                    }
                }
            } else {
                // not logged in - can't vote
                promoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_promote_disabled.png";
                promoBtn.disabled = true;
                demoBtn.src = "http://beta.blahgua.com.s3.amazonaws.com/img/black_demote_disabled.png";
                demoBtn.disabled = true;
            }
        };

        var DoAddCommentPreview = function() {
            BlahOpenPage = "Comments";
            OpenFocusedBlah();
        };


        var InitPreviewPage = function() {
            // bind preview event handlers
            $("#BlahPreview").click(function() {exports.UnfocusBlah(true);});
            $(".blah-opener").click(function(event) {
                event.stopImmediatePropagation();
                OpenFocusedBlah();
            });
            $("#PreviewPromoteBlah").click(function() {
                event.stopImmediatePropagation();
                SetBlahPreviewVote(1);
            });
            $("#PreviewDemoteBlah").click(function() {
                event.stopImmediatePropagation();
                SetBlahPreviewVote(-1);
            });
            $("#PreviewCommentBtn").click(function() {
                event.stopImmediatePropagation();
                DoAddCommentPreview();
            });
            $("#SuggestSignIn").click(function() {
                event.stopImmediatePropagation();
                exports.SuggestUserSignIn('Sign in to promote, demote and comment');
                exports.DismissPreview();
            });
        };

        var PopulateBlahPreview = function(whichBlah) {
            $("#BlahPreviewExtra").empty();

            $("#BlahPreviewHeadline").text(whichBlah.T);

            // get the entire blah to update the rest...
            blahgua_rest.GetBlah(CurrentBlahId, UpdateBodyText, HandleBlahLoadFailure);
        };

        var UpdateBodyText = function(theFullBlah) {
            CurrentBlah = theFullBlah;
            if (FocusedBlah.hasOwnProperty("K"))
                CurrentBlah.K = FocusedBlah.K;
            var headlineText = document.getElementById("BlahPreviewHeadline");
            CurrentBlahNickname = getSafeProperty(theFullBlah, "K", "someone");
            var nickNameStr = CurrentBlahNickname;
            var blahTypeStr = exports.GetBlahTypeStr();
            var isOwnBlah;

            if (IsUserLoggedIn) {
                isOwnBlah = (CurrentBlah.A == CurrentUser._id);
            } else {
                isOwnBlah = false;
            }

            if (isOwnBlah) {
                nickNameStr += " (you)";
            }
             document.getElementById("PreviewBlahNickname").innerHTML = nickNameStr + " " + blahTypeStr;

            // reformat the promote area if the user has already voted
            if (IsUserLoggedIn) {

                $("#preview-vote-row").show();
                $("#PreviewRowSignIn").hide();

                // add a view
                blahgua_rest.AddBlahViewsOpens(theFullBlah._id, 1, 0, null, HandleAddViewFailure);
            } else {
                $("#preview-vote-row").hide();
                $("#PreviewRowSignIn").show();
                //todo:  reenable if we can views and opens for anonymous users
                //Blahgua.AddBlahViewsOpens(theFullBlah._id, 1, 0, null, OnFailure);
            }

            UpdatePreviewVoteBtns();


            // image
            var image = GetBlahImage(CurrentBlah, "B");
            var imageEl = document.getElementById("blahPreviewImage");
            if (image == "") {
                imageEl.style.display = "none";
                headlineText.style.fontSize = "36px";
            } else {
                imageEl.style.display = "block";
                imageEl.src = image;
                headlineText.style.fontSize = "36px";
            }


            var bodyTextDiv = document.getElementById("BlahPreviewBody");
            if (theFullBlah.hasOwnProperty("F")) {
                var bodyText = theFullBlah.F;

                if (bodyText && (bodyText != "")) {
                    bodyText = UnCodifyText(bodyText);
                }

                bodyTextDiv.innerHTML = bodyText;
            } else {
                bodyTextDiv.innerHTML = "";
            }

            // check if it is a special type
            switch (exports.GetBlahTypeStr()) {
                case "predicts":
                    require(['BlahTypePredict'], function(PredictModule) {
                        $("#BlahPreviewExtra").load(fragmentURL + "/pages/BlahTypePredictPage.html #BlahTypePredict",
                            function() { PredictModule.InitPredictPage(); });
                        });
                    break;
                case "polls":
                    require(['BlahTypePoll'], function(PollModule) {
                        $("#BlahPreviewExtra").load(fragmentURL + "/pages/BlahTypePollPage.html #BlahTypePoll",
                            function() { PollModule.InitPollPage(); });
                    });
                    break;
                default:
            }
        };

        return {
            PopulateBlahPreview: PopulateBlahPreview,
            InitPreviewPage: InitPreviewPage
        }
    }
);