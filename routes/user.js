var express = require('express');
var router = express.Router();

//注册 当用户访问此路径的时候返回一个空白表单
router.get('/reg', function(req, res, next) {
  //第一个是相对路径，相对于views也就是模板的根目录
  res.render('user/reg',{title:'注册'});
});
//接收注册表单
router.post('/reg',function(req,res){
  //接收请求体，然后保存后数据库中
  //客户端填写注册表单后,点击提交按钮的时候，会把表单内容序列化成
  //查询 字符串的格式放在请求体中传到后台 body-parser中间件把它
  //转成对象并赋给req.body
  var user = req.body;
  console.log(user);
  if(user.password != user.repassword){
    req.flash('error','密码和重复密码不一致');
    return res.redirect('back');//表示返回上一个页面
  }
  //删除不需要保存的字段
  delete user.repassword;

  user.password = md5(user.password);//对密码进行加密
  user.avatar = 'https://secure.gravatar.com/avatar/'
  +md5(user.email)+'?s=48';//生成头像的图片地址
  //保存一个文档
  Model('User').create(user,function(err,doc){
    if(err){
      req.flash('error','注册用户失败');
      return res.redirect('back');
    }else{
      //把保存之后的用户文档对象赋给req.session
      //然后就可以通过req.session上是否有user的属性来判断用户是否登录
      //二个参数表示设置消息
      req.flash('success','恭喜注册用户成功');
      //一个参数表示获取消息 获得是一个数组
      //req.flash('success').toString();
      req.session.user = doc;
      //告诉 客户端向新的地址发起请求
      res.redirect('/');
    }
  })
});
function md5(str){
  return require('crypto') //加载加密模块
      .createHash('md5')  //指定哈希算法
      .update(str)  //指定要加密的字符串
      .digest('hex')//摘要输出，指定编码为16进制
}


//登陆 当用户访问此路径的时候返回一个空白表单
router.get('/login', function(req, res, next) {
  //第一个是相对路径，相对于views也就是模板的根目录
  res.render('user/login',{title:'登陆'});
});

router.post('/login',function(req,res){
  var user = req.body;
  user.password = md5(user.password);
  Model('User').findOne(user,function(err,doc){
    if(err){
      req.flash('error','登录失败');
      res.redirect('back');
    }else{
      if(doc){//根据用户名和加密后的密码能找到对应的用户，则表示成功
        req.flash('success','登录成功');
        req.session.user = doc;//把查出来的对象赋给session.user
        res.redirect('/');//重定向首页
      }else{
        req.flash('error','登录失败');//如果失败的话重定向上个登录页
        res.redirect('back');
      }

    }
  })
});


//退出 当用户访问此路径的时候返回一个空白表单
router.get('/logout', function(req, res, next) {
  //把session中的user对象清空就表示退出登录
   req.session.user = null;
  //然后重新定向到登录页
   res.redirect('/user/login');
});

module.exports = router;
