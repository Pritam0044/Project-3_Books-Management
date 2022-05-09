const express = require('express');
const router = express.Router();


///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const authorController= require("../controllers/userController");


///////////////// [ ALL API's HERE ] /////////////////
router.post('/register',userController.createUser)

router.post('/login',authorController.loginAuthor)


///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;