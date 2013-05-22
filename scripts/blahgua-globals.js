/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 3:32 PM
 * To change this template use File | Settings | File Templates.
 */



/*
 GLOBAL VARIABLES and CONSTANTS
 */

var BlahsMovingTimer = null;
var BlahPreviewTimeout = null;
var ViewerUpdateTimer = null;
var BlahList;
var NextBlahList;
var kMinWidth = 300;
var LargeTileWidth = 400;
var MediumTileWidth = 200;
var SmallTileWidth = 100;
var LargeTileHeight = 400;
var MediumTileHeight = 200;
var SmallTileHeight = 100;
var ActiveBlahList;
var TopRow = null;
var BottomRow = null;
var RowsOnScreen = 10;
var BlahPreviewItem;
var BlahFullItem;
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
var kBannerColor = "rgb(245,244,0)"; //#FF00FF";
var numStatsDaysToShow = 7;
var BlahOpenPage = "Overview";
var kBlahRollPixelStep = 1;
var kBlahRollScrollInterval = 50;
var CurrentScrollSpeed = kBlahRollPixelStep;
var resizeTimer = null;
var SpinElement = null;
var SpinTarget = null;

/*
 Global functions
 Here are the functions we need overall to get things running

 */

function getSafeProperty(obj, prop, defVal) {
    if(obj && obj.hasOwnProperty(prop)) {
        return obj[prop];
    } else {
        return defVal;
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

function createDateString(theDate, omitDay) {
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
}

function GetItemImage(theItem, size) {
    var imagePathName = "";
    if (theItem.hasOwnProperty("M")) {
        // fetch the correct image size
        var hostName = "s3-us-west-2.amazonaws.com/blahguaimages/image/";
        var imageName = theItem.M[0];
        imagePathName = "https://" + hostName + imageName + "-" + size + ".jpg";
    }

    return imagePathName;
}

function GetUserImage(theItem, size) {
    var imagePathName = GetItemImage(theItem, size);
    if (imagePathName == "")
        imagePathName = fragmentURL + "/images/unknown-user.png";

    return imagePathName;

}

function GetGenericUserImage(theItem, size) {
    var imagePathName = fragmentURL + "/images/unknown-user.png";

    return imagePathName;

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


function BlockMove(event) {
    // Tell Safari not to move the window.
    event.preventDefault() ;
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



