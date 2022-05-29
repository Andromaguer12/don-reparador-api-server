const placeOrdersRoutingListener = require("./listenersList/OrdersRouting.listener");

const listenersList = [
    placeOrdersRoutingListener
]

const connectListeners = () => {
    listenersList.forEach((listener) => {
        listener();
    })
}

module.exports = connectListeners