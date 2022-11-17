const { Userdb } = require("../db/classes");
const { createSession } = require("../utils/user");
const bcrypt = require("bcrypt");

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
router.post("/changeImage", async function (req, res, next) {});
