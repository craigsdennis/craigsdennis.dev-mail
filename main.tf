terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.34.0"
    }
  }
}

provider "google" {
  project = var.project
}


resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_storage_bucket" "bucket" {
  name                        = "${random_id.bucket_prefix.hex}-gcf-source" # Every bucket name must be globally unique
  location                    = "US"
  uniform_bucket_level_access = true
}


resource "google_storage_bucket_object" "sourcecode" {
  name   = var.sourcecode-file-name
  bucket = google_storage_bucket.bucket.name
  source = var.sourcecode-file-name
}


resource "google_cloudfunctions2_function" "parser" {
  name        = "sendgrid-inbound-parser"
  location    = "us-west1"
  description = "Inbound Parse webhook handler from SendGrid"

  build_config {
    runtime     = "nodejs16"
    entry_point = "parser"
    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.sourcecode.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
    
    environment_variables = {
      TOPIC_INBOUND_EMAIL = var.inbound-email-received-topic
    }
  }
}

resource "google_cloud_run_service_iam_binding" "allUsers" {
  location = google_cloudfunctions2_function.parser.location
  service  = google_cloudfunctions2_function.parser.name
  role     = "roles/run.invoker"
  members = [
    "allUsers"
  ]
}

resource "google_pubsub_topic" "inbound_topic" {
  name = var.inbound-email-received-topic
}

resource "google_cloudfunctions2_function" "welcome-handler" {
  name        = "welcome-handler"
  location    = "us-west1"
  description = "Handles new user incoming email"

  build_config {
    runtime     = "nodejs16"
    entry_point = "welcome-handler" # Set the entry point 
    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.sourcecode.name
      }
    }
  }

  service_config {
    max_instance_count = 3
    min_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
    ingress_settings = "ALLOW_INTERNAL_ONLY"
    all_traffic_on_latest_revision = true
  }
  
  event_trigger {
    trigger_region = "us-west1"
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.inbound_topic.id
    retry_policy   = "RETRY_POLICY_RETRY"
  }
}

resource "google_cloud_run_service_iam_binding" "welcome-handler-binding" {
  location = google_cloudfunctions2_function.welcome-handler.location
  service  = google_cloudfunctions2_function.welcome-handler.name
  role     = "roles/run.invoker"
  members = [
    var.compute_service_account
  ]
}

resource "google_pubsub_topic_iam_binding" "inbound_binding" {
  project = var.project
  topic = google_pubsub_topic.inbound_topic.name
  role = "roles/pubsub.admin"
  members = [
    var.compute_service_account,
  ]
}


resource "google_secret_manager_secret_iam_binding" "sengrid_api_secret_binding" {
  project = var.project
  secret_id = "SENDGRID_API_KEY"
  role = "roles/secretmanager.secretAccessor"
  # TODO: make this better
  members = [var.compute_service_account]
}

output "sendgrid_webhook_url" {
  value = google_cloudfunctions2_function.parser.service_config[0].uri
}