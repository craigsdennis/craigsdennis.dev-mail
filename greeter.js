const { objectFromEvent } = require("./utils/events");
const { doesUserExist, addNewUser } = require("./utils/data");
const { sendToEmailer } = require("./utils/email");

module.exports = async (cloudEvent) => {
  const email = objectFromEvent(cloudEvent);
  // TODO: A util?
  const emailAddress = email.from.value[0].address;
  const name = email.from.value[0].name || emailAddress;
  const toKey = email.to.value[0].address.split("@")[0].toLowerCase();
  // Only handle new
  if (await doesUserExist(emailAddress)) {
    console.log(`User already exists, not greeting`);
    return;
  }
  // Create User
  const userId = await addNewUser(emailAddress, { name });
  // Send Email (via a channel)
  // TODO: REPLY_ID might not be required here...use the template?
  await sendToEmailer("WELCOME", emailAddress, {
    name,
    incoming_subject: email.subject,
    reply_id: `U-${userId}`,
  });
};
