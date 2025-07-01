#!/bin/bash
# Test authentication capabilities of yt-dlp

echo "🔐 Testing yt-dlp Authentication Capabilities"
echo "============================================="

echo ""
echo "📋 Available Authentication Methods:"
echo "1. --cookies FILE (Netscape format)"
echo "2. --cookies-from-browser BROWSER (Auto-extract from browser)"
echo "3. --username/--password (Direct login)"
echo "4. --netrc (Use .netrc file)"
echo ""

echo "🌐 Supported Browsers for Cookie Extraction:"
echo "brave, chrome, chromium, edge, firefox, opera, safari, vivaldi, whale"
echo ""

echo "🧪 Testing Browser Cookie Auto-Extraction:"
echo ""

# Test if we can auto-extract cookies from browser
echo "Testing Chrome cookie extraction..."
yt-dlp --cookies-from-browser chrome --list-formats "https://youtube.com/watch?v=dQw4w9WgXcQ" 2>/dev/null && echo "✅ Chrome cookies accessible" || echo "❌ Chrome cookies not accessible"

echo ""
echo "Testing Safari cookie extraction..."
yt-dlp --cookies-from-browser safari --list-formats "https://youtube.com/watch?v=dQw4w9WgXcQ" 2>/dev/null && echo "✅ Safari cookies accessible" || echo "❌ Safari cookies not accessible"

echo ""
echo "🎯 For Twitter/TikTok Authentication:"
echo ""
echo "Option 1 - Auto Browser Cookies (Easiest):"
echo 'yt-dlp --cookies-from-browser chrome "https://twitter.com/user/status/ID"'
echo ""

echo "Option 2 - Export Cookies Manually:"
echo "1. Install browser extension 'Get cookies.txt'"
echo "2. Visit twitter.com/tiktok.com while logged in"
echo "3. Export cookies to file"
echo 'yt-dlp --cookies ~/twitter_cookies.txt "URL"'
echo ""

echo "Option 3 - Direct Login (Twitter only):"
echo 'yt-dlp --username your_username --password your_password "URL"'
echo ""

echo "🚀 Ready to test authenticated downloads!"
echo "Try: yt-dlp --cookies-from-browser chrome \"YOUR_TWITTER_URL\""