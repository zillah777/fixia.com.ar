#!/bin/bash
set -euo pipefail

# Fixia Disaster Recovery and Backup System
# Version: 1.0.0
# Last Updated: 2024-08-21

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-/opt/fixia-backups}"
S3_BUCKET="${S3_BUCKET:-fixia-backups-production}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
LOG_FILE="${LOG_FILE:-/var/log/fixia-backup.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${2:-$NC}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() { log "ERROR: $1" "$RED"; }
warn() { log "WARNING: $1" "$YELLOW"; }
info() { log "INFO: $1" "$BLUE"; }
success() { log "SUCCESS: $1" "$GREEN"; }

# Check dependencies
check_dependencies() {
    local deps=("pg_dump" "aws" "docker" "railway" "vercel")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing dependencies: ${missing_deps[*]}"
        error "Please install missing tools before proceeding"
        exit 1
    fi
    
    success "All dependencies are available"
}

# Create backup directory structure
setup_backup_directory() {
    local backup_date=$(date +%Y-%m-%d)
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    
    export CURRENT_BACKUP_DIR="$BACKUP_DIR/$backup_date/$backup_timestamp"
    
    mkdir -p "$CURRENT_BACKUP_DIR"/{database,code,config,logs,monitoring}
    
    info "Created backup directory: $CURRENT_BACKUP_DIR"
}

# Database backup
backup_database() {
    info "Starting database backup..."
    
    local db_backup_file="$CURRENT_BACKUP_DIR/database/fixia_production_$(date +%Y%m%d_%H%M%S).sql"
    
    # Get database URL from Railway
    local database_url
    database_url=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
    
    if [[ -z "$database_url" ]]; then
        error "Could not retrieve DATABASE_URL from Railway"
        return 1
    fi
    
    # Create database dump
    if pg_dump "$database_url" > "$db_backup_file"; then
        success "Database backup completed: $(basename "$db_backup_file")"
        
        # Compress backup
        gzip "$db_backup_file"
        info "Database backup compressed: ${db_backup_file}.gz"
    else
        error "Database backup failed"
        return 1
    fi
    
    # Backup database schema separately
    pg_dump "$database_url" --schema-only > "$CURRENT_BACKUP_DIR/database/schema_$(date +%Y%m%d_%H%M%S).sql"
    info "Database schema backup completed"
}

# Code repository backup
backup_code() {
    info "Starting code repository backup..."
    
    local code_backup_file="$CURRENT_BACKUP_DIR/code/fixia_code_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Create archive excluding node_modules and build artifacts
    tar -czf "$code_backup_file" \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude="build" \
        --exclude=".git" \
        --exclude="*.log" \
        -C "$PROJECT_ROOT" .
    
    success "Code backup completed: $(basename "$code_backup_file")"
}

# Configuration backup
backup_configuration() {
    info "Starting configuration backup..."
    
    local config_dir="$CURRENT_BACKUP_DIR/config"
    
    # Export Railway configuration
    if railway variables > "$config_dir/railway_variables.json" 2>/dev/null; then
        info "Railway configuration exported"
    else
        warn "Could not export Railway configuration"
    fi
    
    # Export Vercel configuration (if available)
    if vercel env ls --format json > "$config_dir/vercel_variables.json" 2>/dev/null; then
        info "Vercel configuration exported"
    else
        warn "Could not export Vercel configuration"
    fi
    
    # Backup important config files
    cp "$PROJECT_ROOT/railway.json" "$config_dir/" 2>/dev/null || warn "railway.json not found"
    cp "$PROJECT_ROOT/vercel.json" "$config_dir/" 2>/dev/null || warn "vercel.json not found"
    cp "$PROJECT_ROOT/package.json" "$config_dir/" 2>/dev/null || warn "package.json not found"
    
    success "Configuration backup completed"
}

# Logs backup
backup_logs() {
    info "Starting logs backup..."
    
    local logs_dir="$CURRENT_BACKUP_DIR/logs"
    
    # Export Railway logs (last 7 days)
    if railway logs --tail 10000 > "$logs_dir/railway_logs_$(date +%Y%m%d).log" 2>/dev/null; then
        info "Railway logs exported"
    else
        warn "Could not export Railway logs"
    fi
    
    # Copy local logs if they exist
    if [[ -d "/var/log/fixia" ]]; then
        cp -r /var/log/fixia/* "$logs_dir/" 2>/dev/null || warn "Could not copy local logs"
    fi
    
    success "Logs backup completed"
}

# Monitoring data backup
backup_monitoring() {
    info "Starting monitoring data backup..."
    
    local monitoring_dir="$CURRENT_BACKUP_DIR/monitoring"
    
    # Export Prometheus data (if running locally)
    if docker ps | grep -q prometheus; then
        docker exec prometheus tar -czf /tmp/prometheus_data.tar.gz /prometheus 2>/dev/null || warn "Prometheus data export failed"
        docker cp prometheus:/tmp/prometheus_data.tar.gz "$monitoring_dir/" 2>/dev/null || warn "Could not copy Prometheus data"
    fi
    
    # Export Grafana dashboards
    if docker ps | grep -q grafana; then
        docker exec grafana tar -czf /tmp/grafana_data.tar.gz /var/lib/grafana 2>/dev/null || warn "Grafana data export failed"
        docker cp grafana:/tmp/grafana_data.tar.gz "$monitoring_dir/" 2>/dev/null || warn "Could not copy Grafana data"
    fi
    
    success "Monitoring data backup completed"
}

# Upload to S3
upload_to_s3() {
    info "Starting upload to S3..."
    
    local backup_archive="$BACKUP_DIR/fixia_full_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Create archive of entire backup
    tar -czf "$backup_archive" -C "$BACKUP_DIR" "$(basename "$(dirname "$CURRENT_BACKUP_DIR")")"
    
    # Upload to S3
    if aws s3 cp "$backup_archive" "s3://$S3_BUCKET/$(date +%Y/%m/)"; then
        success "Backup uploaded to S3: s3://$S3_BUCKET/$(date +%Y/%m/)/$(basename "$backup_archive")"
        
        # Clean up local archive
        rm -f "$backup_archive"
    else
        error "Failed to upload backup to S3"
        return 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    # Clean local backups
    find "$BACKUP_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || warn "Local cleanup had some issues"
    
    # Clean S3 backups
    aws s3 ls "s3://$S3_BUCKET/" --recursive | while read -r line; do
        local create_date=$(echo "$line" | awk '{print $1" "$2}')
        local file_path=$(echo "$line" | awk '{print $4}')
        
        if [[ $(date -d "$create_date" +%s) -lt $(date -d "$RETENTION_DAYS days ago" +%s) ]]; then
            aws s3 rm "s3://$S3_BUCKET/$file_path"
            info "Deleted old S3 backup: $file_path"
        fi
    done
    
    success "Cleanup completed"
}

# Restore from backup
restore_database() {
    local backup_file="$1"
    
    if [[ -z "$backup_file" ]]; then
        error "Backup file not specified"
        return 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    info "Starting database restore from: $(basename "$backup_file")"
    
    # Get database URL
    local database_url
    database_url=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
    
    if [[ -z "$database_url" ]]; then
        error "Could not retrieve DATABASE_URL from Railway"
        return 1
    fi
    
    # Confirm restore
    echo -e "${YELLOW}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure you want to proceed? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        info "Restore cancelled by user"
        return 1
    fi
    
    # Extract if gzipped
    local restore_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        restore_file="${backup_file%.gz}"
        gunzip -c "$backup_file" > "$restore_file"
    fi
    
    # Restore database
    if psql "$database_url" < "$restore_file"; then
        success "Database restore completed successfully"
    else
        error "Database restore failed"
        return 1
    fi
    
    # Clean up temporary file
    if [[ "$restore_file" != "$backup_file" ]]; then
        rm -f "$restore_file"
    fi
}

# Health check after restore
health_check() {
    info "Running post-restore health checks..."
    
    local api_url="https://api.fixia.com.ar"
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -sf "$api_url/health" >/dev/null 2>&1; then
            success "API health check passed"
            break
        fi
        
        ((attempt++))
        info "Waiting for API to respond... ($attempt/$max_attempts)"
        sleep 10
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "API health check failed after $max_attempts attempts"
        return 1
    fi
    
    # Check database connectivity
    if railway run "node -e 'require(\"@prisma/client\").PrismaClient().then(()=>console.log(\"DB OK\"))'"; then
        success "Database connectivity check passed"
    else
        error "Database connectivity check failed"
        return 1
    fi
}

# Main backup function
backup() {
    info "Starting Fixia backup process..."
    
    check_dependencies
    setup_backup_directory
    
    backup_database
    backup_code
    backup_configuration
    backup_logs
    backup_monitoring
    
    upload_to_s3
    cleanup_old_backups
    
    success "Backup process completed successfully"
    info "Backup location: $CURRENT_BACKUP_DIR"
}

# Main function
main() {
    case "${1:-}" in
        "backup")
            backup
            ;;
        "restore")
            if [[ -z "${2:-}" ]]; then
                error "Usage: $0 restore <backup_file>"
                exit 1
            fi
            restore_database "$2"
            health_check
            ;;
        "health-check")
            health_check
            ;;
        *)
            echo "Usage: $0 {backup|restore <file>|health-check}"
            echo "  backup           - Create full system backup"
            echo "  restore <file>   - Restore database from backup file"
            echo "  health-check     - Run system health checks"
            exit 1
            ;;
    esac
}

# Handle script signals
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"