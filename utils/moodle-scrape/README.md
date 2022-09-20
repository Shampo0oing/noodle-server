# moodle-scrape
[![NPM](https://nodei.co/npm/moodle-scrape.png)](https://www.npmjs.com/package/moodle-scrape)<br>
[![Docs](https://img.shields.io/github/workflow/status/nizewn/moodle-scrape/Deploy%20TypeDoc%20docs%20to%20Pages?label=docs&logo=github)](https://nizewn.github.io/moodle-scrape)<br>
Easily scrape data from Moodle sites. Tested on Moodle v3.8.

### Features:
- [x] user info
- [x] courses
- [x] tasks/deadlines/events
- [ ] course files/resources ([#1](https://github.com/nizewn/moodle-scrape/issues/1))

# Installation
```sh
npm install moodle-scrape
```

```js
const {Moodle} = require("./index"); // CommonJS
// or
import {Moodle} from "./index"; // ESM
```

# Usage
```js
const moodle = new Moodle(fetch, "https://examplesite.com");

await moodle.login('supercoolusername', 'superCoolpassword123');
// returns true if login was successful 

console.log(moodle.user.name); // string
console.log(moodle.courses); // array of course objects
console.log(moodle.tasks); // array of task objects
```
or view the [example](example/index.js) CommonJS script

### Scraping manually
After calling `.login()`, the `cookies` property gets filled with a string containing your cookies which you can pass to your own fetch method. For example:
```js
await moodle.login("username", "password");

const res = await fetch("https://examplesite.com", {
	headers: { 'cookie': moodle.cookies }
});
// ...
```