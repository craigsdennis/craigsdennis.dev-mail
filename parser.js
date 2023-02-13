const { emailFromRequest, isReply } = require("./utils/email");
const { publishObject } = require("./utils/events");

module.exports = async (req, res) => {
  // Inflate email from request
  const email = await emailFromRequest(req);
  let topicName = process.env.TOPIC_INBOUND_EMAIL;
  // Special case replies
  if (isReply(email)) {
    // TODO: Terraform this topic
    topicName = process.env.TOPIC_REPLY;
  }

  const messageId = await publishObject(topicName, email);
  console.log(
    `Published message ${messageId} to ${topicName}`
  );

  // Response back to SendGrid
  res.status(200).send("OK");
};
