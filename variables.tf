# Should this be a map?
variable "project" {
    type = string
    description = "Google Project Name"
    default = "optimal-weft-359706"
}

variable "compute_service_account" {
    type = string
    description = "Default compute service"
    default = "serviceAccount:821913229073-compute@developer.gserviceaccount.com"
}

variable "inbound-email-received-topic" {
    type = string
    default = "inbound-email-received"
}

variable "sourcecode-file-name" {
    type = string
    default = "craigsdennis.dev.zip"
}