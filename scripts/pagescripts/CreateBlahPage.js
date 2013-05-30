/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('CreateBlahPage',
    ["constants", "globals", "ExportFunctions", "blahgua_restapi"],
    function (K, G, exports, blahgua_rest) {

        var blahTypeModule = null;

        var  InitializePage = function() {
            blahTypeModule = null;
            PopulateBlahTypeOptions();
            var blahChannelStr = G.CurrentChannel.N;
            blahgua_rest.getUserDescriptorString(G.CurrentUser._id, function(theString) {
                $("#FullBlahProfileString").text(theString.d);
            }, function (theErr) {
                $("#FullBlahProfileString").text("someone");
            });

            $("#FullBlahNickName").text(G.GetSafeProperty(G.CurrentUser, "N", "someone" ));
            var newImage = G.GetUserImage(G.CurrentUser, "A");
            $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
            var channelName = G.CurrentChannel.N;
            $(".fullBlahSpeechAct").text("to " + channelName);

            // bind events
            $("#BlahTypeList").change(UpdateBlahInfoArea);
            $("#BlahImage").change(HandleFilePreview);
            $(".blah-closer").click(CancelCreate);
            $("#PublishBlahBtn").click(CreateBlah);
            $("#ShowBadgeAreaBtn").click(function(theEvent) {
                var theRow = document.getElementById("BadgeChoiceRow");
                if (theRow.style.display == "none")   {
                    theRow.style.display = "block";
                    $("#ShowBadgeAreaBtn").text("Hide Badge Area");
                    theRow.scrollIntoView();
                }
                else {
                    theRow.style.display = "none";
                    $("#ShowBadgeAreaBtn").text("Add Badge");
                }

                $('input[type=checkbox]').click(RefreshBadgePreview);
            });
            $("#BlahHeadline").keydown(function (theEvent) {
                if(theEvent.keyCode == 13) {
                    theEvent.preventDefault();
                }
            });
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

            //noinspection JSUnresolvedFunction
            $(BlahFullItem).fadeIn("fast", function() {
                UpdateLayout();
                $("#BlahHeadline").focus();
            });

            UpdateBadgeArea();
            CheckPublishBtnDisable();
        };

        var UpdateLayout = function() {
            var top = document.getElementById("CreateBlahHeader").getBoundingClientRect().bottom - 25;
            $("#createcontent").css({"top": top + "px"});
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
                        $("#AdditionalInfoDiv").load(G.FragmentURL + "/pages/BlahTypePredictAuthorPage.html #BlahTypePredictAuthorPage",
                            function() {
                                PredictPage.InitializePage(CheckPublishBtnDisable);
                                CheckPublishBtnDisable();
                            });
                    });

                    break;
                case "polls":
                    require(["BlahTypePollAuthorPage"], function(PollPage){
                        blahTypeModule = PollPage;
                        $("#AdditionalInfoDiv").load(G.FragmentURL + "/pages/BlahTypePollAuthorPage.html #BlahTypeAskAuthorPage",
                            function() {
                                PollPage.InitializePage(CheckPublishBtnDisable);
                                CheckPublishBtnDisable();
                            });
                    });

                    break;
                default:
                    $("#AdditionalInfoDiv").empty();
            }
        };


        var HandleHeadlineTextInput = function(target) {
            if(target.scrollHeight > target.clientHeight)  {
                target.style.height=target.scrollHeight+'px';
                UpdateLayout();
            }
            var numCharsRemaining = K.MaxTitleLength - target.value.length;
            if (numCharsRemaining < 32) {
                $("#HeadlineCharCount").text(numCharsRemaining + " chars left");
            } else {
                $("#HeadlineCharCount").text("");
            }

            CheckPublishBtnDisable();
        };

        var CheckPublishBtnDisable = function() {
            var minHeadlineLen = 3;
            var headLineLen = document.getElementById("BlahHeadline").value.length;
            var bodyLen = document.getElementById("BlahBody").value.length;
            if ($("#BlahImage").val() != "")
                minHeadlineLen = 0;
            var errMsg = "";

            if (headLineLen < minHeadlineLen)
                errMsg += "Headline too short.  ";
            if (headLineLen > K.MaxTitleLength)
                errMsg += "Headline too long.  ";
            if (bodyLen > 4000)
                errMsg += "Body text too long.  ";

            if (blahTypeModule)
                errMsg += blahTypeModule.ValidateCreate();

            if (errMsg == "") {
                $("#ValidationRow").hide();
                document.getElementById("PublishBlahBtn").disabled = false;
                $("#ErrMsgSpan").empty();
            }
            else {
                document.getElementById("PublishBlahBtn").disabled = true;
                $("#ErrMsgSpan").text(errMsg);
                $("#ValidationRow").show();
            }
        };

        var HandleBodyTextInput = function(target) {
            if(target.scrollHeight > target.clientHeight)
                target.style.height=target.scrollHeight+'px';
            var numCharsRemaining = 4000 - target.value.length;
            if (numCharsRemaining < 100) {
                $("#BodyCharCount").text(numCharsRemaining + " chars left");
            } else {
                $("#BodyCharCount").text("");
            }
            CheckPublishBtnDisable();
        };

        var CancelCreate = function() {
            exports.CloseBlah();
        };

        var UpdateBadgeArea = function() {
            if (G.CurrentUser.hasOwnProperty("B")) {
                // add badges
                $("#BadgesDiv").empty();
                $.each(G.CurrentUser.B, function(index, curBadge) {
                    CreateAndAppendBadgeHTML(curBadge);
                });

            } else {
                $("#BadgesDiv").html("<tr><td>You do not have any badges.  Go to the 'badges' section your profile to acquire some.</tr></td>");
            }
            UpdateLayout();
        };

        var RefreshBadgePreview = function() {
            $("tr.badge-info-row").remove();
            $("#BadgesDiv input:checkbox:checked").each(function(index, item) {
                $("#BlahFacetTable").append(CreateBadgeDescription(item));
            });
            UpdateLayout();
        };

        var CreateBadgeDescription = function(theBadge) {
            var badgeName = $(theBadge).closest("tr").find(".badgename").text();
            var newHTML = "<tr class='badge-info-row'>";
            newHTML += "<td><img style='width:16px; height:16px;' src='" + G.FragmentURL + "/img/black_badge.png'</td>";
            newHTML += "<td style='width:100%'>verified <span class='badge-name-class'>"+ badgeName + "</span></td>";
            return newHTML;
        }


        var CreateAndAppendBadgeHTML = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var newHTML = "";
                var imagePath = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/generic-badge.png";
                newHTML += "<tr data-badge-id='" + theBadge + "'>";
                newHTML += "<td><input type=checkbox></td>";
                newHTML += "<td><div class='badgeholder'>";
                newHTML += "<div class='badgename'>";
                if (fullBadge.hasOwnProperty("K")) {
                    imagePath = fullBadge.K;
                }
                newHTML += "<img class='badgeimage' src='" + imagePath + "'>";
                newHTML += fullBadge.N + "</div>";
                newHTML += "<div class='badgesource'>granted by: " + fullBadge.A + "</div>";
                newHTML += "<div class='badgeexp'>expires: " + (new Date(fullBadge.X)).toLocaleString() + "</div>";
                newHTML += "</div></td>";

                newHTML += "</tr>";
                $("#BadgesDiv").append(newHTML);
            }, function (theErr) {
                var newHTML = "";
                newHTML += "<tr><td><div>Error loading Badge id=" + theBadge + "</div></td></tr>";
                $("#BadgesDiv").append(newHTML);
            });
        };



        var CreateBlah = function() {
            // disable create button to prevent double-submit
            var btn =  document.getElementById("PublishBlahBtn");
            btn.disabled = true;
            exports.SpinElement.spin(btn);

            var blahType = $("#BlahTypeList").val();

            var blahHeadline = $("#BlahHeadline").val();
            var blahBody = $("#BlahBody").val();
            blahBody = G.CodifyText(blahBody);
            var blahGroup = G.CurrentChannel._id;
            var options = null;


            // check for additional options
            if (blahTypeModule) {
                options = blahTypeModule.PrepareCreateBlahJSON();
            }

            var badges = $("#BadgesDiv input:checkbox:checked");
            if (badges.length > 0) {
                if (options == null)
                    options = new Object();
                var badgeArray = [];
                badges.each(function(index, item) {
                   var theID =  $(item).closest("tr").attr("data-badge-id");
                    badgeArray.push(theID);
                });
                options["B"] = badgeArray;
            }

            blahgua_rest.CreateUserBlah(blahHeadline, blahType, blahGroup, blahBody, options, OnCreateBlahOK, exports.OnFailure);
        };

        var OnCreateBlahOK = function(json) {
            G.CurrentBlah = json;
            G.CurrentBlahId = G.CurrentBlah._id;
            // check for images
            if ($("#BlahImage").val() != "") {
                UploadBlahImage(G.CurrentBlah._id);
            } else {
                DoCloseBlah();
            }
        };

        var DoCloseBlah = function(){
            InsertNewBlahIntoChannel(G.CurrentBlah);
            $("#AdditionalInfoDiv").empty();
            exports.CloseBlah();
        }

        var UploadBlahImage  = function(blahId) {
            $("#ProgressBar").show();
            $("#objectId").val(blahId);
            //document.getElementById("ImageForm").submit();

            var formData = new FormData($("#ImageForm")[0]);
            $.ajax({
                url: "https://beta.blahgua.com/v2/images/upload",

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
            $(".uploadimage").text(theFile);
            if (theFile == "")
                $("#ImagePreviewRow").hide();
            else
                $("#ImagePreviewRow").show();
            CheckPublishBtnDisable();
        };


        return {
            InitializePage: InitializePage
        }
    }
);