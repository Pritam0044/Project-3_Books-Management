const mongoose = require("mongoose")
ObjectId = mongoose.Schema.Types.ObjectId
const bookSchema = new mongoose.Schema(
{ 
    title: {type:String, required:"title is required", unique:true},
    excerpt: {type:String, required:"excerpt is required"}, 
    userId: {type:ObjectId, required:"userId is required", ref:"User"},
    ISBN: {type:String, required:"ISBN is required", unique:true},
    category: {type:String, required:"category is required"},
    subcategory: {type:[String], required:"subcategory is required"},
    reviews: {type:Number, default: 0, comment:" Holds number of reviews of this book"},
    deletedAt: {Date}, 
    isDeleted: {type:Boolean, default: false},
    releasedAt: {required:"releasedAt is required",date:{
        type:String,
        format:Date
    }},
  },
  {timestamps:true})

  module.exports = mongoose.model("Book", bookSchema) //books