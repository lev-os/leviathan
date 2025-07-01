#!/bin/bash
# Test script for real social media URLs

echo "🧪 Testing Multi-Platform Downloads"
echo "=================================="

# Test function
test_url() {
    local url=$1
    local platform=$2
    
    echo ""
    echo "🔍 Testing $platform URL:"
    echo "   $url"
    echo ""
    
    # Get info first
    echo "📋 Getting video info..."
    python /Users/jean-patricksmith/digital/homie/yt/yt.py --info "$url"
    
    if [ $? -eq 0 ]; then
        echo "✅ Info retrieved successfully!"
        echo ""
        echo "📥 Testing download..."
        python /Users/jean-patricksmith/digital/homie/yt/yt.py --download "$url" --output /Users/jean-patricksmith/digital/homie/downloads
        
        if [ $? -eq 0 ]; then
            echo "✅ Download successful!"
        else
            echo "❌ Download failed"
        fi
    else
        echo "❌ Could not get video info"
        echo "💡 Try with a different URL or check if login is required"
    fi
    
    echo "---"
}

# Instructions for user
echo "📝 To test with your real content:"
echo ""
echo "1. TikTok URLs (from your liked videos):"
echo "   - Go to your TikTok profile > Liked videos"
echo "   - Copy a video URL and replace the example below"
echo ""
echo "2. Twitter URLs (from your bookmarks):"
echo "   - Go to your Twitter bookmarks"
echo "   - Find a tweet with video and copy the URL"
echo ""
echo "3. Instagram URLs (from your saved posts):"
echo "   - Already tested successfully! ✅"
echo ""

# Example tests (replace with real URLs)
echo "🚀 Example test with placeholder URLs:"

# Uncomment and replace with real URLs when ready
# test_url "https://tiktok.com/@yourusername/video/REAL_VIDEO_ID" "TikTok"
# test_url "https://twitter.com/username/status/REAL_TWEET_ID" "Twitter"

echo ""
echo "🎯 Ready to test! Replace the URLs above with your real content."
echo "   Then run: ./test_real_urls.sh"