var express = require("express");
var router = express.Router();
const { Classes, Userdb} = require("../db/classes");
const moodleapi = require("../utils/moodle-api");
const { Moodledb } = require("../db/classes");
const bcrypt = require("bcrypt");

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* GET users listing. */
router.get("/classes", async function (req, res, next) {
  const classes = await Classes.find();
  res.json(classes);
});

//Moodle connection , cookies and more
function validateCookies(req, res, next) {
  const { cookies } = req;
  if ("noo" in cookies) {
    console.log("it exists");
    if (cookies.noo === "12345") next();
    else res.status(403).send({ msg: "not logged in" });
  } else res.status(403).send({ msg: "not logged in" });
}

router.post("/moodle-signin", validateCookies, async function (req, res, next) {

});

//Moodle auth
async function moodleAuth(req, res, next) {
  const body = req.body
  const user = body.username;
  const pass = body.password;
  //test
  // const data = await encrypt_test("", "");
  // const user = data.username;
  // const pass = data.password;
  //code
  // const info = await moodleapi.decryption({ user, pass }).then((value) => {
  //   return value;
  // });

  const mSession = await moodleapi.moodleLogin(user,pass);
  if (mSession) {
    req.msession = mSession;
    console.log("we logged in");
    next();
  } else res.json({ msg: "no auth" });
}

router.post("/moodle-link", moodleAuth, async function (req, res, next) {
  const data = await moodleapi.encrypt(req.query.Mus, req.query.Mp);
  console.log(data.username, data.password);

  res.cookie("noo", data.username);
  res.cookie("dle", data.password);
  const key = data.key;
  const iv = data.iv;
  const id = req.body.id;
  await new Moodledb({ key, iv, id}).save();
  const MoodleSession = await moodleapi.getMoodle(req.msession);
  res.status(200).json({ MoodleSession });
});

async function verifyCreateAccount(req,res,next){
  const body = req.body;
  if(!Userdb.findOne().select({username: body.username})){
    console.log("username exists");
    res.status(400).json({msg:"username already exists"});
    return;
  }
  if(!Userdb.findOne().select({email: body.email})){
    console.log("email exists");
    res.status(400).json({msg:"email already exists"});
    return;
  }
  next();
}
router.post("/sign-up", verifyCreateAccount, async function (req, res, next) {
  const user = new Userdb(req.body)
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(data.password, salt);
  user.save().then((doc) => res.status(201).send(doc));

});

router.post("/login", async function (req, res, next) {
  const body = req.body;
  const user = await Userdb.findOne({ email: body.email });
  if (user) {
    // check user password with hashed password stored in the database
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      res.status(200).json({ message: "Valid password" });
    } else {
      res.status(400).json({ error: "Invalid Password" });
    }
  } else {
    res.status(401).json({ error: "User does not exist" });
  }
});




module.exports = router;
