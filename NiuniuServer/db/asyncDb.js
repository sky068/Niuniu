const mysql = require('mysql');

// 连接数据库
const dbCfg = {
    host: '127.0.0.1',
    user: 'root',
    password: '803923',
    database: 'niuniu',
    connectionLimit: 50,
    queueLimit: 0,
    waitForConnection: true
  };
const pool = mysql.createPool(dbCfg);

let query = function(sql, values){
    return new Promise((resolve, reject)=>{
        pool.getConnection((err, conn)=>{
            if (err){
                console.log("db.getConnection error." + err);
                reject(err);
            } else{
                conn.query(sql, values, (err, rows)=>{
                    if (err){
                        reject(err);
                    } else{
                        resolve(rows);
                    }
                    conn.release();
                });
            }
        });
    });
}

module.exports = {query};