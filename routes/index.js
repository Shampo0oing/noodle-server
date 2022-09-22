var express = require("express");
var router = express.Router();
const {Classes} = require("../db/classes");
const db = require("../utils/db");
const moodleapi = require("../utils/moodle-api")
const {moodleLogin} = require("../utils/moodle-api");

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* GET users listing. */
router.get("/classes", async function (req, res, next) {
  const classes = await Classes.find();
  res.json(classes);
});


//Moodle connection , cookies and more
function validateCookies(req,res,next ) {
  const {cookies} = req;
  if ('umo' in cookies) {
    console.log('it exists');
    if (cookies.umo === '12345') next();
    else res.status(403).send({msg: 'not logged in'});
  } else res.status(403).send({msg: 'not logged in'});
}


router.get("/protected", validateCookies, async function (req, res, next) {
  res.status(200).json({msg:'logged'});
});


router.get("/moodle-signin", async function (req, res, next) {

  const mSession = moodleLogin(info);
  if (!mSession){
    res.status(200).json({msg:'not logged'});
    return;
  }
  res.cookie('umo',"12345");


});



module.exports = router;
