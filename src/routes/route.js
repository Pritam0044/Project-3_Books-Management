const express = require('express');
const router = express.Router();

///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const userController= require("../controllers/userController");
const bookController = require("../controllers/bookController")


///////////////// [ ALL API's HERE ] /////////////////
router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)
router.post('/books',bookController.createBook)

///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;