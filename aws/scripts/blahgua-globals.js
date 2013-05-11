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
var kBannerColor = "rgb(245,244,0)"; //#FF00FF";
var numStatsDaysToShow = 7;
var BlahOpenPage = "Overview";
var kBlahRollPixelStep = 1;
var kBlahRollScrollInterval = 50;
var CurrentScrollSpeed = kBlahRollPixelStep;
var resizeTimer = null;

/*
 Global functions
 Here are the functions we need overall to get things running

 */


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



