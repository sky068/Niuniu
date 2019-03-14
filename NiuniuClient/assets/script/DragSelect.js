/**
 * Created by skyxu on 2018/11/1.
 * 
 * 滑动选择卡牌组件
 * 把此组件拖放到卡牌根节点即可，卡牌根节点添加cc.Layout组件来自动布局
 * 
 */

cc.Class({
    extends: cc.Component,

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.cardsArr = this.node.getChildren();
        let card = this.cardsArr[0];
        // 指左侧卡牌锚点到右侧相邻卡牌边缘的距离
        this.CARD_DISTANCE = card.width*card.anchorX + this.node.getComponent(cc.Layout).spacingX;
        cc.log("CARD_DISTANCE: " + this.CARD_DISTANCE);
    },

    onTouchStart(event){
        let pos = event.getLocation();
        let beginPos = this._beginPos = this.node.convertToNodeSpaceAR(pos);
        this._checkSelectCard(beginPos, beginPos, true);
    },

    onTouchMove(event){
        let pos = event.getLocation();
        let movePos = this.node.convertToNodeSpaceAR(pos)
        // 这里确定是(movePos, movePos) 每次移动只选择右侧一张
        this._checkSelectCard(movePos, movePos);
        // 这里要传入起点和结束点，获取总的框取范围
        this._checkSelectCardReverse(this._beginPos, movePos);
    },

    onTouchEnd(event){
        for (let card of this.cardsArr){
            let ctrl = card.getComponent("CardCtrl");
            if (ctrl.touched){
                ctrl.selected = !ctrl.selected;
            }
            ctrl.touched = false;
        }
    },

    _checkSelectCard(beginPos, endPos, isBegin){
        let len = this.cardsArr.length;
        if (isBegin){
            for (let i=len-1; i>=0; i--){
                let card = this.cardsArr[i];
                if (cc.rectContainsPoint(card.getBoundingBox(), beginPos)){
                    card.getComponent('CardCtrl').touched = true;
                    return;
                }
            }
        } else{
            let w = Math.max(1, Math.abs(beginPos.x - endPos.x));
            let h = Math.max(1, Math.abs(beginPos.y - endPos.y));
            let x = Math.min(beginPos.x, endPos.x);
            let y = Math.min(beginPos.y, endPos.y);
            let touchRect = cc.rect(x, y, w, h);

            for (let i=len-1; i>=0; i--){
                let card = this.cardsArr[i];
                if (cc.rectIntersectsRect(card.getBoundingBox(), touchRect)){
                    card.getComponent('CardCtrl').touched = true;
                    return;
                }
            }
        }
    },

    _checkSelectCardReverse(beginPos, endPos){
        let p1 = beginPos.x < endPos.x ? beginPos : endPos;
        let w = Math.abs(beginPos.x - endPos.x);
        let h = Math.abs(beginPos.y - endPos.y);
        let rect = cc.rect(p1.x, p1.y, w, h);

        let len = this.cardsArr.length;
        for (let i=len-1; i>=0; i--){
            let card = this.cardsArr[i];
            if (!cc.rectIntersectsRect(card.getBoundingBox(), rect)){
                card.getComponent('CardCtrl').touched = false;
            }
        }

        // 从右向左框取然后又移动回右侧则取消左侧已经选择的卡牌
        for (let i=0; i<len; i++){
            let card = this.cardsArr[i];
            if (p1.x - card.x >= this.CARD_DISTANCE){
                card.getComponent('CardCtrl').touched = false;
            }
        }
    }

    // update (dt) {},
});
