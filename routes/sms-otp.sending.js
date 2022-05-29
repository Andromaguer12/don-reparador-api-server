const express = require("express");
const { RANDOMID, encryptationFunctions, sendTwilioSms } = require("../utils/utilsFunctions");

const router = express.Router();

router.get("/generate-otp", async (req, res) => {
  const currentTime = new Date().getTime();
  const otp = RANDOMID("0123456789", 6);
  const currentResponse = {
    otpCode: otp,
    expireDate: currentTime + 90000,
  };
  const encrypted = encryptationFunctions(
    JSON.stringify([currentResponse]),
    String(currentTime),
    "encrypt"
  );

  res.send({ encrypted, key: String(currentTime) });
});

router.post("/send-otp-sms", async (req, res) => {
    const {phoneNumber, body} = req.body;
    if(phoneNumber?.length > 3){
        await sendTwilioSms({phoneNumber, body}).then(() => {
            res.json({
                status: "SMS Successfully sended"
            })
        }).catch((error) => {
            res.json("error:"+error)
        })
    }
    else{
        res.json("error:invalid-phone-number")
    }
})

module.exports = router;
