const { objectFromEvent } = require("./utils/events");
const { doesUserExist, storeMessageFor, getMessages } = require("./utils/data");
const { sendToEmailer } = require("./utils/email");

module.exports = async (cloudEvent) => {
  const email = objectFromEvent(cloudEvent);
  const emailAddress = email.from.value[0].address;
  if (!(await doesUserExist(emailAddress))) {
    console.log("New user...exiting");
    return;
  }
  console.log("Storing message");
  const msgId = await storeMessageFor(emailAddress, email);
  console.log("Message stored");
  const messages = await getMessages(emailAddress);
  sendToEmailer("STATUS", emailAddress, {
    // TODO: Is Snake Case right for templating in SendGrid town?
    status_message: "Your message was stored successfully",
    reply_id: `M-${msgId}`,
    messages,
  });
};
