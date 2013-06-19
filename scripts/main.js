/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 11:39 AM
 * To change this template use File | Settings | File Templates.
 */

requirejs.config({
    "baseUrl": BlahguaConfig.fragmentURL +  "scripts", //"./scripts", //https://s3-us-west-2.amazonaws.com/beta.blahgua.com/scripts/",
    "paths": {
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
        "blahgua_base"

    ], function(blahgua_base) {
        blahgua_base.InitializeBlahgua();
    }
);
// Hide address bar & handling events when the scroll bar appears to prevent;
window.addEventListener("load", function() { 
	setTimeout(hideURLbar, 0); 
}, 100); 

function hideURLbar(){ 
     window.scrollTo(0,1); 
}
