const { Moodle } = require("./moodle-scrape/dist/Moodle");
const undici = require("undici");
let CryptoJS = require("crypto-js");
const {Moodledb} = require("../db/classes")

const url = "https://moodle.polymtl.ca";

const moodle = new Moodle(undici.fetch, url);

async function encrypt(username,password){
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const generated_key = CryptoJS.PBKDF2('test1', salt, { keySize: 512/32, iterations: 1000 });
    const iv  = CryptoJS.lib.WordArray.random(16);

    // console.log(generated_key)
    const encrypted_user = CryptoJS.AES.encrypt(username, generated_key, { iv: iv });
    const encrypted_pass = CryptoJS.AES.encrypt(password, generated_key, { iv: iv });

    return {username: encrypted_user.toString(),
            password: encrypted_pass.toString(),
            key: generated_key.toString(),
            iv: iv.toString(),
            salt: salt.toString()};
}

async function saveinfo(doc){
    const key = doc.key;
    const iv = doc.iv;
    document.cookie = "noo="+doc.username+"; SameSite=None; Secure";
    document.cookie = "dle="+doc.password+"; SameSite=None; Secure";
    await new moodledb({key,iv}).save();
}

async function getInfo(student_id){
    const value = `; ${document.cookie}`;
    let username = value.split(`; noo=`);
    let password = value.split(`; dle=`);

    if (!username || !password){
        return false
    }

    else {
        const key_db = moodledb.findById(student_id)[0];
        username = CryptoJS.AES.decrypt(username, key_db.key, {iv: key_db.iv}).toString(CryptoJS.enc.Utf8);
        password = CryptoJS.AES.decrypt(password, key_db.key, {iv: key_db.iv}).toString(CryptoJS.enc.Utf8);
        return {username, password}
    }
}

async function moodleLogin(info){

    console.time('-- login() time');
    const success = await moodle.login(info.username, info.password, true);
    console.timeEnd('-- login() time');
    if(!success) {
        return console.log("ERROR: Login failed.");
        return false;
    }
    else{
        return moodle;
    }
}
async function getMoodle(moodle) {

    console.time('-- getInfo() time')
    await moodle.refresh();
    console.timeEnd('-- getInfo() time')

    console.log(moodle.cookies);
    console.log(moodle.courses);
    console.log(moodle.tasks);
}
async function main(){
    encrypted = await encrypt('aa','bb');
    await saveinfo(encrypted);

}
module.exports= {main,moodleLogin,encrypt};

