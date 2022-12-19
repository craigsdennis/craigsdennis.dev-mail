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
}

async function storeMessageFor(emailAddress, message) {
  // Store in bucket
  const storagePath = `${emailAddress.toLowerCase()}/${message.messageId}.json`;
  await storage
    .bucket(process.env.MESSAGES_BUCKET_NAME) // TODO: terraform to create and wire
    .file(storagePath)
    .save(JSON.stringify(message));
  // Add metadata to messages collection for user
  const ref = await _getUserRef(emailAddress);
  // TODO: Will this just create it?
  // TODO: Creation Date
  await ref.collection("messages").add({
    messageId: message.messageId,
    date: message.date,
    subject: message.subject,
    attachmentCount: message.attachments.length,
    storagePath
  });
}

async function getMessages(emailAddress) {
  const ref = await _getUserRef(emailAddress);
  // ORDER BY
  const docs = await ref.collection("messages").get();
  return docs.map(doc => doc.data());
}

module.exports = {
  doesUserExist,
  addNewUser,
  storeMessageFor,
  getMessages,
};
