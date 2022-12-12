const { objectFromEvent, publishObject } = require("./utils/events");
const { doesUserExist, addNewUser } = require("./utils/data");

module.exports = async (cloudEvent) => {
  const email = objectFromEvent(cloudEvent);
  // TODO: A util?
  const emailAddress = email.from.value[0].address;
  const name = email.from.value[0].name || emailAddress;
  const toKey = email.to.value[0].address.split("@")[0].toLowerCase();
  // Only handle new
  if (await doesUserExist(emailAddress)) {
    console.log(`User already exists, not welcoming`);
    // TODO: ACK?
    return;
  }
  // Create User
  await addNewUser(emailAddress, { name });
  // Send Email (via a channel)
  console.log(`Welcome email is ready for ${emailAddress}`);
  const messageId = await publishObject(process.env.OUTBOUND_EMAIL_TOPIC, {
    templateKey: "WELCOME",
    to: emailAddress,
    data: {
      name,
      incoming_subject: email.subject,
    },
  });
  console.log(
    `Published message ${messageId} to ${process.env.OUTBOUND_EMAIL_TOPIC}`
  );
};
