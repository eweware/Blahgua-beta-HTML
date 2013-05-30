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

        var SetCommentFilter = function(newFilter) {
            if (newFilter != commentFilter) {
                commentFilter = newFilter;
                FilterComments();
            }
        }

        var SetCommentSort = function(newSort, newDir) {
            var changed = false;

            if (newSort != commentSortType) {
                commentSortType = true;
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
                newHTML += '<tr class="no-comment-row"><td><span>Be the first to add your thoughts!</span></td></tr>';
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
                newHTML += '<tr class="no-comment-row"><td><span>Be the first to add your thoughts!</span></td></tr>';
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
            G.CurrentComments = theComments;
            G.CurrentBlah["C"] = G.CurrentComments.length;
            SortComments("newest");
            var more = false;
            if (G.CurrentBlah["C"] > 5){
                G.CurrentComments = G.CurrentComments.slice(0,5);
                more = true;
            }

            var authorIds = GetCommentAuthorIDs();
            blahgua_rest.GetUserDescriptors(authorIds, function(authorData) {
                for (var curIndex in authorData) {
                    if (authorData[curIndex].hasOwnProperty('n'))
                        G.CurrentComments[curIndex]["n"] = authorData[curIndex].n;
                    if (authorData[curIndex].hasOwnProperty('d'))
                        G.CurrentComments[curIndex]["d"] = authorData[curIndex].d;
                    if (authorData[curIndex].hasOwnProperty('m'))
                        G.CurrentComments[curIndex]["M"] = [authorData[curIndex].m];
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
            newHTML += "<td><a>see all " + G.CurrentBlah["C"] + " comments</a></td>";
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
            G.CurrentComments = theComments;
            G.CurrentBlah["C"] = G.CurrentComments.length;
            SortComments();
            var authorIds = GetCommentAuthorIDs();
            blahgua_rest.GetUserDescriptors(authorIds, function(authorData) {
                for (var curIndex in authorData) {
                    if (authorData[curIndex].hasOwnProperty('n'))
                        G.CurrentComments[curIndex]["n"] = authorData[curIndex].n;
                    if (authorData[curIndex].hasOwnProperty('d'))
                        G.CurrentComments[curIndex]["d"] = authorData[curIndex].d;
                    if (authorData[curIndex].hasOwnProperty('m'))
                        G.CurrentComments[curIndex]["M"] = [authorData[curIndex].m];
                }
                UpdateBlahCommentDiv();
                FilterComments();
            }, function (theErr) {
                UpdateBlahCommentDiv();
                FilterComments();
            });
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
            for (i in G.CurrentComments) {
                curComment = G.CurrentComments[i];
                var commentEl = createCommentElement(i, curComment);
                commentDiv.appendChild(commentEl);
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
        };


        var DoAddComment = function(OnSuccess, OnFailure) {
            var commentText = $("#CommentTextArea").val();
            blahgua_rest.AddBlahComment(G.CodifyText(commentText), G.CurrentBlah._id, function (newComment) {
                $("#CommentTextArea").val("");
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
                if (vote == 1)
                    G.CurrentComments[commentIndex]["U"] = G.GetSafeProperty(G.CurrentComments[commentIndex], "U", 0) + 1;
                else
                    G.CurrentComments[commentIndex]["D"] = G.GetSafeProperty(G.CurrentComments[commentIndex], "D", 0) + 1;

                G.CurrentComments[commentIndex]["C"] = vote;
                var newEl = createCommentElement(commentIndex, G.CurrentComments[commentIndex]);
                targetDiv.innerHTML = newEl.innerHTML;
            }, exports.OnFailure);
        };

        var createCommentElement = function(index, theComment) {
            var newEl = document.createElement("tr");
            newEl.className = "comment-table-row";

            var newHTML = "";
            var blahgerName = "someone";
            var authorDesc = "someone";

            if (theComment.hasOwnProperty("n")) {
                blahgerName = theComment.n;
            }
            if (theComment.hasOwnProperty("d")) {
                authorDesc = theComment.d;
            }

            var isOwnComment = false;
            if (G.IsUserLoggedIn &&  (theComment.A == G.CurrentUser._id)) {
                isOwnComment = true;
                blahgerName += " (you)"
            }

            var isOwnBlah = false;
            if (G.IsUserLoggedIn && (G.CurrentBlah.A == G.CurrentUser._id)) {
                isOwnBlah = true;
            }

            var authorImageURL = G.GetUserImage(theComment, "A");


            var ownVote = G.GetSafeProperty(theComment, "C", 0);

            newHTML += '<td><table class="comment-item-table" data-comment-index="' + index + '"">';

            // comment author
            newHTML += '<tr>';
            newHTML += '<td rowspan=3 style="width:48px; vertical-align:top;"><img class="comment-user-image" alt="Username" src="' + authorImageURL + '"></td>';
            newHTML += '<td colspan=2 style="width:100%"><span class="comment-user-name">' + blahgerName + '</span>,&nbsp;';
            newHTML += '<span class="comment-user-description">' + authorDesc + '</span></td>';

            // comment text
            newHTML += '<tr>';
            newHTML += '<td colspan=2 style="width:100%"><span class="comment-text">' + G.UnCodifyText(theComment.T) + '</span></td>';
            newHTML += '</tr>';


            // coontrols
            newHTML += '<tr>';
            newHTML += '<td><div class="comment-vote-div">';
            if (isOwnComment || isOwnBlah || (ownVote != 0)) {
                var uv = G.GetSafeProperty(theComment, "U", 0);
                var dv = G.GetSafeProperty(theComment, "D", 0)
                if ((isOwnComment || isOwnBlah) && (uv == 0) && (dv == 0)) {
                    // it is their own blah or comment
                    newHTML += '<span class="comment-vote-wrapper no-vote">no votes yet</span>';
                } else {
                    // vote up
                    newHTML += '<span class="comment-vote-wrapper">';
                    if (ownVote > 0)
                        newHTML += ' <img class="comment-vote" alt="" src="' + G.FragmentURL + '/img/black_promote_checked.png">';
                    else
                        newHTML += ' <img class="comment-vote" alt="" src="' + G.FragmentURL + '/img/black_promote_disabled.png">';

                    newHTML += uv;
                    newHTML += '</span> ';

                    // vote down
                    newHTML += '<span class="comment-vote-wrapper">';
                    if (ownVote < 0)
                        newHTML += ' <img class="comment-vote" alt="" src="' + G.FragmentURL + '/img/black_demote_checked.png">';
                    else
                        newHTML += ' <img class="comment-vote" alt="" src="' + G.FragmentURL + '/img/black_demote_disabled.png">';

                    newHTML += dv;
                    newHTML += '</span> ';
                }
            } else  {
                // vote up
                newHTML += '<span class="comment-vote-wrapper">';
                newHTML += '<img class="comment-vote up-vote" alt="" src="' + G.FragmentURL;
                if (G.IsUserLoggedIn)
                    newHTML += '/img/black_promote.png" data-votable>';
                else
                    newHTML += '/img/black_promote_disabled.png">';
                newHTML += G.GetSafeProperty(theComment, "U", 0);
                newHTML += '</span> ';

                // vote down
                newHTML += '<span class="comment-vote-wrapper">';
                newHTML += '<img class="comment-vote down-vote" alt="" src="' + G.FragmentURL;
                if (G.IsUserLoggedIn)
                    newHTML += '/img/black_demote.png" data-votable>';
                else
                    newHTML += '/img/black_demote_disabled.png">';

                newHTML += G.GetSafeProperty(theComment, "D", 0);
                newHTML += '</span> ';
            }

            newHTML += '</div></td>';
            newHTML += '<td><span class="comment-date">' + G.ElapsedTimeString(new Date(theComment.c)) + '</span></td>';
            newHTML += '</tr>';

            newHTML += '</div>';
            newHTML += '</td>';


            newEl.innerHTML = newHTML;

            return newEl;
        };

        return {
            UpdateBlahComments: UpdateBlahComments,
            InsertNewComment: InsertNewComment,
            UpdateTopComments: UpdateTopComments,
            DoAddComment: DoAddComment,
            SetCommentSort: SetCommentSort,
            SetCommentFilter: SetCommentFilter
        }
    }
);
