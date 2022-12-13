const functions = require("@google-cloud/functions-framework");

const parser = require("./parser");
const welcomeHandler = require("./welcome-handler");
const emailer = require("./emailer");
const keeper = require("./keeper");

functions.http("parser", parser);
functions.cloudEvent("welcome-handler", welcomeHandler);
functions.cloudEvent("emailer", emailer);
functions.cloudEvent("keeper", keeper);