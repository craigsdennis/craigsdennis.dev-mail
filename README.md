# Automatic inbound email parser

Experimenting on my craigsdennis.dev domain with [SendGrid Inbound Parse](https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook) using [Google Cloud Functions gen2](https://codelabs.developers.google.com/codelabs/cloud-starting-cloudfunctions-v2#3)

Requires setting `SENDGRID_API_KEY` in the [Secret Manager](https://cloud.google.com/functions/docs/configuring/secrets)

Warning this very much #LearningInPublic and I have literally no idea what I am doing. Proceed at your own risk.


## Deployment

This makes use of [Terraform](https://terraform.io) for infrastructure as code.

Zip up the Google Cloud Functions

```bash
npm run pack
# Wire up the functions and services
terraform apply
```




