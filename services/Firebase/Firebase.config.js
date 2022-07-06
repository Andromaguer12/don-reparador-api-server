const { initializeApp, applicationDefault } = require("firebase-admin/app");

const initializeFirebaseService = () =>
  new Promise(async (response, reject) => {
    try {
      await initializeApp({
        credential: applicationDefault(),
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
