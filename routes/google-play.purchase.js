const e = require("express");
const express = require("express");
const { validateRequestToken } = require("../utils/utilsFunctions");
const router = express.Router();
const { userDataRef } = require("../services/Firebase/Firebase.firestore");

router.post('/save-receipt-id', async (req, res) => {
  const { purchaseReceipt } = req.body;
  const { token, receipt } = purchaseReceipt;
  const { owner, purchaseId } = receipt;

  if (validateRequestToken(token)) {
    const currentRef = userDataRef
      .doc(owner)
      .collection("PurchasesReceipts")
      .doc(purchaseId)

    delete receipt.purchaseId;

    currentRef.set({ ...receipt }).then((doc) => {
      res.json({
        status: 200,
        message: 'saved-the-receipt',
      })
    }).catch((error) => {
      res.json({
        status: 400,
        message: "there-was-an-error",
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