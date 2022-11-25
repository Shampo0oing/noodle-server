const { Moodle } = require("./moodle-scrape/dist/Moodle");
const undici = require("undici");
let CryptoJS = require("crypto-js");

const url = "https://moodle.polymtl.ca";

// async function encrypt(username, password) {
//   const salt = CryptoJS.lib.WordArray.random(128 / 8);
//   const generated_key = CryptoJS.PBKDF2("test1", salt, {
//     keySize: 512 / 32,
//     iterations: 1000,
//   });
//   const iv = CryptoJS.lib.WordArray.random(16);
//
//   // console.log(generated_key)
//   const encrypted_user = CryptoJS.AES.encrypt(username, generated_key, {
//     iv: iv,
//   });
//   const encrypted_pass = CryptoJS.AES.encrypt(password, generated_key, {
//     iv: iv,
//   });
//
//   return {
//     username: encrypted_user.toString(),
//     password: encrypted_pass.toString(),
//     key: generated_key.toString(),
//     iv: iv.toString(),
//     salt: salt.toString(),
//   };
// }
async function encrypt(username, password) {
  const key = process.env.KEY;
  var EncryptedUser = CryptoJS.AES.encrypt(username, key).toString();
  var EncryptedPass = CryptoJS.AES.encrypt(password, key).toString();
  return { EncryptedUser, EncryptedPass }; // Encryption Part
}
async function saveinfo(doc) {
  const key = doc.key;
  const iv = doc.iv;
  document.cookie = "noo=" + doc.username + "; SameSite=None; Secure";
  document.cookie = "dle=" + doc.password + "; SameSite=None; Secure";
  await new moodledb({ key, iv }).save();
}

async function getInfo(username, password) {
  // const decryptedUser = CryptoJS.AES.decrypt(username, key_db.key, {
  //   iv: key_db.iv,
  // }).toString(CryptoJS.enc.Utf8);
  // const decryptedPassword = CryptoJS.AES.decrypt(password, key_db.key, {
  //   iv: key_db.iv,
  // }).toString(CryptoJS.enc.Utf8);
  const key = process.env.KEY;
  const decryptedUser = CryptoJS.AES.decrypt(username, key).toString(
    CryptoJS.enc.Utf8
  );
  const decryptedPassword = CryptoJS.AES.decrypt(password, key).toString(
    CryptoJS.enc.Utf8
  );
  return { decryptedUser, decryptedPassword };
}

//test
async function encrypt_test(user, pass) {
  const key = "message";

  var username = CryptoJS.AES.encrypt(user, key).toString();
  var password = CryptoJS.AES.encrypt(pass, key).toString();

  return { username, password };
}
async function decryption_test(info) {
  // const key = "message";
  // // var data = CryptoJS.AES.encrypt("Message", key);
  // var username = CryptoJS.AES.decrypt(info.user, key).toString(
  //   CryptoJS.enc.Utf8
  // );
  // var password = CryptoJS.AES.decrypt(info.pass, key).toString(
  //   CryptoJS.enc.Utf8
  // );
  const username = "moayoa";
  const password = "dfdffdfd";
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const generated_key = CryptoJS.PBKDF2("test1", salt, {
    keySize: 512 / 32,
    iterations: 1000,
  });
  const iv = CryptoJS.lib.WordArray.random(16);

  // console.log(generated_key)
  const encrypted_user = CryptoJS.AES.encrypt(username, generated_key, {
    iv: iv,
  }).toString();
  const encrypted_pass = CryptoJS.AES.encrypt(password, generated_key, {
    iv: iv,
  }).toString();

  const key_db = { key: generated_key.toString(), iv: iv.toString() };
  console.log(encrypted_pass, encrypted_user);
  const decryptedUser = CryptoJS.AES.decrypt(encrypted_user, key_db.key, {
    iv: key_db.iv,
  }).toString(CryptoJS.enc.Utf8);
  const decryptedPassword = CryptoJS.AES.decrypt(encrypted_pass, key_db.key, {
    iv: key_db.iv,
  }).toString(CryptoJS.enc.Utf8);
  console.log(decryptedUser, decryptedPassword);
}
//test
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
  getMoodle,
  main,
  getInfo,
  decryption_test,
};
