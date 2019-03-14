/**
 * Created by skyxu on 2018/3/13.
 */

"use strict";

//sdk 配置说明 http://docs.sdkbox.com/zh/plugins/facebook/v3-js/

/**
 * info.plist 添加
 * <key>FacebookAppID</key>
 <array>
 <string>2312312312</string>
 </array>

 <key>LSApplicationQueriesSchemes</key>
 <array>
 <string>fbauth2</string>
 </array>

 <key>URL types</key>
 <array>
 <dictionary>
 <array>URL Schemes
 <string>fb2312312312</string>
 </array>
 </dictionary>
 </array>
 */

let Facebook = cc.Class({

    /**
     * @param {object} listener
     * @param {string} facebookId
     * @returns {boolean}
     */
    init: function (listener, facebookId) {
        if(typeof sdkbox === "undefined"){
            cc.log("sdkbox: undefined");
            return false;
        }

        this._facebookId = facebookId;
        sdkbox.PluginFacebook.setListener(listener);
        sdkbox.PluginFacebook.init();
        cc.log("sdkbox: init");

        return true;
    },

    isLoggedIn: function () {
        return (sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn());
    },

    login: function (arr) {
        if(sdkbox.PluginFacebook && !sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.login(arr);
        }
    },

    logout: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.logout();
        }
    },

    test: function () {
        sdkbox.PluginFacebook.requestReadPermissions(["public_profile", "email", "user_friends", "publish_actions"]);
        sdkbox.PluginFacebook.requestPublishPermissions(["publish_actions"]);
    },

    /**
     * @returns {string}
     */
    getUserID: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            return sdkbox.PluginFacebook.getUserID();
        }
        return "";
    },

    /**
     * @returns {Array}
     */
    getPermissionList: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            return sdkbox.PluginFacebook.getPermissionList();
        }
        return null;
    },

    getAccessToken: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            return sdkbox.PluginFacebook.getAccessToken();
        }
        return null;
    },

    /**
     * @param {string} link
     * @param {string} title
     * @param {string} text
     * @param {string} image
     */
    shareLink: function (link, title, text, image) {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            let info = new Object();
            info.type  = "link";
            info.link  = link;
            info.title = title;
            info.text  = text;
            info.image = image;
            sdkbox.PluginFacebook.share(info);
        }
    },

    /**
     * @param {string} link
     * @param {string} title
     * @param {string} text
     * @param {string} image
     */
    dialogLink: function (link, title, text, image) {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            let info = new Object();
            info.type  = "link";
            info.link  = link;
            info.title = title;
            info.text  = text;
            info.image = image;
            sdkbox.PluginFacebook.dialog(info);
        }
    },

    /**
     * @param {string} imageUrl
     */
    inviteFriends: function (imageUrl) {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.inviteFriends("https://fb.me/" + this._facebookId, imageUrl);
        }
    },

    /**
     * @param {Array} arr
     * @param {string} title
     * @param {string} text
     */
    inviteFriendsWithInviteIds: function (arr, title, text) {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.inviteFriendsWithInviteIds(arr, title, text);
        }
    },

    /**
     * 获取安装游戏的好友，数据在Listener onFetchFriends方法返回
     */
    fetchFriends: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.fetchFriends();
        }
    },

    /**
     * 获取邀请安装好友，数据在Listener onRequestInvitableFriends方法返回
     */
    requestInvitableFriends: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            let params = new Object();
            params.fields = "id,name";
            params.limit = 100;
            //sdkbox.PluginFacebook.requestInvitableFriends(params);
            sdkbox.PluginFacebook.api("/me/invitable_friends", "GET", params, "invitable_friends");
        }
    },

    /**
     * 获取头像
     */
    requestUserPicture: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            let params = new Object();
            params.redirect = "false";
            params.type = "large";
            // cache_key 可以用作缓存图片使用，头像改变时会变化
            sdkbox.PluginFacebook.api("/me/picture?fields=cache_key,url", "GET", params, "request_picture");
        }
    },

    /**
     *  获取name
     */
    requestUserName: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            let params = new Object();
            params.fields = "name";
            sdkbox.PluginFacebook.api("/me", "GET", params, "request_name");
        }
    },

    /**
     * @param {string} path
     * @param {string} method
     * @param {object} params
     * @param {string} tag
     * 数据在Listener onAPI
     */
    api: function (path, method, params, tag) {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.api(path, tag, params, tag);
        }
    },

    /**
     * @returns {Array}
     */
    getInstallFriends: function () {
        return sdkbox.PluginFacebook.getFriends();
    },

    requestReadPermissions: function (arr) {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.requestReadPermissions(arr);
        }
    },

    requestPublishPermissions: function () {
        if(sdkbox.PluginFacebook && sdkbox.PluginFacebook.isLoggedIn()){
            sdkbox.PluginFacebook.requestPublishPermissions(arr);
        }
    }
});

module.exports = Facebook;