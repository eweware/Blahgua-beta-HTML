﻿


var BlahsMovingTimer = null;
var BlahPreviewTimeout = null;
var ViewerUpdateTimer = null;

var ColorMap = [];
var BlahList;
var NextBlahList;
var BlahIndex = 0;
var LargeTileWidth = 400;
var MediumTileWidth = 200;
var SmallTileWidth = 100;
var LargeTileHeight = 400;
var MediumTileHeight = 200;
var SmallTileHeight = 100;
var ActiveBlahList;
var MaxMedium = 0;
var MaxSmall = 0;
var TopRow = null;
var BottomRow = null;
var CurrentScrollSpeed = 1;
var RowsOnScreen = 10;
var BlahPreviewItem;
var BlahFullItem;
var FocusedBlah = null;
var CurrentBlah = null;
var CurrentComments = null;
var CurrentChannel = null;
var CurrentUser = null;
var ChannelList = [];
var BlahTypeList = null;
var IsUserLoggedIn = false;
var IsTempUser = true;
var ChannelDropMenu = null;
var minRows = 1;              
var maxRows = 99;
var minRows1 = 3;
var fragmentURL = "http://blahgua-webapp.s3.amazonaws.com";
var windowline1 = 430;
var windowline2 = 500;


(function ($) {
    $.fn.disableSelection = function () {
        return this.each(function () {
            $(this).attr('unselectable', 'on')
                   .css({
                       '-moz-user-select': 'none',
                       '-o-user-select': 'none',
                       '-khtml-user-select': 'none',
                       '-webkit-user-select': 'none',
                       '-ms-user-select': 'none',
                       'user-select': 'none'
                   })
                   .each(function () {
                       $(this).attr('unselectable', 'on')
                       .bind('selectstart', function () { return false; });
                   });
        });
    };
})(jQuery);

function require(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false, // <-- this is the key
        success: function () {
            // all good...
        },
        error: function (theErr) {
            throw new Error("Could not load script " + script);
        }
    });
}


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
     return null;
}



$(document).ready(function () {
    $("#BlahContainer").disableSelection();
    $("#BlahContainer").on('swipeleft', HandleSwipeLeft);
    $("#BlahContainer").on('swiperight', HandleSwipeRight);
    $("#BlahContainer").on('swipeup', HandleSwipeUp);
    $("#BlahContainer").on('swipedown', HandleSwipeDown);
    $("#LightBox").click(function () {
        $("#ChannelDropMenu").hide();
        UnfocusBlah();
    });
    if ((window.location.hostname == "") || (window.location.hostname == "localhost"))  {
        // running local
        fragmentURL = "./aws";
       }
        SignIn();
});



// *****************************************************
// Sign-in


function SignIn() {
    var savedID = $.cookie("userId");
    var pwd = $.cookie("password");

    if (savedID != null) {
        if (pwd == null) {
            pwd = prompt("Welcome back. enter password:")
        }

        // sign in
        Blahgua.loginUser(savedID, pwd, function () {
            IsUserLoggedIn = true;
            Blahgua.getUserInfo(function (json) {
                CurrentUser = json;
                finalizeInitialLoad();
            });
        }, function() {
            $.removeCookie("userId");
            $.removeCookie("password");
            IsUserLoggedIn = false;
            finalizeInitialLoad();
        });
    } else {
        IsUserLoggedIn = false;
        // user is anonymous
        finalizeInitialLoad();
    }
}


function GenerateGUID() {
    return Date.now().toString() + 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}



function CreateTempUserAndSignIn() {
    var tempUserName = GenerateGUID();
    var pwd = "Demo20130215";
    Blahgua.CreateUser(tempUserName, pwd,
        function (json) {
            CurrentUser = json;
            $.cookie("userId", tempUserName, { expires: 30, path: '/'});
            $.cookie("password", pwd, { expires: 30, path: '/'});
            $.cookie("isTemp", true, { expires: 30, path: '/'});
            IsTempUser = true;
            finalizeInitialLoad();
        },
        function (theErr) {
            alert("Could not sign in to blahgua. Soz!");
        }
    );
}


function OnLoginUserOK(json) {
    IsUserLoggedIn = true;
    Blahgua.currentUser = CurrentUser._id;
    finalizeInitialLoad();

}

function OnLoginUserFail(json) {
    alert("login failed!");
}



// *************************************************
// Channels

function ChannelIDFromName(Channel, ChannelList) {
    var curChannel;
    for (curIndex in ChannelList) {
        curChannel = ChannelList[curIndex];
        if (curChannel.displayName == Channel) {
            return curChannel._id;
        }
    }
    return null;
}


function AddDefaultChannelsToNewUser() {
    Blahgua.GetAllChannels(OnGetChannelsOK);
}

function OnGetChannelsOK(channelList) {
    Blahgua.JoinUserToChannel(ChannelIDFromName("The Now Network", channelList),
        function () {
            Blahgua.JoinUserToChannel(ChannelIDFromName("Entertainment", channelList),
                function () {
                    Blahgua.JoinUserToChannel(ChannelIDFromName("Politics", channelList),
                        function () {
                            Blahgua.JoinUserToChannel(ChannelIDFromName("Sports", channelList),
                                function () {
                                    Blahgua.JoinUserToChannel(ChannelIDFromName("Humor", channelList),
                                        GetUserChannels);
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

// *************************************************
// Initial Load

function finalizeInitialLoad() {
    CreateChannelBanner();
    CreatePreviewBlah();
    CreateFullBlah();
    GetUserChannels();
    UpdateBlahTypes();

    ComputeSizes();
}


// ********************************************************
// Create the elements for blahs and rows


function HandleSwipeLeft(theEvent) {

    GoNextChannel();


}

function HandleSwipeRight(theEvent) {
    GoPrevChannel();
}


function HandleSwipeUp(theEvent) {
    CurrentScrollSpeed = 50;
}


function HandleSwipeDown(theEvent) {
    CurrentScrollSpeed = -50;
}




// ********************************************************
// stubs for error callbacks


function OnSuccess(theArg) {
    $("#DivToShowHide").html(theArg);
}

function OnFailure(theErr) {
    var errString = "An error occured.  Soz!";
    var responseText = getSafeProperty(theErr, "responseText", null);
    if (responseText) {
        try {
            var responseObj = JSON.parse(responseText);
            var message = getSafeProperty(responseObj, "message", "An error occured");
            var code = getSafeProperty(responseObj, "errorCode", "<no id>");
            errString = "Error: (" + code + "): " + message;
        } catch (exp) {
            errString = "Error: " + responseText;
        }
    }
    alert(errString);
}



// ********************************************************
// Alt fading


function AltFade(theElement) {
    FadeRandomElement();
}

var LastFadeElement;

function SelectRandomElement() {
    var randRow;
    var pickedEl = LastFadeElement;
    var curRow, numChildren;
    var firstRow = TopRow;
    var attempts = 0;
    
    while ((pickedEl == LastFadeElement) && (attempts < 10)) {
        attempts++;
        curRow = TopRow;
        randRow = Math.floor(Math.random() * RowsOnScreen);
        while (randRow > 0) {
            curRow = curRow.rowBelow;
            if (curRow == BottomRow) {
                break;
            }
            randRow--;
        }

        // have the row, pick the object
        pickedEl = curRow.childNodes[Math.floor(Math.random() * curRow.childNodes.length)];
    }
    
    return pickedEl;
}

function FadeRandomElement() {
    var theEl = SelectRandomElement();
    if (theEl.style.backgroundImage != "") {
        $(theEl.blahTextDiv).fadeToggle(1000, "swing", FadeRandomElement);
    } else {
        setTimeout(FadeRandomElement, 1000);
        /*
//theEl.blahTextDiv.style.backgroundColor = "red";
$(theEl).flippy({
content: $(theEl.blahTextDiv),
direction:"LEFT",
duration:"750",
onFinish:function(){
theEl.style.backgroundColor = "red";
FadeRandomElement();
}

});
*/
    }
    LastFadeElement = theEl;
}







// ********************************************************
// Start-up code



function ComputeSizes() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    if (windowWidth > windowHeight) {
        isVertical = false;
    } else {
        isVertical = true;
    }

    var numCols, numRows;



    var numCols = 1;

    SmallTileWidth = Math.floor(windowWidth / (numCols * 4));
    if (SmallTileWidth > 128) {
        SmallTileWidth = 128;
    }
    MediumTileWidth = SmallTileWidth * 2;
    LargeTileWidth = MediumTileWidth * 2;

    SmallTileHeight = SmallTileWidth;
    MediumTileHeight = MediumTileWidth ;
    LargeTileHeight = LargeTileWidth;

    // now make the window the correct size
    var offset = Math.floor((windowWidth - LargeTileWidth) / 2);
    var blahContainer = document.getElementById("BlahContainer");
    blahContainer.style.left = offset + "px";
    blahContainer.style.width = LargeTileWidth + "px";

    $("#BlahContainer").css({ 'left': offset + 'px', 'width': LargeTileWidth + 'px' });
    $("#ChannelBanner").css({ 'left': offset + 'px', 'width': LargeTileWidth + 'px' });
    $("#BlahPreviewItem").css({ 'left': offset + 16 + 'px', 'width': LargeTileWidth - 32 + 'px', 'maxHeight': windowHeight-50+'px' });

    $("#BlahFullItem").css({ 'left': offset + 'px', 'width': LargeTileWidth + 'px' });


}

function ShowHideChannelList() {
    var menu = document.getElementById("ChannelDropMenu");
    menu.style.left = document.getElementById("ChannelBanner").style.left;
    if (menu.style.display == "none") {
        ShowChannelList();
    } else {
       HideChannelList();
    }
}

function HideChannelList() {
    var menu = document.getElementById("ChannelDropMenu");
    menu.style.left = document.getElementById("ChannelBanner").style.left;
    if (menu.style.display != "none") {
        $("#LightBox").hide();
        $(menu).fadeOut("fast");
        StartAnimation();
    }
}

function ShowChannelList() {
    var menu = document.getElementById("ChannelDropMenu");
    menu.style.left = document.getElementById("ChannelBanner").style.left;
    if (menu.style.display == "none") {
        $("#LightBox").show();
        if (IsUserLoggedIn)
            $("#BrowseChannelBtn").show();
        else
            $("#BrowseChannelBtn").hide();
        StopAnimation();
        menu.style.display = "block";
    }
}


function CreateChannelBanner() {
    var banner = document.getElementById("ChannelBanner");
    var label = document.createElement("span");
    label.id = "ChannelBannerLabel";
    label.className = "ChannelNameText";
    label.innerHTML = "Blahgua";
    banner.appendChild(label);
    banner.channelLabel = label;

    $("#ChannelBanner").click(function () {
        ShowHideChannelList();
    })
    

    var viewCount = document.createElement("span");
    viewCount.className = "ChannelViewersSpan";
    banner.appendChild(viewCount);
    banner.viewCount = viewCount;
    var eyeImage = document.createElement("img");
    eyeImage.src = fragmentURL + "/img/black_eye.png";
    eyeImage.className = "ChannelViewersImg";
    eyeImage.alt = "viewer count";
    viewCount.appendChild(eyeImage);
    eyeImage.width = "24";
    eyeImage.height = "24";
    var countText = document.createElement("span");
    countText.className = "ChannelViewersCountText";
    countText.id = "ChannelViewersCountText";
    viewCount.appendChild(countText);
    countText.innerHTML = "";

    var options = document.createElement("div");
    options.onclick = function(event) {DoCreateBlah(); event.stopPropagation();};
    options.className = "ChannelOptions";
    options.innerHTML = "+";
    banner.appendChild(options);
    banner.options = options;




}

function CreatePreviewBlah() {
    BlahPreviewItem = document.getElementById("BlahPreviewItem");
    $(BlahPreviewItem).load(fragmentURL + "/pages/BlahPreview.html #BlahPreview", function () {
        BlahPreviewItem.headline = document.getElementById("BlahPreviewHeadline");
        BlahPreviewItem.headline.onclick = function() {
            if (BlahPreviewTimeout != null) {
                clearTimeout(BlahPreviewTimeout);
                BlahPreviewTimeout = null;
            }
            OpenBlah(FocusedBlah);}
    });
}


function CreateFullBlah() {
    BlahFullItem = document.getElementById("BlahFullItem");
}


function DoBlahDoubleClick(theEvent) {
    theEvent = window.event || theEvent;
    var who = theEvent.target || theEvent.srcElement;
    while (who.hasOwnProperty("blah") == false) {
        who = who.parentElement;
    }
    OpenBlah(who.blah);
}

function DoBlahClick(theEvent) {
    theEvent = window.event || theEvent;
    var who = theEvent.target || theEvent.srcElement;
    while (who.hasOwnProperty("blah") == false) {
        who = who.parentElement;
    }

    // now do something
    FocusBlah(who);
}

function DoCloseBlah(theEvent) {
    $("#AdditionalInfoArea").empty();
    CloseBlah();
}

function CloseBlah() {

    // hide the preview blah and reset the variables
    $(BlahFullItem).off('swipeleft');
    $(BlahFullItem).off('swiperight');

    UnfocusBlah();
    $(BlahFullItem).fadeOut("fast", function() {$(BlahFullItem).empty()});
    RefreshCurrentChannel();

}

function StopAnimation() {
    if (BlahsMovingTimer != null) {
        clearTimeout(BlahsMovingTimer);
        BlahsMovingTimer = null;
    }
}

function StartAnimation() {
    StartBlahsMoving();
}

var OpenBlahPage;

function OpenBlah(whichBlah) {
    StopAnimation();
    $("#BlahPreviewExtra").empty();
    $("#LightBox").hide();
    $(BlahFullItem).load(fragmentURL + "/pages/BlahDetailPage.html #FullBlahDiv", function() {
        var windowHeight = $(window).height();
        PopulateFullBlah(whichBlah);
        $(BlahFullItem).disableSelection();
        $(BlahFullItem).fadeIn("fast", function() {
            var windowWidth = $(window).width();
            var delta = Math.round((windowWidth - 512) / 2);
            if (delta < 0) delta = 0;
            delta = delta + "px";
            SetBlahDetailPage("Overview");
        });
        $(BlahFullItem).on('swipeleft', HandleBlahSwipeLeft);
        $(BlahFullItem).on('swiperight', HandleBlahSwipeRight);
    });
}

function SetBlahDetailPage(whichPage) {
    switch (whichPage) {
        case "Overview":
            BlahFullItem.curPage = "Overview";
            $("#BlahPageDiv").load(fragmentURL + "/pages/BlahBodyDetailPage.html #FullBlahBodyDiv", function() {
                UpdateBlahOverview();
            });
            break;
        case "Comments":
            BlahFullItem.curPage = "Comments";
            $("#BlahPageDiv").load(fragmentURL + "/pages/BlahCommentDetailPage.html #FullBlahCommentDiv", function() {
                UpdateBlahComments();
            });
            break;
        case "Stats":
            BlahFullItem.curPage = "Stats";
            $("#BlahPageDiv").load(fragmentURL + "/pages/BlahStatsDetailPage.html #FullBlahStatsDiv", function() {
                UpdateBlahStats();
            });
            break;
        case "Author":
            BlahFullItem.curPage = "Author";
            $("#BlahPageDiv").load(fragmentURL + "/pages/BlahAuthorPage.html #FullBlahAuthorDiv", function() {
                UpdateBlahAuthor();
            });
            break;
    }
}

function HandleBlahSwipeLeft() {
    switch (BlahFullItem.curPage) {
        case "Overview":
            SetBlahDetailPage("Comments");
            break;
        case "Comments":
            SetBlahDetailPage("Stats");
            break;
        case "Stats":
            SetBlahDetailPage("Author");
            break;
        case "Author":
            SetBlahDetailPage("Overview");
            break;
    }
}

function HandleBlahSwipeRight() {
    switch (BlahFullItem.curPage) {
        case "Overview":
            SetBlahDetailPage("Author");
            break;
        case "Comments":
            SetBlahDetailPage("Overview");
            break;
        case "Stats":
            SetBlahDetailPage("Comments");
            break;
        case "Author":
            SetBlahDetailPage("Stats");
            break;
    }
}

function UpdateBlahOverview() {
// reformat the promote area if the user has already voted
    document.getElementById("fullBlahComments").innerHTML = getSafeProperty(CurrentBlah, "c", 0);
    var isOwnBlah;


    if (IsUserLoggedIn) {
        isOwnBlah = (CurrentBlah.authorId == CurrentUser._id);
    } else {
        isOwnBlah = false;
    }

    if (IsUserLoggedIn) {

        $("#BlahRowVote").show();
        $("#BlahRowSignIn").hide();

        if (isOwnBlah) {
            var upVotes = getSafeProperty(CurrentBlah, "vu", 0);
            var downVotes = getSafeProperty(CurrentBlah, "vd", 0);

            $("#PromoteBlahImage").show();
            $("#UserPromoteSpan").text(upVotes + " promotes");
            $("#DemoteBlahImage").show();
            $("#UserDemoteSpan").text(downVotes + " demotes");
        } else {
            var userVote = getSafeProperty(CurrentBlah, "uv", 0);
            if (userVote && (userVote != 0)) {
                if (userVote == 1) {
                    $("#PromoteBlahImage").show()
                    $("#DemoteBlahImage").hide();
                    $("#UserPromoteSpan").text("promoted by you!");
                    $("#UserDemoteSpan").text("");
                }  else {
                    $("#PromoteBlahImage").hide();
                    $("#PreviewDemoteBlah").show();
                    $("#UserDemoteSpan").text("demoted by you!");
                    $("#UserPromoteSpan").text("");
                }
            } else {
                $("#PromoteBlahImage").show();
                $("#UserPromoteSpan").text("promote");
                $("#DemoteBlahImage").show();
                $("#UserDemoteSpan").text("demote");
            }
        }
    } else {
        $("#BlahRowVote").hide();
        $("#BlahRowSignIn").show();
    }


    var image = GetBlahImage(CurrentBlah, "D");
    var imageEl = document.getElementById("blahFullImage");
    var headlineText = document.getElementById("BlahFullHeadline");
    if (image == "") {
        imageEl.style.display = "none";
        headlineText.style.fontSize = "36px";
    } else {
        imageEl.style.display = "block";
        imageEl.src = image;
        headlineText.style.fontSize = "24px";
    }

    var bodyTextDiv = document.getElementById("BlahFullBody");
    if (CurrentBlah.hasOwnProperty("b")) {
        var bodyText = CurrentBlah.b;
        if (bodyText && (bodyText != "")) {
            bodyText = URLifyText(unescape(bodyText)).replace(/\n/g, "<br/>");
        }
        bodyTextDiv.innerHTML = bodyText;
    } else {
        bodyTextDiv.innerHTML = "";
    }

    // update any additional area
    switch (GetBlahTypeStr()) {
        case "predicts":
            $("#AdditionalInfoArea").load(fragmentURL + "/pages/BlahTypePredictPage.html #BlahTypePredictPage",
                function() { UpdatePredictPage(); })
            break;
        case "polls":
            $("#AdditionalInfoArea").load(fragmentURL + "/pages/BlahTypeAskPage.html #BlahTypeAskPage",
                function() { UpdateAskPage(); })
            break;
        default:

    }
}

function UpdateBlahComments() {
// update the comments

    if (CurrentBlah.hasOwnProperty("c") && CurrentBlah.c > 0) {
        // blah has comments
        Blahgua.GetBlahComments(CurrentBlah._id, SortAndRedrawComments, OnFailure);
    } else {
        // no comments GetBlahTypeStr()
        var newHTML = "";
        newHTML += '<tr><td><span class="NoCommentSpan">No Comments</span></td></tr>';
        $("#BlahCommentTable").append(newHTML);
    }
}


function UpdateBlahStats() {
    // blah popularity over time
    $('#BlahStrengthDiv').highcharts({
        chart: {
            type: 'area'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Popularity'
        },
        yAxis: {
            title: {
                text: 'strength'
            }
        },
        series: [{
            data: [1, 2,3,4,5,6,7,8,9,10]
        }]
    });

    // opens, views, comments
    $('#ViewChartDiv').highcharts({
        chart: {
            type: 'line'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Views, Opens, and Comments'
        },
        yAxis: {
            title: {
                text: 'Count'
            }
        },
        series: [{
            name: 'views',
            data: [1, 0, 4]
        }, {
            name: 'opens',
            data: [5, 7, 3]
        }, {
            name: 'comments',
            data: [5, 7, 3]
        }]
    });

    // demos
    $('#BlahOpenChartDiv').highcharts({
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Opens'
        },
        xAxis: {
            categories: ['Male', 'Female', 'Unspecified']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: [{
            data: [1, 0, 4]
        }]
    });

    // comments
    $('#BlahCommentChartDiv').highcharts({
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Comments'
        },
        xAxis: {
            categories: ['Male', 'Female', 'Unspecified']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: [{
            data: [1, 0, 4]
        }]
    });

    // Promotes
    $('#BlahPromoteChartDiv').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Promotes'
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: ['Male', 'Female', 'Unspecified']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: [{
            data: [1, 0, 4]
        }]
    });

    // demotes
    $('#BlahDemoteChartDiv').highcharts({
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Demotes'
        },
        xAxis: {
            categories: ['Male', 'Female', 'Unspecified']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: [{
            data: [1, 0, 4]
        }]
    });
}


function UpdateBlahAuthor() {

}




function PopulateFullBlah(whichBlah) {
    // get the entire blah to update the rest...
    Blahgua.GetBlahWithStats(whichBlah.blahId, "130101", "130331", UpdateFullBlahBody, OnFailure);
}


function getSafeProperty(obj, prop, defVal) {
    if(obj.hasOwnProperty(prop)) {
        return obj[prop];
    } else {
        return defVal;
    }
}

function GetBlahTypeStr() {
    var type = CurrentBlah.typeId;
    for (curType in BlahTypeList) {
        if (BlahTypeList[curType]._id == type) {
            return BlahTypeList[curType].name;
        }
    }

    return "";
}

function UpdateFullBlahBody(newBlah) {
    CurrentBlah = newBlah;
    var headlineText = document.getElementById("BlahFullHeadline");
    headlineText.innerHTML = unescape(CurrentBlah.text);
    var nickNameStr =  getSafeProperty(CurrentBlah, "nickname", "a blahger");
    var blahTypeStr =  GetBlahTypeStr();
    var isOwnBlah;


    if (IsUserLoggedIn) {
        isOwnBlah = (CurrentBlah.authorId == CurrentUser._id);
    } else {
        isOwnBlah = false;
    }

    if (isOwnBlah) {
        nickNameStr += " (you)";
    }

    // stats
    document.getElementById("FullBlahViewerCount").innerHTML = getSafeProperty(CurrentBlah, "views", 0); // change to actual viewers
    document.getElementById("FullBlahNickName").innerHTML = nickNameStr + " " + blahTypeStr;

    // update the opens
    Blahgua.AddBlahViewsOpens(CurrentBlah._id, 0, 1, null, null);// to do - check for errors

    // update the badges & date
    Blahgua.getUserDescriptorString(CurrentBlah.authorId, function(theString) {
        $("#FullBlahProfileString").text(theString);
    }, function (theErr) {
        $("#FullBlahProfileString").text("an anonymous blahger");
    })

    var curDate = new Date(getSafeProperty(CurrentBlah, "created", Date.now()));
    var dateString = ElapsedTimeString(curDate);
    $("#FullBlahDateStr").text(dateString);
}

function UpdatePredictPage(predictAreaName) {
    // update the prediction divs
    var expDateVal = getSafeProperty(CurrentBlah, "e", Date.now());
    var expDate = new Date(expDateVal);
    var elapStr = ElapsedTimeString(expDate);
    $("#elapsedTimeBlah").text(elapStr);
    $("#predictionDateBlah").text(expDate.toLocaleDateString());
}

function UpdateAskPage(previewAreaName) {

    if (CurrentBlah.hasOwnProperty("pt")) {
        var choices = CurrentBlah.pt;
        var votes = CurrentBlah.pv;
        var newChoice;
        var maxVotes = 0, curVotes;
        for (curIndex in votes) {
            curVotes = votes[curIndex];
            if (curVotes > maxVotes) {
                maxVotes = curVotes;
            }
        }

        previewAreaName = "#" + previewAreaName;
        for (curIndex in choices) {
            newChoice = CreatePollChoiceElement(choices[curIndex],votes[curIndex], maxVotes, curIndex);
            $(previewAreaName).append(newChoice);
        }

        if (IsUserLoggedIn)
            Blahgua.GetUserPollVote(CurrentBlah._id, OnGetUserPollVoteOK);
    }
}

function OnGetUserPollVoteOK(json) {
    if (json.hasOwnProperty("p")) {
        // disable all vote buttons
        $(".PollVoteIcon").remove();
        $(".PollVoteText")[Number(json.p)].style.color = "#FF0000";
        $(".PollVoteText")[Number(json.p)].style.fontWeight = "bold";
    }
}

function CreatePollChoiceElement(pollChoice, curVotes, maxVotes, choiceIndex) {
    var maxWidth = $("body").width() - 280;
    var ratio = curVotes/ maxVotes;
    var curRatio = Math.floor(100 * ratio);
    var newHTML = "";
    newHTML += '<table class="PollChoiceWrapper"><tbody><tr style="width:100%">';
    newHTML += '<td class="PollTitle"><span>' + pollChoice.g + '</span></td>';
    newHTML += '<td class="PollDescription" style="width:' + maxWidth + 'px">';
    newHTML += '<div class="PollChartDiv" style="width:' + curRatio + '%"></div></td>';
    newHTML += '<td class="PollVotes">';
    newHTML += '<img class="PollVoteIcon" src="' + fragmentURL + '/img/black_thumbsUp.png" id="' + choiceIndex + '" alt="vote up" onclick="DoPollVote(); return false;" />';
    newHTML += '<span class="PollVoteText">' + curVotes + '</span>';
    newHTML += '</td></tr>';
    // add a row for the comment, if any
    if (pollChoice.hasOwnProperty("t")) {
        newHTML += '<tr><td></td><td colspan="2" class="PollComment">';
        newHTML += '<span style="font-style:italic">' + pollChoice.t + '</span>';
        newHTML += '</td></tr>';
    }
    newHTML += "</tbody></table>";

    return newHTML;
}

function DoPollVote(theChoice) {
    var who = event.target || event.srcElement;

    Blahgua.SetUserPollVote(CurrentBlah._id, Number(who.id), OnSetUserPollVoteOk, OnPollVoteFail);
}

function OnSetUserPollVoteOk(json) {
    alert("Poll vote recorded");
}

function OnPollVoteFail(json) {
    alert("Poll vote failed!");
}




function SortAndRedrawComments(theComments) {
    CurrentComments = theComments;
    SortComments();

    UpdateBlahCommentDiv();
}

function SortComments() {
    var SortBy = "newest";

    if (SortBy == "") {
        SortBy = "newest";
        $("#SortByList")[0].value = "newest";
    }

    if (SortBy == "newest") {
        CurrentComments.sort(dynamicSort("created"));
        CurrentComments.reverse();

    }
    else if (SortBy == "oldest") {
        CurrentComments.sort(dynamicSort("created"));
    }
    else if (SortBy == "most_relevant") {
        // do nothing for now
    }
    else if (SortBy == "most_positive") {
        CurrentComments.sort(dynamicSort("cuv"));
        CurrentComments.reverse();
    }
    else if (SortBy == "most_negative") {
        // to do: need to fix for negative comments
        CurrentComments.sort(dynamicSort("cdv"));
        CurrentComments.reverse();
    }

}

function dynamicSort(property, subProp) {
    return function (a, b) {
        var aProp = 0;
        var bProp = 0;

        if (a.hasOwnProperty(property))
            aProp = a[property];

        if (b.hasOwnProperty(property))
            bProp = b[property];

        if ((aProp == bProp) && (subProp != null)) {
            var asProp = 0;
            var bsProp = 0;

            if (a.hasOwnProperty(subProp))
                asProp = a[subProp];

            if (b.hasOwnProperty(subProp))
                bsProp = b[subProp];

            return (asProp < bsProp) ? -1 : (asProp > bsProp) ? 1 : 0;
        }
        else {
            return (aProp < bProp) ? -1 : (aProp > bProp) ? 1 : 0;
        }
    }
}


/**
 * @return {string}
 */
function ElapsedTimeString(theDate) {
    var now = new Date();
    var timeSpan;
    var tailStr;

    if (theDate > now) {
        timeSpan = Math.floor((theDate - now) / 1000);
        tailStr = " from now";
    } else {
        timeSpan = Math.floor((now - theDate) / 1000);
        tailStr = " ago";
    }


    var curYears = Math.floor(timeSpan / 31536000);
    if (curYears > 0) {
        if (curYear > 2) {
            return curYear + " years" + tailStr;
        } else {
            return Math.floor(timeSpan / 2592000) + " months" + tailStr;
        }
    }

    var curMonths = Math.floor(timeSpan / 2592000); // average 30 days
    if (curMonths > 0) {
        if (curMonths >= 2) {
            return curMonths + " months" + tailStr;
        } else {
            return Math.floor(timeSpan / 604800) + " weeks" + tailStr;
        }
    }

    var curDays = Math.floor(timeSpan / 86400);
    if (curDays > 0) {
        if (curDays >= 2) {
            return curDays + " days" + tailStr;
        } else {
            return Math.floor(timeSpan / 3600) + " hours" + tailStr;
        }
    }

    var curHours = Math.floor(timeSpan / 3600);
    if (curHours > 0) {
        if (curHours >= 2) {
            return curHours + " hours" + tailStr;
        } else {
            return Math.floor(timeSpan / 60) + " minutes" + tailStr;
        }
    }

    var curMinutes = Math.floor(timeSpan / 60);
    if (curMinutes >= 2) {
        return curMinutes + " minutes" + tailStr;
    }

    if (timeSpan <= 1) {
        return "just now";
    } else {
        return timeSpan + " seconds" + tailStr;
    }

}


function UpdateBlahCommentDiv() {
    var curComment;
    var commentDiv = document.getElementById("BlahCommentTable");
    for (i in CurrentComments) {
        curComment = CurrentComments[i];
        var commentEl = createCommentElement(curComment);
        commentDiv.appendChild(commentEl);
    }
}



function FocusBlah(who) {
    StopAnimation();
    $("#LightBox").show();
    FocusedBlah = who.blah;
    PopulateBlahPreview(who.blah);
    var winHeight =   $(window).height();
    $("#BlahPreviewScrollContainer").css({ 'max-height': winHeight-290 + 'px'});
    $(BlahPreviewItem).fadeIn("fast");
    BlahPreviewTimeout = setTimeout(TimeOutBlahFocus, 5000);

}

function PopulateBlahPreview(whichBlah) {
    $("#BlahPreviewExtra").empty();
    var headlineText = document.getElementById("BlahPreviewHeadline");
    headlineText.innerHTML = unescape(whichBlah.text);

    // get the entire blah to update the rest...
    Blahgua.GetBlah(whichBlah.blahId, UpdateBodyText, OnFailure);
}

function UpdateBodyText(theFullBlah) {
    CurrentBlah = theFullBlah;
    var headlineText = document.getElementById("BlahPreviewHeadline");
    var nickNameStr =  getSafeProperty(theFullBlah, "nickname", "a blahger");
    var blahTypeStr =  GetBlahTypeStr();
    var isOwnBlah;

    if (IsUserLoggedIn) {
        isOwnBlah = (CurrentBlah.authorId == CurrentUser._id);
    } else {
        isOwnBlah = false;
    }

    if (isOwnBlah) {
        nickNameStr += " (you)";
    }
    // update the comment count while we are here
    document.getElementById("previewComments").innerHTML =getSafeProperty(theFullBlah, "c", 0);
    document.getElementById("PreviewViewerCount").innerHTML = getSafeProperty(theFullBlah, "views", 0);
    document.getElementById("PreviewBlahNickname").innerHTML = nickNameStr + " " + blahTypeStr;



    // reformat the promote area if the user has already voted
    if (IsUserLoggedIn) {

        $("#PreviewRowVote").show();
        $("#PreviewRowSignIn").hide();
        document.getElementById("PreviewViewerCount").innerHTML = getSafeProperty(theFullBlah, "o", 0);

        if (isOwnBlah) {
            var upVotes = getSafeProperty(CurrentBlah, "vu", 0);
            var downVotes = getSafeProperty(CurrentBlah, "vd", 0);

            $("#PreviewDemoteBlah").show();
            $("#PreviewUserPromoteSpan").text(upVotes + " promotes");
            $("#PreviewPromoteBlah").show();
            $("#PreviewUserDemoteSpan").text(downVotes + " demotes");
        } else {
            var userVote = getSafeProperty(theFullBlah, "uv", 0);
            if (userVote && (userVote != 0)) {
                if (userVote == 1) {
                    $("#PreviewDemoteBlah").hide()
                    $("#PreviewPromoteBlah").show();
                    $("#PreviewUserPromoteSpan").text("promoted by you!");
                    $("#PreviewUserDemoteSpan").text("");
                }  else {
                    $("#PreviewPromoteBlah").hide();
                    $("#PreviewDemoteBlah").show();
                    $("#PreviewUserDemoteSpan").text("demoted by you!");
                    $("#PreviewUserPromoteSpan").text("");
                }
            } else {
                $("#PreviewDemoteBlah").show();
                $("#PreviewUserPromoteSpan").text("promote");
                $("#PreviewPromoteBlah").show();
                $("#PreviewUserDemoteSpan").text("demote");
            }
        }
        // add a view
        Blahgua.AddBlahViewsOpens(theFullBlah._id, 1, 0, null, OnFailure);
    } else {
        $("#PreviewRowVote").hide();
        $("#PreviewRowSignIn").show();
    }


    // image
    var image = GetBlahImage(CurrentBlah, "B");
    var imageEl = document.getElementById("blahPreviewImage");
    if (image == "") {
        imageEl.style.display = "none";
        headlineText.style.fontSize = "36px";
    } else {
        imageEl.style.display = "block";
        imageEl.src = image;
        headlineText.style.fontSize = "24px";
    }
     var windowWidth = $(window).width();
    if (windowWidth > windowline2) {
       $(blahPreviewImage).css({ 'left': 120 + 'px'});
    } 

    if (windowWidth <= windowline1)
    {
        $(blahPreviewImage).css({ 'left': 60 + 'px'});
    
    }
    
        if ((windowWidth <= windowline2)&&(windowWidth >= windowline1))
    {
    	 $(blahPreviewImage).css({ 'left': 90 + 'px'});
    }
    var bodyTextDiv = document.getElementById("BlahPreviewBody");
    if (theFullBlah.hasOwnProperty("b")) {
        var bodyText = theFullBlah.b;
        if (bodyText && (bodyText != "")) {
            bodyText = URLifyText(unescape(bodyText)).replace(/\n/g, "<br/>");
        }
        bodyTextDiv.innerHTML = bodyText;
    } else {
        bodyTextDiv.innerHTML = "";
    }

    // check if it is a special type
    switch (GetBlahTypeStr()) {
        case "predicts":
            $("#BlahPreviewExtra").load(fragmentURL + "/pages/BlahTypePredictPreview.html #BlahTypePredictPreview",
                function() { UpdatePredictPreviewPage(); })
            break;
        case "polls":
            $("#BlahPreviewExtra").load(fragmentURL + "/pages/BlahTypeAskPreview.html #BlahTypeAskPreview",
                function() { UpdateAskPreviewPage(); })
            break;
        default:

    }


}


function UpdateAskPreviewPage() {
    // for now just use the full blah routine...
    UpdateAskPage("PollAnswersAreaPreview");
}

function UpdatePredictPreviewPage() {
    // update the prediction divs
    var expDateVal = getSafeProperty(CurrentBlah, "e", Date.now());
    var expDate = new Date(expDateVal);
    var elapStr = ElapsedTimeString(expDate);
    var isPast = (expDate < new Date(Date.now()));

    if (isPast) {
        $("#previewElapsedTimeText").text("should have happened ");
        $("#previewPredictVotePrompt").text("Did it happen?");
        $("#PreviewPredictVoteTable").hide();
        $("#PreviewExpPredictVoteTable").show();
    }  else {
        $("#previewElapsedTimeText").text("happening within ");
        $("#previewPredictVotePrompt").text("Do you agree?");
        $("#PreviewPredictVoteTable").show();
        $("#PreviewExpPredictVoteTable").hide();
    }

    $("#elapsedTimePreview").text(elapStr);
    $("#predictionDatePreview").text(expDate.toLocaleDateString());

    // update the bars
    var yesVotes = getSafeProperty(CurrentBlah, "p4", 0);
    var noVotes = getSafeProperty(CurrentBlah, "p5", 0);
    var maybeVotes = getSafeProperty(CurrentBlah, "p6", 0);
    var totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
    var yesRatio = 0;
    var noRatio = 0;
    var maybeRatio = 0;

    if (totalVotes > 0) {
         yesRatio = Math.floor((yesVotes / totalVotes) * 100);
         noRatio = Math.floor((noVotes / totalVotes) * 100);
         maybeRatio = Math.floor((maybeVotes / totalVotes) * 100);
    }
    $("#PredictPreviewYesSpan").animate({'width': yesRatio + "%"}, 1000);
    document.getElementById("PredictPreviewYesSpan").style.width = yesRatio + "%";
    document.getElementById("PredictPreviewNoSpan").style.width = noRatio + "%";
    document.getElementById("PredictPreviewMaybeSpan").style.width = maybeRatio + "%";

    // expired ui
    yesVotes = getSafeProperty(CurrentBlah, "p1", 0);
    noVotes = getSafeProperty(CurrentBlah, "p2", 0);
    maybeVotes = getSafeProperty(CurrentBlah, "p3", 0);
    totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
    yesRatio = 0;
    noRatio = 0;
    maybeRatio = 0;

    if (totalVotes > 0) {
        yesRatio = Math.floor((yesVotes / totalVotes) * 100);
        noRatio = Math.floor((noVotes / totalVotes) * 100);
        maybeRatio = Math.floor((maybeVotes / totalVotes) * 100);
    }
    document.getElementById("ExpPredictPreviewYesSpan").style.width = yesRatio + "%";
    document.getElementById("ExpPredictPreviewNoSpan").style.width = noRatio + "%";
    document.getElementById("ExpPredictPreviewMaybeSpan").style.width = maybeRatio + "%";


    if (IsUserLoggedIn) {
        // update the user's vote
        Blahgua.GetUserPredictionVote(CurrentBlah._id,
        function(json) {
            // update the vote
           var userVote = getSafeProperty(json, "x", null);
            var expVote = getSafeProperty(json, "y", null);
            if (userVote) {
                switch (userVote) {
                    case "y":
                        document.getElementById("PredictPreviewYesImg").src = "http://blahgua-webapp.s3.amazonaws.com/img/checked.png";
                        $("#PredictPreviewYesImg").show();
                        $("#PredictPreviewNoImg").hide();
                        $("#PredictPreviewMaybeImg").hide();
                        break;
                    case "n":
                        document.getElementById("PredictPreviewNoImg").src = "http://blahgua-webapp.s3.amazonaws.com/img/checked.png";
                        $("#PredictPreviewNoImg").show();
                        $("#PredictPreviewYesImg").hide();
                        $("#PredictPreviewMaybeImg").hide();
                        break;
                    case "u":
                        document.getElementById("PredictPreviewMaybeImg").src = "http://blahgua-webapp.s3.amazonaws.com/img/checked.png";
                        $("#PredictPreviewMaybeImg").show();
                        $("#PredictPreviewNoImg").hide();
                        $("#PredictPreviewYesImg").hide();
                        break;
                }
            } else {
                // no vote yey
                $("#PredictPreviewYesImg").show();
                $("#PredictPreviewNoImg").show();
                $("#PredictPreviewMaybeImg").show();
            }

            if (expVote) {
                switch (expVote) {
                    case "y":
                        document.getElementById("ExpPredictPreviewYesImg").src = "http://blahgua-webapp.s3.amazonaws.com/img/checked.png";
                        $("#ExpPredictPreviewYesImg").show();
                        $("#ExpPredictPreviewNoImg").hide();
                        $("#ExpPredictPreviewMaybeImg").hide();
                        break;
                    case "n":
                        document.getElementById("ExpPredictPreviewNoImg").src = "http://blahgua-webapp.s3.amazonaws.com/img/checked.png";
                        $("#ExpPredictPreviewNoImg").show();
                        $("#ExpPredictPreviewYesImg").hide();
                        $("#ExpPredictPreviewMaybeImg").hide();
                        break;
                    case "u":
                        document.getElementById("ExpPredictPreviewMaybeImg").src = "http://blahgua-webapp.s3.amazonaws.com/img/checked.png";
                        $("#ExpPredictPreviewMaybeImg").show();
                        $("#ExpPredictPreviewNoImg").hide();
                        $("#ExpPredictPreviewYesImg").hide();
                        break;
                }
            } else {
                // no vote yey
                $("#ExpPredictPreviewYesImg").show();
                $("#ExpPredictPreviewNoImg").show();
                $("#ExpPredictPreviewMaybeImg").show();
            }
        }, function(theErr) {
                $("#PredictPreviewYesImg").show();
                $("#PredictPreviewNoImg").show();
                $("#PredictPreviewMaybeImg").show();
                $("#ExpPredictPreviewYesImg").show();
                $("#ExpPredictPreviewNoImg").show();
                $("#ExpPredictPreviewMaybeImg").show()
            });
    }

}

function TimeOutBlahFocus() {
    /*
    if (BlahPreviewTimeout != null) {
        clearTimeout(BlahPreviewTimeout);
        BlahPreviewTimeout = null;
    }
    FocusedBlah = null;
    CurrentBlah = null;
    $("#BlahPreviewItem").fadeOut();
    $("#LightBox").fadeOut();
    StartAnimation();
    */
}

function UnfocusBlah(animate) {
    DismissPreview();
    StartAnimation();
}

function DismissPreview() {
    if (BlahPreviewTimeout != null) {
        clearTimeout(BlahPreviewTimeout);
        BlahPreviewTimeout = null;
    }
    FocusedBlah = null;
    CurrentBlah = null;
    $("#BlahPreviewItem").hide();
    document.getElementById("blahPreviewImage").style.display = "none";
    $("#BlahPreviewExtra").empty();
    $("#LightBox").hide();
}



// ********************************************************
// Create blah HTML



function CreateBaseDiv(theBlah) {
    var newDiv = document.createElement("div");
    newDiv.blah = theBlah;
    newDiv.className = "BlahDiv";
    newDiv.style.top = "0px";
    newDiv.style.position = "absolute";
    newDiv.onclick = DoBlahClick;
    newDiv.ondblclick = DoBlahDoubleClick;
    newDiv.topBlah = [];
    newDiv.bottomBlah = [];

    var textDiv = document.createElement("div");
    textDiv.className = "BlahTextDiv";
    newDiv.appendChild(textDiv);
    newDiv.blahTextDiv = textDiv;
    newDiv.blahTextDiv.innerHTML = unescape(theBlah.text);
    switch (theBlah.displaySize) {
        case 1:
            blahImageSize = "C";
            break;
        case 2:
            blahImageSize = "B";
            break;
        default:
            blahImageSize = "A";
            break;
    }

    var imagePath = GetBlahImage(theBlah, blahImageSize);
    if (imagePath != "") {
        newDiv.style.backgroundImage = "url('" + imagePath + "')";
        var r = (Math.round(Math.random() * 127) + 127);
        var g = (Math.round(Math.random() * 127) + 127);
        var b = (Math.round(Math.random() * 127) + 127);
        var colorStr = "rgba(" + r + "," + g + "," + b + ", .8)";
        if (theBlah.displaySize != 3) {
            $(textDiv).addClass("BlahAltTextDiv");
            textDiv.style.backgroundColor = colorStr;
        }
        else {
            textDiv.style.backgroundColor = pastelColors();
            $(textDiv).addClass("BlahExpandTextDiv");
            // start with no text
            $(textDiv).fadeOut(1000);

        }
    }


    
    return newDiv;

}



function pastelColors() {
    var r = (Math.round(Math.random() * 127) + 127).toString(16);
    var g = (Math.round(Math.random() * 127) + 127).toString(16);
    var b = (Math.round(Math.random() * 127) + 127).toString(16);
    return '#' + r + g + b;
}

function darkColors() {
    var r = (Math.round(Math.random() * 32) + 16).toString(16);
    var g = (Math.round(Math.random() * 32) + 16).toString(16);
    var b = (Math.round(Math.random() * 32) + 16).toString(16);
    return '#' + r + g + b;
}

function GetBlahImage(theBlah, size) {
    var imagePathName = "";
    if (theBlah.hasOwnProperty("img")) {
        // fetch the correct image size
        var hostName = "blahguaimages.s3-website-us-west-2.amazonaws.com/image/";
        var imageName = theBlah.img[0];
        imagePathName = "http://" + hostName + imageName + "-" + size + ".jpg";
    }


    return imagePathName;

}

function CreateElementForBlah(theBlah) {
    var newEl = CreateBaseDiv(theBlah);
    var paddingOffset = 8 * 2;

    if (theBlah.displaySize == 1) {
        newEl.style.width = LargeTileWidth - paddingOffset + "px";
        newEl.style.height = LargeTileHeight - paddingOffset + "px";
        $(newEl).addClass('LargeBlahFormat');

    } else if (theBlah.displaySize == 2) {
        newEl.style.width = MediumTileWidth - paddingOffset + "px";
        newEl.style.height = MediumTileHeight - paddingOffset + "px";
        $(newEl).addClass('MediumBlahFormat');
    } else {
        newEl.style.width = SmallTileWidth - paddingOffset + "px";
        newEl.style.height = SmallTileHeight - paddingOffset + "px";
        $(newEl).addClass('SmallBlahFormat');
    }

    newEl.style.backgroundColor = pastelColors();
    newEl.style.color = darkColors();

    return newEl;
}

function DrawInitialBlahs() {
    if (ActiveBlahList.length > 0) {
        var curRow = BuildNextRow();
        $("#BlahContainer").append(curRow);
        ResizeRowText(curRow);
        TopRow = curRow;
        var curTop = curRow.rowHeight;
        var bottom = $("#BlahContainer").height();
        var lastRow = curRow;
        RowsOnScreen = 1;

        while (curTop <= bottom) {
            curRow = BuildNextRow();
            curRow.style.top = curTop + "px";
            $("#BlahContainer").append(curRow);
            ResizeRowText(curRow);
            curTop += curRow.rowHeight;
            lastRow.rowBelow = curRow;
            curRow.rowAbove = lastRow;
            BottomRow = curRow;
            lastRow = curRow;
            RowsOnScreen++;
        }

        FadeRandomElement();
    }
    else {
        var newDiv = document.createElement("div");
        var newHTML = "The " + CurrentChannel.displayName + " channel currently has no blahs in it. ";

        if (IsUserLoggedIn) {
            newHTML += "Click below to add the first!<br/>" +
                       "<a onclick='DoCreateBlah(); return false;'>Add a blah</a>";
        } else {
            newHTML += "Click below to sign in. Then you can make the first!<br/>";
            newHTML += "<a onclick='InstallUserChannel(); return false;'>Sign in</a>";
        }

        newDiv.innerHTML = newHTML;
        newDiv.className = "no-blahs-in-channel-warning";
        $("#BlahContainer").append(newDiv);
    }
}

function DoAddBlahRow() {

    var nextRow = BuildNextRow();
    nextRow.rowAbove = BottomRow;
    BottomRow.rowBelow = nextRow;
    BottomRow = nextRow;
    nextRow.style.top = ($("#BlahContainer").height() + $("#BlahContainer").scrollTop()) + "px";
    $("#BlahContainer").append(nextRow);
    ResizeRowText(nextRow);
    RowsOnScreen++;
    // to do - add blah specific animation
    StartBlahsMoving();

}

function ResizeRowText(newRow) {
    var curTile;
    var tileHeight;
    var textHeight;
    var fontSize;
    var maxFontSize = 128;
    var scaleText = false;

    for (i = 0; i < newRow.childNodes.length; i++) {
        fontSize = 9;
        curTile = newRow.childNodes[i];
        height = curTile.offsetHeight - 8; // allow for padding...
        scaleText = (curTile.style.backgroundImage != "") && (curTile.blah.displaySize != 3);
        if (scaleText) {
            height /= 2;
        }
        textHeight = curTile.blahTextDiv.offsetHeight;
        while ((textHeight < height) && (fontSize < maxFontSize)) {
            fontSize++;
            curTile.blahTextDiv.style.fontSize = fontSize + "px";
            textHeight = curTile.blahTextDiv.offsetHeight;
        }
        fontSize--;
        curTile.blahTextDiv.style.fontSize = fontSize + "px";
        if (scaleText) {
            curTile.blahTextDiv.style.marginTop = (height - 8) + "px";
        }
    }
}


// ********************************************************
// Handle the blah scroll


function StartBlahsMoving() {
    if (BlahsMovingTimer == null) {
        BlahsMovingTimer = setTimeout(MakeBlahsMove, 50);
    }
}

function MakeBlahsMove() {
    var curScroll = $("#BlahContainer").scrollTop();
    $("#BlahContainer").scrollTop(curScroll + CurrentScrollSpeed);
    var newScroll = $("#BlahContainer").scrollTop();
    if (newScroll != curScroll) {
        // we scrolled a pixel or so
        if (TopRow.getBoundingClientRect().bottom < 0) {
            TopRow = TopRow.rowBelow;
            RowsOnScreen--;

        }
        BlahsMovingTimer = setTimeout(MakeBlahsMove, 25);
    } else {
        BlahsMovingTimer = null;
        DoAddBlahRow();
    }
    if (CurrentScrollSpeed < 1) {
        // scrolling backwards, slow down
        CurrentScrollSpeed *= .95;
        if (CurrentScrollSpeed > -1) {
            CurrentScrollSpeed = 1;
        }
        // see if a new top row is on the screen...
        if ((TopRow != null) && TopRow.hasOwnProperty("rowAbove") && (TopRow.rowAbove.getBoundingClientRect().bottom > 0)) {
            TopRow = TopRow.rowAbove;
            RowsOnScreen++;
        }
    }
    else if (CurrentScrollSpeed > 1) {
        // skipping ahead - slow down
        CurrentScrollSpeed *= 0.95;
        if (CurrentScrollSpeed < 1) {
            CurrentScrollSpeed = 1;
        }
    }
}


// ********************************************************
// Manage the active blah list

function PeekNextBlah() {
    return ActiveBlahList[ActiveBlahList.length - 1];
}

function RefreshActiveBlahList() {
    // when the list is empty, we refill it. For now, we just use the same list
    $("#ChannelBanner").css("background-color", "white");
    var nextBlahSet = [];

    if (NextBlahList.length > 0) {
        nextBlahSet = nextBlahSet.concat(NextBlahList);
    } else {
        nextBlahSet = nextBlahSet.concat(BlahList);
    }


    fisherYates(nextBlahSet);

    ActiveBlahList = ActiveBlahList.concat(nextBlahSet);
    GetNextBlahList();

}

function GetNextBlah() {
    var nextBlah = ActiveBlahList.pop();
    if (ActiveBlahList.length == 0) {
        RefreshActiveBlahList();
    }

    return nextBlah;
}

function GetNextMatchingBlah(blahSize) {
    var curBlah;
    var nextBlah = null;

    for (curIndex in ActiveBlahList) {
        curBlah = ActiveBlahList[curIndex];
        if (curBlah.displaySize == blahSize) {
            nextBlah = curBlah;
            ActiveBlahList.splice(curIndex, 1);
            if (ActiveBlahList.length == 0) {
                RefreshActiveBlahList();
            }
            break;
        }
    }

    if (nextBlah == null) {
        RefreshActiveBlahList();
        nextBlah = GetNextMatchingBlah(blahSize);
    }

    return nextBlah;
}


// ********************************************************
// Creating the next row of content and adding it

function BuildNextRow(rowHint) {
    var nextBlah = GetNextBlah();

    var size = nextBlah.displaySize;
    var newRowEl = document.createElement("div");
    newRowEl.style.position = "absolute";
    newRowEl.style.left = "0px";
    newRowEl.rowAbove = null;
    newRowEl.rowBelow = null;

    if (size == 1) {
        // only one choice
        newRowEl.rowHeight = LargeTileHeight;
        CreateLRow(nextBlah, newRowEl);
    }
    else if (size == 2) {
        newRowEl.rowHeight = MediumTileHeight;

        // four choices
        var which = Math.floor(Math.random() * 4);
        if (which == 0) {
            CreateMMRow(nextBlah, newRowEl);
        } else if (which == 1) {
            CreateMSSRow(nextBlah, newRowEl);
        } else if (which == 2) {
            CreateSMSRow(nextBlah, newRowEl);
        } else if (which == 3) {
            CreateSSMRow(nextBlah, newRowEl);
        }
    }
    else if (size == 3) {
        newRowEl.rowHeight = SmallTileHeight;
        // only one choice
        CreateSSSSRow(nextBlah, newRowEl);
    }

    return newRowEl;

}


function CreateLRow(theBlah, newRowEl) {
    var newBlahEl = CreateElementForBlah(theBlah);
    newRowEl.appendChild(newBlahEl);
}

function CreateMMRow(theBlah, newRowEl) {
    var newBlahEl = CreateElementForBlah(theBlah);
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(2);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = MediumTileWidth + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateSSSSRow(theBlah, newRowEl) {
    var newBlahEl = CreateElementForBlah(theBlah);
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = SmallTileWidth + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = SmallTileWidth * 2 + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = SmallTileWidth * 3 + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateMSSRow(theBlah, newRowEl) {
    var newBlahEl = CreateElementForBlah(theBlah);
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = MediumTileWidth + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = MediumTileWidth + "px";
    newBlahEl.style.top = SmallTileHeight + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = (MediumTileWidth + SmallTileWidth) + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = (MediumTileWidth + SmallTileWidth) + "px";
    newBlahEl.style.top = SmallTileHeight + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateSMSRow(theBlah, newRowEl) {
    var newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = SmallTileWidth + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.top = SmallTileHeight + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = (MediumTileWidth + SmallTileWidth) + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = (MediumTileWidth + SmallTileWidth) + "px";
    newBlahEl.style.top = SmallTileHeight + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateSSMRow(theBlah, newRowEl) {
    var newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = MediumTileWidth + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.top = SmallTileHeight + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = SmallTileWidth + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = SmallTileWidth + "px";
    newBlahEl.style.top = SmallTileHeight + "px";
    newRowEl.appendChild(newBlahEl);
}

// ********************************************************
// Getting the current inbox for the current user

function GetUserBlahs() {
    $("#BlahContainer").empty();
    Blahgua.GetNextBlahs(OnGetBlahsOK, OnFailure);

}

function OnGetBlahsOK(theResult) {
    BlahList = theResult;
    NextBlahList = [];
    PrepareBlahList(BlahList);
    ActiveBlahList = [];
    RefreshActiveBlahList();
    DrawInitialBlahs();
    if (BlahList.length > 0)
    {
        StartAnimation();
    }
    GetNextBlahList();
};


function NormalizeStrengths(theBlahList) {
    // makes sure that the blahs here range in strength from 0.0 to 1.0
    var minStr = 1;
    var maxStr = 0;
    var currentBlah;

    for (currentBlahIndex in theBlahList) {
        currentBlah = theBlahList[currentBlahIndex];
        if (currentBlah.s < minStr) {
            minStr = currentBlah.s;
        }
        if (currentBlah.s > maxStr) {
            maxStr = currentBlah.s;
        }
    }
    
    var offset = minStr;
    var range = maxStr - minStr;
    var scale = 1 / range;


    for (currentBlahIndex in theBlahList) {
        currentBlah = theBlahList[currentBlahIndex];
        currentBlah.s = (currentBlah.s - offset) * scale;
    }

    // ensure 100 blahs
    if (theBlahList.length < 100) {
        var curLoc = 0;
        while (theBlahList.length < 100) {
            theBlahList.push(theBlahList[curLoc++]);
        }
    }
}

function AssignSizes(theBlahList) {
    // makes sure that there are a good ration of large, medium, small
    var numLarge = 10;
    var numMedium = 50;
    // the rest are small - presumably 40, since we get 100 blahs
 
    // first, sort the blahs by their size
    theBlahList.sort(function (a, b) {
        return b.s - a.s;
    });

    var i = 0;
    while (i < numLarge) {
        theBlahList[i++].displaySize = 1;
    }

    MaxMedium = theBlahList[i].s;

    while (i < (numMedium + numLarge)) {
        theBlahList[i++].displaySize = 2;
    }

    MaxSmall = theBlahList[i].s;

    while (i < theBlahList.length) {
        theBlahList[i++].displaySize = 3;
    }

}

function PrepareBlahList(theBlahList) {
    if (theBlahList.length > 0) {
        NormalizeStrengths(theBlahList);
        AssignSizes(theBlahList);
    }

}

function fisherYates(myArray) {
    var i = myArray.length;
    if (i == 0) return false;
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempi = myArray[i];
        var tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
    }
}

// ********************************************************
/// some photo handling stuff

function beforeSendHandler(theArg) {

}

function completeHandler(theArg) {
    var newFile = theArg.childNodes[0].textContent;
    var bgImage = "none";
    if (newFile != "") {
        bgImage = "url('" + newFile + "')";
    }
    document.getElementById("BlahContainer").style.backgroundImage = bgImage;
    $('progress').hide();
}

function errorHandler(theArg) {
    $("#DivToShowHide").html(theArg);
    $('progress').hide();
}

function progressHandlingFunction(e) {
    if (e.lengthComputable) {
        $('progress').attr({ value: e.loaded, max: e.total });
    }
}

$(':file').change(function () {
    var file = this.files[0];
    name = file.name;
    size = file.size;
    type = file.type;
    //your validation
});


function PostMe(what) {
    $('progress').show();
    var formData = new FormData($('form')[0]);
    $.ajax({
        url: 'BlahguaService.asmx/UploadFile', //server script to process data
        //url: 'http://ec2-50-112-195-162.us-west-2.compute.amazonaws.com:50192/api/v2/images/upload',
        type: 'POST',
        //crossDomain: true,
        xhr: function () { // custom xhr
            myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) { // check if upload property exists
                myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
            }
            return myXhr;
        },
        //Ajax events
        beforeSend: beforeSendHandler,
        success: completeHandler,
        error: errorHandler,
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    });
}


// Create comment HTML

function createCommentElement(theComment) {
    var newEl = document.createElement("tr");
    newEl.className = "comment";

    var newHTML = "";
    // button for making complaints about the comment, banning user, etc.
    newHTML += '<td>';
    newHTML += '<button class="flipdown-btn" role="button" onclick=";return false;" type="button">';
    newHTML += '<span class="flipdown-btn-icon-wrapper"><img class="yt-uix-button-icon yt-uix-button-icon-comment-close" alt="" src="http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif">';
    newHTML += '</span><img class="yt-uix-button-arrow" alt="" src="http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif"><div class=" yt-uix-button-menu yt-uix-button-menu-link" style="display: none;"><ul><li class="comment-action-remove comment-action" data-action="remove"><span class="yt-uix-button-menu-item">Remove</span></li><li class="comment-action" data-action="flag-profile-pic"><span class="yt-uix-button-menu-item">Report profile image</span></li><li class="comment-action" data-action="flag"><span class="yt-uix-button-menu-item">Flag for spam</span></li><li class="comment-action-block comment-action" data-action="block"><span class="yt-uix-button-menu-item">Block User</span></li><li class="comment-action-unblock comment-action" data-action="unblock"><span class="yt-uix-button-menu-item">Unblock User</span></li></ul></div></button>';
    // user image
    newHTML += '<a class="user-image" href="/user/username">';
    newHTML += '<span class="user-image-thumbnail">';
    newHTML += '<img width="48" alt="Username" src="' + fragmentURL + '/images/unknown-user.png">';
    newHTML += '</span></a>';

    // content
    newHTML += '<div class="comment-content">';
    // meta-data
    newHTML += '<p class="comment-metadata">';
    newHTML += '<span class="CommentAuthor">';
    newHTML += '<a class="hyperlink-user-name " dir="ltr" href="/user/BolasDaGrk"">A blahger</a>';
    newHTML += '</span>';
    newHTML += '<span class="CommentDate" dir="ltr">';
    newHTML += '<a dir="ltr" href="/clickondate">';
    newHTML += ElapsedTimeString(new Date(theComment.created));
    newHTML += '</a></span></p>';

    // comment text
    newHTML += '<div class="CommentText" dir="ltr">';
    newHTML += '<p>' + URLifyText(unescape(theComment.text)).replace(/\n/g, "<br/>"); + '</p>';
    newHTML += '</div>';

    // comment actions
    newHTML += '<div class="comment-actions">';
    // inspect (drill down)
    newHTML += ' <a class="inspect-btn" onclick=";return false;">Inspect </a>';
    newHTML += ' <span class="separator">·</span>';

    // vote up
    newHTML += '<span class="clickcard">';
    newHTML += ' <button title="" class="start-comment-action" onclick=";return false;" type="button" >';
    newHTML += ' <span class="button-icon-wrapper">';
    newHTML += ' <img class="comment-vote" alt="" src="' + fragmentURL + '/img/black_thumbsUp.png">';
    newHTML += ' </span>';
    newHTML += '</button>';
    newHTML += '</span> ';

    // vote down
    newHTML += '<span class="clickcard">';
    newHTML += '<button title="" class="end comment-action" onclick=";return false;" type="button" >';
    newHTML += '<span class="button-icon-wrapper">';
    newHTML += '<img class="comment-vote" alt="" src="' + fragmentURL + '/img/black_thumbsDown.png">';
    newHTML += '</span>';
    newHTML += '</button>';
    newHTML += '</span>';
    newHTML += '</div>';

    newHTML += '</div>';
    newHTML += '</td>';


    newEl.innerHTML = newHTML;

    return newEl;
}


var URLRegEx = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;


function GetURLsFromString(theText) {
    return result = theText.match(URLRegEx);
}

function URLifyText(theText) {
    theText = theText.replace(/&quot;/gi, "\"");
    return theText.replace(URLRegEx, '<a href="$1" target="_blank">$1</a>');
}

function FakeURLifyText(theText) {
    theText = theText.replace(/&quot;/gi, "\"");
    return theText.replace(URLRegEx, '<span style="color:blue; text-decoration:underline">$1</span>');
}


// *****************************************
// Channels

function GoPrevChannel() {
    var curLoc;

    if (CurrentChannel == null) {
        curLoc = ChannelList.length - 1;
    } else {
        curLoc = ChannelList.indexOf(CurrentChannel);
        curLoc--;
        if (curLoc < 0) curLoc = ChannelList.length - 1;
    }


    SetCurrentChannel(curLoc);
}

function GoNextChannel() {
    var curLoc;

    if (CurrentChannel == null) {
        curLoc = 0;
    } else {
        curLoc = ChannelList.indexOf(CurrentChannel);
        curLoc++;
        if (curLoc >= ChannelList.length) {
            curLoc = 0;
        }
    }



    SetCurrentChannel(curLoc);
}

function GetChannelByName(theName, theList) {
    var theEl = null;
    for (curIndex in theList) {
        if (theList[curIndex].displayName.toLowerCase() == theName.toLowerCase()) {
            theEl = theList[curIndex];
            break;
        }
    }


    return theEl;
}

function GetUserChannels() {
    if (IsUserLoggedIn) {
        Blahgua.GetUserChannels(GetChannelsOK, OnFailure);
    } else {
        Blahgua.GetFeaturedChannels(function (channelList) {
                var sortList = [];
            var defChannel = getQueryVariable('channel');
            if (defChannel != null) {
                var theChannel = GetChannelByName(defChannel, channelList);
                if (theChannel != null)
                    sortList.push(theChannel);
            }
            sortList.push(GetChannelByName("The Now Network", channelList));
            sortList.push(GetChannelByName("Entertainment", channelList));
            sortList.push(GetChannelByName("Politics", channelList));
            sortList.push(GetChannelByName("Sports", channelList));
            sortList.push(GetChannelByName("Humor", channelList));

            GetChannelsOK(sortList);
        },
            OnFailure);
    }
}


function GetChannelsOK(theChannels) {
    ChannelList = theChannels;

    if (theChannels.length == 0) {
        AddDefaultChannelsToNewUser();
    } else  {
        // fetch URL parameter Channel
        var defChannel = getQueryVariable('channel');
        if (defChannel != null) {
            for (curIndex in ChannelList) {
                if (ChannelList[curIndex].displayName.toLowerCase() == defChannel.toLowerCase())
                {
                    PopulateChannelMenu();
                    SetCurrentChannel(curIndex);
                    return;
                    break;
                }
            }
            // user does not have this channel - add it!
            if (IsUserLoggedIn) {
                Blahgua.GetAllChannels(function (allChannels) {
                    for (curIndex in allChannels) {
                        if (allChannels[curIndex].displayName.toLowerCase() == defChannel.toLowerCase())
                        {
                            Blahgua.JoinUserToChannel(allChannels[curIndex]._id, function() {
                                ChannelList.splice(0,0,allChannels[curIndex]);
                                PopulateChannelMenu();
                                SetCurrentChannel(0);
                            }, OnFailure);
                            break;
                        }
                    }
                }, OnFailure);
            }  else {
                // for some reason the channel is not available..
                // TO DO:  show a warning
                PopulateChannelMenu();
                SetCurrentChannel(0);
            }
        } else {
            PopulateChannelMenu();
            SetCurrentChannel(0);
        }
    }
}

function PopulateChannelMenu( ) {
    var newHTML = "";

    $.each(ChannelList, function(index, element) {
        newHTML += createChannelHTML(index, element.displayName);
    });

    document.getElementById("ChannelList").innerHTML = newHTML;
    $("#ViewProfileBtn").text(getUserChannelName());


}

function getUserChannelName() {
    if (IsUserLoggedIn) {
        return "view your profile";
    } else {
        return "sign in to blahgua";
    }
}

function imgError(theImage) {
    theImage.onerror = "";
    theImage.src = fragmentURL + "/images/groups/default.png";
    return true;
}


function createChannelHTML(index, curChannel) {
    var newHTML = "";
    newHTML += "<li channelId='" + index + "' onclick='DoJumpToChannel(); return false;'><a>";

    newHTML += '<img class="channelimage" src="' + fragmentURL + '/images/groups/' + curChannel + '.png"';
    newHTML += 'onerror="imgError(this);">';

    newHTML += curChannel;
    if (IsUserLoggedIn) {
        newHTML += '<img class="removechannel" src="' + fragmentURL + '/img/delete.png" onclick="DoRemoveChannel(); event.stopPropagation();">';
    }
    newHTML += "</a>";
    newHTML += "</li>"
    return newHTML;
}

function DoRemoveChannel() {
    var who = event.target || event.srcElement;
    var what = who.parentElement.parentElement;

    var channelIndex = what.attributes["channelId"].nodeValue
    var channelId = ChannelList[channelIndex]._id;
    Blahgua.removeUserFromChannel(channelId, OnRemoveChannelOK(what), OnFailure);
}

function OnRemoveChannelOK(deadItem) {
    $(deadItem).remove();
}


function DoJumpToChannel() {
    var who = event.target || event.srcElement;
    var what = who.parentElement;

    var channelID = what.attributes["channelId"].nodeValue;
    HideChannelList();
    SetCurrentChannel(channelID);
}

function RefreshCurrentChannel() {
    $("#ChannelBanner").css("background-color", "#FFFFFF");
   GetUserBlahs();

}

function SetCurrentChannel(whichChannel) {
    $("#ChannelBanner").css("background-color", "#FFFFFF");
    StopAnimation();
    CurrentChannel = ChannelList[whichChannel];
    Blahgua.currentChannel = CurrentChannel._id;
    var labelDiv = document.getElementById("ChannelBannerLabel");
    labelDiv.innerHTML = CurrentChannel.displayName;
    GetUserBlahs();
    UpdateChannelViewers();
}

function GetNextBlahList() {
    Blahgua.GetNextBlahs(OnGetNextBlahsOK, OnFailure);
}

function OnGetNextBlahsOK(theResult) {
    NextBlahList = theResult;
    PrepareBlahList(NextBlahList);
    $("#ChannelBanner").animate({"background-color": "#FF00FF" }, 'slow');

}


// *****************************************
// User Channel

function InstallUserChannel() {
    // empty whatever is in there now
    StopAnimation();
    $("#BlahFullItem").empty();
    if (IsUserLoggedIn) {
        if (CurrentUser == null) {
            Blahgua.GetCurrentUser(function (theResult) {
                CurrentUser = theResult;
                PopulateUserChannel();
            }, OnFailure);
        }
        else {
            PopulateUserChannel();
        }
    } else {
        $("#BlahFullItem").load(fragmentURL + "/pages/SignUpPage.html #UserChannelDiv",
        function () {
            RefreshSignupContent();
        });
    }
}

function SuggestUserSignIn(message) {
    $("#BlahFullItem").load(fragmentURL + "/pages/SignUpPage.html #UserChannelDiv", function() {
        RefreshSignupContent(message);
    });


}


function PopulateUserChannel() {
    $("#BlahFullItem").load(fragmentURL + "/pages/SelfPage.html #UserChannelDiv", RefreshUserChannelContent);
 }

function RefreshUserChannelContent() {
    $("#BlahFullItem").show();
}

function RefreshSignupContent(message) {
    $("#BlahFullItem").show();
    if ((message != null) && (message != "")) {
        $("#SignInMessageDiv").text(message);
        $("#SignInMessageDiv").fadeIn();
    } else {
        $("#SignInMessageDiv").hide();
    }
}

function CreateNewUser() {
    var userName = $("#userName").val();
    var pwd = $("#pwd").val();
    Blahgua.CreateUser(userName, pwd, HandleCreateUserOK, HandleCreateUserFail);
}

function SignInExistingUser() {
    var userName = $("#userName2").val();
    var pwd = $("#pwd2").val();
    Blahgua.loginUser(userName, pwd, HandleUserLoginOK, HandleUserLoginFail);
}

function HandleCreateUserOK(json) {
    alert("user created ok! Now logging in...");

    var userName = $("#userName").val();
    var pwd = $("#pwd").val();
    if ($("#rememberme").val()) {
        $.cookie("userId", userName, { expires: 30, path: '/'});
        $.cookie("password", pwd, { expires: 30, path: '/'});
        $.removeCookie('isTemp');
    }
    $("#userName2").val(userName);
    $("#pwd2").val(pwd);
    Blahgua.loginUser(userName, pwd, HandleUserLoginOK, HandleUserLoginFail);
}

function HandleCreateUserFail(json) {
    alert("User creation failed!");
}


function HandleUserLoginOK(json) {
    IsUserLoggedIn = true;
    var userName = $("#userName2").val();
    var pwd = $("#pwd2").val();
    if ($("#rememberme2").val()) {
        $.cookie("userId", userName, { expires: 30, path: '/'});
        $.cookie("password", pwd, { expires: 30, path: '/'});
        $.removeCookie('isTemp');
    }
    Blahgua.getUserInfo(RefreshPageForNewUser);
}

function HandleUserLoginFail(json) {
    alert("Login Failed. Check username and password.");
}

function RefreshPageForNewUser(json) {
    // get the new channel list
    $("#BlahFullItem").hide();
    CurrentUser = json;
    GetUserChannels();
}

function ClosePage() {
    $("#BlahFullItem").hide();
    StartAnimation();
}


function UpdateChannelViewers() {
    if (ViewerUpdateTimer != null) {
        clearTimeout(ViewerUpdateTimer);
        ViewerUpdateTimer = null;
    }
    if (CurrentChannel == null) {
        Blahgua.GetViewersOfUser(OnChannelViewersOK, OnFailure);
    } else {
        Blahgua.GetViewersOfChannel(CurrentChannel._id, OnChannelViewersOK, OnFailure);
    }

    ViewerUpdateTimer = setTimeout(UpdateChannelViewers, 2000);
}

function getProp(obj, propName, defVal) {
    if (obj.hasOwnProperty(propName) && (obj[propName] != null)) {
        return obj[propName];
    } else {
        return defVal;
    }
}

function OnChannelViewersOK(numViewers) {
   $("#ChannelViewersCountText").html(getProp(numViewers, "v", 0));

}

function DoCreateBlah() {
    StopAnimation();
    if (IsUserLoggedIn) {
        $(BlahFullItem).load(fragmentURL + "/pages/CreateBlahPage.html", function() {
            PopulateBlahTypeOptions();
            var windowWidth = $(window).width();
            var delta = Math.round((windowWidth - 512) / 2);
            if (delta < 0) delta = 0;
            delta = delta + "px";

            $(".createblahscroll").css({'left': delta, 'right':delta});

            $(BlahFullItem).fadeIn("fast");
        });
    }   else {
        SuggestUserSignIn("you must sign in before you can create a new blah")
    }

 }

function UpdateBlahTypes() {
    Blahgua.GetBlahTypes(function (json) {
        BlahTypeList = json;
    });
}


function PopulateBlahTypeOptions() {
    var curOption;
    curHTML = "";
    for (curItem in BlahTypeList) {
        curHTML += '<OPTION  value="' + BlahTypeList[curItem]._id + '" >';
        curHTML += BlahTypeList[curItem].name;
        curHTML += '</OPTION>';
    }
    $("#BlahTypeList").html(curHTML);
}

function CancelCreate() {
   CloseBlah();
}




function CreateBlah() {
    var blahType = $("#BlahTypeList").val();
    var blahHeadline = $("#BlahHeadline").val();
    var blahBody = $("#BlahBody").val();
    var blahGroup = CurrentChannel._id;
    var options = null;

    // check for additional options
    var blahTypeStr = BlahTypeList[$("#BlahTypeList")[0].selectedIndex];
    switch (blahTypeStr.name) {
        case "polls":
            // add the poll items
            var pollItems = [];
            var curPollItem;
            var pollDivs = document.getElementsByName("PollItem");
            for (i = 0; i < pollDivs.length; i++) {
                curPollItem = new Object();
                curPollItem["g"] = pollDivs[i].childNodes[1].value;
                curPollItem["t"] = pollDivs[i].childNodes[3].value;
                pollItems.push(curPollItem);
            }
            options = new Object();
            options["pt"] = pollItems;
            break;
        case "predicts":
            // update the prediction on create
            options = new Object();
            var theDateStr = $("#PredictionEndDateInput").val();
            var theTimeStr = $("#PredictionEndTimeInput").val();
            var theDate = new Date(theDateStr + " " + theTimeStr);
            options["e"] = theDate;
            break;
        default:
            break;
    }

    Blahgua.CreateUserBlah(blahHeadline, blahType, blahGroup, blahBody, options, OnCreateBlahOK, OnFailure);
}





function OnCreateBlahOK(json) {
    CurrentBlah = json;
    // check for images
    if ($("#BlahImage").val() != "") {
        UploadBlahImage(CurrentBlah._id);
    } else {
        OpenBlah(CurrentBlah);
    }
}

function UploadBlahImage(blahId) {
    $("#ProgressDiv").show();
    $("#objectId").val(blahId);
     //document.getElementById("ImageForm").submit();

    var formData = new FormData($("#ImageForm")[0]);
    $.ajax({
        url: "http://beta.blahgua.com/v2/images/upload",

        type: 'POST',
        xhr: function() { // custom xhr
            myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){ // if upload property exists
                myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // progressbar
            }
            return myXhr;
        },
        //Ajax events
        success: completeHandler = function(data) {
            OnUploadImageOK(data);

        },
        error: errorHandler = function(theErr) {
            alert("Error uploading");
        },
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    }, 'json');
}

function progressHandlingFunction(evt) {
    var maxWidth = $("#ProgressBar").width();
    var curWidth = 100;
    var ratio = evt.loaded / evt.total;
    var newWidth = Math.floor(maxWidth * ratio);
    $("#Indicator").width(newWidth);
}

function OnUploadImageOK(result) {
    Blahgua.GetBlah(CurrentBlah._id, function(theBlah) {
        CurrentBlah = theBlah;
        OpenBlah(CurrentBlah);
    });
}

function UpdateBlahInfoArea() {
    var blahTypeStr = BlahTypeList[$("#BlahTypeList")[0].selectedIndex];
    switch (blahTypeStr.name) {
        case "predicts":
            $("#AdditionalInfoDiv").load(fragmentURL + "/pages/BlahTypePredictAuthorPage.html #BlahTypePredictAuthorPage",
                function() { UpdatePredictAuthorPage(); })
            break;
        case "polls":
            $("#AdditionalInfoDiv").load(fragmentURL + "/pages/BlahTypeAskAuthorPage.html #BlahTypeAskAuthorPage",
            function() { UpdateAskAuthorPage(); })
            break;
        default:
            $("#AdditionalInfoDiv").text("A normalish blah that needs no extra info");
    }
}

function UpdateAskAuthorPage() {
    var newItem = CreateAskAuthorItem();
    $("#PollAnswersArea").append(newItem);
}

function UpdatePredictAuthorPage() {
    // nothing for now...
}


function AddPollAnswer() {
    var newItem = CreateAskAuthorItem();
    $("#PollAnswersArea").append(newItem);
}

function CreateAskAuthorItem() {
    var newHTML = "";
    newHTML += '<div name="PollItem" width="350px">';
    newHTML += '<input name="PollChoice" type="text" style="width:390px;height:30px;background:lightgrey;border:none;border-radius:3px;position:relative;top:-5px;">';
    newHTML += '<button onclick="DoDeleteAskChoice(); return false;" style="position:relative;right:-5px;top:5px;width:40px;height:40px;background:#fff;border:none;font-size:30px;color:red;font-weight:bold">X</button>';
    newHTML += '<input name="PollDescription" type="text" style="width:440px;height:50px;background:lightgrey;border:none;border-radius:3px;position:relative;top:10px;">';
    newHTML += '<input name="PollDescription" type="text" style="width:440px;height:20px;background:#fff;border:none;border-radius:3px;position:relative;top:10px;">'
    newHTML += '</div>';

    return newHTML;
}

function DoDeleteAskChoice(theEvent) {
    var who = event.target || event.srcElement;
    var deadDiv = who.parentElement;
    $("#PollAnswersArea").removeChild(deadDiv);
}

function ForgetUser() {
    $.removeCookie("userId");
    $.removeCookie("password");
    Blahgua.logoutUser(OnLogoutOK);
}


function LogoutUser() {
    Blahgua.logoutUser(OnLogoutOK);

}

function OnLogoutOK(json) {
    alert("you have been logged out.");
    IsUserLoggedIn = false;
    CurrentUser = null;
    ClosePage();
    GetUserChannels();

}

function AddBadge() {
    alert("Adding a badge!");
}

// *****************************************
// Channel Browser

function DoBrowseChannels() {
    StopAnimation();
    HideChannelList();
    $(BlahFullItem).load(fragmentURL + "/pages/ChannelBrowser.html #ChannelBrowserDiv", function() {
        PopulateChannelBrowser();
        $(BlahFullItem).fadeIn("fast");
    });
}

function PopulateChannelBrowser() {
    Blahgua.GetChannelTypes(OnGetChannelTypesOK);
}

function OnGetChannelTypesOK(typeList) {
    var newHTML = "";
    $.each(typeList, function (index, element) {
        newHTML += GenerateHTMLForChannelType(element);
    });
    document.getElementById("ChannelTypeList").innerHTML = newHTML;


}

function GenerateHTMLForChannelType(channelType) {
    var newHTML= "";
    newHTML += '<li id="' + channelType._id + '" onclick="DoExpandItem();return false;">';
    newHTML += "<a class='channelBrowserGroupItem'>" + channelType.displayName + "</a>";
    newHTML += "</li>"
    return newHTML;
}

function GenerateHTMLForChannelBrowser(curChannel) {
    var newHTML = "";
    newHTML += "<li class='channelBrowserChannelItem'  channelId='" + curChannel._id + "' onclick='DoOpenChannelPage(); return false;'><a >";

    newHTML += '<img class="channelimage" src="' + fragmentURL + '/images/groups/' + curChannel.displayName + '.png"';
    newHTML += 'onerror="imgError(this);">';
    newHTML += curChannel.displayName;
    newHTML += "</a>";
    newHTML += "</li>"
    return newHTML;
}

function DoExpandItem() {
    var mainItem = event.srcElement.parentElement;
    var itemID = mainItem.id;

    var channelSubList = $(mainItem).find(".channelSubItems");

    if (channelSubList.length == 0) {
        // fetch a new channel list
        Blahgua.GetChannelsForType(itemID, GetSubChannelsOK);
    } else {
        channelSubList.toggle();
    }

}

function GetSubChannelsOK(newChannelList) {
    var newHTML = "";
    newHTML += '<ul class="channelSubItems">';
    if (newChannelList.length > 0) {
        $.each(newChannelList, function (index, element) {
            newHTML += GenerateHTMLForChannelBrowser(element);
        });
        document.getElementById(newChannelList[0].groupTypeId).innerHTML += newHTML;
    }   else {
         //to do - add some text about how there are no channels...
        var who = event | window.event;
        var what = who.target | who.srcElement;
    }

    newHTML += "</ul>";


}

function DoOpenChannelPage() {
    var who = event || window.event;
    var what = who.target || who.srcElement;

    while (what.attributes["channelid"] == null) {
        what = what.parentElement;
    }

    var itemID = what.attributes["channelid"].value;

    $(BlahFullItem).load(fragmentURL + "/pages/ChannelDetailPage.html #ChannelDetailPage", function() {
        PopulateChannelDetailPage(itemID);
    });
}

function   PopulateChannelDetailPage(channelId) {
    Blahgua.GetChannelInfo(channelId, function(theChannel) {
        $("#ChannelTitleDiv").text(theChannel.displayName);
        document.getElementById("ChannelDetailPage").attr["channelObj"] = theChannel;
    })


}

function DoChannelBrowserReturn() {
    $(BlahFullItem).load(fragmentURL + "/pages/ChannelBrowser.html #ChannelBrowserDiv", function() {
        PopulateChannelBrowser();
        $(BlahFullItem).fadeIn("fast");
    });
}

function IsUsersOwnBlah() {
    return (CurrentUser._id == CurrentBlah.authorId);
}


function DoPromotePreview() {
    if (!IsUsersOwnBlah()) {
        Blahgua.SetBlahVote(CurrentBlah._id, 1, function() {
            UnfocusBlah();
        }, function(theErr) {
            // to do - inspect the errror
            UnfocusBlah();
        });
    }
}

function DoDemotePreview() {
    if (!IsUsersOwnBlah()) {
        Blahgua.SetBlahVote(CurrentBlah._id, -1, function() {
            UnfocusBlah();
        }, function(theErr) {
            // to do - inspect the errror
            UnfocusBlah();
        });
    }

}

// Prediction Logic
 function SetPredictResponse(val) {
     if (IsUserLoggedIn) {
         if (IsUsersOwnBlah()) {
            alert("You can't vote on your own prediction");
         } else {
             // they can vote
             Blahgua.SetUserPredictionVote(CurrentBlah._id, val,
                 function(json) {
                     Blahgua.GetBlah(CurrentBlah._id,
                         function(theBlah) {
                             CurrentBlah = theBlah;
                             UpdatePredictPreviewPage();
                         });
                 },
             function (theErr) {
                 alert("It failed!");
                 OnFailure(theErr);
             });
         }

     }  else {
         // flash the vote prompt or something..
         alert("You must be logged in to pile on to a prediction");
     }
 }

function SetExpPredictResponse(val) {
    if (IsUserLoggedIn) {
        if (IsUsersOwnBlah()) {
            alert("You can't vote on your own prediction");
        } else {
            // they can vote
            Blahgua.SetUserExpiredPredictionVote(CurrentBlah._id, val,
                function(json) {
                    Blahgua.GetBlah(CurrentBlah._id,
                        function(theBlah) {
                            CurrentBlah = theBlah;
                            UpdatePredictPreviewPage();
                        });
                },
                function (theErr) {
                    alert("It failed!");
                    OnFailure(theErr);
                });
        }

    }  else {
        // flash the vote prompt or something..
        alert("You must be logged in to pile on to a prediction");
    }
}

function ta(obj){
	var val=$(obj).val().length;
	if(val>128){
		alert("You should keep it in 128 character");
		$(obj).val($(obj).val().substring(0,128))
		}
}

function ResizeTextarea1(){
  var t = document.getElementById('BlahHeadline');
  if (t.scrollTop == 0) t.scrollTop=1;
  while (t.scrollTop == 0){
   if (t.rows > minRows)
    t.rows--;
   else
    break;
   t.scrollTop = 1;
   if (t.rows < maxRows)
    t.style.overflowY = "hidden";
   if (t.scrollTop > 0){
    t.rows++;
    break;
   }
  }
  while(t.scrollTop > 0){
   if (t.rows < maxRows){
    t.rows++;
    if (t.scrollTop == 0) t.scrollTop=1;
   }
   else{
    t.style.overflowY = "hidden";
    break;
   }
  }
 }


 function ResizeTextarea(){

  var t = document.getElementById('BlahBody');
  if (t.scrollTop == 0) t.scrollTop=1;
  while (t.scrollTop == 0){
   if (t.rows > minRows1)
    t.rows--;
   else
    break;
   t.scrollTop = 1;
   if (t.rows < maxRows)
    t.style.overflowY = "hidden";
   if (t.scrollTop > 0){
    t.rows++;
    break;
   }
  }
  while(t.scrollTop > 0){
   if (t.rows < maxRows){
    t.rows++;
    if (t.scrollTop == 0) t.scrollTop=1;
   }
   else{
    t.style.overflowY = "hidden";
    break;
   }
  }
 }
 
 







