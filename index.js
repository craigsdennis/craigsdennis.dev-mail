const functions = require("@google-cloud/functions-framework");
const { PubSub } = require("@google-cloud/pubsub");
const sgMail = require("@sendgrid/mail");
const { simpleParser } = require("mailparser");
const { parseMultipartFormRequest } = require("./multipart");

pubsub = new PubSub();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

functions.http("parser", async (req, res) => {
  console.log("Parsing multi-part form data");
  const formData = await parseMultipartFormRequest(req);
  console.dir(formData);
  // TODO: Validate SendGrid was the sender
  // Parse Email Object
  console.log("Parsing email");
  const parsedMail = await simpleParser(formData.email);
  // Convert mail object to JSON to send
  const message = Buffer.from(JSON.stringify(parsedMail));
  pubsub.topic("inbound-email-received").publish(message);
  // Response back to SendGrid?
  res.status(200).send("OK");
});

functions.cloudEvent("send-welcome-email", (cloudEvent) => {
  console.log(
    `New inbound email received, sending welcome email ${cloudEvent}`
  );
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const message = cloudEvent.data.message.data;
  const json = Buffer.from(message, "base64").toString();
  const email = JSON.parse(json);
  console.log(`Email re-inflated, it is from: ${JSON.stringify(email.from)}`);
  const emailAddress = email.from.value[0].address;
  const name = email.from.value[0].name || emailAddress;
  const msg = {
    to: emailAddress,
    from: process.env.SENGRID_WELCOME_FROM,
    replyTo: process.env.SENGRID_WELCOME_REPLY_TO,
    templateId: process.env.SENGRID_TEMPLATE_WELCOME_ID,
    dynamicTemplateData: {
      name,
      incoming_subject: email.subject
    }
  };
  // TODO: Determine new user
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
});
