const { userDataRef } = require("../../Firebase/Firebase.firestore")

const cancelExpiredOrders = async () => {
  const users = [];
  console.log("looking-for-expired-orders...");
  await userDataRef.get().then((docs) => {
    docs.forEach((doc) => {
      users.push(doc.id);
    })

    if (users.length > 0) {
      const promises = []

      users.forEach((user) => {
        const ref = userDataRef.doc(user).collection("Orders")
        promises.push(new Promise(async (response) => {
          var length = 0;
          var count = 0;
          await ref
            .where("workingState", "==", "submitted")
            .get()
            .then((docs) => {
              docs.forEach(async (doc) => {
                count++;
                if (doc.data().expireDate <= new Date().getTime()) {
                  await ref
                    .doc(doc.id)
                    .update({ workingState: "cancelled" })
                    .then(() => {
                      length++;
                    })
                }
              })
            })
          if (length == count) {
            response({
              status: "orders-updated-for-" + user,
              error: null
            });
          }
        }))
      })

      Promise.all(promises).then((values) => {
        console.log("some-orders-has-been-updated-to-cancelled...");
      })
    }
  })
}

module.exports = cancelExpiredOrders;