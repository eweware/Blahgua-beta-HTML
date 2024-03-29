﻿// master JavaScript File for app
define('blahgua_base',
    [
        'constants',
        'globals',
        'ExportFunctions',
        'blahgua_restapi',
        'spin'
    ],
    function(K, G, Exports, Blahgua) {

        var rowSequence;
        var useSequence = 2;

        var rowSequence1 = ["A","B","A","C","A","F","A","C","B","A","B","C","A","F","A","C","A","B","A","C","B","A","F","A","B","A","C","A","C","A","B","A","F","A","B","C"];
        var rowSequence2 = ["A","B","E","A","F","A","D","C","A","D","E","A","C","D","A","F","A","E","B","A","D","A","D","C","A","F","A","B","E","A","E","B","A","F","A","C","D","A","E","A"];

        if (useSequence == 1)
            rowSequence = rowSequence1;
        else
            rowSequence = rowSequence2;

        var curRowSequence = 0;
        var isStarting = true;
        var splashTimeout;
        var showSplash = true;
        var FadeTimer = null;
        var smallTextSize;
        var mediumTextSize;
        var largeTextSize;
        var pubnub = null;
        var CurrentPushChannel = null;

        var IsMobileBrowser = function() {
            var check = false;
            (function(a){if(/(android|iPad|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
            return check;
        };


        var InitializeBlahgua = function() {
            $(window).resize(function(){
                G.ResizeTimer && clearTimeout(G.ResizeTimer);
                G.ResizeTimer = setTimeout(HandleWindowResize, 100);
            });

            var opts = {
                lines: 12, // The number of lines to draw
                length: 4, // The lenƒgth of each line
                width: 2, // The line thickness
                radius: 2, // The radius of the inner circle
                color: '#808080', // #rbg or #rrggbb
                speed: 1, // Rounds per second
                trail: 100, // Afterglow percentage
                shadow: false // Whether to render a shadow
            };

            G.IsiPhone = (navigator.userAgent.match(/iPhone/i) != null);
            G.IsiPad = (navigator.userAgent.match(/iPad/i) != null);


            G.IsUploadCapable = G.BrowserSupportsUpload();

            G.IsMobile = IsMobileBrowser();

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
                //$("#BlahContainer").on('mousedown', HandleMidBtnDown);
                if(window.addEventListener) {
                    document.addEventListener('DOMMouseScroll', mousewheel_handler, false);
                }
                document.onmousewheel = mousewheel_handler;

                if (!G.IsMobile) {
                    $("#LightBox").click(DismissAll);
                    $(window).on('keydown', HandleKeyDown);
                }

                G.InitialBlah = getQueryVariable("blahId");
                if (G.IsiPad || G.IsiPhone) {
                    $("#BlahFullItem").on("focusout", function(e) {
                        window.setTimeout(function() { window.scrollTo(0,0); }, 500);
                    });
                }
                SignIn();
            });

            window.addEventListener( 'orientationchange', HandleWindowResize, false );

            pubnub = PUBNUB({
                subscribe_key: 'sub-c-baab93c2-859a-11e5-9320-02ee2ddab7fe', // always required
                publish_key: 'pub-c-b66a149c-6e4e-4ff3-ac25-d7a31021c9d8'    // only required if publishing
            });

        };

        var HandleKeyDown = function(e) {
            if (e.target == document.body) {
                switch(e.keyCode) {
                    case 38:
                        G.CurrentScrollSpeed -= G.ScrollStepInc;
                        break;
                    case 40:
                        G.CurrentScrollSpeed += G.ScrollStepInc;
                        break;
                    case 37:
                        HandleSwipeLeft();
                        break;
                    case 39:
                        HandleSwipeRight();
                        break;
                    case 32:
                        G.CurrentScrollSpeed = K.BlahRollPixelStep;
                        break;
                }
            }

        };

        $.fn.textfill3 = function(maxFontSize) {
            maxFontSize = parseInt(maxFontSize, 10);
            return this.each(function() {
                var ourText = $("span", this),
                    parent = ourText.parent(),
                    maxHeight = parent.height(),
                    maxWidth = parent.width(),
                    fontSize = parseInt(ourText.css("fontSize"), 10),
                    multiplier = maxWidth / ourText.width(),
                    newSize = (fontSize * (multiplier - 0.1));
                ourText.css("fontSize", (maxFontSize > 0 && newSize > maxFontSize) ? maxFontSize : newSize);
            });
        };

        var mousewheel_handler = function(theEvent) {
            var delta = event.wheelDelta;
            if (delta < 0)
                G.CurrentScrollSpeed -= G.PageScrollInc;
            else
                G.CurrentScrollSpeed += G.PageScrollInc;
        };

        var HandleMidBtnDown = function(theEvent) {
            if (theEvent.which == 2) {
                G.CurrentScrollSpeed = K.BlahRollPixelStep;
                event.stopImmediatePropagation();
                return true;
            } else {
                return false;
            }
        };


        var HandleWindowResize = function() {
            ComputeSizes();
            if ((G.TopRow != null) && (!G.IsMobile)) {
                // note that we do NOT do this on a mobile device,
                // since the resize is likely caused by the onscreen keyboard
                var rowTop = G.TopRow.getBoundingClientRect().top;
                var curScroll = $("#BlahContainer").scrollTop();
                var curTop = 0, rowHeight;
                $("#BlahContainer > div").each(function (index, item) {
                    item.style.top = curTop + "px";
                    rowHeight = ResizeBlahRow(item);
                    curTop = curTop + rowHeight + K.InterBlahGutter;
                });
                var newTop = G.TopRow.getBoundingClientRect().top;
                var newScroll = curScroll + (newTop - rowTop);
                $("#BlahContainer").scrollTop(newScroll);
            }
        };

        var ResizeBlahRow = function(theRow) {
            var rowHeight;
            switch (theRow.getAttribute("rowtype")) {
                case "L":
                    rowHeight = ResizeLRow(theRow)
                    break;
                case "SSM":
                    rowHeight = ResizeSSMRow(theRow);
                    break;
                case "MSS":
                    rowHeight = ResizeMSSRow(theRow);
                    break;
                case "SSS":
                    rowHeight = ResizeSSSRow(theRow);
                    break;
                case "SH":
                    rowHeight = ResizeSHRow(theRow);
                    break;
                case "HS":
                    rowHeight = ResizeHSRow(theRow);
                    break;

            }
            ResizeRowText(theRow);
            return rowHeight;
        };

        var BlahViewMap = new Object();
        var MapIsDirty = false;

        var AddBlahView = function(blahId) {
            if (BlahViewMap.hasOwnProperty(blahId))
                BlahViewMap[blahId]++;
            else
                BlahViewMap[blahId] = 1;
            MapIsDirty = true;
        };

        var FlushViewMap = function() {
            if (MapIsDirty) {
                MapIsDirty = false;
                Blahgua.UpdateBlahCounts(BlahViewMap, function() {
                    BlahViewMap = new Object();
                }, function(theErr) {
                    BlahViewMap = new Object();
                });
            } else {
                BlahViewMap = new Object();
            }


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
            ga('send', 'event', 'crash', 'crash', "GlobalReset", 1);
            clearInterval(G.BlahsMovingTimer);
            clearInterval(G.ViewerUpdateTimer);
            if (confirm("An error occurred and Heard will reload.  Do you want to clear cookies as well?")) {
                $.removeCookie("loginkey");
            }

            Blahgua.logoutUser();
            location.reload();
        };





// *****************************************************
// Sign-in


        var SignIn = function() {
            Blahgua.isUserLoggedIn(function(json) {
                if (json.loggedIn == "Y") {
                    isStarting = false;
                    HandlePostSignIn();

                } else {
                    var savedID = $.cookie("loginkey");
                    var userName, pwd;

                    if (savedID) {
                        savedID = JSON.parse(G.Cryptify("Sheep", savedID));
                        userName = savedID.userId;
                        pwd = savedID.pwd;
                    }

                    if (userName != null) {
                        // sign in
                        Blahgua.loginUser(userName, pwd, function() {
                            isStarting = false;

                            HandlePostSignIn();
                        }, function(theErr) {
                            switch (theErr.status) {
                                case 202:
                                    isStarting = false;

                                    HandlePostSignIn();
                                    break;
                                default:
                                    $.removeCookie("loginkey");
                                    G.IsUserLoggedIn = false;
                                    finalizeInitialLoad();
                            }
                        });
                    } else {
                        G.IsUserLoggedIn = false;
                        isStarting = false;
                        // user is anonymous
                        finalizeInitialLoad();
                    }
                }
            }, function(theErr) {
                // todo:  check for specific error codes
                $(".PageBody").empty();
                var newHTML = "<div class='site-down-div'></div>";
                $(".PageBody").append(newHTML);
            });
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
            G.PromptUser("We haven't heard from you in a while.  Do you want to stay signed in?",
                "Stay signed in", null, function() {
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
                if (G.GetSafeProperty(curChannel, "R", 0) > 0) {
                    Blahgua.JoinUserToChannel(curChannel._id, function() {
                        if (theList.length > 0)
                            JoinUserToNextChannel(theList);
                        else
                            GetUserChannels();
                    });
                } else {
                    if (theList.length > 0)
                        JoinUserToNextChannel(theList);
                    else
                        GetUserChannels();
                }

            };

            JoinUserToNextChannel(ChannelList);
        };

// *************************************************
// Initial Load

        var finalizeInitialLoad = function() {
            if (showSplash) {
                Blahgua.GetWhatsNew(function(newInfo) {
                    console.log(newInfo);

                    $("body").append("<div class='notification-click-window'><div id='NotificationPopupWindow'></div></div>");
                    $("#NotificationPopupWindow").html( "<div class='notification-popup-header'></div>"+
                        "<div class='notification-popup-body'></div>");
                    var msg = G.GetSafeProperty(newInfo, "message", "What's new for you");
                    $(".notification-popup-header").html(msg);

                    var bodytext = "<div class='notification-body-text'>";
                    if ((newInfo.newViews > 0) || (newInfo.newOpens > 0) || (newInfo.newComments > 0) ||
                        (newInfo.newUpVotes > 0) || (newInfo.newDownVotes > 0) || (newInfo.newCommentUpVotes > 0) ||
                        (newInfo.newCommentDownViews > 0) || (newInfo.newMessages > 0)) {
                        // user had SOME activity
                        var lastUpdate = G.GetSafeProperty(newInfo, "lastUpdate", "");
                        if (lastUpdate == "") {
                            lastUpdate = "your last login"
                        } else {
                            var updateDate = new Date(lastUpdate);
                            lastUpdate = updateDate.toDateString();
                        }

                        bodytext += "Since " + lastUpdate + " here is what has happened:<br/><br/>";

                        if ((newInfo.newViews > 0) || (newInfo.newOpens > 0) || (newInfo.newComments > 0) ||
                            (newInfo.newUpVotes > 0) || (newInfo.newDownVotes > 0)) {
                            if (newInfo.newViews > 0) {
                                bodytext += "Your posts have been seen " + newInfo.newViews + " time";
                                if (newInfo.newViews > 1) bodytext += "s";
                                bodytext += ".  <br/>";
                            }
                            if (newInfo.newOpens < 0) {
                                bodytext += "Your posts have been opened " + newInfo.newViews + " time";
                                if (newInfo.newOpens > 1) bodytext += "s";
                                bodytext += ".  <br/>";
                            }
                        }
                        if ((newInfo.newComments > 0) || (newInfo.newUpVotes > 0) || (newInfo.newDownVotes > 0)) {
                            bodytext += "Your posts have received ";
                            bodytext += newInfo.newComments   + " new comments, ";
                            bodytext += newInfo.newUpVotes    + " new up votes, and ";
                            bodytext += newInfo.newDownVotes  + " new down votes.<br/><br/>";

                        }

                        if ( (newInfo.newCommentUpVotes > 0) || (newInfo.newCommentDownVotes > 0)) {
                            bodytext += "Your comments have received ";
                            bodytext += newInfo.newCommentUpVotes    + " new up votes, and ";
                            bodytext += newInfo.newCommentDownVotes  + " new down votes.<br/><br/>";
                        }

                        bodytext += "<br/>";
                    }

                    if (newInfo.newMessages > 0)
                        bodytext += "You have " + newInfo.newMessages   + " new messages.  View them in your profile page.  <br/>";
                    bodytext += "</div>";

                    $(".notification-popup-body").html(bodytext);

                    $(".notification-click-window").click(function(){
                        $(this).fadeOut();
                    });

                    setTimeout(function(){
                        $(".notification-click-window").fadeOut();
                    },8000);
                });

            } else {
                $("#BlahFullItem").empty();
                isStarting = false;
            }


            CreateChannelBanner();
            CreateFullBlah();
            GetUserChannels();
            UpdateBlahTypes();

            ComputeSizes();
            refreshSignInBtn();
            $(document).keydown(function(theEvent) {
                if (theEvent.which == 27) {
                    theEvent.stopImmediatePropagation();
                    DismissAll();
                }
            }).focus();



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
            if (G.CurrentScrollSpeed < 0)
                G.CurrentScrollSpeed = 1;
            G.CurrentScrollSpeed += G.SwipeScrollInc;
            if (G.CurrentScrollSpeed > G.MaxScrollSpeed)
                G.CurrentScrollSpeed = G.MaxScrollSpeed;
        };


        var HandleSwipeDown = function(theEvent) {
            if (G.CurrentScrollSpeed > 0)
                G.CurrentScrollSpeed = -1;
            G.CurrentScrollSpeed -= G.SwipeScrollInc;
            if (G.CurrentScrollSpeed < -G.MaxScrollSpeed)
                G.CurrentScrollSpeed = -G.MaxScrollSpeed;
        };




// ********************************************************
// stubs for error callbacks

        var OnFailure = function(theErr) {
            if (theErr.status >= 500) {
                console.log("Uncaught error: " + theErr.status + " - " + theErr.responseText);
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
                console.log("uncaught error: " + theErr.status + " - " + theErr.responseText);
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
            if (G.BlahsMovingTimer != null) {
                var theEl = SelectRandomElement();
                if ((theEl != undefined) && (theEl.style.backgroundImage != "") && (theEl.blahTextDiv != null)) {
                    $(theEl.blahTextDiv).fadeToggle(1000, "swing", function() {
                        FadeTimer = setTimeout(FadeRandomElement, 100);
                    });
                    LastFadeElement = theEl;
                } else {
                    LastFadeElement = null;
                    FadeTimer = setTimeout(FadeRandomElement, 2000);
                }
            } else {
                clearTimeout(FadeTimer);
                FadeTimer = null;
            }
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
            var ratio = (desiredWidth - 300) / 340;
            smallTextSize = Math.round(10 + (10 * ratio)); //10-20
            mediumTextSize = Math.round(20 + (16 * ratio)); // 20-36
            largeTextSize = Math.round(30 + (22 * ratio)); // 30-52


            var blahBottom = 25;
            var blahTop = 25;
            var blahMargin = 16;
            G.IsNarrow = windowWidth < 450;
            G.IsShort = windowHeight < 600;

            if (G.IsMobile)
                G.IsShort = true;   // force short pages on mobile devices.
            if (G.IsiPad)
                G.IsShort = false;  // but not on iPad


            if (G.IsNarrow) {
                blahMargin = 0;
            }

            if (G.IsShort) {
                blahBottom = 0;
                blahTop = 0;
            }

            // manually address the lying iPhone.
            if (G.IsiPhone || G.IsiPad) {
                var titleBarSize = 20, browserControlSize;
                if (G.IsiPad)
                    browserControlSize = 75;
                else if (G.IsiPhone)
                    browserControlSize = 44;

                if (window.navigator.standalone)  // launched from home screen
                    browserControlSize = 0;
                var totalOffset = titleBarSize + browserControlSize;
                windowHeight -= totalOffset;
                //$(".PageBody").css({'bottom': totalOffset});
                //$("#BlahContainer").css({ 'bottom': totalOffset});
                $(document).css({"min-height":windowHeight + "px"});
            }

            if (windowWidth > windowHeight) {
                isVertical = false;
            } else {
                isVertical = true;
            }


            var totalGutter = K.EdgeGutter * 2 + K.InterBlahGutter * 2;

            G.SmallTileWidth = Math.floor((desiredWidth - totalGutter) / 3);

            G.MediumTileWidth = (G.SmallTileWidth * 2) + K.InterBlahGutter;
            G.LargeTileWidth = (G.SmallTileWidth * 3) + (K.InterBlahGutter * 2);
            //LargeTileWidth = (SmallTileWidth * 3) + (K.InterBlahGutter * 2);

            G.SmallTileHeight = G.SmallTileWidth;
            G.MediumTileHeight = G.MediumTileWidth ;
            //LargeTileHeight = LargeTileWidth;
            G.LargeTileHeight = G.MediumTileHeight;

            // now make the window the correct size
            var targetWidthWidth = (G.SmallTileWidth * 3) + totalGutter;
            var offset = Math.floor((windowWidth - targetWidthWidth) / 2);
            if (offset < 0)
                offset = 0;

            var channelBottom = $("#ChannelBanner")[0].getBoundingClientRect().bottom;
            $("#BlahContainer").css({ 'left': offset , 'right': offset });
            $("#ChannelBanner").css({ 'left': offset + 'px', 'width': targetWidthWidth + 'px' });
            $("#BlahFullItem").css({ 'top': blahTop,'left': (offset + blahMargin) , 'bottom': blahBottom, 'right': (offset + blahMargin)});
            $("#ChannelDropMenu").css({'top': channelBottom + "px"});


            // recompute scroll metrics
            G.MaxScrollSpeed = G.LargeTileHeight;  //3
            G.SwipeScrollInc = G.SmallTileHeight * .95;
            G.PageScrollInc = G.SmallTileHeight /6.5;
            G.ScrollStepInc = G.SmallTileHeight / 2;
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
                $("#LightBox").hide().css({"background-color": "rgba(0,0,0,.8)"});
                $(menu).fadeOut("fast");
                StartAnimation();
            }
        };

        var ShowChannelList = function() {
            var menu = document.getElementById("ChannelDropMenu");

            var banner = $("#ChannelBanner");
            menu.style.left = banner[0].style.left;
            //menu.style.width = banner.width() + "px";
            if (menu.style.display == "none") {
                $("#LightBox").css({"background-color": "rgba(0,0,0,.1)"}).show();
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
            caret.className = "channel-dropdown icon-caret-down";
            banner.appendChild(caret);




            var profile = document.createElement("div");
            profile.className = "profile-button";
            banner.appendChild(profile);

            var options = document.createElement("div");
            options.className = "ChannelOptions";
            banner.appendChild(options);
            banner.options = options;

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
                StopAnimation();
                var newHTML = "";
                newHTML += "<div class='click-shield menu'>" +
                    "<div class='instant-menu'>" +
                    "<div class='menu-profile-pic'></div>" +
                    "<div class='menu-username'>" + G.CurrentUser.N + "</div>" +
                    "<ul>" +
                    "<li id='ShowProfileItem'>Profile</li>" +
                    "<li id='ShowHistoryItem'>History</li>" +
                    "<li id='ShowStatsItem'>Stats</li>" +
                    "<li class='divider'></li>" +
                    "<li id='ShowAboutItem'>About Heard</li>" +
                    "<li class='divider'></li>" +
                    "<li id='LogOutItem'>Sign out</li>" +
                    "</ul></div></div>";

                $(document.body).append(newHTML);

                // Add profile image
                var newImage = G.GetUserImage(G.CurrentUser, "A");
                if (newImage != "") {
                    $(".menu-profile-pic").css({"background-image": "url('" + newImage + "')"});
                }

                $(".instant-menu").css({"right":$("#BlahContainer").css("right"),
                    "width":"0px"});

                $(".instant-menu").disableSelection();
                $(".click-shield").click(function (theEvent) {
                    $(".instant-menu").animate({"width":"0px"}, 200,function(){
                        DismissAll();
                        StartAnimation();
                    });
                });
                $("#ShowProfileItem").click(function (theEvent) {
                    DismissAll();
                    ShowUserProfile("Profile");
                });
                $("#ShowHistoryItem").click(function (theEvent) {
                    DismissAll();
                    ShowUserProfile("History");
                });
                $("#ShowStatsItem").click(function (theEvent) {
                    DismissAll();
                    ShowUserProfile("Stats");
                });
                $("#ShowAboutItem").click(function (theEvent) {
                    DismissAll();
                    window.open("http://www.goheard.com");
                });
                $("#LogOutItem").click(function (theEvent) {
                    DismissAll();
                    LogoutUser();
                });

                $(".instant-menu").animate({"width":"200px"}, 200);
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

        var DoBlahClick = function(e) {
            var theEvent = e || window.event;
            if (theEvent.which == 1) {
                var who = theEvent.target || theEvent.srcElement;
                while (who.hasOwnProperty("blah") == false) {
                    who = who.parentElement;
                }
                OpenBlah(who);
            }

        };

        var DoBlahMouseDown = function(e) {
            var theEvent = e || window.event;
            if (theEvent.which == 2) {
                G.CurrentScrollSpeed = 0;
            }

        };


        var CloseBlah = function() {
            RemoveBlahViewer();
            if ($(G.BlahFullItem).find("#CreateBlahPage").length) {
                StartAnimation();
                $(G.BlahFullItem).slideUp("fast", function() {
                    ga('send', 'pageview', {
                        'page': '/channel/' + G.CurrentChannel.N,
                        'title': G.CurrentChannel.N + " return"
                    });
                    $(G.BlahFullItem).hide();
                    $("#LightBox").hide();
                    $(G.BlahFullItem).empty();
                });
                return;
            }

            $("#AdditionalInfoArea").empty();
            switch (G.BlahReturnPage) {
                case "UserBlahList":
                    PopulateUserChannel("History");
                    break;

                default:
                    StartAnimation();
                    $(G.BlahFullItem).fadeOut("fast", function() {
                        ga('send', 'pageview', {
                            'page': '/channel/' + G.CurrentChannel.N,
                            'title': G.CurrentChannel.N + " return"
                        });
                        $(G.BlahFullItem).hide();
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
                G.CurrentScrollSpeed = K.BlahRollPixelStep;
            }

            if (FadeTimer != null) {
                clearTimeout(FadeTimer);
                FadeTimer = null;
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
            if ($(".click-shield").length > 0)
                $(".instant-menu").parent(".click-shield").remove();
            StartBlahsMoving();
        };

        var OpenLoadedBlah = function(whichBlah) {
            StopAnimation();
            if (!whichBlah)
                console.log("Null or missing blah in OpenLoadedBlah");
            $("#LightBox").show();
            G.CurrentBlah = whichBlah;
            G.CurrentComments = null;
            var blahPageBase = "BlahDetailPage.html";
            if (G.IsShort)
                blahPageBase = "BlahDetailPageShort.html"

            $("#BlahPreviewExtra").empty();

            require(["BlahDetailPage"], function(BlahDetailPage) {
                $(BlahFullItem).load(BlahguaConfig.fragmentURL + "pages/" + blahPageBase + " #FullBlahDiv", function() {
                    ga('send', 'pageview', {
                        'page': '/blah',
                        'title': G.CurrentBlah._id
                    });
                    var windowHeight = $(window).height();
                    $(BlahFullItem).disableSelection();
                    $(BlahFullItem).fadeIn("fast", function() {
                        BlahDetailPage.InitializePage();
                        StopAnimation();
                    });
                });
            });

            FlushViewMap();
        };

        var OpenBlah = function(whichBlah) {
            if (!whichBlah)
                console.log("Null or missing blah in OpenBlah");
            $("#LightBox").show();
            G.CurrentBlah = null;
            StopAnimation();
            G.CurrentBlahId = whichBlah.blah.I;
            PublishOpenBlah(G.CurrentBlahId);
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

        var GetBlahTypeColorFromId = function(theId) {
            var theColor = "#FFFFFF";
            switch (theId) {
                case K.BlahType.says:
                    theColor = "#3D7DAB";
                    break;
                case K.BlahType.leaks:
                    theColor = "#D34343";
                    break;
                case K.BlahType.polls:
                    theColor = "#FE8D4B";
                    break;
                case K.BlahType.predicts:
                    theColor = "#483950";
                    break;
                case K.BlahType.asks:
                    theColor = "#477C48";
                    break;
                case K.BlahType.ad:
                    theColor = "#FF0000";
                    break;
                default:
                    break;
            }
            return theColor;
        };

        var GetBlahTypeClassFromId = function(theId) {
            var theClass = "unknown-blahtype";   // default for new types
            switch (theId) {
                case K.BlahType.says:
                    theClass = "says-blahtype";
                    break;
                case K.BlahType.leaks:
                    theClass = "leaks-blahtype";
                    break;
                case K.BlahType.polls:
                    theClass = "polls-blahtype";
                    break;
                case K.BlahType.predicts:
                    theClass = "predicts-blahtype";
                    break;
                case K.BlahType.asks:
                    theClass = "asks-blahtype";
                    break;

                default:
                    break;
            }
            return theClass;
        };





// ********************************************************
// Create blah HTML

        var ONE_DAY = 24 * 60 * 60 * 1000;

        var CreateBaseDiv = function(theBlah) {
            var newDiv = document.createElement("div");
            if (!theBlah.hasOwnProperty("IsTemp"))
                AddBlahView(theBlah.I);
            newDiv.blah = theBlah;
            newDiv.className = "BlahDiv";
            newDiv.style.top = "0px";
            newDiv.style.position = "absolute";
            newDiv.onclick = DoBlahClick;
            newDiv.onmousedown = DoBlahMouseDown;
            newDiv.topBlah = [];
            newDiv.bottomBlah = [];


            var textDiv = document.createElement("div");
            textDiv.className = "BlahTextDiv";
            newDiv.appendChild(textDiv);
            newDiv.blahTextDiv = textDiv;
            $(textDiv).html(G.UnCodifyText(theBlah.T, true));
            switch (theBlah.displaySize) {
                case 1:
                    blahImageSize = "C";
                    $(textDiv).addClass("LargeBlahFormat");
                    break;
                case 2:
                    blahImageSize = "B";
                    $(textDiv).addClass("MediumBlahFormat");
                    break;
                case 3:
                    blahImageSize = "A";
                    $(textDiv).addClass("SmallBlahFormat");
                    break;
                case 4:
                    blahImageSize = "B";
                    $(textDiv).addClass("MediumBlahFormat");
                    break;
            }


            var imagePath = G.GetItemImage(theBlah, blahImageSize);
            if (imagePath != "") {
                newDiv.style.backgroundImage = "url('" + imagePath + "')";

                if ((theBlah.T == null) || (theBlah.T == "")) {
                    $(textDiv).remove();
                    newDiv.blahTextDiv = null;
                } else {
                    $(textDiv).addClass("BlahExpandTextDiv");
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
                        $(textDiv).addClass("BlahTypeAdImgText");
                        break;
                    default:
                        break;
                }


            }

            if (G.GetSafeProperty(G.CurrentChannel, "SSA", true)) {
                var arrowDiv = document.createElement("div");
                arrowDiv.className = "designator-arrow";
                newDiv.appendChild(arrowDiv);
            }




            return newDiv;

        };



        var CreateElementForBlah = function(theBlah) {
            var newEl = CreateBaseDiv(theBlah);
            var heightpaddingOffset = 2; // Setting this to zero causes a fault.
            var widthpaddingOffset = 0;

            if (theBlah.displaySize == 1) {
                newEl.style.width = G.LargeTileWidth - widthpaddingOffset + "px";
                newEl.style.height = G.LargeTileHeight - heightpaddingOffset + "px";
            } else if (theBlah.displaySize == 2) {
                newEl.style.width = G.MediumTileWidth - widthpaddingOffset + "px";
                newEl.style.height = G.MediumTileHeight - heightpaddingOffset + "px";
            } else if (theBlah.displaySize == 3) {
                newEl.style.width = G.SmallTileWidth - widthpaddingOffset + "px";
                newEl.style.height = G.SmallTileHeight - heightpaddingOffset + "px";
            } else {
                newEl.style.width = G.MediumTileWidth - widthpaddingOffset + "px";
                newEl.style.height = G.SmallTileHeight - heightpaddingOffset + "px";
            }

            switch (theBlah.Y) {
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
                case K.BlahType.says:
                default:
                    $(newEl).addClass("BlahTypeSays");
                    break;
            }

            if (G.CurrentUser && (theBlah.A == G.CurrentUser._id)) {
                // TO DO:  Indicator of user's own blah
                //$(newEl).addClass("users-own-blah");
                var usersOwnPostDiv = document.createElement("div");
                usersOwnPostDiv.className = "users-own-blah";
                newEl.appendChild(usersOwnPostDiv);
            }

            var holderDiv = document.createElement("div");
            $(holderDiv).addClass("blahdiv-lowerleft-box");
            $(newEl).append(holderDiv);

            if (theBlah.hasOwnProperty("B") && (theBlah.B.length > 0)) {
                // add a badge
                var badgeDiv = document.createElement("div");
                $(badgeDiv).addClass("badge-div");
                $(holderDiv).append(badgeDiv);
            }


            var now = (new Date()).getTime();
            if ((now - theBlah.c) < ONE_DAY) {
                var newBlahDiv = document.createElement("div");
                newBlahDiv.className = "new-blah";
                $(holderDiv).append(newBlahDiv);
            }

            var updatedDiv = document.createElement("div");
            $(updatedDiv).addClass("updated-bolt-div");
            $(holderDiv).append(updatedDiv);
            $(updatedDiv).hide();


            return newEl;
        };

        var DrawInitialBlahs = function() {
            if (G.ActiveBlahList.length > 0) {
                var curTop = document.getElementById("ChannelBanner").getBoundingClientRect().bottom + K.InterBlahGutter;
                var curRow = BuildNextRow();
                curRow.style.top = curTop + "px";
                $("#BlahContainer").empty().append(curRow);
                ResizeRowText(curRow);
                G.TopRow = curRow;
                curTop += curRow.rowHeight + K.InterBlahGutter;
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
                var newHTML = "<b>" + G.CurrentChannel.N + "</b> has no posts.  </br> ";

                if (G.IsUserLoggedIn) {
                    newHTML += "Maybe you can add the first!<br/>";
                } else {
                    newHTML += "Sign up and create the first!<br/>";
                }

                newDiv.innerHTML = newHTML;
                newDiv.className = "no-blahs-in-channel-warning";
                $("#BlahContainer").empty().append(newDiv);
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
            $(nextRow).find(".BlahExpandTextDiv").fadeOut(1000);
            ResizeRowText(nextRow);
            G.RowsOnScreen++;
            // to do - add blah specific animation
            StartBlahsMoving();
        };

        var ResizeRowText = function(newRow) {
            for (var i = 0; i < newRow.childNodes.length; i++) {
                curTextDiv = newRow.childNodes[i].blahTextDiv;
                if (curTextDiv != null) {
                    var displaySize = newRow.childNodes[i].blah.displaySize;
                    var newFontSize;

                    switch (displaySize) {
                        case 1:
                            newFontSize = largeTextSize;
                            break;
                        case 2:
                            newFontSize = mediumTextSize;
                            break;
                        case 3:
                            newFontSize = smallTextSize;
                            break;
                        case 4:
                            newFontSize = mediumTextSize;
                            break;
                    }

                    curTextDiv.style.fontSize = newFontSize.toString() + "px";
                }
            }
            /*
             var curTile;
             var textHeight;
             var fontSize;
             var maxFontSize = 96;
             var scaleText = false;
             var minFontSize = 11;
             var $curDiv, $curTextDiv, curFontSize, curDivHeight, curDivWidth;
             for (var i = 0; i < newRow.childNodes.length; i++) {
             $curDiv = $(newRow.childNodes[i]);
             curTextDiv = newRow.childNodes[i].blahTextDiv;
             if (curTextDiv != undefined) {
             $curTextDiv = $(curTextDiv);
             curTextDiv.style.fontSize = "96px";
             curFontSize = 96;
             curDivHeight = $curDiv.height();
             if ($curDiv[0].blah.displaySize != 3)
             curDivHeight = curDivHeight /2;



             while(($curTextDiv.height() > curDivHeight ) && (curFontSize > minFontSize)) {
             curFontSize--;
             curTextDiv.style.fontSize = curFontSize + "px";
             }

             curTextDiv.scrollLeft++;
             // now shrink the single word cases to not scroll horizontally
             while((curTextDiv.scrollLeft > 0) && (curFontSize > minFontSize)) {
             curTextDiv.scrollLeft = 0;
             curFontSize--;
             curTextDiv.style.fontSize = curFontSize + "px";
             curTextDiv.scrollLeft++;
             }
             var textShift = 0;

             if ((!$curDiv[0].blah.hasOwnProperty("M")))
             textShift = ($curDiv.height() - $curTextDiv.height()) / 2;

             $(curTextDiv).addClass("finished-sizing").css({"bottom":textShift + "px"})
             }
             }
             */
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
            if (G.BlahList.length > 0) {
                if (!isStarting) {
                    if (G.BlahsMovingTimer == null) {
                        G.CurrentScrollSpeed = K.BlahRollPixelStep;
                        G.BlahsMovingTimer = setTimeout(MakeBlahsMove, K.BlahRollScrollInterval);
                    }

                    if (FadeTimer == null) {
                        FadeRandomElement();
                    }
                }
            }

        };



        var MakeBlahsMove = function() {
            if (G.InitialBlah) {
                if (G.InitialChannel == null) {
                    Blahgua.GetBlah(G.InitialBlah, function(theBlah) {
                        G.InitialChannel = theBlah.G;
                        if (G.IsUserLoggedIn) {
                            if (!UserHasChannel(G.InitialChannel))
                                AddUserToChannel(G.InitialChannel);

                        } else {
                            // if anonymous, this channel must be public
                        }
                        SetCurrentChannelbyID(theBlah.G);
                    });
                } else {
                    // now we should be correctly on the channel...
                    Blahgua.GetBlah(G.InitialBlah, function(theBlah) {
                        OpenLoadedBlah(theBlah);
                    }, function (theErr) {
                        // todo: handle the missing blah.  For now we fail silently.
                    });
                    G.InitialBlah = null;
                    G.InitialChannel = null;
                }
            } else {
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
                        if (G.CurrentScrollSpeed > 0)  {
                            var oldSpeed = G.CurrentScrollSpeed;
                            DoAddBlahRow();
                            G.CurrentScrollSpeed = oldSpeed;
                        } else {
                            if (G.CurrentScrollSpeed < K.BlahRollPixelStep)
                                G.CurrentScrollSpeed = K.BlahRollPixelStep;
                            G.BlahsMovingTimer = setTimeout(MakeBlahsMove, K.BlahRollScrollInterval);
                        }

                    }
                    if (G.CurrentScrollSpeed < 1) {
                        // scrolling backwards, slow down
                        G.CurrentScrollSpeed *= .8;
                        if (G.CurrentScrollSpeed > -K.BlahRollPixelStep) {
                            G.CurrentScrollSpeed = K.BlahRollPixelStep;
                        }
                        // see if a new top row is on the screen...
                        if ((G.TopRow != null) && G.TopRow.hasOwnProperty("rowAbove") && (G.TopRow.rowAbove != null) && (G.TopRow.rowAbove.getBoundingClientRect().bottom > 0)) {
                            G.TopRow = G.TopRow.rowAbove;
                            G.RowsOnScreen++;
                        }
                    }
                    else if (G.CurrentScrollSpeed > K.BlahRollPixelStep) {
                        // skipping ahead - slow down
                        G.CurrentScrollSpeed *= 0.8;
                        if (G.CurrentScrollSpeed < K.BlahRollPixelStep) {
                            G.CurrentScrollSpeed = K.BlahRollPixelStep;
                        }
                    }
                }
            }

        };


// ********************************************************
// Manage the active blah list

        var RefreshActiveBlahList = function() {

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
                case "A":
                    newRowEl.rowHeight = G.SmallTileHeight;
                    CreateSSSRow(newRowEl);
                    break;
                case "B":
                    newRowEl.rowHeight = G.MediumTileHeight;
                    CreateSSMRow(newRowEl);
                    break;
                case "C":
                    newRowEl.rowHeight = G.MediumTileHeight;
                    CreateMSSRow(newRowEl);
                    break;
                case "D":
                    newRowEl.rowHeight = G.SmallTileHeight;
                    CreateSHRow(newRowEl);
                    break;
                case "E":
                    newRowEl.rowHeight = G.SmallTileHeight;
                    CreateHSRow(newRowEl);
                    break;
                case "F":
                    newRowEl.rowHeight = G.LargeTileHeight;
                    CreateLRow(newRowEl);
                    break;
            }

            curRowSequence++;
            if (curRowSequence >= rowSequence.length)
                curRowSequence = 0;

            // start fading on images...
            return newRowEl;
        };

        var CreateSSSRow = function(newRowEl) {
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
            newRowEl.setAttribute("rowType", "SSS");
        };

        var ResizeSSSRow = function(theRow) {
            var heightpaddingOffset = 2;
            var widthpaddingOffset = 0;
            var curLeft = K.EdgeGutter + (G.SmallTileWidth + K.InterBlahGutter);
            theRow.childNodes[0].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[0].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";

            theRow.childNodes[1].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[1].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[1].style.left = curLeft + "px";

            curLeft += (G.SmallTileWidth + K.InterBlahGutter);

            theRow.childNodes[2].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[2].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[2].style.left = curLeft + "px";

            return G.SmallTileHeight;
        };

        var CreateSSMRow = function(newRowEl) {
            var curLeft = K.EdgeGutter;
            var theBlah = GetNextMatchingBlah(3);
            var newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newRowEl.appendChild(newBlahEl);

            theBlah = GetNextMatchingBlah(3);
            newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
            newRowEl.appendChild(newBlahEl);

            curLeft += G.SmallTileWidth + K.InterBlahGutter;
            theBlah = GetNextMatchingBlah(2);
            newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newRowEl.appendChild(newBlahEl);
            newRowEl.setAttribute("rowType", "SSM");
        };

        var ResizeSSMRow = function(theRow) {
            var heightpaddingOffset = 2;
            var widthpaddingOffset = 0;
            var curLeft = K.EdgeGutter + (G.SmallTileWidth + K.InterBlahGutter);
            var curTop = G.SmallTileHeight + K.InterBlahGutter;
            theRow.childNodes[0].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[0].style.height = (G.SmallTileWidth - heightpaddingOffset) + "px";

            theRow.childNodes[1].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[1].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[1].style.top = curTop + "px";

            theRow.childNodes[2].style.width = (G.MediumTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[2].style.height = (G.MediumTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[2].style.left = curLeft + "px";

            return G.MediumTileHeight;
        };

        var CreateSHRow = function(newRowEl) {
            var curLeft = K.EdgeGutter;
            var theBlah = GetNextMatchingBlah(3);
            var newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newRowEl.appendChild(newBlahEl);

            curLeft += G.SmallTileWidth + K.InterBlahGutter;
            theBlah = GetNextMatchingBlah(4);
            newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newRowEl.appendChild(newBlahEl);
            newRowEl.setAttribute("rowType", "SH");
        };

        var ResizeSHRow = function(theRow) {
            var heightpaddingOffset = 2;
            var widthpaddingOffset = 0;
            var curLeft = K.EdgeGutter + G.SmallTileWidth + K.InterBlahGutter;
            theRow.childNodes[0].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[0].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";

            theRow.childNodes[1].style.width = (G.MediumTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[1].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[1].style.left = curLeft + "px";

            return G.SmallTileHeight;
        };

        var CreateHSRow = function(newRowEl) {
            var curLeft = K.EdgeGutter;
            var theBlah = GetNextMatchingBlah(4);
            var newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newRowEl.appendChild(newBlahEl);

            curLeft += G.MediumTileWidth + K.InterBlahGutter;
            theBlah = GetNextMatchingBlah(3);
            newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newRowEl.appendChild(newBlahEl);
            newRowEl.setAttribute("rowType", "HS");
        };

        var ResizeHSRow = function(theRow) {
            var heightpaddingOffset = 2;
            var widthpaddingOffset = 0;
            var curLeft = K.EdgeGutter + G.MediumTileWidth + K.InterBlahGutter;
            theRow.childNodes[0].style.width = (G.MediumTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[0].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";

            theRow.childNodes[1].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[1].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[1].style.left = curLeft + "px";

            return G.SmallTileHeight;
        };

        var CreateMSSRow = function(newRowEl) {
            var curLeft = K.EdgeGutter;
            var theBlah = GetNextMatchingBlah(2);
            var newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newBlahEl.style.top = "0px";
            newRowEl.appendChild(newBlahEl);

            curLeft += G.MediumTileWidth + K.InterBlahGutter;
            theBlah = GetNextMatchingBlah(3);
            newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newBlahEl.style.top = "0px";
            newRowEl.appendChild(newBlahEl);
            newRowEl.setAttribute("rowType", "MSS");


            theBlah = GetNextMatchingBlah(3);
            newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = curLeft + "px";
            newBlahEl.style.top = (G.SmallTileHeight + K.InterBlahGutter) + "px";
            newRowEl.appendChild(newBlahEl);
        };

        var ResizeMSSRow = function(theRow) {
            var heightpaddingOffset = 2;
            var widthpaddingOffset = 0;
            var curLeft = K.EdgeGutter + G.MediumTileWidth + K.InterBlahGutter;
            var curTop = G.SmallTileHeight + K.InterBlahGutter;
            theRow.childNodes[0].style.width = (G.MediumTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[0].style.height = (G.MediumTileHeight - heightpaddingOffset) + "px";

            theRow.childNodes[1].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[1].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[1].style.left = curLeft + "px";

            theRow.childNodes[2].style.width = (G.SmallTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[2].style.height = (G.SmallTileHeight - heightpaddingOffset) + "px";
            theRow.childNodes[2].style.left = curLeft + "px";
            theRow.childNodes[2].style.top = curTop + "px";

            return G.MediumTileHeight;
        };

        var CreateLRow = function(newRowEl) {
            var theBlah = GetNextMatchingBlah(1);
            var newBlahEl = CreateElementForBlah(theBlah);
            newBlahEl.style.left = K.EdgeGutter + "px";
            newRowEl.appendChild(newBlahEl);
            newRowEl.setAttribute("rowType", "L");
        };

        var ResizeLRow = function(theRow) {
            var heightpaddingOffset = 2;
            var widthpaddingOffset = 0;
            theRow.childNodes[0].style.width = (G.LargeTileWidth - widthpaddingOffset) + "px";
            theRow.childNodes[0].style.height = (G.LargeTileHeight - heightpaddingOffset) + "px";
            return G.LargeTileHeight;
        };

// ********************************************************
// Getting the current inbox for the current user


        var GetUserBlahs = function() {
            InboxCount = 0;
            Blahgua.GetNextBlahs(OnGetBlahsOK, function(theErr) {
                // just assume no blahs

                if (theErr.statusText == "timeout") {
                    // try again for good lock
                    Blahgua.GetNextBlahs(OnGetBlahsOK, function(theError) {
                        if (theErr.statusText == "timeout") {
                            console.log("Timeout trying to get blahs");
                        }
                        else
                            console.log("Error in GetUserBlahs: " + theErr.status + " - " + theErr.responseText);
                        OnGetBlahsOK([]);
                    });
                } else {
                    console.log("Error in GetUserBlahs: " + theErr.status + " - " + theErr.responseText);
                    OnGetBlahsOK([]);
                }


            });
        };

        var OnGetBlahsOK = function(theResult) {
            console.log("loaded " + theResult.length + " blahs");
            G.BlahList = theResult;
            G.NextBlahList = [];
            if (theResult.length > 0) {
                var numInboxes =  (G.CurrentChannel.L - G.CurrentChannel.F) + 1;
                if ((theResult.length < 100) && (numInboxes > 1)) {
                    console.log("loaded partial inbox of " + theResult.length + " blahs");
                    // we got less than 100 blahs but there are more out there.
                    // grab a random other inbox
                    var inboxNum = G.CurrentChannel.F + Math.floor(Math.random() * (numInboxes - 1));
                    Blahgua.GetSpecificInbox(inboxNum, function(theBlahs) {
                        var blahsNeeded = 100 - G.BlahList.length;
                        G.BlahList = G.BlahList.concat(theBlahs.slice(0,blahsNeeded));
                        console.log("...added more to make inbox of " + G.BlahList.length + " blahs");
                        FinalizeInitialBlahLoad();
                    }, function(theErr) {
                        console.log("Error getting random inbox");
                        FinalizeInitialBlahLoad();
                    });
                } else {
                    console.log("loaded " + theResult.length + " blahs");
                    FinalizeInitialBlahLoad();
                }
            } else  {
                FinalizeInitialBlahLoad();
            }
        };

        var FinalizeInitialBlahLoad = function() {
            G.BlahList = PrepareBlahList(G.BlahList);
            G.ActiveBlahList = [];
            RefreshActiveBlahList();
            DrawInitialBlahs();
            if (G.BlahList.length > 0)
            {
                StartAnimation();
            }
            GetNextBlahList();

            // check for create
            MaybeCreateBlah();


        };


        var MaybeCreateBlah = function() {
            var createParam = getQueryVariable("post");
            if (createParam != null) {
                if (G.IsUserLoggedIn) {

                    var title = getQueryVariable("title");
                    var body = getQueryVariable("body");
                    var url = getQueryVariable("url");

                    if (!body)
                        body = '';
                    if (url)
                        body += "\n \n" + url;
                    window.history.replaceState("object or string", "Blahgua", "/");
                    DoCreateBlah(title, body);


                } else {
                    alert("You must sign in to post");
                    ShowSignInUI();

                }

            }
        };




        var NormalizeStrengths = function(theBlahList) {
            // ensure 100 blahs
            if (theBlahList.length < 100) {
                theBlahList.sort(function(a,b) {
                    return a.S - b.S;
                });

                var startLoc = theBlahList.length - 1;
                var curLoc = startLoc;
                while (theBlahList.length < 100) {
                    theBlahList.push(theBlahList[curLoc--]);
                    if (curLoc == 0)
                        curLoc = startLoc;
                }
            }
        };

        var AssignSizes = function(theBlahList) {
            // makes sure that there are a good ration of large, medium, small
            var numHorizontal = 12;
            var numLarge = 4;
            var numMedium = 8;

            if (rowSequence == 1) {
                numHorizontal = 0;
                numLarge = 4;
                numMedium = 16;
            }
            // the rest are small - presumably 40, since we get 100 blahs

            // first, sort the blahs by their size
            theBlahList = theBlahList.sort(function (a, b) {
                if (a.S == b.S)
                    return 0;
                else if (a.S > b.S)
                    return -1;
                else
                    return 1;
            });

            var i = 0;
            while (i < numLarge) {
                theBlahList[i++].displaySize = 1;
            }

            while (i < (numMedium + numLarge)) {
                theBlahList[i++].displaySize = 2;
            }

            while (i < (numMedium + numLarge + numHorizontal)) {
                theBlahList[i++].displaySize = 4;
            }

            while (i < theBlahList.length) {
                theBlahList[i++].displaySize = 3;
            }

            return theBlahList;
        };

        var IsBlahValid = function(theBlah) {
            if (theBlah.hasOwnProperty("A") &&
                theBlah.hasOwnProperty("I") &&
                (theBlah.I.length > 1))  {
                return true;
            } else
                return false
        };

        var removeInvalidBlahs = function(theList) {
            var curIndex = 0;

            while (curIndex < theList.length) {
                if (!IsBlahValid(theList[curIndex])) {
                    theList.splice(curIndex, 1);
                } else {
                    curIndex++;
                }
            }
        };

        var PrepareBlahList = function(theBlahList) {
            // ensure 100 blahs
            if (theBlahList.length > 0) {
                if (theBlahList.length < 100) {
                    var curLoc = 0;
                    while (theBlahList.length < 100) {
                        theBlahList.push(jQuery.extend({}, theBlahList[curLoc++]));
                    }
                }

                // sort by strength
                theBlahList = AssignSizes(theBlahList);
            }

            return theBlahList;
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

        var isChannelValid = function(theChannel) {
            return true;
            var isValid = false;
            for (var curType in G.ChannelTypes) {
                if (G.ChannelTypes[curType]._id == theChannel.Y)  {
                    isValid =  true;
                    break;
                }

            }

            return isValid;
        };



        var GetUserChannels = function() {
            Blahgua.GetChannelTypes(function (theTypes) {
                G.ChannelTypes = theTypes;
                if (G.IsUserLoggedIn) {
                    Blahgua.GetUserChannels(GetChannelsOK, OnFailure);
                } else {
                    Blahgua.GetFeaturedChannels(function (channelList) {

                            GetChannelsOK(channelList);
                        },
                        OnFailure);
                }
            }, OnFailure);
        };


        var GetChannelsOK = function(theChannels) {
            G.ChannelList = theChannels;

            if (G.ChannelList.length == 0) {
                AddDefaultChannelsToNewUser();
            } else {
                SetInitialChannel();
            }
        };
        var defChannel = null;

        var SetInitialChannel = function() {
            defChannel = getQueryVariable('channel')
            if (defChannel != null) {
                defChannel = defChannel.toLowerCase();
                for (var curIndex in G.ChannelList) {
                    if (G.ChannelList[curIndex].N.toLowerCase() == defChannel) {
                        EnsureChannelInfo(defChannel);
                        return;
                        break;
                    }
                }
                // if we got here, the user does not have this channel
                // fetch all of the channels and add it
                if (G.IsUserLoggedIn) {
                    Blahgua.GetAllChannels(function (allChannels) {
                        for (var curIndex in allChannels) {
                            if (allChannels[curIndex].N.toLowerCase() == defChannel)
                            {
                                Blahgua.JoinUserToChannel(allChannels[curIndex]._id, function() {
                                    G.ChannelList.splice(0,0,allChannels[curIndex]);
                                    PopulateChannelInfo(allChannels);
                                    EnsureChannelInfo(defChannel);
                                }, OnFailure);
                                break;
                            }
                        }
                    }, OnFailure);
                } else {
                    // for some reason the channel is not available..
                    // TO DO: show a warning
                    EnsureChannelInfo();
                }
            } else {
                // no initial channel, just use channel 0
                EnsureChannelInfo();
            }
        };

        var PopulateChannelInfo = function(allChannels) {
            for (var curChannel in G.ChannelList) {
                for (var curSubChannel in allChannels) {
                    if (allChannels[curSubChannel].N == G.ChannelList[curChannel].N) {
                        G.ChannelList[curChannel].F = allChannels[curSubChannel].F;
                        G.ChannelList[curChannel].L = allChannels[curSubChannel].L;
                        break;
                    }
                }
            }
        };

        var EnsureChannelInfo = function(theChannel) {
            var channelNum = 0;
            PopulateChannelMenu();
            if (theChannel) {
                for (var curIndex in G.ChannelList) {
                    if (G.ChannelList[curIndex].N.toLowerCase() == theChannel) {
                        channelNum = curIndex;
                        break;
                    }
                }
            }

            if (G.ChannelList[0].hasOwnProperty("F")) {
                SetCurrentChannel(channelNum);
            } else {
                Blahgua.GetAllChannels(function (allChannels) {
                    PopulateChannelInfo(allChannels);
                    SetCurrentChannel(channelNum);
                }, function(theErr){
                    // could not get all channels - maybe not signed in??
                    SetCurrentChannel(channelNum);
                });
            }
        };


        var PopulateChannelMenu = function( ) {
            var newHTML = "";

            if (!G.IsUserLoggedIn) {
                for(var i = G.ChannelList.length-1; i >= 0; i--){
                    if (G.ChannelList[i].R < 0) {
                        if (G.ChannelList[i].N.toLowerCase() == defChannel){
                            G.ChannelList =  [].concat(G.ChannelList[i]);
                            break;
                        } else {
                            G.ChannelList.splice(i,1);
                        }
                    }
                }
            }

            G.ChannelList.sort(function (a, b) {
                return Math.abs(G.GetSafeProperty(a, "R", 0)) - Math.abs(G.GetSafeProperty(b, "R", 0));
            });

            $.each(G.ChannelList, function(index, element) {
                newHTML += createChannelHTML(index, element);
            });

            if ((G.CurrentUser != null) &&
                G.GetSafeProperty(G.CurrentUser, "ad", false)) {
                newHTML += createManageChannelHTML();
            }

            $("#ChannelList").html(newHTML);

            $("#ChannelList img").error(imgError);
            $("tr[data-channelId]").click(DoJumpToChannel);
            $("#ManageChannels").click(DoManageChannels);

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
            newHTML += "<tr data-channelId='" + index + "'><td><span class='channel-title'>" + curChannel.N + "</span></td>";
            newHTML += "</tr>";
            return newHTML;
        };

        var createManageChannelHTML = function() {
            var newHTML = "";
            newHTML += "<tr style='pointer-events:none'><td><hr /></td></tr>";
            newHTML += "<tr id='ChannelManagerRow'><td>";
            newHTML += " <span id='ManageChannels' class='manage-channel-title'>Manage Channels...</span>";
            newHTML += "</td>";
            newHTML += "</tr>";
            return newHTML;
        };

        var DoJumpToChannel = function(theEvent) {
            var channelID = $(this).attr("data-channelId");
            HideChannelList();
            SetCurrentChannel(channelID);
        };

        var DoManageChannels = function(theEvent) {
            HideChannelList();
            ShowMangeChannelsUI();
        };

        var loadingHTML = '<div class="ChannelLoadingDiv"><img src="https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/green-spinner.gif" alt="Loading"><span>Loading...</span></div>';

        var SetCurrentChannel = function(whichChannel) {
            StopAnimation();
            $("#BlahContainer").html(loadingHTML);
            var newChan = G.ChannelList[whichChannel];
            if ((G.CurrentChannel != null) && (newChan._id != G.CurrentChannel._id)) {
                RemoveChannelViewer();
            }

            G.CurrentChannel = G.ChannelList[whichChannel];
            Blahgua.currentChannel = G.CurrentChannel._id;

            var labelDiv = document.getElementById("ChannelBannerLabel");
            labelDiv.innerHTML = G.CurrentChannel.N;

            GetUserBlahs();
            UpdateChannelViewers();
            ga('send', 'pageview', {
                'page': '/channel/' + G.CurrentChannel.N,
                'title': G.CurrentChannel.N
            });

            Blahgua.GetChannelPermissionById(G.CurrentChannel._id, UpdateForChannelPermissions);
        };

        var UpdateForChannelPermissions = function(permRecord) {
            var canPost = G.GetSafeProperty(permRecord, "post", false);
            var canComment = G.GetSafeProperty(permRecord, "comment", false);
            var admin = G.GetSafeProperty(permRecord, "admin", false);
            if (admin)
                $("div .ChannelOptions").show();
            else
                $("div .ChannelOptions").hide();

            G.UserCanComment = canComment;
        };


        var InboxCount = 0;
        var MaxInboxCount = 10;

        var GetNextBlahList = function() {
            InboxCount++;
            if (InboxCount > MaxInboxCount)
                TruncateBlahStream();
            else
                Blahgua.GetNextBlahs(OnGetNextBlahsOK, function(theErr) {
                    console.log("Error in GetNextBlahList: " + theErr.status + " - " + theErr.statusText);
                    OnGetNextBlahsOK([]);
                });
        };

        var TruncateBlahStream = function() {
            location.reload();
        };

        var OnGetNextBlahsOK = function(theResult) {
            G.NextBlahList = theResult;
            if (theResult.length > 0) {
                var numInboxes =  (G.CurrentChannel.L - G.CurrentChannel.F) + 1;
                if ((theResult.length < 100) && (numInboxes > 1)) {
                    console.log("loaded next partial inbox of " + theResult.length + " blahs");
                    // we got less than 100 blahs but there are more out there.
                    // grab a random other inbox
                    var inboxNum = G.CurrentChannel.F + Math.floor(Math.random() * (numInboxes - 1));
                    Blahgua.GetSpecificInbox(inboxNum, function(theBlahs) {
                        var blahsNeeded = 100 - G.NextBlahList.length;
                        G.NextBlahList = G.NextBlahList.concat(theBlahs.slice(0,blahsNeeded));
                        console.log("...added more to make inbox of " + G.NextBlahList.length + " blahs");
                        G.NextBlahList = PrepareBlahList(G.NextBlahList);
                    }, function(theErr) {
                        console.log("Error getting random inbox");
                        G.NextBlahList = PrepareBlahList(G.NextBlahList);
                    });
                } else {
                    console.log("loaded next inbox of " + theResult.length + " blahs");
                    G.NextBlahList = PrepareBlahList(G.NextBlahList);
                }
            }
            FlushViewMap();
            ga('send', 'pageview', {
                'page': '/channel/' + G.CurrentChannel.N,
                'title': G.CurrentChannel.N + " refresh"
            });

        };


// *****************************************
// User Channel

        var ShowUserProfile = function(whichPage) {
            if (whichPage == undefined)
                whichPage = "Profile";
            StopAnimation();
            $("#LightBox").show();
            $("#BlahFullItem").empty();
            if (G.IsUserLoggedIn) {
                if (G.CurrentUser == null) {
                    Blahgua.GetCurrentUser(function (theResult) {
                        G.CurrentUser = theResult;
                        PopulateUserChannel(whichPage);
                    }, OnFailure);
                }
                else {
                    PopulateUserChannel(whichPage);
                }
            } else {
                var basePage = "SignUpPage.html";
                if (G.IsShort)
                    basePage = "SignUpPageShort.html";

                require(['SignUpPage'], function(SignUpPage) {
                    $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #SignInInDiv",
                        function () {
                            ga('send', 'pageview', {
                                'page': '/signup',
                                'title': 'signup'
                            });
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
            var basePage = "SignUpPage.html";
            if (G.IsShort)
                basePage = "SignUpPageShort.html";
            require(['SignUpPage'], function(SignUpPage) {
                    $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #SignInInDiv",
                        function () {
                            ga('send', 'pageview', {
                                'page': '/signup',
                                'title': 'signup'
                            });
                            SignUpPage.RefreshSignupContent();
                        });
                }
            );
        };

        var ShowMangeChannelsUI = function(whichChannel) {

            // empty whatever is in there now
            StopAnimation();
            $("#LightBox").show();
            $("#BlahFullItem").empty();
            var basePage = "ManageChannelsPage.html";
            //if (G.IsShort)
            //    basePage = "SignUpPageShort.html";
            require(['ManageChannelsPage'], function(ManageChannelsPage) {
                    $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #ManageChannelsDiv",
                        function () {
                            ga('send', 'pageview', {
                                'page': '/managechannels',
                                'title': 'managechannels'
                            });
                            ManageChannelsPage.RefreshContent(whichChannel);
                        });
                }
            );
        };

        var SuggestUserSignIn = function(message) {
            if (G.CurrentBlah != null)
                G.InitialBlah = G.CurrentBlahId;
            var basePage = "SignUpPage.html";
            if (G.IsShort)
                basePage = "SignUpPageShort.html";
            require(['SignUpPage'], function(SignUpPage) {
                $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #SignInInDiv", function() {
                    ga('send', 'pageview', {
                        'page': '/signup',
                        'title': 'signup - ' + message
                    });
                    SignUpPage.RefreshSignupContent(message);
                });
            });
        };


        var PopulateUserChannel = function(whichPage) {
            var selfPageBase = "SelfPage.html";
            if (G.IsShort)
                selfPageBase = "SelfPageShort.html";
            require(["SelfPage"], function(SelfPage){
                $("#BlahFullItem").load(BlahguaConfig.fragmentURL + "pages/" + selfPageBase + " #UserChannelDiv", function() {
                    ga('send', 'pageview', {
                        'page': '/self',
                        'title': G.CurrentUser._id
                    });
                    SelfPage.InitializePage(whichPage);
                });
            });
        };


        var ClosePage = function() {
            ga('send', 'pageview', {
                'page': '/channel/' + G.CurrentChannel.N,
                'title': G.CurrentChannel.N + " return"
            });
            if (isStarting) {
                isStarting = false;
                clearTimeout(splashTimeout);
                splashTimeout = null;
            }
            $("#BlahFullItem").fadeOut();
            $("#LightBox").fadeOut();
            StartAnimation();
        };



        var UpdateChannelViewers = function() {
            var newChanStr = "heard" + G.CurrentChannel._id;
            pubnub.subscribe({
                channel : newChanStr,
                callback : UpdateChannelMessage,
                error:  function(e) {HandleChannelError(e)},
                presence: HandleChannelPresence,
                connect: function(){console.log("Connected")},
                disconnect: function(){console.log("Disconnected")},
                reconnect: function(){console.log("Reconnected")}
            });

            CurrentPushChannel = newChanStr;
        };

        var RemoveChannelViewer = function() {
            if (G.CurrentChannel != null) {
                pubnub.unsubscribe({
                    channel: "heard" + String(G.CurrentChannel.id)
                });
                CurrentPushChannel = null;
            }
        };

        var UpdateBlahViewer = function (msgCallback) {
            var newChanStr = "blah" + G.CurrentBlah._id;
            pubnub.subscribe({
                channel : newChanStr,
                callback : msgCallback,
                error:  function(e) {HandleChannelError(e)},
                presence: HandleBlahChannelPresence,
                connect: function(){console.log("Connected")},
                disconnect: function(){console.log("Disconnected")},
                reconnect: function(){console.log("Reconnected")}
            });

            Exports.CurrentBlahPushChannel = newChanStr;
        };

        var RemoveBlahViewer = function () {
            if (G.CurrentChannel != null) {
                pubnub.unsubscribe({
                    channel: "blah" + String(G.CurrentBlah.id)
                });
                Exports.CurrentBlahPushChannel = null;
            }
        };


        var HandleBlahChannelPresence = function(theMsg, thEnv, theChan) {
            var numFolks = G.GetSafeProperty(theMsg,"occupancy",1 );
            UpdateBlahChannelCount(numFolks);
        };


        var UpdateBlahChannelCount = function(theCount) {
            var theString = " people";
            if (theCount == 1)
                theString = " person";
            $(".channel-presence-count").text(theCount + theString + " reading this post").slideDown(200).delay(2000).slideUp(500);
        };

        var HandleChannelPresence = function(theMsg, thEnv, theChan) {
            if ((Exports.CurrentBlahPushChannel == null) &&
                (CurrentPushChannel == theChan)) {
                var numFolks = G.GetSafeProperty(theMsg, "occupancy", 1);
                UpdateChannelCount(numFolks);
            }
        };



        var UpdateChannelCount = function(theCount) {
            var theString = " people";
            if (theCount == 1)
                theString = " person";
            $(".channel-presence-count").text(theCount + theString + " in channel").slideDown(200).delay(2000).slideUp(500);
        };

        var UpdateChannelMessage = function(msgObj, env, channel) {
            if (channel == CurrentPushChannel) {


                var action = G.GetSafeProperty(msgObj, "action", "none");


                switch (action) {
                    case "openblah":
                    case "blahactivity":
                        var curBlahId = G.GetSafeProperty(msgObj, "blahid", 0);

                        HighlightBlahActivity(curBlahId);
                        break;

                }
            }
        };

        var HandleChannelError = function(theErr) {
            console.log(theErr);
        };

        var PublishMessage = function(theChannelStr, theMsg, theCallback) {
            pubnub.publish({
                channel: theChannelStr,
                message: theMsg
            });
        };

        var PublishChannelMessage = function(theMsg) {
            PublishMessage("heard" + G.CurrentChannel._id, theMsg, null);
        };

        var PublishBlahMessage = function(theMsg) {
            PublishMessage("blah" + G.CurrentBlah._id, theMsg, null);
        };

        var PublishOpenBlah = function(blahId) {
            var msg = new Object();
            var userId = 0;
            if (G.CurrentUser != null)
                userId = G.CurrentUser._id;

            msg["action"] = "openblah";
            msg["blahid"] = blahId;
            msg["userid"] = userId;
            PublishChannelMessage(msg);
        };

        var PublishBlahActivity = function(blahId) {
            var msg = new Object();
            var userId = 0;
            if (G.CurrentUser != null)
                userId = G.CurrentUser._id;

            msg["action"] = "blahactivity";
            msg["blahid"] = blahId;
            msg["userid"] = userId;
            PublishChannelMessage(msg);
        };

        var PublishNewComment = function(commentId) {
            PublishBlahActivity(G.CurrentBlah._id);
            var msg = new Object();
            var userId = 0;
            if (G.CurrentUser != null)
                userId = G.CurrentUser._id;

            msg["action"] = "comment";
            msg["commentid"] = commentId;
            msg["userid"] = userId;
            PublishBlahMessage(msg);
        };

        var OnChannelViewersOK = function(numViewers) {
            $("#ChannelViewersCountText").html(G.GetSafeProperty(numViewers, "V", 0));
        };

        var HighlightBlahActivity = function(blahId) {
            $("#BlahContainer").find(".BlahDiv").each(function(index, element) {
                var curBlah = element.blah;
                if (curBlah.I == blahId) {
                    $(element).find(".updated-bolt-div").stop().show().fadeOut(2000);
                }
            });
        }


        var DoCreateBlah = function(title, body) {
            StopAnimation();
            $("#LightBox").show();
            var basePage = "CreateBlahPage.html";
            if (G.IsShort)
                basePage = "CreateBlahPageShort.html";
            if (G.IsUserLoggedIn) {
                require(["CreateBlahPage"], function(CreatePage) {
                    $(BlahFullItem).load(BlahguaConfig.fragmentURL + "pages/" + basePage + " #CreateBlahPage", function() {
                        ga('send', 'pageview', {
                            'page': '/createblah',
                            'title': G.CurrentUser._id
                        });
                        CreatePage.InitializePage(title, body);
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


        var LogoutUser = function(allowRelogin) {
            Blahgua.logoutUser(function(theJson) {
                if (allowRelogin == true)
                    HandleRelogin(theJson);
                else
                    OnLogoutOK();
            }, function(theErr){
                switch (theErr.status) {
                    case 202:
                        // this is not an error, just malformed JSON
                        if (allowRelogin == true) {
                            HandleRelogin();
                        } else
                            OnLogoutOK();
                        break;
                    default:
                        OnFailure(theErr);
                }
            });
        };

        var OnLogoutOK = function() {
            G.ClearSessionTimer();
            G.IsUserLoggedIn = false;
            refreshSignInBtn();
            G.CurrentUser = null;
            ClosePage();
            GetUserChannels();
        };

        var HandleRelogin = function() {
            G.ClearSessionTimer();
            var savedID = $.cookie("loginkey");
            var userName = null, pwd;

            if (savedID) {
                savedID = JSON.parse(G.Cryptify("Sheep", savedID));
                userName = savedID.userId;
                pwd = savedID.pwd;
            }

            if (userName != null) {
                // sign in
                Blahgua.loginUser(userName, pwd, function() {
                    G.IsUserLoggedIn = true;
                    Blahgua.GetProfileSchema(function(theSchema) {
                        G.ProfileSchema = theSchema.fieldNameToSpecMap;
                        Blahgua.getUserInfo(RefreshPageForNewUser, OnFailure);
                    }, exports.OnFailure);
                }, function() {
                    OnLogoutOK();

                });
            } else {
                OnLogoutOK();
            }
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
        Exports.ShowMangeChannelsUI = ShowMangeChannelsUI;
        Exports.GetBlahTypeId = GetBlahTypeId;
        Exports.GetBlahTypeNameFromId = GetBlahTypeNameFromId;
        Exports.GetBlahTypeColorFromId = GetBlahTypeColorFromId;
        Exports.GetBlahTypeClassFromId = GetBlahTypeClassFromId;
        Exports.GetBlahTypeStr = GetBlahTypeStr;
        Exports.LogoutUser = LogoutUser;
        Exports.ForgetUser = ForgetUser;
        Exports.SuggestUserSignIn = SuggestUserSignIn;
        Exports.OpenLoadedBlah = OpenLoadedBlah;
        Exports.SetCurrentChannelById = SetCurrentChannelbyID;
        Exports.UpdateBlahViewer = UpdateBlahViewer;
        Exports.PublishChannelMessage = PublishChannelMessage;
        Exports.PublishBlahActivity = PublishBlahActivity;
        Exports.PublishNewComment = PublishNewComment;



        return {
            InitializeBlahgua: InitializeBlahgua
        }
    });


