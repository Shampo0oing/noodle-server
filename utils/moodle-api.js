const { Moodle } = require("./moodle-scrape/dist/Moodle");
const undici = require("undici");
let CryptoJS = require("crypto-js");

const url = "https://moodle.polymtl.ca";

async function encrypt(username, password) {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const generated_key = CryptoJS.PBKDF2("test1", salt, {
    keySize: 512 / 32,
    iterations: 1000,
  });
  const iv = CryptoJS.lib.WordArray.random(16);

  // console.log(generated_key)
  const encrypted_user = CryptoJS.AES.encrypt(username, generated_key, {
    iv: iv,
  });
  const encrypted_pass = CryptoJS.AES.encrypt(password, generated_key, {
    iv: iv,
  });

  return {
    username: encrypted_user.toString(),
    password: encrypted_pass.toString(),
    key: generated_key.toString(),
    iv: iv.toString(),
    salt: salt.toString(),
  };
}

async function saveinfo(doc) {
  const key = doc.key;
  const iv = doc.iv;
  document.cookie = "noo=" + doc.username + "; SameSite=None; Secure";
  document.cookie = "dle=" + doc.password + "; SameSite=None; Secure";
  await new moodledb({ key, iv }).save();
}

async function getInfo(student_id) {
  const value = `; ${document.cookie}`;
  let username = value.split(`; noo=`);
  let password = value.split(`; dle=`);

  if (!username || !password) {
    return false;
  } else {
    const key_db = moodledb.findById(student_id)[0];
    username = CryptoJS.AES.decrypt(username, key_db.key, {
      iv: key_db.iv,
    }).toString(CryptoJS.enc.Utf8);
    password = CryptoJS.AES.decrypt(password, key_db.key, {
      iv: key_db.iv,
    }).toString(CryptoJS.enc.Utf8);
    return { username, password };
  }
}

//test
async function encrypt_test(user, pass) {
  const key = "message";

  var username = CryptoJS.AES.encrypt(user, key).toString();
  var password = CryptoJS.AES.encrypt(pass, key).toString();

  return { username, password };
}
async function decryption(info) {
  const key = "message";
  // var data = CryptoJS.AES.encrypt("Message", key);
  var username = CryptoJS.AES.decrypt(info.user, key).toString(
    CryptoJS.enc.Utf8
  );
  var password = CryptoJS.AES.decrypt(info.pass, key).toString(
    CryptoJS.enc.Utf8
  );
  return { username, password };
}
async function moodleLogin(user, pass) {
  const moodle = new Moodle(undici.fetch, url);
  console.time("-- login() time");
  const success = await moodle.login(user, pass, true);
  console.timeEnd("-- login() time");
  // console.log(await getMoodle(moodle));
  if (!success) {
    return false;
  } else {
    return moodle;
  }
}
async function getMoodle(moodle) {
  console.time("-- getInfo() time");
  await moodle.refresh();
  console.timeEnd("-- getInfo() time");
  return moodle;
}

async function main() {}
module.exports = {
  moodleLogin,
  encrypt,
  decryption,
  getMoodle,
  encrypt_test,
  main,
};
