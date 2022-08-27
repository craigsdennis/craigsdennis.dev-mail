const busboy = require("busboy");

function parseMultipartFormRequest(req) {
  return new Promise((resolve, reject) => {
    // TODO: Errors?
    const fields = {};
    busboy({ headers: req.headers })
      .on("field", (name, value) => {fields[name] = value})
      .on("finish", () => resolve(fields))
      .end(req.rawBody);
  });
}

module.exports = {
  parseMultipartFormRequest
}