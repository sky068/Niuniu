class User{
    constructor(socket, uid, name, icon, coins){
        this.socket = socket;

        this.uid = uid;
        this.nickName = name;
        this.avatar = icon;
        this.coins = coins;
        this.isBanker = false;
    }
}

module.exports = User;