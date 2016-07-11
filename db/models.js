//编写schema 数据库的集合骨架
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
module.exports = {
    User:{
        username:{type:String,required:true},
        password:{type:String,required:true},
        email:{type:String,required:true},
        avatar:{type:String,required:true}
    },
    Article:{
        user:{type:ObjectId,ref:'User'},
        title:{type:String,required:true},
        content:{type:String,required:true},
        createAt:{type:Date,default:Date.now()},
        pv:{type:Number,default:0}

    }
}