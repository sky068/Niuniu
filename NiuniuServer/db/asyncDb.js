const mysql = require('mysql');

// 连接数据库
const dbCfg = {
    host: '202.182.116.69',
    user: 'root',
    password: 'XuTq0803',
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