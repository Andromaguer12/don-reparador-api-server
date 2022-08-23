const {getFirestore} = require("firebase-admin/firestore");

const firestore = getFirestore()

// refs

const userDataRef = firestore.collection("UsersData");
const notificationsPosts = firestore.collection("NotificationsPosts");
const ordersRef = firestore.collection("SubmittedOrders")

module.exports = {
    firestore,
    userDataRef,
    ordersRef,
    notificationsPosts
}