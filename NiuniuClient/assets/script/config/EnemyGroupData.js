/**
 * Created by edisonjiang on 2018/7/31.
 */

"use strict";

let UtilsOther = require('./../common/UtilsOther');
let EnemyBaseData = require('./EnemyBaseData');

let dataMap = {};
let dataList = [];

let EnemyGroupData = cc.Class({
    statics: {
        _jsonData: null
    },

    properties: {
        id: -1,

        // 敌人信息集合(该集合中的敌人会逐一生成，并减少数量，直至所有敌人都已生成)
        enemysInfo: "",
        enemyInfoArr: [],

        createTimes: 0
    },

    init (jsonData) {
        UtilsOther.clone(jsonData, this);

        this.id = Number(this.id);

        this.enemyInfoArr = UtilsOther.splitWithValueType(this.enemysInfo, String, ";");
        this.enemyInfoArr.forEach(function (currentValue, index, array) {
            let enemyInfo = UtilsOther.splitWithValueType(currentValue, Number, ",");
            array[index] = {id: enemyInfo[0], num: enemyInfo[1], isLimitOthers: enemyInfo[2]};
        });

        this.createTimes = Number(this.createTimes);
    },

    clone (srcData) {
        this.id = srcData.id;
        this.enemysInfo = srcData.enemysInfo;
        this.enemyInfoArr = JSON.parse(JSON.stringify(srcData.enemyInfoArr));
        this.createTimes = srcData.createTimes;

        return this;
    },

    getRandomEnemy () {
        let infoNum = this.enemyInfoArr.length;
        if (infoNum <= 0 || this.createTimes <= 0) {
            return null;
        }

        let idx = UtilsOther.randomInteger(0, infoNum - 1);
        let info = this.enemyInfoArr[idx];
        info.num--;
        if (info.num <= 0) {
            UtilsOther.arrayRmObj(this.enemyInfoArr, info);
        }

        this.createTimes--;

        return EnemyBaseData.getData(info.id);
    },
    
    isRemainEnemy () {
        return (this.enemyInfoArr.length > 0 && this.createTimes > 0);
    },

    /**
     * 在该敌人存在时是否不再产生其他的普通敌人
     * @param enemyId
     * @returns {Boolean}
     */
    isLimitOthers (enemyId) {
        for (let enemyInfo of this.enemyInfoArr) {
            if (enemyInfo.id == enemyId) {
                return enemyInfo.isLimitOthers;
            }
        }

        return false;
    }
});

EnemyGroupData.setData = function (jsonData) {
    EnemyGroupData._jsonData = jsonData;
};

/**
 * 初始化数据
 * @property {Object} jsonData
 */
EnemyGroupData.initData = function () {
    if (!EnemyGroupData._jsonData) {
        return;
    }

    let list = EnemyGroupData._jsonData;
    let key = 'id';
    for (let i in list) {
        let data = new EnemyGroupData();
        data.init(list[i]);

        dataMap[list[i][key]] = data;
        dataList.push(data);
    }

    delete EnemyGroupData._jsonData;
    EnemyGroupData._jsonData = null;
};

/**
 * 得到某个数据
 * @param {Number} id
 * @returns {EnemyGroupData}
 */
EnemyGroupData.getData = function (id) {
    return dataMap[id];
};
/**
 * 得到某个数据的副本
 * @param {EnemyGroupData} srcData
 * @returns {EnemyGroupData}
 */
EnemyGroupData.getDataCopy = function (srcData) {
    if (srcData instanceof EnemyGroupData) {
        return new EnemyGroupData().clone(srcData);
    } else {
        return null;
    }
};

/**
 * 获得数据的列表
 * @returns {Array.<EnemyGroupData>}
 */
EnemyGroupData.getDataList = function () {
    return dataList;
};
