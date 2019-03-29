let express = require('express');
let admin = express.Router();

/* GET home page. */
admin.get('/', function(req, res, next) {
  res.render('admin', { title: '欢迎使用admin' });
});

module.exports = admin;