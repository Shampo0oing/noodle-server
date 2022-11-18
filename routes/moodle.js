var express = require("express");
const moodleapi = require("../utils/moodle-api");
const { Moodledb, Userdb } = require("../db/classes");
var router = express.Router();

//Moodle connection , cookies and more
function validateCookies(req, res, next) {
  const { cookies } = req;
  if ("noo" in cookies) {
    console.log("it exists");
    if (cookies.noo === "12345") next();
    else res.status(400).send({ msg: "not logged in" });
  } else res.status(400).send({ msg: "not logged in" });
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
  res.cookie("noo", data.username);
  res.cookie("dle", data.password);
  const key = data.key;
  const iv = data.iv;
  const student_id = req.body.noodleUser;
  console.log("saving info");
  await new Moodledb({ key, iv, student_id }).save();
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
router.post("/moodle-unlink", async function (req, res, next) {
  Userdb.findOneAndUpdate(
    { username: "Mudy" },
    { linked_moodle: true },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
});

module.exports = router;
