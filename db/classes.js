const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classesSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  acronym: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  groups: [
    {
      isLab: Boolean,
      nGroup: String,
      day: String,
      time: String,
      nClass: String,
      teacher: String,
    },
  ],
});

const moodle = new Schema({
  key: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  student_id: {
    type: String,
    required: true,
  },
});

const userdb = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  session: {
    type: String,
    required: true,
  },
  linked_moodle: {
    type: Boolean,
    required: false,
  },
});

const Classes = mongoose.model("Classes", classesSchema);
const Moodledb = mongoose.model("Moodle", moodle);
const Userdb = mongoose.model("Users", userdb);

module.exports = { Classes, Moodledb, Userdb };
