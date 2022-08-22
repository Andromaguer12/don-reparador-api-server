const e = require("express");
const express = require("express");
const { validateRequestToken, getDateFromTimestamp } = require("../utils/utilsFunctions");
const { isUuid } = require('uuidv4');
const router = express.Router();
const { userDataRef } = require("../services/Firebase/Firebase.firestore");
const placeOrdersRouting = require("../services/scheduleFunctions/functions/OrdersRouting.no-listener");

router.post('/placing-order', async (req, res) => {
  console.log('placing-orders')
  try {
    placeOrdersRouting();
    setTimeout(() => {
      res.json({
        status: 200,
        message: 'notification-function-was-triggered'
      })
    }, 500);
  } catch (error) {
    setTimeout(() => {
      res.json({
        status: 400,
        message: null,
        error
      })
    }, 500);
  }
})

router.post('/mark-as-cancelled/:id', async (req, res) => {
  const { token } = req.body;
  const pattern = req.params.id;

  const orderId = pattern.substring(0, pattern.indexOf(":"))
  const owner = pattern.substring(pattern.indexOf(":") + 1, pattern.length)

  if (validateRequestToken(token)) {
    const currentRef = userDataRef
      .doc(owner)
      .collection("Orders")
      .doc(orderId)

    currentRef.get().then((doc) => {
      if (doc.data().workingState === "submitted" && doc.data().expireDate <= new Date().getTime()) {
        currentRef
          .update({ workingState: "cancelled" })
          .then(() => {
            res.json({
              status: "order-" + orderId + "-marked-as-cancelled",
              error: null
            })
          })
      }
      else {
        res.json({
          status: "operation-not-permitted",
          error: "the order is in a state that cannot be modified."
        })
      }
    }).catch((error) => {
      res.json({
        status: "there-was-an-error",
        error
      })
    })

  }
  else {
    res.json({
      status: `invalid`,
      error: 'the token provided was not valid for this request'
    })
  }
})

module.exports = router