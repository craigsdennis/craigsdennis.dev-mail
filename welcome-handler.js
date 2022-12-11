const { objectFromEvent, publishObject } = require("./utils");


module.exports = async (cloudEvent) => {
  const email = objectFromEvent(cloudEvent);
  const emailAddress = email.from.value[0].address;
  const name = email.from.value[0].name || emailAddress;
  const toKey = email.to.value[0].address.split("@")[0].toLowerCase();
  // Only handle new
  // Create User
  // Send Email (via a channel?)
  console.log(`Handling email from ${emailAddress} keyed on ${toKey}`);
};