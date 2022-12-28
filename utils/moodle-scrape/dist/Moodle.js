"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Moodle = void 0;
const cheerio_1 = require("cheerio");
const { GetDate } = require("./utils");

const useless = [
  "CCGIGL - Centre de Consultation GIGL",
  "Code de conduite – Baccalauréat – GO-Poly",
  "Concours des bourses internes - Service aux étudiants",
  "CONCOURS UPIR",
  "Contrer les violences à caractère sexuel",
  "Counter Sexual Violence",
  "Ensemble pour contrer la banalisation des violences à caractère sexuel",
  "Étudier à l'ère de la COVID-19",
  "L’ingénierie et le développement durable",
  "Normes sociales et violences à caractère sexuel - étudiantes et étudiants",
  "Plans de cours – Baccalauréat et Certificat",
  "Poly-Forum",
  "Rendez-vous express, conseils stages et emplois",
  "Reprise des activités en toute sécurité en contexte pandémique ",
  "Association étudiante de Polytechnique (AEP)",
  "Ateliers de perfectionnement en communication (site dédié aux étudiants inscrits aux ateliers)",
  "CCMath - Centre de Consultation en Mathématiques",
  "Site d'évaluation de l'enseignement",
  "Soutien à la Réussite - Service aux Étudiants",
  "Stratégies de recherche d’emploi (ou de stage) – SSE",
  "L’ingénierie et le développement durable",
  "Programmes de reconnaissance - Service aux étudiants",
];

class Moodle {
  /**
   * Creates a new scraper instance for a certain Moodle site
   * @param { Fetch }     fetch   The fetch method to use (e.g. undici or the built-in global fetch)
   * @param { string }    url     URL of the Moodle site
   * @example const moodle = new Moodle(fetch, "https://examplesite.com");
   */
  constructor(fetch, url) {
    this.fetch = fetch;
    this.url = url.endsWith("/") ? url.slice(0, -1) : url;
    this.cookies = undefined;
    this.user = null;
    this.courses = [];
    this.tasks = [];
    this.calendar = [];
  }

  /**
   *
   * @param { string } username
   * @param { string } password
   * @param { boolean } refresh Whether to call Moodle.refresh() automatically after logging in. True by default.
   */
  async login(username, password, refresh = true) {
    var _a, _b;
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    let res = await this.fetch(this.url);
    const body = await res.text();
    const $ = (0, cheerio_1.load)(body);
    form.append("logintoken", $("[name='logintoken']")[0].attribs.value);
    res = await this.fetch(`${this.url}/login/index.php`, {
      headers: {
        cookie:
          res.headers
            .get("set-cookie")
            ?.split("Secure, ")
            .find((c) => c.startsWith("MoodleSession")) || "",
      },
      method: "POST",
      body: form,
      redirect: "manual",
      credentials: "include",
    });
    this.cookies =
      (_b = res.headers.get("set-cookie")) === null || _b === void 0
        ? void 0
        : _b.split("Secure, ").find((c) => c.startsWith("MoodleSession"));
    if (this.cookies && refresh === true) {
      await this.refresh();
    }
    return !!this.cookies;
  }

  /**
   * Fetches the user data and stores them in the Moodle instance
   * @param cookies optional
   */
  async refresh(cookies = this.cookies) {
    var _a;
    let res = await this.fetch(`${this.url}/calendar/view.php?view=upcoming`, {
      headers: { cookie: cookies || "" },
    });
    let body = await res.text();
    let $ = (0, cheerio_1.load)(body);
    // parse tasks
    try {
      this.tasks = $(".event")
        .map((i, el) => {
          return {
            id: parseInt(el.attribs["data-event-id"]),
            name: el.attribs["data-event-title"],
            deadline: $($(".description .row:nth-of-type(1)").get(i))
              .contents()
              .text()
              .replace(/\s{2,}/g, " "),
            course: $($(".description .row.mt-1 .col-11 > a").get(i)).text(),
          };
        })
        .toArray();
      // put the tasks in their corresponding courses

      // parse user
      this.user = {
        id: parseInt(
          (_a = $(".theme-loginform-form > a").attr("href")) === null ||
            _a === void 0
            ? void 0
            : _a.split("?id=")[1]
        ),
        name: $(".usertext").text(),
        picture: $(".avatars img").attr("src"),
      };
      //fetching courses
      res = await this.fetch(
        `${this.url}/user/profile.php?id=82382&showallcourses=1`,
        {
          headers: { cookie: cookies || "" },
        }
      );
      body = await res.text();
      $ = (0, cheerio_1.load)(body);
      // parse courses
      this.courses = $(
        "#region-main > div > div > div > section:nth-child(3) .contentnode > dl > dd > ul > li > a"
      )
        .map((i, el) => {
          return {
            // id: parseInt(el.attribs["value"]),
            link: el.attribs["href"],
            name: $(el).text(),
          };
        })

        .toArray();
      //removing useless courses
      console.log(this.courses.length);
      let i = this.courses.length;
      while (i--) {
        if (useless.includes(this.courses[i].name)) {
          this.courses.splice(i, 1);
        }
      }
      const date = new GetDate();
      for (let time of [date.removeMonth(), date.addMonth(), date.addMonth()]) {
        res = await this.fetch(
          `${this.url}/calendar/view.php?view=month&time=${time}`,
          {
            headers: { cookie: cookies || "" },
          }
        );
        body = await res.text();
        $ = (0, cheerio_1.load)(body);
        // parse calendar and events
        let eventArray = [];
        $(
          "tbody > tr .day.text-sm-center.text-md-left.clickable .d-none.d-md-block.hidden-phone.text-xs-center > div  > ul > li > a"
        ).map((i, el) => {
          const eventId = parseInt(el.attribs["data-event-id"]);
          const eventName = $($(".eventname").get(i)).text();
          const eventLink = el.attribs["href"];

          eventArray.push({ eventId, eventName, eventLink });
        });
        //getting the day
        let eventDay = [];
        $(
          "tbody > tr .day.text-sm-center.text-md-left.clickable .d-none.d-md-block.hidden-phone.text-xs-center > a"
        ).map((i, el) => {
          eventDay.push($(el).prev("span").text());
        });
        // putting the events in their corresponding date
        let position = 0;
        for (let i of eventDay) {
          let numEvent = parseInt(i.match(/\d+/)[0]);
          let day = parseInt(i.split(", ")[1].match(/\d+/)[0]);
          let nexPosition = numEvent + position;
          for (let j = position; j < nexPosition; j++) {
            eventArray[j]["day"] = day;
          }
          position += numEvent;
        }
        //getting the month of the calendar
        eventArray.push({ date: $(".calendar-controls > h2").text() });
        this.calendar.push(eventArray);
        console.log({ eventArray });
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

exports.Moodle = Moodle;
