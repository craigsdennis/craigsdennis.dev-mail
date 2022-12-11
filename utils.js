const { PubSub } = require("@google-cloud/pubsub");

function objectFromEvent(cloudEvent) {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const message = cloudEvent.data.message.data;
  const json = Buffer.from(message, "base64").toString();
  const email = JSON.parse(json);
  return email;
}

// This returns a promise
function publishObject(topic, obj) {
  pubsub = new PubSub();
  console.log(`Publishing to ${topic}...`);
  const message = Buffer.from(JSON.stringify(obj));
  return pubsub.topic(topic).publish(message);
}

module.exports = {
  objectFromEvent,
  publishObject
}