const admin = require("firebase-admin");

const serviceAccount = require('../../project-key.json')

const initializeFirebaseService = () =>
  new Promise(async (response, reject) => {
    try {
      await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://DATA_BASE_URL.firebaseio.com"
      });
      console.log("Firebase Initialized");
      response(true);
    } catch (error) {
      reject(error);
    }
  });

module.exports = {
  initializeFirebaseService,
};
