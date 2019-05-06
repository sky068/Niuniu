// 下划线开头的字段都不会传递给客户端
class User{
    constructor(socket, uid, name, icon, coins){
        this._socket = socket;

        this.uid = uid;
        this.nickname = name;
        this.avatar = icon;
        this.coins = coins;
        this.isBanker = false;
        this.seatOrder = 0;  // 真实座次
        this._cards = [];    // 手牌
        this._bet = 0;       // 下注
        this._reward = 0;    // 本局赢钱
    }
}

module.exports = User;