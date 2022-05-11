const express = require('express');
const router = express.Router();

///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const userController= require("../controllers/userController");
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")


///////////////// [ ALL API's HERE ] /////////////////
router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)
router.post('/books',bookController.createBook)
router.get ('/books',bookController.getBook)
router.get ('/books/:bookId',bookController.getBookByPathParam)
router.put('/books/:bookId',bookController.updateBook)
router.delete("/books/:bookId",bookController.delBook)

router.post("/books/:bookId/review",reviewController.createReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReviews)

///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;