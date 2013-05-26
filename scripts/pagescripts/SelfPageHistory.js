/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPageHistory',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var  InitializePage = function() {
            UpdateSelfHistory();
        };

        function UpdateSelfHistory() {
            var blahsDiv = $("#UserBlahList");
            var commentDiv = $("#UserCommentList");
            blahsDiv.empty();
            commentDiv.empty();

            blahgua_rest.GetUserBlahs(function (blahList) {
                var newHTML = "";
                if (blahList.length > 0) {
                    $.each(blahList, function (index, item) {
                        newHTML = CreateUserBlahHTML(item);
                        blahsDiv.append(newHTML);
                    });
                    // bind events
                    $("#UserBlahList tr").click(function(theEvent){
                        theID = $(theEvent.target).closest("tr").attr("data-blah-id");
                        DoOpenUserBlah(theID);
                    });
                } else {
                    newHTML = "<tr><td colspan='2'>You have not created any blahs yet.</td></tr>";
                    blahsDiv.append(newHTML);
                }
            }, exports.OnFailure);

            blahgua_rest.GetUserComments(function(commentList) {
                var newHTML = "";
                if (commentList.length > 0) {
                    $.each(commentList, function (index, item) {
                        newHTML = CreateUserCommentHTML(item);
                        commentDiv.append(newHTML);
                    });
                    // bind events
                    $("#UserCommentList a").click(function(theEvent){
                        theID = $(theEvent.target).attr("data-blah-id");
                        DoOpenUserComment(theID);
                    });
                } else {
                    newHTML = "<tr><td colspan='2'>You have not created any comments yet.</td></tr>";
                    commentDiv.append(newHTML);
                }
            }, exports.OnFailure);

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

        var CreateUserBlahHTML = function(theBlah) {
            var newHTML = "";
            var img = GetItemImage(theBlah, "A");

            newHTML += "<tr data-blah-id='" + theBlah._id + "'>";
            newHTML += "<td>";
            if (img != "") {
                newHTML += "<div class='blah-preview-image' style='background-image: url(\"" + img + "\")'>";
            }
            newHTML += "</td>"
            newHTML += "<td style='width:100%'><a href='javascript:void(null)' >";
            newHTML += theBlah.T;
            newHTML += "</a></td>";
            newHTML += "<td>" + ElapsedTimeString(new Date(theBlah.c)) + "</td>";
            newHTML += "</tr>";
            return newHTML;
        };

        var CreateUserCommentHTML = function(theComment) {
            var newHTML = "";
            newHTML += "<tr>"
            newHTML += "<td style='width:100%'><a href='javascript:void(null)' data-blah-id='" + theComment.B + "'>";
            newHTML += theComment.T;
            newHTML += "</a></td>";
            newHTML += "<td>" + ElapsedTimeString(new Date(theComment.c)) + "</td>"
            newHTML += "</tr>";
            return newHTML;
        };


        var DoOpenUserBlah = function(blahId) {
            var EndDate = new Date(Date.now());
            var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
            var startStr = createDateString(StartDate);
            var endStr = createDateString(EndDate);

            blahgua_rest.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
                CurrentBlah = theBlah;
                BlahReturnPage = "UserBlahList";
                CurrentBlahNickname = getSafeProperty(UserProfile, "A", "someone");
                exports.OpenLoadedBlah(theBlah);
            }, exports.OnFailure);
        };

        var DoOpenUserComment = function(blahId) {
            var EndDate = new Date(Date.now());
            var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
            var startStr = createDateString(StartDate);
            var endStr = createDateString(EndDate);

            blahgua_rest.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
                CurrentBlah = theBlah;
                BlahReturnPage = "UserBlahList";
                exports.OpenLoadedBlah(theBlah);
            }, exports.OnFailure);
        };

        return {
            InitializePage: InitializePage
        }
    }
);