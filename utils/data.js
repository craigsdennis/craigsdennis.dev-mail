const Firestore = require("@google-cloud/firestore");
const { Storage } = require("@google-cloud/storage");

const db = new Firestore();
// TODO: terraform the messages bucket
const storage = new Storage();

function _getUserRef(emailAddress) {
  return db.collection("users").doc(emailAddress.toLowerCase());
}

async function doesUserExist(emailAddress) {
  // Check record
  const ref = await _getUserRef(emailAddress);
  const snap = await ref.get();
  return snap.exists;
}

async function addNewUser(emailAddress, data) {
  const newUserRef = await _getUserRef(emailAddress);
  newUserRef.create(data);
  // TODO: This work?
  return newUserRef.id;
}

async function retrieveConversation(emailAddress, key) {
  // TODO: Find by key
}

async function findActiveConversationFor(emailAddress, replyKey) {
  const userRef = await _getUserRef(emailAddress);
  const convos = await userRef
    .collection("conversations")
    .where("replyKey", "==", replyKey)
    .where("isActive", "==", true)
    .get();
  if (convos.empty) {
    return;
  }
  return convos.docs[0];
}

async function addNewConversation(emailAddress, replyKey) {
  const ref = await _getUserRef(emailAddress);
  const conversationRef = await ref.collection("conversations").add({
    history: [],
    isActive: true,
    replyKey,
  });
  return conversationRef.id;
}

async function appendConversationHistory(conversation, text, response) {
  // Update the conversation
  const entry = {
    request: {
      text,
    },
    response,
  };
  await conversation.update("history", Firestore.FieldValue.arrayUnion(entry));
  // Should this mark it as done?
}

async function storeMessageFor(emailAddress, message) {
  // Add metadata to messages collection for user
  const ref = await _getUserRef(emailAddress);
  const msgRef = await ref.collection("messages").add({
    messageId: message.messageId,
    date: message.date,
    subject: message.subject,
    attachmentCount: message.attachments.length,
  });
  // Store in bucket
  const storagePath = `${ref.id}/${msgRef.id}.json`;
  await storage
    .bucket(process.env.MESSAGES_BUCKET_NAME) // TODO: terraform to create and wire
    .file(storagePath)
    .save(JSON.stringify(message));
  await msgRef.update({ storagePath });
  return msgRef.id;
}

async function getMessages(emailAddress) {
  const ref = await _getUserRef(emailAddress);
  // ORDER BY
  const snap = await ref.collection("messages").get();
  const docs = snap.docs;
  return docs.map((doc) => doc.data());
}

module.exports = {
  doesUserExist,
  addNewUser,
  storeMessageFor,
  getMessages,
  addNewConversation,
  findActiveConversationFor,
  appendConversationHistory,
};
