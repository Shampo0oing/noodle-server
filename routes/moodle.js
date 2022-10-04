var express = require("express");
const moodleapi = require("../utils/moodle-api");
const { Moodledb } = require("../db/classes");
var router = express.Router();

//Moodle connection , cookies and more
function validateCookies(req, res, next) {
  const { cookies } = req;
  if ("noo" in cookies) {
    console.log("it exists");
    if (cookies.noo === "12345") next();
    else res.status(403).send({ msg: "not logged in" });
  } else res.status(403).send({ msg: "not logged in" });
}

router.post(
  "/moodle-signin",
  validateCookies,
  async function (req, res, next) {}
);

//Moodle auth
async function moodleAuth(req, res, next) {
  const body = req.body;
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

  const mSession = await moodleapi.moodleLogin(user, pass);
  if (mSession) {
    req.msession = mSession;
    console.log("we logged in");
    next();
  } else res.json({ msg: "no auth" });
}

router.post("/moodle-link", moodleAuth, async function (req, res, next) {
  const data = await moodleapi.encrypt(req.body.username, req.body.password);
  console.log(data.username, data.password);

  res.cookie("noo", data.username);
  res.cookie("dle", data.password);
  const key = data.key;
  const iv = data.iv;
  const id = req.body.id;
  await new Moodledb({ key, iv, id }).save();
  const MoodleSession = await moodleapi.getMoodle(req.msession);
  res.status(200).json({ MoodleSession });
});

module.exports = router;
