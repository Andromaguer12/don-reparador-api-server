const express = require("express");
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
  .then(async ({id}) => {
    console.log("notification-sended-to -> ", receiver)
    if(metadata?.notCode){
      await validateNotCode(metadata?.notCode, {notid: id, email: receiver}).then((res) => {
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

module.exports = router;
