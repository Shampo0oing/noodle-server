const Classes = require("../db/classes");
const poly_api = require("./poly-api");
const axios = require("axios").default;
const cheerio = require("cheerio");

//ce fichier est pour ajouter tout les cours dans la db

async function write_class(name, acronym, link, groups) {
  await new Classes({
    name,
    acronym,
    link,
    groups,
  }).save();
}
async function parse_classes(html) {
  var all_classes = [];
  var $ = cheerio.load(html);
  const text = $("pre").text();
  var array = text.split(/\r?\n/);
  array.shift();
  for (var i = 0; i < array.length; i++) {
    var first = array[i].substring(0, array[i].indexOf(" "));
    var second = array[i].substring(array[i].indexOf(" ") + 1);
    all_classes.push({
      name: second,
      acronym: first,
    });
  }
  return all_classes;
}
async function parse_link(acronym) {
  const url =
    "https://www.polymtl.ca/programmes/cours/recherche/%2A?sigle=" + acronym;
  let html = await poly_api.fetchHtml(url);
  let $ = cheerio.load(html);
  return $("td:nth-of-type(2) a").attr("href");
}
async function get_link(array) {
  for (let i = 0; i < array.length; i++) {
    await parse_link(array[i]["acronym"]).then((value) => {
      array[i]["link"] = value;
      console.log(value);
    });
  }
}

async function get_groupes(classes) {
  for (const c of classes) {
    c.groups = await poly_api.get_class(c.link);
  }
  return classes;
}

async function get_classes() {
  const url = "https://www.horaires.aep.polymtl.ca/listcourses.php";
  const html = await poly_api.fetchHtml(url);
  let classes = await parse_classes(html);
  await get_link(classes);
  classes = await get_groupes(classes);

  for (const c of classes) {
    await write_class(c.name, c.acronym, c.link, c.groups);
  }
}
module.exports = { get_classes };
