const functions = require("@google-cloud/functions-framework");

const parser = require("./parser");
const welcomeHandler = require("./welcome-handler");

functions.http("parser", parser);
functions.cloudEvent("welcome-handler", welcomeHandler);