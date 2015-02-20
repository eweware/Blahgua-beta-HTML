/**
 * Created with IntelliJ IDEA.
 * User: davevr
 * Date: 5/15/13
 * Time: 10:48 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:46 AM
 * To change this template use File | Settings | File Templates.
 */

define('comments',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {
        var commentSortType = "bydate";
        var commentSortDir = "desc";
        var commentFilter = "";
        var kMaxImgWidth = 90;
        var drawThreaded = false;
        var imageUploadURL = "";

        var SetCommentFilter = function(newFilter) {
            if (newFilter != commentFilter) {
                commentFilter = newFilter;
                FilterComments();
            }
        }

        var SetCommentSort = function(newSort, newDir) {
            var changed = false;

            if (newSort != commentSortType) {
                commentSortType = newSort;
                changed = true;
            }

            if (newDir != commentSortDir) {
                commentSortDir = newDir;
                changed = true;
            }

            if (changed) {
                SortAndRedrawComments(G.CurrentComments);
            }
        };

        var UpdateBlahComments = function() {
            $("#BlahCommentTable").empty();
            if (G.CurrentBlah.hasOwnProperty("C") && G.CurrentBlah.C > 0) {
                // blah has comments
                blahgua_rest.GetBlahComments(G.CurrentBlah._id, SortAndRedrawComments, exports.OnFailure);
            } else {
                // no comments GetBlahTypeStr()
                var newHTML = "";
                newHTML += '<tr class="no-comment-row"><td><span>Add comments and images.</span></td></tr>';
                $("#BlahCommentTable").append(newHTML);
            }
        };


        var UpdateTopComments = function() {
            $("#BlahCommentTable").empty();
            if (G.CurrentBlah.hasOwnProperty("C") && G.CurrentBlah.C > 0) {
                // blah has comments
                blahgua_rest.GetBlahComments(G.CurrentBlah._id, DrawTopComments, exports.OnFailure);
            } else {
                // no comments GetBlahTypeStr()
                G.CurrentComments = null;
                var newHTML = "";
                newHTML += '<tr class="no-comment-row"><td><span>Add comments and images.</span></td></tr>';
                $("#BlahCommentTable").append(newHTML);
            }
        };


        var InsertNewComment = function(theComment) {
            // add the comment
            if (G.CurrentComments == null) {
                G.CurrentComments = [theComment];

            } else
                G.CurrentComments = [theComment].concat(G.CurrentComments); //CurrentComments.push(theComment);

            DrawTopComments(G.CurrentComments);
        };

        var DrawTopComments = function(theComments) {
            drawThreaded = false;
            G.CurrentComments = theComments;
            //G.CurrentBlah["C"] = G.CurrentComments.length;
            SortComments("newest");
            var more = false;
            if (G.CurrentBlah["C"] > 5){
                G.CurrentComments = G.CurrentComments.slice(0,5);
                more = true;
            }

            var authorIds = GetCommentAuthorIDs();
            blahgua_rest.GetUserDescriptors(authorIds, function(authorData) {
                for (var curIndex in authorData) {
                    if (authorData[curIndex].hasOwnProperty('K'))
                        G.CurrentComments[curIndex]["K"] = authorData[curIndex].K;
                    if (authorData[curIndex].hasOwnProperty('d'))
                        G.CurrentComments[curIndex]["d"] = authorData[curIndex].d;
                    if (authorData[curIndex].hasOwnProperty('m'))
                        G.CurrentComments[curIndex]["_m"] = [authorData[curIndex].m];
                }
                UpdateBlahCommentDiv();
                if (more)
                    AddMoreLink();
            }, function (theErr) {
                UpdateBlahCommentDiv();
                if (more)
                    AddMoreLink();
            });
        };

        var AddMoreLink = function() {
            var commentDiv = document.getElementById("BlahCommentTable");
            var newEl = document.createElement("tr");
            newEl.className = "more-comments-row";
            var newHTML = "";
            newHTML += "<td><a>See all " + G.CurrentBlah["C"] + " comments</a></td>";
            newEl.innerHTML = newHTML;
            commentDiv.appendChild(newEl);
            $(".more-comments-row").click(function(theEvent) {
                exports.SetBlahDetailPage("Comments");
            });
        };


        var GetCommentAuthorIDs = function() {
            var idList = [];
            for (var curIndex in G.CurrentComments) {
                idList.push(G.CurrentComments[curIndex].A);
            }

            return idList;
        };


        var SortAndRedrawComments = function(theComments) {
            drawThreaded = true;
            G.CurrentComments = theComments;
            G.CurrentBlah["C"] = G.CurrentComments.length;
            SortComments();
            var authorIds = GetCommentAuthorIDs();
            ThreadComments();
            blahgua_rest.GetUserDescriptors(authorIds, function(authorData) {
                for (var curIndex in authorData) {
                    if (authorData[curIndex].hasOwnProperty('K'))
                        G.CurrentComments[curIndex]["K"] = authorData[curIndex].K;
                    if (authorData[curIndex].hasOwnProperty('d'))
                        G.CurrentComments[curIndex]["d"] = authorData[curIndex].d;
                    if (authorData[curIndex].hasOwnProperty('m'))
                        G.CurrentComments[curIndex]["_m"] = [authorData[curIndex].m];
                }
                UpdateBlahCommentDiv();
                FilterComments();
            }, function (theErr) {
                UpdateBlahCommentDiv();
                FilterComments();
            });
        };

        var GetCommentIndexFromId = function(theId) {
            for (var i = 0; i < G.CurrentComments.length; i++) {
                if (G.CurrentComments[i]._id == theId) {
                    return i;
                }
            }

            return -1;
        };


        var ThreadComments = function() {
            // TODO: Make sure they are not threaded already....
            var curParentId;
            for (var curComment in G.CurrentComments) {
                curParentId = G.GetSafeProperty(G.CurrentComments[curComment], "CID", null);
                if (curParentId != null) {
                    var curIndex = GetCommentIndexFromId(curParentId);
                    if (!G.CurrentComments[curIndex].hasOwnProperty("subcomments")) {
                        G.CurrentComments[curIndex]["subcomments"] = new Array();
                    }
                    G.CurrentComments[curIndex].subcomments.push(curComment);
                }
            }
        };

        var FilterComments = function() {
            if (commentFilter == "") {
                $(".comment-table-row").show();
            } else {
                $(".comment-table-row").each(function(index, item) {
                    if ($(item).find(".comment-text").text().indexOf(commentFilter) != -1)
                        $(item).show();
                    else
                        $(item).hide();
                });
            }
        };

        var SortComments = function() {
            var filterProp = "";
            var forward = false;
            switch(commentSortType) {
                case "bydate":
                    filterProp = "c";
                    break;
                case "bypromotes":
                    filterProp = "U";
                    break;
                case "bydemotes":
                    filterProp = "D";
                    break;
            }

            if (filterProp != "") {
                G.CurrentComments.sort(G.DynamicSort(filterProp));
                if (commentSortDir == "desc")
                    G.CurrentComments.reverse();
            }
        };

        var UpdateBlahCommentDiv = function() {
            var curComment;
            var commentDiv = document.getElementById("BlahCommentTable");
            commentDiv.innerHTML = "";
            var theRect = commentDiv.getBoundingClientRect();
            kMaxImgWidth = theRect.width - 150;
            for (i in G.CurrentComments) {
                curComment = G.CurrentComments[i];
                if ((!drawThreaded) || (G.GetSafeProperty(curComment, "CID", null) == null)) {
                    var commentEl = createCommentElement(i, curComment);
                    commentDiv.appendChild(commentEl);
                }
            }
            //bind vote btns
            $(".up-vote[data-votable]").click(function(theEvent) {
                var theIndex = Number($(theEvent.target).parents(".comment-item-table").attr("data-comment-index"));
                SetCommentVote(theEvent, 1, theIndex);
            });
            $(".down-vote[data-votable]").click(function(theEvent) {
                var theIndex = Number($(theEvent.target).parents(".comment-item-table").attr("data-comment-index"));
                SetCommentVote(theEvent, -1, theIndex);
            });

            blahgua_rest.GetUploadURL(function(theUrl) {
                imageUploadURL = theUrl;
            });

            $(".report-comment-btn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                $("#ShowReportBlahArea").hide();
                $("#ShowReportCommentArea").show();
                $("#ShowReportBlahAreaHolder").show();
                var oldLoc = $(theEvent.target).offset();
                oldLoc.left -= $("#ShowReportCommentArea").width();
                oldLoc.top -= $("#ShowReportCommentArea").height();
                $("#ShowReportCommentArea").offset(oldLoc);
                var theIndex = Number($(theEvent.target).parents(".comment-item-table").attr("data-comment-index"));
                var theID = G.CurrentComments[theIndex]._id;
                $("#ShowReportCommentArea").attr("data-comment-id", theID);
            });


            $("#ReportMatureCommentBtn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                ReportMatureComment($("#ShowReportCommentArea").attr("data-comment-id"));
                $("#ShowReportBlahAreaHolder").hide();
            });

            $("#ReportSpamCommentBtn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                ReportSpamComment($("#ShowReportCommentArea").attr("data-comment-id"));
                $("#ShowReportBlahAreaHolder").hide();
            });

            $("#ReportInfringingCommentBtn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                ReportInfringingComment($("#ShowReportCommentArea").attr("data-comment-id"));
                $("#ShowReportBlahAreaHolder").hide();
            });



            $(".report-comment-btn").click(function(theEvent) {
                if (G.IsUserLoggedIn) {

                    ReportMatureComment(theID);
                }

            });

            $(".reply-btn").click(function(theEvent) {
                if (G.IsUserLoggedIn) {
                    var targetDiv =  $(theEvent.target).next();
                    $(".reply-btn").text("reply");
                    if (targetDiv.html() == "") {
                        $("#CommentTable").detach().appendTo(targetDiv);
                        $(theEvent.target).text("cancel");
                    }  else {
                        $("#CommentTable").detach().appendTo("#CreateCommentArea");
                    }
                } else {
                    G.PromptUser("Sign in to participate."," Sign in","Cancel",function(){
                        theEvent.stopImmediatePropagation();
                        exports.SuggestUserSignIn("Sign in to participate.")});
                }

            });

            $(".comment-user-image-holder").click(HandleUserClick);
            $(".comment-user-name").click(HandleUserClick);

            if(!G.IsUserLoggedIn) {
                $(".comment-vote-wrapper").click(function(theEvent) {
                    G.PromptUser("Sign in to participate."," Sign in","Cancel",function(){
                        theEvent.stopImmediatePropagation();
                        exports.SuggestUserSignIn("Sign in to participate.")});
                });
            }
        };

        var HandleUserClick = function(theEvent) {
            var theTarget = $(theEvent.target).closest(".comment-item-table");

            if (theTarget.attr("data-badged") != "true")
                LoadItemBadges(theTarget);
            else
                ToggleDescription(theTarget);
        };

        var LoadItemBadges = function (theElement) {
            theElement.attr("data-badged", "true");
            var theIndex = Number(theElement.attr("data-comment-index"));
            var theComment = G.CurrentComments[theIndex];
            var targetElement = theElement.find(".comment-user-description");
            if (theComment.hasOwnProperty("BD")) {
                var badgeList = theComment.BD;
                for (var curIndex in badgeList) {
                    CreateAndAppendBadgeDescription(badgeList[curIndex], targetElement);
                }
            }

            ToggleDescription(theElement);
        };


        var CreateAndAppendBadgeDescription = function(theBadge, theElement) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var badgeName = G.GetSafeProperty(fullBadge, "N", "unnamed badge");
                var newHTML = "<div class='comment-badge-info-row'>";
                newHTML += "<img style='width:16px; height:16px;' src='" + BlahguaConfig.fragmentURL + "img/black_badge.png'>";
                newHTML += "<span class='comment-badge-text'>verified <span class='badge-name-class'>"+ badgeName + "</span></span></div>";

               theElement.append(newHTML);

            }, function (theErr) {
                // TODO:  handle badge load error
            });
        };

        var ToggleDescription = function(theElement) {
            theElement.find(".comment-user-description").first().toggle(250);
        };

        var DoAddComment = function(OnSuccess, OnFailure) {
            var parentComment = null;

            if ($("#CommentTable").parent().hasClass("embedded-comment-div")) {
                // it is a nested comment
                var parentIndex = $("#CommentTable").parents(".comment-item-table").attr("data-comment-index");
                parentComment = G.CurrentComments[parentIndex]._id;
            }
            var commentText = $.trim($("#CommentTextArea").val());
            var imageId = $("#objectId").val();
            var badgeList = null;
            var postAnon = true;

            var badges = $("#ShowBadgeArea .badge-item");
            if (badges.length > 0) {
                var badgeArray = [];
                badges.each(function (index, item) {
                    var theID = $(item).attr("data-badge-id");
                    var isChecked = $(item).find("i").hasClass("icon-check");
                    if (isChecked)
                        badgeArray.push(theID);
                });
                if (badgeArray.length > 0)
                    badgeList = badgeArray;
            }

            if ($("#ShowBadgeArea .anonymous-item").find("i").hasClass("icon-check")) {
                postAnon = false;
            }

            if ($("#ShowBadgeArea .mature-item").find("i").hasClass("icon-check")) {
                isMature = true;
            } else
                isMature = null;

            blahgua_rest.AddBlahComment(G.CodifyText(commentText), G.CurrentBlah._id, imageId, parentComment, badgeList, postAnon, isMature,  function (newComment) {
                $("#CommentTable").detach().appendTo("#CreateCommentArea");
                ga('send', 'event', 'createcomment', 'comment', "default", 1);
                $("#CommentTextArea").val("").attr("placeholder","Enter comment text here");
                if (G.CurrentBlah.hasOwnProperty("C")) {
                    G.CurrentBlah.C++;
                } else {
                    G.CurrentBlah["C"] = 1;
                }

                OnSuccess(newComment);

            }, OnFailure);
        };

        var SetCommentVote = function(theEvent, vote, commentIndex) {
            var theID = G.CurrentComments[commentIndex]._id;
            var targetDiv = $(theEvent.target).parents('tr')[1];
            blahgua_rest.SetCommentVote(theID, vote, function(json) {
                ga('send', 'event', 'commentvote', 'comment', vote, 1);
                if (vote == 1)
                    G.CurrentComments[commentIndex]["U"] = G.GetSafeProperty(G.CurrentComments[commentIndex], "U", 0) + 1;
                else
                    G.CurrentComments[commentIndex]["D"] = G.GetSafeProperty(G.CurrentComments[commentIndex], "D", 0) + 1;

                G.CurrentComments[commentIndex]["uv"] = vote;
                var newEl = createCommentElement(commentIndex, G.CurrentComments[commentIndex]);
                targetDiv.innerHTML = newEl.innerHTML;
            }, exports.OnFailure);
        };



        var createCommentElement = function(index, theComment) {
            var newEl = document.createElement("tr");
            newEl.className = "comment-table-row";
            var newHTML = "<td>";
            if (!G.GetSafeProperty(theComment, "XXX", false) || G.GetSafeProperty(G.CurrentUser, "XXX", false))
                newHTML += createCommentHTML(index, theComment, 0);
            else
                newHTML += createRedactedCommentHTML();
            newHTML += "</td>";
            newEl.innerHTML = newHTML;

            return newEl;

        };

        var ReportMatureComment = function(commentId) {
            blahgua_rest.ReportComment(commentId, 1, function() { alert("Comment has been reported."); } );
        };

        var ReportSpamComment = function(commentId) {
            blahgua_rest.ReportComment(commentId, 2,  function() { alert("Comment has been reported."); } );
        };

        var ReportInfringingComment = function(commentId) {
            var bodyText = "I am the rights owner to content that is used without permission in comment " + commentId + " and I am requesting it be removed.";
            var link = "mailto:admin@goheard.com"
                + "?subject=" + encodeURIComponent("Infringing Content report")
                + "&body=" + encodeURIComponent(bodyText);
            window.location.href = link;
        };

        var createRedactedCommentHTML = function() {
            var newHTML = "";
            newHTML += '<table class="comment-item-table">';
            newHTML += '<tr>';
            newHTML += '<td style="vertical-align:top;"><div class="redacted-comment-holder">';
            newHTML += 'this comment has been flagged for mature content';

            newHTML += '</div></td>';
            newHTML += '</table>';
            return newHTML;

        };

        var createCommentHTML = function(index, theComment, indent) {
            var image = G.GetItemImage(theComment, "D");
            var newHTML = "";
            var blahgerName = "someone";
            var authorDesc = "An anonymous person.";
            var anon = G.GetSafeProperty(theComment, "XX", false);
            var badges = G.GetSafeProperty(theComment, "BD", null);

            if (theComment.hasOwnProperty("K") && (!anon)) {
                blahgerName = theComment.K;
            }
            if (theComment.hasOwnProperty("d") && (!anon)) {
                authorDesc = theComment.d;
            }

            var isOwnComment = false;
            if (G.IsUserLoggedIn &&  (theComment.A == G.CurrentUser._id)) {
                isOwnComment = true;
                if (!anon)
                    blahgerName += " (you)"
            }

            var isOwnBlah = false;
            if (G.IsUserLoggedIn && (G.CurrentBlah.A == G.CurrentUser._id)) {
                isOwnBlah = true;
            }

            var authorImageURL;

            if (anon)
                authorImageURL = G.GetGenericUserImage();
            else
                authorImageURL = G.GetCommentUserImage(theComment, "A");



            var ownVote = G.GetSafeProperty(theComment, "uv", 0);

            newHTML += '<table class="comment-item-table" data-comment-index="' + index + '"';
            if (indent > 0) {
                newHTML += " style='margin-left:" + indent + "px'";
            }
            newHTML += '>';

            // comment author, date, voting
            var rowSpan = 5;
            if (image == "")
                rowSpan = 4;


            newHTML += '<tr>';
            newHTML += '<td rowspan=' + rowSpan;

            newHTML += ' style="vertical-align:top;"><div class="comment-user-image-holder"><img class="comment-user-image" alt="Username" src="' + authorImageURL + '">';
            if (badges != null) {
                newHTML += "<img class='comment-badge-image' src='" + BlahguaConfig.fragmentURL + "img/black_badge.png'>";
            }

            newHTML += '</div></td>';
            newHTML += '<td class="comment-user-name">' + blahgerName + '</td>';
            newHTML += '<td><span class="comment-date">' + G.ElapsedTimeString(new Date(theComment.c)) + '</span></td>';

            // coontrols
            newHTML += '<td style="width:100%; text-align:right"><div class="comment-vote-div">';
            if (isOwnComment || isOwnBlah || (ownVote != 0)) {
                var uv = G.GetSafeProperty(theComment, "U", 0);
                var dv = G.GetSafeProperty(theComment, "D", 0)
                if ((isOwnComment || isOwnBlah) && (uv == 0) && (dv == 0)) {
                    // it is their own blah or comment
                    newHTML += '<span class="comment-vote-wrapper no-vote">no votes</span>';
                } else {
                    // vote up
                    newHTML += '<span class="comment-vote-wrapper">';
                    if (ownVote > 0)
                        newHTML += ' <img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/green_promote.png">';
                    else
                        newHTML += ' <img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/black_promote_disabled.png">';

                    newHTML += uv;
                    newHTML += '</span> ';

                    // vote down
                    newHTML += '<span class="comment-vote-wrapper">';
                    if (ownVote < 0)
                        newHTML += ' <img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/green_demote.png">';
                    else
                        newHTML += ' <img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/black_demote_disabled.png">';

                    newHTML += dv;
                    newHTML += '</span> ';
                }
            } else  {
                // vote up
                newHTML += '<span class="comment-vote-wrapper">';
                newHTML += '<img class="comment-vote up-vote" alt="" src="' + BlahguaConfig.fragmentURL;
                if (G.IsUserLoggedIn)
                    newHTML += 'img/black_promote.png" data-votable>';
                else
                    newHTML += 'img/black_promote_disabled.png">';
                newHTML += G.GetSafeProperty(theComment, "U", 0);
                newHTML += '</span> ';

                // vote down
                newHTML += '<span class="comment-vote-wrapper">';
                newHTML += '<img class="comment-vote down-vote" alt="" src="' + BlahguaConfig.fragmentURL;
                if (G.IsUserLoggedIn)
                    newHTML += 'img/black_demote.png" data-votable>';
                else
                    newHTML += 'img/black_demote_disabled.png">';

                newHTML += G.GetSafeProperty(theComment, "D", 0);
                newHTML += '</span> ';
            }
            newHTML += '</td></tr>'


            // user description
            newHTML += '<tr><td colspan="3" class="comment-user-description">' + authorDesc + '</td></tr>';


            // comment text
            newHTML += '<tr>';
            newHTML += '<td colspan="3" class="comment-body-row"><span class="comment-text">' + G.UnCodifyText(theComment.T) + '</span></td>';
            newHTML += '</tr>';

            // comment
            // bordimage
            if (image != "") {
                newHTML += '<tr>';
                newHTML += '<td colspan="3" class="comment-image-row">' +
                    '<img src="' + image + '" alt="Comment Image" class="comment-image" style="max-width:' + kMaxImgWidth + 'px">';
                newHTML += '</td></tr>';

            }



            // reply area (blank for now)
            newHTML += '<tr><td class="comment-reply-row" colspan="3">';
            if (true) {//G.IsUserLoggedIn) {
                if (G.IsUserLoggedIn)
                 newHTML += '<button class="report-comment-btn">report</button>';
                newHTML += '<button class="reply-btn">reply</button>';
                newHTML += '<div class="embedded-comment-div"></div>';
            }

            newHTML += '</td></tr>';


            // threaded comment area (blank for now)
            if (drawThreaded) {
                if (theComment.hasOwnProperty("subcomments")) {
                    for (curChildIndex in theComment.subcomments) {
                        newHTML += '<tr><td class="nested-row" colspan="4">';
                        var childIndex = theComment.subcomments[curChildIndex];
                        newHTML += createCommentHTML(childIndex, G.CurrentComments[childIndex], indent + 0);
                        newHTML += '</td></tr>';
                    }
                }
            } else {
                if (theComment.hasOwnProperty("CID")) {
                    var parentIndex =  GetCommentIndexFromId(theComment.CID);
                    if (parentIndex != -1) {
                        var parentText = G.UnCodifyText(G.CurrentComments[parentIndex].T);
                        if (parentText.length > 30) {
                            parentText = parentText.substring(0, 30);
                            parentText += "...";
                        }

                        newHTML += "<tr><td colspan='4' class='reply-note-row'>";
                        newHTML += '<span>in reply to:  </span>';
                        newHTML += '<span class="parentQuote">' + parentText + '</span>';
                        newHTML += "</td></tr>";
                    }
                }
            }




            newHTML += '</table>';


           return newHTML;
        };

        var UploadCommentImage  = function() {
            $("#objectId").val("");
            if ($("#CommentImage").val() == "" ) {
                // clear the image
                $(".image-preview").addClass("no-image").css({"background-image":"none"});
                $(".image-preview span").text("no image");
            } else {
                var imageUrl = "url('" + BlahguaConfig.fragmentURL +  "img/ajax-loader.gif')";

                $(".image-preview").addClass("no-image").css({"background-image": imageUrl});
                $(".image-preview span").text("loading");

                var formData = new FormData($("#ImageForm")[0]);
                ga('send', 'event', 'uploadimage', 'comment', 1, 1);
                $.ajax({
                    url: imageUploadURL,
                    type: 'POST',

                    //Ajax events
                    success: completeHandler = function(data) {
                        $("#ImagePreviewDiv").removeAttr("disabled");
                        $("#objectId").val(data);
                        // to do - update the image...
                        var imagePathName = data + "=s128-c";
                        var theUrl = 'url("' + imagePathName + '")';
                        $(".image-preview").removeClass("no-image").css({"background-image": theUrl});
                        $(".image-preview span").text("");
                        $(".image-preview i").show();
                        blahgua_rest.GetUploadURL(function(theUrl) {
                            imageUploadURL = theUrl;
                        });
                    },
                    error: errorHandler = function(theErr) {
                        if (theErr.status = "409")
                            exports.LogoutUser(true);
                        else {
                            $("#ImagePreviewDiv").removeAttr("disabled");
                            $(".image-preview").addClass("no-image").css({"background-image":"none"}).text("error");
                        }

                    },
                    // Form data
                    data: formData,
                    //Options to tell JQuery not to process data or worry about content-type
                    cache: false,
                    contentType: false,
                    processData: false
                }, 'json');
            }
        };


        return {
            UpdateBlahComments: UpdateBlahComments,
            InsertNewComment: InsertNewComment,
            UpdateTopComments: UpdateTopComments,
            DoAddComment: DoAddComment,
            SetCommentSort: SetCommentSort,
            UploadCommentImage: UploadCommentImage,
            SetCommentFilter: SetCommentFilter
        }
    }
);
