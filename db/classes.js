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

const Classes = mongoose.model("Classes", classesSchema);
module.exports = Classes;
