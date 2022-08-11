const { default: axios } = require("axios");
const { haversineDistance } = require("../../../utils/utilsFunctions");
const { ordersRef, userDataRef } = require("../../Firebase/Firebase.firestore");

const placeOrdersRouting = () => {
  ordersRef
    .where("timestamp", ">=", new Date().getTime() - 259200000)
    .get()
    .then((docs) => {
      console.log("evaluating-orders-for-send-notification");
      docs.forEach((doc) => {
        userDataRef
          .where("auth", "==", "distributor")
          .get()
          .then((users) => {

            users.forEach((user) => {
              // filtering nearly users
              const { location } = doc.data(); // order
              const { locationData } = user.data(); // user location

              let currentOrderLocation = [location.coords?.longitude, location.coords?.latitude];
              let currentUserLocation = [locationData.coordinates?.longitude || null, locationData.coordinates?.latitude || null];
              const distancesComparations = haversineDistance(
                currentUserLocation,
                currentOrderLocation,
                false
              ) * 1000

              if (user.data().position.includes(doc.data().category) && distancesComparations !== 0 && distancesComparations <= 7000) {
                userDataRef
                  .doc(user.id)
                  .collection("UserNotifications")
                  .where("validations", "==", `newOrder:${doc.id}`)
                  .get()
                  .then(async (docs) => {
                    let times = 0;
                    docs.forEach(() => times++);
                    if (times === 0) {
                      if (doc.data().owner != user.id) {
                        await axios.post(
                          process.env.CURRENT_DOMAIN +
                          "/api/send-notification/send",
                          {
                            title:
                              "Un usuario ha enviado una orden en " +
                              doc.data().category,
                            text: "Corre y envia una oferta, tal vez sea tu dia de suerte!",
                            channel: "system",
                            link: null,
                            auth: "distributor",
                            metadata: null,
                            receiver: user.id,
                            orderPost: {
                              subject: "newOrder:",
                              notId: doc.id,
                            },
                          }
                        ).then(() => {
                          console.log('reminder-notification-sended-no-listener to -> ' + user.id)
                        })
                      }
                    }
                  });
              }
            });
          });
      });
    });
};

module.exports = placeOrdersRouting;