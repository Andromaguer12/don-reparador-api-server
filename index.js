// imports
const express = require("express");
const cors = require("cors");
const { typeDefs } = require("./graphql/config/typeDefs");
const resolvers = require("./graphql/config/resolvers");
const { ApolloServer } = require("apollo-server-express");
const { connectingDB } = require("./services/MongoDB/config");
const {
  initializeFirebaseService,
} = require("./services/Firebase/Firebase.config");
const { default: axios } = require("axios");

const startKeepAlive = () => {
  setInterval(() => {
    axios.get(
      require('express')().get('env') === 'development'
        ? process.env.CURRENT_DOMAIN_DEV + '/api/server/prevent-server-idling'
        : process.env.CURRENT_DOMAIN + '/api/server/prevent-server-idling'
    )
      .then((res) => {
        console.log("preventing-idling->", res.data);
      })
      .catch((err) => {
        console.log("error-preventing-idling", err)
      })
  }, 20 * 60 * 1000);
}

// connect apollo server
const executeServer = async () => {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  //init apollo-server
  await server.start();

  // applying middlewares
  app.use(cors())
  // server.applyMiddleware({ app, path: "/apollo-server" });

  // express settings
  require("dotenv").config();
  app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:8081", 'https://donreparador.pe'],
      methods: ["GET", "POST"],
    })
  );
  app.use(require("express").json());

  // routes
  app.use("/", (req, res) => {
    res.json({
      message: "welcome to, don-reparador-api-server",
      error: null,
      statusCode: 200
    })
  });
  app.use("/api/otp-sending", require("./routes/sms-otp.sending"));
  app.use("/api/send-notification", require("./routes/notifications.sending"));
  app.use("/api/request-balances", require("./routes/user.balances"));
  app.use("/api/orders-actions", require("./routes/orders.actions"));
  app.use("/api/server", require("./routes/prevent.idling"));

  // DATABASE
  connectingDB();

  // using Listeners
  require("./services/Listeners/listeners.index")();

  // using schedule functions
  require("./services/scheduleFunctions/schedule.functions")();


  app.listen(process.env.PORT || 8080, () => {
    startKeepAlive();
    console.log(
      `server initialized in port ${process.env.PORT || 8080}, and graphql ${server.graphqlPath
      }`
    );
  });

  return { server, app };
};

// FIREBASE
initializeFirebaseService().then(() => {
  executeServer();
});
