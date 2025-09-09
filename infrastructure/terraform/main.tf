# Terraform Configuration for Fixia Infrastructure
# Provider configuration for Railway and Vercel

terraform {
  required_version = ">= 1.0"
  required_providers {
    railway = {
      source  = "railway-app/railway"
      version = "~> 0.3.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15.0"
    }
  }
  
  backend "remote" {
    organization = "fixia-devops"
    workspaces {
      name = "fixia-infrastructure"
    }
  }
}

# Variables
variable "environment" {
  description = "Environment (staging, production)"
  type        = string
  default     = "production"
}

variable "jwt_secret" {
  description = "JWT Secret for authentication"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Custom domain for the application"
  type        = string
  default     = "fixia.com.ar"
}

# Railway Project
resource "railway_project" "fixia_api" {
  name = "fixia-api-${var.environment}"
  
  variables = {
    NODE_ENV        = var.environment
    JWT_SECRET      = var.jwt_secret
    ALLOWED_ORIGINS = "https://${var.domain_name},https://www.${var.domain_name}"
  }
  
  tags = {
    Environment = var.environment
    Project     = "fixia"
    Team        = "backend"
  }
}

# PostgreSQL Database
resource "railway_service" "postgres" {
  project_id = railway_project.fixia_api.id
  name       = "postgres"
  
  source = {
    image = "postgres:15"
  }
  
  variables = {
    POSTGRES_DB       = "fixia_${var.environment}"
    POSTGRES_USER     = "fixia_user"
    POSTGRES_PASSWORD = random_password.db_password.result
  }
}

# API Service
resource "railway_service" "api" {
  project_id = railway_project.fixia_api.id
  name       = "api"
  
  source = {
    repo   = "fixia-marketplace"
    branch = var.environment == "production" ? "main" : "develop"
  }
  
  root_directory = "apps/api"
  
  variables = {
    DATABASE_URL = railway_service.postgres.database_url
  }
  
  domains = [
    "api.${var.domain_name}"
  ]
}

# Vercel Project
resource "vercel_project" "fixia_web" {
  name      = "fixia-web-${var.environment}"
  framework = "vite"
  
  root_directory   = "apps/web"
  build_command    = "npm run build"
  output_directory = "dist"
  
  environment = [
    {
      key    = "VITE_API_URL"
      value  = "https://api.${var.domain_name}"
      target = ["production", "preview"]
    },
    {
      key    = "VITE_APP_NAME"
      value  = "Fixia"
      target = ["production", "preview"]
    }
  ]
}

# Domain Configuration
resource "vercel_domain" "fixia_domain" {
  domain     = var.domain_name
  project_id = vercel_project.fixia_web.id
}

resource "vercel_domain" "fixia_www" {
  domain     = "www.${var.domain_name}"
  project_id = vercel_project.fixia_web.id
}

# Random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Outputs
output "api_url" {
  value = "https://api.${var.domain_name}"
}

output "web_url" {
  value = "https://${var.domain_name}"
}

output "database_connection" {
  value     = railway_service.postgres.database_url
  sensitive = true
}