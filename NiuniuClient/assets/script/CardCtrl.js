// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const POINT2SHOW = [12,13,1,2,3,4,5,6,7,8,9,10,11];    // 牌面值和图片命名转换
let CartSuit = cc.Enum({
    DIAMOND: 1, // 方片♦️
    CLUB: 2,    // 梅花♣️
    HEART: 3,   // 红桃♥️
    SPADE: 4,   // 黑桃♠️
});

cc.Class({
    extends: cc.Component,

    properties: {
        cardFace: cc.Sprite,
        cardPointSp: cc.Sprite,
        cardPointSp2: cc.Sprite,
        cardSuitSp: cc.Sprite,
        cardAtlas: cc.SpriteAtlas,

        cardPoint: {
            default: 10,
            type: cc.Integer,
            min: 1,
            max: 13,
            notify(){
                this._updateCard();
            }
        },

        cardShuit: {
            default: 1,
            type: cc.Integer,
            min: 1,
            max: 4,
            notify(){
                this._updateCard();
            }
        },

        showFace: {
            default: true,
            notify(){
                this.cardFace.node.active = this.showFace;
            }
        },

    },

    // LIFE-CYCLE CALLBACKS:


    start () {

    },

    /**
     * 
     * @param {Number} point 牌面点数（1-13）A-K
     * @param {Number} suit  牌面花色（1-4）方块、梅花、红桃、黑桃'
     * @param {Boolean} showF 显示正面
     */
    initCard(point, suit, showF){
        cc.assert(point >= 1 && point <= 13, "point must be [1,13]");
        cc.assert(suit >= 1 && suit <= 4, "suit must be [1,4");
        this.cardPointSp.spriteFrame = this.cardPointSp2.spriteFrame = this.cardAtlas.getSpriteFrame(this._getPointSpriteFrameName(point,suit));
        this.cardSuitSp.spriteFrame = this.cardAtlas.getSpriteFrame(this._getSuitSpriteFrameName(point, suit));
        this.showFace = showF != undefined ? showF : false;
    },

    _updateCard(){
        this.initCard(this.cardPoint, this.cardShuit);
    },

    _getPointSpriteFrameName(point, suit){
        let pre = "B";
        pre = suit === 1 || suit === 3 ? "R" : pre;
        return pre + POINT2SHOW[point - 1] + "L";
    },

    _getSuitSpriteFrameName(point, suit){
        let suitName = "fangkuai_L";

        if (point < 11){
            if (suit === 2){
                suitName = "meihua_L";
            } else if (suit === 3){
                suitName = "hongtao_L";
            } else if (suit === 4){
                suitName = "heitao_L";
            }
        } else{
            let suitPre = "hong_";
            if (suit === 2 || suit === 4){
                suitPre = "hei_";
            } 
            suitName = suitPre + POINT2SHOW[point - 1] + "_hua";
        }

        return suitName;
    }


    // update (dt) {},
});
