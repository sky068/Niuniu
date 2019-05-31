# Niuniu

#### 介绍
使用Cocos Creator + node.js开发的牛牛游戏。

#### 软件架构
Cocos Creator v1.9.1  + node.js v8.11.1 + MariaDB(mysql) v5.7.21-log 

danji分支为单机模式.

net 分支为联网开房玩法.

##### 网络玩法需要创建一个名为niuniu 的数据库和名为users的表，下面是表的结构,

```
CREATE TABLE IF NOT EXISTS `users` (
  `uid` int(11) NOT NULL,
  `bid` int(11) DEFAULT NULL,
  `nickname` varchar(100) DEFAULT '游客',
  `avatar` text,
  `coins` int(11) DEFAULT '0',
  `rkeys` int(11) DEFAULT '0',
  PRIMARY KEY (`uid`)
);
```


[在线试玩](http://www.gamelover.net/games/niuniu)

