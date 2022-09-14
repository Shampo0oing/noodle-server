const Classes = require("../db/classes");
const poly_api = require("./poly-api");
const axios = require('axios').default;
var cheerio = require("cheerio");

//ce fichier est pour ajouter tout les cours dans la db

function write_class(name,sigle,link) {
    const classes = new Classes({
        class_name: name,
        class_sigle: sigle,
        class_link: link
    });
    classes.save()
        .then((result) => {
            console.log(result)
        })
        .catch((err) => {
            console.log(err)
        })
}
async function parse_classes(html){
    var all_classes = [];
    var $ = cheerio.load(html);
    const text = $('pre').text();
    var array = text.split(/\r?\n/);
    array.shift();
    for(var i = 0; i < array.length; i++){
        var first = array[i].substring(0, array[i].indexOf(' '));
        var second = array[i].substring(array[i].indexOf(' ') + 1);
        all_classes.push({
            class_name: second,
            class_sigle: first
        });
    }
    return all_classes;
}
async function parse_link(sigle){
    const url = 'https://www.polymtl.ca/programmes/cours/recherche/%2A?sigle=' + sigle;
    let html = await poly_api.fetchHtml(url);
    let $ = cheerio.load(html);
    return $('td:nth-of-type(2) a').attr('href');

}
async function get_link(array){
    for(let i = 0;i < array.length;i++){
        await parse_link(array[i]['class_sigle']).then((value) => {array[i]["link"] = value; console.log(value)});
    }
}
async function get_classes(){
    const url = 'https://www.horaires.aep.polymtl.ca/listcourses.php'
    const html = await poly_api.fetchHtml(url);
    let classes = await parse_classes(html);
    await get_link(classes);
    for(let i = 0;i < classes.length;i++) {
        await write_class(classes[i]["class_name"],classes[i]["class_sigle"],classes[i]["link"])
    }

}
module.exports={get_classes}

