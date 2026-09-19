#!/usr/bin/env bash
# ==============================================================================
# 1-Click Frontend Deployment Script to EC2
# Usage: npm run deploy   (or: ./scripts/deploy.sh)
# ==============================================================================
set -euo pipefail

# 1. Resolve project directory (works no matter where you run the script from)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# 2. Server & SSH details
EC2_HOST="18.234.230.203"
EC2_USER="ec2-user"
KEY_PATH="${KEY_PATH:-$HOME/Downloads/tickhigh-everyday-ai.pem}"
DEST_PATH="/home/ec2-user/software/aiforeveryday-frontend"

if [ ! -f "$KEY_PATH" ]; then
  echo "❌ Error: SSH Key not found at: $KEY_PATH"
  echo "Please place tickhigh-everyday-ai.pem in your Downloads folder or set KEY_PATH environment variable."
  exit 1
fi

chmod 400 "$KEY_PATH" 2>/dev/null || true

echo "📦 [1/4] Building frontend for production..."
npm run build

echo "🚀 [2/4] Syncing build & assets to EC2 server ($EC2_HOST)..."
rsync -avz --delete \
  --exclude 'node_modules/' \
  --exclude '.git/' \
  --exclude '.DS_Store' \
  -e "ssh -i \"$KEY_PATH\" -o StrictHostKeyChecking=accept-new" \
  "$PROJECT_DIR/" "$EC2_USER@$EC2_HOST:$DEST_PATH/"

echo "🔒 [3/4] Updating directory permissions on server..."
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" \
  "chmod 755 /home/ec2-user && chmod -R 755 $DEST_PATH"

echo "🔄 [4/4] Validating and reloading Nginx..."
ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" \
  "sudo nginx -t && sudo systemctl reload nginx"

echo ""
echo "🎉 ======================================================="
echo "🎉 Deployment successful!"
echo "🌐 Live at: https://admin-everydayai.tickhighs.com"
echo "🎉 ======================================================="
