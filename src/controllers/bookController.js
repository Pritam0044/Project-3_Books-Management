const mongoose = require("mongoose");
const bookModel = require("../models/BooksModel");
const userModel = require("../models/userModel");

const isValidObjectId = function(ObjectId)  {
    return mongoose.Types.ObjectId.isValid(ObjectId);
  };

const createBook = async function(req,res) {
    try{
let data = req.body;
  
if (Object.keys(data).length==0) return res.status(400).send({status:false, message:"please provide data"})

  let {title,excerpt,userId,ISBN,category,subcategory,releasedAt} = data
  if(!title) return res.status(400).send({status:false, message:"please provide title"})
  let checkTitle = await bookModel.findOne({title:title, isDeleated:false})
  if(checkTitle) return res.status(409).send({status:false, message:"user alredy exist with this title"}) 

  if(!excerpt) return res.status(400).send({status:false, message:"please provide excerpt"})
  if(!userId) return res.status(400).send({status:false, message:"please provide userId"})
  if(!isValidObjectId(userId)) {
    return res.status(400).send({ status: false, message: "please provide valid userId" })}
let validUserId = await userModel.findOne({_id:userId, isDeleated:false})
if(!validUserId) return res.status(404).send({status:false, message:"no user exist in database"})
  if(!ISBN) return res.status(400).send({status:false, message:"please provide ISBN"})
  const ISBNregex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
if(!ISBNregex.test(ISBN)) return res.status(404).send ({status:false, message:"please provide valid ISBN"})
let checkISBN = await bookModel.findOne({ISBN:ISBN, isDeleated:false})
if(checkISBN) return res.status(409).send({status:false, message:"user alredy exist with this ISBN"}) 

  if(!category) return res.status(400).send({status:false, message:"please provide category"})
  if(!subcategory) return res.status(400).send({status:false, message:"please provide subcategory"})
  if(!releasedAt) return res.status(400).send({status:false, message:"please provide releasedAt"})
  const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
  if(!dateRegex.test(releasedAt)) {
    return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format only And a "Valid Date"`})
}

   let saveData = await bookModel.create(data)
   return res.status(201).send({status:true, message:"book created succesfully", data:saveData})
}
catch(err){
return res.status(500).send({ status:false,message:err.message })
}
}


const updateBook = async function (req,res){
  try{
      const paramData = req.params.bookId
    
      const {title, excerpt, releaseDate, ISBN}= req.body;
      let bookFromDb = await bookModel.findById(paramData)
      if (!bookFromDb){return res.status(404).send({status:false,message:"Book doesn't exist."})}
      if(!title || !excerpt || !releaseDate || !ISBN ){return res.status(400).send({status:false,message:"please enter full details to update book"})}
     
      
      let dbData = await bookModel.findOne({title:title,ISBN:ISBN, isDeleted:false})
      if(dbData.length != 0){return res.status(409).send({status:false,msg:"Title and ISBN should be unique, hence can't update."})}
      let bookData = await bookModel.findOneAndUpdate({_id:paramData, isDeleted:false},{title:title, excerpt:excerpt,releasedAt:releaseDate,ISBN:ISBN},{new:true})

      res.status(201).send({status:true,message:"details updated",data:bookData})
  }
  catch(error){ res.status(500).send({status:false, message:error.message})}
}

module.exports.createBook = createBook
module.exports.updateBook = updateBook