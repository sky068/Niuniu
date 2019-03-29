class User{
    constructor(socket, uid){
        socket.uid = uid;       // 用户id   快速索引用户
        socket.rid = 0;         // 房间id   快速索引房间
        this.socket = socket;
        this.uid = uid;
        this.isBlack = false;
        this.chessDic = {};     // 棋子，索引为棋子cid
    }
}

module.exports = User;