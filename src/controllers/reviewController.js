const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/BooksModel");
const mongoose = require("mongoose");

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};
////////////////////////////////////Create API ///////////////////////////

const createReview = async function (req, res) {

  try {

         const bookId = req.params.bookId
         if (!mongoose.Types.ObjectId.isValid(bookId)) {
          return res
            .status(400)
            .send({ status: false, message: "Provide valid bookId" });
          
        }
          const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
          if (!book) return res.status(404).send({ status: false, message: "no book found" })

          const reviewDetail = req.body
          const { reviewedBy, reviewedAt, rating,review } = reviewDetail
          if (!reviewedBy || !reviewedAt || !rating ) return res.status(400).send({ status: false, message: `Full review Detail is required` })

          const reviewDetail1 = { reviewedBy, rating, bookId,review, reviewedAt: new Date() }

          const reviewUpdate = await reviewModel.create(reviewDetail1)
          const reviewUpdate1 = await reviewModel.find(reviewDetail1).select(["-createdAt","-updatedAt","-__v","-isDeleted"])
          // increment by 1 is added every time in reviews
          
           const bookId1 = reviewUpdate.bookId
          const finalUpdate = await bookModel.find({_id:bookId1,}).updateOne({ $inc: {reviews: +1} })  // this phase is also working

          // increment 1 and save book
          // if (reviewUpdate1) {
          //     const countReviews = book.reviews + 1;
          //     book.reviews = countReviews
          //     book.save();
          // }                              // this phase is also working
  
          res.status(200).send({status: true, data: reviewUpdate1 })  
      
      } catch (error) {
          res.status(500).send({ status: false, error: error.message })
      }
  }



////////////////////////////////////Update API ///////////////////////////
const updateReview = async function (req, res) {
  try {
    const { bookId, reviewId } = req.params;

    // Validation starts
    if (!isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "this is not a valid bookId" });
    }

    // Validation starts
    if (!isValidObjectId(reviewId)) {
      return res
        .status(400)
        .send({ status: false, message: "this is not a valid reviewId" });
    }

    //check the path param bookid in bookmodel
    const checkBook = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!checkBook)
      return res
        .status(400)
        .send({ status: false, message: "book is not exist" });

    // check the path param review id in review model
    const checkReview = await reviewModel.findOne({
      _id: reviewId,
      bookId: bookId,
      isDeleted: false,
    });
    if (!checkReview)
      return res
        .status(400)
        .send({ status: false, message: "review is not exist" });
 // check body is empty
    let data = req.body;
    let { review, rating, reviewedBy } = data;
   
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide the data" });

    // check the rating between 1 to 5

    if (!((rating > 0) && ( rating < 6)))
      return res.status(400).send({
        status: false,
        message: "ratings should be minimum one and maximum five",
      });

    // updating the data using provideid in req body

    let update = await reviewModel.findByIdAndUpdate({ _id: reviewId },data).select({__v:0,isDeleted:0,createdAt:0,updatedAt:0})
    let bookData = await bookModel.findById(bookId).select({__v:0,ISBN:0})
    bookData._doc.reviewData = update

    return res
      .status(200)
      .send({ status: true, message: "success", data: bookData });


  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};




/////////////////  Delete API  ///////////////////
const deleteReviews = async function (req,res){
  try{
      let {bookId,reviewId} = req.params
     
      if(!mongoose.isValidObjectId(bookId) || !mongoose.isValidObjectId(reviewId)){return res.status(400).send({status:false, message:"Please enter valid Ids"})}

      const bookData = await reviewModel.find({bookId:bookId})
      const reviewData = await reviewModel.findById(reviewId)
      
      if (bookData.length == 0){return res.status(404).send({status:false, message:"Book doesn't exist."})}
      if(!reviewData){return res.status(404).send({status:false,message:"Book review doesn't exist."})}

      const dataDeleted = await reviewModel.findById(reviewId).select({isDeleted:true,_id:false})

      if (dataDeleted.isDeleted == true){return res.status(400).send({status:false,message:"The requested review has already been deleted."})}

      await reviewModel.findOneAndUpdate({_id:reviewId},{$set:{isDeleted:true}})

      res.status(200).send({status:true,message:"Success", data:"Requested review has been successfully deleted."})
  }
  catch(error){ res.status(500).send({status:false, message:error.message})}
}

module.exports.createReview = createReview;

module.exports.updateReview = updateReview;

module.exports.deleteReviews = deleteReviews;



