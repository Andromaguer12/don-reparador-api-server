const { userDataRef } = require("../Firebase.firestore")
const admin = require("firebase-admin");

const sendToSpecificUser = (userToSend, messageBody) => new Promise((response, reject) => {
  userDataRef
    .doc(userToSend)
    .get()
    .then((doc) => {
      const owner = doc.data();

      if (Array.isArray(owner.currentDevice)) {
        admin.messaging().sendToDevice(
          owner.currentDevice,
          {
            data: {
              subject: "ALARM NOTIFICATION",
              action: "null"
            },
            notification: {
              title: messageBody.title,
              body: messageBody.text
            }
          },
          {
            contentAvailable: true,
            priority: 'high'
          }
        )
          .then(() => {
            console.log("message-sent-throughout-FCM-to-> " + userToSend)
            response("message-sent-to-> " + userToSend)
          })
          .catch((err) => {
            reject(err)
          })
      }
      else {
        response('message-not-sent-missing-device-tokens')
      }
    })
})

module.exports = {
  sendToSpecificUser
}