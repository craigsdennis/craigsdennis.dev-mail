const functions = require("@google-cloud/functions-framework");

const parser = require("./parser");
const greeter = require("./greeter");
const emailer = require("./emailer");
const keeper = require("./keeper");

functions.http("parser", parser);
functions.cloudEvent("greeter", greeter);
functions.cloudEvent("emailer", emailer);
functions.cloudEvent("keeper", keeper);