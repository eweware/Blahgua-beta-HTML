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
        "SignUpPage": "pagescripts/SignUpPage",
        "BlahPreview": "pagescripts/BlahPreview"
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
