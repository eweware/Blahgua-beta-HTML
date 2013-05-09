﻿
var BlahsMovingTimer = null;
var BlahPreviewTimeout = null;
var ViewerUpdateTimer = null;

var BlahList;
var NextBlahList;
var LargeTileWidth = 400;
var MediumTileWidth = 200;
var SmallTileWidth = 100;
var LargeTileHeight = 400;
var MediumTileHeight = 200;
var SmallTileHeight = 100;
var ActiveBlahList;
var TopRow = null;
var BottomRow = null;
var CurrentScrollSpeed = 1;
var RowsOnScreen = 10;
var BlahPreviewItem;
var BlahFullItem;
var FocusedBlah = null;
var CurrentBlah = null;
var CurrentBlahId = null;
var CurrentComments = null;
var CurrentChannel = null;
var CurrentUser = null;
var ChannelList = [];
var BlahTypeList = null;
var IsUserLoggedIn = false;
var ChannelDropMenu = null;
var fragmentURL = "http://blahgua-webapp.s3.amazonaws.com";
var ProfileSchema = null;
var UserProfile = null;
var CurrentBlahNickname = "";
var kBlahTypeSays;
var kBlahTypeLeaks;
var kBlahTypePolls;
var kBlahTypePredicts;
var kBlahTypeAd;
var kBlahTypeAsks;
var edgeGutter = 12;
var interBlahGutter = 12;
var newlineToken = "[_r;";
var BlahReturnPage = "";
var MaxTitleLength = 64;
var kLargeBlahStrength = .7;
var kSmallBlahStrength = .2;
var kBannerHighlightColor = "#FFFFFF";
var kBannerColor = "#FF00FF";
var numStatsDaysToShow = 7;
var BlahOpenPage = "Overview";


function GlobalReset() {
    // clear all timers
    clearInterval(BlahsMovingTimer);
    clearInterval(BlahPreviewTimeout);
    clearInterval(ViewerUpdateTimer);
    if (confirm("An error occurred and Blahgua will reload.  Do you want to clear cookies as well?")) {
        $.removeCookie("userId");
        $.removeCookie("password");
    }
    Blahgua.logoutUser();
    location.reload();
}


function BlockMove(event) {
    // Tell Safari not to move the window.
    event.preventDefault() ;
}


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


var resizeTimer = null;
$(window).resize(function(){
    resizeTimer && clearTimeout(resizeTimer);
    resizeTimer = setTimeout(HandleWindowResize, 100);
});

function HandleWindowResize() {
    ComputeSizes();
    SetCurrentChannel(ChannelList.indexOf(CurrentChannel));
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
    $("#ChannelBanner").disableSelection();
    $("#ChannelDropMenu").disableSelection();
    $("#BlahPreviewItem").disableSelection();
    $("#BlahContainer").on('swipeleft', HandleSwipeLeft);
    $("#BlahContainer").on('swiperight', HandleSwipeRight);
    $("#BlahContainer").on('swipeup', HandleSwipeUp);
    $("#BlahContainer").on('swipedown', HandleSwipeDown);
    $("#LightBox").click(function () {
        $("#ChannelDropMenu").hide();
        UnfocusBlah();
    });
    if ((window.location.hostname == "") ||
        (window.location.hostname == "localhost") ||
        (window.location.hostname == "127.0.0.1")) {
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
            Blahgua.GetProfileSchema(function(theSchema) {
                ProfileSchema = theSchema.fieldNameToSpecMap;
            }, OnFailure) ;
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




// *************************************************
// Channels

function ChannelIDFromName(Channel, ChannelList) {
    var curChannel;
    for (curIndex in ChannelList) {
        curChannel = ChannelList[curIndex];
        if (curChannel.N == Channel) {
            return curChannel._id;
        }
    }
    return null;
}


function AddDefaultChannelsToNewUser() {
    Blahgua.GetFeaturedChannels(OnGetChannelsOK);
}

function OnGetChannelsOK(channelList) {
    Blahgua.JoinUserToChannel(ChannelIDFromName("The Now Network", channelList),
        function () {
            Blahgua.JoinUserToChannel(ChannelIDFromName("Technology", channelList),
                function () {
                    Blahgua.JoinUserToChannel(ChannelIDFromName("Entertainment", channelList),
                        GetUserChannels
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
    var errString = "An error occured. Soz!";
    var responseText = getSafeProperty(theErr, "responseText", null);
    if (responseText) {
        try {
            var responseObj = JSON.parse(responseText);
            var message = getSafeProperty(responseObj, "message", "An error occured");
            var code = getSafeProperty(responseObj, "errorCode", "<no id>");
            errString = "Error: (" + code + "): " + message;
        } catch (exp) {

        }
        errString += "\nFull Text: \n" + responseText;
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
    var desiredWidth = 640;
    if (windowWidth < desiredWidth)
        desiredWidth = windowWidth;

    if (windowWidth > windowHeight) {
        isVertical = false;
    } else {
        isVertical = true;
    }

    var totalGutter = edgeGutter * 2 + interBlahGutter * 3;

    SmallTileWidth = Math.floor((desiredWidth - totalGutter) / 4);

    MediumTileWidth = (SmallTileWidth * 2) + interBlahGutter;
    LargeTileWidth = (MediumTileWidth * 2) + interBlahGutter;
    //LargeTileWidth = (SmallTileWidth * 3) + (interBlahGutter * 2);

    SmallTileHeight = SmallTileWidth;
    MediumTileHeight = MediumTileWidth ;
    //LargeTileHeight = LargeTileWidth;
    LargeTileHeight = MediumTileHeight;

    // now make the window the correct size
    var targetWidthWidth = (SmallTileWidth * 4) + totalGutter;
    var offset = Math.floor((windowWidth - targetWidthWidth) / 2);
    var blahContainer = document.getElementById("BlahContainer");
    blahContainer.style.left = offset + "px";
    blahContainer.style.width = LargeTileWidth + "px";

    $("#BlahContainer").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });
    $("#ChannelBanner").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });
    $("#BlahPreviewItem").css({ 'left': offset + 16 + 'px', 'width': targetWidthWidth - 32 + 'px', 'maxHeight': windowHeight-100+'px' });

    $("#BlahFullItem").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });


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
        // do something when the preview page is opened...
    });
}

function OpenFocusedBlah() {
    window.event.cancelBubble = true;
    if (BlahPreviewTimeout != null) {
        clearTimeout(BlahPreviewTimeout);
        BlahPreviewTimeout = null;
    }
    BlahReturnPage = "BlahRoll";
    OpenBlah(FocusedBlah);
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
    BlahReturnPage = "BlahRoll";
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


    UnfocusBlah();
    switch (BlahReturnPage) {
        case "UserBlahList":
            PopulateUserChannel("History");
            break;

        default:
            $(BlahFullItem).fadeOut("fast", function() {
                $(BlahFullItem).empty();

            });

    }
    BlahReturnPage = null;

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
        $(BlahFullItem).disableSelection();
        $(BlahFullItem).fadeIn("fast", function() {
            SetBlahDetailPage("Overview");
        });
    });
}

function SetBlahDetailPage(whichPage) {
    $(".BlahPageFooter .BlahButton").removeClass("BlahBtnSelected");
    switch (whichPage) {
        case "Overview":
            BlahFullItem.curPage = "Overview";
            $('#BlahPageDiv').load(function() {
                var winHeight = $(window).height();
                var curTop = document.getElementById("FullBlahContent").clientTop;
                var dif = 80 + 70 + curTop;
                $("#FullBlahContent").css({ 'max-height': winHeight-dif + 'px'});
            });
            $("#BlahPageDiv").load(fragmentURL + "/pages/BlahBodyDetailPage.html #FullBlahBodyDiv", function() {
                $("#BlahDetailSummaryBtn").addClass("BlahBtnSelected");
                UpdateBlahOverview();
            });
            break;
        case "Comments":
            BlahFullItem.curPage = "Comments";
            $("#BlahPageDiv").load(fragmentURL + "/pages/BlahCommentDetailPage.html #FullBlahCommentDiv", function() {
                $("#BlahDetailCommentsBtn").addClass("BlahBtnSelected");
                UpdateBlahComments();
            });
            break;
        case "Stats":
            BlahFullItem.curPage = "Stats";
            $("#BlahPageDiv").load(fragmentURL + "/pages/BlahStatsDetailPage.html #FullBlahStatsDiv", function() {
                $("#BlahDetailStatsBtn").addClass("BlahBtnSelected");
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



function UpdateBlahOverview() {
    if (CurrentBlah == null) {
        var EndDate = new Date(Date.now());
        var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
        var startStr = createDateString(StartDate);
        var endStr = createDateString(EndDate);

        Blahgua.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
            CurrentBlah= theBlah;
            UpdateBlahOverview();
        }, OnFailure);
        return;
    }
    UpdateFullBlahBody();
    // update views, opens, comments
    document.getElementById("FullBlahViewerCount").innerHTML = getSafeProperty(CurrentBlah, "V", 0);
    document.getElementById("FullBlahOpenCount").innerHTML = getSafeProperty(CurrentBlah, "O", 0);
    document.getElementById("fullBlahComments").innerHTML = getSafeProperty(CurrentBlah, "C", 0);

    var isOwnBlah;


    if (IsUserLoggedIn) {
        isOwnBlah = (CurrentBlah.A == CurrentUser._id);
    } else {
        isOwnBlah = false;
    }
    var image = GetBlahImage(CurrentBlah, "D");



    if (IsUserLoggedIn) {

        $("#BlahRowVote").show();
        $("#BlahRowSignIn").hide();
        $("#UploadImageTable").show();

        if (isOwnBlah) {
            if (image != "") {
                $("#UploadImageTable").hide();
            }
        } else {
            $("#UploadImageTable").hide();
        }
    } else {
        $("#BlahRowVote").hide();
        $("#BlahRowSignIn").show();
        $("#UploadImageTable").hide();
    }

    UpdateVoteBtns();

    var imageEl = document.getElementById("blahFullImage");
    var headlineText = document.getElementById("BlahFullHeadline");
    if (image == "") {
        imageEl.style.display = "none";
        $(".blah-body-divider").show();
    } else {
        imageEl.style.display = "absolute";
        $(".blah-body-divider").hide();
        imageEl.src = image;
    }

    var bodyTextDiv = document.getElementById("BlahFullBody");
    if (CurrentBlah.hasOwnProperty("F")) {
        var bodyText = CurrentBlah.F;
        if (bodyText && (bodyText != "")) {
            //bodyText = URLifyText(unescape(bodyText)).replace(/\n/g, "<br/>");
            bodyText = UnCodifyText(bodyText);
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
                function() { UpdateAskPage("PollAnswersArea"); })
            break;
        default:

    }
}


function UpdateVoteBtns() {
    document.getElementById("UserPromoteSpan").innerHTML = getSafeProperty(CurrentBlah, "P", 0);
    document.getElementById("UserDemoteSpan").innerHTML = getSafeProperty(CurrentBlah, "D", 0);
    var promoBtn =  document.getElementById("PromoteBlahImage");
    var demoBtn = document.getElementById("DemoteBlahImage");

    if (IsUserLoggedIn) {
        if (CurrentBlah.A == CurrentUser._id) {
            // own blah - can't vote
            promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_disabled.png";
            promoBtn.disabled = true;
            demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_disabled.png";
            demoBtn.disabled = true;
        } else {
            // not own blah - can vote.  Did they?
            var userVote = getSafeProperty(CurrentBlah, "uv", 0);
            if (userVote && (userVote != 0)) {
                demoBtn.disabled = true;
                promoBtn.disabled = true;
                if (userVote == 1) {
                    promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_checked.png";
                    demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_disabled.png";
                } else {
                    promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_disabled.png";
                    demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_checked.png";
                }
            } else {
                // user can vote
                promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote.png";
                promoBtn.disabled = false;
                demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote.png";
                demoBtn.disabled =false;
            }
        }
    } else {
        // not logged in - can't vote
        promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_disabled.png";
        promoBtn.disabled = true;
        demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_disabled.png";
        demoBtn.disabled = true;
    }
}

function SetBlahVote(theVote) {
    if (!window.event.srcElement.disabled) {
        Blahgua.SetBlahVote(CurrentBlah._id, theVote, function(json) {
            var oldVote;
            CurrentBlah["uv"] = theVote;
            if (theVote == 1) {
                oldVote = getSafeProperty(CurrentBlah, "P", 0);
                oldVote++;
                CurrentBlah["P"] = oldVote;
            } else {
                oldVote = getSafeProperty(CurrentBlah, "D", 0);
                oldVote++;
                CurrentBlah["D"] = oldVote;
            }
            UpdateVoteBtns();

        }, OnFailure);
    }
}



function DoAddImageToBlah() {
    var blahId = CurrentBlah._id;
    $("#ProgressDiv").show();
    $("#objectId").val(blahId);

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
            OnAddImageOK(data);

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

function OnAddImageOK(data) {
    var EndDate = new Date(Date.now());
    var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
    var startStr = createDateString(StartDate);
    var endStr = createDateString(EndDate);

    Blahgua.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
        CurrentBlah= theBlah;
        SetBlahDetailPage("Overview");
    }, OnFailure);
    return;
}




function UpdateBlahComments() {
// update the comments
    $("#BlahCommentTable").empty();
    if (CurrentBlah.hasOwnProperty("C") && CurrentBlah.C > 0) {
        // blah has comments
        Blahgua.GetBlahComments(CurrentBlah._id, SortAndRedrawComments, OnFailure);
    } else {
        // no comments GetBlahTypeStr()
        var newHTML = "";
        newHTML += '<tr class="no-comment-row"><td><span>No Comments yet. Perhaps you can add the first!</span></td></tr>';
        $("#BlahCommentTable").append(newHTML);
    }

    // update the input area
    if (IsUserLoggedIn) {
        $("#SignInToCommentArea").hide();
        $("#CreateCommentArea").show();
    $("#CommentTextArea").keyup(function(e) {
            // disable button if there is not enough text

            document.getElementById("AddCommentBtn").disabled = (this.value.length < 3);

            //  the following will help the text expand as typing takes place
            while($(this).outerHeight() < this.scrollHeight) {
                $(this).height($(this).height()+1);
            };
        });
    } else {
        $("#SignInToCommentArea").show();
        $("#CreateCommentArea").hide();
    }

    // handle the sizing
    var titleBottom =  document.getElementById("CreateCommentArea").getBoundingClientRect().bottom;
    $(".comment-container").css({ 'top': titleBottom + 'px'});

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
    var BlahGenderData = CreateDemoData("B");
    var BlahRaceData = CreateDemoData("D");
    var BlahIncomeData = CreateDemoData("E");
    var BlahAgeData = CreateDemoData("C");


    $('#BlahOpenChartDiv').highcharts({
        chart: {
            type: 'bar'
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Gender'
        },
        xAxis: {
            categories: ['Open', 'Promote', 'Comment']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: BlahGenderData
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
            text: 'Race'
        },
        xAxis: {
            categories: ['Open', 'Promote', 'Comment']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: BlahRaceData
    });

    // Promotes
    $('#BlahPromoteChartDiv').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Age'
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: ['Open', 'Promote', 'Comment']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: BlahAgeData
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
            text: 'Income'
        },
        xAxis: {
            categories: ['Open', 'Promote', 'Comment']
        },
        yAxis: {
            title: {
                text: 'count'
            }
        },
        series: BlahIncomeData
    });
}


function UpdateBlahAuthor() {

}





function getSafeProperty(obj, prop, defVal) {
    if(obj && obj.hasOwnProperty(prop)) {
        return obj[prop];
    } else {
        return defVal;
    }
}

function GetBlahTypeStr() {
    return GetBlahTypeNameFromId(CurrentBlah.Y);
}

function GetBlahTypeId(theType) {
    for (var curType in BlahTypeList) {
        if (BlahTypeList[curType].N == theType) {
            return BlahTypeList[curType]._id;
        }
    }

    return "";
}

function GetBlahTypeNameFromId(theId) {
    for (var curType in BlahTypeList) {
        if (BlahTypeList[curType]._id == theId) {
            return BlahTypeList[curType].N;
        }
    }

    return "";
}

function UpdateFullBlahBody() {
    var headlineText = document.getElementById("BlahFullHeadline");
    headlineText.innerHTML = CurrentBlah.T;
    var nickNameStr = CurrentBlahNickname;
    var blahTypeStr = GetBlahTypeStr();
    var isOwnBlah;
    var blahChannelStr = GetChannelNameFromID(CurrentBlah.G);


    if (IsUserLoggedIn) {
        isOwnBlah = (CurrentBlah.A == CurrentUser._id);
    } else {
        isOwnBlah = false;
    }

    if (isOwnBlah) {
        nickNameStr += " (you)";
    }

    // stats
    //document.getElementById("FullBlahViewerCount").innerHTML = getSafeProperty(CurrentBlah, "V", 0); // change to actual viewers
    document.getElementById("FullBlahNickName").innerHTML = nickNameStr;
    document.getElementById("BlahSpeechAct").innerHTML = blahTypeStr + " in " + blahChannelStr;

    // update the opens
    Blahgua.AddBlahViewsOpens(CurrentBlah._id, 0, 1, null, null);// to do - check for errors

    // update the badges & date
    Blahgua.getUserDescriptorString(CurrentBlah.A, function(theString) {
        $("#FullBlahProfileString").text(theString.d);
    }, function (theErr) {
        $("#FullBlahProfileString").text("an anonymous blahger");
    })

    var curDate = new Date(getSafeProperty(CurrentBlah, "c", Date.now()));
    var dateString = ElapsedTimeString(curDate);
    $("#FullBlahDateStr").text(dateString);

    // see if we were supposed to go elsewhere
    if (BlahOpenPage != "Overview") {
        SetBlahDetailPage(BlahOpenPage);
        BlahOpenPage = "Overview";
    }
}

function UpdatePredictPage() {
    // update the prediction divs
    var expDateVal = getSafeProperty(CurrentBlah, "E", Date.now());
    var expDate = new Date(expDateVal);
    var elapStr = ElapsedTimeString(expDate);
    $("#elapsedTimeBlah").text(elapStr);
    $("#predictionDateBlah").text(expDate.toLocaleDateString());
}

function UpdateAskPage(previewAreaName) {

    if (CurrentBlah.hasOwnProperty("I")) {
        var choices = CurrentBlah.I;
        var votes = CurrentBlah.J;
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
    if (json.hasOwnProperty("W")) {
        // disable all vote buttons
        $(".PollVoteIcon").remove();
        $(".PollVoteText")[Number(json.W)].style.color = "#FF0000";
        $(".PollVoteText")[Number(json.W)].style.fontWeight = "bold";
    }
}

function CreatePollChoiceElement(pollChoice, curVotes, maxVotes, choiceIndex) {
    var maxWidth = $("body").width() - 280;
    var ratio = curVotes/ maxVotes;
    var curRatio = Math.floor(100 * ratio);
    var newHTML = "";
    newHTML += '<table class="PollChoiceWrapper"><tbody><tr style="width:100%">';
    newHTML += '<td class="PollTitle"><span>' + pollChoice.G + '</span></td>';
    newHTML += '<td class="PollDescription" style="width:' + maxWidth + 'px">';
    newHTML += '<div class="PollChartDiv" style="width:' + curRatio + '%"></div></td>';
    newHTML += '<td class="PollVotes">';
    newHTML += '<img class="PollVoteIcon" src="' + fragmentURL + '/img/black_thumbsUp.png" id="' + choiceIndex + '" alt="vote up" onclick="DoPollVote(); return false;" />';
    newHTML += '<span class="PollVoteText">' + curVotes + '</span>';
    newHTML += '</td></tr>';
    // add a row for the comment, if any
    if (pollChoice.hasOwnProperty("T")) {
        newHTML += '<tr><td></td><td colspan="2" class="PollComment">';
        newHTML += '<span style="font-style:italic">' + pollChoice.T + '</span>';
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
    CurrentBlah["C"] = CurrentComments.length;
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
        CurrentComments.sort(dynamicSort("c"));
        CurrentComments.reverse();

    }
    else if (SortBy == "oldest") {
        CurrentComments.sort(dynamicSort("c"));
    }
    else if (SortBy == "most_relevant") {
        // do nothing for now
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
        if (curYears > 2) {
            return curYears + " years" + tailStr;
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
        var commentEl = createCommentElement(i, curComment);
        commentDiv.appendChild(commentEl);
    }
}



function FocusBlah(who) {
    CurrentBlah = null;
    StopAnimation();
    $("#LightBox").show();
    BlahPreviewItem.style.display = "block";
    FocusedBlah = who.blah;
    CurrentBlahId = who.blah.I;
    PopulateBlahPreview(who.blah);
    var winHeight = $(window).height();
    var staticHeight = $("#BlahPreviewHeadline").height() + 250;
    var maxHeight = (winHeight - staticHeight);
    $("#BlahPreviewScrollContainer").css({ 'max-height': maxHeight + 'px'});
    BlahPreviewItem.style.display = "none";
    $(BlahPreviewItem).fadeIn("fast");
    BlahPreviewTimeout = setTimeout(TimeOutBlahFocus, 5000);

}

function PopulateBlahPreview(whichBlah) {
    $("#BlahPreviewExtra").empty();

    $("#BlahPreviewHeadline").text(whichBlah.T);

    // get the entire blah to update the rest...
    Blahgua.GetBlah(CurrentBlahId, UpdateBodyText, OnFailure);
}

function UpdateBodyText(theFullBlah) {
    CurrentBlah = theFullBlah;
    if (FocusedBlah.hasOwnProperty("K"))
        CurrentBlah.K = FocusedBlah.K;
    var headlineText = document.getElementById("BlahPreviewHeadline");
    CurrentBlahNickname = getSafeProperty(theFullBlah, "K", "a blahger");
    var nickNameStr = CurrentBlahNickname;
    var blahTypeStr = GetBlahTypeStr();
    var isOwnBlah;

    if (IsUserLoggedIn) {
        isOwnBlah = (CurrentBlah.A == CurrentUser._id);
    } else {
        isOwnBlah = false;
    }

    if (isOwnBlah) {
        nickNameStr += " (you)";
    }
    // update the comment count while we are here
    document.getElementById("PreviewOpenBlahSpan").innerHTML = getSafeProperty(theFullBlah, "O", 0);
    document.getElementById("previewComments").innerHTML = getSafeProperty(theFullBlah, "C", 0);
    document.getElementById("PreviewViewerCount").innerHTML = getSafeProperty(theFullBlah, "V", 0);
    document.getElementById("PreviewBlahNickname").innerHTML = nickNameStr + " " + blahTypeStr;



    // reformat the promote area if the user has already voted
    if (IsUserLoggedIn) {

        $("#PreviewRowVote").show();
        $("#PreviewRowSignIn").hide();

        // add a view
        Blahgua.AddBlahViewsOpens(theFullBlah._id, 1, 0, null, OnFailure);
    } else {
        $("#PreviewRowVote").hide();
        $("#PreviewRowSignIn").show();
        Blahgua.AddBlahViewsOpens(theFullBlah._id, 1, 0, null, OnFailure);
    }

    UpdatePreviewVoteBtns();


    // image
    var image = GetBlahImage(CurrentBlah, "B");
    var imageEl = document.getElementById("blahPreviewImage");
    if (image == "") {
        imageEl.style.display = "none";
        headlineText.style.fontSize = "36px";
    } else {
        imageEl.style.display = "block";
        imageEl.src = image;
        headlineText.style.fontSize = "36px";
    }


    var bodyTextDiv = document.getElementById("BlahPreviewBody");
    if (theFullBlah.hasOwnProperty("F")) {
        var bodyText = theFullBlah.F;

        if (bodyText && (bodyText != "")) {
            bodyText = UnCodifyText(bodyText);
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

function SetBlahPreviewVote(theVote) {
    if (!window.event.srcElement.disabled) {
        Blahgua.SetBlahVote(CurrentBlah._id, theVote, function(json) {
            var oldVote;
            CurrentBlah["uv"] = theVote;
            if (theVote == 1) {
                oldVote = getSafeProperty(CurrentBlah, "P", 0);
                oldVote++;
                CurrentBlah["P"] = oldVote;
            } else {
                oldVote = getSafeProperty(CurrentBlah, "D", 0);
                oldVote++;
                CurrentBlah["D"] = oldVote;
            }
            UpdatePreviewVoteBtns();

        }, OnFailure);
    }
}


function UpdatePreviewVoteBtns() {
    document.getElementById("PreviewUserPromoteSpan").innerHTML = getSafeProperty(CurrentBlah, "P", 0);
    document.getElementById("PreviewUserDemoteSpan").innerHTML = getSafeProperty(CurrentBlah, "D", 0);
    var promoBtn =  document.getElementById("PreviewPromoteBlah");
    var demoBtn = document.getElementById("PreviewDemoteBlah");

    if (IsUserLoggedIn) {
        if (CurrentBlah.A == CurrentUser._id) {
            // own blah - can't vote
            promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_disabled.png";
            promoBtn.disabled = true;
            demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_disabled.png";
            demoBtn.disabled = true;
        } else {
            // not own blah - can vote.  Did they?
            var userVote = getSafeProperty(CurrentBlah, "uv", 0);
            if (userVote && (userVote != 0)) {
                demoBtn.disabled = true;
                promoBtn.disabled = true;
                if (userVote == 1) {
                    promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_checked.png";
                    demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_disabled.png";
                } else {
                    promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_disabled.png";
                    demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_checked.png";
                }
            } else {
                // user can vote
                promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote.png";
                promoBtn.disabled = false;
                demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote.png";
                demoBtn.disabled =false;
            }
        }
    } else {
        // not logged in - can't vote
        promoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_promote_disabled.png";
        promoBtn.disabled = true;
        demoBtn.src = "http://blahgua-webapp.s3.amazonaws.com/img/black_demote_disabled.png";
        demoBtn.disabled = true;
    }
}


function UpdateAskPreviewPage() {
    // for now just use the full blah routine...
    UpdateAskPage("PollAnswersAreaPreview");
}

function UpdatePredictPreviewPage() {
    // update the prediction divs
    var expDateVal = getSafeProperty(CurrentBlah, "E", Date.now());
    var expDate = new Date(expDateVal);
    var elapStr = ElapsedTimeString(expDate);
    var isPast = (expDate < new Date(Date.now()));

    if (isPast) {
        $("#previewElapsedTimeText").text("should have happened ");
        $("#previewPredictVotePrompt").text("Did it happen?");
        $("#PreviewPredictVoteTable").hide();
        $("#PreviewExpPredictVoteTable").show();
    } else {
        $("#previewElapsedTimeText").text("happening within ");
        $("#previewPredictVotePrompt").text("Do you agree?");
        $("#PreviewPredictVoteTable").show();
        $("#PreviewExpPredictVoteTable").hide();
    }

    $("#elapsedTimePreview").text(elapStr);
    $("#predictionDatePreview").text(expDate.toLocaleDateString());

    // update the bars
    var yesVotes = getSafeProperty(CurrentBlah, "4", 0);
    var noVotes = getSafeProperty(CurrentBlah, "5", 0);
    var maybeVotes = getSafeProperty(CurrentBlah, "6", 0);
    var totalVotes = Math.max(yesVotes, noVotes,maybeVotes);
    var yesRatio = 0;
    var noRatio = 0;
    var maybeRatio = 0;

    if (totalVotes > 0) {
        yesRatio = Math.floor((yesVotes / totalVotes) * 100);
        noRatio = Math.floor((noVotes / totalVotes) * 100);
        maybeRatio = Math.floor((maybeVotes / totalVotes) * 100);
    }
    $("#PredictPreviewYesSpan").animate({'width': yesRatio + "%"}, 250);
    document.getElementById("PredictPreviewYesSpan").style.width = yesRatio + "%";
    document.getElementById("PredictPreviewNoSpan").style.width = noRatio + "%";
    document.getElementById("PredictPreviewMaybeSpan").style.width = maybeRatio + "%";

    // expired ui
    yesVotes = getSafeProperty(CurrentBlah, "1", 0);
    noVotes = getSafeProperty(CurrentBlah, "2", 0);
    maybeVotes = getSafeProperty(CurrentBlah, "3", 0);
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
                var userVote = getSafeProperty(json, "D", null);
                var expVote = getSafeProperty(json, "Z", null);
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
    document.getElementById("blahPreviewImage").src = "";
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
    //$(textDiv).text(unescape(theBlah.T));
    $(textDiv).text(theBlah.T);
    switch (theBlah.displaySize) {
        case 1:
            blahImageSize = "C";
            $(textDiv).addClass("LargeBlahFormat");
            break;
        case 2:
            blahImageSize = "B";
            $(textDiv).addClass("MediumBlahFormat");
            break;
        default:
            blahImageSize = "A";
            $(textDiv).addClass("SmallBlahFormat");
            break;
    }


    var imagePath = GetBlahImage(theBlah, blahImageSize);
    if (imagePath != "") {
        newDiv.style.backgroundImage = "url('" + imagePath + "')";

        if (theBlah.displaySize != 3) {
            $(textDiv).addClass("BlahAltTextDiv");
        }
        else {
            $(textDiv).addClass("BlahExpandTextDiv");
            $(textDiv).fadeOut(1000);
        }

        switch (theBlah.Y) {
            case kBlahTypeSays:
                $(textDiv).addClass("BlahTypeSaysImgText");
                break;
            case kBlahTypeLeaks:
                $(textDiv).addClass("BlahTypeLeaksImgText");
                break;
            case kBlahTypePolls:
                $(textDiv).addClass("BlahTypePollsImgText");
                break;
            case kBlahTypePredicts:
                $(textDiv).addClass("BlahTypePredictsImgText");
                break;
            case kBlahTypeAd:
                $(textDiv).addClass("BlahTypeAddImgText");
                break;
            default:
                break;
        }
    }

    return newDiv;

}

function GetBlahImage(theBlah, size) {
    var imagePathName = "";
    if (theBlah.hasOwnProperty("M")) {
        // fetch the correct image size
        var hostName = "blahguaimages.s3-website-us-west-2.amazonaws.com/image/";
        var imageName = theBlah.M[0];
        imagePathName = "http://" + hostName + imageName + "-" + size + ".jpg";
    }


    return imagePathName;

}

function CreateElementForBlah(theBlah) {
    var newEl = CreateBaseDiv(theBlah);
    var paddingOffset = 0;//8 * 2;

    if (theBlah.displaySize == 1) {
        newEl.style.width = LargeTileWidth - paddingOffset + "px";
        newEl.style.height = LargeTileHeight - paddingOffset + "px";

    } else if (theBlah.displaySize == 2) {
        newEl.style.width = MediumTileWidth - paddingOffset + "px";
        newEl.style.height = MediumTileHeight - paddingOffset + "px";
    } else {
        newEl.style.width = SmallTileWidth - paddingOffset + "px";
        newEl.style.height = SmallTileHeight - paddingOffset + "px";
    }

    switch (theBlah.Y) {
        case kBlahTypeSays:
            $(newEl).addClass("BlahTypeSays");
            break;
        case kBlahTypeLeaks:
            $(newEl).addClass("BlahTypeLeaks");
            break;
        case kBlahTypePolls:
            $(newEl).addClass("BlahTypePolls");
            break;
        case kBlahTypePredicts:
            $(newEl).addClass("BlahTypePredicts");
            break;
        case kBlahTypeAd:
            $(newEl).addClass("BlahTypeAd");
            break;
    }

    if (CurrentUser && (theBlah.A == CurrentUser._id))
        $(newEl).addClass("users-own-blah");

    return newEl;
}

function DrawInitialBlahs() {
    if (ActiveBlahList.length > 0) {
        var curRow = BuildNextRow();
        $("#BlahContainer").append(curRow);
        ResizeRowText(curRow);
        TopRow = curRow;
        var curTop = curRow.rowHeight + interBlahGutter;
        var bottom = $("#BlahContainer").height();
        var lastRow = curRow;
        RowsOnScreen = 1;

        while (curTop <= bottom) {
            curRow = BuildNextRow();
            curRow.style.top = curTop + "px";
            $("#BlahContainer").append(curRow);
            ResizeRowText(curRow);
            curTop += curRow.rowHeight + interBlahGutter;
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
        var newHTML = "<b>" + CurrentChannel.N + "</b> currently has no blahs in it.</br> ";

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
    nextRow.style.top = ($("#BlahContainer").height() + $("#BlahContainer").scrollTop() + interBlahGutter) + "px";
    $("#BlahContainer").append(nextRow);
    ResizeRowText(nextRow);
    RowsOnScreen++;
    // to do - add blah specific animation
    StartBlahsMoving();

}

function ResizeRowText(newRow) {
    //return;
    var curTile;
    var textHeight;
    var fontSize;
    var maxFontSize = 96;
    var scaleText = false;
    var minFontSize = 18;

    for (var i = 0; i < newRow.childNodes.length; i++) {
        fontSize = 9;
        curTile = newRow.childNodes[i];
        var tileHeight = curTile.offsetHeight - 8; // allow for padding...
        var tileWidth = curTile.offsetWidth - 8;
        scaleText = (curTile.style.backgroundImage != "") && (curTile.blah.displaySize != 3);
        if (scaleText) {
            tileHeight /= 2;
        }
        textHeight = curTile.blahTextDiv.offsetHeight;
        while ((textHeight < tileHeight) && (fontSize < maxFontSize)) {
            fontSize++;
            curTile.blahTextDiv.style.fontSize = fontSize + "px";
            textHeight = curTile.blahTextDiv.offsetHeight;
        }
        fontSize--;
        curTile.blahTextDiv.style.fontSize = fontSize + "px";

        curTile.blahTextDiv.scrollLeft++;

        while((curTile.blahTextDiv.scrollLeft > 0) && (fontSize > minFontSize)) {
            curTile.blahTextDiv.scrollLeft = 0;
            fontSize--;
            curTile.blahTextDiv.style.fontSize = fontSize + "px";
            curTile.blahTextDiv.scrollLeft++;
        }

        if (scaleText) {
            var offset = tileHeight + (tileHeight - curTile.blahTextDiv.offsetHeight);
            curTile.blahTextDiv.style.marginTop = offset + "px";
        }
        curTile.blahTextDiv.style.height = "100%";
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
    $("#ChannelBanner").css("background-color", kBannerHighlightColor);
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
    newBlahEl.style.left = edgeGutter + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateMMRow(theBlah, newRowEl) {
    var curLeft = edgeGutter;
    var newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(2);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += MediumTileWidth + interBlahGutter;
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateSSSSRow(theBlah, newRowEl) {
    var curLeft = edgeGutter;
    var newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += SmallTileWidth + interBlahGutter;
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += SmallTileWidth + interBlahGutter;
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += SmallTileWidth + interBlahGutter;
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateMSSRow(theBlah, newRowEl) {
    var curLeft = edgeGutter;
    var newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += (MediumTileWidth + interBlahGutter);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newBlahEl.style.top = (SmallTileHeight + interBlahGutter) + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += (SmallTileWidth + interBlahGutter);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newBlahEl.style.top = (SmallTileHeight + interBlahGutter) + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateSMSRow(theBlah, newRowEl) {
    var curLeft = edgeGutter + SmallTileWidth + interBlahGutter;
    var newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft = edgeGutter;
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.top = (SmallTileHeight + interBlahGutter) + "px";
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += (MediumTileWidth + interBlahGutter + interBlahGutter + SmallTileWidth);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newBlahEl.style.top = (SmallTileHeight + interBlahGutter) + "px";
    newRowEl.appendChild(newBlahEl);
}

function CreateSSMRow(theBlah, newRowEl) {
    var curLeft = edgeGutter + (SmallTileWidth + interBlahGutter) * 2;
    var newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft = edgeGutter;
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.top = (SmallTileHeight + interBlahGutter) + "px";
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    curLeft += (SmallTileWidth + interBlahGutter);
    newBlahEl.style.left = curLeft + "px";
    newRowEl.appendChild(newBlahEl);

    theBlah = GetNextMatchingBlah(3);
    newBlahEl = CreateElementForBlah(theBlah);
    newBlahEl.style.top = (SmallTileHeight + interBlahGutter) + "px";
    newBlahEl.style.left = curLeft + "px";
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
    // ensure 100 blahs
    if (theBlahList.length < 20) {
        var curLoc = 0;
        while (theBlahList.length < 100) {
            theBlahList.push(theBlahList[curLoc++]);
        }
    }


}

function AssignSizes(theBlahList) {
    // makes sure that there are a good ration of large, medium, small
    var largeBlahThreshold = .8;
    var mediumBlahThreshold = .3;
    // the rest are small - presumably 40, since we get 100 blahs

    for (var curIndex in theBlahList) {
        if (theBlahList[curIndex].S > kLargeBlahStrength)
            theBlahList[curIndex].displaySize = 1;
        else if (theBlahList[curIndex].S > kSmallBlahStrength)
            theBlahList[curIndex].displaySize = 2;
        else
            theBlahList[curIndex].displaySize = 3;
    }
}


// end

function PrepareBlahList(theBlahList) {
    $("#ChannelBannerLabel").html(CurrentChannel.N + " (" + theBlahList.length + ")");
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
    $('#ProgressDiv').hide();
}

function errorHandler(theArg) {
    $("#DivToShowHide").html(theArg);
    $('#ProgressDiv').hide();
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



// Create comment HTML

function createCommentElement(index, theComment) {
    var newEl = document.createElement("tr");
    newEl.className = "comment-table-row";

    var newHTML = "";
    var blahgerName = "a blahger";
    var authorDesc = "an anonymous blahger";

    if (theComment.hasOwnProperty("K")) {
        blahgerName = theComment.K;
    }

    var isOwnComment = false;
    if (theComment.A == CurrentUser._id) {
        isOwnComment = true;
        blahgerName += " (you)"
    }

    var isOwnBlah = false;
    if (CurrentBlah.A == CurrentUser._id) {
        isOwnBlah = true;
    }


    var ownVote = getSafeProperty(theComment, "C", 0);

    newHTML += '<td><table class="comment-item-table"">';

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
        newHTML += '<img class="comment-vote" onclick="SetCommentVote(1, \'' + index + '\'); return false;" alt="" src="' + fragmentURL + '/img/black_promote.png">';
        newHTML += getSafeProperty(theComment, "U", 0);
        newHTML += '</span> ';


        // vote down
        newHTML += '<span class="comment-vote-wrapper">';
        newHTML += '<img class="comment-vote" onclick="SetCommentVote(-1,\'' + index + '\'); return false;" alt="" src="' + fragmentURL + '/img/black_demote.png">';
        newHTML += getSafeProperty(theComment, "D", 0);
        newHTML += '</span> ';
    }
    newHTML += '</div></td>';
    newHTML += '<td><span class="comment-date">' + ElapsedTimeString(new Date(theComment.c)) + '</span></td>';
    newHTML += '</tr>'


    newHTML += '</table></td>';


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
        if (theList[curIndex].N.toLowerCase() == theName.toLowerCase()) {
            theEl = theList[curIndex];
            break;
        }
    }


    return theEl;
}

function GetChannelNameFromID(channelID) {
    var theName = "";
    for (curIndex in ChannelList) {
        if (ChannelList[curIndex]._id == channelID) {
            theName = ChannelList[curIndex].N;
            break;
        }
    }

    return theName;
}

function GetUserChannels() {
    if (IsUserLoggedIn) {
        Blahgua.GetUserChannels(GetChannelsOK, OnFailure);
    } else {
        Blahgua.GetFeaturedChannels(function (channelList) {
                var defChannel = getQueryVariable('channel');
                if (defChannel != null) {
                    var theChannel = GetChannelByName(defChannel, channelList);
                    if (theChannel != null)
                        channelList.push(theChannel);
                }


                GetChannelsOK(channelList);
            },
            OnFailure);
    }
}


function GetChannelsOK(theChannels) {
    ChannelList = theChannels;

    if (theChannels.length == 0) {
        AddDefaultChannelsToNewUser();
    } else {
        // fetch URL parameter Channel
        var defChannel = getQueryVariable('channel');
        if (defChannel != null) {
            for (curIndex in ChannelList) {
                if (ChannelList[curIndex].N.toLowerCase() == defChannel.toLowerCase())
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
                        if (allChannels[curIndex].N.toLowerCase() == defChannel.toLowerCase())
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
            } else {
                // for some reason the channel is not available..
                // TO DO: show a warning
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
        newHTML += createChannelHTML(index, element.N);
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
    $("#ChannelBanner").css("background-color", kBannerHighlightColor);
    GetUserBlahs();

}

function SetCurrentChannel(whichChannel) {
    $("#ChannelBanner").css("background-color", kBannerHighlightColor);
    StopAnimation();
    CurrentChannel = ChannelList[whichChannel];
    Blahgua.currentChannel = CurrentChannel._id;
    var labelDiv = document.getElementById("ChannelBannerLabel");
    labelDiv.innerHTML = CurrentChannel.N;
    var imageURL = "url('" + fragmentURL + "/images/groups/bkgnds/";
    imageURL += CurrentChannel.N + ".jpg')";
    document.getElementById("BlahContainer").style.backgroundImage = imageURL;
    GetUserBlahs();
    UpdateChannelViewers();
}

function GetNextBlahList() {
    Blahgua.GetNextBlahs(OnGetNextBlahsOK, OnFailure);
}

function OnGetNextBlahsOK(theResult) {
    NextBlahList = theResult;
    PrepareBlahList(NextBlahList);
    $("#ChannelBanner").animate({"background-color": kBannerColor }, 'slow');

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
                PopulateUserChannel("Profile");
            }, OnFailure);
        }
        else {
            PopulateUserChannel("Profile");
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


function PopulateUserChannel(whichPage) {
    $("#BlahFullItem").load(fragmentURL + "/pages/SelfPage.html #UserChannelDiv", function() {
        var windowHeight = $(window).height();
        $(BlahFullItem).disableSelection();
        $(BlahFullItem).fadeIn("fast", function() {
            var windowWidth = $(window).width();
            var delta = Math.round((windowWidth - 512) / 2);
            if (delta < 0) delta = 0;
            delta = delta + "px";
            SetSelfDetailPage(whichPage);
        });

    });
}

function RefreshUserChannelContent() {
    $("#BlahFullItem").show();
    Blahgua.GetUserProfile(CurrentUser._id, OnGetOwnProfileOK, OnGetOwnProfileFailed);
}

function OnGetOwnProfileFailed(theErr) {
    if (theErr.status == 404) {
        // profile doesn't exist - add one!
        UserProfile = new Object();
        UserProfile["A"] = "a blahger";
        Blahgua.CreateUserProfile(UserProfile, OnGetOwnProfileOK, OnFailure);
    }
}


function OnGetOwnProfileOK(theStats) {
    UserProfile = theStats;
    $("#userName").val(CurrentUser.N);
    var nickName = getSafeProperty(theStats, "A", "A Blahger");
    $("#NicknameInput").val(nickName);
    $("#FullBlahNickName").text(nickName);
    Blahgua.getUserDescriptorString(CurrentUser._id, function(theString) {
        $("#DescriptionSpan").text(theString.d);
    });

    // location
    $("#CityInput").val(getSafeProperty(theStats, "G", ""));
    $("#StateInput").val(getSafeProperty(theStats, "H", ""));
    $("#ZipcodeInput").val(getSafeProperty(theStats, "I", ""));

    // populate country codes
    var newEl;
    $.each(ProfileSchema.J.DT, function(index, item){
        newEl = document.createElement("option");
        newEl.value = index;
        newEl.innerHTML = item;
        if (index == getSafeProperty(theStats, "J", -1))
            newEl.selected = "selected";
        $("#CountryInput").append(newEl);
    });

    // demographics
    $("#DOBInput").val(getSafeProperty(theStats, "C", ""));

    $.each(ProfileSchema.B.DT, function(index, item){
        newEl = document.createElement("option");
        newEl.value = index;
        newEl.innerHTML = item;
        if (index == getSafeProperty(theStats, "B", -1))
            newEl.selected = "selected";
        $("#GenderInput").append(newEl);
    });
    $.each(ProfileSchema.D.DT, function(index, item){
        newEl = document.createElement("option");
        newEl.value = index;
        newEl.innerHTML = item;
        if (index == getSafeProperty(theStats, "D", -1))
            newEl.selected = "selected";
        $("#EthnicityInput").append(newEl);
    });
    $.each(ProfileSchema.E.DT, function(index, item){
        newEl = document.createElement("option");
        newEl.value = index;
        newEl.innerHTML = item;
        if (index == getSafeProperty(theStats, "E", -1))
            newEl.selected = "selected";
        $("#IncomeInput").append(newEl);
    });

    // permissions
    $('input[name=nickname]').val([getSafeProperty(theStats, "0", 0)]);

    $('input[name=city]').val([getSafeProperty(theStats, "6", 0)]);
    $('input[name=state]').val([getSafeProperty(theStats, "7", 0)]);
    $('input[name=zipcode]').val([getSafeProperty(theStats, "8", 0)]);
    $('input[name=country]').val([getSafeProperty(theStats, "9", 0)]);

    $('input[name=age]').val([getSafeProperty(theStats, "2", 0)]);
    $('input[name=income]').val([getSafeProperty(theStats, "4", 0)]);
    $('input[name=gender]').val([getSafeProperty(theStats, "1", 0)]);
    $('input[name=race]').val([getSafeProperty(theStats, "3", 0)]);

    // badges
    UpdateBadgeArea();
    ShowBadgeSelection();
    $("#SaveProfileBtn").attr("disabled", "disabled");
    $('input').change(MaybeEnableProfileSaveBtn);
    $('select').change(MaybeEnableProfileSaveBtn);


    // headers

    $('.accordion h2').click(function(theEvent) {
        $(".accordion-content").hide();
        $(this.parentElement).find(".accordion-content").show() ;


    });
}

function MaybeEnableProfileSaveBtn() {
    var validated = true;
    if(validated) $("#SaveProfileBtn").removeAttr("disabled");
}

function HandlePermAll() {
    var setAllTo = Number($('input:radio[name=all]:checked').val());
    $('input:radio').val([setAllTo]);
}

function ShowBadgeSelection() {
    Blahgua.getAuthorities(function (authList) {
        var newHTML = "<table><tbody>";
        $.each(authList, function(index, curAuth) {
            newHTML += CreateBadgeAuthHTML(curAuth);
        });
        newHTML += "</tbody></table>";
        $("#BadgeAuthorityArea").html(newHTML);
    }, OnFailure);
}

function CreateBadgeAuthHTML(theAuth) {
    var newHTML = "<tr>";
    newHTML += "<td><span>" + theAuth.N + "</span></td>";
    newHTML += "<td><span>" + theAuth.D + "</span></td>";
    newHTML += "<td><button onclick='DoAddBadge(\"" + theAuth._id + "\"); return false;'>Add</button></td>";
    newHTML += "</tr>";

    return newHTML;
}

function UpdateBadgeArea() {
    if (CurrentUser.hasOwnProperty("B")) {
        // add badges
        $("#BadgesDiv").empty();
        $.each(CurrentUser.B, function(index, curBadge) {
            CreateAndAppendBadgeHTML(curBadge);
        });
    } else {
        $("#BadgesDiv").html("<tr><td>You don't have no stinkin' badges!</tr></td>");
    }
}

function CreateAndAppendBadgeHTML(theBadge) {
    Blahgua.getBadgeById(theBadge, function(fullBadge) {
        var newHTML = "";
        var imagePath = "http://blahgua-webapp.s3.amazonaws.com/img/generic-badge.png";
        newHTML += "<tr><td><div class='badgeholder'>";
        newHTML += "<div class='badgename'>";
        if (fullBadge.hasOwnProperty("K")) {
            imagePath = fullBadge.K;
        }
        newHTML += "<img class='badgeimage' src='" + imagePath + "'>";
        newHTML += fullBadge.N + "</div>";
        newHTML += "<div class='badgesource'>granted by: " + fullBadge.A + "</div>"
        newHTML += "<div class='badgeexp'>expires: " + (new Date(fullBadge.X)).toLocaleString() + "</div>"
        newHTML += "</div></td>";

        newHTML += "</tr>";
        $("#BadgesDiv").append(newHTML);
    }, function (theErr) {
        var newHTML = "";
        newHTML += "<tr><td><div>Error loading Badge id=" + theBadge + "</div></td></tr>";
        $("#BadgesDiv").append(newHTML);
    });
}

function DoAddBadge(badgeID) {
    Blahgua.createBadgeForUser(badgeID, null, function(data) {
        var dialogHTML = data;
        var windowWidth = $(window).width();
        var offset = (windowWidth - 512) / 2;
        if (offset < 0)
            offset = 0;
        $("#BadgeOverlay").css({"left": offset + "px", "right": offset + "px"});
        $(".BadgeTitleBar").text("talking to " + badgeID);
        $("#badgedialog").html(dialogHTML);
        $("#BadgeOverlay").fadeIn();
        window.ba_dialog_closed = HandleBadgeDismiss;

    }, OnFailure);
}

function HandleBadgeDismiss(theMsg) {
    $("#BadgeOverlay").fadeOut( 150, function () {
        $("#badgedialog").empty();
        // refresh the badges for the user
        Blahgua.getUserInfo(function (json) {
            CurrentUser = json;
            UpdateBadgeArea();
        });

    } );
}

function UpdateUserProfile() {
    UserProfile["A"] = $("#NicknameInput").val();

    // location
    UserProfile["G"] = $("#CityInput").val();
    UserProfile["H"] = $("#StateInput").val();
    UserProfile["I"] = $("#ZipcodeInput").val();
    UserProfile["J"] = $("#CountryInput").val();

    // demographics
    UserProfile["C"] = $("#DOBInput").val();
    UserProfile["E"] = $("#IncomeInput").val();
    UserProfile["B"] = $("#GenderInput").val();
    UserProfile["D"] = $("#EthnicityInput").val();

    // permissions
    UserProfile["0"] = Number($('input:radio[name=nickname]:checked').val());
    UserProfile["6"] = Number($('input:radio[name=city]:checked').val());
    UserProfile["7"] = Number($('input:radio[name=state]:checked').val());
    UserProfile["8"] = Number($('input:radio[name=zipcode]:checked').val());
    UserProfile["9"] = Number($('input:radio[name=country]:checked').val());
    UserProfile["2"] = Number($('input:radio[name=age]:checked').val());
    UserProfile["4"] = Number($('input:radio[name=income]:checked').val());
    UserProfile["1"] = Number($('input:radio[name=gender]:checked').val());
    UserProfile["3"] = Number($('input:radio[name=race]:checked').val());

    // commit
    Blahgua.UpdateUserProfile(UserProfile, function(theBlah) {
        document.getElementById("SaveProfileBtn").disabled = true;
        Blahgua.getUserDescriptorString(CurrentUser._id, function(theString) {
            $("#DescriptionSpan").text(theString.d);
        }, function(theErr) {
            $("#DescriptionSpan").text("an anonymous blahger");
        });
    });

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
    var userName = $("#userName").val();
    var pwd = $("#pwd").val();
    if ($('#rememberme2').is(':checked')) {
        $.cookie("userId", userName, { expires: 30, path: '/'});
        $.cookie("password", pwd, { expires: 30, path: '/'});
        $.removeCookie('isTemp');
    } else {
        $.removeCookie("userId");
        $.removeCookie("password");
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
    Blahgua.GetProfileSchema(function(theSchema) {
        ProfileSchema = theSchema.fieldNameToSpecMap;
    }, OnFailure) ;
    var userName = $("#userName2").val();
    var pwd = $("#pwd2").val();
    if ($('#rememberme2').is(':checked')) {
        $.cookie("userId", userName, { expires: 30, path: '/'});
        $.cookie("password", pwd, { expires: 30, path: '/'});
        $.removeCookie('isTemp');
    } else {
        $.removeCookie("userId");
        $.removeCookie("password");
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
    Blahgua.GetViewersOfChannel(CurrentChannel._id, OnChannelViewersOK);

    ViewerUpdateTimer = setTimeout(UpdateChannelViewers, 15000);
}

function getProp(obj, propName, defVal) {
    if (obj.hasOwnProperty(propName) && (obj[propName] != null)) {
        return obj[propName];
    } else {
        return defVal;
    }
}

function OnChannelViewersOK(numViewers) {
    $("#ChannelViewersCountText").html(getProp(numViewers, "V", 0));

}

function DoCreateBlah() {
    StopAnimation();
    if (IsUserLoggedIn) {
        $(BlahFullItem).load(fragmentURL + "/pages/CreateBlahPage.html", function() {
            PopulateBlahTypeOptions();
            $("#CreateBlahNicknameDiv").text(getSafeProperty(CurrentUser, "N", "a blahger" ));
            CheckPublishBtnDisable();
            $(BlahFullItem).fadeIn("fast");
        });
    } else {
        SuggestUserSignIn("you must sign in before you can create a new blah")
    }
}

function UpdateBlahTypes() {
    Blahgua.GetBlahTypes(function (json) {
        BlahTypeList = json;
        kBlahTypeLeaks = GetBlahTypeId("leaks");
        kBlahTypePolls = GetBlahTypeId("polls");
        kBlahTypePredicts = GetBlahTypeId("predicts");
        kBlahTypeSays = GetBlahTypeId("says");
        kBlahTypeAd = GetBlahTypeId("ad");
        kBlahTypeAsks = GetBlahTypeId("asks");
    });
}


function PopulateBlahTypeOptions() {
    var curHTML = "";
    var blahOrder = ["says", "leaks", "asks", "predicts", "polls"];
    for (var curItem in blahOrder) {
        curHTML += '<OPTION value="' + GetBlahTypeId(blahOrder[curItem]) + '"';
        if (blahOrder[curItem] == "says")
            curHTML += ' selected="selected" ';
        curHTML += ' >';
        curHTML +=blahOrder[curItem];
        curHTML += '</OPTION>';
    }
    $("#BlahTypeList").html(curHTML);
}

function HandleHeadlineTextInput(target) {
    if(target.scrollHeight > target.clientHeight)
        target.style.height=target.scrollHeight+'px';
    var numCharsRemaining = MaxTitleLength - target.value.length;
    if (numCharsRemaining < 32) {
        $("#HeadlineCharCount").text(numCharsRemaining + " chars left");
    } else {
        $("#HeadlineCharCount").text("");
    }

    CheckPublishBtnDisable();


}

function CheckPublishBtnDisable() {
    var minHeadlineLen = 3;
    var headLineLen = document.getElementById("BlahHeadline").value.length;
    var bodyLen = document.getElementById("BlahBody").value.length;
    if ($("#BlahImage").val() != "")
        minHeadlineLen = 0;
    if ((headLineLen < minHeadlineLen) || (headLineLen > MaxTitleLength) || (bodyLen > 4000))
        document.getElementById("PublishBlahBtn").disabled = true;
    else
        document.getElementById("PublishBlahBtn").disabled = false;
}

function HandleBodyTextInput(target) {
    if(target.scrollHeight > target.clientHeight)
        target.style.height=target.scrollHeight+'px';
    var numCharsRemaining = 4000 - target.value.length;
    if (numCharsRemaining < 100) {
        $("#BodyCharCount").text(numCharsRemaining + " chars left");
    } else {
        $("#BodyCharCount").text("");
    }
    CheckPublishBtnDisable();

}

function CancelCreate() { 3
    CloseBlah();
}


function CodifyText(theText) {
    var regX = /\r\n|\r|\n/g;
    var replaceString = newlineToken;
    return theText.replace(regX, replaceString);
}

function UnCodifyText(theText) {
    var regX = new RegExp("\\" + newlineToken,"g");
    var replaceString = "<br />";
    return theText.replace(regX, replaceString);
}

function CreateBlah() {
    // disable create button to prevent double-submit
    document.getElementById("PublishBlahBtn").disabled = true;
    var blahType = $("#BlahTypeList").val();

    var blahHeadline = $("#BlahHeadline").val();
    var blahBody = $("#BlahBody").val();
    blahBody = CodifyText(blahBody);
    var blahGroup = CurrentChannel._id;
    var options = null;


    // check for additional options
    var blahTypeStr = GetBlahTypeNameFromId(blahType);
    switch (blahTypeStr) {

        case "predicts":
            // update the prediction on create
            options = new Object();
            var theDateStr = $("#PredictionEndDateInput").val();
            var theTimeStr = $("#PredictionEndTimeInput").val();
            var theDate = new Date(theDateStr + " " + theTimeStr);
            options["E"] = theDate;
            break;
        default:
            break;

        case "polls":
            // add the poll items
            var pollItems = [];
            var curPollItem;
            var pollDivs = document.getElementsByName("PollItem");
            for (i = 0; i < pollDivs.length; i++) {
                curPollItem = new Object();
                curPollItem["G"] = pollDivs[i].childNodes[0].value;
                curPollItem["T"] = pollDivs[i].childNodes[2].value;
                pollItems.push(curPollItem);
            }
            options = new Object();
            options["I"] = pollItems;
            break;
    }

    Blahgua.CreateUserBlah(blahHeadline, blahType, blahGroup, blahBody, options, OnCreateBlahOK, OnFailure);
}





function OnCreateBlahOK(json) {
    CurrentBlah = json;
    CurrentBlahId = CurrentBlah._id;
    // check for images
    if ($("#BlahImage").val() != "") {
        UploadBlahImage(CurrentBlah._id);
    } else {
        //todo: insert the blah into the channel
        InsertNewBlahIntoChannel(CurrentBlah);
        DoCloseBlah(null);

        /*
        var EndDate = new Date(Date.now());
        var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
        var startStr = createDateString(StartDate);
        var endStr = createDateString(EndDate);

        Blahgua.GetBlahWithStats(CurrentBlahId,  startStr, endStr, function(theBlah) {
            CurrentBlah = theBlah;
            BlahReturnPage = "BlahRoll";
            OpenBlah(CurrentBlah);
            RefreshCurrentChannel();
        })
        */;
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
    InsertNewBlahIntoChannel(CurrentBlah);
    DoCloseBlah(null);
    /*
    var EndDate = new Date(Date.now());
    var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
    var startStr = createDateString(StartDate);
    var endStr = createDateString(EndDate);

    Blahgua.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
        CurrentBlah = theBlah;
        BlahReturnPage = "BlahRoll";
        OpenBlah(CurrentBlah);
        RefreshCurrentChannel();
    });
    */
}

function InsertNewBlahIntoChannel(theBlah) {
    // todo:  create a fake inbox item for this blah
    // and insert it into the blah list...
    var newItem = new Object();
    newItem["N"] = theBlah.N;
}


function UpdateBlahInfoArea() {
    var blahTypeStr = GetBlahTypeNameFromId($("#BlahTypeList").val());
    switch (blahTypeStr) {
        case "predicts":
            $("#AdditionalInfoDiv").load(fragmentURL + "/pages/BlahTypePredictAuthorPage.html #BlahTypePredictAuthorPage",
                function() { UpdatePredictAuthorPage(); })
            break;
        case "polls":
            $("#AdditionalInfoDiv").load(fragmentURL + "/pages/BlahTypeAskAuthorPage.html #BlahTypeAskAuthorPage",
                function() { UpdateAskAuthorPage(); })
            break;
        default:
            $("#AdditionalInfoDiv").empty();
    }
}

function HandleFilePreview() {
    var theFile = $("#BlahImage").val();
    $("#CreateBlahImageNameSpan").text(theFile);
    if (theFile != "") {
        $(".uploadimage").css({"background-image": theFile});

    }
    CheckPublishBtnDisable();


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
    newHTML += "<a class='channelBrowserGroupItem'>" + channelType.N + "</a>";
    newHTML += "</li>"
    return newHTML;
}

function GenerateHTMLForChannelBrowser(curChannel) {
    var newHTML = "";
    newHTML += "<li class='channelBrowserChannelItem' channelId='" + curChannel._id + "' onclick='DoOpenChannelPage(); return false;'><a >";

    newHTML += '<img class="channelimage" src="' + fragmentURL + '/images/groups/' + curChannel.N + '.png"';
    newHTML += 'onerror="imgError(this);">';
    newHTML += curChannel.N;
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
        document.getElementById(newChannelList[0].Y).innerHTML += newHTML;
    } else {
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

function PopulateChannelDetailPage(channelId) {
    Blahgua.GetChannelInfo(channelId, function(theChannel) {
        document.getElementById("ChannelDetailPage").setAttribute("channelObj", channelId);
        $("#ChannelTitleDiv").text(theChannel.N);
        $("#ChannelDescriptionArea").text(getSafeProperty(theChannel, "D", "a channel"));
        RefreshChannelDetailPage(theChannel._id);
    })
}

function RefreshChannelDetailPage(theChannelId) {
    if (UserIsOnChannel(theChannelId)) {
        $("#JoinChannelBtn").hide();
        $("#LeaveChannelBtn").show();
    } else {
        $("#JoinChannelBtn").show();
        $("#LeaveChannelBtn").hide();
    }
}

function UserIsOnChannel(channelId) {
    for (curIndex in ChannelList) {
        if (ChannelList[curIndex]._id == channelId)
            return true;
    }

    return false;
}

function DoJoinChannel() {
    var channelId = document.getElementById("ChannelDetailPage").getAttribute("channelObj");
    Blahgua.JoinUserToChannel(channelId, function() {
        Blahgua.GetUserChannels(function(theList) {
            ChannelList = theList;
            RefreshChannelDetailPage();
        });
    });
}

function DoLeaveChannel() {
    var channelId = document.getElementById("ChannelDetailPage").getAttribute("channelObj");
    Blahgua.RemoveUserFromChannel(channelId, function() {
        Blahgua.GetUserChannels(function(theList) {
            ChannelList = theList;
            RefreshChannelDetailPage();
        });
    });
}

function DoChannelBrowserReturn() {
    $(BlahFullItem).load(fragmentURL + "/pages/ChannelBrowser.html #ChannelBrowserDiv", function() {
        PopulateChannelBrowser();
        $(BlahFullItem).fadeIn("fast");
    });
}

function IsUsersOwnBlah() {
    return (CurrentUser._id == CurrentBlah.A);
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

    } else {
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

    } else {
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



function SignInToComment() {
    SuggestUserSignIn("Sign in to comment on a blah!");
}

function DoAddComment() {
    //var commentText = escape($("#CommentTextArea").val());
    var commentText = $("#CommentTextArea").val();
    Blahgua.AddBlahComment(commentText, CurrentBlah._id, function (newComment) {
        $("#CommentTextArea").val("");
        if (CurrentBlah.hasOwnProperty("C")) {
            CurrentBlah.C++;
        } else {
            CurrentBlah["C"] = 1;
        }
        UpdateBlahComments();
    }, OnFailure);
}

function SetCommentVote (vote, commentIndex) {
    var theID = CurrentComments[commentIndex]._id;
    var targetDiv = $(event.target).parents('tr')[1];
    Blahgua.SetCommentVote(theID, vote, function(json) {
        if (vote == 1)
            CurrentComments[commentIndex]["U"] = getSafeProperty(CurrentComments[commentIndex], "U", 0) + 1;
        else
            CurrentComments[commentIndex]["D"] = getSafeProperty(CurrentComments[commentIndex], "D", 0) + 1;

        CurrentComments[commentIndex]["C"] = vote;
        var newEl = createCommentElement(commentIndex, CurrentComments[commentIndex]);
        targetDiv.innerHTML = newEl.innerHTML;
    }, OnFailure);
}


// chart helpers
function CreateDemoData(whichDemo) {
    var curResult = [];
    var curData;
    var curIndexName;
    var o, p,c;
    if (CurrentBlah.hasOwnProperty('_d') && (ProfileSchema != null)) {newEl.innerHTML
        for(curIndex in ProfileSchema[whichDemo].DT) {
            curData = new Object();
            curIndexName = ProfileSchema[whichDemo].DT[curIndex];
            curData.name = curIndexName;
            curData.data = [];
            o = getSafeProperty(CurrentBlah._d._o[whichDemo], curIndex,0);
            p = getSafeProperty(CurrentBlah._d._u[whichDemo], curIndex,0);
            c = getSafeProperty(CurrentBlah._d._c[whichDemo], curIndex,0);
            if ((o > 0) || (p > 0) || (c > 0)) {
                curData.data.push(o);
                curData.data.push(p);
                curData.data.push(c);
                curResult.push(curData);
            }
        }
    }

    return curResult;
}

// self page

function SetSelfDetailPage(whichPage) {
    $(".BlahPageFooter .BlahButton").removeClass("BlahBtnSelected");
    switch (whichPage) {
        case "Profile":

            BlahFullItem.curPage = "Profile";
            $("#SelfPageDiv").load(fragmentURL + "/pages/SelfPageDetails.html #SelfPageDetailsDiv", function() {
                var winHeight = $(window).height();
                var curTop = document.getElementById("SelfPageDetailsDiv").clientTop;
                var dif = 80 + 70 + curTop;
                $("#SelfPageDetailsDiv").css({ 'max-height': winHeight-dif + 'px'});
                $("#SelfProfileBtn").addClass("BlahBtnSelected");
                UpdateSelfProfile();
            });
            break;
        case "History":
            BlahFullItem.curPage = "History";
            $("#SelfPageDiv").load(fragmentURL + "/pages/SelfPageHistory.html #SelfPageHistoryDiv", function() {
                $("#SelfHistoryBtn").addClass("BlahBtnSelected");
                UpdateSelfHistory();
            });
            break;
        case "Stats":
            BlahFullItem.curPage = "Stats";
            $("#SelfPageDiv").load(fragmentURL + "/pages/SelfPageStats.html #SelfPageStatsDiv", function() {
                $("#SelfStatsBtn").addClass("BlahBtnSelected");
                UpdateSelfStats();
            });
            break;
    }
}



function UpdateSelfProfile() {
    RefreshUserChannelContent();

}

function UpdateSelfHistory() {
    var blahsDiv = $("#UserBlahList");
    var commentDiv = $("#UserCommentList");
    blahsDiv.empty();
    commentDiv.empty();

    Blahgua.GetUserBlahs(function (blahList) {
        var newHTML = "";
        if (blahList.length > 0) {
            $.each(blahList, function (index, item) {
                newHTML = CreateUserBlahHTML(item);
                blahsDiv.append(newHTML);
            })
        } else {
            newHTML = "<tr><td colspan='2'>You have not created any blahs yet.</td></tr>";
            blahsDiv.append(newHTML);
        }
    }, OnFailure);
    Blahgua.GetUserComments(function(commentList) {
        var newHTML = "";
        if (commentList.length > 0) {
            $.each(commentList, function (index, item) {
                newHTML = CreateUserCommentHTML(item);
                commentDiv.append(newHTML);
            })
        } else {
            newHTML = "<tr><td colspan='2'>You have not created any comments yet.</td></tr>";
            commentDiv.append(newHTML);
        }
    }, OnFailure);
    // headers
    $('.accordion h2').click(function(theEvent) {
        $(".accordion-content").hide();
        $(this.parentElement).find(".accordion-content").show() ;

    });

}

function CreateUserBlahHTML(theBlah) {
    var newHTML = "";
    newHTML += "<tr>";
    newHTML += "<td style='width:100%'><a href='javascript:void(null)' onclick=\"";
    newHTML += "DoOpenUserBlah('" + theBlah._id + "'); return false;\">";
    newHTML += theBlah.T;
    newHTML += "</a></td>";
    newHTML += "<td>" + ElapsedTimeString(new Date(theBlah.c)) + "</td>";
    newHTML += "</tr>";
    return newHTML;
}

function CreateUserCommentHTML(theComment) {
    var newHTML = "";
    newHTML += "<tr>"
    newHTML += "<td style='width:100%'><a href='javascript:void(null)' onclick=\"";
    newHTML += "DoOpenUserComment('" + theComment.B + "'); return false;\">";
    newHTML += theComment.T;
    newHTML += "</a></td>";
    newHTML += "<td>" + ElapsedTimeString(new Date(theComment.c)) + "</td>"
    newHTML += "</tr>";
    return newHTML;
}


function DoOpenUserBlah(blahId) {
    var EndDate = new Date(Date.now());
    var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
    var startStr = createDateString(StartDate);
    var endStr = createDateString(EndDate);

    Blahgua.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
        CurrentBlah = theBlah;
        BlahReturnPage = "UserBlahList";
        OpenBlah(blahId);
    }, OnFailure);
}

function DoOpenUserComment(blahId) {
    var EndDate = new Date(Date.now());
    var StartDate = new Date(Date.now() - (numStatsDaysToShow * 24 * 3600 * 1000 ));
    var startStr = createDateString(StartDate);
    var endStr = createDateString(EndDate);

    Blahgua.GetBlahWithStats(blahId,  startStr, endStr, function(theBlah) {
        CurrentBlah = theBlah;
        BlahReturnPage = "UserBlahList";
        OpenBlah(blahId);
    }, OnFailure);
}

function createDateString(theDate, short) {
    var newString = "";
    var year = (theDate.getFullYear() - 2000).toString();
    var month = theDate.getMonth() + 1;
    if (month < 10)
        month = "0" + month.toString();
    else
        month = month.toString();
    if (short == true) {
        newString = year + month;
    } else {
        var day = theDate.getDate();
        if (day < 10)
            day = "0" + day.toString();
        else
            day = day.toString();
        newString = year + month + day;
    }
    return newString;
}

function makeDateRangeAxis(startDate, endDate) {
    var newCat = [];


    while (startDate <= endDate) {
        newStr = startDate.getMonth() + 1 + "/" + startDate.getDate();
        newCat.push(newStr);
        startDate = new Date(startDate.getTime() + (24 * 3600 * 1000));
    }

    return newCat;
}

function UpdateSelfStats() {
    // load the stats
    var endDate = new Date(Date.now());
    var startDate = new Date(Date.now() - (numStatsDaysToShow * (24 * 3600 * 1000)));

    var start = createDateString(startDate);
    var end = createDateString(endDate);
    Blahgua.GetUserStats(start, end, function(statsObj) {
        // refresh all of the stat markets and charts

        // Overall standings
        var userStrength = getSafeProperty(statsObj, 'S', 0);
        var userContro = getSafeProperty(statsObj, 'K', 0);

        $('#UserStandingDiv').highcharts({
            title: {
                text:null
            },
            legend: {
                enabled:false
            },
            credits: {
                enabled:false
            },
            xAxis: {
                categories: ['Strength', 'Controversy']
            },
            yAxis: {
                min:0,
                max:100,
                title: { text: null}
            },
            series: [{
                type: 'bar',
                data: [{color: '#FF0000', y: userStrength * 100},
                    {color: '#0000FF', y: userContro * 100}]
            }]
        });


        // Your Activity
        var viewData = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["v", "V"]);
        var openData = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, ["o", "O"]);
        var blahsMade = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "X");
        var commentsMade  = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "XX");
        var catAxis = makeDateRangeAxis(startDate, endDate);

        $('#UserActivityDiv').highcharts({
            title: {
                text:null
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            credits: {
                enabled:false
            },
            xAxis: {
                categories: catAxis
            },
            yAxis: [{
                min:0,
                title: { text: "views & opens"}
            },  {
                min:0,
                opposite: true,
                endOnTick: true,
                title: { text: "creation"}
            }],
            series: [{
                type: 'areaspline',
                data: viewData,
                name: "#blahs viewed"
            },
                {
                    type: 'areaspline',
                    data: openData,
                    name: "#blahs opened"
                } ,
                {
                    type: 'column',
                    data: blahsMade,
                    name: "#blahs",
                    yAxis: 1
                },
                {
                    type: 'column',
                    data: commentsMade,
                    name: "#comments",
                    yAxis: 1
                }]
        });

        // Your Blahs and Comments
        var otherUpVotes = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "T" );
        var otherDownVotes = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj,"DT");
        var otherViews = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "V");
        var otherOpens  = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "O");
        var otherComments  = GetDailyStatValuesForTimeRange(startDate, endDate, statsObj, "C");

        var reverseDown = [];
        for (var curIndex in otherDownVotes) {
            reverseDown.push(-otherDownVotes[curIndex]);
        }


        $('#UserBlahActivityDiv').highcharts({
            title: {
                text:"User Engagement"
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            credits: {
                enabled:false
            },
            xAxis: {
                categories: catAxis
            },
            yAxis: [{
                min:0,
                title: { text: "views & opens"}
            },  {
                min:0,
                opposite: true,
                endOnTick: true,
                title: { text: "creation"}
            }],
            series: [{
                type: 'areaspline',
                data: otherViews,
                name: "#blahs viewed"
            },
                {
                    type: 'areaspline',
                    data: otherOpens,
                    name: "#blahs opened"
                } ,
                {
                    type: 'column',
                    data: otherComments,
                    name: "#comments",
                    yAxis: 1
                }]
        });

        $('#UserBlahSentimentDiv').highcharts({
            colors: ["#00FF00", "#FF0000"],
            title: {
                text:"User Sentiment"
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                }
            },
            credits: {
                enabled:false
            },
            xAxis: {
                categories: catAxis
            },
            yAxis: [{
                title: { text: "votes"}
            }],
            series: [
                {
                    type: 'areaspline',
                    data: otherUpVotes,
                    name: "promotes"
                } ,
                {
                    type: 'areaspline',
                    data: reverseDown,
                    name: "demotes"
                }]
        });

        // Your Audience Demographics
        if (UserProfile.hasOwnProperty("B") && (UserProfile["B"] != -1))
            $("#DemoGenderChartArea").highcharts(MakeDemoChartOptions("Gender", "B"));
        else
            $("#DemoGenderChartArea").html(GenerateShareDemoHTML("Gender", "B"));

        if (UserProfile.hasOwnProperty("D") && (UserProfile["D"] != -1))
            $("#DemoEthnicityChartArea").highcharts(MakeDemoChartOptions("Ethnicity", "D"));
        else
            $("#DemoEthnicityChartArea").html(GenerateShareDemoHTML("Ethnicity", "D"));

        /*
        if (UserProfile.hasOwnProperty("C") && (UserProfile["C"] != -1))
            $("#DemoGenderChartArea").highcharts(MakeDemoChartOptions("Age", "C"));
        else
            $("#DemoGenderChartArea").html(GenerateShareDemoHTML("Age", "C"));
        */

        if (UserProfile.hasOwnProperty("J") && (UserProfile["J"] != -1))
            $("#DemoCountryChartArea").highcharts(MakeDemoChartOptions("Country", "J"));
        else
            $("#DemoCountryChartArea").html(GenerateShareDemoHTML("Country", "J"));



        // your stats


    }, function (theErr) {
        // indicate that the stats are not available
        var sorryText = "<div>Sorry, stats are not available now.</div>";
        $("#UserStandingDiv").append(sorryText);
        $("#UserActivityDiv").append(sorryText);
        $("#UserBlahActivityDiv").append(sorryText);
        $("#UserStatsTable").append("<tr><td>" + sorryText + "</td></tr>");

    });
    // headers
    $('.accordion h2').click(function(theEvent) {
        $(".accordion-content").hide();
        $(this.parentElement).find(".accordion-content").show() ;

    });
}

function GenerateShareDemoHTML(demoString, demoName) {
    var newHTML = "";

    newHTML += "<div class='request-demographic'>";
    newHTML += "You need to set your own " + demoString + " on the user profile page in order to see the " + demoString + " of other users.";
    newHTML += "</div>";
    return newHTML;
}
function MakeDemoChartOptions(demoString, demoName) {
    var demoSeries = MakeDemoSeries(demoName);
    var demoCat = MakeDemoCategories(demoName);
    var chartHeight = 125 + (25 * demoCat.length);

    var newDemos = {
        colors: ["#FF0000", "#00FF00"],
        chart: {
            type: "bar",
            height:chartHeight
        },
        title: {
            text:demoString
        },
        xAxis: {
            categories:demoCat
        },
        plotOptions: {
            series: {
                stacking: 'normal',
                marker: {
                    enabled: false
                }
            },
            bar : {
                pointPadding:0,
                groupPadding:0
            }
        },
        credits: {
            enabled:false
        },

        yAxis: [{
            title: { text: "votes"}
        }],
        series: demoSeries
    };

    return newDemos
}


function MakeDemoCategories(whichDemo) {
    var catArray = [];
    $.each(ProfileSchema[whichDemo].DT, function(index, item){
        catArray.push(item);
    });

    return catArray;
}

function MakeDemoSeries(whichDemo) {
    // one series for upVote and downVote
    // one data point for each unique value of the demo
    var newSeries;
    if (CurrentUser.hasOwnProperty("_d")) {
        var upVoteSet = getSafeProperty(CurrentUser._d._u, whichDemo, null);
        var downVoteSet = getSafeProperty(CurrentUser._d._d, whichDemo, null);
        var upData = [], downData = [];

        $.each(ProfileSchema[whichDemo].DT, function(index, item){
            upData.push(getSafeProperty(upVoteSet, index, 0));
            downData.push(-getSafeProperty(downVoteSet, index, 0));
        });

        newSeries = [
            {"data":downData,"name":"demotes"},
            {"data":upData,"name":"promotes"}];
    } else {
        newSeries = [];
    }

    return newSeries;

}


function GetDailyStatValuesForTimeRange(startTime, endTime, statsObj, statName) {
    var startMonth, startDay, newVal;
    var results = [];

    startMonth = startTime.getMonth();
    startDay = startTime.getDate();
    statName = [].concat(statName); // ensure array

    while (startTime <= endTime) {
        newVal = 0;
        for (var curStat in statName) {
         newVal += GetStatValue(statsObj, startTime, statName[curStat]);
        }

        results.push(newVal);

        startTime = new Date(startTime.getTime() + 3600 * 24 * 1000); // add one day
        startMonth = startTime.getMonth();
        startDay = startTime.getDate();
    }

    return results;
}

function GetStatValue(statsObj, date, stat) {
    var statVal = 0, item = 0;
    var statStr = createDateString(date, true);
    for (var index in statsObj.L) {
        item = statsObj.L[index];
        if (item._id.substring(item._id.length - 4) == statStr) {
            // found the month
            statVal = item.dy[date.getDate() - 1][stat];
            break;
        }
    }
    return statVal;
}


function DoAddCommentPreview() {
    BlahOpenPage = "Comments";
    OpenFocusedBlah();
}


