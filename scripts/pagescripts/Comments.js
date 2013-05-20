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
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {


        var UpdateBlahComments = function() {
            $("#BlahCommentTable").empty();
            if (CurrentBlah.hasOwnProperty("C") && CurrentBlah.C > 0) {
                // blah has comments
                blahgua_rest.GetBlahComments(CurrentBlah._id, SortAndRedrawComments, exports.OnFailure);
            } else {
                // no comments GetBlahTypeStr()
                var newHTML = "";
                newHTML += '<tr class="no-comment-row"><td><span>No Comments yet. Perhaps you can add the first!</span></td></tr>';
                $("#BlahCommentTable").append(newHTML);
            }
        };

        var UpdateTopComments = function() {
            $("#BlahCommentTable").empty();
            if (CurrentBlah.hasOwnProperty("C") && CurrentBlah.C > 0) {
                // blah has comments
                blahgua_rest.GetBlahComments(CurrentBlah._id, DrawTopComments, exports.OnFailure);
            } else {
                // no comments GetBlahTypeStr()
                CurrentComments = null;
                var newHTML = "";
                newHTML += '<tr class="no-comment-row"><td><span>No Comments yet. Perhaps you can add the first!</span></td></tr>';
                $("#BlahCommentTable").append(newHTML);
            }
        };


        var InsertNewComment = function(theComment) {
            if (CurrentComments == null) {
                CurrentComments = [theComment];

            } else
                CurrentComments = [theComment].concat(CurrentComments); //CurrentComments.push(theComment);

            UpdateBlahCommentDiv();
        };

        var DrawTopComments = function(theComments) {
            CurrentComments = theComments;
            CurrentBlah["C"] = CurrentComments.length;
            SortComments("newest");
            var more = false;
            if (CurrentBlah["C"] > 5){
                CurrentComments = CurrentComments.slice(0,5);
                more = true;
            }


            UpdateBlahCommentDiv();

            // add the more
            if (more) {
                var commentDiv = document.getElementById("BlahCommentTable");
                var newEl = document.createElement("tr");
                newEl.className = "more-comments-row";
                var newHTML = "";
                newHTML += "<td><a>see all " + CurrentBlah["C"] + " comments</a></td>";
                newEl.innerHTML = newHTML;
                commentDiv.appendChild(newEl);
                $(".more-comments-row").click(function(theEvent) {
                    exports.SetBlahDetailPage("comments");
                });
            }
        };



        var SortAndRedrawComments = function(theComments) {
            CurrentComments = theComments;
            CurrentBlah["C"] = CurrentComments.length;
            SortComments();

            UpdateBlahCommentDiv();
        };

        var SortComments = function(SortBy) {
            if (!SortBy || (SortBy == "")) {
                SortBy = "newest";
            }

            if (SortBy == "newest") {
                CurrentComments.sort(dynamicSort("c"));
                CurrentComments.reverse();

            }
            else if (SortBy == "oldest") {
                CurrentComments.sort(dynamicSort("c"));
            }
            else if (SortBy == "most_relevant") {
                CurrentComments.sort(dynamicSort("S"));
                CurrentComments.reverse();
            }
            else if (SortBy == "most_positive") {
                CurrentComments.sort(dynamicSort("U"));
                CurrentComments.reverse();
            }
            else if (SortBy == "most_negative") {
                // to do: need to fix for negative comments
                CurrentComments.sort(dynamicSort("D"));
                CurrentComments.reverse();
            }
        };

        var UpdateBlahCommentDiv = function() {
            var curComment;
            var commentDiv = document.getElementById("BlahCommentTable");
            commentDiv.innerHTML = "";
            for (i in CurrentComments) {
                curComment = CurrentComments[i];
                var commentEl = createCommentElement(i, curComment);
                commentDiv.appendChild(commentEl);
            }
            //bind vote btns
            $(".up-vote").click(function(theEvent) {
                var theIndex = Number($(theEvent.target).parents(".comment-item-table").attr("data-comment-index"));
                SetCommentVote(1, theIndex);
            });
            $(".down-vote").click(function(theEvent) {
                var theIndex = Number($(theEvent.target).parents(".comment-item-table").attr("data-comment-index"));
                SetCommentVote(-1, theIndex);
            });
        };


        var DoAddComment = function(OnSuccess, OnFailure) {
            var commentText = $("#CommentTextArea").val();
            blahgua_rest.AddBlahComment(CodifyText(commentText), CurrentBlah._id, function (newComment) {
                $("#CommentTextArea").val("");
                if (CurrentBlah.hasOwnProperty("C")) {
                    CurrentBlah.C++;
                } else {
                    CurrentBlah["C"] = 1;
                }
                OnSuccess(newComment);
            }, OnFailure);
        };

        var SetCommentVote = function(vote, commentIndex) {
            var theID = CurrentComments[commentIndex]._id;
            var targetDiv = $(event.target).parents('tr')[1];
            blahgua_rest.SetCommentVote(theID, vote, function(json) {
                if (vote == 1)
                    CurrentComments[commentIndex]["U"] = getSafeProperty(CurrentComments[commentIndex], "U", 0) + 1;
                else
                    CurrentComments[commentIndex]["D"] = getSafeProperty(CurrentComments[commentIndex], "D", 0) + 1;

                CurrentComments[commentIndex]["C"] = vote;
                var newEl = createCommentElement(commentIndex, CurrentComments[commentIndex]);
                targetDiv.innerHTML = newEl.innerHTML;
            }, exports.OnFailure);
        };

        var createCommentElement = function(index, theComment) {
            var newEl = document.createElement("tr");
            newEl.className = "comment-table-row";

            var newHTML = "";
            var blahgerName = "a blahger";
            var authorDesc = "an anonymous blahger";

            if (theComment.hasOwnProperty("K")) {
                blahgerName = theComment.K;
            }

            var isOwnComment = false;
            if (IsUserLoggedIn &&  (theComment.A == CurrentUser._id)) {
                isOwnComment = true;
                blahgerName += " (you)"
            }

            var isOwnBlah = false;
            if (IsUserLoggedIn && (CurrentBlah.A == CurrentUser._id)) {
                isOwnBlah = true;
            }


            var ownVote = getSafeProperty(theComment, "C", 0);

            newHTML += '<td><table class="comment-item-table" data-comment-index="' + index + '"">';

            // comment author
            newHTML += '<tr>';
            newHTML += '<td rowspan=3 style="width:48px"><img class="comment-user-image" alt="Username" src="' + fragmentURL + '/images/unknown-user.png"></td>';
            newHTML += '<td colspan=2 style="width:100%"><span class="comment-user-name">' + blahgerName + '</span>,&nbsp;';
            newHTML += '<span class="comment-user-description">' + authorDesc + '</span></td>';

            // comment text
            newHTML += '<tr>';
            newHTML += '<td colspan=2 style="width:100%"><span class="comment-text">' + UnCodifyText(theComment.T) + '</span></td>';
            newHTML += '</tr>';


            // coontrols
            newHTML += '<tr>';
            newHTML += '<td><div class="comment-vote-div">';
            if (isOwnComment || isOwnBlah || (ownVote != 0)) {
                // vote up
                newHTML += '<span class="comment-vote-wrapper">';
                if (ownVote > 0)
                    newHTML += ' <img class="comment-vote" alt="" src="' + fragmentURL + '/img/black_promote_checked.png">';
                else
                    newHTML += ' <img class="comment-vote" alt="" src="' + fragmentURL + '/img/black_promote_disabled.png">';

                newHTML += getSafeProperty(theComment, "U", 0);
                newHTML += '</span> ';

                // vote down
                newHTML += '<span class="comment-vote-wrapper">';
                if (ownVote < 0)
                    newHTML += ' <img class="comment-vote" alt="" src="' + fragmentURL + '/img/black_demote_checked.png">';
                else
                    newHTML += ' <img class="comment-vote" alt="" src="' + fragmentURL + '/img/black_demote_disabled.png">';

                newHTML += getSafeProperty(theComment, "D", 0);
                newHTML += '</span> ';
            } else {
                // vote up
                newHTML += '<span class="comment-vote-wrapper">';
                newHTML += '<img class="comment-vote up-vote" alt="" src="' + fragmentURL + '/img/black_promote.png">';
                newHTML += getSafeProperty(theComment, "U", 0);
                newHTML += '</span> ';


                // vote down
                newHTML += '<span class="comment-vote-wrapper">';
                newHTML += '<img class="comment-vote down-vote" alt="" src="' + fragmentURL + '/img/black_demote.png">';
                newHTML += getSafeProperty(theComment, "D", 0);
                newHTML += '</span> ';
            }

            newHTML += '</div></td>';
            newHTML += '<td><span class="comment-date">' + ElapsedTimeString(new Date(theComment.c)) + '</span></td>';
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
            DoAddComment: DoAddComment
        }
    }
);
