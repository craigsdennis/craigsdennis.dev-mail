const Firestore = require("@google-cloud/firestore");

const db = new Firestore();

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

async function getMessagesMetaData(emailAddress) {

}

module.exports = {
  doesUserExist,
  addNewUser,
  getMessagesMetaData,
};
