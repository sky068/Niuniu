/**
 * Created by skyxu on 2018/4/16.
 */

"use strict";

cc.Class({
    extends: cc.Component,

    properties:{

    },

    onLoad(){
        // 按照宽度进行缩放
        const designSize = cc.Canvas.instance.designResolution;
        let winSize = cc.director.getWinSize();
        let factor = winSize.width / designSize.width;
        factor = Math.min(1, factor);
        this.node.scaleX *= factor;
        this.node.scaleY *= factor;
    }
});