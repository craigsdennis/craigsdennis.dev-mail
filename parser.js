const busboy = require("busboy");
const { simpleParser } = require("mailparser");
const { publishObject } = require("./utils/events");

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

module.exports = async (req, res) => {
  console.log("Parsing multi-part form data");
  const formData = await parseMultipartFormRequest(req);
  // TODO: Validate SendGrid was the sender
  // Parse Email Object
  console.log("Parsing email");
  const parsedMail = await simpleParser(formData.email);
  const messageId = await publishObject(
    process.env.TOPIC_INBOUND_EMAIL,
    parsedMail
  );
  console.log(
    `Published message ${messageId} to ${process.env.TOPIC_INBOUND_EMAIL}`
  );
  // Response back to SendGrid?
  res.status(200).send("OK");
};
