var express = require("express");
var router = express.Router();
const Classes = require("../db/classes");
const db = require("../utils/db");

/* GET home page. */
router.get("/", async function (req, res, next) {
  // const doc = await Classes.find({_id: '6323d61d0e028871d13c2f3c'});
  // console.log(doc);
  res.render("index", { title: "Express" });
});

/* GET users listing. */
router.get("/classes", async function (req, res, next) {
  const classes = await Classes.find();
  res.json(classes);
});

module.exports = router;
