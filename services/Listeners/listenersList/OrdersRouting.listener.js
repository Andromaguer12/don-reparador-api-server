const { default: axios } = require("axios");
const { haversineDistance } = require("../../../utils/utilsFunctions");
const { ordersRef, userDataRef } = require("../../Firebase/Firebase.firestore");

const placeOrdersRoutingListener = () => {
  ordersRef
    .where("timestamp", ">=", new Date().getTime() - 259200000)
    .onSnapshot((docs) => {
      docs.forEach((doc) => {
        userDataRef
          .where("auth", "==", "distributor")
          .where("online", "==", true)
          .get()
          .then((users) => {

            users.forEach((user) => {
              // filtering nearly users
              const { location } = doc.data();
              const { locationData } = user.data();

              let currentOrderLocation = [location.coords?.longitude, location.coords?.latitude];
              let currentUserLocation = [locationData.coordinates?.longitude || null, locationData.coordinates?.latitude || null];
              const distancesComparations = haversineDistance(
                currentOrderLocation,
                currentUserLocation,
                false
              ) * 1000
              if (user.data().position.includes(doc.data().category) && distancesComparations !== 0 && distancesComparations < 7000) {
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
                          console.log('reminder-notification-sended-listener to -> ' + user.id)
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

module.exports = placeOrdersRoutingListener;
