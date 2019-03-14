/**
 * Created by skyxu on 2018/7/27.
 */

"use strict";

let UtilsOther = require('./../common/UtilsOther');

let AchievementData = cc.Class({
    extends: cc.Class,
    name: "AchievementData",

    ctor(){
        this.id = -1;
        this.type = -1;
        this.order = -1;
        this.condition = -1;
        this.desc = "";
        this.reward = 0;
    }
});

AchievementData._jsonData = null;
AchievementData.achieveData = [];       // 所有成就数据(二维数据，成就分类保存)

AchievementData.setData = function (data) {
    AchievementData._jsonData = data;
};

AchievementData.initData = function () {
    if (!AchievementData._jsonData){
        return;
    }

    // 最后一行为切割任务类型说明
    let splitInfo = AchievementData._jsonData.pop().type.split(",").map((x)=>{return parseInt(x);});

    for (let i=0; i<splitInfo.length; i++){
        let startIndex = 0;
        let endIndex = 0;
        for (let j=0; j<i; j++){
            startIndex += splitInfo[j];
        }
        endIndex = startIndex + splitInfo[i];

        let aTypeAchieveArr = [];
        let aTypeAchieveInfo = AchievementData._jsonData.slice(startIndex, endIndex);
        for (let a of aTypeAchieveInfo){
            let aAchieve = new AchievementData();
            UtilsOther.clone(a, aAchieve);
            // 转换数据类型，以方便使用
            for (let key in aAchieve){
                if (!aAchieve.hasOwnProperty(key)){
                    continue;
                }
                if (key === "desc"){
                    aAchieve[key] = aAchieve[key].toString();
                } else {
                    aAchieve[key] = parseInt(aAchieve[key]);
                }
            }
            aTypeAchieveArr.push(aAchieve);
        }
        AchievementData.achieveData.push(aTypeAchieveArr);
    }


    delete AchievementData._jsonData;
    // cc.log(JSON.stringify(AchievementData.achieveData));
};

