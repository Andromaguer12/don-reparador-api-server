const e = require("express");
const express = require("express");
const { getDateFromTimestamp } = require("../utils/utilsFunctions");
const router = express.Router();

router.get('/prevent-server-idling', async (req, res) => {
  res.json({
    response: "preventing-server-idling-in-time-> " + getDateFromTimestamp(new Date().getTime()).date + '-' + getDateFromTimestamp(new Date().getTime()).hour,
  })
})

module.exports = router