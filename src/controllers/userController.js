const userModel = require("../models/userModel");

const createUser = async function (req, res) {
  try {
    const data = req.body;
    const { title, name, phone, email, password } = data


    if (!title) { return res.status(400).send({ status: false, message: "Please provide title" }) }
    if (!/^(Miss|Mr|Mrs)$/.test(title)) { return res.status(400).send({ status: false, message: "Please enter correct title." }) }

    if (!name) { return res.status(400).send({ status: false, message: "Please provide name" }) }
    if (!/^(\w+)( )(\w+)*(( )(\w+))?$/.test(name)) { return res.status(400).send({ status: false, message: "Please enter correct name." }) }

    if (!phone) { return res.status(400).send({ status: false, message: "Please provide phone" }) }
    if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)) { return res.status(400).send({ status: false, message: "Please enter correct phone Number." }) }
    const duplicatephone = await userModel.findOne({ phone: phone, isDeleted: false })
    if (duplicatephone) { return res.status(409).send({ status: false, message: "User with this phone already exist" }) }

    if (!email) { return res.status(400).send({ status: false, message: "Please provide email" }) }
    if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) { return res.status(400).send({ status: false, message: "Please enter correct email." }) }
    const duplicateEmail = await userModel.findOne({ email: email, isDeleted: false })
    if (duplicateEmail) { return res.status(409).send({ status: false, message: "User with this email already exist" }) }

    if (!password) { return res.status(400).send({ status: false, message: "Please provide password" }) }
    if (password.trim().length < 8) { return res.status(400).send({ status: false, message: "Password must be eight character long." }); }
    if (password.trim().length > 15) { return res.status(400).send({ status: false, message: "Password must be fifteen character long." }); }


    const savedData = await userModel.create(data);
    res.status(201).send({ status: true, message: "user successfully created", data: savedData });
  }
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
};


const loginUser = async function (req, res) {
  try {
    const data = req.body
    const { email, password } = data
    if (!email) return res.status(400).send({ status: false, message: "email is missing" })
    if (!password) return res.status(400).send({ status: false, message: "password is missing" })

    const findUser = await userModel.findOne({ email: email, password: password, isDeleted: false })

    if (!findUser) return res.status(404).send({ Status: false, message: " user does not exists" })

    const token = jwt.sign({ userId: findUser._id.toString() }, "Books Management", { expiresIn: "1d" })

    res.setHeader("project-3-token", token)
    res.status(201).send({ Status: true, Token: token })

  } catch (error) {

    res.status(500).send({ status: false, message: error.message })

  }
}



module.exports.loginUser = loginUser

module.exports.createUser = createUser