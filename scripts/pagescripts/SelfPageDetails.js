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
            $("#UserImageBtn").click(function(theEvent) {
                document.getElementById('UserFormImage').click();
            } );
            $("#UserFormImage").change(HandleFilePreview);
            $("#RecoveryInfo").click(function(theEvent) {
                G.PromptUser("Blahgua does not require an email address to fully use the system.  However, if you should forget your password, we will not be able to recover it for you if we do not have an email address on file.<br/><br/>" +
                    "You can also change or remove your email address at any time.",
                    "Got it");
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
           // $("#userName").val(G.CurrentUser.N);
            var nickName = G.GetSafeProperty(G.UserProfile, "A", "someone");
            $("#NicknameInput").val(nickName).attr("initial-value", nickName);
            //image
            var newImage = G.GetUserImage(G.CurrentUser, "A");
            if (newImage != "")
                $("#uploadimage").css({"background-image": "url('" + newImage + "')"});

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
            $('input:checkbox[name=zipcode]').val([G.GetSafeProperty(G.UserProfile, "8", 0)]);
            $('input:checkbox[name=country]').val([G.GetSafeProperty(G.UserProfile, "9", 0)]);

            $('input:checkbox[name=age]').val([G.GetSafeProperty(G.UserProfile, "2", 0)]);
            $('input:checkbox[name=income]').val([G.GetSafeProperty(G.UserProfile, "4", 0)]);
            $('input:checkbox[name=gender]').val([G.GetSafeProperty(G.UserProfile, "1", 0)]);
            $('input:checkbox[name=race]').val([G.GetSafeProperty(G.UserProfile, "3", 0)]);


            // badges
            UpdateBadgeArea();
            ShowBadgeSelection();
            $("#SaveAccountInfoBtn").attr("disabled", "disabled");
            $('#AccountArea input[data-validate]').change(MaybeEnableProfileSaveBtn);
            $('#AccountArea input:text').keydown(MaybeEnableProfileSaveBtn);

            $("#SaveDemographicsBtn").attr("disabled", "disabled");
            $('#DemoArea input').keydown(MaybeEnableDemoSaveBtn);
            $('#DemoArea select').change(MaybeEnableDemoSaveBtn);
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
                    DoAddBadge(ID);
                });
            }, exports.OnFailure);
        };

        var CreateBadgeAuthHTML = function(theAuth) {
            var newHTML = "<tr>";
            newHTML += "<td><span>" + theAuth.N + "</span></td>";
            newHTML += "<td><span>" + theAuth.D + "</span></td>";
            newHTML += '<td><button data-authority-id="' + theAuth._id + '">Add</button></td>';
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

        var CreateAndAppendBadgeHTML = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var newHTML = "";
                var imagePath = BlahguaConfig.fragmentURL + "img/generic-badge.png";
                newHTML += "<tr><td><div class='badgeholder'>";
                newHTML += "<div class='badgename'>";
                if (fullBadge.hasOwnProperty("K")) {
                    imagePath = fullBadge.K;
                }
                newHTML += "<img class='badgeimage' src='" + imagePath + "'>";
                newHTML += fullBadge.N + "</div>";
                newHTML += "<div class='badgesource'>granted by: " + fullBadge.D + "</div>";
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

        var DoAddBadge = function(badgeID) {
            blahgua_rest.createBadgeForUser(badgeID, null, function(data) {
                var dialogHTML = data;
                var windowWidth = $(window).width();
                var offset = (windowWidth - 512) / 2;
                if (offset < 0)
                    offset = 0;
                $("#BadgeOverlay").css({"left": offset + "px", "right": offset + "px"});
                $(".BadgeTitleBar").text("" + badgeID);
                $("#badgedialog").html(dialogHTML);
                $("#BadgeOverlay").fadeIn();
                window.ba_dialog_closed = HandleBadgeDismiss;

            }, exports.OnFailure);
        };

        var HandleBadgeDismiss = function(theMsg) {
            $("#BadgeOverlay").fadeOut( 150, function () {
                $("#badgedialog").empty();
                // refresh the badges for the user
                blahgua_rest.getUserInfo(function (json) {
                    G.CurrentUser = json;
                    UpdateBadgeArea();
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
            G.UserProfile["6"] = $('input:checkbox[name=city]:checked').val() ? 2 : 0;
            G.UserProfile["7"] = $('input:checkbox[name=state]:checked').val() ? 2 : 0;
            G.UserProfile["8"] = $('input:checkbox[name=zipcode]:checked').val() ? 2 : 0;
            G.UserProfile["9"] = $('input:checkbox[name=country]:checked').val() ? 2 : 0;
            G.UserProfile["2"] = $('input:checkbox[name=age]:checked').val() ? 2 : 0;
            G.UserProfile["4"] = $('input:checkbox[name=income]:checked').val() ? 2 : 0;
            G.UserProfile["1"] = $('input:checkbox[name=gender]:checked').val() ? 2 : 0;
            G.UserProfile["3"] = $('input:checkbox[name=race]:checked').val() ? 2 : 0;

            // commit
            blahgua_rest.UpdateUserProfile(G.UserProfile, function() {
                $("#SaveDemographicsBtn").attr("disabled", "disabled");
                blahgua_rest.getUserDescriptorString(G.CurrentUser._id, function(theString) {
                    $("#DescriptionSpan").text(theString.d);
                }, function(theErr) {
                    $("#DescriptionSpan").text("someone");
                });
            });
        };

        var UploadUserImage = function() {
            $("#ProgressDiv").show();
            $("#objectId").val(G.CurrentUser._id);

            var formData = new FormData($("#ImageForm")[0]);
            $.ajax({
                url: BlahguaConfig.apiURL + "images/upload",

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
                    DoUploadComplete();

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

	  var getTodayDate=function()
		 {
		    var today=new Date();
			var y=today.getFullYear();
			var m=today.getMonth()+1;
			if(m<10)
			{m="0"+m;}
			var d=today.getDate();
			 return y+"-"+m+"-"+d;
		 
		 }

        var DoUploadComplete = function() {
           $("#ProgressDiv").hide();
           $("#UserFormImage").val("");
            blahgua_rest.getUserInfo(function (json) {
                G.CurrentUser = json;
                var newImage = G.GetUserImage(G.CurrentUser, "A");
                $("#uploadimage").css({"background-image": "url('" + newImage + "')"});
                $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});



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
