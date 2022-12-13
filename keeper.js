const { objectFromEvent, publishObject } = require("./utils/events");
const { doesUserExist, storeMessageFor } = require("./utils/data");



module.exports = async (cloudEvent) => {
  const email = objectFromEvent(cloudEvent);
  const emailAddress = email.from.value[0].address;
  if (!(await doesUserExist(emailAddress))) {
    console.log("New user");
    return;
  }
  console.log("Storing message");
  await storeMessageFor(emailAddress, email);
  console.log("Message stored");
  //TODO: Send a new templated message to emailer. Include messages?


}