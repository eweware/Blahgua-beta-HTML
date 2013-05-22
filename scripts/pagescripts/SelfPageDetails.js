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

            $("#SaveProfileBtn").click(UpdateUserProfile);
            $("#LogoutBtn").click(exports.LogoutUser);
            $("#ForgetBtn").click(exports.ForgetUser);
            $('input[type=radio]').change(HandlePermAll);
            $("#UserImageBtn").click(function(theEvent) {
                document.getElementById('UserFormImage').click();
            } );
            $("#UserFormImage").change(HandleFilePreview);
            UpdateSelfProfile();
        };

        var HandleFilePreview = function() {
            var theFile = $("#UserFormImage").val();
            $("#UserImageImageNameSpan").text(theFile);

            MaybeEnableProfileSaveBtn();
        };


        var UpdateSelfProfile = function() {
            RefreshUserChannelContent();

        };

        var RefreshUserChannelContent = function() {
            $("#BlahFullItem").show();
            blahgua_rest.GetUserProfile(CurrentUser._id, OnGetOwnProfileOK, OnGetOwnProfileFailed);
        };

        var OnGetOwnProfileFailed = function(theErr) {
            if (theErr.status == 404) {
                // profile doesn't exist - add one!
                UserProfile = new Object();
                UserProfile["A"] = "a blahger";
                blahgua_rest.CreateUserProfile(UserProfile, OnGetOwnProfileOK, exports.OnFailure);
            }
        };


        var OnGetOwnProfileOK = function(theStats) {
            UserProfile = theStats;
            $("#userName").val(CurrentUser.N);
            var nickName = getSafeProperty(theStats, "A", "A Blahger");
            $("#NicknameInput").val(nickName);
            $("#FullBlahNickName").text(nickName);
            //image
            var newImage = GetUserImage(CurrentUser, "A");
            if (newImage != "")
            {
                $("#uploadimage").css({"background-image": "url('" + newImage + "')"});
                $("#BlahAuthorImage").css({"background-image": "url('" + newImage + "')"});
            }

            blahgua_rest.getUserDescriptorString(CurrentUser._id, function(theString) {
                $("#DescriptionSpan").text(theString.d);
            });

            // location
            $("#CityInput").val(getSafeProperty(theStats, "G", ""));
            $("#StateInput").val(getSafeProperty(theStats, "H", ""));
            $("#ZipcodeInput").val(getSafeProperty(theStats, "I", ""));

            // populate country codes
            var newEl;
            $.each(ProfileSchema.J.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(theStats, "J", -1))
                    newEl.selected = "selected";
                $("#CountryInput").append(newEl);
            });

            // demographics
            $("#DOBInput").val(getSafeProperty(theStats, "C", ""));

            $.each(ProfileSchema.B.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(theStats, "B", -1))
                    newEl.selected = "selected";
                $("#GenderInput").append(newEl);
            });
            $.each(ProfileSchema.D.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(theStats, "D", -1))
                    newEl.selected = "selected";
                $("#EthnicityInput").append(newEl);
            });
            $.each(ProfileSchema.E.DT, function(index, item){
                newEl = document.createElement("option");
                newEl.value = index;
                newEl.innerHTML = item;
                if (index == getSafeProperty(theStats, "E", -1))
                    newEl.selected = "selected";
                $("#IncomeInput").append(newEl);
            });

            // permissions
            $('input[name=nickname]').val([getSafeProperty(theStats, "0", 0)]);

            $('input[name=city]').val([getSafeProperty(theStats, "6", 0)]);
            $('input[name=state]').val([getSafeProperty(theStats, "7", 0)]);
            $('input[name=zipcode]').val([getSafeProperty(theStats, "8", 0)]);
            $('input[name=country]').val([getSafeProperty(theStats, "9", 0)]);

            $('input[name=age]').val([getSafeProperty(theStats, "2", 0)]);
            $('input[name=income]').val([getSafeProperty(theStats, "4", 0)]);
            $('input[name=gender]').val([getSafeProperty(theStats, "1", 0)]);
            $('input[name=race]').val([getSafeProperty(theStats, "3", 0)]);

            // badges
            UpdateBadgeArea();
            ShowBadgeSelection();
            $("#SaveProfileBtn").attr("disabled", "disabled");
            $('input').change(MaybeEnableProfileSaveBtn);
            $('select').change(MaybeEnableProfileSaveBtn);


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
            if(validated) $("#SaveProfileBtn").removeAttr("disabled");
        };

        var HandlePermAll = function(theEvent) {
            if ($(theEvent.target).attr("name") == "all") {
                var setAllTo = Number($('input:radio[name=all]:checked').val());
                $('input:radio').val([setAllTo]);
            } else {
                var setAll = true;
                var allVal = false;

                $("input:radio:checked").each(function(index, item) {
                    if (setAll && $(item).attr("name") != "all") {
                        if (!allVal)
                            allVal = item.value;
                        else if (allVal != item.value)
                            setAll = false;
                    }
                });
                if (!setAll)
                    allVal = false;
                $('input[name=all]').val([allVal]);

            }

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
                $("#BadgesDiv").html("<tr><td>You don't have no stinkin' badges!</tr></td>");
            }
        };

        var CreateAndAppendBadgeHTML = function(theBadge) {
            blahgua_rest.getBadgeById(theBadge, function(fullBadge) {
                var newHTML = "";
                var imagePath = "http://beta.blahgua.com.s3.amazonaws.com/img/generic-badge.png";
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

        var UpdateUserProfile = function() {
            UserProfile["A"] = $("#NicknameInput").val();

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
            UserProfile["0"] = Number($('input:checkbox[name=nickname]:checked').val());
            UserProfile["6"] = Number($('input:checkbox[name=city]:checked').val());
            UserProfile["7"] = Number($('input:checkbox[name=state]:checked').val());
            UserProfile["8"] = Number($('input:checkbox[name=zipcode]:checked').val());
            UserProfile["9"] = Number($('input:checkbox[name=country]:checked').val());
            UserProfile["2"] = Number($('input:checkbox[name=age]:checked').val());
            UserProfile["4"] = Number($('input:checkbox[name=income]:checked').val());
            UserProfile["1"] = Number($('input:checkbox[name=gender]:checked').val());
            UserProfile["3"] = Number($('input:checkbox[name=race]:checked').val());

            // commit
            blahgua_rest.UpdateUserProfile(UserProfile, function() {
                var nickName = $("#NicknameInput").val();
                $("#FullBlahNickName").text(nickName);
                document.getElementById("SaveProfileBtn").disabled = true;
                blahgua_rest.getUserDescriptorString(CurrentUser._id, function(theString) {
                    $("#DescriptionSpan").text(theString.d);
                }, function(theErr) {
                    $("#DescriptionSpan").text("an anonymous blahger");
                });
            });

            if ($("#UserFormImage").val() != "")
                UploadUserImage();
        };

        var UploadUserImage = function() {
            $("#ProgressDiv").show();
            $("#objectId").val(CurrentUser._id);

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
           $("ProgressDiv").hide();
           $("UserFormImage").val("");
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