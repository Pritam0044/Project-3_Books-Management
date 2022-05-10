const bookModel = require("../models/BooksModel")
const userModel = require("../models/userModel")

const createBook = async function(req,res) {
    try{
let data = req.body;
  
  let {title,excerpt,userId,ISBN,category,subcategory,releasedAt} = data
  if(!title) return res.status(400).send({status:false, message:"please provide title"})
  if(!excerpt) return res.status(400).send({status:false, message:"please provide excerpt"})
  if(!userId) return res.status(400).send({status:false, message:"please provide userId"})
  if(!ISBN) return res.status(400).send({status:false, message:"please provide ISBN"})
  if(!category) return res.status(400).send({status:false, message:"please provide category"})
  if(!subcategory) return res.status(400).send({status:false, message:"please provide subcategory"})
  if(!releasedAt) return res.status(400).send({status:false, message:"please provide releasedAt"})

   let checkTitle = await bookModel.findOne({title:title, isDeleated:false})
   if(checkTitle) return res.status(409).send({status:false, message:"user alredy exist with this title"}) 

   let checkISBN = await bookModel.findOne({ISBN:ISBN, isDeleated:false})
   if(checkISBN) return res.status(409).send({status:false, message:"user alredy exist with this ISBN"}) 

   let validUserId = await userModel.findOne({userId:_id, isDeleated:false})
   if(!validUserId) return res.status(404).send({status:false, message:"no user exist in database"})
   
   let saveData = await bookModel.create(data)
   return res.status(201).send({status:true, message:"book created succesfully", data:saveData})
}
catch(err){
return res.status(500).send({ status:false,message:err.message })
}
}

module.exports.createBook = createBook