/**
 * Created by skyxu on 2018/3/13.
 */

"use strict";

let DataObject = require("./DataObject");
let GCONFIG = require("./GCONFIG");

let DataMgr = cc.Class({

    ctor(){
        this.playerObj = new DataObject.PlayerObject();
        this.iapObj = new DataObject.IapObject();
        this.settingObj = new DataObject.SettingObject();
        this.guideObj = new DataObject.GuideObject();
        this.chestObj = new DataObject.ChestObject();
        this.achieveObj = new DataObject.AchieveObject();
    },

    statics: {
        instance: null,
        getInstance: function () {
            if (DataMgr.instance == null) {
                DataMgr.instance = new DataMgr();
            }
            return DataMgr.instance;
        }
    },

    /**
     * 读取本地保存的数据
     */
    loadDataFromLocal() {

        cc.log("...load local data start...");

        let tmp = cc.sys.localStorage.getItem(GCONFIG.KEY_PLAYERDATA);
        if (tmp) {
            this.playerObj.parse(JSON.parse(tmp));
        }

        tmp = cc.sys.localStorage.getItem(GCONFIG.KEY_IAPDATA);
        if (tmp) {
            this.iapObj.parse(JSON.parse(tmp));
        }

        tmp = cc.sys.localStorage.getItem(GCONFIG.KEY_SETTING);
        if (tmp) {
            this.settingObj.parse(JSON.parse(tmp));
        }

        tmp = cc.sys.localStorage.getItem(GCONFIG.KEY_GAME_GUIDE_DATA);
        if (tmp) {
            this.guideObj.parse(JSON.parse(tmp));
        }

        tmp = cc.sys.localStorage.getItem(GCONFIG.KEY_CHEST_DATA);
        if (tmp){
            this.chestObj.parse(JSON.parse(tmp));
        }

        tmp = cc.sys.localStorage.getItem(GCONFIG.KEY_ACHIEVE_DATA);
        if (tmp){
            this.achieveObj.parse(JSON.parse(tmp));
        }

        cc.log("...load local data finished...");

    },

    /**
     * 保存数据到本地
     */
    saveDataToLocal() {

        cc.log("...save data to local start...");

        cc.sys.localStorage.setItem(GCONFIG.KEY_PLAYERDATA, this.playerObj.toString());
        cc.sys.localStorage.setItem(GCONFIG.KEY_IAPDATA, this.iapObj.toString());
        cc.sys.localStorage.setItem(GCONFIG.KEY_SETTING, this.settingObj.toString());
        cc.sys.localStorage.setItem(GCONFIG.KEY_GAME_GUIDE_DATA, this.guideObj.toString());
        cc.sys.localStorage.setItem(GCONFIG.KEY_CHEST_DATA, this.chestObj.toString());
        cc.sys.localStorage.setItem(GCONFIG.KEY_ACHIEVE_DATA, this.achieveObj.toString());

        cc.log("...save data to local finished...");

    }
});

module.exports = DataMgr;