/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 11:39 AM
 * To change this template use File | Settings | File Templates.
 */

requirejs.config({
    "baseUrl": "./aws/scripts/",
    "paths": {
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        "SignUpPage": "pagescripts/SignUpPage"
    }
});


// Load the main app module to start the app
requirejs(
    [
        "blahgua_restapi",
        "blahgua-globals",
        "blahgua",



        "pagescripts/BlahRoll",

        "pagescripts/BlahPreview",
        "pagescripts/BlahTypeAskPreview",
        "pagescripts/BlahTypePredictPreview",

        "pagescripts/BlahDetailPage",
        "pagescripts/BlahTypeAskPage",
        "pagescripts/BlahTypePredictPage",
        "pagescripts/BlahBodyDetailPage",
        "pagescripts/BlahCommentDetailPage",
        "pagescripts/BlahStatsDetailPage",
        "pagescripts/BlahAuthorPage",

        "pagescripts/CreateBlahPage",
        "pagescripts/BlahTypeAskAuthorPage",
        "pagescripts/BlahTypePredictAuthorPage",

        "pagescripts/SelfPage",
        "pagescripts/SelfPageDetails",
        "pagescripts/SelfPageHistory",
        "pagescripts/SelfPageStats"

    ]
);
