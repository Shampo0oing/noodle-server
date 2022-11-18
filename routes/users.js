var express = require("express");
var router = express.Router();
const writeClasses = require("../utils/db-writeclass");
const { Userdb } = require("../db/classes");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const { createSession } = require("../utils/user");

/* GET users listing. */
avatars = [
  "https://i.imgur.com/BKSn5kw.png",
  "https://i.imgur.com/1FUqWf7.png",
  "https://i.imgur.com/ShnfKUa.png",
  "https://i.imgur.com/5LspHEJ.png",
  "https://i.imgur.com/nEDHOvV.png",
  "https://i.imgur.com/dqNlRgq.png",
  "https://i.imgur.com/4jLRKQ5.png",
  "https://i.imgur.com/jb0tEAE.png",
  "https://i.imgur.com/eMKtDaV.png",
  "https://i.imgur.com/n4gznm6.png",
];
router.post("/verifyUsername", async function (req, res, next) {
  const body = req.body;
  if (await Userdb.exists({ username: body.username })) {
    console.log("username exists 23045");
    res.status(200).json({ msg: false, status: 200 });
  } else {
    res.status(200).json({ msg: true, status: 400 });
  }
});

router.post("/verifyEmail", async function (req, res, next) {
  const body = req.body;
  if (await Userdb.exists({ email: body.email })) {
    console.log("email exists");
    res.status(200).json({ msg: false, status: 400 });
  } else {
    res.status(200).json({ msg: true, status: 200 });
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
  const random = Math.floor(Math.random() * avatars.length);
  user.imageUrl = avatars[random];
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
    body.isEmail = true;
  } else {
    user = await Userdb.findOne({ username: body.username });
    body.isEmail = false;
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
  if (body.isEmail) {
    Userdb.findOneAndUpdate(
      { email: body.username },
      { session: session.token },
      function (err, doc) {
        if (err)
          return res.status(500).json({ error: "error in saving session" });
      }
    );
  } else {
    Userdb.findOneAndUpdate(
      { username: body.username },
      { session: session.token },
      function (err, doc) {
        if (err)
          return res.status(500).json({ error: "error in saving session" });
      }
    );
  }

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

//modify this to get new data from db each time we log in
router.post("/cookiesLogin", verifycookies, async function (req, res, next) {
  const { Noodlesession, NoodlesessionExpiry } = req.cookies;
  const user = await Userdb.findOne({ session: Noodlesession });
  console.log(NoodlesessionExpiry);
  if (user == null) {
    // If the cookie is not set, return an unauthorized status
    console.log("no cookies");
    return res.status(400).json({ error: "no cookies" });
  }
  if (NoodlesessionExpiry < new Date()) {
    console.log("expired");
    Userdb.findOneAndUpdate(
      { session: Noodlesession },
      { session: "" },
      function (err, doc) {
        if (err)
          return res.status(500).json({ error: "error in saving session" });
      }
    );
    return res.status(400).json({ error: "error in saving session" });
  } else {
    //we are logged in
    console.log("logged in");
    res.status(200).json({
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl === undefined ? null : user.imageUrl,
      linked_moodle:
        user.linked_moodle === undefined ? false : user.linked_moodle,
      status: 200,
    });
  }
});

router.post("/disconnect", verifycookies, async function (req, res, next) {
  const body = req.body;
  Userdb.findOneAndUpdate(
    { username: body.username },
    { session: "" },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
  res.clearCookie("Noodlesession");
  res.clearCookie("NoodlesessionExpiry");
  res.status(200).json({ status: 200 });
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
