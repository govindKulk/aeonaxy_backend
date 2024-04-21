const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main(to, subject = "Verify Your Email Address", htmlContent) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: {
      name: "Dribble Support",
      address: process.env.GMAIL_USER,
    }, // sender address
    to, // list of receivers
    subject,// Subject line
    html: htmlContent, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

module.exports = {
  sendVerificationEmail: main
}

