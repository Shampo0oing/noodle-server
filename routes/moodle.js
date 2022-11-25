var express = require("express");
const moodleapi = require("../utils/moodle-api");
const { Moodledb, Userdb } = require("../db/classes");
var router = express.Router();

//Moodle connection , cookies and more
function validateCookies(req, res, next) {
  // if this request doesn't have any cookies, that means it isn't
  // authenticated. Return an error code.
  const { noo, dle } = req.cookies;
  if (!req.cookies) {
    res.status(401).end();
  } else next();
}

router.post("/moodle-signin", async function (req, res, next) {
  // const student_id = req.body.username;
  const student_id = "mudyddd";

  const key_db = await Moodledb.findOne({
    student_id,
  });
  if (!key_db) {
    return res.json({ status: 400, msg: "no account linked" });
  }

  const info = await moodleapi.getInfo(key_db.user, key_db.pass);
  const moodle = await moodleapi.moodleLogin(
    info.decryptedUser,
    info.decryptedPassword
  );
  console.log(moodle);
  res.json({ status: 200, moodle });
});

//Moodle auth
async function moodleAuth(req, res, next) {
  const body = req.body;
  const user = body.username;
  const pass = body.password;
  console.log(user, pass);

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
  } else res.status(400).json({ status: 400 });
}

router.post("/moodle-link", moodleAuth, async function (req, res, next) {
  const data = await moodleapi.encrypt(req.body.username, req.body.password);
  const student_id = req.body.noodleUser;
  console.log(data);
  await new Moodledb({
    user: data.EncryptedUser,
    pass: data.EncryptedPass,
    student_id,
  }).save();
  Userdb.findOneAndUpdate(
    { username: student_id },
    { linked_moodle: true },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
  // const MoodleSession = await moodleapi.getMoodle(req.msession);
  res.status(200).json({ status: 200 });
});
router.post("/moodle-unlink", async function (req, res, next) {
  const user = req.body.noodleUser;
  //deleting from db
  Moodledb.findOneAndDelete({ student_id: user }, function (err, doc) {
    if (err) return res.status(500).json({ error: "error in saving session" });
  });
  //setting moodle to unlinked
  Userdb.findOneAndUpdate(
    { username: user },
    { linked_moodle: false },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
  return res.status(200).json({ status: 200 });
});

module.exports = router;
