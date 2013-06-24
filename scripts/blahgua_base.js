// master JavaScript File for app
define('blahgua_base',
    [
        'constants',
        'globals',
        'ExportFunctions',
        'blahgua_restapi',
        'spin'
    ],
    function(K, G, Exports, Blahgua) {

        var rowSequence = [4,32,31,4,1,33,4,2,4,32,1,4,31,32,33,31,4,33,1,31,4,32,33,1,4,2];
        var curRowSequence = 0;
        var initialBlah =  null;

        var InitializeBlahgua = function() {
            if ((window.location.hostname == "") ||
                (window.location.hostname == "localhost") ||
                (window.location.hostname == "127.0.0.1"))
				{
                // running local
                G.FragmentURL = "./";
            }
			G.FragmentURL = "./";

            $(window).resize(function(){
                G.ResizeTimer && clearTimeout(G.ResizeTimer);
                G.ResizeTimer = setTimeout(HandleWindowResize, 100);
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

            Exports.SpinElement = new Spinner(opts);

            Exports.SpinTarget = document.getElementById("spin-div");

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
                initialBlah = getQueryVariable("blahId");
                SignIn();
            });
        };


    var HandleWindowResize = function() {
        ComputeSizes();
        //SetCurrentChannel(G.ChannelList.indexOf(G.CurrentChannel));
    };


    var getQueryVariable = function(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    };

    var GlobalReset = function () {
        // clear all timers
        clearInterval(G.BlahsMovingTimer);
        clearInterval(G.ViewerUpdateTimer);
        if (confirm("An error occurred and Blahgua will reload.  Do you want to clear cookies as well?")) {
            $.removeCookie("loginkey");
        }
        Blahgua.logoutUser();
        location.reload();
    };





// *****************************************************
// Sign-in


    var SignIn = function() {
        Blahgua.isUserLoggedIn(function(json) {
            if (json.loggedIn == "Y")
                HandlePostSignIn();
            else {
                var savedID = $.cookie("loginkey");
                var userName, pwd;

                if (savedID) {
                    savedID = JSON.parse(G.Cryptify("Sheep", savedID));
                    userName = savedID.userId;
                    pwd = savedID.pwd;
                }

                if (userName != null) {
                    if (pwd == null) {
                        pwd = prompt("Welcome back. enter password:")
                    }

                    // sign in
                    Blahgua.loginUser(userName, pwd, HandlePostSignIn, function() {
                        $.removeCookie("loginkey");
                        G.IsUserLoggedIn = false;
                        finalizeInitialLoad();
                    });
                } else {
                    G.IsUserLoggedIn = false;
                    // user is anonymous
                    finalizeInitialLoad();
                }
            }
        })
    };

    var HandlePostSignIn = function() {
        G.IsUserLoggedIn = true;
        G.StartSessionTimer(HandleSessionTimeout);
        Blahgua.GetProfileSchema(function(theSchema) {
            G.ProfileSchema = theSchema.fieldNameToSpecMap;
        }, OnFailure) ;
        Blahgua.getUserInfo(function (json) {
            G.CurrentUser = json;
            finalizeInitialLoad();
        });
    };



    var HandleSessionTimeout = function() {
        // start a final timer
        var sessionTimeOut = setTimeout(function() {
            G.ClearPrompt();
           LogoutUser();
        }, 15 * 1000);
        G.PromptUser("We haven't heard from you in a while.  Do you want to keep watching?",
            "Keep watching", null, function() {
                clearTimeout(sessionTimeOut);
                // touch the server...
                Blahgua.RefreshSession();
            }, null);
    };


// *************************************************
// Channels

    var ChannelIDFromName = function(Channel, ChannelList) {
        var curChannel;
        for (curIndex in G.ChannelList) {
            curChannel = G.ChannelList[curIndex];
            if (curChannel.N == Channel) {
                return curChannel._id;
            }
        }
        return null;
    };


    var AddDefaultChannelsToNewUser = function() {
        Blahgua.GetFeaturedChannels(OnGetChannelsOK);
    };

    var OnGetChannelsOK = function(channelList) {
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
    };

// *************************************************
// Initial Load

    var finalizeInitialLoad = function() {
        CreateChannelBanner();
        CreateFullBlah();
        GetUserChannels();
        UpdateBlahTypes();

        ComputeSizes();
        refreshSignInBtn();

    };

    var RefreshPageForNewUser = function(json) {
        G.StartSessionTimer(HandleSessionTimeout);
        // get the new channel list
        ClosePage();
        G.CurrentUser = json;
        refreshSignInBtn();
        GetUserChannels();
    };


// ********************************************************
// Create the elements for blahs and rows


    var HandleSwipeLeft = function(theEvent) {
        GoNextChannel();
    };

    var HandleSwipeRight = function(theEvent) {
        GoPrevChannel();
    };


    var HandleSwipeUp = function(theEvent) {
        G.CurrentScrollSpeed *= 50;
        if (G.CurrentScrollSpeed > 50)
            G.CurrentScrollSpeed = 50;
    };


    var HandleSwipeDown = function(theEvent) {
        G.CurrentScrollSpeed *= -50;
        if (G.CurrentScrollSpeed < -50)
            G.CurrentScrollSpeed = -50;
    };




// ********************************************************
// stubs for error callbacks

    var OnFailure = function(theErr) {
        if (theErr.status >= 500) {
            GlobalReset();
        } else {
            var errString = "An error occured. Soz!";
            var responseText = G.GetSafeProperty(theErr, "responseText", null);
            if (responseText) {
                try {
                    var responseObj = JSON.parse(responseText);
                    var message = G.GetSafeProperty(responseObj, "message", "An error occured");
                    var code = G.GetSafeProperty(responseObj, "errorCode", "<no id>");
                    errString = "Error: (" + code + "): " + message;
                } catch (exp) {

                }
                errString += "\nFull Text: \n" + responseText;
            }
            alert(errString);
        }
    };



// ********************************************************
// Alt fading


    var AltFade = function(theElement) {
        FadeRandomElement();
    };

    var LastFadeElement;

    var SelectRandomElement = function() {
        var randRow;
        var pickedEl = LastFadeElement;
        var curRow, numChildren;
        var firstRow = G.TopRow;
        var attempts = 0;

        while ((pickedEl == LastFadeElement) && (attempts < 10)) {
            attempts++;
            curRow = G.TopRow;
            randRow = Math.floor(Math.random() * G.RowsOnScreen);
            while (randRow > 0) {
                curRow = curRow.rowBelow;
                if (curRow == G.BottomRow) {
                    break;
                }
                randRow--;
            }

            // have the row, pick the object
            pickedEl = curRow.childNodes[Math.floor(Math.random() * curRow.childNodes.length)];
        }

        return pickedEl;
    };

    var FadeRandomElement = function() {
        var theEl = SelectRandomElement();
        if (theEl.style.backgroundImage != "") {
            $(theEl.blahTextDiv).fadeToggle(1000, "swing", FadeRandomElement);
        } else {
            setTimeout(FadeRandomElement, 1000);
        }
        LastFadeElement = theEl;
    };







// ********************************************************
// Start-up code



    var ComputeSizes = function() {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var desiredWidth = 640;
        var isVertical;
        if (windowWidth < desiredWidth)
            desiredWidth = windowWidth;
        if (desiredWidth < K.MinWidth)
            desiredWidth = K.MinWidth;

        if (windowWidth > windowHeight) {
            isVertical = false;
        } else {
            isVertical = true;
        }

        var blahBottom = 25;


        var totalGutter = K.EdgeGutter * 2 + K.InterBlahGutter * 3;

        G.SmallTileWidth = Math.floor((desiredWidth - totalGutter) / 4);

        G.MediumTileWidth = (G.SmallTileWidth * 2) + K.InterBlahGutter;
        G.LargeTileWidth = (G.MediumTileWidth * 2) + K.InterBlahGutter;
        //LargeTileWidth = (SmallTileWidth * 3) + (K.InterBlahGutter * 2);

        G.SmallTileHeight = G.SmallTileWidth;
        G.MediumTileHeight = G.MediumTileWidth ;
        //LargeTileHeight = LargeTileWidth;
        G.LargeTileHeight = G.MediumTileHeight;

        // now make the window the correct size
        var targetWidthWidth = (G.SmallTileWidth * 4) + totalGutter;
        var offset = Math.floor((windowWidth - targetWidthWidth) / 2);
        if (offset < 0)
            offset = 0;
        var blahContainer = document.getElementById("BlahContainer");
        blahContainer.style.left = offset + "px";
        blahContainer.style.width = G.LargeTileWidth + "px";
        var blahMargin = 16;

        $("#BlahContainer").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });
        $("#ChannelBanner").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });
        $("#BlahFullItem").css({ 'top': '25px','left': (offset + blahMargin) + 'px', 'bottom': blahBottom + 'px', 'width': targetWidthWidth - (blahMargin * 2) + 'px' });

    };

    var ShowHideChannelList = function() {
        var menu = document.getElementById("ChannelDropMenu");
        menu.style.left = document.getElementById("ChannelBanner").style.left;
        if (menu.style.display == "none") {
            ShowChannelList();
        } else {
            HideChannelList();
        }
    };

    var HideChannelList = function() {
        var menu = document.getElementById("ChannelDropMenu");
        if (menu.style.display != "none") {
            $("#LightBox").hide();
            $(menu).fadeOut("fast");
            StartAnimation();
        }
    };

    var ShowChannelList = function() {
        var menu = document.getElementById("ChannelDropMenu");
        var banner = $("#ChannelBanner");
        menu.style.left = banner[0].style.left;
        menu.style.width = banner.width() + "px";
        if (menu.style.display == "none") {
            $("#LightBox").show();
            if (G.IsUserLoggedIn)
                $("#BrowseChannelBtn").show();
            else
                $("#BrowseChannelBtn").hide();
            StopAnimation();
            menu.style.display = "block";
        }
    };


    var CreateChannelBanner = function() {
        var banner = document.getElementById("ChannelBanner");
        var label = document.createElement("span");
        label.id = "ChannelBannerLabel";
        label.className = "ChannelNameText";
        banner.appendChild(label);
        banner.channelLabel = label;
        var caret = document.createElement("i");
        caret.className = "channel-dropdown icon-chevron-sign-down";
        banner.appendChild(caret);


        var options = document.createElement("div");
        options.className = "ChannelOptions";
        options.innerHTML = "+";
        banner.appendChild(options);
        banner.options = options;

        var profile = document.createElement("div");
        profile.className = "profile-button";
        banner.appendChild(profile);

        var signin = document.createElement("button");
        signin.className = "sign-in-button";
        signin.innerHTML = "sign in";
        banner.appendChild(signin);


        // bind events

        $("#ChannelBanner").click(function (theEvent) {
            theEvent.stopPropagation();
            ShowHideChannelList();
        });

        $("#ChannelBanner .sign-in-button").click(function(theEvent) {
            theEvent.stopPropagation();
            ShowSignInUI();
        });

        $("#ChannelBanner .profile-button").click(function(theEvent) {
            theEvent.stopPropagation();
            var newHTML = "";
            newHTML += "<div class='click-shield' style='background-color:transparent'>" +
                "<div class='instant-menu'>" +
                "<ul>" +
                "<li id='ShowProfileItem'>Show Profile</li>" +
                "<li id='LogOutItem'>Sign Out</li>" +
                "</ul></div></div>";

            $(document.body).append(newHTML);
            $(".click-shield").click(function (theEvent) {
                DismissAll();
            });
            $("#ShowProfileItem").click(function (theEvent) {
                DismissAll();
                ShowUserProfile();
                });
            $("#LogOutItem").click(function (theEvent) {
                DismissAll();
                LogoutUser();
            });
            var imageRect = $(".profile-button")[0].getBoundingClientRect();
            var newTop = imageRect.bottom;
            var newLeft = imageRect.right - $(".instant-menu").width();
            $(".instant-menu").css({"left":newLeft + "px", "top":newTop + "px"})
        });

        $("#ChannelBanner .ChannelOptions").click(function(theEvent) {
            theEvent.stopPropagation();
            DoCreateBlah();
        });
        refreshSignInBtn();
    };

    var refreshSignInBtn = function() {
        if (G.IsUserLoggedIn) {
            var img = G.GetUserImage(G.CurrentUser, "A");
            var url = "url(" + img + ")";
            $(".profile-button").css("background-image", url).show();
            $(".sign-in-button").hide();
            $(".ChannelOptions").show();
        } else {
            $(".profile-button").hide();
            $(".sign-in-button").show();
            $(".ChannelOptions").hide();
        }
    };


    var CreateFullBlah = function() {
        G.BlahFullItem = document.getElementById("BlahFullItem");
    };

    var DoBlahClick = function(theEvent) {
        theEvent = window.event || theEvent;
        var who = theEvent.target || theEvent.srcElement;
        while (who.hasOwnProperty("blah") == false) {
            who = who.parentElement;
        }
        OpenBlah(who);
    };



    var CloseBlah = function() {
        $("#AdditionalInfoArea").empty();
        switch (G.BlahReturnPage) {
            case "UserBlahList":
                PopulateUserChannel("History");
                break;

            default:
                StartAnimation();
                $(G.BlahFullItem).fadeOut("fast", function() {
                    $("#LightBox").hide();
                    $(G.BlahFullItem).empty();
                });

        }
        $(document).focus();
        G.BlahReturnPage = null;
    };

    var StopAnimation = function() {
        if (G.BlahsMovingTimer != null) {
            clearTimeout(G.BlahsMovingTimer);
            G.BlahsMovingTimer = null;
        }
    };

    var StartAnimation = function() {
        StartBlahsMoving();
    };


    var DismissAll = function() {
        if (document.getElementById("BlahFullItem").style.display != "none")
            CloseBlah();
        if (document.getElementById("ChannelDropMenu").style.display != "none")
            HideChannelList();
        $(".instant-menu").parent(".click-shield").remove();
    };

    var OpenLoadedBlah = function(whichBlah) {
        StopAnimation();
        if (!whichBlah)
            alert("Null or missing blah in OpenLoadedBlah");
        $("#LightBox").show();
        G.CurrentBlah = whichBlah;
        G.CurrentComments = null;
        $(document).keydown(function(theEvent) {
            if (theEvent.which == 27) {
                DismissAll();
            }
        }).focus();

        G.CurrentBlahNickname = G.GetSafeProperty(whichBlah, "K", G.CurrentBlahNickname);
        $("#BlahPreviewExtra").empty();
        require(["BlahDetailPage"], function(BlahDetailPage) {
            $(BlahFullItem).load(BlahguaConfig.fragmentURL + "pages/BlahDetailPage.html #FullBlahDiv", function() {
                var windowHeight = $(window).height();
                $(BlahFullItem).disableSelection();
                $(BlahFullItem).fadeIn("fast", function() {
                    BlahDetailPage.InitializePage();
                    StopAnimation();
                });
            });
        });
    };

    var OpenBlah = function(whichBlah) {
        if (!whichBlah)
            alert("Null or missing blah in OpenBlah");
        $("#LightBox").show();
        G.CurrentBlah = null;
        StopAnimation();
        G.CurrentBlahId = whichBlah.blah.I;
        G.CurrentBlahNickname = G.GetSafeProperty(whichBlah.blah, "K", "someone");
        Blahgua.GetBlah(G.CurrentBlahId, OpenLoadedBlah, OnFailure);
    };

    var GetBlahTypeStr = function() {
        return GetBlahTypeNameFromId(G.CurrentBlah.Y);
    };

    var GetBlahTypeId = function(theType) {
        for (var curType in G.BlahTypeList) {
            if (G.BlahTypeList[curType].N == theType) {
                return G.BlahTypeList[curType]._id;
            }
        }

        return "";
    };

    var GetBlahTypeNameFromId = function(theId) {
        for (var curType in G.BlahTypeList) {
            if (G.BlahTypeList[curType]._id == theId) {
                return G.BlahTypeList[curType].N;
            }
        }

        return "";
    };





// ********************************************************
// Create blah HTML



    var CreateBaseDiv = function(theBlah) {
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
        $(textDiv).text(G.UnCodifyText(theBlah.T));
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


        var imagePath = G.GetItemImage(theBlah, blahImageSize);
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
                case K.BlahType.says:
                    $(textDiv).addClass("BlahTypeSaysImgText");
                    break;
                case K.BlahType.leaks:
                    $(textDiv).addClass("BlahTypeLeaksImgText");
                    break;
                case K.BlahType.polls:
                    $(textDiv).addClass("BlahTypePollsImgText");
                    break;
                case K.BlahType.predicts:
                    $(textDiv).addClass("BlahTypePredictsImgText");
                    break;
                case K.BlahType.asks:
                    $(textDiv).addClass("BlahTypeAsksImgText");
                    break;
                case K.BlahType.ad:
                    $(textDiv).addClass("BlahTypeAddImgText");
                    break;
                default:
                    break;
            }
        }

        return newDiv;

    };



    var CreateElementForBlah = function(theBlah) {
        var newEl = CreateBaseDiv(theBlah);
        var heightpaddingOffset = 7;//8 * 2;
        var widthpaddingOffset = 0;

        if (theBlah.displaySize == 1) {
            newEl.style.width = G.LargeTileWidth - widthpaddingOffset + "px";
            newEl.style.height = G.LargeTileHeight - heightpaddingOffset + "px";

        } else if (theBlah.displaySize == 2) {
            newEl.style.width = G.MediumTileWidth - widthpaddingOffset + "px";
            newEl.style.height = G.MediumTileHeight - heightpaddingOffset + "px";
        } else {
            newEl.style.width = G.SmallTileWidth - widthpaddingOffset + "px";
            newEl.style.height = G.SmallTileHeight - heightpaddingOffset + "px";
        }

        switch (theBlah.Y) {
            case K.BlahType.says:
                $(newEl).addClass("BlahTypeSays");
                break;
            case K.BlahType.leaks:
                $(newEl).addClass("BlahTypeLeaks");
                break;
            case K.BlahType.polls:
                $(newEl).addClass("BlahTypePolls");
                break;
            case K.BlahType.predicts:
                $(newEl).addClass("BlahTypePredicts");
                break;
            case K.BlahType.asks:
                $(newEl).addClass("BlahTypeAsks");
                break;
            case K.BlahType.ad:
                $(newEl).addClass("BlahTypeAd");
                break;
        }

        if (G.CurrentUser && (theBlah.A == G.CurrentUser._id))
            $(newEl).addClass("users-own-blah");

        if (theBlah.hasOwnProperty("B") && (theBlah.B.length > 0)) {
            // add a badge
            var badgeDiv = document.createElement("div");
            $(badgeDiv).addClass("badge-div");
            $(newEl).append(badgeDiv);
        }

        return newEl;
    };

    var DrawInitialBlahs = function() {
        if (G.ActiveBlahList.length > 0) {
            var curRow = BuildNextRow();
            $("#BlahContainer").append(curRow);
            ResizeRowText(curRow);
            G.TopRow = curRow;
            var curTop = curRow.rowHeight + K.InterBlahGutter;
            var bottom = $("#BlahContainer").height();
            var lastRow = curRow;
            G.RowsOnScreen = 1;

            while (curTop <= bottom) {
                curRow = BuildNextRow();
                curRow.style.top = curTop + "px";
                $("#BlahContainer").append(curRow);
                ResizeRowText(curRow);
                curTop += curRow.rowHeight + K.InterBlahGutter;
                lastRow.rowBelow = curRow;
                curRow.rowAbove = lastRow;
                G.BottomRow = curRow;
                lastRow = curRow;
                G.RowsOnScreen++;
            }

            FadeRandomElement();
        }
        else {
            var newDiv = document.createElement("div");
            var newHTML = "<b>" + G.CurrentChannel.N + "</b> currently has no blahs in it.</br> ";

            if (G.IsUserLoggedIn) {
                newHTML += "Perhaps you can add the first!<br/>";
            } else {
                newHTML += "Sign in, and then you can create the first!<br/>";
            }

            newDiv.innerHTML = newHTML;
            newDiv.className = "no-blahs-in-channel-warning";
            $("#BlahContainer").append(newDiv);
        }
    };

    var DoAddBlahRow = function() {
        var nextRow = BuildNextRow();
        nextRow.rowAbove = G.BottomRow;
        if(G.BottomRow)
            G.BottomRow.rowBelow = nextRow;
        G.BottomRow = nextRow;
        nextRow.style.top = ($("#BlahContainer").height() + $("#BlahContainer").scrollTop() + K.InterBlahGutter) + "px";
        $("#BlahContainer").append(nextRow);
        ResizeRowText(nextRow);
        G.RowsOnScreen++;
        // to do - add blah specific animation
        StartBlahsMoving();
    };

    var ResizeRowText = function(newRow) {
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
    };


// ********************************************************
// Handle the blah scroll

    var UserHasChannel = function(channelID) {
        for (var index in G.ChannelList) {
            if(G.ChannelList[index]._id == channelID)
                return true;

        }

        return false;
    };

    var AddUserToChannel = function(channelID) {
        Blahgua.JoinUserToChannel(channelID, function(theResult) {
            var newChannel = theResult;

        }, function(theErr) {
            //todo:  handle failure to join...  for now, fail silently

        });
    };

    var SetCurrentChannelbyID = function(theID) {
        for (var index in G.ChannelList) {
            if(G.ChannelList[index]._id == theID) {
                SetCurrentChannel(index);
                break;
            }
        }
    };

    var StartBlahsMoving = function() {
        if (G.BlahsMovingTimer == null) {
            G.BlahsMovingTimer = setTimeout(MakeBlahsMove, K.BlahRollScrollInterval);
        }

        if (initialBlah) {
            Blahgua.GetBlah(initialBlah, function(theBlah) {

                if (G.IsUserLoggedIn) {
                    if (!UserHasChannel(theBlah.G))
                        AddUserToChannel(theBlah.G);

                } else {
                    // if anonymous, this channel must be public
                }
                SetCurrentChannelbyID(theBlah.G);
                OpenLoadedBlah(theBlah);

            }, function (theErr) {
                // todo: handle the missing blah.  For now we fail silently.
            });
            initialBlah = null;
        }
    };

    var MakeBlahsMove = function() {
        if (G.ActiveBlahList.length > 0) {
            var curScroll = $("#BlahContainer").scrollTop();
            $("#BlahContainer").scrollTop(curScroll + G.CurrentScrollSpeed);
            var newScroll = $("#BlahContainer").scrollTop();
            if (newScroll != curScroll) {
                // we scrolled a pixel or so
                if (G.TopRow.getBoundingClientRect().bottom < 0) {
                    G.TopRow = G.TopRow.rowBelow;
                    G.RowsOnScreen--;

                }
                G.BlahsMovingTimer = setTimeout(MakeBlahsMove, K.BlahRollScrollInterval);
            } else {
                G.BlahsMovingTimer = null;
                DoAddBlahRow();
            }
            if (G.CurrentScrollSpeed < 1) {
                // scrolling backwards, slow down
                G.CurrentScrollSpeed *= .95;
                if (G.CurrentScrollSpeed > -1) {
                    G.CurrentScrollSpeed = 1;
                }
                // see if a new top row is on the screen...
                if ((G.TopRow != null) && G.TopRow.hasOwnProperty("rowAbove") && (G.TopRow.rowAbove.getBoundingClientRect().bottom > 0)) {
                    G.TopRow = G.TopRow.rowAbove;
                    G.RowsOnScreen++;
                }
            }
            else if (G.CurrentScrollSpeed > K.BlahRollPixelStep) {
                // skipping ahead - slow down
                G.CurrentScrollSpeed *= 0.95;
                if (G.CurrentScrollSpeed < K.BlahRollPixelStep) {
                    G.CurrentScrollSpeed = K.BlahRollPixelStep;
                }
            }
        }
    };


// ********************************************************
// Manage the active blah list

    var RefreshActiveBlahList = function() {
        // when the list is empty, we refill it. For now, we just use the same list
        $("#ChannelBanner").css("background-color", K.BannerHighlightColor);
        var nextBlahSet = [];

        if (G.NextBlahList.length > 0) {
            nextBlahSet = nextBlahSet.concat(G.NextBlahList);
        } else {
            nextBlahSet = nextBlahSet.concat(G.BlahList);
        }

        fisherYates(nextBlahSet);

        G.ActiveBlahList = G.ActiveBlahList.concat(nextBlahSet);
        GetNextBlahList();
    };

    var GetNextBlah = function() {
        var nextBlah = G.ActiveBlahList.pop();
        if (G.ActiveBlahList.length == 0) {
            RefreshActiveBlahList();
        }

        return nextBlah;
    };

    var GetNextMatchingBlah = function(blahSize) {
        var curBlah;
        var nextBlah = null;

        for (var curIndex in G.ActiveBlahList) {
            curBlah = G.ActiveBlahList[curIndex];
            if (curBlah.displaySize == blahSize) {
                nextBlah = curBlah;
                G.ActiveBlahList.splice(curIndex, 1);
                if (G.ActiveBlahList.length == 0) {
                    RefreshActiveBlahList();
                }
                break;
            }
        }

        if (nextBlah == null) {
            RefreshActiveBlahList();
            nextBlah = GetNextMatchingBlah(blahSize);
        }

        /* todo: add in view count
        if (nextBlah != null)
            Blahgua.AddBlahViewsOpens(nextBlah.I, 1, 0, null, null);
            */
        return nextBlah;
    };


// ********************************************************
// Creating the next row of content and adding it

    var BuildNextRow = function(rowHint) {
        var newRowEl = document.createElement("div");
        newRowEl.style.position = "absolute";
        newRowEl.style.left = "0px";
        newRowEl.rowAbove = null;
        newRowEl.rowBelow = null;

        switch (rowSequence[curRowSequence]) {
            case 1:
                newRowEl.rowHeight = G.LargeTileHeight;
                CreateLRow(newRowEl);
                break;
            case 2:
                newRowEl.rowHeight = G.MediumTileHeight;
                CreateMMRow(newRowEl);
                break;
            case 3:
            case 32:
                newRowEl.rowHeight = G.MediumTileHeight;
                CreateSMSRow(newRowEl);
                break;
            case 31:
                newRowEl.rowHeight = G.MediumTileHeight;
                CreateMSSRow(newRowEl);
                break;
            case 33:
                newRowEl.rowHeight = G.MediumTileHeight;
                CreateSSMRow(newRowEl);
                break;
            case 4:
                newRowEl.rowHeight = G.SmallTileHeight;
                CreateSSSSRow(newRowEl);
                break;
        }

        curRowSequence++;
        if (curRowSequence >= rowSequence.length)
            curRowSequence = 0;

        return newRowEl;
    };


    var CreateLRow = function(newRowEl) {
        var theBlah = GetNextMatchingBlah(1);
        var newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = K.EdgeGutter + "px";
        newRowEl.appendChild(newBlahEl);
    };

    var CreateMMRow = function(newRowEl) {
        var theBlah = GetNextMatchingBlah(2);
        var curLeft = K.EdgeGutter;
        var newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(2);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += G.MediumTileWidth + K.InterBlahGutter;
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);
    };

    var CreateSSSSRow = function(newRowEl) {
        var curLeft = K.EdgeGutter;
        var theBlah = GetNextMatchingBlah(3);
        var newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += G.SmallTileWidth + K.InterBlahGutter;
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += G.SmallTileWidth + K.InterBlahGutter;
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += G.SmallTileWidth + K.InterBlahGutter;
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);
    };

    var CreateMSSRow = function(newRowEl) {
        var curLeft = K.EdgeGutter;
        var theBlah = GetNextMatchingBlah(2);
        var newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += (G.MediumTileWidth + K.InterBlahGutter);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += (G.SmallTileWidth + K.InterBlahGutter);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
        newRowEl.appendChild(newBlahEl);
    };

    var CreateSMSRow = function(newRowEl) {
        var curLeft = K.EdgeGutter + G.SmallTileWidth + K.InterBlahGutter;
        var theBlah = GetNextMatchingBlah(2);
        var newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft = K.EdgeGutter;
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += (G.MediumTileWidth + K.InterBlahGutter + K.InterBlahGutter + G.SmallTileWidth);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
        newRowEl.appendChild(newBlahEl);
    };

    var CreateSSMRow = function(newRowEl) {
        var theBlah = GetNextMatchingBlah(2);
        var curLeft = K.EdgeGutter + (G.SmallTileWidth + K.InterBlahGutter) * 2;
        var newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft = K.EdgeGutter;
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        curLeft += (G.SmallTileWidth + K.InterBlahGutter);
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);

        theBlah = GetNextMatchingBlah(3);
        newBlahEl = CreateElementForBlah(theBlah);
        newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
        newBlahEl.style.left = curLeft + "px";
        newRowEl.appendChild(newBlahEl);
    };

// ********************************************************
// Getting the current inbox for the current user

    var GetUserBlahs = function() {
        $("#BlahContainer").empty();
        Blahgua.GetNextBlahs(OnGetBlahsOK, OnFailure);
    };

    var OnGetBlahsOK = function(theResult) {
        G.BlahList = theResult;
        G.NextBlahList = [];
        if (theResult.length > 0)
            PrepareBlahList(G.BlahList);
        G.ActiveBlahList = [];
        RefreshActiveBlahList();
        DrawInitialBlahs();
        if (G.BlahList.length > 0)
        {
            StartAnimation();
        }
        GetNextBlahList();
    };



    var NormalizeStrengths = function(theBlahList) {
        // ensure 100 blahs
        if (theBlahList.length < 100) {
            var curLoc = 0;
            while (theBlahList.length < 100) {
                theBlahList.push(theBlahList[curLoc++]);
            }
        }
    };

    var AssignSizes = function(theBlahList) {
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

        while (i < (numMedium + numLarge)) {
            theBlahList[i++].displaySize = 2;
        }

        while (i < theBlahList.length) {
            theBlahList[i++].displaySize = 3;
        }
    };


    var PrepareBlahList = function(theBlahList) {

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
    };

    var fisherYates = function(myArray) {
        var i = myArray.length;
        if (i == 0) return false;
        while (--i) {
            var j = Math.floor(Math.random() * (i + 1));
            var tempi = myArray[i];
            var tempj = myArray[j];
            myArray[i] = tempj;
            myArray[j] = tempi;
        }
    };

// *****************************************
// Channels

    var GoPrevChannel = function() {
        var curLoc;

        if (G.CurrentChannel == null) {
            curLoc = G.ChannelList.length - 1;
        } else {
            curLoc = G.ChannelList.indexOf(G.CurrentChannel);
            curLoc--;
            if (curLoc < 0) curLoc = G.ChannelList.length - 1;
        }
        SetCurrentChannel(curLoc);
    };

    var GoNextChannel = function() {
        var curLoc;

        if (G.CurrentChannel == null) {
            curLoc = 0;
        } else {
            curLoc = G.ChannelList.indexOf(G.CurrentChannel);
            curLoc++;
            if (curLoc >= G.ChannelList.length) {
                curLoc = 0;
            }
        }
        SetCurrentChannel(curLoc);
    };

    var GetChannelByName = function(theName, theList) {
        var theEl = null;
        for (curIndex in theList) {
            if (theList[curIndex].N.toLowerCase() == theName.toLowerCase()) {
                theEl = theList[curIndex];
                break;
            }
        }
        return theEl;
    };

    var GetChannelNameFromID = function(channelID) {
        var theName = "";
        for (curIndex in G.ChannelList) {
            if (G.ChannelList[curIndex]._id == channelID) {
                theName = G.ChannelList[curIndex].N;
                break;
            }
        }

        return theName;
    };

    var GetUserChannels = function() {
        if (G.IsUserLoggedIn) {
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
    };


    var GetChannelsOK = function(theChannels) {
        G.ChannelList = theChannels;

        if (theChannels.length == 0) {
            AddDefaultChannelsToNewUser();
        } else {
            // fetch URL parameter Channel
            var defChannel = getQueryVariable('channel');
            if (defChannel != null) {
                for (curIndex in G.ChannelList) {
                    if (G.ChannelList[curIndex].N.toLowerCase() == defChannel.toLowerCase())
                    {
                        PopulateChannelMenu();
                        SetCurrentChannel(curIndex);
                        return;
                        break;
                    }
                }
                // user does not have this channel - add it!
                if (G.IsUserLoggedIn) {
                    Blahgua.GetAllChannels(function (allChannels) {
                        for (curIndex in allChannels) {
                            if (allChannels[curIndex].N.toLowerCase() == defChannel.toLowerCase())
                            {
                                Blahgua.JoinUserToChannel(allChannels[curIndex]._id, function() {
                                    G.ChannelList.splice(0,0,allChannels[curIndex]);
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
    };

    var PopulateChannelMenu = function( ) {
        var newHTML = "";

        $.each(G.ChannelList, function(index, element) {
            newHTML += createChannelHTML(index, element);
        });

        $("#ChannelList").html(newHTML);
        $("#ChannelList img").error(imgError);
        $(".channel-info-table").click(DoJumpToChannel);
        refreshSignInBtn();
    };

    var imgError = function(theEvent) {
        var theImage = theEvent.target;
        theImage.onerror = "";
        theImage.src = BlahguaConfig.fragmentURL + "images/groups/default.png";
        return true;
    };


    var createChannelHTML = function(index, curChannel) {
        var newHTML = "";
        // todo:  set the actual desc from the channel obj
        var channelDesc = "This is where a pleasant description of this channel will go, once Ben writes it for this channel and Ruben implements it.";
        newHTML += "<tr><td><table class='channel-info-table' channelId='" + index + "'>";
        newHTML += "<tr>";
        newHTML += "<td rowspan=2 class='channel-image-td'>";
        newHTML += '<img class="channel-image" src="' + BlahguaConfig.fragmentURL + 'images/groups/' + curChannel.N + '.png">';
        newHTML += "</td>";

        newHTML += "<td><span class='channel-title'>" + curChannel.N + "</span></td>";
        newHTML += "</tr>";
        newHTML += "<tr><td><span class='channel-description'>" + channelDesc + "</span>";
        newHTML += "</td></tr>";
        newHTML += "</table></td></tr>";
        return newHTML;
    };



    var DoJumpToChannel = function(theEvent) {
        var who = theEvent.target;

        var channelID = $(who).parents(".channel-info-table").attr("channelId");
        HideChannelList();
        SetCurrentChannel(channelID);
    };

    var SetCurrentChannel = function(whichChannel) {
        $("#ChannelBanner").css("background-color", K.BannerHighlightColor);
        StopAnimation();
        G.CurrentChannel = G.ChannelList[whichChannel];
        Blahgua.currentChannel = G.CurrentChannel._id;
        var labelDiv = document.getElementById("ChannelBannerLabel");
        labelDiv.innerHTML = G.CurrentChannel.N;
        var imageURL = "url('" + BlahguaConfig.fragmentURL + "images/groups/bkgnds/";
        imageURL += G.CurrentChannel.N + ".jpg')";
        //document.getElementById("BlahContainer").style.backgroundImage = imageURL;
        GetUserBlahs();
        UpdateChannelViewers();
    };

    var GetNextBlahList = function() {
        Blahgua.GetNextBlahs(OnGetNextBlahsOK, OnFailure);
    };

    var OnGetNextBlahsOK = function(theResult) {
        G.NextBlahList = theResult;
        if (theResult.length > 0)
            PrepareBlahList(G.NextBlahList);
        $("#ChannelBanner").animate({"background-color": K.BannerColor }, 'slow');
    };


// *****************************************
// User Channel

    var ShowUserProfile = function() {
        StopAnimation();
        $("#LightBox").show();
        $("#BlahFullItem").empty();
        if (G.IsUserLoggedIn) {
            if (G.CurrentUser == null) {
                Blahgua.GetCurrentUser(function (theResult) {
                    G.CurrentUser = theResult;
                    PopulateUserChannel("Profile");
                }, OnFailure);
            }
            else {
                PopulateUserChannel("Profile");
            }
        } else {
            require(['SignUpPage'], function(SignUpPage) {
                $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/SignUpPage.html #SignInInDiv",
                    function () {
                        SignUpPage.RefreshSignupContent();
                    });
            });
        }
    };

    var ShowSignInUI = function() {

        // empty whatever is in there now
        StopAnimation();
        $("#LightBox").show();
        $("#BlahFullItem").empty();
        require(['SignUpPage'], function(SignUpPage) {
                $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/SignUpPage.html #SignInInDiv",
                    function () {
                        SignUpPage.RefreshSignupContent();
                    });
            }
        );
    };

    var SuggestUserSignIn = function(message) {
        require(['SignUpPage'], function(SignUpPage) {
            $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/SignUpPage.html #SignInInDiv", function() {
                SignUpPage.RefreshSignupContent(message);
            });
        });
    };


    var PopulateUserChannel = function(whichPage) {
        require(["SelfPage"], function(SelfPage){
            $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/SelfPage.html #UserChannelDiv", function() {
                SelfPage.InitializePage(whichPage);
            });
        });
    };


    var ClosePage = function() {
        $("#BlahFullItem").hide();
        $("#LightBox").hide();
        StartAnimation();
    };


    var UpdateChannelViewers = function() {
        /*

        //todo:  reenable channel viewers

        if (G.ViewerUpdateTimer != null) {
            clearTimeout(G.ViewerUpdateTimer);
            G.ViewerUpdateTimer = null;
        }
        Blahgua.GetViewersOfChannel(G.CurrentChannel._id, OnChannelViewersOK);

        G.ViewerUpdateTimer = setTimeout(UpdateChannelViewers, 15000);
         */
    };

    var OnChannelViewersOK = function(numViewers) {
        $("#ChannelViewersCountText").html(G.GetSafeProperty(numViewers, "V", 0));
    };

    var DoCreateBlah = function() {
        StopAnimation();
        $("#LightBox").show();
        if (G.IsUserLoggedIn) {
            require(["CreateBlahPage"], function(CreatePage) {
                $(BlahFullItem).load(BlahguaConfig.fragmentURL + "pages/CreateBlahPage.html", function() {
                    CreatePage.InitializePage();
                });
            });
        } else {
            SuggestUserSignIn("Sign in to create.")
        }
    };

    var UpdateBlahTypes = function() {
        Blahgua.GetBlahTypes(function (json) {
            G.BlahTypeList = json;
            K.BlahType.leaks = GetBlahTypeId("leaks");
            K.BlahType.polls = GetBlahTypeId("polls");
            K.BlahType.predicts = GetBlahTypeId("predicts");
            K.BlahType.says = GetBlahTypeId("says");
            K.BlahType.ad = GetBlahTypeId("ad");
            K.BlahType.asks = GetBlahTypeId("asks");
        });
    };

    var ForgetUser = function() {
        $.removeCookie("loginkey");
        Blahgua.logoutUser(OnLogoutOK);
    };


    var LogoutUser = function() {
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
    };

    var OnLogoutOK = function(json) {
        G.ClearSessionTimer();
        G.IsUserLoggedIn = false;
        refreshSignInBtn();
        G.CurrentUser = null;
        ClosePage();
        GetUserChannels();
    };


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


