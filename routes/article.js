var express = require('express');
var async = require('async');
//路由工厂生成一个路由实例
var router = express.Router();

router.get('/list',function(req,res){
    var keyword = req.query.keyword;
    var pageNum = req.query.pageNum?Number(req.query.pageNum):1;//当前页码 默认值为第一页
    var pageSize = req.query.pageSize?Number(req.query.pageSize):2;//每页条数 默认值为每页2条
    var query = {};
    if(keyword){
        //查询标题符合此正则的文档
        query.title = new RegExp(keyword);
    }
    //populate可以传一个属性进去
    //负责把一个属性从对象ID类型转成一个文档对象
    //用来统计每页的条数
    Model('Article').find(query).count(function(err,count){
        Model('Article').find(query).skip((pageNum-1)*pageSize).limit(pageSize).populate('user').exec(function(err,docs){
            res.render('article/list', {
                title: '文章列表',
                articles:docs,//当前页的记录
                pageNum:pageNum,//当前页码
                pageSize:pageSize,//每页条数
                keyword:keyword,//关键字
                totalPage:Math.ceil(count/pageSize)//一共多少页
            });
        });
    });
});

router.get('/add',function(req,res){
    res.render('article/add',{title:'发表文章',article:{}});
});

router.post('/add',function(req,res){
    //请求体转成对象放在req.body上
    var article = req.body;
    var _id = article._id;//得到文章的ID号
    if(_id){//如果ID有值的话表示是准备更新
       Model('Article').update({_id:_id},{
           $set:{
               title:article.title,
               content:article.content
           }
       },function(err,doc){// doc是更新后的文章对象
         if(err){
             req.flash('error','更新失败');
             return res.redirect('back');
         }else{
             req.flash('success','更新成功');
             return res.redirect('/article/detail/'+_id);
         }
       });
    }else{//如果ID没有值表示是准备保存新的文章
        //把当前登录的用户ID赋给user变量

        article.user = req.session.user._id;
        //如果要保存的对象中有ID的话，那么mongodb不会帮你自动ID了
        //delete article._id;
        Model('Article').create(article,function(err,doc){
            if(err){
                req.flash('error','发表文章失败');
                return res.redirect('back');
            }else{
                req.flash('success','发表文章成功');
                return res.redirect('/');
            }
        });
    }

});

//路径参数 把参数放在路径里面
router.get('/detail/:_id',function(req,res){
    //从路径参数中获取ID
    var _id = req.params._id;
    async.parallel([
        function(cb){
            //inc 把原来的值增加1
            Model('Article').update({_id:_id},{$inc:{pv:1}},function(err,result){
                cb();
            })
        },
        function(cb){
            //按照ID查询文章的对象
            Model('Article').findById(_id,function(err,doc){
                cb(err,doc);
            })
        }
    ],function(err,result){
        if(err){
            req.flash('error','查看详情失败');
            res.redirect('back');
        }else{
            req.flash('success','查看详情成功');
            //渲染详情页的模板
            res.render('article/detail',{title:'文章详情',article:result[1]});
        }
    });

});

router.get('/delete/:_id',function(req,res){
    var _id = req.params._id;//得到路径中的ID
    Model('Article').remove({_id:_id},function(err,result){
        if(err){//删除失败了
            req.flash('error','删除失败');
            return res.redirect('back');
        }else{
            req.flash('success','删除成功');
            return res.redirect('/');//跳转到首页
        }
    });
});

router.get('/update/:_id',function(req,res){
  var _id = req.params._id;//得到路径中的ID
  //根据ID查询文章详情
  Model('Article').findById(_id,function(err,doc){
      if(err){
          req.flash('error','更新出错');
          return res.redirect('back');
      }else{
          //req.flash('success','更新成功');
          res.render('article/add',{
              title:'更新文章',
              article:doc
          });
      }
  })
});
module.exports = router;


