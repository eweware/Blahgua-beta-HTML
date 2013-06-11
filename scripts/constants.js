/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/23/13
 * Time: 6:08 PM
 * To change this template use File | Settings | File Templates.
 */

define('constants',
    [],
    function () {

        var kMinWidth = 300;
        var kBlahType = {
            "says":null,
            "leaks":null,
            "polls":null,
            "predicts":null,
            "ad":null,
            "asks":null
            };

        var MaxTitleLength = 64;
        var kBannerHighlightColor = "#FFFFFF";
        var kBannerColor = "rgb(245,244,0)"; //#FF00FF";
        var kEdgeGutter = 12;
        var kInterBlahGutter = 12;
        var kNewlineToken = "[_r;";
        var kBlahRollPixelStep = 1;
        var kBlahRollScrollInterval = 35;

        var Initialize = function() {
            // placeholder
        };

        return {
            Initialize :   Initialize,
            MinWidth: kMinWidth,
            BlahType: kBlahType,
            MaxTitleLength: MaxTitleLength,
            BannerHighlightColor: kBannerHighlightColor,
            BannerColor: kBannerColor,
            EdgeGutter: kEdgeGutter,
            InterBlahGutter: kInterBlahGutter,
            NewlineToken: kNewlineToken,
            BlahRollPixelStep: kBlahRollPixelStep,
            BlahRollScrollInterval: kBlahRollScrollInterval
        }
    }
);