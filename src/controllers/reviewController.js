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

// Update API
const updateBook = async function (req, res) {
  try {
    const bookId = req.params.bookId;

    const { title, excerpt, releaseDate, ISBN } = req.body;

    if (!title || !excerpt || !releaseDate || !ISBN) {
      return res.status(400).send({
        status: false,
        message: "please enter full details to update book",
      });
    }

    const dbData = await bookModel.find({
      $and: [{ title: title, ISBN: ISBN, isDeleted: false }],
    });
    if (dbData.length != 0) {
      return res.status(409).send({
        status: false,
        msg: "Title and ISBN should be unique, hence can't update.",
      });
    }
    const bookData = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { title: title, excerpt: excerpt, releasedAt: releaseDate, ISBN: ISBN },
      { new: true }
    );

    res
      .status(201)
      .send({ status: true, message: "details updated", data: bookData });
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

    const bookData = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    const reviewData = await reviewModel.findOne({
      _id: reviewId,
      isDeleted: false,
    });

    if (!bookData) {
      return res
        .status(404)
        .send({ status: false, message: "Book doesn't exist." });
    }
    if (!reviewData) {
      return res
        .status(404)
        .send({ status: false, message: "Book review doesn't exist." });
    }

    await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { isDeleted: true } 
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



