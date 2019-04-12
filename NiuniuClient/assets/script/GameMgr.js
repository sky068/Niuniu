/**
 * Created by skyxu on 2019/3/28.
 */

"use strict";

let Toast = require("./views/ToastCtrl");
let dataMgr = require("./common/DataMgr").getInstance();

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad(){
        Global.gameMgr = this;
    },

    start(){
        this.listenEvent();
    },

    listenEvent(){
        Global.eventMgr.on(Global.config.EVENT_NETWORK_OPENED, this.onNetOpen, this);
        Global.eventMgr.on(Global.config.EVENT_NETWORK_CLOSED, this.onNetClosed, this);
        Global.eventMgr.on(Global.config.EVENT_LOGIN_SUC, this.onLoginSuc, this);
        Global.eventMgr.on(Global.config.EVENT_LOGIN_FAILED, this.onLoginFailed, this);
    },

    onNetOpen(event){
        cc.log("net opened.");
        this.startBeatHeart();
        Global.netProxy.login(0);
    },

    onNetClosed(event){
        cc.log("net closed. 5s 后重试连接.");
        Toast.showText("网络连接失败，正在重试.", 2);
        this.scheduleOnce((dt)=>{
            if (!Global.netProxy.isNetworkOpened()){
                Global.netProxy.connect();
            }
        }, 5);

    },

    onLoginSuc(event){
        let resp = event.detail;
        cc.log("登陆成功.");

        if (resp.uid > 0){
            dataMgr.playerObj.parse(resp);
            dataMgr.saveDataToLocal();
        }
    },

    onLoginFailed(event){
        cc.log("登陆失败. 5s后重试.");
        this.scheduleOnce((dt)=>{
            Global.netProxy.login(0);
        }, 5)
    },

    startBeatHeart(){
        this.schedule((dt)=>{
            if (!this.checkInternet()) return;
            let t = Date.now();
            Global.netProxy.beatHeart((resp)=>{
                cc.log(JSON.stringify(resp));
                cc.log("delay: " + (resp.t - t));
            });
        }, 5);
    },

    checkInternet(){
        return Global.netProxy.isNetworkOpened();
    },

    onOpenRoom(resp){
        if (resp.err > 0){
            Toast.showText("开房失败.", 2);
            return;
        }
        Global.loadScene("RoomNet");
        this.scheduleOnce(()=>{
            Global.eventMgr.emit(Global.config.EVENT_OPEN_ROOM, resp);
        }, 0.1);
    },

    onEnterRoom(resp){
        if (resp.err > 0){
            Toast.showText("加入失败，请检查房间号.", 2);
            return;
        }
        Global.loadScene("RoomNet");
        this.scheduleOnce(()=>{
            Global.eventMgr.emit(Global.config.EVENT_ENTER_ROOM, resp);
        }, 0.1);
    }
});
