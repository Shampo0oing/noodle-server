//sessions
const uuid = require("uuid");

class Session {
  constructor(username, expiresAt, token) {
    this.username = username;
    this.expiresAt = expiresAt;
    this.token = token;
  }
  isExpired() {
    this.expiresAt < new Date();
  }
}
async function createSession(data) {
  const sessionToken = uuid.v4();
  const now = new Date();
  const expiresAt = new Date(+now.setMonth(now.getMonth() + 8));
  return new Session(data.username, expiresAt, sessionToken);
}

module.exports = { Session, createSession };
