/**
 * 修改系统ScrollView，去除本身触摸事件，增加设置滚动越界距离
 * 触摸事件由外部传递过去（touchstart touchmove touchend touchcancle)
 */

"use strict";

cc.Class({
    extends: cc.ScrollView,
    properties:{
        maxBounceDistance:{
            tooltip: "允许超过边界的最大值",
            default: cc.v2(100,100)
        },
        rate: {
            tooltip: "移动速率(0-1), 1表示跟随手指, 0表示不动",
            default: 1,
            max: 1,
            min: 0
        },
    },

    // mark 取消自身的触摸事件
    _registerEvent(){
    },

    _moveContent(deltaMove, canStartBounceBack) {
        let adjustedMove = this._flattenVectorByDirection(deltaMove);
        let scaleFactor = cc.director.getContentScaleFactor();
        scaleFactor = 1;

        let newPosition = cc.pAdd(this.getContentPosition(), adjustedMove);
        let maxOffset = this.getMaxScrollOffset();

        newPosition.x = newPosition.x>=(-maxOffset.x/2-this.maxBounceDistance.x * scaleFactor)?newPosition.x:(-maxOffset.x/2-this.maxBounceDistance.x * scaleFactor);
        newPosition.x = newPosition.x<=(maxOffset.x/2+this.maxBounceDistance.x * scaleFactor)?newPosition.x:(maxOffset.x/2+this.maxBounceDistance.x * scaleFactor);
        newPosition.y = newPosition.y>=(-maxOffset.y/2-this.maxBounceDistance.x * scaleFactor)?newPosition.y:(-maxOffset.y/2-this.maxBounceDistance.x * scaleFactor);
        newPosition.y = newPosition.y<=(maxOffset.y/2+this.maxBounceDistance.x * scaleFactor)?newPosition.y:(maxOffset.y/2+this.maxBounceDistance.x * scaleFactor);

        this.setContentPosition(newPosition);

        var outOfBoundary = this._getHowMuchOutOfBoundary();
        this._updateScrollBar(outOfBoundary);

        if (this.elastic && canStartBounceBack) {
            this._startBounceBackIfNeeded();
        }
    },

    _handleMoveLogic: function(touch) {
        let deltaMove = touch.getDelta();
        this._processDeltaMove(cc.pMult(deltaMove, this.rate));
    }

});