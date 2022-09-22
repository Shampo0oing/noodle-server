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
    required: false,
  },
  student_id: {
    type: String,
    required: false,
  },
});

const Classes = mongoose.model("Classes", classesSchema);
const Moodledb = mongoose.model("Moodle", moodle);

module.exports = {Classes,Moodledb}
