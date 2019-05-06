/**
 * Created by skyxu on 2018/10/9.
 */

"use strict";

/**
 * 消息基类对象，请求消息BaseRequest， 回调消息BaseResponse都继承BaseProtocol
 */
let BaseProtocol = cc.Class({
    ctor: function () {
        /**
         * 请求动作类型
         */
        this.act = '';

        /**
         * 每个请求的sequence_id应该唯一
         */
        this.seq = 0;

        /**
         * 错误代码，0为正常
         */
        this.err = 0;

        /**
         * 错误信息
         * @type {string}
         */
        this.msg = "";

        /**
         * 是否需要等待服务器回调
         */
        this.is_async = false;
    }
});

/**
 * 请求消息基类，客户端的请求都继承这个类
 */
let BaseRequest = cc.Class({
    extends: BaseProtocol
});

/**
 * 服务器返回的消息对应的对象，包含返回数据，一般和BaseRequest成对使用
 * @class BaseResponse
 * @extends BaseProtocol
 */
let BaseResponse = cc.Class({
    extends: BaseProtocol,

    /**
     * 读取返回数据，设置BaseResponse对象
     */
    loadData: function (data) {
        var key;
        for (key in data) {
            if(!this.hasOwnProperty(key)){
                continue;
            }

            if(data[key] !== undefined && data[key] !== null){
                this[key] = data[key];
            }
        }
    }
});

//-------------------------------------------------------
let HeartRequest = cc.Class({
    extends: BaseRequest,
    ctor(){
        this.act = 'heart';
        this.t = 0;    // 发送时间
    }
});

let HeartResponse = cc.Class({
    extends: BaseResponse,

    ctor(){
        this.act = 'heart';
        this.t = 0;
    }
});

let CreateRoomRequest = cc.Class({
    extends: BaseRequest,
    ctor(){
        this.act = "createRoom";
        this.uid = 0;
    }
});

let CreateRoomResponse = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.act = "createRoom";
        this.rid = 0;
        this.user = null;
    }
});
//-------------------------------------------------------
let EnterRoomRequest = cc.Class({
    extends: CreateRoomResponse,
    ctor(){
        this.act = "enterRoom";
    }
});
let EnterRoomResponse = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.rid = 0;
        this.users = null;
    }
});
let PushEnterRoom = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.user = null;
    }
});

//-------------------------------------------------------
let StartGameRequest = cc.Class({
    extends: BaseRequest,
    ctor(){
        this.act = "startGame";
        this.uid = "";
    }
});

//-------------------------------------------------------
let BetRequest = cc.Class({
    extends: BaseRequest,
    ctor(){
        this.act = "payBet";
        this.uid = 0;
        this.bet = 0;
    }
});

//-------------------------------------------------------
let ChatRequest = cc.Class({
    extends: BaseRequest,
    ctor(){
        this.act = 'chat';
        this.msg = '';
        this.uid = '';
    }
});

let PushChat = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.act = 'chat';
        this.msg = '';
        this.uid = '';
    }
});

let PushDeal = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.act = 'pDeal';
        this.cards = [];
    }
});

let PushBet = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.act = 'pBet';
        this.bet = 0;
        this.uid = 0;
    }
});

let PushStartBet = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.act = "pStartBet";
        this.expired = 0;
    }
});

let PushShowCards = cc.Class({
    extends: BaseResponse,
    ctor(){
        this.act = "pShowCards";
        this.users = [];
    }
});

//-------------------------------------------------------
let LoginRequest = cc.Class({
    extends: BaseRequest,

    ctor: function () {
        this.act = 'login';

        /**
         * facebook用户的accessToken，或游客的UUID
         */
        this.token = '';

        /**
         * token来源，默认0:游客，1:facebook
         */
        this.origin = 0;

        /**
         * 平台: 必须为以下几种之一：android/ios/winphone/pc
         */
        this.os = '';

        /**
         * 平台系统版本
         */
        this.osVersion = '';

        /**
         * 设备产品型号, 示例 iPhone8,2, SM-G 9280
         */
        this.deviceModel = '';

        /**
         * 渠道ID
         */
        this.channelId = 0;

        /**
         * Ios设备广告标示符
         */
        this.idfa = '';

        /**
         * 安卓设备id
         */
        this.androidId = '';

        /**
         * Google广告平台账号，安装了google play的设备可取到
         */
        this.googleAid = '';

        /**
         * 应用版本号
         */
        this.appVersion = '';

        /**
         * 取package name或者bundle id
         */
        this.packName = '';


        /**
         * 设备语言
         * @type {string}
         */
        this.language = '';

        this.locale = "";

        this.uid = 0;

    }
});

let LoginResponse = cc.Class({
    extends: BaseResponse,

    ctor: function () {
        this.act = 'login';
        this.uid = 0;
        this.bid = 0;
        this.coins = 0;
        this.nickname = "";
        this.avatar = "";

    }
});
//-------------------------------------------------------
let LogoutRequest = cc.Class({
    extends: BaseRequest,

    ctor: function () {
        this.act = 'logout';
    }
});

let LogoutResponse = cc.Class({
    extends: BaseResponse,

    ctor: function () {
        this.act = 'logout';
    }
});
//-------------------------------------------------------
/**
 * 绑定fb账号
 * @extends BaseRequest
 */
let BindFacebookRequest = cc.Class({
    extends: BaseRequest,

    ctor: function () {
        this.act = 'bindFb';

        /**
         * facebook用户的accessToken，或游客的UUID
         */
        this.token = '';
    }
});
/**
 * 绑定fb账号
 * @extends BaseResponse
 */
let BindFacebookResponse = cc.Class({
    extends: BaseResponse,

    ctor: function () {
        this.act = 'bindFb';

        /**
         * fb数据
         */
        this.me = 0;

        /**
         * fb好友
         */
        this.friends = 0;
    }
});
//-------------------------------------------------------
/**
 * 获取排名
 * @extends BaseRequest
 */
let RankRequest = cc.Class({
    extends: BaseRequest,

    ctor: function () {
        this.act = 'rankboard';

        /**
         * 请求动作类型{ 0全部，1本地，2好友 }
         * @type {int}
         */
        this.type = 0;
    }
});
/**
 * 获取排名
 * @extends BaseResponse
 */
let RankResponse = cc.Class({
    extends: BaseResponse,

    ctor: function () {
        this.act = 'rankboard';

        /**
         *  我的排名
         */
        this.myRank = 0;

        /**
         * 排名玩家数据
         */
        this.men = [];
    }
});


//----------------------only push------------------------
let PushExitRoom = cc.Class({
    extends: BaseResponse,

    ctor: function () {

        this.act = 'exitRoom';

        this.user = null;
    }
});

//-------------------------------------------------------
/**
 * debug回调
 * @extends BaseRequest
 */
let DebugChangeMeRequest = cc.Class({
    extends: BaseRequest,

    ctor: function () {

        this.act = "cmdTest";					//请求动作类型
        this.cmd = "";
        //  "player coins add 100", cmd格式：player field value 或者 player field add value
        //  Building field [add] value where playerId value type value
    }

});
/**
 * debug回调
 * @extends BaseResponse
 */
let DebugChangeMeResponse = cc.Class({
    extends: BaseResponse,

    ctor: function () {
        this.act = "cmdTest";

        /**
         * 玩家数据
         * @type {Object}
         */
        this.me = {};

        /**
         * 体力恢复周期
         * @type {Number}
         */
        this.spInterval = null;

        /**
         * 体力恢复剩余时间
         * @type {Number}
         */
        this.spStepLeftTime = null;

        /**
         * 存钱罐速度
         * @type {Number}
         */
        this.farmDailyOut = null;

        /**
         * 存钱罐可回收金币
         * @type {Number}
         */
        this.farmCoins = null;

        /**
         * 存钱罐回收周期
         * @type {Number}
         */
        this.farmInterval = null;

        /**
         * 岛屿建筑数据
         * @type {Array}
         */
        this.buildings = null;
    }
});

let response_classes = {
    login: LoginResponse,
    logout: LogoutResponse,
    bindFb: BindFacebookResponse,
    heart: HeartResponse,
    createRoom: CreateRoomResponse,
    enterRoom: EnterRoomResponse,
    payBet: BetRequest,

    //push
    pEnterRoom: PushEnterRoom,
    pExitRoom: PushExitRoom,
    pDeal: PushDeal,
    pBet: PushBet,
    pStartBet: PushStartBet,
    pShowCards: PushShowCards,
    chat: PushChat,

    // debug
    cmdTest: DebugChangeMeResponse,
};

module.exports = {
    LoginRequest: LoginRequest,
    LoginResponse: LoginResponse,
    LogoutRequest: LogoutRequest,
    LogoutResponse: LogoutResponse,
    BindFacebookRequest: BindFacebookRequest,
    BindFacebookResponse: BindFacebookResponse,
    RankRequest: RankRequest,
    RankResponse: RankResponse,
    HeartRequest: HeartRequest,
    HeartResponse: HeartResponse,
    ChatRequest: ChatRequest,
    CreateRoomRequest: CreateRoomRequest,
    CreateRoomResponse: CreateRoomResponse,
    EnterRoomRequest:EnterRoomRequest,
    EnterRoomResponse:EnterRoomResponse,
    StartGameRequest: StartGameRequest,
    BetRequest: BetRequest,

    // debug
    DebugChangeMeRequest: DebugChangeMeRequest,
    DebugChangeMeResponse: DebugChangeMeResponse,

    //push消息
    PushEnterRoom: PushEnterRoom,
    PushExitRoom: PushExitRoom,
    PushDeal: PushDeal,
    PushChat: PushChat,
    PushBet: PushBet,
    PushStartBet: PushStartBet,
    PushShowCards: PushShowCards,

    response_classes: response_classes
};
