const mongoose = require("mongoose");
const BooksModel = require("../models/BooksModel");
const reviewModel = require('../models/reviewModel');

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

module.exports.deleteReviews = deleteReviews;