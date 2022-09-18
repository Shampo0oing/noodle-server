const axios = require("axios").default;
var cheerio = require("cheerio");

async function fetchHtml(url) {
  const config = {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  try {
    const { data } = await axios.get(url, config);
    return data;
  } catch (err) {
    console.error(
      `ERROR: An error occurred while trying to fetch the URL: ${url}`
    );
    console.error(err);
    return null;
  }
}

async function parse_data(html) {
  const all_groupes = [];
  const $ = cheerio.load(html);
  let rows = $(".horaire div:nth-of-type(1) tbody tr");

  rows.each((number, el) => {
    all_groupes.push({
      isLab: false,
      nGroup:
        $("td:nth-of-type(1)", el).text() === " "
          ? all_groupes[number - 1]?.ngroupe
          : $("td:nth-of-type(1)", el).text(),
      day: $("td:nth-of-type(2)", el).text(),
      time: $("td:nth-of-type(3)", el).text(),
      nClass: $("td:nth-of-type(4)", el).text(),
      teacher:
        $("td:nth-of-type(5)", el).text() === " "
          ? all_groupes[number - 1]?.teacher
          : $("td:nth-of-type(5)", el).text(),
    });
  });

  all_groupes.shift();
  i = all_groupes.length;
  rows = $(".horaire div:nth-of-type(2) tbody tr");
  rows.each((number, el) => {
    all_groupes.push({
      isLab: true,
      nGroup:
        $("td:nth-of-type(1)", el).text() === " "
          ? all_groupes[number - 1]?.ngroupe
          : $("td:nth-of-type(1)", el).text(),
      day: $("td:nth-of-type(2)", el).text(),
      time: $("td:nth-of-type(3)", el).text(),
      nClass: $("td:nth-of-type(4)", el).text(),
      teacher:
        $("td:nth-of-type(5)", el).text() === " "
          ? all_groupes[number - 1]?.teacher
          : $("td:nth-of-type(5)", el).text(),
    });
  });
  all_groupes.splice(i, 1);
  //on enleve le premier dictionnaire car il represente uniquement le titre du tableau

  return all_groupes;
}
async function get_class(url) {
  const html = await fetchHtml(url);
  return await parse_data(html);
}
module.exports = { get_class, fetchHtml };
