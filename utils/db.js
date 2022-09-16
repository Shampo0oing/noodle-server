const mongoose = require("mongoose");
const Classes = require("../db/classes");
const Dburi =
  "mongodb+srv://mudy:1qORiD5tJJjIQUJh@cluster0.9ii1ept.mongodb.net/noodle?retryWrites=true&w=majority";

function db_connection() {
  mongoose.connect(Dburi, { useNewurlParser: true, useUnifiedTopology: true });
  var conn = mongoose.connection;
  conn.on("connected", function () {
    console.log("database is connected successfully");
  });
  conn.on("disconnected", function () {
    console.log("database is disconnected successfully");
  });
  conn.on("error", console.error.bind(console, "connection error:"));
  module.exports = conn;
}

module.exports = { db_connection };
