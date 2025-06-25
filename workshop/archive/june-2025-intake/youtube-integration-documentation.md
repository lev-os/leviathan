# YouTube Integration Documentation

## Overview
This document provides comprehensive guidance for accessing YouTube user data (watch later, history, favorites), implementing Whisper audio transcription, and monitoring YouTube subscriptions. It covers official API capabilities, limitations, and alternative approaches.

## Table of Contents
1. [YouTube Data API v3 Analysis](#youtube-data-api-v3-analysis)
2. [Alternative Data Access Methods](#alternative-data-access-methods)
3. [Whisper Integration Best Practices](#whisper-integration-best-practices)
4. [YouTube Subscription Monitoring](#youtube-subscription-monitoring)
5. [Implementation Recommendations](#implementation-recommendations)

---

## YouTube Data API v3 Analysis

### Key Findings: Limited Personal Data Access

The YouTube Data API v3 has significant limitations for accessing personal user data:

#### ❌ **NOT AVAILABLE via API**
- **Watch Later Playlist**: Cannot be accessed through the API (confirmed by multiple Stack Overflow discussions)
- **Watch History**: No longer available via API (removed in recent versions)
- **Personal Favorites**: Limited access depending on privacy settings

#### ✅ **AVAILABLE via API**
- Public playlists (including favorites if public)
- Channel subscriptions (with proper OAuth)
- Video metadata and comments
- Upload playlists for channels you own

### API Authentication Requirements

```javascript
// OAuth 2.0 Setup Example
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

// Required scopes for YouTube access
const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube'
];
```

### Rate Limits and Quotas

- **Daily Quota**: 10,000 units per day (free tier)
- **Cost per request**: 1-100 units depending on operation
- **Playlist items**: 1 unit per request
- **Search operations**: 100 units per request

### API Request Examples

```javascript
// Get user's playlists (including public favorites)
const response = await youtube.playlists.list({
  part: 'snippet,contentDetails',
  mine: true,
  maxResults: 50
});

// Get subscription list
const subscriptions = await youtube.subscriptions.list({
  part: 'snippet',
  mine: true,
  maxResults: 50
});
```

---

## Alternative Data Access Methods

### 1. Google Takeout (Recommended for Historical Data)

**Pros:**
- Complete historical data access
- Includes watch history, search history, favorites
- JSON format for easy parsing
- Official Google service

**Cons:**
- Manual process, not automated
- Requires user to initiate export
- Data may be days old when exported

**Implementation:**
```javascript
// Example: Parse Google Takeout JSON
const fs = require('fs');

function parseYouTubeHistory(takeoutPath) {
  const historyData = JSON.parse(
    fs.readFileSync(`${takeoutPath}/YouTube and YouTube Music/history/watch-history.json`)
  );
  
  return historyData.map(entry => ({
    title: entry.title,
    url: entry.titleUrl,
    channel: entry.subtitles?.[0]?.name,
    timestamp: entry.time
  }));
}
```

### 2. Browser Automation (Advanced Users)

**Best Tools:**
- **Puppeteer**: Fast, Chrome-only, JavaScript
- **Playwright**: Multi-browser, robust
- **Selenium**: Mature, multi-language support

**Considerations:**
- Terms of Service compliance
- Rate limiting and detection avoidance
- Maintenance overhead
- Potential breaking changes

**Example Implementation:**
```javascript
// Puppeteer example for accessing Watch Later
const puppeteer = require('puppeteer');

async function getWatchLater() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to YouTube and handle authentication
  await page.goto('https://www.youtube.com/playlist?list=WL');
  
  // Wait for user authentication if needed
  await page.waitForSelector('[data-title-no-tooltip]', { timeout: 60000 });
  
  // Extract video data
  const videos = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#contents ytd-playlist-video-renderer')).map(el => ({
      title: el.querySelector('#video-title')?.textContent?.trim(),
      url: el.querySelector('#video-title')?.href,
      channel: el.querySelector('#channel-name')?.textContent?.trim()
    }));
  });
  
  await browser.close();
  return videos;
}
```

### 3. RSS Feeds (Limited Scope)

**Channel-specific RSS:**
```
https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
```

**Playlist RSS:**
```
https://www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID
```

---

## Whisper Integration Best Practices

### Model Selection Guide

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| tiny | 39MB | Fastest | Basic | Real-time transcription |
| base | 74MB | Fast | Good | General use |
| small | 244MB | Moderate | Better | Balanced performance |
| medium | 769MB | Slow | High | Quality transcription |
| large | 1550MB | Slowest | Highest | Production accuracy |

### Installation and Setup

```bash
# Install Whisper
pip install openai-whisper

# Install with additional dependencies
pip install openai-whisper[dev]

# For GPU acceleration
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Basic Implementation

```python
import whisper
import os

class AudioTranscriber:
    def __init__(self, model_size="base"):
        """Initialize Whisper model"""
        self.model = whisper.load_model(model_size)
    
    def transcribe_file(self, audio_path, language=None):
        """Transcribe audio file"""
        try:
            result = self.model.transcribe(
                audio_path,
                language=language,
                verbose=True
            )
            return {
                'text': result['text'],
                'segments': result['segments'],
                'language': result['language']
            }
        except Exception as e:
            return {'error': str(e)}
    
    def transcribe_youtube_audio(self, video_url):
        """Extract and transcribe YouTube audio"""
        import yt_dlp
        
        # Download audio
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': 'temp_audio.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        
        # Transcribe
        result = self.transcribe_file('temp_audio.mp3')
        
        # Cleanup
        os.remove('temp_audio.mp3')
        
        return result

# Usage example
transcriber = AudioTranscriber("base")
result = transcriber.transcribe_youtube_audio("https://youtube.com/watch?v=VIDEO_ID")
```

### Performance Optimization

```python
# Batch processing for multiple files
def batch_transcribe(file_paths, model_size="base"):
    model = whisper.load_model(model_size)
    results = []
    
    for file_path in file_paths:
        result = model.transcribe(file_path)
        results.append({
            'file': file_path,
            'text': result['text'],
            'segments': result['segments']
        })
    
    return results

# GPU acceleration check
import torch
if torch.cuda.is_available():
    print(f"GPU available: {torch.cuda.get_device_name(0)}")
    device = "cuda"
else:
    device = "cpu"
    
model = whisper.load_model("base", device=device)
```

### Advanced Features

```python
# Segment-level transcription with timestamps
def detailed_transcribe(audio_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path, word_timestamps=True)
    
    segments = []
    for segment in result['segments']:
        segments.append({
            'start': segment['start'],
            'end': segment['end'],
            'text': segment['text'],
            'words': segment.get('words', [])
        })
    
    return {
        'full_text': result['text'],
        'segments': segments,
        'language': result['language']
    }
```

---

## YouTube Subscription Monitoring

### 1. PubSubHubbub Push Notifications (Recommended)

**Setup Process:**
```javascript
// Express.js webhook handler
const express = require('express');
const app = express();

// Verification endpoint
app.get('/webhook/youtube', (req, res) => {
  const challenge = req.query['hub.challenge'];
  const verify_token = req.query['hub.verify_token'];
  
  if (verify_token === 'your_verify_token') {
    res.send(challenge);
  } else {
    res.sendStatus(400);
  }
});

// Notification handler
app.post('/webhook/youtube', (req, res) => {
  const notification = req.body;
  
  // Process the notification
  console.log('New video notification:', notification);
  
  // Send to your processing queue
  processVideoNotification(notification);
  
  res.sendStatus(200);
});

// Subscribe to channel notifications
async function subscribeToChannel(channelId) {
  const response = await fetch('https://pubsubhubbub.appspot.com/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'hub.callback': 'https://your-domain.com/webhook/youtube',
      'hub.topic': `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`,
      'hub.verify': 'async',
      'hub.mode': 'subscribe',
      'hub.verify_token': 'your_verify_token'
    })
  });
  
  return response.status === 202;
}
```

### 2. RSS Feed Polling

```javascript
// RSS feed monitoring
const Parser = require('rss-parser');
const parser = new Parser();

class YouTubeRSSMonitor {
  constructor() {
    this.lastChecked = new Map();
  }
  
  async checkChannelUpdates(channelId) {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    
    try {
      const feed = await parser.parseURL(feedUrl);
      const lastCheck = this.lastChecked.get(channelId) || new Date(0);
      
      const newVideos = feed.items.filter(item => 
        new Date(item.pubDate) > lastCheck
      );
      
      this.lastChecked.set(channelId, new Date());
      
      return newVideos.map(item => ({
        title: item.title,
        url: item.link,
        publishDate: item.pubDate,
        description: item.contentSnippet
      }));
      
    } catch (error) {
      console.error(`Error checking channel ${channelId}:`, error);
      return [];
    }
  }
  
  async monitorMultipleChannels(channelIds, intervalMinutes = 15) {
    setInterval(async () => {
      for (const channelId of channelIds) {
        const newVideos = await this.checkChannelUpdates(channelId);
        if (newVideos.length > 0) {
          console.log(`New videos from ${channelId}:`, newVideos);
          // Process new videos
        }
      }
    }, intervalMinutes * 60 * 1000);
  }
}
```

### 3. Subscription List Management

```javascript
// Get user subscriptions via API
async function getUserSubscriptions(auth) {
  const youtube = google.youtube({ version: 'v3', auth });
  
  let subscriptions = [];
  let nextPageToken = null;
  
  do {
    const response = await youtube.subscriptions.list({
      part: 'snippet',
      mine: true,
      maxResults: 50,
      pageToken: nextPageToken
    });
    
    subscriptions = subscriptions.concat(response.data.items);
    nextPageToken = response.data.nextPageToken;
    
  } while (nextPageToken);
  
  return subscriptions.map(sub => ({
    channelId: sub.snippet.resourceId.channelId,
    channelTitle: sub.snippet.title,
    description: sub.snippet.description,
    thumbnail: sub.snippet.thumbnails.default.url
  }));
}
```

---

## Implementation Recommendations

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Sources  │    │   Processing     │    │   Applications  │
│                 │    │                  │    │                 │
│ • YouTube API   │───▶│ • Whisper Trans. │───▶│ • Web Dashboard │
│ • Google Takeout│    │ • Data Parsing   │    │ • Mobile App    │
│ • RSS Feeds     │    │ • Storage        │    │ • Notifications │
│ • Webhooks      │    │ • Analytics      │    │ • Analytics     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Recommended Technology Stack

**Backend:**
- **Node.js** + Express for API and webhooks
- **Python** for Whisper transcription
- **PostgreSQL** for structured data storage
- **Redis** for caching and job queues

**Frontend:**
- **React/Next.js** for web dashboard
- **React Native** for mobile apps

**Infrastructure:**
- **Docker** for containerization
- **AWS/GCP** for hosting
- **CloudFlare** for CDN and security

### Security Considerations

1. **API Keys**: Store in environment variables, never in code
2. **OAuth Tokens**: Implement proper refresh token handling
3. **Rate Limiting**: Implement exponential backoff
4. **Data Privacy**: Encrypt personal data at rest
5. **Webhook Verification**: Always verify webhook authenticity

### Error Handling and Resilience

```javascript
// Robust API call with retry logic
async function robustApiCall(apiFunction, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
```

### Testing Strategy

```javascript
// Unit tests for core functions
describe('YouTube Integration', () => {
  test('should parse Google Takeout data correctly', () => {
    const sampleData = require('./fixtures/takeout-sample.json');
    const parsed = parseYouTubeHistory(sampleData);
    expect(parsed).toHaveLength(100);
    expect(parsed[0]).toHaveProperty('title');
  });
  
  test('should handle API rate limits gracefully', async () => {
    // Mock rate limit response
    const result = await robustApiCall(() => 
      Promise.reject(new Error('Rate limit exceeded'))
    );
    expect(result).toBeDefined();
  });
});
```

---

## Conclusion

This documentation provides multiple approaches for YouTube data integration:

1. **For Historical Data**: Use Google Takeout for complete historical access
2. **For Real-time Monitoring**: Implement PubSubHubbub webhooks + RSS polling
3. **For Audio Transcription**: Use Whisper with appropriate model selection
4. **For Personal Data**: Consider browser automation with proper compliance

Choose the approach that best fits your use case, technical requirements, and compliance needs.

---

## Additional Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3/docs)
- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [PubSubHubbub Specification](https://pubsubhubbub.github.io/PubSubHubbub/pubsubhubbub-core-0.4.html)
- [Google Takeout](https://takeout.google.com)
- [YouTube RSS Feeds](https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID)