var express = require("express");
var router = express.Router();
const writeClasses = require("../utils/db-writeclass");
const { Userdb } = require("../db/classes");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const { Session, createSession } = require("../utils/user");

/* GET users listing. */
router.post("/verifyUsername", async function (req, res, next) {
  const body = req.body;
  if (await Userdb.exists({ username: body.username })) {
    console.log("username exists 23045");
    res.status(200).json({ msg: false });
  } else {
    res.status(200).json({ msg: true });
  }
});

router.post("/verifyEmail", async function (req, res, next) {
  const body = req.body;
  if (await Userdb.exists({ email: body.email })) {
    console.log("email exists");
    res.status(200).json({ msg: false });
  } else {
    res.status(200).json({ msg: true });
  }
});

router.post("/sign-up", async function (req, res, next) {
  const body = req.body;
  console.log(body);
  const user = new Userdb(body);
  const salt = await bcrypt.genSalt(10);
  //hashing
  user.password = await bcrypt.hash(body.password, salt);
  //creating a session
  const session = await createSession(body);
  user.session = session.token;
  //saving to db
  await user.save();
  // saving cookie
  res.cookie("Noodlesession", session.token, { expires: session.expiresAt });
  res.status(200).json({ msg: "successful sign up" });
});

function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

async function verifylogin(req, res, next) {
  const body = req.body;
  let user = false;

  if (validateEmail(body.username)) {
    user = await Userdb.findOne({ email: body.username });
  } else {
    user = await Userdb.findOne({ username: body.username });
  }

  if (user) {
    // check user password with hashed password stored in the database
    const validPassword = await bcrypt.compare(body.password, user.password);
    console.log(validPassword);
    if (validPassword) {
      next();
    } else {
      console.log("wrong");
      res.status(200).json({ msg: 400 });
    }
  } else {
    console.log("wrong");
    res.status(200).json({ msg: 400 });
  }
}

router.post("/login", verifylogin, async function (req, res, next) {
  const body = req.body;
  const session = await createSession(body);
  //saving to db
  Userdb.findOneAndUpdate(
    body.email,
    { session: session.token },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
  //saving cookie
  res.cookie("Noodlesession", session.token, { expires: session.expiresAt });
  res.cookie("NoodlesessionExpiry", session.expiresAt, {
    expires: session.expiresAt,
  });
  console.log("success");
  res.status(200).json({ msg: "success" });
});
async function verifycookies(req, res, next) {
  // if this request doesn't have any cookies, that means it isn't
  // authenticated. Return an error code.
  if (!req.cookies) {
    res.status(401).end();
  } else next();
}
router.post("/welcome", verifycookies, async function (req, res, next) {
  const { Noodlesession, NoodlesessionExpiry } = req.cookies;
  const user = await Userdb.findOne({ session: Noodlesession });
  if (user.token) {
    // If the cookie is not set, return an unauthorized status
    res.status(401).end();
  }
  if (NoodlesessionExpiry) {
    Userdb.findOneAndUpdate(
      { session: Noodlesession },
      { session: "" },
      function (err, doc) {
        if (err)
          return res.status(500).json({ error: "error in saving session" });
      }
    );
    res.status(401).end();
  }
  console.log("logged in");
});

router.post("/googleLogin", async function (req, res, next) {
  const body = req.body;
  const user = new Userdb(body);
  const session = await createSession(body);
  user.session = session.token;
  //saving to db
  await user.update({ upsert: true });

  //saving session to db
  //saving cookie
  res.cookie("Noodlesession", session.token, { expires: session.expiresAt });
  res.cookie("NoodlesessionExpiry", session.expiresAt, {
    expires: session.expiresAt,
  });
  console.log("success");
  res.status(200).json({ msg: "success" });
});

module.exports = router;
