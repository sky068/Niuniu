class User{
    constructor(socket, uid, name, icon, coins){
        this.socket = socket;

        this.uid = uid;
        this.nickname = name;
        this.avatar = icon;
        this.coins = coins;
        this.isBanker = false;
        this.seatOrder = 0;  // 真实座次
    }
}

module.exports = User;