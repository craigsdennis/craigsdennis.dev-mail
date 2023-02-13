const dialogflow = require("@google-cloud/dialogflow");
const {
  appendConversationHistory,
  addNewConversation,
  findActiveConversationFor,
} = require("./data");

const { retrieveReplyConfig } = require("./email");

const sessionClient = new dialogflow.SessionsClient();

// Retrieve or Create?
async function getActiveConversationFor(emailAddress, key) {
  let conversation = await findActiveConversationFor(emailAddress, key);
  if (conversation === undefined) {
    console.log("No active conversation found, creating...");
    conversation = await addNewConversation(emailAddress, key);
  }
  return conversation;
}

async function sendToDialogFlow(
  conversation,
  replyText,
  languageCode = "en-US"
) {
  // TODO: projectId is undefined here
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
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

  const lastEntry = conversation.get("history").at(-1);

  if (
    lastEntry !== undefined &&
    lastEntry.response.queryResult.outputContexts !== undefined
  ) {
    const contexts = lastEntry.response.queryResult.outputContexts;
    if (contexts.length > 0) {
      request.queryParams = {
        contexts,
      };
    }
  }

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
  await appendConversationHistory(
    conversation,
    replyConfig.replyText,
    response
  );
  // Parse out the Intent and Fields?
  console.log("Dialogflow response");
  console.dir(response);
  const result = {
    isConversationComplete: response.queryResult.diagnosticInfo.fields.end_conversation.boolValue,
    response,
  };
  if (result.isConversationComplete) {
    console.log(`Setting isActive to false for conversation ${conversation.id}`);
    await conversation.ref.update({isActive: false});
  }
  return result;
}

module.exports = {
  processEmailReply,
};
