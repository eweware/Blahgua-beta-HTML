/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 11:39 AM
 * To change this template use File | Settings | File Templates.
 */

requirejs.config({
    "baseUrl": "./scripts", // http://beta.blahgua.com.s3.amazonaws.com/scripts/",
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        "SignUpPage": "pagescripts/SignUpPage",
        "BlahPreview": "pagescripts/BlahPreview",
        "BlahTypePredict": "pagescripts/BlahTypePredictPage",
        "BlahTypePoll": "pagescripts/BlahTypePollPage",
        "BlahDetailPage": "pagescripts/BlahDetailPage",
        "BlahBodyDetailPage": "pagescripts/BlahBodyDetailPage",
        "BlahCommentDetailPage": "pagescripts/BlahCommentDetailPage",
        "BlahStatsDetailPage": "pagescripts/BlahStatsDetailPage",
        "CreateBlahPage": "pagescripts/CreateBlahPage",
        "BlahTypePollAuthorPage": "pagescripts/BlahTypePollAuthorPage",
        "BlahTypePredictAuthorPage": "pagescripts/BlahTypePredictAuthorPage",
        "SelfPage": "pagescripts/SelfPage",
        "SelfPageDetails": "pagescripts/SelfPageDetails",
        "SelfPageStats": "pagescripts/SelfPageStats",
        "SelfPageHistory": "pagescripts/SelfPageHistory",
        "comments": "pagescripts/Comments",
        "spin": "spin.min",
        "stats": "stats"
    }
});


// Load the main app module to start the app
requirejs(
    [
        "GlobalFunctions",
        "blahgua_restapi",
        "blahgua-globals",
        "blahgua_base"

    ], function(GlobalFunctions, blahgua_rest, blahgua_globals, blahgua_base) {
        blahgua_base.InitializeBlahgua();
    }
);
