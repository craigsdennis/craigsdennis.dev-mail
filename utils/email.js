const busboy = require("busboy");
const { simpleParser } = require("mailparser");
const { publishObject } = require("./events");
const replyParser = require("node-email-reply-parser");

function parseMultipartFormRequest(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    busboy({ headers: req.headers })
      .on("field", (name, value) => {
        fields[name] = value;
      })
      .on("finish", () => resolve(fields))
      .on("error", (err) => reject(err))
      .end(req.rawBody);
  });
}

async function emailFromRequest(req) {
  const formData = await parseMultipartFormRequest(req);
  // TODO: Validate SendGrid was the sender
  // Parse Email Object
  console.log("Parsing email");
  return simpleParser(formData.email);
}

function getReplyText(email) {
  const emailContent = email.rawBody;
  return replyParser(emailContent, true);
}

// Should this include `from`?
async function sendToEmailer(templateKey, to, data) {
  // ???:Environment variable here needs to be set...does a Terraform module save this problem?
  const messageId = await publishObject(process.env.OUTBOUND_EMAIL_TOPIC, {
    templateKey,
    to,
    data,
  });
  console.log(
    `Published message ${messageId} to ${process.env.OUTBOUND_EMAIL_TOPIC}`
  );
  return messageId;
}

function toKey(email) {
  const toKey = email.to.value[0].address.split("@")[0];
  return toKey;
}

function isReply(email) {
  const toKey = toKey(email);
  return toKey.toLowerCase().startsWith("reply");
}

function generateReplyTo(key, domain) {
  if (domain === undefined) {
    domain = process.env.REPLY_TO_DOMAIN;
  }
  return `reply-${key}@${domain}`;
}

function retrieveReplyConfig(email) {
  const toKey = email.to.value[0].address.split("@")[0];
  const originalKey = toKey.replace("reply-", "");
  const keys = originalKey.split("-");
  // TODO: Make better for generating
  const type = keys[0] === "M" ? "Message" : "User";
  return {
    originalKey,
    type,
    from: email.from.value[0].address,
    replyText: getReplyText(email),
    id: keys[1]
  };
}

module.exports = {
  emailFromRequest,
  getReplyText,
  isReply,
  sendToEmailer,
  generateReplyTo,
  retrieveReplyConfig,
};
