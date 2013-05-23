// master JavaScript File for app
define('blahgua_base',
    [
        'GlobalFunctions',
        'blahgua_restapi',
        'spin'
    ],
    function(Exports, Blahgua) {

        var rowSequence = [1,4,2,3,4,4,3];
        var curRowSequence = 0;

        var InitializeBlahgua = function() {
            if ((window.location.hostname == "") ||
                (window.location.hostname == "localhost") ||
                (window.location.hostname == "127.0.0.1")) {
                // running local
                fragmentURL = "./";
            }

            $(window).resize(function(){
                resizeTimer && clearTimeout(resizeTimer);
                resizeTimer = setTimeout(HandleWindowResize, 100);
            });

            var opts = {
                lines: 12, // The number of lines to draw
                length: 4, // The length of each line
                width: 2, // The line thickness
                radius: 2, // The radius of the inner circle
                color: '#808080', // #rbg or #rrggbb
                speed: 1, // Rounds per second
                trail: 100, // Afterglow percentage
                shadow: false // Whether to render a shadow
            };

            SpinElement = new Spinner(opts);

            SpinTarget = document.getElementById("spin-div");

            $(document).ready(function () {
                $("#BlahContainer").disableSelection();
                $("#ChannelBanner").disableSelection();
                $("#ChannelDropMenu").disableSelection();
                $("#BlahPreviewItem").disableSelection();
                $("#BlahContainer").on('swipeleft', HandleSwipeLeft);
                $("#BlahContainer").on('swiperight', HandleSwipeRight);
                $("#BlahContainer").on('swipeup', HandleSwipeUp);
                $("#BlahContainer").on('swipedown', HandleSwipeDown);
                $("#LightBox").click(DismissAll);
                SignIn();
            });
        };


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





// *****************************************************
// Sign-in


    function SignIn() {
        Blahgua.isUserLoggedIn(function(json) {
            if (json.loggedIn == "Y")
                HandlePostSignIn();
            else {
                var savedID = null;// $.cookie("userId");
                var pwd = null; //$.cookie("password");

                if (savedID != null) {
                    if (pwd == null) {
                        pwd = prompt("Welcome back. enter password:")
                    }

                    // sign in
                    Blahgua.loginUser(savedID, pwd, HandlePostSignIn, function() {
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
        })

    }

    function HandlePostSignIn() {
        IsUserLoggedIn = true;
        Blahgua.GetProfileSchema(function(theSchema) {
            ProfileSchema = theSchema.fieldNameToSpecMap;
        }, OnFailure) ;
        Blahgua.getUserInfo(function (json) {
            CurrentUser = json;
            finalizeInitialLoad();
        });
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
        var ChannelList = [].concat(channelList);

        var JoinUserToNextChannel = function(theList) {
            var curChannel = theList.pop();
            Blahgua.JoinUserToChannel(curChannel._id, function() {
                if (theList.length > 0)
                    JoinUserToNextChannel(theList);
                else
                    GetUserChannels();
            });
        };

        JoinUserToNextChannel(ChannelList);
    }

// *************************************************
// Initial Load

    function finalizeInitialLoad() {
        StartLoginTimer();
        CreateChannelBanner();
        CreatePreviewBlah();
        CreateFullBlah();
        GetUserChannels();
        UpdateBlahTypes();

        ComputeSizes();
        refreshSignInBtn();
    }

    var RefreshPageForNewUser = function(json) {
        // get the new channel list
        StartLoginTimer();
        ClosePage();
        CurrentUser = json;
        refreshSignInBtn();
        GetUserChannels();
    };


// ********************************************************
// Create the elements for blahs and rows


    function HandleSwipeLeft(theEvent) {

        GoNextChannel();


    }

    function HandleSwipeRight(theEvent) {
        GoPrevChannel();
    }


    function HandleSwipeUp(theEvent) {
        CurrentScrollSpeed *= 50;
        if (CurrentScrollSpeed > 50)
        CurrentScrollSpeed = 50;
    }


    function HandleSwipeDown(theEvent) {
        CurrentScrollSpeed *= -50;
        if (CurrentScrollSpeed < -50)
            CurrentScrollSpeed = -50;
    }




// ********************************************************
// stubs for error callbacks


    function OnSuccess(theArg) {
        $("#DivToShowHide").html(theArg);
    }


    function OnFailure(theErr) {
        if (theErr.status >= 500) {
            GlobalReset();
        } else {
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
        if (desiredWidth < kMinWidth)
            desiredWidth = kMinWidth;

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
        if (offset < 0)
            offset = 0;
        var blahContainer = document.getElementById("BlahContainer");
        blahContainer.style.left = offset + "px";
        blahContainer.style.width = LargeTileWidth + "px";
        var blahMargin = 8;

        $("#BlahContainer").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });
        $("#ChannelBanner").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });
        $("#BlahFullItem").css({ 'left': offset + 'px', 'width': targetWidthWidth - (blahMargin * 2) + 'px' });

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
        if (menu.style.display != "none") {
            $("#LightBox").hide();
            $(menu).fadeOut("fast");
            StartAnimation();
        }
    }

    function ShowChannelList() {
        var menu = document.getElementById("ChannelDropMenu");
        var banner = $("#ChannelBanner");
        menu.style.left = banner[0].style.left;
        menu.style.width = banner.width() + "px";
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
        banner.appendChild(label);
        banner.channelLabel = label;

        $("#ChannelBanner").click(function () {
            ShowHideChannelList();
        });


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

        var signin = document.createElement("button");
        signin.className = "sign-in-button";
        signin.onclick=function(event) {InstallUserChannel(); event.stopPropagation();};
        signin.innerHTML = "log in";
        banner.appendChild(signin);

        var options = document.createElement("div");
        options.onclick = function(event) {DoCreateBlah(); event.stopPropagation();};
        options.className = "ChannelOptions";
        options.innerHTML = "+";
        banner.appendChild(options);
        banner.options = options;

        refreshSignInBtn();
    }

    function refreshSignInBtn() {
        if (IsUserLoggedIn) {
            $(".sign-in-button").addClass("logged-in").text("profile");
        } else {
            $(".sign-in-button").addClass("logged-in").text("log in");
        }

    }
    function CreatePreviewBlah() {
        BlahPreviewItem = document.getElementById("BlahPreviewItem");
        require(['BlahPreview'], function(BlahPreview) {
            $(BlahPreviewItem).load(fragmentURL + "/pages/BlahPreview.html #BlahPreview", function () {
                BlahPreview.InitPreviewPage();

            });
        })

    }




    function CreateFullBlah() {
        BlahFullItem = document.getElementById("BlahFullItem");
    }

    function DoBlahClick(theEvent) {
        theEvent = window.event || theEvent;
        var who = theEvent.target || theEvent.srcElement;
        while (who.hasOwnProperty("blah") == false) {
            who = who.parentElement;
        }

        // now do something
        //FocusBlah(who);
        OpenBlah(who);
    }



        function CloseBlah() {
        $("#AdditionalInfoArea").empty();
        switch (BlahReturnPage) {
            case "UserBlahList":
                PopulateUserChannel("History");
                break;

            default:
                StartAnimation();
                $(BlahFullItem).fadeOut("fast", function() {
                    $("#LightBox").hide();
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

    function StartLoginTimer() {
        LoginCheckTimer = setTimeout(CheckLogin, 30000);
    }

    function CheckLogin() {
        LoginCheckTimer = null;
        if (IsUserLoggedIn) {
            Blahgua.isUserLoggedIn(function(json) {
                if (json.loggedIn == "Y")
                    StartLoginTimer();
                else
                    OnLogoutOK();
            })
        }
    }

    var DismissAll = function() {
        if (document.getElementById("BlahFullItem").style.display != "none")
            CloseBlah();
        else if (document.getElementById("ChannelDropMenu").style.display != "none")
            HideChannelList();
    }

    var OpenLoadedBlah = function(whichBlah) {
        $("#LightBox").show();
        CurrentBlah = whichBlah;
        CurrentComments = null;
        $(document).keydown(function(theEvent) {
            if (theEvent.which == 27) {
                DismissAll();
            }
        }).focus();

        CurrentBlahNickname = getSafeProperty(whichBlah, "K", CurrentBlahNickname);
        $("#BlahPreviewExtra").empty();
        require(["BlahDetailPage"], function(BlahDetailPage) {
            $(BlahFullItem).load(fragmentURL + "/pages/BlahDetailPage.html #FullBlahDiv", function() {
                var windowHeight = $(window).height();
                $(BlahFullItem).disableSelection();
                $(BlahFullItem).fadeIn("fast", function() {
                    BlahDetailPage.InitializePage();
                });
            });
        });
    };

    var OpenBlah = function(whichBlah) {
        $("#LightBox").show();
        CurrentBlah = null;
        StopAnimation();
        CurrentBlahId = whichBlah.blah.I;
        CurrentBlahNickname = getSafeProperty(whichBlah.blah, "K", "a blahger");
        Blahgua.GetBlah(CurrentBlahId, OpenLoadedBlah, OnFailure);
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





















// ********************************************************
// Create blah HTML



    function CreateBaseDiv(theBlah) {
        var newDiv = document.createElement("div");
        newDiv.blah = theBlah;
        newDiv.className = "BlahDiv";
        newDiv.style.top = "0px";
        newDiv.style.position = "absolute";
        newDiv.onclick = DoBlahClick;
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


        var imagePath = GetItemImage(theBlah, blahImageSize);
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
                case kBlahTypeAsks:
                    $(textDiv).addClass("BlahTypeAsksImgText");
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
            case kBlahTypeAsks:
                $(newEl).addClass("BlahTypeAsks");
                break;
            case kBlahTypeAd:
                $(newEl).addClass("BlahTypeAd");
                break;
        }

        if (CurrentUser && (theBlah.A == CurrentUser._id))
            $(newEl).addClass("users-own-blah");

        if (theBlah.hasOwnProperty("B") && (theBlah.B.length > 0)) {
            // add a badge
            var badgeDiv = document.createElement("div");
            $(badgeDiv).addClass("badge-div");
            $(newEl).append(badgeDiv);
        }

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
                newHTML += "Click below to log in. Then you can make the first!<br/>";
                newHTML += "<a onclick='InstallUserChannel(); return false;'>Log in</a>";
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
            BlahsMovingTimer = setTimeout(MakeBlahsMove, kBlahRollScrollInterval);
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
            BlahsMovingTimer = setTimeout(MakeBlahsMove, kBlahRollScrollInterval);
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
        else if (CurrentScrollSpeed > kBlahRollPixelStep) {
            // skipping ahead - slow down
            CurrentScrollSpeed *= 0.95;
            if (CurrentScrollSpeed < kBlahRollPixelStep) {
                CurrentScrollSpeed = kBlahRollPixelStep;
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

        var newRowEl = document.createElement("div");
        newRowEl.style.position = "absolute";
        newRowEl.style.left = "0px";
        newRowEl.rowAbove = null;
        newRowEl.rowBelow = null;

        switch (rowSequence[curRowSequence]) {
            case 1:
                newRowEl.rowHeight = LargeTileHeight;
                CreateLRow(newRowEl);
                break;
            case 2:
                newRowEl.rowHeight = MediumTileHeight;
                CreateMMRow(newRowEl);
                break;
            case 3:
                newRowEl.rowHeight = MediumTileHeight;
                CreateSMSRow(newRowEl);
                break;
            case 4:
                newRowEl.rowHeight = SmallTileHeight;
                CreateSSSSRow(newRowEl);
                break;
        }

        curRowSequence++;
        if (curRowSequence >= rowSequence.length)
            curRowSequence = 0;

        return newRowEl;

    }


    function CreateLRow(newRowEl) {
        var theBlah = GetNextMatchingBlah(1);
        var newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = edgeGutter + "px";
        newRowEl.appendChild(newBlahEl);
    }

    function CreateMMRow(newRowEl) {
        var theBlah = GetNextMatchingBlah(2);
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

    function CreateSSSSRow(newRowEl) {
        var curLeft = edgeGutter;
        theBlah = GetNextMatchingBlah(3);
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

    function CreateMSSRow(newRowEl) {
        var curLeft = edgeGutter;
        var theBlah = GetNextMatchingBlah(2);
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

    function CreateSMSRow(newRowEl) {
        var curLeft = edgeGutter + SmallTileWidth + interBlahGutter;
        theBlah = GetNextMatchingBlah(2);
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

    function CreateSSMRow(newRowEl) {
        var theBlah = GetNextMatchingBlah(2);
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
    }



    function NormalizeStrengths(theBlahList) {
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
        var numLarge = 4;
        var numMedium = 16;
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

        // ensure 100 blahs
        if (theBlahList.length < 100) {
            var curLoc = 0;
            while (theBlahList.length < 100) {
                theBlahList.push(jQuery.extend({}, theBlahList[curLoc++]));
            }
        }

        // shuffle
        fisherYates(theBlahList);


        // sort by strength
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
            newHTML += createChannelHTML(index, element);
        });

        document.getElementById("ChannelList").innerHTML = newHTML;
        $("#ChannelList img").error(imgError);
        $(".channel-info-table").click(DoJumpToChannel);
        $("#ViewProfileBtn").text(getUserChannelName());


    }

    function getUserChannelName() {
        if (IsUserLoggedIn) {
            return "view your profile";
        } else {
            return "Log in to blahgua";
        }
    }

    function imgError(theEvent) {
        var theImage = theEvent.target;
        theImage.onerror = "";
        theImage.src = fragmentURL + "/images/groups/default.png";
        return true;
    }


    function createChannelHTML(index, curChannel) {
        var newHTML = "";
        // todo:  set the actual desc from the channel obj
        var channelDesc = "This is where a pleasant description of this channel will go, once Ben writes it for this channel and Ruben implements it.";
        newHTML += "<tr><td><table class='channel-info-table' channelId='" + index + "'>";
        newHTML += "<tr>";
        newHTML += "<td rowspan=2 class='channel-image-td'>";
        newHTML += '<img class="channel-image" src="' + fragmentURL + '/images/groups/' + curChannel.N + '.png">';
        newHTML += "</td>";

        newHTML += "<td><span class='channel-title'>" + curChannel.N + "</span></td>";
        newHTML += "</tr>";
        newHTML += "<tr><td><span class='channel-description'>" + channelDesc + "</span>";
        newHTML += "</td></tr>";
        newHTML += "</table></td></tr>";
        return newHTML;
    }

    function DoRemoveChannel() {
        var who = event.target || event.srcElement;
        var what = who.parentElement.parentElement;

        var channelIndex = what.attributes["channelId"].nodeValue;
        var channelId = ChannelList[channelIndex]._id;
        Blahgua.removeUserFromChannel(channelId, OnRemoveChannelOK(what), OnFailure);
    }

    function OnRemoveChannelOK(deadItem) {
        $(deadItem).remove();
    }


    function DoJumpToChannel(theEvent) {
        var who = theEvent.target;

        var channelID = $(who).parents(".channel-info-table").attr("channelId");
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
        $("#LightBox").show();
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
            require(['SignUpPage'], function(SignUpPage) {
                $("#BlahFullItem").load(fragmentURL + "/pages/SignUpPage.html #SignInInDiv",
                    function () {
                        SignUpPage.RefreshSignupContent();
                    });
            });
        }
    }

    function SuggestUserSignIn(message) {
        require(['SignUpPage'], function(SignUpPage) {
            $("#BlahFullItem").load(fragmentURL + "/pages/SignUpPage.html #SignInInDiv", function() {
                SignUpPage.RefreshSignupContent(message);
            });
        });
    }


    function PopulateUserChannel(whichPage) {
        require(["SelfPage"], function(SelfPage){
            $("#BlahFullItem").load(fragmentURL + "/pages/SelfPage.html #UserChannelDiv", function() {
                SelfPage.InitializePage(whichPage);
            });
        });

    }




    var ClosePage = function() {
        $("#BlahFullItem").hide();
        $("#LightBox").hide();
        StartAnimation();
    };


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
        $("#LightBox").show();
        if (IsUserLoggedIn) {
            require(["CreateBlahPage"], function(CreatePage) {
                $(BlahFullItem).load(fragmentURL + "/pages/CreateBlahPage.html", function() {
                    CreatePage.InitializePage();
                });
            });
        } else {
            SuggestUserSignIn("you must log in before you can create a new blah")
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






    function UpdateAskAuthorPage() {
        var newItem = CreateAskAuthorItem();
        $("#PollAnswersArea").append(newItem);
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
        Blahgua.logoutUser(OnLogoutOK, function(theErr){
            switch (theErr.status) {
                case 202:
                    // this is not an error, just malformed JSON
                    OnLogoutOK();
                    break;
                default:
                    OnFailure(theErr);
            }
        });

    }

    function OnLogoutOK(json) {
        IsUserLoggedIn = false;
        refreshSignInBtn();
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
        newHTML += "</li>";
        return newHTML;
    }

    function GenerateHTMLForChannelBrowser(curChannel) {
        var newHTML = "";
        newHTML += "<li class='channelBrowserChannelItem' channelId='" + curChannel._id + "' onclick='DoOpenChannelPage(); return false;'><a >";

        newHTML += '<img class="channelimage" src="' + fragmentURL + '/images/groups/' + curChannel.N + '.png"';
        newHTML += 'onerror="imgError(this);">';
        newHTML += curChannel.N;
        newHTML += "</a>";
        newHTML += "</li>";
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


        // EXPORTS
        Exports.ClosePage = ClosePage;
        Exports.RefreshPageForNewUser = RefreshPageForNewUser;
        Exports.OpenBlah = OpenBlah;
        Exports.SuggestUserSignIn = SuggestUserSignIn;
        Exports.OnFailure = OnFailure;
        Exports.GetBlahTypeStr = GetBlahTypeStr;
        Exports.GetChannelNameFromID = GetChannelNameFromID;
        Exports.CloseBlah = CloseBlah;
        Exports.GetBlahTypeId = GetBlahTypeId;
        Exports.GetBlahTypeNameFromId = GetBlahTypeNameFromId;
        Exports.GetBlahTypeStr = GetBlahTypeStr;
        Exports.LogoutUser = LogoutUser;
        Exports.ForgetUser = ForgetUser;
        Exports.SuggestUserSignIn = SuggestUserSignIn;
        Exports.OpenLoadedBlah = OpenLoadedBlah;

    return {
        InitializeBlahgua: InitializeBlahgua

    }
});


