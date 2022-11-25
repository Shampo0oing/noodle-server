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
  user: {
    type: String,
    required: true,
  },
  pass: {
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
    required: false,
  },
  session: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  linked_moodle: {
    type: Boolean,
    required: false,
  },
});

const tokendb = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

const Classes = mongoose.model("Classes", classesSchema);
const Moodledb = mongoose.model("Moodle", moodle);
const Userdb = mongoose.model("Users", userdb);
const Token = mongoose.model("Tokens", tokendb);

module.exports = { Classes, Moodledb, Userdb, Token };
