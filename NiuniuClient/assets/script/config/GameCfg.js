/**
 * Created by skyxu on 2018/4/26.
 */

"use strict";

let EnemyBaseData = require("./EnemyBaseData");
let GunData = require("./GunData");
let EnemyGroupData = require("./EnemyGroupData");
let AchievementData = require("./AchievementData");
let DailyRewardData = require("./DailyRewardData");
let UtilsOther = require("./../Common/UtilsOther");

let GameCfg = cc.Class({
    properties: {
        isLoadOver: false,
        // mark: 重要，变量名要保持和文件名一致
        enemyCfg: null
    },

    /**
     * 读取本地配置文件
     * @param finishCall {Function} 完成回调
     */
    loadLocalCfg(finishCall){
        this.loadCounts = 0;

        let enemyInfo = {name: "enemyCfg", onLoad: EnemyBaseData.setData};
        let enemyGroupInfo = {name: "enemyGroupCfg", onLoad: EnemyGroupData.setData};

        let gunBase = {name: "gunBaseCfg", onLoad: GunData.setBaseData};
        let gunLevel = {name: "gunLevelCfg", onLoad: GunData.setLevelData};
        
        let achieveInfo = {name: "achievementCfg", onLoad: AchievementData.setData};
        let dailyRewardInfo = {name: "dailyRewardCfg", onLoad: DailyRewardData.setData};

        let fileArray = [enemyInfo, enemyGroupInfo, gunBase, gunLevel, achieveInfo, dailyRewardInfo];
        for (let file of fileArray){
            let fileName = file;
            if (UtilsOther.isObject(file)) {
                fileName = file.name;
            }

            cc.loader.loadRes("config/" + fileName, function (err, data) {
                if (err) {
                    cc.log("load local cfg " + fileName + " error: " + err);
                } else {
                    cc.log("load local cfg " + fileName + " suc.");
                    this[fileName] = data;

                    if (UtilsOther.isObject(file) && file.onLoad) {
                        file.onLoad(data);
                    }
                }
                this.loadCounts++;
                this.isLoadOver = this.loadCounts >= fileArray.length;
                if (this.isLoadOver) {
                    EnemyBaseData.initData();
                    EnemyGroupData.initData();
                    GunData.initBaseData();
                    GunData.initLevelData();
                    AchievementData.initData();
                    DailyRewardData.initData();
                    
                    if (finishCall) {
                        finishCall();
                    }
                }
            }.bind(this));
        }
    }
});
GameCfg.instance = null;
GameCfg.getInstance = function () {
    if (!GameCfg.instance) {
        GameCfg.instance = new GameCfg();
    }
    return GameCfg.instance;
};

module.exports = GameCfg;