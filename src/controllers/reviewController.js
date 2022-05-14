const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/BooksModel");
const mongoose = require("mongoose");

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};
////////////////////////////////////Create API ///////////////////////////

const createReview = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    if (!isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "Provide valid bookId" });
    }
    const book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book)
      return res.status(404).send({ status: false, message: "no book found" });

    const reviewDetail = req.body;
    const { reviewedBy, rating, review } = reviewDetail;
    if (!reviewedBy || !rating)
      return res
        .status(400)
        .send({ status: false, message: `Full review Detail is required` });

    if (!((rating > 0) && ( rating < 6)))
      return res.status(400).send({
        status: false,
        message: "ratings should be minimum one and maximum five",
      });    

    const reviewDetail1 = {
      reviewedBy,
      rating,
      bookId,
      review,
      reviewedAt: new Date(),
    };

    const reviewUpdate = await reviewModel.create(reviewDetail1);
    const reviewUpdate1 = await reviewModel
      .find({bookId:bookId,isDeleted:false})
      .select(["-createdAt", "-updatedAt", "-__v", "-isDeleted"]);
    // increment by 1 is added every time in reviews


    const finalUpdate = await bookModel
      .find({ _id: bookId })
      .updateOne({ $inc: { reviews: +1 } }); 

      const bookData = await bookModel.findById(bookId).select({__v:0,ISBN:0})
      bookData._doc.reviewData = reviewUpdate1


    res.status(201).send({ status: true, data: bookData });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};



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
        .status(404)
        .send({ status: false, message: "book is not exist" });

    // check the path param review id in review model
    const checkReview = await reviewModel.findOne({
      _id: reviewId,
      bookId: bookId,
      isDeleted: false,
    });
    if (!checkReview)
      return res
        .status(404)
        .send({ status: false, message: "review is not exist" });
 // check body is empty
    const data = req.body;
    const { rating, reviewedBy } = data;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({
          status: false,
          message: "please provide the review data to update",
        });

    if (!rating)
      return res
        .status(400)
        .send({ status: false, message: "please provide rating " });
    if (!reviewedBy)
      return res
        .status(400)
        .send({ status: false, message: "please provide reviewedBy " });

    

    // check the rating between 1 to 5

    if (!(rating > 0 && rating < 6))
      return res.status(400).send({
        status: false,
        message: "ratings should be minimum 1 and maximum 5",
      });

    // updating the data using provideid in req body

    let update = await reviewModel
      .findByIdAndUpdate({ _id: reviewId }, data, { new: true })
      .select({ __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 });
    let bookData = await bookModel.findById(bookId).select({ __v: 0, ISBN: 0 });
    bookData._doc.reviewData = update;

    return res
      .status(200)
      .send({ status: true, message: "Success", data: bookData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

/////////////////  Delete API  ///////////////////
const deleteReviews = async function (req,res){
  try {
    const { bookId, reviewId } = req.params;

    if ( ! isValidObjectId(bookId) ||! isValidObjectId(reviewId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid Ids" });
    }

    const bookData = await bookModel.find({ bookId: bookId, isDeleted:false });
    const reviewData = await reviewModel.findById(reviewId);
    if (bookData.length == 0) {
      return res
        .status(404)
        .send({ status: false, message: "Book doesn't exist." });
    }
    if (!reviewData) {
      return res
        .status(404)
        .send({ status: false, message: "Book review doesn't exist." });
    }
    if (reviewData.isDeleted == true) {
      return res
        .status(400)
        .send({
          status: false,
          message: "The requested review has already been deleted.",
        });
    }

    await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { $set: { isDeleted: true } }
    );
    await bookModel.find({ _id: bookId }).updateOne({ $inc: { reviews: -1 } });
    res
      .status(200)
      .send({
        status: true,
        message: "Success",
        data: "Requested review has been successfully deleted.",
      });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createReview = createReview;
module.exports.updateReview = updateReview;
module.exports.deleteReviews = deleteReviews;
