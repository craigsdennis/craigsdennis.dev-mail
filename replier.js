const { objectFromEvent } = require("./utils/events");
const { processEmailReply } = require("./utils/conversations");

async function handleResult(result) {
  console.log("Result from processEmailReply")
  console.dir(result);
  return true;
}

module.exports = async function (cloudEvent) {
  const email = objectFromEvent(cloudEvent);
  // TODO: Track that the conversation is ended. conversationComplete
  // TODO: Add the Intent to result/Conversation ID/Reply info
  const result = await processEmailReply(email);
  if (result.isConversationComplete) {
    const status = await handleResult(result);
    console.log(`Status was ${status}`);
  }
  // TODO: If is the end modify config...maybe send to a new service configurator?
  // TODO: Send to emailer with context
};
