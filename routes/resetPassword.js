var express = require("express");
var router = express.Router();
const { Userdb, Token } = require("../db/classes");
const sendEmail = require("../utils/sendEmail");
const joi = require("joi");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

router.post("/reset", async function (req, res, next) {
  try {
    const schema = joi.object({ email: joi.string().email().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await Userdb.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(500);
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }
    console.log(user.email);
    const link = `${process.env.BASE_URL}/#/changePass/${user._id}/${token.token}`;
    await sendEmail(user.email, "Noodle password reset", link);
    res.send("password reset link sent!");
  } catch (error) {
    res.status(400).send("error occured");
    console.log("error");
  }
});
router.post("/:userId/:token", async function (req, res, next) {
  try {
    const schema = joi.object({ password: joi.string().required() });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await Userdb.findById(req.params.userId);
    if (!user) return res.status(400).send("Invalid link or expired");
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    //checking if the new password is the same as before
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword) {
      return res.status(401).send("same password");
    }
    const salt = await bcrypt.genSalt(10);
    //hashing
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    //deleting token
    await token.deleteOne();
    //removing cookies
    res.clearCookie("Noodlesession");
    res.clearCookie("NoodlesessionExpiry");
    return res.status(200).send("password reset successfully");
  } catch (error) {
    res.status(400).send("error occured");
    console.log("error");
  }
});
module.exports = router;
