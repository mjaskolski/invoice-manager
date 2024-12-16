#!/bin/bash

# Directory paths
export SOURCE_DIR="/Users/michal/Library/Mobile Documents/com~apple~CloudDocs/Faktury Wondelai/Inbox/"
export BASE_TARGET_DIR="/Users/michal/Library/Mobile Documents/com~apple~CloudDocs/Faktury Wondelai/"

# Check if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Error: ANTHROPIC_API_KEY environment variable is not set"
    echo "Please set it using: export ANTHROPIC_API_KEY='your-api-key'"
    exit 1
fi

# Run the Node.js script
node invoice-processor.js 