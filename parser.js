const { emailFromRequest, isReply, getReplyText } = require("./utils/email");
const { publishObject } = require("./utils/events");

module.exports = async (req, res) => {
  // Inflate email from request
  const email = await emailFromRequest(req);
  // Special case replies
  if (isReply(email)) {
    // Publish to replier
    // TODO: Terraform this topic
    const messageId = await publishObject(process.env.TOPIC_REPLY, {
      email
    });
    console.log(
      `Published message ${messageId} to ${process.env.TOPIC_INBOUND_EMAIL}`
    );
  } else {
    // Publish all other incoming emails to subscribers
    const messageId = await publishObject(process.env.TOPIC_INBOUND_EMAIL, email);
    console.log(
      `Published message ${messageId} to ${process.env.TOPIC_INBOUND_EMAIL}`
    );
  }
  // Response back to SendGrid
  res.status(200).send("OK");
};
