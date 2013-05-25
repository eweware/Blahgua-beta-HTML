/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:50 AM
 * To change this template use File | Settings | File Templates.
 */


define('SelfPageDetails',
    ["GlobalFunctions", "blahgua_restapi"],
    function (exports, blahgua_rest) {

        var  InitializePage = function() {

            $("#SaveAccountInfoBtn").click(UpdateUserAccountInfo);
            $("#SaveDemographicsBtn").click(UpdateUserAccountInfo);
            $("#LogoutBtn").click(exports.LogoutUser);
            $("#ForgetBtn").click(exports.ForgetUser);
            $("#UserImageBtn").click(function(theEvent) {
                document.getElementById('UserFormImage').click();
            } );
            $("#UserFormImage").change(HandleFilePreview);
            RefreshPage();
        };

        var HandleFilePreview = function() {
            var theFile = $("#UserFormImage").val();
            if (theFile) {
                UploadUserImage();
            }
        };


        var RefreshPage = function() {
            $("#userName").val(CurrentUser.N);
            var nickName = getSafeProperty(UserProfile, "A", "someone");
            $("#NicknameInput").val(nickName);
            //image
            var newImage = GetUserImage(CurrentUser, "A");
            if (newImage != "")
                $("#uploadimage").css({"background-image": "url('" + newImage + "')"});

            // location
            $("#CityInput").val(getSafeProperty(UserProfile, "G", ""));
            $("#StateInput").val(getSafeProperty(UserProfile, "H", ""));
            $("#ZipcodeInput").val(getSafeProperty(UserProfile, "I", ""));

            // populate country codes
            var newEl;
            $.each(ProfileSchema.J.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(UserProfile, "J", -1))
                    newEl.selected = "selected";
                $("#CountryInput").append(newEl);
            });

            // demographics
            $("#DOBInput").val(getSafeProperty(UserProfile, "C", ""));

            $.each(ProfileSchema.B.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(UserProfile, "B", -1))
                    newEl.selected = "selected";
                $("#GenderInput").append(newEl);
            });
            $.each(ProfileSchema.D.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(UserProfile, "D", -1))
                    newEl.selected = "selected";
                $("#EthnicityInput").append(newEl);
            });
            $.each(ProfileSchema.E.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(UserProfile, "E", -1))
                    newEl.selected = "selected";
                $("#IncomeInput").append(newEl);
            });

            // permissions
            $('input:checkbox[name=city]').val([getSafeProperty(UserProfile, "6", 0)]);
            $('input:checkbox[name=state]').val([getSafeProperty(UserProfile, "7", 0)]);
            $('input:checkbox[name=zipcode]').val([getSafeProperty(UserProfile, "8", 0)]);
            $('input:checkbox[name=country]').val([getSafeProperty(UserProfile, "9", 0)]);

            $('input:checkbox[name=age]').val([getSafeProperty(UserProfile, "2", 0)]);
            $('input:checkbox[name=income]').val([getSafeProperty(UserProfile, "4", 0)]);
            $('input:checkbox[name=gender]').val([getSafeProperty(UserProfile, "1", 0)]);
            $('input:checkbox[name=race]').val([getSafeProperty(UserProfile, "3", 0)]);


            // badges
            UpdateBadgeArea();
            ShowBadgeSelection();
            $("#SaveAccountInfoBtn").attr("disabled", "disabled");
            $('#AccountArea input').change(MaybeEnableProfileSaveBtn);
            $('#AccountArea input:text').keydown(MaybeEnableProfileSaveBtn);

            $("#SaveDemographicsBtn").attr("disabled", "disabled");
            $('#DemoArea input').keydown(MaybeEnableDemoSaveBtn);
            $('#DemoArea select').change(MaybeEnableDemoSaveBtn);


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
            var validated = true;
            if(validated) $("#SaveAccountInfoBtn").removeAttr("disabled");
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
            if (CurrentUser.hasOwnProperty("B")) {
                // add badges
                $("#BadgesDiv").empty();
                $.each(CurrentUser.B, function(index, curBadge) {
                    CreateAndAppendBadgeHTML(curBadge);
                });
            } else {
                $("#BadgesDiv").html("<tr><td>No current badges.  Add them below.</tr></td>");
            }
        };

        var CreateAndAppendBadgeHTML = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var newHTML = "";
                var imagePath = "https://s3-us-west-2.amazonaws.com/beta.blahgua.com/img/generic-badge.png";
                newHTML += "<tr><td><div class='badgeholder'>";
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

        var DoAddBadge = function(badgeID) {
            blahgua_rest.createBadgeForUser(badgeID, null, function(data) {
                var dialogHTML = data;
                var windowWidth = $(window).width();
                var offset = (windowWidth - 512) / 2;
                if (offset < 0)
                    offset = 0;
                $("#BadgeOverlay").css({"left": offset + "px", "right": offset + "px"});
                $(".BadgeTitleBar").text("talking to " + badgeID);
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
                    CurrentUser = json;
                    UpdateBadgeArea();
                });

            } );
        };

        var UpdateUserAccountInfo = function() {
            UserProfile["A"] = $("#NicknameInput").val();
            UserProfile["0"] = 2; // TODO: review - nickname is always public

            // TODO:  email address
            // TODO:  password
            // commit
            blahgua_rest.UpdateUserProfile(UserProfile, function() {
                var nickName = $("#NicknameInput").val();
                $("#FullBlahNickName").text(nickName);
                $("#SaveAccountInfoBtn").attr("disabled", "disabled");
            });
        };

        var UpdateUserDemographics = function() {
            // location
            UserProfile["G"] = $("#CityInput").val();
            UserProfile["H"] = $("#StateInput").val();
            UserProfile["I"] = $("#ZipcodeInput").val();
            UserProfile["J"] = $("#CountryInput").val();

            // demographics
            UserProfile["C"] = $("#DOBInput").val();
            UserProfile["E"] = $("#IncomeInput").val();
            UserProfile["B"] = $("#GenderInput").val();
            UserProfile["D"] = $("#EthnicityInput").val();

            // permissions
            UserProfile["6"] = $('input:checkbox[name=city]:checked').val() ? 2 : 0;
            UserProfile["7"] = $('input:checkbox[name=state]:checked').val() ? 2 : 0;
            UserProfile["8"] = $('input:checkbox[name=zipcode]:checked').val() ? 2 : 0;
            UserProfile["9"] = $('input:checkbox[name=country]:checked').val() ? 2 : 0;
            UserProfile["2"] = $('input:checkbox[name=age]:checked').val() ? 2 : 0;
            UserProfile["4"] = $('input:checkbox[name=income]:checked').val() ? 2 : 0;
            UserProfile["1"] = $('input:checkbox[name=gender]:checked').val() ? 2 : 0;
            UserProfile["3"] = $('input:checkbox[name=race]:checked').val() ? 2 : 0;

            // commit
            blahgua_rest.UpdateUserProfile(UserProfile, function() {
                $("#SaveDemographicsBtn").attr("disabled", "disabled");
                blahgua_rest.getUserDescriptorString(CurrentUser._id, function(theString) {
                    $("#DescriptionSpan").text(theString.d);
                }, function(theErr) {
                    $("#DescriptionSpan").text("someone");
                });
            });
        };

        var UploadUserImage = function() {
            $("#ProgressDiv").show();
            $("#objectId").val(CurrentUser._id);

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

        var DoUploadComplete = function() {
           $("#ProgressDiv").hide();
           $("#UserFormImage").val("");
            blahgua_rest.getUserInfo(function (json) {
                CurrentUser = json;
                var newImage = GetUserImage(CurrentUser, "A");
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