// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        normalNode: cc.Node,
        overflowNode: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {
    },

    // update (dt) {},

    setNum (ownNum, maxNum) {
        this.normalNode.active = false;
        this.overflowNode.active = false;

        let node = this.normalNode;
        if (ownNum > maxNum) {
            node = this.overflowNode;
        }
        node.active = true;

        node.getChildByName('labelOwnNum').getComponent(cc.Label).string = ownNum;
        node.getChildByName('labelMaxNum').getComponent(cc.Label).string = '/' + maxNum;
    }
});
