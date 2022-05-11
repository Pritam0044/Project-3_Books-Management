const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/BooksModel");
const mongoose = require("mongoose");

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
};

const updateReview = async function (req, res) {
  try {
    const { bookId, reviewId } = req.params;
    let data = req.body;
    let { review, rating, reviewedBy } = data;
    // check body is empty
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide the data" });

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

     // check the rating between 1 to 5
     if (rating <= "1" && rating >= 5)
     return res.status(400).send({
       status: false,
       message: "ratings should be minimum one and maximum five",
     });
  
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
   
    // updating the data using provideid in req body

    let update = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      {
        $set: {
          review: data.review,
          rating: data.rating,
          reviewedBy: data.reviewedBy,
        },
      },
      { new: true }
    );

    // checkBook.reviewsData = update

    return res
      .status(200)
      .send({ status: true, message: "Updated successfully", data: update });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.updateReview = updateReview;


