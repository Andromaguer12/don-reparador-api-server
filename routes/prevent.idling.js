const e = require("express");
const express = require("express");
const router = express.Router();

router.get('/prevent-server-idling', async (req, res) => {
  res.send("preventing-server-idling-in-time", new Date().getDate())
})

module.exports = router