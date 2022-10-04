var express = require("express");
var router = express.Router();
const { Classes, Userdb } = require("../db/classes");
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

module.exports = router;
