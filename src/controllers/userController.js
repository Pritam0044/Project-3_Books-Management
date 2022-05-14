const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const createUser = async function (req, res) {
  try {
    const data = req.body;
    const { title, name, phone, email, password, address } = data; // destructuring of data object

    // Checking if title is sent through body and it is valid or not//
    if (title) {
      if (!/^(Miss|Mr|Mrs)$/.test(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter correct title." });
    }}
    else{
      return res
        .status(400)
        .send({ status: false, message: "Please provide title" });
    }

    
    

    // Checking if name is sent through body or not//
    if (name) {
          // Checking if name is correct name or not i.e. no digit allowed//
      if (!/^(([a-zA-Z]+)*([\.])*([\s]))?(([a-zA-Z]+)([\s])([a-zA-Z]+))*$/.test(name)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter correct name." });
    }}
    else{
      return res
        .status(400)
        .send({ status: false, message: "Please provide name" });
    }

    
 

    // Checking if phone is sent through body or not//
    if (phone) { 
      if (!/^[6-9]\d{9}$/.test(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter correct phone Number." });
    }}

    else{

      return res
        .status(400)
        .send({ status: false, message: "Please provide phone" });
    }
    
    // Checking if user with this phone number already exist in database//
    const duplicatephone = await userModel.findOne({
      phone: phone,
      isDeleted: false,
    });
    if (duplicatephone) {
      return res
        .status(409)
        .send({ status: false, message: "User with this phone already exist" });
    }

    // Checking if email is sent through body or not//
    if (email) { 
          // Checking if email is valid or not //
      if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter correct email." });
    }}
    else{
      return res
        .status(400)
        .send({ status: false, message: "Please provide email" });
    }

    
   

    // Checking if user with this email already exist in database//
    const duplicateEmail = await userModel.findOne({
      email: email,
      isDeleted: false,
    });
    if (duplicateEmail) {
      return res
        .status(409)
        .send({ status: false, message: "User with this email already exist" });
    }

    // Checking if password is sent through body or not//
    if (password) {
            // checking password with regex //
       if (!/^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/.test(password)) { return res.status(400).send({ status: false, message: "Please provide a valid password between 8 to 15 character length." }) }}
    else{
      return res
        .status(400)
        .send({ status: false, message: "Please provide password" });
    }



    
   
    
    if (address){
      if(!address.street || !address.city || !address.pincode){return res.status(400).send({status:false, message:"Please provide full address."})}
    }
      else {return res.status(400).send(({status:false, message:"Please provide address."}))}
  
    // creation of new document in db//
    // const userCreated = await userModel.create(data);
    res.status(201).send({
      status: true,
      message: "Success",
      data: "userCreated",
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


/////////////////  User Login   //////////////////
const loginUser = async function (req, res) {
  try {
    const data = req.body;
    const { email, password } = data;

    // Checking if email is sent through body or not//
    if (email){  if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter correct email." });
    }}
    else
      {return res
        .status(400)
        .send({ status: false, message: "email is missing" });}

    // Checking if email is valid or not //
  

    // Checking if password is sent through body or not//
    if (password){
        // checking password with regex //
    if (!/^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/.test(password)) { 
      return res.status(400).send({ status: false, message: "Please provide a valid password between 8 to 15 character length." }) 
    }
    }else{
      return res
        .status(400)
        .send({ status: false, message: "password is missing" });}

        
    
    
    //finding a user in db with above credentials//
    const findUser = await userModel.findOne({
      email: email,
      password: password,
      isDeleted: false,
    });

    if (!findUser)
      return res
        .status(404)
        .send({ Status: false, message: " user does not exists" });

    const token = jwt.sign(
      { userId:findUser._id.toString() },
      "Books Management",
      { expiresIn: "1d" }
    );
 
    return res
      .status(201)
      .send({ Status: true, message: "Success", data: token });
  }
   catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.loginUser = loginUser;
module.exports.createUser = createUser;
