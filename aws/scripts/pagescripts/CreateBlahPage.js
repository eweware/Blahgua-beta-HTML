/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('CreateBlahPage',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var blahTypeModule = null;

        var  InitializePage = function() {
            blahTypeModule = null;
            PopulateBlahTypeOptions();
            $("#CreateBlahNicknameDiv").text(getSafeProperty(CurrentUser, "N", "a blahger" ));

            // bind events
            $("#BlahTypeList").change(UpdateBlahInfoArea);
            $("#BlahImage").change(HandleFilePreview);
            $("#CancelCreateBtn").click(CancelCreate);
            $("#PublishBlahBtn").click(CreateBlah);
            $("#BlahHeadline").keyup(function (theEvent) {
                HandleHeadlineTextInput(theEvent.target);
            });
            $("#BlahHeadline").change(function (theEvent) {
                HandleHeadlineTextInput(theEvent.target);
            });
            $("#BlahBody").keyup(function (theEvent) {
                HandleBodyTextInput(theEvent.target);
            });
            $("#BlahBody").change(function (theEvent) {
                HandleBodyTextInput(theEvent.target);
            });
            $(BlahFullItem).fadeIn("fast");
        };

        var PopulateBlahTypeOptions = function() {
            var curHTML = "";
            var blahOrder = ["says", "leaks", "asks", "predicts", "polls"];
            for (var curItem in blahOrder) {
                curHTML += '<OPTION value="' + exports.GetBlahTypeId(blahOrder[curItem]) + '"';
                if (blahOrder[curItem] == "says")
                    curHTML += ' selected="selected" ';
                curHTML += ' >';
                curHTML +=blahOrder[curItem];
                curHTML += '</OPTION>';
            }
            $("#BlahTypeList").html(curHTML);
        };

        var UpdateBlahInfoArea = function() {
            var blahTypeStr = exports.GetBlahTypeNameFromId($("#BlahTypeList").val());
            switch (blahTypeStr) {
                case "predicts":
                    require(["BlahTypePredictAuthorPage"], function(PredictPage){
                        blahTypeModule = PredictPage;
                        $("#AdditionalInfoDiv").load(fragmentURL + "/pages/BlahTypePredictAuthorPage.html #BlahTypePredictAuthorPage",
                            function() { PredictPage.InitializePage(); })
                    });

                    break;
                case "polls":
                    require(["BlahTypePollAuthorPage"], function(PollPage){
                        blahTypeModule = PollPage;
                        $("#AdditionalInfoDiv").load(fragmentURL + "/pages/BlahTypePollAuthorPage.html #BlahTypeAskAuthorPage",
                            function() { PollPage.InitializePage(); })
                    });

                    break;
                default:
                    $("#AdditionalInfoDiv").empty();
            }
        };


        function HandleHeadlineTextInput(target) {
            if(target.scrollHeight > target.clientHeight)
                target.style.height=target.scrollHeight+'px';
            var numCharsRemaining = MaxTitleLength - target.value.length;
            if (numCharsRemaining < 32) {
                $("#HeadlineCharCount").text(numCharsRemaining + " chars left");
            } else {
                $("#HeadlineCharCount").text("");
            }

            CheckPublishBtnDisable();


        }

        function CheckPublishBtnDisable() {
            var minHeadlineLen = 3;
            var headLineLen = document.getElementById("BlahHeadline").value.length;
            var bodyLen = document.getElementById("BlahBody").value.length;
            if ($("#BlahImage").val() != "")
                minHeadlineLen = 0;
            if ((headLineLen < minHeadlineLen) || (headLineLen > MaxTitleLength) || (bodyLen > 4000))
                document.getElementById("PublishBlahBtn").disabled = true;
            else
                document.getElementById("PublishBlahBtn").disabled = false;
        }

        function HandleBodyTextInput(target) {
            if(target.scrollHeight > target.clientHeight)
                target.style.height=target.scrollHeight+'px';
            var numCharsRemaining = 4000 - target.value.length;
            if (numCharsRemaining < 100) {
                $("#BodyCharCount").text(numCharsRemaining + " chars left");
            } else {
                $("#BodyCharCount").text("");
            }
            CheckPublishBtnDisable();

        }

        function CancelCreate() {
            exports.CloseBlah();
        }



        function CreateBlah() {
            // disable create button to prevent double-submit
            document.getElementById("PublishBlahBtn").disabled = true;
            var blahType = $("#BlahTypeList").val();

            var blahHeadline = $("#BlahHeadline").val();
            var blahBody = $("#BlahBody").val();
            blahBody = CodifyText(blahBody);
            var blahGroup = CurrentChannel._id;
            var options = null;


            // check for additional options
            if (blahTypeModule) {
                options = blahTypeModule.PrepareCreateBlahJSON();
            }


            blahgua_rest.CreateUserBlah(blahHeadline, blahType, blahGroup, blahBody, options, OnCreateBlahOK, exports.OnFailure);
        };

        var OnCreateBlahOK = function(json) {
            CurrentBlah = json;
            CurrentBlahId = CurrentBlah._id;
            // check for images
            if ($("#BlahImage").val() != "") {
                UploadBlahImage(CurrentBlah._id);
            } else {
                DoCloseBlah();
            }
        };

        var DoCloseBlah = function(){
            InsertNewBlahIntoChannel(CurrentBlah);
            $("#AdditionalInfoDiv").empty();
            exports.CloseBlah();
        }

        var UploadBlahImage  = function(blahId) {
            $("#ProgressDiv").show();
            $("#objectId").val(blahId);
            //document.getElementById("ImageForm").submit();

            var formData = new FormData($("#ImageForm")[0]);
            $.ajax({
                url: "http://beta.blahgua.com/v2/images/upload",

                type: 'POST',
                xhr: function() { // custom xhr
                    myXhr = $.ajaxSettings.xhr();
                    if(myXhr.upload){ // if upload property exists
                        myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // progressbar
                    }
                    return myXhr;
                },
                //Ajax events
                success: completeHandler = function(data) {
                    DoCloseBlah();

                },
                error: errorHandler = function(theErr) {
                    alert("Error uploading");
                },
                // Form data
                data: formData,
                //Options to tell JQuery not to process data or worry about content-type
                cache: false,
                contentType: false,
                processData: false
            }, 'json');
        };

        var progressHandlingFunction = function(evt) {
            var maxWidth = $("#ProgressBar").width();
            var curWidth = 100;
            var ratio = evt.loaded / evt.total;
            var newWidth = Math.floor(maxWidth * ratio);
            $("#Indicator").width(newWidth);
        };

        var InsertNewBlahIntoChannel = function(theBlah) {
            // todo:  create a fake inbox item for this blah
            // and insert it into the blah list...
            var newItem = new Object();
            newItem["N"] = theBlah.N;
        };




        var HandleFilePreview = function() {
            var theFile = $("#BlahImage").val();
            $("#CreateBlahImageNameSpan").text(theFile);
            if (theFile != "") {
                $(".uploadimage").css({"background-image": theFile});

            }
            CheckPublishBtnDisable();
        };




        return {
            InitializePage: InitializePage
        }
    }
);