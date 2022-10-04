const nodemailer = require("nodemailer");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { string } = require("joi");

module.exports = async (email, subject, text) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email, // Change to your recipient
      from: "officialnoodleuni@gmail.com", // Change to your verified sender
      subject: subject,
      text: text,
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    console.log("email sent successfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};
