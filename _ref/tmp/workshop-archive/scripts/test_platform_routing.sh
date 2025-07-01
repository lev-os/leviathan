#!/bin/bash
# Test platform routing functionality

# Test URLs for different platforms
YOUTUBE_URL="https://youtube.com/watch?v=dQw4w9WgXcQ"
INSTAGRAM_URL="https://www.instagram.com/reel/DLD1_ocJkNZ/"
TIKTOK_URL="https://tiktok.com/@user/video/123"
TWITTER_URL="https://twitter.com/user/status/123"

# Source the download script functions
source /Users/jean-patricksmith/digital/homie/auto_download.sh

echo "Testing platform detection:"
echo "YouTube: $(detect_platform "$YOUTUBE_URL")"
echo "Instagram: $(detect_platform "$INSTAGRAM_URL")"
echo "TikTok: $(detect_platform "$TIKTOK_URL")"
echo "Twitter: $(detect_platform "$TWITTER_URL")"

echo ""
echo "Testing directory structure:"
mkdir -p /tmp/test_downloads
DOWNLOAD_COUNT=0
MAX_DOWNLOADS=1

echo "Testing Instagram download routing..."
download_video "$INSTAGRAM_URL" "/tmp/test_downloads" "8"

echo ""
echo "Directory structure created:"
find /tmp/test_downloads -type d | sort