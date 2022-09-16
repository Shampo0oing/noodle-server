var express = require("express");
var router = express.Router();
const Classes = require("../db/classes");
const db = require("../utils/db");
const writeclasses = require("../utils/db-writeclass");

/* GET home page. */
router.get("/home", async function (req, res, next) {
  // const doc = await Classes.find({_id: '6323d61d0e028871d13c2f3c'});
  // console.log(doc);
  res.render("index", { title: "Express" });
});

module.exports = router;
