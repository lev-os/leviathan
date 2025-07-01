# Multi-Platform Usage Examples

🔥 **Now with Authentication Support for Private Content!**

## Quick Platform Tests

### Direct Downloads (Public Content)
```bash
# Instagram Reel
python yt/yt.py --download "https://instagram.com/reel/ABC123" --output ./downloads

# TikTok Video  
python yt/yt.py --download "https://tiktok.com/@user/video/123456789" --output ./downloads

# Twitter Video
python yt/yt.py --download "https://twitter.com/user/status/123456789" --output ./downloads

# YouTube (existing)
python yt/yt.py --download "https://youtube.com/watch?v=dQw4w9WgXcQ" --output ./downloads
```

### 🔐 Private Content with Authentication
```bash
# Your TikTok liked videos (using browser cookies)
python yt/yt.py --download "https://tiktok.com/@you/liked" --browser brave

# Your Instagram saved posts
python yt/yt.py --download "https://instagram.com/reel/SAVED_POST" --browser brave

# Your Twitter bookmarks  
python yt/yt.py --download "https://twitter.com/user/status/BOOKMARKED" --browser brave

# YouTube private playlists
python yt/yt.py --download "https://youtube.com/playlist?list=PRIVATE_ID" --browser brave
```

### Get Video Info
```bash
# Public content
python yt/yt.py --info "https://instagram.com/reel/DLD1_ocJkNZ/"
python yt/yt.py --info "https://tiktok.com/@username/video/123"

# Private content (with authentication)
python yt/yt.py --info "https://tiktok.com/@user/video/ID" --browser brave
python yt/yt.py --info "https://instagram.com/stories/user/ID" --browser brave
```

### Transcripts
```bash
# YouTube captions (fastest)
python yt/yt.py --transcript "https://youtube.com/watch?v=VIDEO_ID"

# Any platform with Whisper (slower but works everywhere)
python yt/transcribe.py "https://instagram.com/reel/ABC123" --model base
python yt/transcribe.py "https://tiktok.com/@user/video/123" --model base
```

## Configuration Examples

### Enable Multi-Platform Sources
Edit `sources_config.yaml`:

```yaml
# Enable Instagram saved posts
instagram_saved:
  enabled: true
  max_videos: 20

# Enable TikTok liked videos  
tiktok_liked:
  enabled: true
  max_videos: 15

# Enable Twitter bookmarks
twitter_bookmarks:
  enabled: true
  max_videos: 10
```

### Platform-Specific Settings
```yaml
sources:
  my_instagram_collection:
    name: "My Instagram Saves"
    type: instagram_collection
    priority: 8
    enabled: true
    max_videos: 25
    max_age_days: 30
    platform: instagram
    
  trending_tiktoks:
    name: "Trending TikToks"
    type: manual
    priority: 5
    enabled: true
    max_videos: 10
    platform: tiktok
    url_pattern: "https://tiktok.com/@*/video/*"
```

## Directory Structure

After running downloads, your structure will be:
```
downloads/
├── youtube/
│   ├── watch_later/
│   ├── playlists/
│   └── individual_videos/
├── instagram/
│   ├── reels/
│   └── posts/
├── tiktok/
│   └── videos/
├── twitter/
│   └── videos/
└── other/
    └── misc_platforms/
```

## Automated Downloads

The `auto_download.sh` script now automatically routes downloads by platform:

```bash
# Automatically detects platform and downloads to correct folder
./auto_download.sh
```

Platform detection works for:
- `youtube.com`, `youtu.be` → `downloads/youtube/`
- `instagram.com` → `downloads/instagram/`
- `tiktok.com` → `downloads/tiktok/`
- `twitter.com`, `x.com` → `downloads/twitter/`
- Other platforms → `downloads/other/`

## 🔐 Authentication Setup

### Browser Cookie Authentication (Easiest)
Automatically extract cookies from your browser:
```bash
# Supported browsers: brave, chrome, chromium, edge, firefox, opera, safari, vivaldi
python yt/yt.py --download "PRIVATE_URL" --browser brave
```

### Manual Cookie Export (Advanced)
1. Install browser extension "Get cookies.txt LOCALLY"
2. Visit platform while logged in
3. Export cookies to file:
```bash
python yt/yt.py --download "URL" --cookies ~/platform_cookies.txt
```

### What You Can Access
- **TikTok**: Liked videos, following feed, private profiles
- **Instagram**: Saved posts, stories, private accounts
- **Twitter**: Bookmarks, private tweets, protected accounts  
- **YouTube**: Private playlists, unlisted videos, member-only content

## Tips

1. **Quality Settings**: Instagram/TikTok may have different available formats than YouTube
2. **Rate Limiting**: Each platform has different rate limits - adjust delays accordingly
3. **Authentication**: Use `--browser` for private content, no setup required
4. **Transcripts**: YouTube captions are fastest, use Whisper for other platforms
5. **Batch Processing**: Mix platforms in your queue - the script handles routing automatically
6. **Platform Detection**: URLs automatically route to correct download folders

## Troubleshooting

### Authentication Issues
```bash
# Test if browser cookies work
python yt/yt.py --info "PRIVATE_URL" --browser brave

# If auth fails, try different browser
python yt/yt.py --info "PRIVATE_URL" --browser chrome
```

### Format Errors
If you get "Requested format is not available":
```bash
# Check available formats first
yt-dlp --list-formats "YOUR_URL"

# Use a more flexible format
yt-dlp -f "best" "YOUR_URL"
```

### Platform-Specific Issues
- **Instagram**: Stories and private accounts now accessible with `--browser`
- **TikTok**: Some regions have restrictions, try VPN if needed
- **Twitter**: Video availability varies, bookmarks require auth
- **YouTube**: Most reliable platform with full feature support