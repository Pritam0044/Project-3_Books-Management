const mongoose = require("mongoose");
const bookModel = require("../models/BooksModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");

const isValidObjectId = function(ObjectId)  {
    return mongoose.Types.ObjectId.isValid(ObjectId);
  };

const createBook = async function(req,res) {
  try{
      let data = req.body;
      
      if (Object.keys(data).length==0) return res.status(400).send({status:false, message:"Please provide data"})

      let {title,excerpt,userId,ISBN,category,subcategory,releasedAt} = data      // destructuring the data variable

      if(!title) return res.status(400).send({status:false, message:"please provide title"})    //checking title
      let checkTitle = await bookModel.findOne({title:title, isDeleated:false})
      if(checkTitle) return res.status(409).send({status:false, message:"Book alredy exist with this title"}) 

      if(!excerpt) return res.status(400).send({status:false, message:"please provide excerpt"})    //checking excerpt

      if(!userId) return res.status(400).send({status:false, message:"please provide userId"})    //checking userId
      if(!isValidObjectId(userId)) {return res.status(400).send({ status: false, message: "please provide valid userId" })}
      let validUserId = await userModel.findOne({_id:userId, isDeleated:false})
      if(!validUserId) return res.status(404).send({status:false, message:"no user exist in database"})

      if(!ISBN) return res.status(400).send({status:false, message:"please provide ISBN"})    //checking ISBN
      const ISBNregex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
      if(!ISBNregex.test(ISBN)) return res.status(404).send ({status:false, message:"please provide valid ISBN"})
      let checkISBN = await bookModel.findOne({ISBN:ISBN, isDeleated:false})
      if(checkISBN) return res.status(409).send({status:false, message:"Book alredy exist with this ISBN"}) 

      if(!category) return res.status(400).send({status:false, message:"please provide category"})    //checking category
      
      if(!subcategory) return res.status(400).send({status:false, message:"please provide subcategory"})    //checking subcategory

      if(!releasedAt) return res.status(400).send({status:false, message:"please provide releasedAt"})    //checking releasedAt
      const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
      if(!dateRegex.test(releasedAt)) {return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format only And a "Valid Date"`})}

      let saveData = await bookModel.create(data)
      return res.status(201).send({status:true, message:"book created succesfully", data:saveData})
    }
    catch(err){return res.status(500).send({ status:false,message:err.message })}
  }

//get API for book with Query param//

const getBook = async function (req, res) {
  try {
    const queryDetails = req.query;

    if (Object.keys(queryDetails).length == 0) {
      const bookFetched = await bookModel.find({ isDeleted: false }).select({ISBN: 0,subcategory: 0,isDeleted: 0,createdAt: 0,updatedAt: 0,__v: 0,}).sort({ title: 1 });
      if (bookFetched.length == 0) return res.status(404).send({ status: false, message: "No book found" });
      if (bookFetched.length != 0) return res.status(200).send({ status: true, message: "Book List", data: bookFetched });
    }
    

    //Adding new key in queryDetails object//
    queryDetails.isDeleted = false;

    //// check validaion of userId///////////
    const userId = queryDetails.userId;
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {return res.status(400).send({ status: false, message: "Provide valid userId" });}
    }

    //finding books which satisfies the given queries//
    const specificBooks = await bookModel.find(queryDetails).select({ISBN: 0,subcategory: 0,isDeleted: 0,createdAt: 0,updatedAt: 0,__v: 0,}).sort({ title: 1 });

    if (specificBooks.length == 0) return res.status(404).send({ status: false, message: "No books found with given queries" });

    if (specificBooks.length != 0)return res.status(200).send({ status: true, message: "Book List", data: specificBooks });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//get API for book with Path param//

const getBookByPathParam = async function (req, res) {
  try {
    const bookId = req.params.bookId;

    if (!bookId) return res.status(400).send({ status: false, message: "bookId is required in path param" });

    if (bookId) {
      if (!mongoose.Types.ObjectId.isValid(bookId)) {return res.status(400).send({ status: false, message: "Provide valid bookId" });}
    }

    const bookRequested = await bookModel.findById(bookId);

    if (!bookRequested) return res.status(404).send({ status: false, message: "no book with this id found" });

    const reviewsForBook = await reviewModel.find({ bookId: bookId });

    const isDeleted = bookRequested.isDeleted

    if (isDeleted == false) {
      const newdata = {...bookRequested._doc,reviewData: reviewsForBook};
      return res.status(200).send({ status: true, message: "Success", data: newdata });
    }

    if (isDeleted == true) {
      const newdata = {...bookRequested._doc,reviewData: reviewsForBook};
      return res.status(200).send({ status: true, message: "Success", data: newdata });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// update book by put API //
const updateBook = async function (req,res){
  try{
      const paramData = req.params.bookId
    
      const {title, excerpt, releaseDate, ISBN}= req.body;

      let bookFromDb = await bookModel.findById(paramData)

      if (!bookFromDb){return res.status(404).send({status:false,message:"Book doesn't exist."})}

      if(!title || !excerpt || !releaseDate || !ISBN ){return res.status(400).send({status:false,message:"please enter full details to update book"})}
      if (!/^([0-9]{3})-?(([0-9]{10})?([0-9-]+)?)$/.test(ISBN)){ return res.status(400).send({status:false, message:"Please enter correct ISBN."})}
     
      let dbData = await bookModel.find({$and:[{title:title,ISBN:ISBN, isDeleted:false}]})
      if(dbData.length != 0){return res.status(409).send({status:false,msg:"Title and ISBN should be unique, hence can't update."})}

      let bookData = await bookModel.findOneAndUpdate({_id:paramData, isDeleted:false},{title:title, excerpt:excerpt,releasedAt:releaseDate,ISBN:ISBN},{new:true})

      res.status(200).send({status:true,message:"details updated",data:bookData})
  }
  catch(error){ res.status(500).send({status:false, message:error.message})}
}


// delete book by delete API //
const delBook = async function (req, res) {

  try {

    const bookId = req.params.bookId

    const checkBook = await bookModel.findOne({ _id: bookId, isDeleted: true })

    if (checkBook) return res.status(404).send({ status: false, message: "this book has already been deleted" })

    const findBook = await bookModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, { $set: { isDeleted: true ,deletedAt: new Date()} })

    return res.status(200).send({ status: true, message: "this book is deleted now " })

  } 
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}




module.exports.createBook = createBook
module.exports.getBook = getBook;
module.exports.getBookByPathParam = getBookByPathParam;
module.exports.updateBook = updateBook
module.exports.delBook = delBook