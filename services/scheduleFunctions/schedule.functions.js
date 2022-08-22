const schedule = require("node-schedule");
const cancelExpiredOrders = require("./functions/cancelExpiredOrders");
const placeOrdersRouting = require("./functions/OrdersRouting.no-listener");

const functionsList = [
    () => schedule.scheduleJob("*/30 * * * *", cancelExpiredOrders),
    // () => schedule.scheduleJob("*/1 * * * *", placeOrdersRouting)
]

const scheduleFunctions = () => {
    functionsList.forEach((func) => {
        func();
    })
}

module.exports = scheduleFunctions