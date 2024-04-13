const crypto = require('crypto');

function generateOTL(email) {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const otl = `${randomBytes}-${email}`;
  console.log(otl)
  return otl;
}

function generateOTLExpiration() {
  // Set expiration time (e.g., 5 minutes)
  return new Date(Date.now() + 5 * 60 * 1000);
}

module.exports = {
    generateOTL,
    generateOTLExpiration
}