#!/bin/bash

# Exit on error
set -e

# --- CONFIGURATION ---
EC2_USER=ubuntu
EC2_IP=asaduzzaman.online
KEY_PATH="/Users/asad0016/My Drive/Cloud Services/AWS/Personal Website/WebServer-Asaduzzaman.pem"
REMOTE_DIR=/home/ubuntu/cgt-site
LOCAL_BUILD_DIR=dist
# ---------------------

echo "📦 Building React app..."
npm run build

echo "🚀 Uploading to EC2..."
rsync -avz -e "ssh -i '$KEY_PATH'" $LOCAL_BUILD_DIR/ $EC2_USER@$EC2_IP:/home/ubuntu/tmp-cgt-upload/

echo "🔐 Moving files and setting permissions..."
ssh -i "$KEY_PATH" $EC2_USER@$EC2_IP << EOF
  sudo rm -rf $REMOTE_DIR/*
  sudo mv /home/ubuntu/tmp-cgt-upload/* $REMOTE_DIR/
  sudo chown -R www-data:www-data $REMOTE_DIR
  sudo chmod -R 755 $REMOTE_DIR
  sudo systemctl reload nginx
EOF

echo "✅ Deployment complete! Visit https://cgt.asaduzzaman.online"