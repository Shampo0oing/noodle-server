const { Userdb } = require("../db/classes");
const { createSession } = require("../utils/user");
const bcrypt = require("bcrypt");
const express = require("express");
var router = express.Router();
const { ImgurClient } = require("imgur");

router.post("/changeUsername", async function (req, res, next) {
  const body = req.body;
  //saving to db
  Userdb.findOneAndUpdate(
    { username: body.username },
    { username: body.username },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
  return res.status(200).json({ status: 200 });
});

router.post("/changePassword", async function (req, res, next) {
  const body = req.body;
  const user = new Userdb(body);
  const salt = await bcrypt.genSalt(10);
  const session = await createSession(body);
  user.session = session.token;

  user.password = await bcrypt.hash(body.password, salt);
  //saving to db
  Userdb.findOneAndUpdate(
    body.username,
    { password: user.password, session: user.session },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
  //reset cookies
  res.clearCookie("Noodlesession");
  res.clearCookie("NoodlesessionExpiry");
  //remake new cookies
  res.cookie("Noodlesession", session.token, { expires: session.expiresAt });
  res.cookie("NoodlesessionExpiry", session.expiresAt, {
    expires: session.expiresAt,
  });
  return res.status(200).json({ status: 200 });
});
router.post("/changeImage", async function (req, res, next) {
  const body = req.body;
  const client = new ImgurClient({ clientId: process.env.IMGUR_ID });
  body.img = body.img.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

  const { data } = await client
    .upload({
      image: body.img,
      title: "profilePicture",
      type: "base64",
    })
    .catch(function (reason) {
      console.log(reason);
    });
  console.log(data);
  Userdb.findOneAndUpdate(
    { username: body.username },
    { imageUrl: data.link },
    function (err, doc) {
      if (err)
        return res.status(500).json({ error: "error in saving session" });
    }
  );
  return res.json({ link: data.link, status: 200 });
});

module.exports = router;
