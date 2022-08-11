const e = require("express");
const express = require("express");
const cancelExpiredOrders = require("../services/scheduleFunctions/functions/cancelExpiredOrders");
const placeOrdersRouting = require("../services/scheduleFunctions/functions/OrdersRouting.no-listener");
const { getDateFromTimestamp } = require("../utils/utilsFunctions");
const router = express.Router();

router.get('/prevent-server-idling', async (req, res) => {
  placeOrdersRouting();
  cancelExpiredOrders();
  res.json({
    response: "preventing-server-idling-in-time-> " + getDateFromTimestamp(new Date().getTime()).date + '-' + getDateFromTimestamp(new Date().getTime()).hour,
  })
})

module.exports = router