/**
 * Created by skyxu on 2019/3/20.
 *
 * 需要在cocoscreator里导入为插件使用
 * 插件不支持es6，注意需要按照es5规则写
 */
"use strict";
/**
 * 定义手牌类型（按照大小从小到大排序)
 * @type {{TYPE_NONE: number, TYPE_NIU_1: number, TYPE_NIU_2: number,
 * TYPE_NIU_3: number, TYPE_NIU_4: number, TYPE_NIU_5: number,
 * TYPE_NIU_6: number, TYPE_NIU_7: number, TYPE_NIU_8: number,
 * TYPE_NIU_9: number, TYPE_NIUNIU: number, TYPE_SILVER: number,
 * TYPE_BOOM: number, TYPE_FLOWER: number, TYPE_FIVES: number}}
 */

var HandsType = {
    TYPE_NONE: 0,
    // 没牛, 任意三张牌的和都不是10的倍数
    TYPE_NIU_1: 1,
    // 牛1
    TYPE_NIU_2: 2,
    TYPE_NIU_3: 3,
    TYPE_NIU_4: 4,
    TYPE_NIU_5: 5,
    TYPE_NIU_6: 6,
    TYPE_NIU_7: 7,
    TYPE_NIU_8: 8,
    TYPE_NIU_9: 9,
    TYPE_NIUNIU: 10,
    // 牛牛, 任意3张和为10的倍数，剩余2张和也为10的倍数
    TYPE_SILVER: 11,
    // 银牛, 五张全是10、J、Q、K
    TYPE_BOOM: 12,
    // 炸弹, 四张点数相同
    TYPE_FLOWER: 13,
    // 5花牛, 五张全是J、Q、K
    TYPE_FIVES: 14 // 5小牛（5张加起来小于等于10）

};
/**
 *
 * @param p{Number} 1-13 (A-K)
 * @param s{Number} 1-4 (1方块diamond、2梅花club、3红桃heart、4黑桃spade）
 * @constructor
 */

function CardObj(p, s) {
    this.point = p; // 牌面点数

    this.suit = s; // 牌面花色
}
/**
 * 手牌类型返回对象
 * @param type{Number}      手牌类型
 * @param mCard{CardObj}    手里的最大牌
 * @param ncards{Array}     组成牛的三张牌, 手牌分成两组方便展示
 * @param pcards{Array}     决定点数的两张牌
 * @constructor
 */


function TypeReturn(type, mCard, ncards, pcards) {
    this.handsType = type; // 手牌类型

    this.maxCard = mCard; // 最大牌

    this.nCards = ncards; // 组成牛的牌

    this.pCards = pcards; // 决定点数的牌
}
/**
 * 创建一副牌，牌面A-K
 * 默认已经洗牌
 * @return {Array}
 */


function create1pairPoker(isShuffle) {
    var cards = [];

    for (var i = 1; i <= 13; i++) {
        for (var j = 1; j <= 4; j++) {
            cards.push(new CardObj(i, j));
        }
    }

    if (isShuffle) {
        cards = shuffle(cards);
    }

    return cards;
}
/**
 * 洗牌
 * @param arr{Array}
 * @return {*}
 */


function shuffle(arr) {
    var i, j, temp;

    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr;
}
/***
 * 从大到小排序手牌
 * @param cardsArr{Array} 手牌数组
 */


function sortBig2Samll(cardsArr) {
    cardsArr.sort(function (c1, c2) {
        return c2.point - c1.point;
    });
    return cardsArr;
}
/**
 * 判定手牌类型
 * @param cardsArr{Array} 要判定的手牌信息数组
 * @return {TypeReturn}
 */


function getHandsType(cardsArr) {
    var len = cardsArr.length;
    if (!cardsArr || len !== 5) return new TypeReturn(HandsType.TYPE_NONE, cardsArr[0], cardsArr, []);
    sortBig2Samll(cardsArr);
    var totalPoint = 0;
    var realTotalPoint = 0;
    var bigJ = true;
    var big10 = true;
    cardsArr.forEach(function (card) {
        totalPoint += card.point <= 10 ? card.point : 10;
        realTotalPoint += card.point;

        if (card.point < 11) {
            bigJ = false;
        }

        if (card.point < 10) {
            big10 = false;
        }
    }); // 判断牌型,判断顺序不能变,依次从大到小判断5小牛、5花牛、炸弹、银牛、牛牛、有牛、没牛

    if (totalPoint <= 10) {
        console.log("五小牛");
        return new TypeReturn(HandsType.TYPE_FIVES, cardsArr[0], cardsArr, []);
    }

    if (bigJ) {
        console.log("五花牛");
        return new TypeReturn(HandsType.TYPE_FLOWER, cardsArr[0], cardsArr, []);
    } // 牌型是4炸的话最大牌取炸弹牌,比如5555J取5,方便比较大小


    if (realTotalPoint - cardsArr[len - 1].point === cardsArr[0].point * 4) {
        console.log("炸弹");
        return new TypeReturn(HandsType.TYPE_BOOM, cardsArr[0], cardsArr, []);
    } else if (realTotalPoint - cardsArr[0].point === cardsArr[len - 1].point * 4) {
        console.log("炸弹");
        return new TypeReturn(HandsType.TYPE_BOOM, cardsArr[len - 1], cardsArr, []);
    }

    if (big10) {
        console.log("银牛");
        return new TypeReturn(HandsType.TYPE_SILVER, cardsArr[0], cardsArr, []);
    }

    var lave = totalPoint % 10;

    for (var i = 0; i < len - 1; i++) {
        var ret = 0;

        for (var j = i + 1; j < len; j++) {
            ret = (cardsArr[i].point <= 10 ? cardsArr[i].point : 10) + (cardsArr[j].point <= 10 ? cardsArr[j].point : 10);

            if (ret % 10 === lave) {
                var cardPre = [];
                var cardSuf = [];

                for (var k = 0; k < len; k++) {
                    if (k != i && k != j) {
                        cardPre.push(cardsArr[k]);
                    } else {
                        cardSuf.push(cardsArr[k]);
                    }
                }

                if (lave === 0) {
                    console.log("牛牛");
                    return new TypeReturn(HandsType.TYPE_NIUNIU, cardsArr[0], cardsArr, []);
                }

                console.log("牛", lave);
                return new TypeReturn(HandsType["TYPE_NIU_" + lave], cardsArr[0], cardPre, cardSuf);
            }
        }
    }

    console.log("没牛.");
    return new TypeReturn(HandsType.TYPE_NONE, cardsArr[0], cardsArr, []);
}
/**
 * 比较两组手牌大小
 * @param cards1{Array}
 * @param cards2{Array}
 * @return {Boolean} true 表示 cards1 大于 cards2
 */


function compareCards(cards1, cards2) {
    var typeReturn1 = getHandsType(cards1);
    var typeReturn2 = getHandsType(cards2);
    return compareHandsReturn(typeReturn1, typeReturn2);
}
/**
 * 比较两个手牌类型大小
 * @param typeReturn1{TypeReturn}
 * @param typeReturn2{TypeReturn}
 */


function compareHandsReturn(typeReturn1, typeReturn2) {
    if (typeReturn1.handsType !== typeReturn2.handsType) {
        return typeReturn1.handsType > typeReturn2.handsType;
    } else {
        if (typeReturn1.maxCard.point !== typeReturn2.maxCard.point) {
            return typeReturn1.maxCard.point > typeReturn2.maxCard.point;
        } else {
            return typeReturn1.maxCard.suit > typeReturn2.maxCard.suit;
        }
    }
}