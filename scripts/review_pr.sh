#!/bin/bash
# Wrapper script for webhook binary to call the Python review script
# Reads payload from PAYLOAD_FILE env var and passes to Python script

cd /var/www/caal-tools

# Load environment variables from webhook service
source /etc/default/webhook 2>/dev/null || true

export CLAUDE_PATH="${CLAUDE_PATH:-/usr/local/bin/claude}"

# Read payload from file and pipe to Python script
if [ -n "$PAYLOAD_FILE" ] && [ -f "$PAYLOAD_FILE" ]; then
    cat "$PAYLOAD_FILE" | python3 scripts/review_pr.py
else
    echo "No PAYLOAD_FILE provided"
    exit 1
fi
