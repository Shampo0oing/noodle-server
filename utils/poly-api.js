const axios = require('axios').default;
var cheerio = require("cheerio");

const config = {
    headers:{
        'Access-Control-Allow-Origin': '*',
    }
}

async function fetchHtml (url, config = null){
    try {
        const { data } = await axios.get(url, config);
        return data;
    } catch (err){
        console.error(
            `ERROR: An error occurred while trying to fetch the URL: ${url}`
        );
        console.error(err);
        return null;
    }
}

async function parse_data(html){
    var all_groupes = [];
    var $ = cheerio.load(html);
    const rows = $('.horaire:nth-of-type(2) tbody tr');

    rows.each((number, el) => {

        const ngroupe = $("td:nth-of-type(1)", el).text();
        const day = $("td:nth-of-type(2)", el).text();
        const time =$("td:nth-of-type(3)", el).text();
        const nclass = $("td:nth-of-type(4)", el).text();
        const teacher = $("td:nth-of-type(5)", el).text();
        all_groupes.push({
            ngroupe: ngroupe, day, time, nclass, teacher
        });
    });
    //on enleve le premier dictionnaire car il represente uniquement le titre du tableau

    all_groupes.shift();
    return all_groupes;
}
async function get_class(url) {
    console.log(url);
    var html = await fetchHtml(url,config);
    const data = await parse_data(html);
    return data
}
module.exports={get_class}


