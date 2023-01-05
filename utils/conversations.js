const dialogflow = require("@google-cloud/dialogflow");
const { appendConversationHistory } = require("./data");
const {
  addNewConversation,
  findActiveConversationFor,
} = require("./utils/data");

const sessionClient = new dialogflow.SessionsClient();

async function getActiveConversationFor(emailAddress, key) {
  let conversation = await findActiveConversationFor(emailAddress, key);
  if (conversation === undefined) {
    console.log("No active conversation found, creating...");
    conversation = await addNewConversation(emailAddress, key);
  }
  return conversation;
}

async function sendToDialogFlow(conversation, replyText, languageCode = "en-US") {
  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    conversation.id
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: replyText,
        languageCode: languageCode,
      },
    },
  };

  // TODO: Get the contexts from the conversation?
  // conversation.history.at(-1).response.queryResult.outputContexts?

  // if (conversation.contexts && conversation.contexts.length > 0) {
  //   request.queryParams = {
  //     contexts: conversation.contexts,
  //   };
  // }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];

}

async function processEmailReply(email) {
  const replyConfig = retrieveReplyConfig(email);
  // Creates if missing
  const conversation = await getActiveConversationFor(
    replyConfig.from,
    replyConfig.originalKey
  );
  const response = await sendToDialogFlow(conversation, replyConfig.replyText);
  await appendConversationHistory(conversation, replyConfig.replyText, response);
  // Parse out the Intent and Fields?
  console.log("Dialogflow response");
  console.dir(response);
  const result = {
    isConversationComplete: response.endInteraction
  };
  return result;
}

module.exports = {
  processEmailReply
}