/**
 * Created by skyxu on 2018/3/13.
 */

"use strict";

let Facebook = require('./Facebook');

let FacebookMgr = cc.Class({

    ctor: function () {

        /**
         * @type {Facebook}
         */
        this.facebook = new Facebook();

        /**
         * @type {array}
         */
        this.inviteFriends = [];

        /**
         * @type {array}
         */
        this.installFriends = [];

        /**
         * @type {boolean}
         */
        this._initSuccess = false;

        /**
         * @type {function} 邀请回调
         */
        this._onInviteFriendsCallback = null;
        /**
         * @type {function}
         */
        this._loginCallback = null;
        /**
         * @type {function}
         */
        this._loginFailCallback = null;

        /**
         *
         * @type {function}
         * @private
         */
        this._requestPicCallback = null;

        this._requestNameCallback = null;

        /**
         * 权限数组
         * @type {Array}
         */
        this._permissions = [];
    },

    statics: {
        instance: null,
        getInstance: function () {
            if (FacebookMgr.instance == null){
                FacebookMgr.instance = new FacebookMgr();
            }
            return FacebookMgr.instance;
        }
    },

    /**
     * @param {string} facebookId
     */
    initFacebook: function (facebookId, permissions) {
        this._initSuccess = this.facebook.init(this, facebookId);
        this._permissions = permissions;
    },

    /**
     * @param {string} facebookId
     */
    loginFacebook: function (facebookId, permissions, successCallback, failCallback) {
        if(!this._initSuccess){
            this.initFacebook(facebookId, permissions);
            if(!this._initSuccess){
                if(failCallback) failCallback();
                return;
            }
        }

        this._permissions = permissions;
        this._loginCallback = successCallback;
        this._loginFailCallback = failCallback;

        if(!this.facebook.isLoggedIn()){
            cc.log("FacebookMgr: to login");
            this.facebook.login(this._permissions);
        }else{
            cc.log("FacebookMgr: to requestInvitableFriends");
            this.facebook.requestInvitableFriends();
            if(successCallback) successCallback();
        }
    },

    /**
     * 登出
     */
    logout: function () {
        if(this.isLogin()){
            this.facebook.logout();
        }
    },

    /**
     * @return {string}
     */
    getAccessToken: function () {
        return this.facebook.getAccessToken();
    },

    /**
     * @returns {*|string}
     */
    getUserID: function () {
        return this.facebook.getUserID();
    },

    /**
     * 邀请好友
     * @param {Array} arr
     * @param {string} title
     * @param {string} text
     * @param {function} callback
     */
    inviteFriendsWithInviteIds: function (arr, title, text, callback) {
        if(cc.sys.isMobile){
            this._onInviteFriendsCallback = callback;
            this.facebook.inviteFriendsWithInviteIds(arr, title, text);
        }else{
            callback(true, null);
        }
    },

    /**
     * 获取要请请求
     */
    getInviteRequest: function () {
        let params = new Object();
        //params.fields = "from";
        this.facebook.api("/me/apprequests", "GET", params, "apprequests");
    },

    /**
     * 获取邀请安装好友 onRequestInvitableFriends回调
     */
    requestInvitableFriends: function () {
        let params = new Object();
        this.facebook.api("/me/app_requests", "GET", params, "invitable_friends");
    },

    /**
     * 获取头像信息
     * @param callback{function}
     */
    requestUserPicture: function (callback) {
        this._requestPicCallback = callback;
        this.facebook.requestUserPicture();
    },

    /**
     * 获取用户名字
     * @param callback
     */
    requestUserName: function (callback) {
        this._requestNameCallback = callback;
        this.facebook.requestUserName();
    },

    fetchFriends: function () {
        if(this.isLogin()){
            this.facebook.fetchFriends();
        }
    },

    /**
     * share
     * @param {string} link
     * @param {string} title
     * @param {string} text
     * @param {string} image
     */
    shareLink: function (link, title, text, image, callback) {
        if(this.isLogin()) {
            this._shareCallback = callback;
            this.facebook.dialogLink(link, title, text, image);
        }
    },

    /*********************
     * check
     *********************/

    /**
     * @returns {boolean}
     */
    isLogin: function () {
        return this._initSuccess && this.facebook.isLoggedIn();
    },

    /*********************
     * Facebook callbacks
     *********************/

    onLogin: function(isLogin, msg) {
        cc.log("onLogin");
        if(!isLogin){
            cc.log("FacebookMgr: Facebook login fail  msg: " + msg);
            if(this._loginFailCallback) this._loginFailCallback();
            return;
        }
        cc.log("FacebookMgr: Facebook had login");
        this.facebook.requestInvitableFriends();
        if(this._loginCallback) this._loginCallback();
    },

    onGetUserInfo: function (userInfo) {
        cc.log("onGetUserInfo: " + JSON.stringify(userInfo));
    },

    onInviteFriendsWithInviteIdsResult: function(result, msg){
        cc.log("FacebookMgr: onInviteFriendsWithInviteIdsResult " + result + "  " + msg);
        if(this._onInviteFriendsCallback){
            let callback = this._onInviteFriendsCallback;
            this._onInviteFriendsCallback = null;
            callback(result, msg);
        }
    },

    onFetchFriends: function(ok, msg) {
        cc.log("FacebookMgr: onFetchFriends " + ok);
        this.installFriends = this.facebook.getInstallFriends();
        cc.log(JSON.stringify(this.installFriends));
        for (let i = 0; i < this.installFriends.length; i++) {
            let friend = this.installFriends[i];
            cc.log("-----------");
            cc.log(">> uid=%s", friend.uid);
            cc.log(">> name=%s", friend.name);
        }
    },

    /**
     * @param {Object} friends
     */
    onRequestInvitableFriends: function(friends) {
        cc.log("FacebookMgr: onRequestInvitableFriends " + friends);
        this.inviteFriends = friends.data;
        /*
         for (let i = 0; i < this.inviteFriends.length; i++) {
         let friend = this.inviteFriends[i];
         cc.log("-----------");
         cc.log(">> id=%s", friend.id);
         }
         */
    },

    onPermission: function(isLogin, msg) {
        cc.log("onPermission: " + isLogin + "   msg: " + msg);
    },

    onSharedSuccess: function(data) {
        cc.log("onSharedSuccess");
        if(this._shareCallback){
            this._shareCallback();
            this._shareCallback = null;
        }
    },

    onSharedFailed: function(data) {
        cc.log("onSharedFailed == " + JSON.stringify(data));
        if(this._shareCallback){
            this._shareCallback = null;
        }
    },

    onSharedCancel: function() {
        cc.log("onSharedCancel");
        if(this._shareCallback){
            this._shareCallback = null;
        }
    },

    /**
     * @param {String} tag
     * @param {String} data
     */
    onAPI: function(tag, data) {
        cc.log("onAPI: " + typeof data + " | " + data);
        switch (tag){
            case "invitable_friends":
            {
                //cc.log("invitable_friends : " + data);
                // this.inviteFriends = JSON.parse(data).data;
                break;
            }
            case "request_picture":
            {
                if (this._requestPicCallback){
                    cc.log("onAPI request_picture: " + data);
                    this._requestPicCallback(JSON.parse(data).data);
                }
                break;
            }
            case "request_name":{
                cc.log("onAPI request_name: " + data);
                if (this._requestNameCallback){
                    this._requestNameCallback(JSON.parse(data));
                }
            }
        }
    },

});

module.exports = FacebookMgr;