
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

            if ((G.CurrentUser != null) &&
                G.GetSafeProperty(G.CurrentUser, "ad", false)) {
                $("#AdminFlagPostSpammerBtn").click(function(theEvent) {
                    var spammerId = G.CurrentBlah.A;
                    blahgua_rest.FlagSpammer(spammerId, true, function() { alert("Author has been reported."); } );
                    $("#ShowReportBlahAreaHolder").hide();
                });
                $("#AdminFlagCommentSpammerBtn").click(function(theEvent) {

                });
            } else {
                $("#AdminFlagPostSpammerBtn").remove();
                $("#AdminFlagCommentSpammerBtn").remove();
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

                $("#ReportBlah").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    $("#ShowReportCommentArea").hide();
                    $("#ShowReportBlahAreaHolder").show();
                    $("#ShowReportBlahArea").show();
                    var oldLoc = $("#ReportBlah").offset();
                    oldLoc.left -= $("#ShowReportBlahArea").width() / 2;
                    oldLoc.top -= $("#ShowReportBlahArea").height();
                    $("#ShowReportBlahArea").offset(oldLoc);
                });

                $("#ShowReportBlahAreaHolder").click(function(theEvent) {
                    if (theEvent.target.id == "ShowReportBlahAreaHolder")
                        $(theEvent.target).hide();
                });

                $("#ReportMatureBtn").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    ReportMaturePost();
                    $("#ShowReportBlahAreaHolder").hide();
                });

                $("#ReportSpamBtn").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    ReportSpamPost();
                    $("#ShowReportBlahAreaHolder").hide();
                });

                $("#ReportInfringingBtn").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    ReportInfringingPost();
                    $("#ShowReportBlahAreaHolder").hide();
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
                $("#ReportBlah").click(function(theEvent) {
                    G.PromptUser("Sign in to participate."," Sign in","Cancel",function(){
                        theEvent.stopImmediatePropagation();
                        exports.SuggestUserSignIn("Sign in to participate.")});

                });
			}

            // add share this button if we didn't already do it

            if ($("#ShareBlah").html() == "")
            {
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
            }


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
                if (G.UserCanComment)
                    $("#CreateCommentArea").show();
                else
                    $("#CreateCommentArea").hide();
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

                    $(".mature-item").click(function(theEvent) {
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

                RefreshForCommentText();
            }

            UpdateBadgeArea();
        };

        var HandleNewComment = function(commentId) {
            comments.InsertNewCommentById(commentId);
        };

        var UpdateBadgeArea = function() {
            if (G.IsUserLoggedIn) {
                CreateAndAppendAnonPostHTML();
                CreateAndAppendMaturePostHTML();
                if (G.CurrentUser.hasOwnProperty("B")) {
                    // add badges
                    AppendBadgeHeader();
                    $("#BadgesArea").empty();

                    $.each(G.CurrentUser.B, function(index, curBadge) {
                        CreateAndAppendBadgeHTML(curBadge);
                    });
                }else {
                    AppendNoBadgeHeader();
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

        var CreateAndAppendMaturePostHTML = function() {
            var newHTML = "";
            newHTML += "<div class='mature-item'>";
            newHTML += "<i class='icon-check-empty'></i>";
            newHTML += "<span>Mature Content</span>";
            newHTML += "</div>";
            newHTML += "</div>";

            $("#ShowBadgeArea").append(newHTML);
        };


        var AppendBadgeHeader = function() {
            var newHTML = "";
            newHTML += "<div class='badge-header-item'>";
            newHTML += "<span>Apply Badges</span>";
            newHTML += "</div>";

            $("#ShowBadgeArea").append(newHTML);
        };

        var AppendNoBadgeHeader = function() {
            var newHTML = "";
            newHTML += "<div class='nobadge-header-item'>";
            newHTML += "<span>You have no badges.  Go to your profile to add some!</span>";
            newHTML += "</div>";

            $("#ShowBadgeArea").append(newHTML);
        };

        var RefreshBadgePreview = function() {
            if ($("#ShowBadgeArea .mature-item i").hasClass("icon-check")) {
                // draw mature
                $("#AddCommentBtn").addClass("mature");
            } else {
                // draw normal
                $("#AddCommentBtn").removeClass("mature");
            }
        };

        var ReportMaturePost = function() {
            blahgua_rest.ReportPost(G.CurrentBlahId, 1, function() { alert("Post has been reported."); } );
        };

        var ReportSpamPost = function() {
            blahgua_rest.ReportPost(G.CurrentBlahId, 2,  function() { alert("Post has been reported."); } );
        };

        var ReportInfringingPost = function() {
            var bodyText = "I am the rights owner to content that is used without permission in post " + G.CurrentBlahId + " and I am requesting it be removed.";
            var link = "mailto:admin@goheard.com"
                    + "?subject=" + encodeURIComponent("Infringing Content report")
                    + "&body=" + encodeURIComponent(bodyText);
            window.location.href = link;
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
                color = "rgb(231,61,80)";

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
            InitializePage: InitializePage,
            HandleNewComment: HandleNewComment
        }
    }
);
