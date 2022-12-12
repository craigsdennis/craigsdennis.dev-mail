// Add things to the email as needed one place to send
const sgMail = require("@sendgrid/mail");
const { objectFromEvent } = require("./utils/events");


module.exports = async function (cloudEvent) {
  console.log(`There are ${process.env.SENDGRID_API_KEY.length} characters in the SG KEY`);
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const config = objectFromEvent(cloudEvent);
  // Validate schema
  console.log("Config is...")
  console.dir(config);
  const templateKey = config.templateKey;
  const templateId = process.env[templateKey + "_TEMPLATE_ID"];
  const from = process.env[templateKey + "_FROM"];
  const replyTo = process.env[templateKey + "_REPLY_TO"];
  const msg = {
    to: config.to,
    templateId,
    from,
    replyTo,
    content: [
      {
        type: "text/html",
        value:
          "<p>NA. This is overridden by the template, but required by TypeScript 🤷‍♂️</p>",
      },
    ],
    dynamicTemplateData: {
      ...config.data,
    },
  };
  console.log("Msg is...");
  console.dir(msg);

  return sgMail.send(msg);
};
