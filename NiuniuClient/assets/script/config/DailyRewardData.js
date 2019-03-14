/**
 * Created by edisonjiang on 2018/8/31.
 */

"use strict";

let UtilsOther = require("./../common/UtilsOther");

let dataList = [];

let DailyRewardData = cc.Class({
    properties: {
        id: -1,
        roleMaxLevel: 0,

        rewardInfos: "",
        rewardInfoArr: []
    },

    init (jsonData) {
        UtilsOther.clone(jsonData, this);

        this.id = Number(this.id);
        this.roleMaxLevel = Number(this.roleMaxLevel);

        if (this.rewardInfos && this.rewardInfos != "-1") {
            this.rewardInfoArr = UtilsOther.splitWithValueType(this.rewardInfos, String, ";");
            this.rewardInfoArr.forEach(function (currentValue, index, array) {
                let info = UtilsOther.splitWithValueType(currentValue, Number, ",");
                array[index] = {coins: info[0], weight: info[1]};
            });
        }
    }
});

DailyRewardData.setData = function (jsonData) {
    DailyRewardData._jsonData = jsonData;
};

/**
 * 初始化数据
 * @property {Object} jsonData
 */
DailyRewardData.initData = function () {
    if (!DailyRewardData._jsonData) {
        return;
    }

    let list = DailyRewardData._jsonData;
    for (let v of list) {
        let rewardData = new DailyRewardData();
        rewardData.init(v);

        dataList.push(rewardData);
    }

    delete DailyRewardData._jsonData;
    DailyRewardData._jsonData = null;
};

/**
 * 根据角色的最大等级得到数据
 * @param {Number} roleMaxLevel
 * @returns {DailyRewardData}
 */
DailyRewardData.getRewardData = function (roleMaxLevel) {
    let count = dataList.length;
    if (count <= 0) {
        return null;
    }

    let minLevel = 0, maxLevel = 0;
    for (let i = 0; i < count; i++) {
        minLevel = dataList[i].roleMaxLevel;
        if (i + 1 < count) {
            maxLevel = dataList[i + 1].roleMaxLevel;
        } else {
            maxLevel = Number.MAX_VALUE;
        }

        if (roleMaxLevel >= minLevel && roleMaxLevel < maxLevel) {
            return dataList[i];
        }
    }

    return dataList[count - 1];
};
