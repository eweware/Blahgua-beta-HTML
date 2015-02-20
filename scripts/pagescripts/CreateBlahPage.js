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
        var pageHeight = null;
        var blahHasBadges = false;
        var isFromURL = false;
        var userNameStr;
        var userImageStr;
        var userDescStr = "An anonymous person.";
        var imageUploadURL = "";

        var  InitializePage = function(theTitle, theBody) {

            blahTypeModule = null;
            PopulateBlahTypeOptions();
            var blahChannelStr = G.CurrentChannel.N;
            blahgua_rest.getUserDescriptorString(G.CurrentUser._id, function(theString) {
                userNameStr = G.GetSafeProperty(theString, "K", "someone");
                //$("#FullBlahNickName").text(userNameStr);
                userDescStr = theString.d;
                //$("#FullBlahProfileString").text(userDescStr);
            }, function (theErr) {
                $("#FullBlahNickName").text("Someone");
                $("#FullBlahProfileString").text(userDescStr);

            });


            userImageStr = G.GetUserImage(G.CurrentUser, "A");
            $("#BlahAuthorImage").css({"background-image": "url('" + userImageStr + "')"});
            var channelName = G.CurrentChannel.N;
            $(".fullBlahSpeechAct").html("to&nbsp;" + channelName);


            // bind events
            if (!G.IsUploadCapable) {
                $("#ImagePreviewDiv").hide();
                $(".hidden-upload").hide();
            }
            else {
                // set the upload URL
                blahgua_rest.GetUploadURL(function(theURL) {
                   $("#ImageForm").action = theURL;
                    imageUploadURL = theURL;
                });
            }
            $("#BlahTypeList").change(UpdateBlahInfoArea);
            $("#BlahImage").change(UploadBlahImage);

            $(".image-delete-btn").click(function(theEvent) {
                theEvent.stopImmediatePropagation();
                $("#ImagePreviewDiv").addClass("no-image").css({"background-image":"none"});
                $("#ImagePreviewDiv span").text("no image");
                $("#ImagePreviewDiv i").hide();
                $("#BlahImage").val("");
                $("#objectId").val("");
                return false;
            });

            $(".blah-closer").click(CancelCreate);
            $("#PublishBlahBtn").click(CreateBlah);
            $("#ShowBadgeAreaBtn").click(function(theEvent) {
                if (!G.IsShort) {
                    var imageRect = $("#ShowBadgeAreaBtn")[0].getBoundingClientRect();
                    var newLeft = imageRect.left;
                    var newTop = imageRect.bottom;
                    $("#ShowBadgeArea").css({"left":newLeft + "px", "top":newTop + "px"});
                }

                $("#ShowBadgeAreaHolder").show().click(function(theEvent) {
                    if (theEvent.target.id == "ShowBadgeAreaHolder")
                        $(theEvent.target).hide();
                });

                $(".badge-item").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    var $icon = $(this).find("i");
                    if ($icon.hasClass("icon-check-empty")) {
                        $icon.addClass("icon-check").removeClass("icon-check-empty");
                    } else {
                        $icon.addClass("icon-check-empty").removeClass("icon-check");
                    }
                    RefreshBadgePreview();
                });

                $(".anonymous-item").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    var $icon = $(this).find("i");
                    if ($icon.hasClass("icon-check-empty")) {
                        $icon.addClass("icon-check").removeClass("icon-check-empty");
                    } else {
                        $icon.addClass("icon-check-empty").removeClass("icon-check");
                    }
                    RefreshBadgePreview();
                });

                $(".mature-item").click(function(theEvent) {
                    theEvent.stopImmediatePropagation();
                    var $icon = $(this).find("i");
                    if ($icon.hasClass("icon-check-empty")) {
                        $icon.addClass("icon-check").removeClass("icon-check-empty");
                    } else {
                        $icon.addClass("icon-check-empty").removeClass("icon-check");
                    }
                    RefreshBadgePreview();
                });



            });

            if (!G.IsMobile) {
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
            }

            $(BlahFullItem).slideDown("fast", function() {
                UpdateLayout();
                if (!G.IsMobile)
                    $("#BlahHeadline").focus();
            });

            if (theTitle != null) {
                if (theBody != null)
                    $("#BlahBody").text(theBody);
                if (!G.IsMobile)
                    $("#BlahHeadline").focus();
                $("#BlahHeadline").text(theTitle);
                $("#BlahHeadline").select();
                isFromURL = true;

            }

            //PopulateChannelMenu();
            UpdateBadgeArea();
            RefreshBadgePreview();
            CheckPublishBtnDisable();
            ResizeCreatePage();

        };

        var PopulateChannelMenu = function() {
            var newHTML = "";
            $.each(G.ChannelList, function(index, element) {

                newHTML += "<option value='" + element._id + "'";
                if (G.CurrentChannel == element ) {
                    newHTML += " selected='selected'";
                }
                newHTML +=   ">" + element.N + "</option>";
            });
            $("#BlahChannelList").html(newHTML);
        };


        var UpdateLayout = function() {
            if (G.IsShort) {

            } else {
                var top = document.getElementById("CreateBlahHeader").getBoundingClientRect().bottom - 25;
                $("#createcontent").css({"top": top + "px"});
            }

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
			var selectVal=$("#BlahTypeList").find("option:selected").text();
			switch(selectVal)
			{
			  case "says":  $("#BlahHeadline").attr("placeholder","Headline: Says are general posts with no requirements.");
			   break;
			   case "leaks":$("#BlahHeadline").attr("placeholder","Headline: Leaks require that a badge to be attached.");
			   break;
			   case "asks":  $("#BlahHeadline").attr("placeholder","Headline: Asks are open-ended questions and must include a '?'");
			   break;
			   case "predicts":$("#BlahHeadline").attr("placeholder","Headline: Predictions detail outcomes that are expected to occur.");
			   break;
			   case "polls":$("#BlahHeadline").attr("placeholder","Headline: Polls allow users to vote on pre-defined responses.");
			   break;

			}
            switch (blahTypeStr) {
                case "predicts":
                    require(["BlahTypePredictAuthorPage"], function(PredictPage){
                        blahTypeModule = PredictPage;
                        $("#AdditionalInfoDiv").load(BlahguaConfig.fragmentURL + "pages/BlahTypePredictAuthorPage.html #BlahTypePredictAuthorPage",
                            function() {
                                PredictPage.InitializePage(CheckPublishBtnDisable);
                                CheckPublishBtnDisable();
                                ResizeCreatePage();
                            });
                    });

                    break;
                case "polls":
                    require(["BlahTypePollAuthorPage"], function(PollPage){
                        blahTypeModule = PollPage;
                        $("#AdditionalInfoDiv").load(BlahguaConfig.fragmentURL + "pages/BlahTypePollAuthorPage.html #BlahTypeAskAuthorPage",
                            function() {
                                if (pageHeight == null)
                                    pageHeight = $(".PageBody")[0].getBoundingClientRect().height;
                                var contentTop = document.getElementById("BlahTypeAskAuthorPage").getBoundingClientRect().top;
                                var footerSize = $(".create-footer-div")[0].getBoundingClientRect().height;
                                var offsetSize = 83;

                                var maxSize = pageHeight - (contentTop + footerSize + offsetSize);
                                PollPage.SetLayoutCallback(ResizeCreatePage);
                                PollPage.InitializePage(CheckPublishBtnDisable);
                                if (!G.IsShort)
                                    $(".poll-result").css({"max-height": maxSize + "px"});
                                CheckPublishBtnDisable();
                                ResizeCreatePage();
                            });
                    });

                    break;
                default:
                    blahTypeModule = null;
                    $("#AdditionalInfoDiv").empty();
                    CheckPublishBtnDisable();
                    ResizeCreatePage();
            }
        };


        var HandleHeadlineTextInput = function(target) {

            var numCharsRemaining = K.MaxTitleLength - target.value.length;
            $("#HeadlineCharCount").text(numCharsRemaining);

            CheckPublishBtnDisable();
        };

        var CheckPublishBtnDisable = function() {
            var minHeadlineLen = 3;
            var headlineText = document.getElementById("BlahHeadline").value;
            var headLineLen = headlineText.length;
            var bodyLen = document.getElementById("BlahBody").value.length;
            if ($("#BlahImage").val() != "")
                minHeadlineLen = 0;
            var errMsg = "";

            if (headLineLen < minHeadlineLen)
                errMsg = G.AppendText(errMsg, "Headline too short", "; ");
            if (headLineLen > K.MaxTitleLength)
                errMsg = G.AppendText(errMsg, "Headline too long", "; ");
            if (bodyLen > 2000)
                errMsg = G.AppendText(errMsg, "Body text too long", "; ");

            if (blahTypeModule)
                errMsg = G.AppendText(errMsg,  blahTypeModule.ValidateCreate(), "; ");
            else {
                // hardwire some types
                var blahTypeStr = exports.GetBlahTypeNameFromId($("#BlahTypeList").val());
                switch (blahTypeStr) {
                    case "leaks":
                       if (!blahHasBadges)
                            errMsg = G.AppendText(errMsg, "Leaks require a badge", "; ");
                        break;
                    case "asks":
                        if (headlineText.indexOf("?") == -1)
                            errMsg = G.AppendText(errMsg, "Asks must include a ?");
                        break;
                }
            }

            if (errMsg == "") {
                $("#ValidationRow").fadeTo(200,0, function(theEvent) {
                    $("#ErrMsgSpan").empty();
                });
                document.getElementById("PublishBlahBtn").disabled = false;
            } else {
                document.getElementById("PublishBlahBtn").disabled = true;
                $("#ErrMsgSpan").text(errMsg);
                $("#ValidationRow").fadeTo(200,1);
            }

            if (G.IsMobile)
                document.getElementById("PublishBlahBtn").disabled = false;

            if (errMsg)
                return errMsg;
            else
                return false;
        };

        var HandleBodyTextInput = function(target) {
            var numCharsRemaining = 2000 - target.value.length;
            $("#BodyCharCount").text(numCharsRemaining);

            CheckPublishBtnDisable();
        };

        var CancelCreate = function() {
            exports.CloseBlah();
            if (isFromURL) {
                window.close();
            }
        };

        var UpdateBadgeArea = function() {
            CreateAndAppendAnonPostHTML();
            CreateAndAppendMaturePostHTML();
            if (G.CurrentUser.hasOwnProperty("B")) {
                // add badges
                // insert header
                AppendBadgeHeader();
                $("#BadgesArea").empty();
                $.each(G.CurrentUser.B, function(index, curBadge) {
                    CreateAndAppendBadgeHTML(curBadge);
                });
            } else {
                AppendNoBadgeHeader();
            }

            UpdateLayout();
        };

        var RefreshBadgePreview = function() {
            blahHasBadges = false;
            $("tr.badge-info-row").remove();
            $("#ShowBadgeArea .badge-item").each(function(index, item) {
                if ($(item).find("i").hasClass("icon-check")) {
                    $("#BlahFacetTable").append(CreateBadgeDescription(item));
                    blahHasBadges = true;
                }

            });

            if (!$("#ShowBadgeArea .anonymous-item").find("i").hasClass("icon-check")) {
                // draw anonymous
                $("#FullBlahNickName").text("someone");
                $("#BlahAuthorImage").css({"background-image": "url('" + G.GetGenericUserImage() + "')"});
                $("#FullBlahProfileString").text("An anonymous person.");
            } else {
                // draw normal
                $("#FullBlahNickName").text(userNameStr);
                $("#BlahAuthorImage").css({"background-image": "url('" + userImageStr + "')"});
                $("#FullBlahProfileString").text(userDescStr);
            }

            if ($("#ShowBadgeArea .mature-item i").hasClass("icon-check")) {
                // draw mature
                $("#PublishBlahBtn").addClass("mature");
            } else {
                // draw normal
                $("#PublishBlahBtn").removeClass("mature");
            }

            UpdateLayout();
            ResizeCreatePage();
            CheckPublishBtnDisable();
        };

        var CreateBadgeDescription = function(theBadge) {
            var badgeName = $(theBadge).find("span").text();
            var newHTML = "<tr class='badge-info-row'>";
            newHTML += "<td>";
            newHTML += "<img style='width:16px; height:16px;' src='" + BlahguaConfig.fragmentURL + "img/black_badge.png'>";
            newHTML += "verified <span class='badge-name-class'>"+ badgeName + "</span>";
            newHTML += "</td></tr>";
            return newHTML;
        };

        var CreateAndAppendAnonPostHTML = function() {
                var newHTML = "";
                newHTML += "<div class='anonymous-item'>";
                newHTML += "<i class='icon-check-empty'></i>";
                newHTML += "<span>Use Profile</span>";
                newHTML += "</div>";

                $("#ShowBadgeArea").append(newHTML);
        };

        var CreateAndAppendMaturePostHTML = function() {
            var newHTML = "";
            newHTML += "<div class='mature-item'>";
            newHTML += "<i class='icon-check-empty'></i>";
            newHTML += "<span>Mature Content</span>";
            newHTML += "</div>";
            newHTML += "</div>";

            $("#ShowBadgeArea").append(newHTML);
        };


        var CreateAndAppendBadgeHTML = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var newHTML = "";
                newHTML += "<div class='badge-item' data-badge-id='" + theBadge + "'>";
                newHTML += "<i class='icon-check-empty'></i>";
                newHTML += "<span>" + fullBadge.N + "</span>";
                newHTML += "</div>";

                $("#ShowBadgeArea").append(newHTML);
            });
        };

        var AppendBadgeHeader = function() {
            var newHTML = "";
            newHTML += "<div class='badge-header-item'>";
            newHTML += "<span>Apply Badges</span>";
            newHTML += "</div>";

            $("#ShowBadgeArea").append(newHTML);
        };

        var AppendNoBadgeHeader = function() {
            var newHTML = "";
            newHTML += "<div class='nobadge-header-item'>";
            newHTML += "<span>You have no badges.  Go to your profile to add some!</span>";
            newHTML += "</div>";

            $("#ShowBadgeArea").append(newHTML);
        };




        var CreateBlah = function() {
            if (!CheckPublishBtnDisable()) {
                // disable create button to prevent double-submit
                var btn =  document.getElementById("PublishBlahBtn");
                btn.disabled = true;
                exports.SpinElement.spin(btn);

                var blahType = $("#BlahTypeList").val();

                var blahHeadline = $("#BlahHeadline").val();
                var blahBody = $("#BlahBody").val();
                blahBody = G.CodifyText(blahBody);
                //var blahGroup = $("#BlahChannelList").val();
                var blahGroup = G.CurrentChannel._id;
                var options = new Object();


                // check for additional options
                if (blahTypeModule) {
                    options = blahTypeModule.PrepareCreateBlahJSON();
                }

                var badges = $("#ShowBadgeArea .badge-item");
                if (badges.length > 0) {
                    var badgeArray = [];
                    badges.each(function(index, item) {
                       var theID =  $(item).attr("data-badge-id");
                       var isChecked = $(item).find("i").hasClass("icon-check");
                       if (isChecked)
                           badgeArray.push(theID);
                    });
                    if (badgeArray.length > 0)
                        options["B"] = badgeArray;
                }

                if ($("#ShowBadgeArea .anonymous-item").find("i").hasClass("icon-check")) {
                    //options["XX"] = false;
                } else {
                    options["XX"] = true;
                }

                if ($("#ShowBadgeArea .mature-item").find("i").hasClass("icon-check")) {
                    options["XXX"] = true;
                } else {
                    //options["XXX"] = false;
                }

                if ($("#objectId").val() != "") {
                    options["M"] = [$("#objectId").val()];
                }

                blahgua_rest.CreateUserBlah(blahHeadline, blahType, blahGroup, blahBody, options, OnCreateBlahOK, HandleCreateBlahFailure);
            }
        };

        var OnCreateBlahOK = function(json) {
            ga('send', 'event', 'createblah', 'blah', json.Y, 1);
            G.CurrentBlah = json;
            G.CurrentBlahId = G.CurrentBlah._id;
            // check for images
            if (isFromURL) {
                DoCloseBlah();
                window.close();
            }
            else {
                DoCloseBlah();

                // Pop the notification
                $("body").append("<div class='notification-click-window'>"+
                        "<div id='NotificationPopupWindow'>"+
                            "<div class='notification-popup-header'>Success!</div>"+
                            "<div class='notification-popup-body'>" +
                                "<div class='notification-body-text'>Your post has been created.</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>");
                
                $(".notification-click-window").click(function(){
                    $(this).fadeOut();
                });

                setTimeout(function(){
                    $(".notification-click-window").fadeOut();
                },4000);
            }
        };

        var HandleCreateBlahFailure = function(theErr) {
            console.log("ERROR when creating blah");
            G.PromptUser("Sorry, an error occurred and your post was not created.  Please try again.", "OK", null, function(theData) {
                CheckPublishBtnDisable();
            });
        };

        var DoCloseBlah = function(){
            if (G.CurrentChannel._id == G.CurrentBlah.G) {
                InsertNewBlahIntoChannel(G.CurrentBlah);
            }
            $("#AdditionalInfoDiv").empty();
            exports.CloseBlah();
        };

        var ResizeCreatePage = function() {
            if (!G.IsShort) {
                if (pageHeight == null)
                    pageHeight = $(".PageBody")[0].getBoundingClientRect().height;
                var contentHeight = document.getElementById("createcontent").getBoundingClientRect().bottom;
                var footerHeight = $(".create-footer-div")[0].getBoundingClientRect().height;
                var offsetHeight = 36;
                var newBottom =  pageHeight - (contentHeight + footerHeight + offsetHeight);
                var minBottom = 0;
                if (newBottom < minBottom)
                    newBottom = minBottom;
                $(".create-footer-div").css({"bottom": newBottom + "px"});

                // resize the badge menu...
                var imageRect = $("#ShowBadgeAreaBtn")[0].getBoundingClientRect();
                var newTop = imageRect.bottom;
                var newLeft = imageRect.left;
                $("#ShowBadgeArea").css({"left":newLeft + "px", "top":newTop + "px"});
            }

        };

        var UploadBlahImage  = function() {
            if ($("#BlahImage").val() == "" ) {
                // clear the image
                $(".image-preview").addClass("no-image").css({"background-image":"none"}).text("no image");
            } else {
                var imageURL = "url('" + BlahguaConfig.fragmentURL + "img/ajax-loader.gif')";
                $(".image-preview").addClass("no-image").css({"background-image":imageURL});
                $(".image-preview span").text("loading");

                var formData = new FormData($("#ImageForm")[0]);
                ga('send', 'event', 'uploadimage', 'blah', 1, 1);
                $.ajax({
                    url: imageUploadURL,

                    type: 'POST',
                    //Ajax events
                    success: completeHandler = function(data) {
                        $("#ImagePreviewDiv").removeAttr("disabled");
                        $("#objectId").val(data);
                        // to do - update the image...
                        var imagePathName =  data + "=s128-c";
                        var theUrl = 'url("' + imagePathName + '")';
                        $(".image-preview").removeClass("no-image").css({"background-image":theUrl});
                        $(".image-preview span").text("");
                        $(".image-preview i").show();
                        blahgua_rest.GetUploadURL(function(theUrl) {
                            imageUploadURL = theUrl;
                        });
                        CheckPublishBtnDisable();
                    },
                    error: errorHandler = function(theErr) {
                        if (theErr.status == "409") {
                            ga('send', 'event', 'sessionerror', 'blahimageupload', 1, 1);
                            exports.LogoutUser(true);
                        } else {
                            $("#ImagePreviewDiv").removeAttr("disabled");
                            $(".image-preview").addClass("no-image").css({"background-image":"none"}).text("error");
                        }
                    },
                    // Form data
                    data: formData,
                    //Options to tell JQuery not to process data or worry about content-type
                    cache: false,
                    contentType: false,
                    processData: false
                }, 'json');
            }
        };


        var InsertNewBlahIntoChannel = function(theBlah) {
            // todo:  create a fake inbox item for this blah
            // and insert it into the blah list...
            var newItem = new Object();
            newItem["T"] = theBlah.T;
            newItem["I"] = theBlah._id;
            newItem["A"] = theBlah.A;
            newItem["c"] = theBlah.c;
            newItem["G"] = theBlah.G;
            newItem["N"] = 0;
            newItem["Y"] = theBlah.Y;
            newItem["IsTemp"] = true;
            if (theBlah.hasOwnProperty("B"))
                newItem["B"] = theBlah.B;

            newItem.S = 0;
            newItem.R = 0;
            newItem.V = 0;
            newItem.displaySize = 2;
            if (theBlah.hasOwnProperty("M"))
                newItem["M"] = theBlah.M;

            // insert it on top of an existing blah so as not to disturb
            // the world order
            var didIt = false;
            for (var curIndex in G.ActiveBlahList) {
                if (G.ActiveBlahList[curIndex].displaySize == 2) {
                    G.ActiveBlahList[curIndex] = newItem;
                    didIt = true;
                    break;
                }
            }

            if (!didIt) {
                // if there are no more twos, go ahead and replace the last item
                var size = G.ActiveBlahList.length;
                if (size > 0) {
                    newItem.displaySize = G.ActiveBlahList[size-1].displaySize;
                    G.ActiveBlahList[size-1] = newItem;
                }
            }

        };



        return {
            InitializePage: InitializePage
        }
    }
);