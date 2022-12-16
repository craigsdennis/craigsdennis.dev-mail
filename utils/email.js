const busboy = require("busboy");
const { simpleParser } = require("mailparser");
const { publishObject } = require("./events");

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

// Should this include `from`?
async function sendToEmailer(templateKey, to, data) {
  // ???:Environment variable here needs to be set...does a module save this problem?
  const messageId = await publishObject(process.env.OUTBOUND_EMAIL_TOPIC, {
    templateKey,
    to,
    data
  });
  console.log(
    `Published message ${messageId} to ${process.env.OUTBOUND_EMAIL_TOPIC}`
  );
  return messageId;
}

module.exports = {
  emailFromRequest,
  sendToEmailer
}