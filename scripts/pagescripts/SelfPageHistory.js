/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPageHistory',
    ["globals","ExportFunctions", "blahgua_restapi", "comments"],
    function (G, exports, blahgua_rest) {

        var commentSortType = "bydate";
        var commentSortDir = "desc";
        var commentFilter = "";
        var blahSortType = "bydate";
        var blahSortDir = "desc";
        var blahFilter = "";
        var blahsLoaded = false;
        var commentsLoaded = false;

        var CommentList = [];
        var BlahList = [];

        var  InitializePage = function() {
            blahsLoaded = false;
            commentsLoaded = false;
            // bind events
            $("#BlahSortBySelect").change(function(theEvent) {
                UpdateBlahSort();
            });

            $("#BlahSortOrderSelect").change(function(theEvent) {
                UpdateBlahSort();
            });

            $("#BlahFilterBox").keyup(function(theEvent) {
                SetBlahFilter($("#BlahFilterBox").val());
            });

            $("#SortBySelect").change(function(theEvent) {
                UpdateCommentSort();
            });

            $("#SortOrderSelect").change(function(theEvent) {
                UpdateCommentSort();
            });

            $("#FilterBox").keyup(function(theEvent) {
                SetCommentFilter($("#FilterBox").val());
            });


            // update
            UpdateSelfHistory();
        };

        var UpdateCommentSort = function() {
            SetCommentSort($("#SortBySelect").val(), $("#SortOrderSelect").val());
        };

        var UpdateBlahSort = function() {
            SetBlahSort($("#BlahSortBySelect").val(), $("#BlahSortOrderSelect").val());
        };

        var SetBlahFilter = function(newFilter) {
            if (newFilter != blahFilter) {
                blahFilter = newFilter;
                FilterBlahs();
            }
        };

        var FilterBlahs = function() {
            if (blahFilter == "") {
                $(".user-blah-row").show();
            } else {
                $(".user-blah-row").each(function(index, item) {
                    if ($(item).find(".title-text").text().indexOf(blahFilter) != -1)
                        $(item).show();
                    else
                        $(item).hide();
                });
            }
        };

        var FilterComments = function() {
            if (commentFilter == "") {
                $(".user-comment-row").show();
            } else {
                $(".user-comment-row").each(function(index, item) {
                    if ($(item).find(".title-text").text().indexOf(commentFilter) != -1)
                        $(item).show();
                    else
                        $(item).hide();
                });
            }
        };

        var SetCommentFilter = function(newFilter) {
            if (newFilter != commentFilter) {
                commentFilter = newFilter;
                FilterComments();
            }
        };

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
                SortAndRedrawComments(CommentList);
            }
        };

        var SetBlahSort = function(newSort, newDir) {
            var changed = false;

            if (newSort != blahSortType) {
                blahSortType = newSort;
                changed = true;
            }

            if (newDir != blahSortDir) {
                blahSortDir = newDir;
                changed = true;
            }

            if (changed) {
                SortAndRedrawBlahs(BlahList);
            }
        };


        var SortAndRedrawBlahs = function(theBlahs) {
            BlahList = theBlahs;
            SortBlahs();
            var newHTML = "";
            var blahsDiv = $("#UserBlahList");
            blahsDiv.empty();
            if (BlahList.length > 0) {
                $(".blah-sort-area").show();
                $.each(BlahList, function (index, item) {
                    newHTML = CreateUserBlahHTML(item,index);
                    blahsDiv.append(newHTML);
                });
                // bind events
                $("#UserBlahList>tr").click(function(theEvent){
                    theID = $(this).attr("data-blah-id");
                    DoOpenUserBlah(theID);
                });
                FilterBlahs();
            } else {
                $(".blah-sort-area").hide();
                newHTML = "<tr><td colspan='2' class='no-history-item'>You have not created any posts.</td></tr>";
                blahsDiv.append(newHTML);
            }

            blahsLoaded = true;
            if (blahsLoaded && commentsLoaded) {
                OpenSectionAndScroll();
            }
        };

        var SortAndRedrawComments = function(theComments) {
            CommentList = theComments;
            SortComments();
            var newHTML = "";
            var commentDiv = $("#UserCommentList");
            commentDiv.empty();
            if (CommentList.length > 0) {
                $(".comment-sort-area").show();
                $.each(CommentList, function (index, item) {
                    newHTML = CreateUserCommentHTML(item,index);
                    commentDiv.append(newHTML);
                });
                // bind events
                $("#UserCommentList a").click(function(theEvent){
                    var blahId = $(theEvent.target).attr("data-blah-id");
                    var commentId = $(theEvent.target).parents(".user-comment-row").attr("data-comment-id");
                    G.ReturnBlahId = null;
                    G.ReturnCommentId = commentId;
                    DoOpenUserComment(blahId);
                });
                FilterComments();
            } else {
                $(".comment-sort-area").hide();
                newHTML = "<tr><td colspan='2' class='no-history-item'>You have not created any comments yet.</td></tr>";
                commentDiv.append(newHTML);

            }

            commentsLoaded = true;
            if (blahsLoaded && commentsLoaded) {
                OpenSectionAndScroll();
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
                CommentList.sort(G.DynamicSort(filterProp));
                if (commentSortDir == "desc")
                    CommentList.reverse();
            }
        };

        var SortBlahs = function() {
            var filterProp = "";
            var forward = false;
            switch(blahSortType) {
                case "bydate":
                    filterProp = "c";
                    break;
                case "bypromotes":
                    filterProp = "U";
                    break;
                case "bydemotes":
                    filterProp = "D";
                    break;
                case "bytype":
                    filterProp = "Y";
                    break;
            }

            if (filterProp != "") {
                BlahList.sort(G.DynamicSort(filterProp));
                if (blahSortDir == "desc")
                    BlahList.reverse();
            }
        };

        var UpdateSelfHistory = function() {
            var blahsDiv = $("#UserBlahList");
            var commentDiv = $("#UserCommentList");
            blahsDiv.empty();
            commentDiv.empty();

            blahgua_rest.GetUserBlahs(SortAndRedrawBlahs, exports.OnFailure);

            blahgua_rest.GetUserComments(SortAndRedrawComments, exports.OnFailure);

            // headers
            $('.accordion h2').click(function(theEvent) {
                var parent = $(this).parent('.accordion');
                if (parent.hasClass("active")) {
                    // close it
                    parent.removeClass("active");
                } else {
                    // open it and close others
                    $(".active").removeClass("active");
                    parent.addClass("active");
                    this.scrollIntoView(true);
                }
            });
        };

        var OpenSectionAndScroll = function() {
            if (G.ReturnBlahId != null) {
                $("#HistoryBlahHeader").click();
                var $targetItem = $(".user-blah-row[data-blah-id=" + G.ReturnBlahId + "]");
                $targetItem.css({'background-color':'rgb(255,255,0)'});
                var itemHeight = $targetItem.height();
                $("#SelfPageDiv").scrollTo($targetItem, {offsetTop:itemHeight+66});
                $targetItem.animate({'background-color': 'rgb(255,255,255)'}, 2000);
            } else if (G.ReturnCommentId != null) {
                $("#HistoryCommentHeader").click();
                var $targetItem = $(".user-comment-row[data-comment-id=" + G.ReturnCommentId + "]");
                $targetItem.css({'background-color':'rgb(255,255,0)'});
                var itemHeight = $targetItem.height();
                $("#SelfPageDiv").scrollTo($targetItem, {offsetTop:itemHeight+66});
                $targetItem.animate({'background-color': 'rgb(255,255,255)'}, 2000);
            }

            G.ReturnBlahId = null;
            G.ReturnCommentId = null;
        }
     
        var CreateUserBlahHTML = function(theBlah,number) {
            var newHTML = "";
            var img = G.GetItemImage(theBlah, "A");
            var blahTitle = G.UnCodifyText(theBlah.T);
            var promotes = G.GetSafeProperty(theBlah, "U", 0);
            var demotes = G.GetSafeProperty(theBlah, "D", 0);
            var opens = G.GetSafeProperty(theBlah, "O", 0);
            var views = G.GetSafeProperty(theBlah, "V", 0);

            if (views == 0)
                views = opens;
            var openScore;
            if (opens == 0)
                openScore = 0;
            else
                openScore = Math.floor(100 * (opens / views));
            var numComments = G.GetSafeProperty(theBlah, "C", 0);



            newHTML += "<tr class='user-blah-row' data-blah-id='" + theBlah._id + "'>";
            newHTML += "<td><table><tbody>";


            if (img != "") {
                newHTML += "<td class='title-text'>";
                newHTML += "<a href='javascript:void(null)'>";
                if (blahTitle == "")
                    blahTitle = "<span class='untitled-blah'>untitled blah</span>";
                newHTML += blahTitle;
                newHTML += "</a></td>";
                newHTML += "<td>";
                newHTML += "<div class='blah-preview-image' style='background-image: url(\"" + img + "\")'>";
                newHTML += "</td>";
            } else {
                newHTML += "<td colspan='2' class='title-text'>";
				newHTML += "<a href='javascript:void(null)'>";
                newHTML += blahTitle;
                newHTML += "</a></td>";
            }
            newHTML += "</tr>";


            var blahType = exports.GetBlahTypeNameFromId(theBlah.Y);
            var bgColor = exports.GetBlahTypeColorFromId(theBlah.Y);
            newHTML += "<tr>";
            newHTML += "<td colspan='2' class='user-blah-detail'>";
            newHTML += "<div class='blah-type-square' style='background-color:" + bgColor + "'>" + blahType + "</div>";

            newHTML += '<span><img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/black_promote.png">' + promotes + "</span>";
            newHTML += '<span><img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/black_demote.png">' + demotes + "</span>";
            newHTML += "<span><i class='icon-eye-open add-margin' title='ratio of opens to views'></i>" + openScore + "%</span>";
            newHTML += "<span><i class='icon-comments add-margin' title='# of comments'></i>" + numComments + "</span>";
            newHTML += "<span class='user-blah-date'>"+ G.ElapsedTimeString(new Date(theBlah.c)) + "</span>";
            newHTML += "</td></tr>";
            newHTML += "</tbody></table></td></tr>";
            return newHTML;
        };

        var CreateUserCommentHTML = function(theComment,number) {
            var newHTML = "";
            var promotes = G.GetSafeProperty(theComment, "U", 0);
            var demotes = G.GetSafeProperty(theComment, "D", 0);
			var img = G.GetItemImage(theComment, "D");
            newHTML += "<tr class='user-comment-row' data-comment-id='" + theComment._id + "'>";
            newHTML += "<td><table><tbody>";

            newHTML += "<tr>"
			if(img!="")
			{
                newHTML += "<td class='title-text'>"
                newHTML += G.UnCodifyText(theComment.T);
                newHTML += "</td>";
                newHTML += "<td>";
                newHTML += "<div class='blah-preview-image' style='background-image: url(\"" + img + "\")'>";
                newHTML += "</td>";
			}
			else
			{
                newHTML += "<td colspan='2' class='title-text'>"
                newHTML += G.UnCodifyText(theComment.T);
                newHTML += "</td>";
			}
            newHTML += "</tr>";
			
			newHTML += "<tr>"
            newHTML += "<td colspan='2'  class='user-comment-detail'>";
            newHTML += "<a class='blah-comment-link' href='javascript:void(null)' data-blah-id='" + theComment.B + "'>go to post</a>";
            newHTML += '<span><img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/black_promote.png">' + promotes + "</span>";
            newHTML += '<span><img class="comment-vote" alt="" src="' + BlahguaConfig.fragmentURL + 'img/black_demote.png">' + demotes + "</span>";
            newHTML += "<span class='user-blah-date'>" + G.ElapsedTimeString(new Date(theComment.c)) + "</span></td>";
            newHTML += "</tr>";
            newHTML += "</tbody></table></td></tr>";
            return newHTML;
        };
     


        var DoOpenUserBlah = function(blahId) {
            var EndDate = new Date(Date.now());
            var StartDate = new Date(Date.now() - (G.NumStatsDaysToShow * 24 * 3600 * 1000 ));
            var startStr = G.CreateDateString(StartDate);
            var endStr = G.CreateDateString(EndDate);
            G.ReturnBlahId = blahId;
            G.ReturnCommentId = null;

            blahgua_rest.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
                G.CurrentBlah = theBlah;
                G.BlahReturnPage = "UserBlahList";
                G.CurrentBlahNickname = G.GetSafeProperty(G.UserProfile, "A", "someone");
                exports.OpenLoadedBlah(theBlah);
            }, exports.OnFailure);
        };

        var DoOpenUserComment = function(blahId) {
            var EndDate = new Date(Date.now());
            var StartDate = new Date(Date.now() - (G.NumStatsDaysToShow * 24 * 3600 * 1000 ));
            var startStr = G.CreateDateString(StartDate);
            var endStr = G.CreateDateString(EndDate);


            blahgua_rest.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
                G.CurrentBlah = theBlah;
                G.BlahReturnPage = "UserBlahList";
                exports.OpenLoadedBlah(theBlah);
            }, exports.OnFailure);
        };

        return {
            InitializePage: InitializePage
        }
    }
);