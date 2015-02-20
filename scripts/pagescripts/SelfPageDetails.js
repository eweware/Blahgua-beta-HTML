/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPageDetails',
    ["globals", "ExportFunctions", "blahgua_restapi"],
    function (G, exports, blahgua_rest) {

        var  InitializePage = function() {

            $("#SaveAccountInfoBtn").click(UpdateUserAccountInfo);
            $("#SaveDemographicsBtn").click(UpdateUserDemographics);
            $("#LogoutBtn").click(exports.LogoutUser);
            $("#ForgetBtn").click(exports.ForgetUser);

            $("#UserFormImage").change(HandleFilePreview);
            $("#RecoveryInfo").click(function(theEvent) {
                G.PromptUser("Heard does not require an email address to fully use the system.  However, if you forget your password, it will not be recoverable if we do not have an email address on file.<br/><br/>" +
                    "Your recovery email can be different than the email you use to obtain badges, and can be changed or removed at any time.",
                    "Got it");
            });

            if (!G.IsUploadCapable) {
                $(".hidden-upload").hide();
            } else {
                blahgua_rest.GetUploadURL(function(theURL) {
                    $("#ImageForm").action = theURL;
                    imageUploadURL = theURL;
                });
            }

            $(".image-delete-btn").click(function(theEvent) {
                blahgua_rest.DeleteUserImage(function(json) {
                    // clear the image
                    $("#uploadimage").addClass("no-image").css({"background-image":"none"});
                    $("#uploadimage span").text("no image");
                    $("#uploadimage i").hide();
                    var newImage = G.GetGenericUserImage();
                    $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                    $(".profile-button").css({"background-image": "url('" + newImage + "')"});

                }, function(theErr) {
                    $("#uploadimage").addClass("no-image").css({"background-image":"none"});
                    $("#uploadimage span").text("no image");
                    $("#uploadimage i").hide();
                    var newImage = G.GetGenericUserImage();
                    $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                    $(".profile-button").css({"background-image": "url('" + newImage + "')"});
                });
            });

            RefreshPage();
        };

        var HandleFilePreview = function() {
            var theFile = $("#UserFormImage").val();
            if (theFile) {
                UploadUserImage();
            }
        };


        var RefreshPage = function() {
            $("#userName").text(G.CurrentUser.N);
            var nickName = G.GetSafeProperty(G.UserProfile, "A", "someone");
            $("#NicknameInput").val(nickName).attr("initial-value", nickName);
            //image
            var newImage = G.GetUserImage(G.CurrentUser, "A");
            if (newImage != "") {
                $("#uploadimage").css({"background-image": "url('" + newImage + "')"});
                $("#uploadimage span").text("");
                $("#uploadimage i").show();
            } else {
                $("#uploadimage").css({"background-image": "none"});
                $("#uploadimage span").text("no image");
                $("#uploadimage i").hide();
            }

            var wantsMature = G.GetSafeProperty(G.CurrentUser, "XXX", false);
            $("#WantsMatureCheckBox").prop('checked', wantsMature).attr("initial-value", wantsMature.changed);



            // recovery info
            blahgua_rest.getRecoveryInfo(function(theData) {
                var emailAddr = "";
                if (theData.hasOwnProperty("E")) {
                    emailAddr = theData.E;
                }
                $("#RecoveryEmail").val(emailAddr).attr("initial-value", emailAddr);

            }, function (theErr) {

            });
            // password
            $("#Password").val("").attr("initial-value", "");
            $("#PasswordConfirm").val("");

            // location
            $("#CityInput").val(G.GetSafeProperty(G.UserProfile, "G", ""));
            $("#StateInput").val(G.GetSafeProperty(G.UserProfile, "H", ""));
            $("#ZipcodeInput").val(G.GetSafeProperty(G.UserProfile, "I", ""));

            // populate country codes
            var newEl;
            $.each(G.ProfileSchema.J.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == G.GetSafeProperty(G.UserProfile, "J", -1))
                    newEl.selected = "selected";
                $("#CountryInput").append(newEl);
            });

            // demographics
			$("#DOBInput").attr('max',getTodayDate)
            $("#DOBInput").val(G.GetSafeProperty(G.UserProfile, "C", ""));

            $.each(G.ProfileSchema.B.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == G.GetSafeProperty(G.UserProfile, "B", -1))
                    newEl.selected = "selected";
                $("#GenderInput").append(newEl);
            });
            $.each(G.ProfileSchema.D.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == G.GetSafeProperty(G.UserProfile, "D", -1))
                    newEl.selected = "selected";
                $("#EthnicityInput").append(newEl);
            });
            $.each(G.ProfileSchema.E.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == G.GetSafeProperty(G.UserProfile, "E", -1))
                    newEl.selected = "selected";
                $("#IncomeInput").append(newEl);
            });



            // permissions
            $('input:checkbox[name=city]').val([G.GetSafeProperty(G.UserProfile, "6", 0)]);
            $('input:checkbox[name=state]').val([G.GetSafeProperty(G.UserProfile, "7", 0)]);
            $('input:checkbox[name=zipcode]').prop('checked', false).val(0);
            $('input:checkbox[name=country]').val([G.GetSafeProperty(G.UserProfile, "9", 0)]);

            $('input:checkbox[name=age]').val([G.GetSafeProperty(G.UserProfile, "2", 0)]);
            $('input:checkbox[name=income]').prop('checked', false).val(0);
            $('input:checkbox[name=gender]').val([G.GetSafeProperty(G.UserProfile, "1", 0)]);
            $('input:checkbox[name=race]').val([G.GetSafeProperty(G.UserProfile, "3", 0)]);


            // badges
            UpdateBadgeArea();
            ShowBadgeSelection();
            $("#SaveAccountInfoBtn").attr("disabled", "disabled");
            $('#AccountArea input[data-validate]').change(MaybeEnableProfileSaveBtn);
            $('#AccountArea input:text').keyup(MaybeEnableProfileSaveBtn);
            $('#AccountArea input:password').keyup(MaybeEnableProfileSaveBtn);
            $('#AccountArea input:checkbox').change(MaybeEnableProfileSaveBtn);

            $("#SaveDemographicsBtn").attr("disabled", "disabled");
            $('#DemoArea input').keyup(MaybeEnableDemoSaveBtn);
            $('#DemoArea select').change(MaybeEnableDemoSaveBtn);$('#AccountArea input:checkbox')
            $('#DemoArea input:checkbox').click(MaybeEnableDemoSaveBtn);


            // headers
            $('.accordion h2').click(function(theEvent) {
                var parent = $(this).parent('.accordion');
                if (parent.hasClass("active")) {
                    // close it
                    parent.removeClass("active");
                } else {
                    // open it and close others
                    $(".active").removeClass("active");
                    parent.addClass("active");
                    this.scrollIntoView(true);
                }
            });
        };

        var MaybeEnableProfileSaveBtn = function() {
            var errMsg = G.ValidateForm($("#AccountArea"));
            if(errMsg == "")
                $("#SaveAccountInfoBtn").removeAttr("disabled");
            else
                $("#SaveAccountInfoBtn").attr("disabled", true);
        };

        var MaybeEnableDemoSaveBtn = function() {
            var validated = true;
            if(validated) $("#SaveDemographicsBtn").removeAttr("disabled");
        };


        var ShowBadgeSelection = function() {
            blahgua_rest.getAuthorities(function (authList) {
                var newHTML = "<table><tbody>";
                $.each(authList, function(index, curAuth) {
                    newHTML += CreateBadgeAuthHTML(curAuth);
                });
                newHTML += "</tbody></table>";
                $("#BadgeAuthorityArea").html(newHTML);
                // bind event
                $("#BadgeAuthorityArea button").click(function(theEvent) {
                    var ID = $(theEvent.target).attr("data-authority-id");
                    var badgeName =  $(theEvent.target).attr("data-authority-name");
                    DoAddBadge(ID, badgeName);
                });
            }, exports.OnFailure);
        };

        var CreateBadgeAuthHTML = function(theAuth) {
            var isIE = (navigator.userAgent.indexOf('MSIE') != -1);
            var newHTML = "<tr>";
            newHTML += "<td><span class='badge-name-span'>" + theAuth.N;
            if (isIE) {
                newHTML += "<span class='ie-apology'>  (not supported in IE)</span>";
            }
            newHTML += "</span><br/>";
            newHTML += "<span class='badge-desc-span'>" + theAuth.D + "</span>";

            newHTML += "</td>";
            if (isIE) {
                newHTML += '<td><button class="small-button" style="margin-left: 12px; width:120px" disabled="disabled">Get Badged</button></td>';
            }
            else
                newHTML += '<td><button class="small-button" style="width:120px" data-authority-name="' + theAuth.N + '" data-authority-id="' + theAuth._id + '">Get Badged</button></td>';

            newHTML += "</tr>";

            return newHTML;
        };

        var UpdateBadgeArea = function() {
            if (G.CurrentUser.hasOwnProperty("B")) {
                // add badges
                $("#BadgesDiv").empty();
                $.each(G.CurrentUser.B, function(index, curBadge) {
                    CreateAndAppendBadgeHTML(curBadge);
                });
            } else {
                $("#BadgesDiv").html("<tr><td>No current badges.  Add them above.</tr></td>");
            }
        };

        var MinDateStr = function(theDate) {
            var dateStr = "";
            dateStr += theDate.getMonth() + 1;
            dateStr += "/";
            dateStr += theDate.getDate();
            dateStr += "/";
            dateStr += theDate.getFullYear();
            return dateStr ;
        };

        var CreateAndAppendBadgeHTML = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var newHTML = "";
                var imagePath = BlahguaConfig.fragmentURL + "img/badge_standalone-46x40.png";
                newHTML += "<tr><td><div class='badgeholder'>";
                newHTML += "<span class='badgename'>";
                if (fullBadge.hasOwnProperty("K")) {
                    imagePath = fullBadge.K;
                }
                newHTML += "<img class='badgeimage' src='" + imagePath + "'>";
                newHTML += "<span class='badgenamespan'>" + fullBadge.N + "</span></span>";
                newHTML += "<span class='badgeexp'>";
                if (G.IsNarrow)
                    newHTML += "exp ";
                else
                    newHTML += "expires ";
                newHTML += MinDateStr(new Date(fullBadge.X)) + "</span>";
                newHTML += "</div></td>";

                newHTML += "</tr>";
                $("#BadgesDiv").append(newHTML);
            }, function (theErr) {
                var newHTML = "";
                newHTML += "<tr><td><div>Error loading Badge id=" + theBadge + "</div></td></tr>";
                $("#BadgesDiv").append(newHTML);
            });
        };

        var DoAddBadge = function(badgeID, badgeName) {
            ga('send', 'event', 'requestbadge', 'badge', badgeID, 1);
            blahgua_rest.createBadgeForUser(badgeID, null, function(data) {
                //var dialogHTML = badge_api.dialog_html();
                var dialogHTML = data;
                dialogHTML = data.slice(0,67) + data.slice(132);

                var windowWidth = $(window).width();
                var offset = (windowWidth - 512) / 2;
                if (offset < 0)
                    offset = 0;
                var iFrameHTML = "<div id='BadgeOverlayShield' class='BadgeOverlayShield' style='display:none'>";
                iFrameHTML += "<div  id='BadgeOverlay' class='BadgeOverlay' style='display:none; left:" + offset + "px; right:" + offset + "px'>"
                iFrameHTML += "<div class='BadgeTitleBar'>" + badgeName + "</div>";
                iFrameHTML += "<div id='badgedialog' style='background-color: orange; position:absolute; width:100%; top:35px; bottom:0px; overflow-y: auto'>";
                iFrameHTML += dialogHTML;
                iFrameHTML += "</div>";
                iFrameHTML += "</div>";
                iFrameHTML += "</div>";
                $(iFrameHTML).appendTo('body');

               // $("#badgedialog").contents().find('body').append(dialogHTML);
                $("#BadgeOverlayShield").show();
                $("#BadgeOverlay").fadeIn();


                window.ba_dialog_closed = HandleBadgeDismiss;

            }, exports.OnFailure);
        };


        var HandleBadgeDismiss = function(theMsg) {
            $("#BadgeOverlay").fadeOut( 150, function () {
                $("#BadgeOverlayShield").remove();
                // refresh the badges for the user
                blahgua_rest.getUserInfo(function (json) {
                    G.CurrentUser = json;
                    SetSelfDetailPage("Profile");
                });

            } );
        };

        var UpdateUserAccountInfo = function() {
            var theErr = G.ValidateForm($("#AccountArea"));
            $("#SaveAccountInfoBtn").attr("disabled", true);
            if (theErr == "")  {
                var nickName = $("#NicknameInput").val();
                if (nickName != $("#NicknameInput").attr("initial-value")) {
                    G.UserProfile["A"] = $("#NicknameInput").val();
                    G.UserProfile["0"] = 2; // TODO: review - nickname is always public

                    // commit
                    blahgua_rest.UpdateUserProfile(G.UserProfile, function() {
                        var nickName = $("#NicknameInput").val();
                        $("NicknameInput").attr("initial-value", nickName);
                        $("#FullBlahNickName").text(nickName);
                    });
                }

                var password = $("#Password").val();
                if (password != "") {
                    blahgua_rest.updatePassword(password);
                }

                var email = $("#RecoveryEmail").val();
                if (email != $("#RecoveryEmail").attr("initial-value")) {
                    if (email == "")
                        email = null;
                    blahgua_rest.setRecoveryInfo(email, function (data) {
                        $("#RecoveryEmail").attr("initial-value", email);
                    });
                }

                var wantsMature = $("#WantsMatureCheckBox").prop('checked');
                if (wantsMature != $("#WantsMatureCheckBox").attr("initial-value")) {
                    blahgua_rest.setUserWantsMature(wantsMature, function (data) {
                        $("#WantsMatureCheckBox").attr("initial-value", wantsMature);
                        G.CurrentUser.setProperty("XXX", wantsMature);
                    });
                }
            }

        };

        var UpdateUserDemographics = function() {
            // location
            G.UserProfile["G"] = $("#CityInput").val();
            G.UserProfile["H"] = $("#StateInput").val();
            G.UserProfile["I"] = $("#ZipcodeInput").val();
            G.UserProfile["J"] = $("#CountryInput").val();

            // demographics
            G.UserProfile["C"] = $("#DOBInput").val();
            G.UserProfile["E"] = $("#IncomeInput").val();
            G.UserProfile["B"] = $("#GenderInput").val();
            G.UserProfile["D"] = $("#EthnicityInput").val();

            // permissions
            var permVal;
            if (G.UserProfile["G"] == "") {
                G.UserProfile["6"] = 0;
                $('input:checkbox[name=city]').prop("checked", false)
            }
            else
                G.UserProfile["6"] = $('input:checkbox[name=city]:checked').val() ? 2 : 0;


            if (G.UserProfile["H"] == "") {
                G.UserProfile["7"] = 0;
                $('input:checkbox[name=state]').prop("checked", false)
            } else
                G.UserProfile["7"] = $('input:checkbox[name=state]:checked').val() ? 2 : 0;

            if (G.UserProfile["I"] == "") {
                G.UserProfile["8"] = 0;
                $('input:checkbox[name=zipcode]').prop("checked", false)
            } else
                G.UserProfile["8"] = $('input:checkbox[name=zipcode]:checked').val() ? 2 : 0;

            if (G.UserProfile["J"] == "-1") {
                G.UserProfile["9"] = 0;
                $('input:checkbox[name=country]').prop("checked", false)
            } else
                G.UserProfile["9"] = $('input:checkbox[name=country]:checked').val() ? 2 : 0;

            if (G.UserProfile["C"] == "") {
                G.UserProfile["2"] = 0;
                $('input:checkbox[name=age]').prop("checked", false)
            } else
                G.UserProfile["2"] = $('input:checkbox[name=age]:checked').val() ? 2 : 0;

            if (G.UserProfile["E"] == "-1") {
                G.UserProfile["4"] = 0;
                $('input:checkbox[name=income]').prop("checked", false)
            } else
                G.UserProfile["4"] = $('input:checkbox[name=income]:checked').val() ? 2 : 0;

            if (G.UserProfile["B"] == "-1") {
                G.UserProfile["1"] = 0;
                $('input:checkbox[name=gender]').prop("checked", false)
            } else
                G.UserProfile["1"] = $('input:checkbox[name=gender]:checked').val() ? 2 : 0;

            if (G.UserProfile["D"] == "-1") {
                G.UserProfile["3"] = 0;
                $('input:checkbox[name=race]').prop("checked", false)
            } else
                G.UserProfile["3"] = $('input:checkbox[name=race]:checked').val() ? 2 : 0;

            // commit
            blahgua_rest.UpdateUserProfile(G.UserProfile, function(theObject) {
                $("#SaveDemographicsBtn").attr("disabled", "disabled");
                blahgua_rest.getUserDescriptorString(G.CurrentUser._id, function(theString) {
                    $("#DescriptionSpan").text(theString.d);
                    if (!G.IsShort) {
                        var pageTop = $("#DescriptionSpan")[0].getBoundingClientRect().bottom - 16;
                        $("#SelfPageDiv").css({"top":pageTop + "px"});
                    }

                }, function(theErr) {
                    $("#DescriptionSpan").text("someone");
                    if (!G.IsShort) {
                        var pageTop = $("#DescriptionSpan")[0].getBoundingClientRect().bottom - 16;
                        $("#SelfPageDiv").css({"top":pageTop + "px"});
                    }
                });
            });
        };

        var UploadUserImage = function() {
            if ($("#UserFormImage").val() == "" ) {
                // do nothing if they cancel...
            } else {
                var imageURL = "url('" + BlahguaConfig.fragmentURL + "img/ajax-loader.gif')";
                $("#uploadimage").addClass("no-image").css({"background-image":imageURL});
                $("#uploadimage span").text("");
                $("#uploadimage i").hide();
                $("#objectId").val(G.CurrentUser._id);

                var formData = new FormData($("#ImageForm")[0]);
                ga('send', 'event', 'uploadimage', 'user', 1, 1);
                $.ajax({
                    url: imageUploadURL,

                    type: 'POST',

                    //Ajax events
                    success: completeHandler = function(data) {
                        $("#uploadimage").removeAttr("disabled");
                        blahgua_rest.SetUserImage(data, function () {
                            DoUploadComplete();
                        });

                        blahgua_rest.GetUploadURL(function(theUrl) {
                            imageUploadURL = theUrl;
                        });

                    },
                    error: errorHandler = function(theErr) {
                        $("#uploadimage").removeAttr("disabled");
                        $("#uploadimage").addClass("no-image").css({"background-image":"none"});
                        $("#uploadimage span").text("error");
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

	  var getTodayDate=function()
		 {
		    var today=new Date();
			var y=today.getFullYear();
			var m=today.getMonth()+1;
			if(m<10)
			{m="0"+m;}
			var d=today.getDate();
			if(d<10)
			{d="0"+d;}
			 return y+"-"+m+"-"+d;
		 
		 }

        var DoUploadComplete = function() {
           $("#ProgressDiv").hide();
           $("#UserFormImage").val("");
            blahgua_rest.getUserInfo(function (json) {
                G.CurrentUser = json;
                var newImage = G.GetUserImage(G.CurrentUser, "A");
                $("#uploadimage").removeClass("no-image").css({"background-image": "url('" + newImage + "')"});
                $("#uploadimage span").text("");
                $("#uploadimage i").show();
	            $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
                $(".profile-button").css({"background-image": "url('" + newImage + "')"});



            });
        };

        var progressHandlingFunction = function(evt) {
            var maxWidth = $("#ProgressBar").width();
            var curWidth = 100;
            var ratio = evt.loaded / evt.total;
            var newWidth = Math.floor(maxWidth * ratio);
            $("#Indicator").width(newWidth);
        };



        return {
            InitializePage: InitializePage
        }
    }
);


