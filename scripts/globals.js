/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/23/13
 * Time: 6:08 PM
 * To change this template use File | Settings | File Templates.
 */

define('globals',
    ["constants"],
    function (K) {

        var Initialize = function() {

        };

        // extend jquery
        (function ($) {
            $.fn.disableSelection = function () {
                return this.each(function () {
                    $(this).attr('unselectable', 'on')
                        .css({
                            '-moz-user-select': 'none',
                            '-o-user-select': 'none',
                            '-khtml-user-select': 'none',
                            '-webkit-user-select': 'none',
                            '-ms-user-select': 'none',
                            'user-select': 'none'
                        })
                        .each(function () {
                            $(this).attr('unselectable', 'on')
                                .bind('selectstart', function (theEvent)
                                {
                                    if (theEvent.target) {
                                        switch (theEvent.target.nodeName){
                                            case "TEXTAREA":
                                            case "INPUT":
                                                break;
                                            default:
                                                return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                });
                        });
                });
            };
        })(jQuery);

        var BlahsMovingTimer = null;
        var BlahPreviewTimeout = null;
        var ViewerUpdateTimer = null;
        var BlahList = null;
        var NextBlahList = null;
        var LargeTileWidth = 400;
        var MediumTileWidth = 200;
        var SmallTileWidth = 100;
        var LargeTileHeight = 400;
        var MediumTileHeight = 200;
        var SmallTileHeight = 100;
        var ActiveBlahList = [];
        var TopRow = null;
        var BottomRow = null;
        var RowsOnScreen = 10;
        var BlahFullItem = null;
        var CurrentBlah = null;
        var CurrentBlahId = null;
        var CurrentComments = null;
        var CurrentChannel = null;
        var CurrentUser = null;
        var ChannelList = [];
        var BlahTypeList = null;
        var IsUserLoggedIn = false;
        var ChannelDropMenu = null;
        var ProfileSchema = null;
        var UserProfile = null;
        var CurrentBlahNickname = "";
        var BlahReturnPage = "";
        var numStatsDaysToShow = 7;
        var BlahOpenPage = "Overview";
        var CurrentScrollSpeed = K.BlahRollPixelStep;
        var resizeTimer = null;
        var SpinElement = null;
        var SpinTarget = null;
        var SessionTimer = null;
        var TimeoutFunction = null;
        var ReturnCommentID = null;
        var ReturnBlahId = null;
        var numMinutes = 60;

        /*
         Global functions
         Here are the functions we need overall to get things running

         */

        var GetSafeProperty = function(obj, prop, defVal) {
            if(obj && obj.hasOwnProperty(prop)) {
                return obj[prop];
            } else {
                return defVal;
            }
        };

        /**
         * @return {string}
         */
        var ElapsedTimeString = function(theDate) {
            var now = new Date();
            var timeSpan;
            var tailStr;

            if (theDate > now) {
                timeSpan = Math.floor((theDate - now) / 1000);
                tailStr = " from now";
            } else {
                timeSpan = Math.floor((now - theDate) / 1000);
                tailStr = " ago";
            }

            var curYears = Math.floor(timeSpan / 31536000);
            if (curYears > 0) {
                if (curYears > 2) {
                    return curYears + " years" + tailStr;
                } else {
                    return Math.floor(timeSpan / 2592000) + " months" + tailStr;
                }
            }

            var curMonths = Math.floor(timeSpan / 2592000); // average 30 days
            if (curMonths > 0) {
                if (curMonths >= 2) {
                    return curMonths + " months" + tailStr;
                } else {
                    return Math.floor(timeSpan / 604800) + " weeks" + tailStr;
                }
            }

            var curDays = Math.floor(timeSpan / 86400);
            if (curDays > 0) {
                if (curDays >= 2) {
                    return curDays + " days" + tailStr;
                } else {
                    return Math.floor(timeSpan / 3600) + " hours" + tailStr;
                }
            }

            var curHours = Math.floor(timeSpan / 3600);
            if (curHours > 0) {
                if (curHours >= 2) {
                    return curHours + " hours" + tailStr;
                } else {
                    return Math.floor(timeSpan / 60) + " minutes" + tailStr;
                }
            }

            var curMinutes = Math.floor(timeSpan / 60);
            if (curMinutes >= 2) {
                return curMinutes + " minutes" + tailStr;
            }

            if (timeSpan <= 1) {
                return "just now";
            } else {
                return timeSpan + " seconds" + tailStr;
            }
        };

        var createDateString = function(theDate, omitDay) {
            var newString = "";
            var year = (theDate.getFullYear() - 2000).toString();
            var month = theDate.getMonth() + 1;
            if (month < 10)
                month = "0" + month.toString();
            else
                month = month.toString();
            if (omitDay == true) {
                newString = year + month;
            } else {
                var day = theDate.getDate();
                if (day < 10)
                    day = "0" + day.toString();
                else
                    day = day.toString();
                newString = year + month + day;
            }
            return newString;
        };

        /**
         * @return {string}
         */
        var GetItemImage = function(theItem, size) {
            var imagePathName = "";
            if (theItem.hasOwnProperty("M")) {
                // fetch the correct image size
                var imageName = theItem.M[0];
                imagePathName = BlahguaConfig.imageURL + imageName + "-" + size + ".jpg";
            }

            return imagePathName;
        };

        var GetUserImage = function(theItem, size) {
            var imagePathName = GetItemImage(theItem, size);
            if (imagePathName == "")
                imagePathName = BlahguaConfig.fragmentURL + "images/unknown-user.png";

            return imagePathName;

        };

        var GetCommentUserImage = function(theItem, size) {
            var imagePathName = "";
            if (theItem.hasOwnProperty("_m")) {
                // fetch the correct image size
                var imageName = theItem._m[0];
                imagePathName = BlahguaConfig.imageURL + imageName + "-" + size + ".jpg";
            }
            if (imagePathName == "")
                imagePathName = BlahguaConfig.fragmentURL + "images/unknown-user.png";

            return imagePathName;

        };

        var GetGenericUserImage = function() {
            var imagePathName = BlahguaConfig.fragmentURL + "images/unknown-user.png";

            return imagePathName;

        };

        var StartSessionTimer = function(timeoutCallback) {

            TimeoutFunction = timeoutCallback;
            if (SessionTimer)
                clearTimeout(SessionTimer);
            SessionTimer = setTimeout(TimeoutFunction, numMinutes * 60 * 1000);
        };

        var RefreshSessionTimer = function() {
            if (SessionTimer)
                clearTimeout(SessionTimer);
            if (TimeoutFunction)
                SessionTimer = setTimeout(TimeoutFunction, numMinutes * 60 * 1000);
        };

        var ClearSessionTimer = function() {
            if (SessionTimer)
                clearTimeout(SessionTimer);
            SessionTimer = null;
            TimeoutFunction = null;
        };



        var CodifyText = function(theText) {
            if (theText) {
                var regX = /\r\n|\r|\n/g;
                var replaceString = K.NewlineToken;
                return theText.replace(regX, replaceString);
            } else
                return "";

        };

        var UnCodifyText = function(theText) {
            if (theText) {
                var regX = new RegExp("\\" + K.NewlineToken,"g");
                var replaceString = "<br />";
                return theText.replace(regX, replaceString);
            } else
                return "";

        };


        /*
        // Code to handle URL detection in text

        var URLRegEx = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

        var GetURLsFromString = function(theText) {
            return theText.match(URLRegEx);
        };

        var URLifyText = function(theText) {
            theText = theText.replace(/&quot;/gi, "\"");
            return theText.replace(URLRegEx, '<a href="$1" target="_blank">$1</a>');
        };

        var FakeURLifyText = function(theText) {
            theText = theText.replace(/&quot;/gi, "\"");
            return theText.replace(URLRegEx, '<span style="color:blue; text-decoration:underline">$1</span>');
        };
         */

        var dynamicSort = function(property, subProp) {
            return function (a, b) {
                var aProp = 0;
                var bProp = 0;

                if (a.hasOwnProperty(property))
                    aProp = a[property];

                if (b.hasOwnProperty(property))
                    bProp = b[property];

                if ((aProp == bProp) && (subProp != null)) {
                    var asProp = 0;
                    var bsProp = 0;

                    if (a.hasOwnProperty(subProp))
                        asProp = a[subProp];

                    if (b.hasOwnProperty(subProp))
                        bsProp = b[subProp];

                    return (asProp < bsProp) ? -1 : (asProp > bsProp) ? 1 : 0;
                }
                else {
                    return (aProp < bProp) ? -1 : (aProp > bProp) ? 1 : 0;
                }
            }
        };

        var cryptify = function(key, value) {
            var result="";
            for(var i=0;i<value.length;++i)
            {
                result+=String.fromCharCode(key.charCodeAt(i % key.length)^value.charCodeAt(i));
            }
            return result;
        };

        var ClearPrompt = function() {
            $('.click-shield').remove();
        };

        var PromptUser = function(promptString, yesString, noString, yesCallback, noCallback) {
            var newHTML = "";
            newHTML += "<div class='click-shield'>" +
            "<div class='dialog-box'  style='display: none'>" +
                "<table>" +
                "<tr><td class='dialog-prompt-container'><span class='dialog-prompt'></span></td></tr>"  +
                "<tr><td class='dialog-btn-container'><button class='dialog-button dialog-no'></button><button class='dialog-button dialog-yes'></button></td></tr>"  +
                "</table>" +
            "</div>"  +
            "</div>";

            $(document.body).append(newHTML);
            $(".dialog-prompt").html(promptString);
            if ((!noString) || (noString == "")) {
                $(".dialog-no").hide();
            } else {
                $(".dialog-no").text(noString).click(function(theEvent) {
                    $(".dialog-box").hide();
                    if (noCallback)
                        noCallback();
                    $('.click-shield').remove();
                });
            }

            $(".dialog-yes").text(yesString).click(function(theEvent) {
                $(".dialog-box").hide();
                if (yesCallback)
                    yesCallback();
                $('.click-shield').remove();
            });
            $(".dialog-box").show();

        };


        var ValidateForm = function($theForm) {
            var errMsg = "";
            $theForm.find("input[data-validate]").each(function(index, item) {
                var theErr =  ValidateField($(item));
                if (theErr != "") {
                    errMsg += theErr + ".  ";
                }
            });
            return errMsg;
        }


        var ValidateField = function($item) {
            // clear any existing validation
            $item.parent().siblings(".validation-col").find(".validation-error").remove();
            var val, compVal, isValid, errMsg = "";
            var fieldName = $item.attr("data-fieldname");
            if (fieldName === undefined || fieldName == "")
                fieldName = "Value";
            var initialVal = $item.attr("initial-value");
            isValid = true;
            val = $item.val();
            if ((initialVal === undefined) || (initialVal != val)) {
                try {
                    // max
                    if (compVal = $item.attr("data-validate-max")) {
                        if (Number(val) > Number(compVal)) {
                            isValid = false;
                            errMsg = fieldName + " must be no more than " + compVal;
                        }
                    }
                    // min
                    if (compVal = $item.attr("data-validate-min")) {
                        if (Number(val) < Number(compVal)) {
                            isValid = false;
                            errMsg = fieldName + " must be no less than " + compVal;
                        }
                    }
                    // minLength
                    if (compVal = $item.attr("data-validate-minlen")) {
                        if (String(val).length < Number(compVal)) {
                            isValid = false;
                            errMsg = fieldName + " must be at least " + compVal + " characters";
                        }
                    }
                    // maxLength
                    if (compVal = $item.attr("data-validate-maxlen")) {
                        if (String(val).length > Number(compVal)) {
                            isValid = false;
                            errMsg = fieldName + " must be no more than " + compVal + " characters";
                        }
                    }
                    // notEmpty
                    if ($item.is("[data-validate-notempty]")) {
                        if (String(val).length == 0) {
                            isValid = false;
                            errMsg = fieldName + " cannot be blank";
                        }
                    }
                    // exactLength
                    if (compVal = $item.attr("data-validate-len")) {
                        if (String(val).length != Number(compVal)) {
                            isValid = false;
                            errMsg = fieldName + " must be exactly " + compVal + " characters";
                        }
                    }
                    // alphanumeric
                    if ($item.is("[data-validate-alphanum]") && (val.length > 0)) {
                        var characterReg = /^\s*[a-z0-9A-Z\s]+\s*$/;
                        if(!characterReg.test(val)){
                            isValid = false;
                            errMsg = fieldName + " must be no more than " + compVal + " characters";
                        }
                    }
                    // numeric
                    if ($item.is("[data-validate-number]") && (val.length > 0)) {
                        var characterReg = /^\s*[0-9\s]+\s*$/;
                        if(!characterReg.test(val)) {
                            isValid = false;
                            errMsg = fieldName + " must contain only numbers";
                        }
                    }
                    // alphabetic
                    if ($item.is('[data-validate-abc]') && (val.length > 0)) {
                        var characterReg = /^\s*[a-zA-Z\s]+\s*$/;
                        if(!characterReg.test(val)) {
                            isValid = false;
                            errMsg = fieldName + " must contain only alphabetic characters";
                        }
                    }
                    // printable
                    if ($item.is("[data-validate-printable]") && (val.length > 0)) {
                        var characterReg = /^\s*[a-z0-9A-Z.,'\s]+\s*$/;
                        if(!characterReg.test(val)){
                            isValid = false;
                            errMsg = fieldName + " contains invalid characters";
                        }
                    }
                    // email
                    if ($item.is("[data-validate-email]") && (val.length > 0)) {
                        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
                        if(!pattern.test(val)){
                            isValid = false;
                            errMsg = fieldName + " must be a valid email address";
                        }
                    }
                    // match
                    if ($item.is("[data-validate-match]")) {
                        var otherVal = $("#" + $item.attr("data-validate-match")).val();
                        if (val != otherVal){
                            isValid = false;
                            errMsg = $item.attr("data-validate-match-text");
                        }
                    }

                } catch (theErr) {
                    isValid = false;
                    errMsg = "Parsing error";
                }

                // ADD ERROR
                if (!isValid) {
                    $item.removeClass("success").addClass("error").parent().siblings(".validation-col").append("<i class='validation-error icon-warning-sign' title='" + errMsg + "'></i>");
                } else {
                    $item.parent("div").removeClass("error").addClass("success");
                }
            }

            return errMsg;
        };

        var DataZeroOrEmpty = function(theArray) {
            if (theArray == null)
                return true;
            else if (theArray.length == 0) {
                return true;
            } else {
                var isZero = true;
                for (var curIndex in theArray) {
                    if (theArray[curIndex] != 0) {
                        isZero = false;
                        break;
                    }
                }
                return isZero;
            }
        };

        var AppendChartMask = function(theTarget, theText) {
            var maskObj = "<div class='chart-mask'><div>" +
                theText + "</div></div>";
            $(theTarget).append(maskObj);
        };

        var AppendText = function(curText, appendText, appendStr) {
            if (appendText != "") {
                if (curText == "") {
                    curText = appendText;
                } else {
                    curText += appendStr;
                    curText += appendText;
                }
            }

            return curText;
        };



        return {
            Initialize :   Initialize,
            DataZeroOrEmpty: DataZeroOrEmpty,
            AppendText: AppendText,
            AppendChartMask: AppendChartMask,
            BlahsMovingTimer: BlahsMovingTimer,
            BlahPreviewTimeout: BlahPreviewTimeout,
            ViewerUpdateTimer: ViewerUpdateTimer,
            BlahList: BlahList,
            NextBlahList: NextBlahList,
            LargeTileWidth: LargeTileWidth,
            MediumTileWidth: MediumTileWidth,
            SmallTileWidth: SmallTileWidth,
            LargeTileHeight: LargeTileHeight,
            MediumTileHeight:MediumTileHeight,
            SmallTileHeight: SmallTileHeight,
            ActiveBlahList: ActiveBlahList,
            TopRow: TopRow,
            BottomRow: BottomRow,
            RowsOnScreen:RowsOnScreen,
            BlahFullItem:BlahFullItem,
            CurrentBlah: CurrentBlah,
            CurrentBlahId: CurrentBlahId,
            CurrentComments: CurrentComments,
            CurrentChannel: CurrentChannel,
            CurrentUser: CurrentUser,
            ChannelList: ChannelDropMenu,
            BlahTypeList: BlahTypeList,
            IsUserLoggedIn: IsUserLoggedIn,
            ChannelDropMenu: ChannelDropMenu,
            ProfileSchema: ProfileSchema,
            UserProfile: UserProfile,
            CurrentBlahNickname: CurrentBlahNickname,
            BlahReturnPage: BlahReturnPage,
            NumStatsDaysToShow: numStatsDaysToShow,
            BlahOpenPage: BlahOpenPage,
            CurrentScrollSpeed: CurrentScrollSpeed,
            ResizeTimer: resizeTimer,
            SpinElement: SpinElement,
            SpinTarget: SpinTarget,
            GetSafeProperty: GetSafeProperty,
            ElapsedTimeString: ElapsedTimeString,
            CreateDateString: createDateString,
            GetItemImage: GetItemImage,
            GetUserImage: GetUserImage,
            GetGenericUserImage: GetGenericUserImage,
            CodifyText: CodifyText,
            UnCodifyText: UnCodifyText,
            //GetURLsFromString: GetURLsFromString,
            //URLifyText: URLifyText,
            //FakeURLifyText: FakeURLifyText,
            DynamicSort: dynamicSort,
            GetCommentUserImage: GetCommentUserImage,
            PromptUser:  PromptUser,
            StartSessionTimer: StartSessionTimer,
            RefreshSessionTimer: RefreshSessionTimer,
            ClearSessionTimer: ClearSessionTimer,
            ClearPrompt: ClearPrompt,
            ValidateForm: ValidateForm,
            ValidateField: ValidateField,
            ReturnCommentId: ReturnCommentID,
            ReturnBlahId: ReturnBlahId,
            Cryptify: cryptify
        }

    }
);
