// Add things to the email as needed one place to send
const sgMail = require("@sendgrid/mail");
const { getMessages } = require("./utils/data");
const { objectFromEvent } = require("./utils/events");




module.exports = async function (cloudEvent) {
  const config = objectFromEvent(cloudEvent);
  // TODO: Validate schema
  const templateKey = config.templateKey;
  // TODO: This is a little dorky...a module?
  const templateId = process.env[templateKey + "_TEMPLATE_ID"];
  const from = process.env[templateKey + "_FROM"];
  const replyTo = process.env[templateKey + "_REPLY_TO"];
  const msg = {
    to: config.to,
    templateId,
    from,
    replyTo,
    // content: [
    //   {
    //     type: "text/html",
    //     value:
    //     "<p>NA. This is overridden by the template, but required by TypeScript 🤷‍♂️</p>",
    //   },
    // ],
    dynamicTemplateData: {
      ...config.data
    }
  };
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return sgMail.send(msg);
};
