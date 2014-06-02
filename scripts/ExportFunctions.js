/**
 * Created with IntelliJ IDEA.
 * User: davev_000
 * Date: 5/10/13
 * Time: 10:51 AM
 * To change this template use File | Settings | File Templates.
 */

define('ExportFunctions',
    [],
    function () {

        var ClosePage = null;
        var RefreshPageForNewUser = null;
        var OpenBlah = null;
        var SuggestUserSignIn = null;
        var OnFailure = null;
        var GetBlahTypeStr = null;
        var UnfocusBlah = null;
        var GetChannelNameFromID = null;
        var CloseBlah = null;
        var OpenLoadedBlah = null;
        var GetBlahTypeId = null;
        var GetBlahTypeNameFromId = null;
        var LogoutUser = null;
        var ForgetUser = null;
        var GetBlahTypeColorFromName = null;
        var CurrentCommentText = "";
        var SetCurrentChannelById = null;

        return {
            ForgetUser: ForgetUser,
            LogoutUser: LogoutUser,
            GetBlahTypeNameFromId: GetBlahTypeNameFromId,
            GetBlahTypeColorFromId: GetBlahTypeColorFromName,
            GetBlahTypeId: GetBlahTypeId,
            ClosePage: ClosePage,
            RefreshPageForNewUser: RefreshPageForNewUser ,
            OpenBlah: OpenBlah,
            SuggestUserSignIn: SuggestUserSignIn,
            OnFailure: OnFailure,
            UnfocusBlah: UnfocusBlah,
            GetBlahTypeStr: GetBlahTypeStr,
            CloseBlah: CloseBlah,
            GetChannelNameFromID: GetChannelNameFromID ,
            OpenLoadedBlah: OpenLoadedBlah ,
            CurrentCommentText: CurrentCommentText,
            SetCurrentChannelById: SetCurrentChannelById
        }
    }
);