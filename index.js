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
  server.applyMiddleware({ app, path: "/apollo-server" });

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
  app.use("/api/otp-sending", require("./routes/sms-otp.sending"));
  app.use("/api/send-notification", require("./routes/notifications.sending"));
  app.use("/api/request-balances", require("./routes/user.balances"));

  // DATABASE
  connectingDB();

  // using Listeners
  require("./services/Listeners/listeners.index")();


  app.listen(process.env.PORT || 8080, () => {
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
