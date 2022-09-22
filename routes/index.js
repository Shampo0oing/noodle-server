var express = require("express");
var router = express.Router();
const { Classes } = require("../db/classes");
const moodleapi = require("../utils/moodle-api");
const { Moodledb } = require("../db/classes");

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
  if ("umo" in cookies) {
    console.log("it exists");
    if (cookies.umo === "12345") next();
    else res.status(403).send({ msg: "not logged in" });
  } else res.status(403).send({ msg: "not logged in" });
}

router.get("/protected", validateCookies, async function (req, res, next) {
  res.status(200).json({ msg: "logged" });
});

//Moodle auth
async function moodleAuth(req, res, next) {
  const user = req.query.Mus;
  const pass = req.query.Mp;
  //test
  // const data = await encrypt_test("", "");
  // const user = data.username;
  // const pass = data.password;

  //code
  const info = await moodleapi.decryption({ user, pass }).then((value) => {
    return value;
  });
  const mSession = await moodleapi.moodleLogin(info);
  if (mSession) {
    req.msession = mSession;
    console.log("we logged in");
    next();
  } else res.json({ msg: "no auth" });
}

router.get("/moodle-signin", moodleAuth, async function (req, res, next) {
  const data = await moodleapi.encrypt(req.query.Mus, req.query.Mp);
  console.log(data.username, data.password);

  res.cookie("noo", data.username);
  res.cookie("dle", data.password);
  const key = data.key;
  const iv = data.iv;
  await new Moodledb({ key, iv }).save();
  const MoodleSession = await moodleapi.getMoodle(req.msession);
  res.status(200).json({ MoodleSession });
});

module.exports = router;

router.get("/moodle-connect", async function (req, res, next) {});
