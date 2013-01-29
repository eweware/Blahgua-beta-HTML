


var BlahsMovingTimer = null;
var BlahPreviewTimeout = null;

var ColorMap = [];
var BlahList;
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
    //BlahList = makeFakeBlahs();
    $("#BlahContainer").disableSelection();
    $("#BlahContainer").on('swipeleft', HandleSwipeLeft);
    $("#BlahContainer").on('swiperight', HandleSwipeRight);
    $("#BlahContainer").on('swipeup', HandleSwipeUp);
    $("#BlahContainer").on('swipedown', HandleSwipeDown);
    $("#LightBox").click(function () { UnfocusBlah(); });

    CreateChannelBanner();
    CreatePreviewBlah();
    CreateFullBlah();
    ComputeSizes();
    GetUserBlahs();
});




// ********************************************************
// Create the elements for blahs and rows


function HandleSwipeLeft(theEvent) {
    alert("Swipe Left!");
}

function HandleSwipeRight(theEvent) {
    alert("Swipe Right!");
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
    viewCount.appendChild(countText);
    countText.innerHTML = "2019";

    var options = document.createElement("div");
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
    var html = "";
    html += '<table width="100%" class="BlahFullTable">';
    html += '<tr class="BlahFullHeader"><td colspan="4"><span class="fullBlahgerName">A female blahger from Santa Monica, CA says:</span></td>';
    html += '<td align="right"><img width="24px" alt="viewers" src="http://files.blahgua.com/webapp/img/black_eye.png">';
    html += '<span class="FullBlahViewerCount" id="FullBlahViewerCount">24</span></td></tr>';
    html += '<tr><td colspan="5" class="BlahFullHeadline" id="BlahFullHeadline"></td></tr>';
    // add the row of voting buttons
    html += '<tr height="48px">';
    html += '<td width="20%"></td>';
    html += '<td width="20%" align="center">';
    html += '<img width="16px" alt="vote up" src="http://files.blahgua.com/webapp/img/black_thumbsUp.png">';
    html += '<span class="statsText" id="fullBlahUpVote">21</span>';
    html += '</td>';
    html += '<td width="20%" align="center">';
    html += '<img width="16px" alt="vote down" src="http://files.blahgua.com/webapp/img/black_thumbsDown.png">';
    html += '<span class="statsText" id="fullBlahDownVote">1,563</span>';
    html += '</td>';
    html += '<td width="20%" align="center">';
    html += '<img width="16px" alt="comment" src="http://files.blahgua.com/webapp/img/black_comment.png">';
    html += '<span class="statsText" id="fullBlahComments">65</span>';
    html += '</td>';
    html += '<td width="20%"></td></tr>';
    // add the image and the body
    html += '<tr height="*"><td colspan="5" align="center">';
    html += '<div class="FullBlahContent" id="FullBlahContent">';
    html += '<table><tr><td align="center"><img alt="Blah Image" class="BlahFullImage" id="blahFullImage"></td></tr>';
    html += '<tr><td class="BlahFullBody" id="BlahFullBody"></td></tr>';
    // add the comment area
    html += '<tr><td><div class="BlahCommentBody" id="BlahCommentBody"></div></td></tr>';
    html += '</table></div> </td></tr>';
    html += '</table>';
    BlahFullItem.innerHTML = html;
    BlahFullItem.headline = document.getElementById("BlahFullHeadline");
    BlahFullItem.headline.onclick = DoCloseBlah;
}

// ********************************************************
// Handle blah events

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
    $("#BlahFullItem").fadeOut("fast");

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
    var commentDiv = document.getElementById("BlahCommentBody");
    commentDiv.innerHTML = "";  // erase existing content
    PopulateFullBlah(whichBlah);
    $(BlahFullItem).fadeIn("fast");
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
    var bodyText = document.getElementById("BlahFullBody");
    if (CurrentBlah.hasOwnProperty("c")) {
        document.getElementById("fullBlahComments").innerHTML = CurrentBlah.c;  // to do, change to 'c'
    }

    if (CurrentBlah.hasOwnProperty("b")) {
        bodyText.innerHTML = unescape(CurrentBlah.b);
    } else {
        bodyText.innerHTML = "";
    }

    // update the comments
    if (CurrentBlah.hasOwnProperty("c") && CurrentBlah.c > 0) {
        // blah has comments
        Blahgua.GetBlahComments(CurrentBlah._id, UpdateBlahComments, OnFailure);
    } else {
        // no comments
        var commentDiv = document.getElementById("BlahCommentBody");
        var newHTML = "";
        newHTML += '<span class="NoCommentSpan">No Comments</span>';
        commentDiv.innerHTML = newHTML;
    }
}


function UpdateBlahComments(theComments) {
    var curComment;
    var commentDiv = document.getElementById("BlahCommentBody");
    for (i in theComments) {
        curComment = theComments[i];
        var commentEl = createCommentElement(curComment);
        commentDiv.appendChild(commentEl);
    }
}

function createCommentElement(theComment) {
    var newEl = document.createElement("table");
    newEl.className = "CommentDiv";

    var newHTML = "";
    newHTML += '<tr><td colspan="3">';
    newHTML += '<span class="CommentText">' + unescape(theComment.text) + '</span>';
    newHTML += '</td></tr>'
    newHTML += '<tr>';
    newHTML += '<td></td><span class="CommentAuthor">' + 'A blahger from CA' + '</span></td>';
    newHTML += '<td></td><span class="CommentDate">' + theComment.created + '</span></td>';
    newHTML += '<td></td><span class="CommentVotes">' + theComment.cuv + '</span></td>';
    newHTML += '</tr>'

    newEl.innerHTML = newHTML;

    return newEl;
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
    var bodyText = document.getElementById("BlahPreviewBody");
    CurrentBlah = theFullBlah;
    if (theFullBlah.hasOwnProperty("c")) {
        document.getElementById("previewComments").innerHTML = theFullBlah.c;  // to do, change to 'c'
    }

    if (theFullBlah.hasOwnProperty("b")) {
        bodyText.innerHTML = unescape(theFullBlah.b);
    } else {
        bodyText.innerHTML = "";
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

    StartBlahsMoving();
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
    var nextBlahSet = [];

    nextBlahSet = nextBlahSet.concat(BlahList);
    fisherYates(nextBlahSet);

    ActiveBlahList = ActiveBlahList.concat(nextBlahSet);
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
    Blahgua.GetBlahsForUser(UserId, OnGetBlahsOK, OnFailure);

}

function OnGetBlahsOK(theResult) {
    BlahList = theResult;
    PrepareBlahList();
    DrawInitialBlahs();
};


function NormalizeStrengths() {
    // makes sure that the blahs here range in strength from 0.0 to 1.0
    var minStr = 1;
    var maxStr = 0;
    var currentBlah;

    for (currentBlahIndex in BlahList) {
        currentBlah = BlahList[currentBlahIndex];
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


    for (currentBlahIndex in BlahList) {
        currentBlah = BlahList[currentBlahIndex];
        currentBlah.s = (currentBlah.s - offset) * scale;
    }
}

function AssignSizes() {
    // makes sure that there are a good ration of large, medium, small
    var numLarge = 10;
    var numMedium = 50;
    // the rest are small - presumably 40, since we get 100 blahs
 
    // first, sort the blahs by their size
    BlahList.sort(function (a, b) {
        return b.s - a.s;
    });

    var i = 0;
    while (i < numLarge) {
        BlahList[i++].displaySize = 1;
    }

    MaxMedium = BlahList[i].s;

    while (i < (numMedium + numLarge)) {
        BlahList[i++].displaySize = 2;
    }

    MaxSmall = BlahList[i].s;

    while (i < BlahList.length) {
        BlahList[i++].displaySize = 3;
    }

}

function PrepareBlahList() {
    NormalizeStrengths();
    AssignSizes();
    ActiveBlahList = [];
    RefreshActiveBlahList();
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

