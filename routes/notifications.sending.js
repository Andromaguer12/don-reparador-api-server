const express = require("express");
const { sendNewNotificationTo } = require("../utils/utilsFunctions");

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
  .then(async () => {
    console.log("notification-sended-to -> ", receiver)
    res.json({
      status: "notification-sended",
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

module.exports = router;
