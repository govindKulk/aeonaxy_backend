const axios = require('axios');
const {Resend} = require('resend')

 async function sendEmail(email, subject, htmlContent) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendUrl = 'https://api.resend.com/v1/messages'; // Replace with appropriate Resend API endpoint

 
  const data = {
    from: 'onboarding@resend.dev',
    to: email,
    subject,
    html: htmlContent,
  };

  try {

    const resend = new Resend(resendApiKey);
    const res =  resend.emails.send(data).then((value) => console.log(value), (reason) => console.log(reason))
    
    console.log('Email sent successfully!');

    
  } catch (error) {
 
    console.error('Error sending email:', response.data.error);
    throw error;
  }
}

module.exports = sendEmail;