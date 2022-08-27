echo "Deploying functions"
gcloud functions deploy sendgrid-inbound-parser --gen2 --runtime nodejs16 --entry-point parser --trigger-http
gcloud functions deploy send-welcome-email --gen2 --runtime=nodejs16 --entry-point=send-welcome-email --trigger-topic=inbound-email-received