"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Moodle = void 0;
const cheerio_1 = require("cheerio");
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
    const res = await this.fetch(
      `${this.url}/calendar/view.php?view=upcoming`,
      {
        headers: { cookie: cookies || "" },
      }
    );
    const body = await res.text();
    const $ = (0, cheerio_1.load)(body);
    try {
      // parse courses
      this.courses = $("#course")
        .each((i, el) => {
          return {
            id: parseInt(el.attribs["value"]),
            name: $(el).text(),
            tasks: [],
          };
        })
        .toArray();
      // parse tasks
      this.tasks = $(".event")
        .map((i, el) => {
          return {
            id: parseInt(el.attribs["data-event-id"]),
            name: el.attribs["data-event-title"],
            deadline: $(
              $(".description .row:nth-of-type(1) a:nth-of-type(1)").get(i)
            ).text(),
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
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
exports.Moodle = Moodle;
