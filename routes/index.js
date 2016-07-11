var express = require('express');
//生成一个路由实例 路由也是一个实例容器
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/article/list');
});


module.exports = router;
