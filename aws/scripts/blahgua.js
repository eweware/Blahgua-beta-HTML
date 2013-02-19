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
var UserId = "507c81dae4b006df4807a6c3";
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



$(document).ready(function () {

    $("#BlahContainer").disableSelection();
    $("#BlahContainer").on('swipeleft', HandleSwipeLeft);
    $("#BlahContainer").on('swiperight', HandleSwipeRight);
    $("#BlahContainer").on('swipeup', HandleSwipeUp);
    $("#BlahContainer").on('swipedown', HandleSwipeDown);
    $("#LightBox").click(function () { UnfocusBlah(); });

    Blahgua.currentUser = UserId;
    CreateChannelBanner();
    CreatePreviewBlah();
    CreateFullBlah();
    ComputeSizes();
    GetUserChannels();

});




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
    alert("Error!");
}



// ********************************************************
// Alt fading


function AltFade(theElement) {
    FadeRandomElement();
}

var LastFadeElement;

function SelectRandomElement() {
    var theEl = null;
    var randRow;
    var pickedEl = LastFadeElement;
    var curRow, numChildren;
    var firstRow = TopRow;
    
    while (pickedEl == LastFadeElement) {
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
        if (pickedEl.style.backgroundImage == "") {
            pickedEl = LastFadeElement;
        }
    }
    
    return pickedEl;
}

function FadeRandomElement() {
    var theEl = SelectRandomElement();
    $(theEl.blahTextDiv).fadeToggle(1000, "swing", FadeRandomElement);
    LastFadeElement = theEl;
}







// ********************************************************
// Start-up code



function ComputeSizes() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
   
    var numCols = Math.floor(windowWidth / 400);
    var numRows = Math.ceil(windowHeight / 400);

    if (numCols < 1) numCols = 1;

    SmallTileWidth = Math.floor(windowWidth / (numCols * 4));
    MediumTileWidth = SmallTileWidth * 2;
    LargeTileWidth = MediumTileWidth * 2;

    SmallTileHeight = Math.floor(windowHeight / (numRows * 4));
    MediumTileHeight = SmallTileHeight * 2;
    LargeTileHeight = MediumTileHeight * 2;

    // now make the window the correct size
    var offset = Math.floor((windowWidth - LargeTileWidth) / 2);
    var blahContainer = document.getElementById("BlahContainer");
    blahContainer.style.left = offset + "px";
    blahContainer.style.width = LargeTileWidth + "px";

    $("#BlahContainer").css({ 'left': offset + 'px', 'width': LargeTileWidth + 'px' });
    $("#ChannelBanner").css({ 'left': offset + 'px', 'width': LargeTileWidth + 'px' });
    $("#BlahPreviewItem").css({ 'left': offset + 16 + 'px', 'width': LargeTileWidth - 32 + 'px', 'maxHeight': windowHeight-100+'px' });
    $("#BlahPreviewContent").css({ 'max-height': windowHeight-260 + 'px'});
    $("#BlahFullItem").css({ 'left': offset + 'px', 'width': LargeTileWidth + 'px' });
    $("#FullBlahContent").css({ 'max-height': windowHeight-260 + 'px'});

}


function CreateChannelBanner() {
    var banner = document.getElementById("ChannelBanner");
    var label = document.createElement("span");
    label.id = "ChannelBannerLabel";
    label.className = "ChannelNameText";
    label.innerHTML = "Blahgua";
    banner.appendChild(label);
    banner.channelLabel = label;
    

    var viewCount = document.createElement("span");
    viewCount.className = "ChannelViewersSpan";
    banner.appendChild(viewCount);
    banner.viewCount = viewCount;
    var eyeImage = document.createElement("img");
    eyeImage.src = "http://files.blahgua.com/webapp/img/black_eye.png";
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
    options.onclick = DoCreateBlah;
    options.className = "ChannelOptions";
    options.innerHTML = "+";
    banner.appendChild(options);
    banner.options = options;
}

function CreatePreviewBlah() {

    BlahPreviewItem = document.getElementById("BlahPreviewItem");
    var html = "";
    html += '<table width="100%" class="BlahPreviewTable">';
    html += '<tr class="BlahPreviewHeader"><td colspan="4"><span class="previewBlahgerName">A female blahger from Santa Monica, CA says:</span></td>';
    html += '<td align="right"><img width="24px" alt="viewers" src="http://files.blahgua.com/webapp/img/black_eye.png">';
    html += '<span class="PreviewViewerCount" id="PreviewViewerCount">24</span></td></tr>';
    html += '<tr><td colspan="5" class="BlahPreviewHeadline" id="BlahPreviewHeadline"></td></tr>';
    html += '<tr height="*"><td colspan="5" align="center">';
    html += '<div class="blah-preview-content" id="FullBlahContent">';
    html += '<table><tr><td align="center"><img alt="Blah Image" class="BlahPreviewImage" id="blahPreviewImage"></td></tr>';
    html += '<tr><td class="BlahPreviewBody" id="BlahPreviewBody"></td></tr>';
    html += '</table></div> </td></tr>';
    html += '<tr height="48px">';
    html += '<td width="20%"></td>';
    html += '<td width="20%" align="center">';
    html += '<img width="36px" alt="viewers" src="http://files.blahgua.com/webapp/img/black_thumbsUp.png"><br/>';
    html += '<span class="statsText" id="previewUpVote">21</span>';
    html += '</td>';
    html += '<td width="20%" align="center">';
    html += '<img width="36px" alt="viewers" src="http://files.blahgua.com/webapp/img/black_thumbsDown.png"><br/>';
    html += '<span class="statsText" id="previewDownVote">1,563</span>';
    html += '</td>';
    html += '<td width="20%" align="center">';
    html += '<img width="36px" alt="viewers" src="http://files.blahgua.com/webapp/img/black_comment.png"><br/>';
    html += '<span class="statsText" id="previewComments">65</span>';
    html += '</td>';
    html += '<td width="20%"></td></tr>';
    html += '</table>';
    BlahPreviewItem.innerHTML = html;
    BlahPreviewItem.headline = document.getElementById("BlahPreviewHeadline");
    BlahPreviewItem.onclick = function() {
        if (BlahPreviewTimeout != null) {
            clearTimeout(BlahPreviewTimeout);
            BlahPreviewTimeout = null;
        }
        OpenBlah(FocusedBlah);};

}


function CreateFullBlah() {
    BlahFullItem = document.getElementById("BlahFullItem");
}


function DoBlahDoubleClick(theEvent)   {
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
    CloseBlah();
}

function CloseBlah() {

    // hide the preview blah and reset the variables
    UnfocusBlah();
    $(BlahFullItem).fadeOut("fast", function() {$(BlahFullItem).empty()});

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

function OpenBlah(whichBlah) {
    StopAnimation();
    $(BlahFullItem).load("./aws/Pages/BlahDetailPage.html  #FullBlahDiv", function() {
        PopulateFullBlah(whichBlah);
        $(BlahFullItem).fadeIn("fast");
    });

}


function PopulateFullBlah(whichBlah) {

    var headlineText = document.getElementById("BlahFullHeadline");
    headlineText.innerHTML = unescape(whichBlah.text);


    var image = getBlahImage(whichBlah);
    var imageEl = document.getElementById("blahFullImage");
    if (image == "") {
        imageEl.style.display = "none";
        headlineText.style.fontSize = "36px";
    } else {
        imageEl.style.display = "block";
        imageEl.src = image;
        headlineText.style.fontSize = "24px";
    }

    // stats
    document.getElementById("fullBlahUpVote").innerHTML = whichBlah.u;
    document.getElementById("fullBlahDownVote").innerHTML = whichBlah.d;
    document.getElementById("fullBlahComments").innerHTML = "";
    document.getElementById("FullBlahViewerCount").innerHTML = whichBlah.o; // change to actual viewers

    // get the entire blah to update the rest...
    if (CurrentBlah == null) {
        Blahgua.GetBlah(whichBlah.blahId, UpdateFullBlahBody, OnFailure);
    } else {
        UpdateFullBlahBody(CurrentBlah);
    }
}

function UpdateFullBlahBody(newBlah) {
    CurrentBlah = newBlah;

    if (CurrentBlah.hasOwnProperty("c")) {
        document.getElementById("fullBlahComments").innerHTML = CurrentBlah.c;  // to do, change to 'c'
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

    // update the comments
    if (CurrentBlah.hasOwnProperty("c") && CurrentBlah.c > 0) {
        // blah has comments
        Blahgua.GetBlahComments(CurrentBlah._id, SortAndRedrawComments, OnFailure);
    } else {
        // no comments
        var commentDiv = document.getElementById("BlahCommentBody");
        var newHTML = "";
        newHTML += '<span class="NoCommentSpan">No Comments</span>';
        commentDiv.innerHTML = newHTML;
    }
}

function SortAndRedrawComments(theComments) {
    CurrentComments = theComments;
    SortComments();

    UpdateBlahComments();
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
        // to do:  need to fix for negative comments
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


function ElapsedTimeString(theDate) {
    var now = new Date();
    var timeSpan = Math.floor((now - theDate) / 1000);


    var curYears = Math.floor(timeSpan / 31536000);
    if (curYears > 0) {
        if (curYear > 2) {
            return curYear + " years ago";
        } else {
            return Math.floor(timeSpan / 2592000) + " months ago";
        }
    }

    var curMonths = Math.floor(timeSpan / 2592000); // average 30 days
    if (curMonths > 0) {
        if (curMonths >= 2) {
            return curMonths + " months ago";
        } else {
            return  Math.floor(timeSpan / 604800) + " weeks ago";
        }
    }

    var curDays = Math.floor(timeSpan / 86400);
    if (curDays > 0) {
        if (curDays >= 2) {
            return curDays + " days ago";
        } else {
            return Math.floor(timeSpan / 3600) + " hours ago";
        }
    }

    var curHours = Math.floor(timeSpan / 3600);
    if (curHours > 0) {
        if (curHours >= 2) {
            return curHours + " hours ago";
        } else {
            return Math.floor(timeSpan / 60) + " minutes ago";
        }
    }

    var curMinutes = Math.floor(timeSpan / 60);
    if (curMinutes >= 2) {
        return curMinutes + " minutes ago";
    }

    if (timeSpan <= 1) {
        return "just now";
    } else {
        return timeSpan + " seconds ago";
    }

}


function UpdateBlahComments() {
    var curComment;
    var commentDiv = document.getElementById("BlahCommentBody");
    for (i in CurrentComments) {
        curComment = CurrentComments[i];
        var commentEl = createCommentElement(curComment);
        commentDiv.appendChild(commentEl);
    }
}



function FocusBlah(who) {
    StopAnimation();
    $("#LightBox").show();
    PopulateBlahPreview(who.blah);
    $(BlahPreviewItem).fadeIn("fast");
    BlahPreviewTimeout = setTimeout(TimeOutBlahFocus, 5000);
    FocusedBlah = who.blah;
}

function PopulateBlahPreview(whichBlah) {
    var headlineText = document.getElementById("BlahPreviewHeadline");
    headlineText.innerHTML = unescape(whichBlah.text);
   

    var image = getBlahImage(whichBlah);
    var imageEl = document.getElementById("blahPreviewImage");
    if (image == "") {
        imageEl.style.display = "none";
        headlineText.style.fontSize = "36px";
    } else {
        imageEl.style.display = "block";
        imageEl.src = image;
        headlineText.style.fontSize = "24px";
    }

    // stats
    document.getElementById("previewUpVote").innerHTML = whichBlah.u;
    document.getElementById("previewDownVote").innerHTML = whichBlah.d;
    document.getElementById("previewComments").innerHTML = "";
    document.getElementById("PreviewViewerCount").innerHTML = whichBlah.o; // change to actual viewers

    // get the entire blah to update the rest...
    Blahgua.GetBlah(whichBlah.blahId, UpdateBodyText, OnFailure);
}

function UpdateBodyText(theFullBlah) {
    CurrentBlah = theFullBlah;

    // update the comment count while we are here
    if (theFullBlah.hasOwnProperty("c")) {
        document.getElementById("previewComments").innerHTML = theFullBlah.c;
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
}


function TimeOutBlahFocus() {
    if (BlahPreviewTimeout != null) {
        clearTimeout(BlahPreviewTimeout);
        BlahPreviewTimeout = null;
    }
    FocusedBlah = null;
    CurrentBlah = null;
    $("#BlahPreviewItem").fadeOut();
    $("#LightBox").fadeOut();
    StartAnimation();
}

function UnfocusBlah(who) {
    if (BlahPreviewTimeout != null) {
        clearTimeout(BlahPreviewTimeout);
        BlahPreviewTimeout = null;
    }
    FocusedBlah = null;
    CurrentBlah = null;
    $("#BlahPreviewItem").hide();
    $("#LightBox").hide();
    StartAnimation();
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

    var imagePath = getBlahImage(theBlah);
    if (imagePath != "") {
        newDiv.style.backgroundImage = "url('" + imagePath + "')";
        var r = (Math.round(Math.random() * 127) + 127);
        var g = (Math.round(Math.random() * 127) + 127);
        var b = (Math.round(Math.random() * 127) + 127);
        var colorStr = "rgba(" + r + "," + g + "," + b + ", .8)";
        if (theBlah.displaySize != 3) {
            textDiv.classList.add("BlahAltTextDiv");
            textDiv.style.backgroundColor = colorStr;
        }
        else {
            textDiv.style.backgroundColor = pastelColors();
            textDiv.classList.add("BlahExpandTextDiv");
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

function getBlahImage(theBlah) {
    var imagePathName = "";
    if (Math.random() < .50) {
        var numImages = 45;
        var imageNum = 1 + Math.floor(Math.random() * numImages);
        imagePathName = imageNum + ".jpg";
        if (imagePathName.length == 5) {
            imagePathName = "0" + imagePathName;
        }
        imagePathName = "http://files.blahgua.com/webapp/blahimages/" + imagePathName;
        //imagePathName = "http://files.blahgua.com/webapp/walmartimages/" + imagePathName;

    }

    return imagePathName;

}

function CreateElementForBlah(theBlah) {
    var newEl = CreateBaseDiv(theBlah);
    var paddingOffset = 8 * 2;

    if (theBlah.displaySize == 1) {
        newEl.style.width = LargeTileWidth - paddingOffset + "px";
        newEl.style.height = LargeTileHeight - paddingOffset + "px";
        newEl.classList.add('LargeBlahFormat');
    } else if (theBlah.displaySize == 2) {
        newEl.style.width = MediumTileWidth - paddingOffset + "px";
        newEl.style.height = MediumTileHeight - paddingOffset + "px";
        newEl.classList.add('MediumBlahFormat');
    } else {
        newEl.style.width = SmallTileWidth - paddingOffset + "px";
        newEl.style.height = SmallTileHeight - paddingOffset + "px";
        newEl.classList.add('SmallBlahFormat');
    }

    newEl.style.backgroundColor = pastelColors();
    newEl.style.color = darkColors();

    return newEl;
}

function DrawInitialBlahs() {
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

function DoAddBlahRow() {

    var nextRow = BuildNextRow();
    nextRow.rowAbove = BottomRow;
    BottomRow.rowBelow = nextRow;
    BottomRow = nextRow;
    nextRow.style.top = ($("#BlahContainer").height() + $("#BlahContainer").scrollTop()) + "px";
    $("#BlahContainer").append(nextRow);
    ResizeRowText(nextRow);
    RowsOnScreen++;
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
        if (TopRow.hasOwnProperty("rowAbove") && (TopRow.rowAbove.getBoundingClientRect().bottom > 0)) {
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
    // when the list is empty, we refill it.  For now, we just use the same list
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
        } else if (which == 1)  {
            CreateMSSRow(nextBlah, newRowEl);
        } else if (which == 2)  {
            CreateSMSRow(nextBlah, newRowEl);
        } else if (which == 3)  {
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
    StartAnimation();
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
    NormalizeStrengths(theBlahList);
    AssignSizes(theBlahList);

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
        url: 'BlahguaService.asmx/UploadFile',  //server script to process data
        //url: 'http://ec2-50-112-195-162.us-west-2.compute.amazonaws.com:50192/api/v2/images/upload',
        type: 'POST',
        //crossDomain: true, 
        xhr: function () {  // custom xhr
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
    var newEl = document.createElement("li");
    newEl.className = "comment";

    var newHTML = "";
    // button for making complaints about the comment, banning user, etc.
    newHTML += '<button class="flipdown-btn" role="button" onclick=";return false;" type="button">';
    newHTML += '<span class="flipdown-btn-icon-wrapper"><img class="yt-uix-button-icon yt-uix-button-icon-comment-close" alt="" src="http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif">';
    newHTML += '</span><img class="yt-uix-button-arrow" alt="" src="http://s.ytimg.com/yts/img/pixel-vfl3z5WfW.gif"><div class=" yt-uix-button-menu yt-uix-button-menu-link" style="display: none;"><ul><li class="comment-action-remove comment-action" data-action="remove"><span class="yt-uix-button-menu-item">Remove</span></li><li class="comment-action" data-action="flag-profile-pic"><span class="yt-uix-button-menu-item">Report profile image</span></li><li class="comment-action" data-action="flag"><span class="yt-uix-button-menu-item">Flag for spam</span></li><li class="comment-action-block comment-action" data-action="block"><span class="yt-uix-button-menu-item">Block User</span></li><li class="comment-action-unblock comment-action" data-action="unblock"><span class="yt-uix-button-menu-item">Unblock User</span></li></ul></div></button>';
    // user image
    newHTML += '<a class="user-image" href="/user/username">';
    newHTML += '<span class="user-image-thumbnail">';
    newHTML += '<img width="48" alt="Username" src="http://files.blahgua.com/images/unknown-user.png">';
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
    newHTML += '    <a class="inspect-btn"  onclick=";return false;">Inspect </a>';
    newHTML += '    <span class="separator">·</span>';

    // vote up
    newHTML += '<span class="clickcard">';
    newHTML += '  <button title="" class="start-comment-action" onclick=";return false;" type="button" >';
    newHTML += '    <span class="button-icon-wrapper">';
    newHTML += '      <img class="comment-vote" alt="" src="http://files.blahgua.com/webapp/img/black_thumbsUp.png">';
    newHTML += '    </span>';
    newHTML +=   '</button>';
    newHTML += '</span> ';

    // vote down
    newHTML += '<span class="clickcard">';
    newHTML += '<button title="" class="end comment-action" onclick=";return false;" type="button" >';
    newHTML += '<span class="button-icon-wrapper">';
    newHTML += '<img class="comment-vote" alt="" src="http://files.blahgua.com/webapp/img/black_thumbsDown.png">';
    newHTML += '</span>';
    newHTML += '</button>';
    newHTML += '</span>';
    newHTML += '</div>';

    newHTML += '</div>';


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
            curLoc =  -1;
        }
    }



    SetCurrentChannel(curLoc);
}

function GetUserChannels() {
    Blahgua.GetUserChannels(GetChannelsOK, OnFailure)   ;
}

function GetChannelsOK(theChannels) {
    ChannelList = theChannels;
    SetCurrentChannel(0);
}

function SetCurrentChannel(whichChannel) {
    StopAnimation();
    if (whichChannel == -1) {
        InstallUserChannel();
    } else {
        CurrentChannel = ChannelList[whichChannel];
        Blahgua.SetCurrentChannel(CurrentChannel.groupId);
        var labelDiv = document.getElementById("ChannelBannerLabel");
        labelDiv.innerHTML = CurrentChannel.displayName;
        GetUserBlahs();
    }

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
    $("#BlahContainer").empty();
    CurrentChannel = null;
    if (CurrentUser == null) {
        Blahgua.GetCurrentUser(OnGetUserOK, OnFailure);
    }
    else {
        PopulateUserChannel();
    }
}

function OnGetUserOK(theResult) {
    CurrentUser = theResult;
    PopulateUserChannel();
}

function PopulateUserChannel() {
    var ChannelName = "";

    if (CurrentUser.hasOwnProperty("n")) {
        ChannelName = CurrentUser.n + "'s channel";
    } else {
        ChannelName = "your channel";
    }
    $("#ChannelBannerLabel").html(ChannelName);

    // now load the other page
    $("#BlahContainer").load("./aws/pages/SelfPage.html#");

    $("#ChannelBanner").animate({"background-color": "#8080FF" }, 'slow');
}


function UpdateChannelViewers() {
    if (ViewerUpdateTimer != null) {
        clearTimeout(ViewerUpdateChannel);
        ViewerUpdateTimer = null;
    }
    if (CurrentChannel == null) {
        Blahgua.GetViewersOfUser(UserId, OnChannelViewersOK, OnFailure);
    } else {
        Blahgua.GetViewersOfChannel(CurrentChannel.id, OnChannelViewersOK, OnFailure);
    }
}

function OnChannelViewersOK(numViewers) {
    $("#ChannelViewersCountText").html(numViewers);

}

function DoCreateBlah() {
    StopAnimation();
    $(BlahFullItem).load("./aws/pages/CreateBlahPage.html#");
    $(BlahFullItem).fadeIn("fast");
}