/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/23/13
 * Time: 6:08 PM
 * To change this template use File | Settings | File Templates.
 */

define('globals',
    ["constants"],
    function (K) {

        var Initialize = function() {

        };

        // extend jquery
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
                                .bind('selectstart', function (theEvent)
                                {
                                    if (theEvent.target) {
                                        switch (theEvent.target.nodeName){
                                            case "TEXTAREA":
                                            case "INPUT":
                                                break;
                                            default:
                                                return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                });
                        });
                });
            };
        })(jQuery);

        var BlahsMovingTimer = null;
        var BlahPreviewTimeout = null;
        var ViewerUpdateTimer = null;
        var BlahList = null;
        var NextBlahList = null;
        var LargeTileWidth = 400;
        var MediumTileWidth = 200;
        var SmallTileWidth = 100;
        var LargeTileHeight = 400;
        var MediumTileHeight = 200;
        var SmallTileHeight = 100;
        var ActiveBlahList = [];
        var TopRow = null;
        var BottomRow = null;
        var RowsOnScreen = 10;
        var BlahFullItem = null;
        var CurrentBlah = null;
        var CurrentBlahId = null;
        var CurrentComments = null;
        var CurrentChannel = null;
        var CurrentUser = null;
        var ChannelList = [];
        var BlahTypeList = null;
        var IsUserLoggedIn = false;
        var ChannelDropMenu = null;
        var fragmentURL = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com";
        var ProfileSchema = null;
        var UserProfile = null;
        var CurrentBlahNickname = "";
        var BlahReturnPage = "";
        var numStatsDaysToShow = 7;
        var BlahOpenPage = "Overview";
        var CurrentScrollSpeed = K.BlahRollPixelStep;
        var resizeTimer = null;
        var SpinElement = null;
        var SpinTarget = null;
        var SessionTimer = null;
        var TimeoutFunction = null;
        var numMinutes = 1;

        var URLRegEx = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

        /*
         Global functions
         Here are the functions we need overall to get things running

         */

        var GetSafeProperty = function(obj, prop, defVal) {
            if(obj && obj.hasOwnProperty(prop)) {
                return obj[prop];
            } else {
                return defVal;
            }
        };

        /**
         * @return {string}
         */
        var ElapsedTimeString = function(theDate) {
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
        };

        var createDateString = function(theDate, omitDay) {
            var newString = "";
            var year = (theDate.getFullYear() - 2000).toString();
            var month = theDate.getMonth() + 1;
            if (month < 10)
                month = "0" + month.toString();
            else
                month = month.toString();
            if (omitDay == true) {
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
        };

        /**
         * @return {string}
         */
        var GetItemImage = function(theItem, size) {
            var imagePathName = "";
            if (theItem.hasOwnProperty("M")) {
                // fetch the correct image size
                var hostName = "s3-us-west-2.amazonaws.com/blahguaimages/image/";
                var imageName = theItem.M[0];
                imagePathName = "https://" + hostName + imageName + "-" + size + ".jpg";
            }

            return imagePathName;
        };

        var GetUserImage = function(theItem, size) {
            var imagePathName = GetItemImage(theItem, size);
            if (imagePathName == "")
                imagePathName = fragmentURL + "/images/unknown-user.png";

            return imagePathName;

        };

        var GetCommentUserImage = function(theItem, size) {
            var imagePathName = "";
            if (theItem.hasOwnProperty("_m")) {
                // fetch the correct image size
                var hostName = "s3-us-west-2.amazonaws.com/blahguaimages/image/";
                var imageName = theItem._m[0];
                imagePathName = "https://" + hostName + imageName + "-" + size + ".jpg";
            }
            if (imagePathName == "")
                imagePathName = fragmentURL + "/images/unknown-user.png";

            return imagePathName;

        };

        var GetGenericUserImage = function(theItem, size) {
            var imagePathName = fragmentURL + "/images/unknown-user.png";

            return imagePathName;

        };

        var StartSessionTimer = function(timeoutCallback) {

            TimeoutFunction = timeoutCallback;
            if (SessionTimer)
                clearTimeout(SessionTimer);
            SessionTimer = setTimeout(TimeoutFunction, numMinutes * 60 * 1000);
        };

        var RefreshSessionTimer = function() {
            if (SessionTimer)
                clearTimeout(SessionTimer);
            if (TimeoutFunction)
                SessionTimer = setTimeout(TimeoutFunction, numMinutes * 60 * 1000);
        };

        var ClearSessionTimer = function() {
            if (SessionTimer)
                clearTimeout(SessionTimer);
            SessionTimer = null;
            TimeoutFunction = null;
        };



        var CodifyText = function(theText) {
            if (theText) {
                var regX = /\r\n|\r|\n/g;
                var replaceString = K.NewlineToken;
                return theText.replace(regX, replaceString);
            } else
                return "";

        };

        var UnCodifyText = function(theText) {
            if (theText) {
                var regX = new RegExp("\\" + K.NewlineToken,"g");
                var replaceString = "<br />";
                return theText.replace(regX, replaceString);
            } else
                return "";

        };


        var GetURLsFromString = function(theText) {
            return theText.match(URLRegEx);
        };

        var URLifyText = function(theText) {
            theText = theText.replace(/&quot;/gi, "\"");
            return theText.replace(URLRegEx, '<a href="$1" target="_blank">$1</a>');
        };

        var FakeURLifyText = function(theText) {
            theText = theText.replace(/&quot;/gi, "\"");
            return theText.replace(URLRegEx, '<span style="color:blue; text-decoration:underline">$1</span>');
        };

        var dynamicSort = function(property, subProp) {
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
        };

        var cryptify = function(key, value) {
            var result="";
            for(var i=0;i<value.length;++i)
            {
                result+=String.fromCharCode(key.charCodeAt(i % key.length)^value.charCodeAt(i));
            }
            return result;
        };

        var ClearPrompt = function() {
            $('.click-shield').remove();
        }

        var PromptUser = function(promptString, yesString, noString, yesCallback, noCallback) {
            var newHTML = "";
            newHTML += "<div class='click-shield'>" +
            "<div class='dialog-box'  style='display: none'>" +
                "<table>" +
                "<tr><td class='dialog-prompt-container'><span class='dialog-prompt'></span></td></tr>"  +
                "<tr><td class='dialog-btn-container'><button class='dialog-button dialog-no'></button><button class='dialog-button dialog-yes'></button></td></tr>"  +
                "</table>" +
            "</div>"  +
            "</div>";

            $(document.body).append(newHTML);
            $(".dialog-prompt").text(promptString);
            if ((!noString) || (noString == "")) {
                $(".dialog-no").hide();
            } else {
                $(".dialog-no").text(noString).click(function(theEvent) {
                    $(".dialog-box").hide();
                    if (noCallback)
                        noCallback();
                    $('.click-shield').remove();
                });
            }

            $(".dialog-yes").text(yesString).click(function(theEvent) {
                $(".dialog-box").hide();
                if (yesCallback)
                    yesCallback();
                $('.click-shield').remove();
            });
            $(".dialog-box").show();

        }
        document.body

        return {
            Initialize :   Initialize,
            BlahsMovingTimer: BlahsMovingTimer,
            BlahPreviewTimeout: BlahPreviewTimeout,
            ViewerUpdateTimer: ViewerUpdateTimer,
            BlahList: BlahList,
            NextBlahList: NextBlahList,
            LargeTileWidth: LargeTileWidth,
            MediumTileWidth: MediumTileWidth,
            SmallTileWidth: SmallTileWidth,
            LargeTileHeight: LargeTileHeight,
            MediumTileHeight:MediumTileHeight,
            SmallTileHeight: SmallTileHeight,
            ActiveBlahList: ActiveBlahList,
            TopRow: TopRow,
            BottomRow: BottomRow,
            RowsOnScreen:RowsOnScreen,
            BlahFullItem:BlahFullItem,
            CurrentBlah: CurrentBlah,
            CurrentBlahId: CurrentBlahId,
            CurrentComments: CurrentComments,
            CurrentChannel: CurrentChannel,
            CurrentUser: CurrentUser,
            ChannelList: ChannelDropMenu,
            BlahTypeList: BlahTypeList,
            IsUserLoggedIn: IsUserLoggedIn,
            ChannelDropMenu: ChannelDropMenu,
            FragmentURL: fragmentURL,
            ProfileSchema: ProfileSchema,
            UserProfile: UserProfile,
            CurrentBlahNickname: CurrentBlahNickname,
            BlahReturnPage: BlahReturnPage,
            NumStatsDaysToShow: numStatsDaysToShow,
            BlahOpenPage: BlahOpenPage,
            CurrentScrollSpeed: CurrentScrollSpeed,
            ResizeTimer: resizeTimer,
            SpinElement: SpinElement,
            SpinTarget: SpinTarget,
            GetSafeProperty: GetSafeProperty,
            ElapsedTimeString: ElapsedTimeString,
            CreateDateString: createDateString,
            GetItemImage: GetItemImage,
            GetUserImage: GetUserImage,
            GetGenericUserImage: GetGenericUserImage,
            CodifyText: CodifyText,
            UnCodifyText: UnCodifyText,
            GetURLsFromString: GetURLsFromString,
            URLifyText: URLifyText,
            FakeURLifyText: FakeURLifyText,
            DynamicSort: dynamicSort,
            GetCommentUserImage: GetCommentUserImage,
            PromptUser:  PromptUser,
            StartSessionTimer: StartSessionTimer,
            RefreshSessionTimer: RefreshSessionTimer,
            ClearSessionTimer: ClearSessionTimer,
            ClearPrompt: ClearPrompt,
            Cryptify: cryptify
        }

    }
);
