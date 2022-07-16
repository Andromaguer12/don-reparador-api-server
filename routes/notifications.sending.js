const { default: axios } = require("axios");
const express = require("express");
const { userDataRef } = require("../services/Firebase/Firebase.firestore");
const { sendNewNotificationTo, sendNewNotificationToFCM, validateNotCode } = require("../utils/utilsFunctions");

const router = express.Router();

router.post("/send", async (req, res) => {
  const { title, text, channel, link, auth, metadata, receiver, orderPost } = req.body;
  await sendNewNotificationTo(
    title,
    text,
    channel,
    link,
    auth,
    metadata,
    receiver,
    orderPost
  )
    .then(async ({ id }) => {
      console.log("notification-sended-to -> ", receiver)
      if (metadata?.notCode) {
        await validateNotCode(metadata?.notCode, { notid: id, email: receiver }).then((res) => {
          res.json(res)
        })
      }
      res.json({
        status: 'notification-sended',
        error: null
      })
    })
    .catch((error) => {
      res.json({
        status: 'error',
        error
      })
    })
});


router.post("/order-ring-sound", async (req, res) => {
  const { orderId, metadata, receiver } = req.body;
  await sendNewNotificationTo(
    "El experto ha llegado!",
    "Recibe a el experto que haz solicitado, pronto tu averia sera solucionada!",
    "system",
    "orders",
    "user",
    null,
    receiver,
    null
  )
    .then(async ({ id }) => {
      await userDataRef
        .doc(receiver)
        .collection("Orders")
        .doc(`${orderId}`)
        .update({ rignSound: "ring" })
        .then(async () => {
          setTimeout(async () => {
            await userDataRef
              .doc(receiver)
              .collection("Orders")
              .doc(`${orderId}`)
              .update({ rignSound: null })
              .then(async () => {
                console.log("ringing-to -> ", receiver)
                if (metadata?.notCode) {
                  await validateNotCode(metadata?.notCode, { notid: id, email: receiver }).then((res) => {
                    res.json(res)
                  })
                }
                res.json({
                  status: 'ringing-to-' + receiver,
                  error: null
                })
              })
          }, 3000);
        })

    })
    .catch((error) => {
      res.json({
        status: 'error',
        error
      })
    })
});

module.exports = router;
