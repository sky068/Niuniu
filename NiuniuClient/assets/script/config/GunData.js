/**
 * Created by skyxu on 2018/6/7.
 */

"use strict";

let UtilsOther = require('./../common/UtilsOther');

let GunLevelObj = cc.Class({
    ctor(){
        this.level = 1;         // 当前等级
        this.attackAdd = 0;     // 基础攻击力加成
        this.denseAdd = 0;      // 基础发射速度加成
        this.range = 0;         // 火箭弹爆炸范围0-1
        this.expend = 0;        // 升级到当前等级所需花费
        this.length = 1;        // 激光长度0-1
        this.coolingAdd = 0;    // 大技能冷却加成
    }
});

let GunObj = cc.Class({
    ctor(){
        this.baseAttack = 10;           // 基础攻击力
        this.baseDense = 1.25;          // 基础发射速度(bps)
        this.baseLength = 1;            // 基础长度0-1 激光武器
        this.baseSpeed = 20;            // 基础子弹飞行速度
        this.baseSkillCooling = 10;     // 大技能基础冷却时间
        this.baseNum = 3;               // 散弹枪每次发射子弹数量
        this.baseGap = 5;               // 散弹枪子弹间隔角度
        this.levels = new GunLevelObj;  // 枪支等级信息
        this.skill1level = 1;           // 技能开启等级
        this.skill2level = 1;
        this.skill3level = 1;
        this.skill4level = 1;
        this.skill1des = "";
        this.skill2des = "";
        this.skill3des = "";
        this.skill4des = "";
        this.unlockType = 1;            // 1:金币解锁 2:观看广告解锁  3:挑战指定关卡解锁
        this.unlockAdTimes = 10;        // 解锁所需观看广告次数
        this.unlockChallenge = 10;      // 解锁所需挑战关卡数
    }
});

let GunData = cc.Class({

});


GunData._jsonBaseData = null;
GunData._jsonLevelData = null;
GunData.gunData = null;

GunData.setBaseData = function (jsonBaseData) {
    GunData._jsonBaseData = jsonBaseData;
};

GunData.setLevelData = function (jsonLevelData) {
    GunData._jsonLevelData = jsonLevelData;
};

GunData.initBaseData = function () {
    if (!GunData._jsonBaseData){
        return;
    }

    GunData.gunData = new GunData();
    for (let i=0; i<GunData._jsonBaseData.length; i++){
        let aGunBaseCfg = GunData._jsonBaseData[i];
        GunData.gunData["gun_" + aGunBaseCfg.gunId] = new GunObj();
        GunData.clone(aGunBaseCfg, GunData.gunData["gun_" + aGunBaseCfg.gunId]);
    }

    delete GunData._jsonBaseData;
};

GunData.initLevelData = function () {
    if (!this._jsonLevelData){
        return;
    }

    for (let i=0; i<this._jsonLevelData.length; i++){
        let aLevelCfgArr = this._jsonLevelData[i];
        if (!GunData.gunData.hasOwnProperty("gun_" + aLevelCfgArr[0].gunId)){
            continue;
        }
        GunData.gunData["gun_" + aLevelCfgArr[0].gunId].levels = aLevelCfgArr;
    }

    delete GunData._jsonLevelData;
};

/**
 * 获取枪支信息
 * @param gunId{cc.Integer} 1: 双枪 2:火箭弹(范围伤害) 3:激光武器 4:散弹枪
 */
GunData.getGunData = function (gunId) {
    if (!GunData.gunData || !GunData.gunData["gun_" + gunId]){
        return null;
    }
    return GunData.gunData["gun_" + gunId];
};

GunData.clone = function (obj, newObj) {
    if (!newObj) {
        newObj = (obj.constructor) ? new obj.constructor() : {};
    }

    let key;
    let copy;
    for (key in obj) {
        if (!obj.hasOwnProperty(key) || obj[key] == -1) {
            continue;
        }
        copy = obj[key];
        // Beware that typeof null == "object" !
        if (((typeof copy) === "object") && copy) {
            newObj[key] = UtilsOther.clone(copy, null);
        } else {
            newObj[key] = copy;
        }
    }
    return newObj;
};