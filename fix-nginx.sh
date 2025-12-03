#!/bin/bash
# Script to fix nginx configuration for large file uploads

NGINX_CONFIG="/etc/nginx/sites-enabled/whatsapp-analyzer"
BACKUP_CONFIG="/etc/nginx/sites-enabled/whatsapp-analyzer.backup"

# Create backup
sudo cp "$NGINX_CONFIG" "$BACKUP_CONFIG"

# Create temporary file with fixes
sudo sed -i '/server_name api.analyser.chat;/a\
    client_max_body_size 20M;\
    client_body_buffer_size 20M;\
    proxy_connect_timeout 600;\
    proxy_send_timeout 600;\
    proxy_read_timeout 600;\
    send_timeout 600;
' "$NGINX_CONFIG"

# Add proxy settings inside location block
sudo sed -i '/proxy_set_header X-Forwarded-Proto \$scheme;/a\
        proxy_buffering off;\
        proxy_request_buffering off;
' "$NGINX_CONFIG"

# Test configuration
if sudo nginx -t; then
    echo "Configuration test passed. Reloading nginx..."
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully!"
else
    echo "Configuration test failed. Restoring backup..."
    sudo cp "$BACKUP_CONFIG" "$NGINX_CONFIG"
    echo "Backup restored. Please check the configuration manually."
    exit 1
fi


