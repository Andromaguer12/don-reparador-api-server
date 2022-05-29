const { default: axios } = require("axios");
const { getDateFromTimestamp } = require("../../../utils/utilsFunctions");
const { ordersRef, userDataRef } = require("../../Firebase/Firebase.firestore");

const placeOrdersRoutingListener = () => {
  ordersRef
    .where("timestamp", ">=", new Date().getTime() - 259200000)
    .onSnapshot((docs) => {
        docs.forEach((doc) => {
        userDataRef
          .where("city", "==", doc.data().region)
          .where("membership", "==", "premium")
          .where("auth", "==", "distributor")
          .where("online", "==", true)
          .get()
          .then((users) => {
            users.forEach((user) => {
              if (user.data().position.includes(doc.data().category)) {
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
                        );
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
