var express = require("express");
var router = express.Router();
const writeClasses = require("../utils/db-writeclass");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// /* GET users listing. */
// router.get("/classes", async function (req, res, next) {
//   console.log("oui");
//   // const classes = await writeClasses.get_classes();
//   // res.json(classes);
//   res.render("GET CLASSES", { title: "Express" });
// });

module.exports = router;
