const {getFirestore} = require("firebase-admin/firestore");

const firestore = getFirestore()

// refs

const userDataRef = firestore.collection("UsersData");
const ordersRef = firestore.collection("SubmittedOrders")

module.exports = {
    firestore,
    userDataRef,
    ordersRef
}