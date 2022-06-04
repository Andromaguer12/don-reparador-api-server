const CryptoJS = require("crypto-js");
const { twilioInstance } = require("../constants");
const { userDataRef } = require("../services/Firebase/Firebase.firestore");
const { messaging } = require("firebase-admin");
const {isUuid} = require("uuidv4")

const sendTwilioSms = ({ phoneNumber, body }) =>
  new Promise((response, reject) => {
    twilioInstance.messages
      .create({
        body,
        to: phoneNumber,
        from: process.env.CURRENT_PHONE_NUMBER,
      })
      .then(() => {
        response("message successfully sended");
      })
      .catch((err) => {
        reject("error-sending-message-" + err);
      });
  });

const encryptationFunctions = (string, key, mode) => {
  if (mode == "encrypt") {
    var encriptation = CryptoJS.AES.encrypt(string, key);
    return encriptation.toString();
  }
  if (mode == "decrypt") {
    var result = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(string, key)).toString();
    return result
  }
};

const RANDOMID = (chars, lon) => {
  let code = "";
  for (let x = 0; x < lon; x++) {
    var rand = Math.floor(Math.random() * chars.length);
    code += chars.substr(rand, 1);
  }
  return code;
};

const sendNewNotificationTo = (
  title,
  text,
  channel,
  link,
  auth,
  metadata,
  receiver,
  orderPost
) => {
  return new Promise((response, reject) => {
    if ((title, text, channel, auth, receiver)) {
      if (auth != "distributor") {
        if (metadata && !orderPost) {
          userDataRef
            .doc(`${receiver}`)
            .collection("UserNotifications")
            .doc(`${metadata.subject}${metadata.notId}`)
            .set({
              title,
              text,
              channel,
              link,
              auth,
              timestamp: new Date().getTime(),
            })
            .then(() => {
              response(true);
            })
            .catch((error) => reject(error));
        }
        if (!metadata && !orderPost) {
          userDataRef
            .doc(`${receiver}`)
            .collection("UserNotifications")
            .add({
              title,
              text,
              channel,
              link,
              auth,
              timestamp: new Date().getTime(),
            })
            .then(() => {
              response(true);
            })
            .catch((error) => reject(error));
        }
        if (orderPost) {
          userDataRef
            .doc(`${receiver}`)
            .collection("UserNotifications")
            .add({
              title,
              text,
              channel,
              link,
              auth,
              timestamp: new Date().getTime(),
              validations: orderPost.subject + orderPost.notId,
            })
            .then(() => {
              response(true);
            })
            .catch((error) => reject(error));
        }
      } else {
        userDataRef
          .doc(receiver)
          .get()
          .then((doc) => {
            if (doc.data().online) {
              if (metadata && !orderPost) {
                userDataRef
                  .doc(`${receiver}`)
                  .collection("UserNotifications")
                  .doc(`${metadata.subject}${metadata.notId}`)
                  .set({
                    title,
                    text,
                    channel,
                    link,
                    auth,
                    timestamp: new Date().getTime(),
                  })
                  .then(() => {
                    response(true);
                  })
                  .catch((error) => reject(error));
              }
              if (!metadata && !orderPost) {
                userDataRef
                  .doc(`${receiver}`)
                  .collection("UserNotifications")
                  .add({
                    title,
                    text,
                    channel,
                    link,
                    auth,
                    timestamp: new Date().getTime(),
                  })
                  .then(() => {
                    response(true);
                  })
                  .catch((error) => reject(error));
              }
              if (orderPost) {
                userDataRef
                  .doc(`${receiver}`)
                  .collection("UserNotifications")
                  .add({
                    title,
                    text,
                    channel,
                    link,
                    auth,
                    timestamp: new Date().getTime(),
                    validations: orderPost.subject + orderPost.notId,
                  })
                  .then(() => {
                    response(true);
                  })
                  .catch((error) => reject(error));
              }
            }
          });
      }
    } else {
      reject("Is neccessary provide all the properties");
    }
  });
};

const sendNewNotificationToFCM = (message) =>
  new Promise((response, reject) => {
    messaging()
      .send({
        token: process.env.FIREBASE_CLOUD_MESSAGING_TOKEN,
        data: message
      })
      .then(() => {
        console.log("notification-sended-fcm");
        response(true);
      })
      .catch((error) => {
        reject(error)
      })
  });

const haversineDistance = (coords1, coords2, isMiles) => {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  var lon1 = coords1[0];
  var lat1 = coords1[1];

  var lon2 = coords2[0];
  var lat2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  if (isMiles) d /= 1.60934;

  if(lon1 == null || lat1 == null || lon2 == null || lat2 == null) return null 
  return d;
};

const getDateFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return {
    date: `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }/${date.getFullYear()}`,
    hour: `${
      date.getHours() > 12
        ? `${date.getHours() - 12}`
        : `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}`
    }:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}${
      date.getHours() > 12 ? "pm" : "am"
    }`,
  };
};


const validateRequestToken = (token) => {
  let tokenTimestamp = parseInt(token?.substring(token.indexOf(':')+1, token.length))
  let tokenPattern = token?.substring(0, token.indexOf(':'));
  
  if(isUuid(tokenPattern) && tokenTimestamp > new Date().getTime() - 180000){
    return true
  }
  
  return false
}

module.exports = {
  RANDOMID,
  encryptationFunctions,
  sendTwilioSms,
  sendNewNotificationTo,
  haversineDistance,
  getDateFromTimestamp,
  sendNewNotificationToFCM,
  validateRequestToken
};
