var express = require('express');
var router = express.Router();


router.get('/add', function (req,res) {
    res.render('articles/add',{title:'发表文章',articles:{}});
});
router.post('/add', function (req,res) {
    var articles = req.body;
    var _id = articles._id;//得到文章的ID号
    if(_id){//如果ID有值的话表示是准备更新
        Model('Articles').update({_id:_id},{
            $set:{
                title:articles.title,
                content:articles.content
            }
        },function(err,doc){// doc是更新后的文章对象
            if(err){
                req.flash('error','更新失败');
                return res.redirect('back');
            }else{
                req.flash('success','更新成功');
                return res.redirect('/articles/detail/'+_id);
            }
        });
    }else{//如果ID没有值表示是准备保存新的文章
        //把当前登录的用户ID赋给user变量

        articles.user = req.session.user._id;
        //如果要保存的对象中有ID的话，那么mongodb不会帮你自动ID了
        //delete article._id;
        Model('Articles').create(articles,function(err,doc){
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

module.exports = router;