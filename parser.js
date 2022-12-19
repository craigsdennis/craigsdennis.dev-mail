const { emailFromRequest} = require("./utils/email")
const { publishObject } = require("./utils/events");

module.exports = async (req, res) => {
  // Inflate email from request
  const email = await emailFromRequest(req);
  // Publish incoming email to subscribers
  const messageId = await publishObject(
    process.env.TOPIC_INBOUND_EMAIL,
    email
  );
  console.log(
    `Published message ${messageId} to ${process.env.TOPIC_INBOUND_EMAIL}`
  );
  // Response back to SendGrid?
  res.status(200).send("OK");
};
