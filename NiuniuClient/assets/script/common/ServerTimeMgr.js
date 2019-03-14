/**
 * Created by edisonjiang on 2018/4/23.
 */

"use strict";

// 可容忍的服务器时间戳和设备本地时间戳的偏差值(单位秒)
const ALLOWED_TIMESTAMP_OFFSET = 600;

let ServerTimeMgr = cc.Class({
    properties: {
        delayForOfflineReward: 0,

        _timeStampOffset: Number.MAX_VALUE, // 服务器时间戳和设备本地时间戳的偏移量(单位秒)
        timeStampOffset: {
            get () {
                return this._timeStampOffset;
            },
            set (value) {
                this._timeStampOffset = value;
                cc.log("this._timeStampOffset = " + this._timeStampOffset);

                // // 增加用于给予用户奖励的离线时间
                // Global.gameMgr.addOfflineTimeForReward();
                if (this.isDeviceTimeValid() || Global.config.DEBUG_MODE) {
                    // 检查订阅的每日奖励
                    Global.gameMgr.checkForSubsReward();
                    // 检测是否给予离线奖励
                    Global.gameMgr.selOfflineRewardForAdVideo(false, this.delayForOfflineReward);
                    // 显示每日奖励
                    Global.viewMgr.showDailyRewardView();
                }
            }
        }
    },

    ctor(){
    },

    statics: {
        instance: null,
        getInstance: function () {
            if (ServerTimeMgr.instance == null) {
                ServerTimeMgr.instance = new ServerTimeMgr();
            }
            return ServerTimeMgr.instance;
        }
    },

    /**
     * 读取服务器时间
     */
    loadServerTime () {
        if (cc.sys.platform == cc.sys.ANDROID){
            let UtilsCross = require('UtilsCross');
            UtilsCross.loadServerTime();

            return;
        }

        var xhr = cc.loader.getXMLHttpRequest();
        this.onStreamXHREvents(xhr, 'GET');

        xhr.open("GET", "https://sec.tclclouds.com/game180412/stamp/q", true);
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 10000; // 10 seconds for timeout
        xhr.send();
    },

    onStreamXHREvents (xhr, method, responseHandler ) {
        // var handler = responseHandler || function (response) {
        //     return method + " Response (30 chars): " + response.substring(0, 30) + "...";
        // };

        // Simple events
        ['loadstart', 'abort', 'error', 'load', 'loadend', 'timeout'].forEach((eventname) => {
            xhr["on" + eventname] = () => {
                if (eventname === 'timeout') {
                    cc.log('(timeout)');

                    this.timeStampOffset = Number.MAX_VALUE;
                }
            };
        });

        // Special event
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                // cc.log(handler(xhr.responseText));

                try {
                    let serverTimeStamp = JSON.parse(xhr.responseText)['Stamp'];
                    let nowTimeStamp = new Date().getTime() / 1000;
                    this.timeStampOffset = Math.abs(nowTimeStamp - serverTimeStamp);
                    cc.log("load time Succ nowTimeStamp= " + nowTimeStamp);
                }
                catch (e) {
                    cc.log("load time Failed  ");
                    cc.error("on loadServerTime: " + e.message);
                    this.timeStampOffset = Number.MAX_VALUE;
                }
            }else{
                cc.log("load time xhr.readyState = " + xhr.readyState + " xhr.status = " + xhr.status);
            }
        };
    },

    /**
     * 获得设备时间是否合法
     * @returns {boolean}
     */
    isDeviceTimeValid () {
        if (Global.dataMgr.playerObj.isControlTime) {
            return (this.timeStampOffset < ALLOWED_TIMESTAMP_OFFSET);
        } else {
            return true;
        }
    },

    /**
     * 设置服务器返回的时间戳
     * @param {Number} timeStamp
     */
    setServerTimeStamp (timeStamp) {
        let nowTimeStamp = new Date().getTime() / 1000;
        this.timeStampOffset = Math.abs(nowTimeStamp - timeStamp);
    }
});

window.ServerTimeMgr = ServerTimeMgr;

module.exports = ServerTimeMgr;
