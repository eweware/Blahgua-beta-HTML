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

        var CommentList = [];
        var BlahList = [];

        var  InitializePage = function() {
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
                $.each(BlahList, function (index, item) {
                    newHTML = CreateUserBlahHTML(item,index);
                    blahsDiv.append(newHTML);
                });
                // bind events
                $("#UserBlahList tr").click(function(theEvent){
                    theID = $(theEvent.target).closest("tr").attr("data-blah-id");
                    DoOpenUserBlah(theID);
                });
                FilterBlahs();
            } else {
                newHTML = "<tr><td colspan='2'>You have not created any posts.</td></tr>";
                blahsDiv.append(newHTML);
            }
        };

        var SortAndRedrawComments = function(theComments) {
            CommentList = theComments;
            SortComments();
            var newHTML = "";
            var commentDiv = $("#UserCommentList");
            commentDiv.empty();
            if (CommentList.length > 0) {
                $.each(CommentList, function (index, item) {
                    newHTML = CreateUserCommentHTML(item);
                    commentDiv.append(newHTML);
                });
                // bind events
                $("#UserCommentList a").click(function(theEvent){
                    theID = $(theEvent.target).attr("data-blah-id");
                    DoOpenUserComment(theID);
                });
                FilterComments();
            } else {
                newHTML = "<tr><td colspan='2'>You have not created any comments yet.</td></tr>";
                commentDiv.append(newHTML);

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

      /*  var CreateUserBlahHTML = function(theBlah) {
            var newHTML = "";
            var img = G.GetItemImage(theBlah, "A");

            newHTML += "<tr class='user-blah-row' data-blah-id='" + theBlah._id + "'>";
            if (img != "") {
                newHTML += "<td class='title-text'>";
                newHTML += G.UnCodifyText(theBlah.T);
                newHTML += "</a></td>";
                newHTML += "<td>";
                newHTML += "<div class='blah-preview-image' style='background-image: url(\"" + img + "\")'>";
                newHTML += "</td>";
            } else {
                newHTML += "<td colspan='2' class='title-text'>";
                newHTML += G.UnCodifyText(theBlah.T);
                newHTML += "</a></td>";
            }
            newHTML += "</tr>";


            newHTML += "<tr>"
            newHTML += "<td>" + G.ElapsedTimeString(new Date(theBlah.c)) + "</td>";
            newHTML += "</tr>";
            return newHTML;
        };*/
		    var CreateUserBlahHTML = function(theBlah,number) {
            var newHTML = "";
			var positionNum=number+1;
            var img = G.GetItemImage(theBlah, "A");

            newHTML += "<tr class='user-blah-row' data-blah-id='" + theBlah._id + "'>";
            if (img != "") {
                newHTML += "<td class='title-text'>";
				newHTML += "<span class='positionNum'>"+positionNum+"</span>";
                newHTML += G.UnCodifyText(theBlah.T);
                newHTML += "</a></td>";
                newHTML += "<td>";
                newHTML += "<div class='blah-preview-image' style='background-image: url(\"" + img + "\")'>";
                newHTML += "</td>";
            } else {
                newHTML += "<td colspan='2' class='title-text'>";
				newHTML += "<span class='positionNum'>"+positionNum+"</span>";
                newHTML += G.UnCodifyText(theBlah.T);
                newHTML += "</a></td>";
            }
            newHTML += "</tr>";


            newHTML += "<tr>"
            newHTML += "<td>" + G.ElapsedTimeString(new Date(theBlah.c)) + "</td>";
            newHTML += "</tr>";
            return newHTML;
        };

        var CreateUserCommentHTML = function(theComment) {
            var newHTML = "";
            newHTML += "<tr class='user-comment-row'>"
            newHTML += "<td class='title-text'><a href='javascript:void(null)' data-blah-id='" + theComment.B + "'>";
            newHTML += G.UnCodifyText(theComment.T);
            newHTML += "</a></td>";
            newHTML += "<td>" + G.ElapsedTimeString(new Date(theComment.c)) + "</td>"
            newHTML += "</tr>";
            return newHTML;
        };


        var DoOpenUserBlah = function(blahId) {
            var EndDate = new Date(Date.now());
            var StartDate = new Date(Date.now() - (G.NumStatsDaysToShow * 24 * 3600 * 1000 ));
            var startStr = G.CreateDateString(StartDate);
            var endStr = G.CreateDateString(EndDate);

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