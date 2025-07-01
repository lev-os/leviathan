# 🔐 Platform Authentication Guide

For accessing private content like liked videos, bookmarks, and saved posts, you may need to authenticate with each platform.

## TikTok Authentication

### Method 1: Browser Cookies (Recommended)
```bash
# Export TikTok cookies from your browser
# 1. Install browser extension like "Get cookies.txt LOCALLY" 
# 2. Visit tiktok.com while logged in
# 3. Export cookies to ~/tiktok_cookies.txt
# 4. Use with yt-dlp:

yt-dlp --cookies ~/tiktok_cookies.txt "https://tiktok.com/@yourusername/video/ID"
```

### Method 2: Session File
```bash
# Create TikTok session file
echo "your_session_id_here" > ~/tiktok_session.txt
yt-dlp --extractor-args "tiktok:session_file:~/tiktok_session.txt" "URL"
```

## Twitter/X Authentication

### Method 1: Browser Cookies
```bash
# Similar to TikTok - export cookies while logged into twitter.com
yt-dlp --cookies ~/twitter_cookies.txt "https://twitter.com/user/status/ID"
```

### Method 2: API Access (Advanced)
```bash
# Requires Twitter API keys
export TWITTER_BEARER_TOKEN="your_bearer_token"
# Use specialized Twitter tools if needed
```

## Instagram Authentication

### Method 1: Browser Cookies (Most Reliable)
```bash
# Export Instagram cookies from browser
yt-dlp --cookies ~/instagram_cookies.txt "https://instagram.com/reel/ID"
```

### Method 2: Username/Password (Use Carefully)
```bash
# Only for personal use, not recommended for automation
yt-dlp --username your_username --password your_password "URL"
```

## General Tips

### Cookie Export Tools
- **Chrome**: "Get cookies.txt LOCALLY" extension
- **Firefox**: "cookies.txt" extension  
- **Safari**: Export via developer tools

### Security Best Practices
- Store cookie files securely: `chmod 600 ~/platform_cookies.txt`
- Use app-specific passwords when possible
- Never share cookie files or commit them to git
- Regularly refresh cookies (they expire)

### Integration with Your System

#### Update yt.py for Authentication
Add to your download commands:
```bash
# With cookies
python yt/yt.py --download "URL" --cookies ~/tiktok_cookies.txt

# For automation, create wrapper scripts
```

#### Batch Authentication Setup
```bash
# Create secure cookies directory
mkdir -p ~/.social_cookies
chmod 700 ~/.social_cookies

# Store platform cookies
cp downloaded_cookies.txt ~/.social_cookies/tiktok.txt
cp downloaded_cookies.txt ~/.social_cookies/instagram.txt
cp downloaded_cookies.txt ~/.social_cookies/twitter.txt

# Set secure permissions
chmod 600 ~/.social_cookies/*.txt
```

## Testing Authentication

### Quick Test Script
```bash
#!/bin/bash
# Test if authentication works

echo "Testing TikTok authentication..."
yt-dlp --cookies ~/.social_cookies/tiktok.txt --dump-json "https://tiktok.com/@your_username" | head -5

echo "Testing Instagram authentication..."  
yt-dlp --cookies ~/.social_cookies/instagram.txt --dump-json "https://instagram.com/your_username" | head -5
```

## Troubleshooting

### Common Issues
- **"Login required"**: Cookies expired or wrong format
- **"Rate limited"**: Too many requests, wait and retry
- **"Private account"**: Need to follow/be approved first
- **"Geo-blocked"**: Content not available in your region

### Solutions
- Refresh cookies monthly
- Use VPN if geo-blocked
- Respect platform rate limits
- Check if content is actually public

## Platform-Specific Notes

### TikTok
- Liked videos require login
- Some regions have restrictions
- High rate limiting

### Twitter/X  
- Bookmarks definitely require login
- API access more reliable but complex
- Recent changes affect third-party access

### Instagram
- Stories require login
- High rate limiting
- GDPR regions may have restrictions

🎯 **Start with browser cookie export - it's the most reliable method for personal use!**