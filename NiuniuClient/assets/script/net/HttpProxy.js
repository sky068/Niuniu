/**
 * Created by skyxu on 2018/7/13.
 */

"use strict";

let GameHttp = require("./GameHttp");
let DataMgr = require("./../common/DataMgr");
let FacebookMgr = require("./../common/FacebookMgr");
let UtilsCross = require("./../common/UtilsCross");
let Md5 = require("./../common/encrypt/Md5").md5_hex_hmac;

// let urlroot = "http://localhost:3000";
let urlroot = "http://52.44.165.172:3000";

let encryptKey = "tclsafegame";

cc.Class({
    ctor(){

    },

    /**
     *
     * @param onSuc
     * @param onFailed
     */
    login(onSuc, onFailed){
        let uid = UtilsCross.getUID();
        cc.log("uid=" + uid);
        if (!uid && onFailed){
            onFailed();
            return;
        }

        let pObj = DataMgr.getInstance().playerObj;
        let url = urlroot + "/login";
        let data = {uid: uid};
        this.serverRequest(url, data, onSuc, onFailed);
    },

    /**
     *
     * @param onSuc
     * @param onFailed
     */
    bindFb(onSuc, onFailed){
        let uid = UtilsCross.getUID();
        cc.log("uid=" + uid);
        if (!uid && onFailed){
            onFailed();
            return;
        }

        let pObj = DataMgr.getInstance().playerObj;
        let url = urlroot + "/bind_fb";
        let data = {sid: pObj.sid, fbid: pObj.fbid, uid: uid};
        this.serverRequest(url, data, onSuc, onFailed);
    },

    /**
     *
     * @param onSuc
     * @param onFailed
     */
    updateIcon(onSuc, onFailed){
        let pObj = DataMgr.getInstance().playerObj;
        let url = urlroot + "/update_icon";
        let data = {fbid: pObj.fbid, fbicon: pObj.fbicon};
        this.serverRequest(url, data, onSuc, onFailed);
    },

    /**
     *
     * @param onSuc
     * @param onFailed
     */
    updateName(onSuc, onFailed){
        let pObj = DataMgr.getInstance().playerObj;
        let url = urlroot + "/update_name";
        let data = {fbid: pObj.fbid, fbname: pObj.fbname};
        this.serverRequest(url, data, onSuc, onFailed);
    },

    /**
     *
     * @param onSuc
     * @param onFailed
     */
    uploadScore(onSuc, onFailed){
        let pObj = DataMgr.getInstance().playerObj;
        let url = urlroot + "/upload_score";
        let data = {sid: pObj.sid, score: pObj.bestScore};
        this.serverRequest(url, data, onSuc, onFailed);
    },

    /**
     *
     * @param onSuc
     * @param onFailed
     */
    getRankList(onSuc, onFailed){
        let pObj = DataMgr.getInstance().playerObj;
        let url = urlroot + "/get_rank";
        let data = {sid: pObj.sid};
        this.serverRequest(url, data, onSuc, onFailed);
    },

    /**
     *
     * @param onSuc
     * @param onFailed
     */
    getFriendsRankList(onSuc, onFailed){
        let pObj = DataMgr.getInstance().playerObj;
        let url = urlroot + "/get_rank_friends";
        let friends = FacebookMgr.getInstance().installFriends;

        if (pObj.fbid <= 0){
            if (onFailed){
                onFailed("Haven't any friend.");
                return;
            }
        }

        cc.log(typeof friends + " | " + friends);
        cc.log("friends + " + JSON.stringify(friends));
        let friendsSend = [];
        for (let f of friends){
            friendsSend.push(parseInt(f.uid));
        }
        cc.log(typeof friendsSend + " | " + friendsSend);
        cc.log(JSON.stringify(friendsSend));

        let data = {fbid: pObj.fbid, friends: friendsSend};
        cc.log("get friend rank: " + JSON.stringify(data));

        this.serverRequest(url, data, onSuc, onFailed);
    },

    /**
     *
     * @param url
     * @param data
     * @param onSuc
     * @param onFailed
     */
    serverRequest(url, data, onSuc, onFailed){
        cc.log("serverRequest: " + typeof data + " | " + JSON.stringify(data));
        data = typeof data === "string" ? data : JSON.stringify(data);
        // 加密校验传输
        let encryptStr = Md5(encryptKey, data);
        let newData = {
            data: JSON.parse(data),
            encrypt: encryptStr,
            version: UtilsCross.getAppVersion() || "2.0.0"
        };
        newData = JSON.stringify(newData);

        GameHttp.httpPost(url, newData, (req)=>{
            if (req.isOk()){
                cc.log("requrest: " + url + " 成功。");
                if (onSuc){
                    onSuc(req.getBody());
                }
            } else {
                cc.log("requrest: " + url + " 失败。");
                if (onFailed){
                    onFailed(req.getError() || req.getBody());
                }
            }
        });
    }
});
