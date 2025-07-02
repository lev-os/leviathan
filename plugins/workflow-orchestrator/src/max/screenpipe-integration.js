/**
 * Screenpipe Integration - Real data access for Max
 * Replaces mock implementations with actual Screenpipe API calls
 */

export class ScreenpipeClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3030';
    this.timeout = config.timeout || 5000;
  }

  async getHealth() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  async search(options = {}) {
    const {
      query = '',
      contentType = 'all', // ocr, audio, ui, all
      limit = 20,
      offset = 0,
      startTime = null,
      endTime = null,
      appName = null,
      windowName = null,
      minLength = null,
      maxLength = null,
      speakerIds = null,
      frameName = null,
      browserUrl = null,
      focused = null
    } = options;

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (contentType !== 'all') params.append('content_type', contentType);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    if (appName) params.append('app_name', appName);
    if (windowName) params.append('window_name', windowName);
    if (minLength) params.append('min_length', minLength.toString());
    if (maxLength) params.append('max_length', maxLength.toString());
    if (speakerIds) params.append('speaker_ids', speakerIds);
    if (frameName) params.append('frame_name', frameName);
    if (browserUrl) params.append('browser_url', browserUrl);
    if (focused !== null) params.append('focused', focused.toString());

    const response = await fetch(`${this.baseUrl}/search?${params}`);
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async semanticSearch(text, options = {}) {
    const {
      threshold = 0.7,
      limit = 10,
      contentType = 'all'
    } = options;

    const response = await fetch(`${this.baseUrl}/semantic-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        threshold,
        limit,
        content_type: contentType
      })
    });

    if (!response.ok) {
      throw new Error(`Semantic search failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async keywordSearch(keyword, options = {}) {
    const {
      fuzzy = false,
      limit = 20,
      offset = 0,
      startTime = null,
      endTime = null,
      appName = null
    } = options;

    const params = new URLSearchParams();
    params.append('keyword', keyword);
    if (fuzzy) params.append('fuzzy', 'true');
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    if (appName) params.append('app_name', appName);

    const response = await fetch(`${this.baseUrl}/search/keyword?${params}`);
    if (!response.ok) {
      throw new Error(`Keyword search failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // Get recent screen captures
  async getRecentScreens(minutes = 5) {
    const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.search({
      contentType: 'ocr',
      startTime,
      limit: 50
    });
  }

  // Get recent audio transcriptions
  async getRecentAudio(minutes = 5) {
    const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.search({
      contentType: 'audio',
      startTime,
      limit: 50
    });
  }

  // Get activity for specific app
  async getAppActivity(appName, minutes = 30) {
    const startTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    return this.search({
      appName,
      startTime,
      limit: 100
    });
  }

  // Find content containing specific text
  async findContent(text, fuzzy = true) {
    if (fuzzy) {
      return this.semanticSearch(text);
    } else {
      return this.search({ query: text });
    }
  }

  // Get current UI state
  async getCurrentUIState() {
    const recent = await this.getRecentScreens(1);
    return recent.data?.[0] || null;
  }

  // Stream real-time updates
  async *streamUpdates(intervalMs = 2000) {
    let lastTimestamp = new Date().toISOString();
    
    while (true) {
      try {
        const updates = await this.search({
          startTime: lastTimestamp,
          limit: 10
        });
        
        if (updates.data && updates.data.length > 0) {
          for (const update of updates.data) {
            yield update;
          }
          lastTimestamp = updates.data[0].content.timestamp;
        }
        
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('Stream update error:', error);
        await new Promise(resolve => setTimeout(resolve, intervalMs * 2));
      }
    }
  }
}

// Real screen processor using Screenpipe data
export class RealScreenProcessor {
  constructor(screenpipeClient) {
    this.client = screenpipeClient;
    this.cache = new Map();
    this.lastProcessed = Date.now();
  }

  async captureScreen() {
    // Get real screen data from Screenpipe
    const currentState = await this.client.getCurrentUIState();
    
    if (!currentState) {
      throw new Error('No recent screen data available from Screenpipe');
    }

    return {
      timestamp: currentState.content.timestamp,
      ocrText: currentState.content.text,
      appName: currentState.content.app_name,
      windowName: currentState.content.window_name,
      focused: currentState.content.focused,
      frameId: currentState.content.frame_id,
      browserUrl: currentState.content.browser_url
    };
  }

  async recognizeElements(screenData) {
    const startTime = Date.now();
    
    // Use OCR text to infer UI elements
    const elements = this._parseOCRText(screenData.ocrText);
    
    const processingTime = Date.now() - startTime;
    
    return {
      elements,
      confidence: this._calculateOCRConfidence(screenData.ocrText),
      processingTime,
      timestamp: startTime,
      appName: screenData.appName,
      windowName: screenData.windowName
    };
  }

  async trackStateTransitions(timeWindowMinutes = 5) {
    const recentScreens = await this.client.getRecentScreens(timeWindowMinutes);
    
    if (!recentScreens.data || recentScreens.data.length < 2) {
      return { hasTransition: false, transitions: [] };
    }

    const transitions = [];
    const screens = recentScreens.data.reverse(); // Chronological order
    
    for (let i = 1; i < screens.length; i++) {
      const prev = screens[i - 1].content;
      const curr = screens[i].content;
      
      // App transitions
      if (prev.app_name !== curr.app_name) {
        transitions.push({
          type: 'app_change',
          from: prev.app_name,
          to: curr.app_name,
          timestamp: curr.timestamp
        });
      }
      
      // Window transitions
      if (prev.window_name !== curr.window_name) {
        transitions.push({
          type: 'window_change',
          from: prev.window_name,
          to: curr.window_name,
          timestamp: curr.timestamp
        });
      }
      
      // Focus changes
      if (prev.focused !== curr.focused) {
        transitions.push({
          type: 'focus_change',
          from: prev.focused,
          to: curr.focused,
          timestamp: curr.timestamp
        });
      }
    }

    return {
      hasTransition: transitions.length > 0,
      transitions,
      transitionCount: transitions.length,
      timeWindow: timeWindowMinutes
    };
  }

  // Private helper methods
  _parseOCRText(ocrText) {
    // Simple OCR text parsing to infer UI elements
    const lines = ocrText.split('\n').filter(line => line.trim());
    const elements = {
      buttons: [],
      inputs: [],
      text: [],
      links: []
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Detect buttons (common button text patterns)
      if (this._isButtonText(trimmed)) {
        elements.buttons.push({
          id: `btn_${index}`,
          text: trimmed,
          confidence: 0.8
        });
      }
      
      // Detect links (URLs or link-like text)
      if (this._isLinkText(trimmed)) {
        elements.links.push({
          id: `link_${index}`,
          text: trimmed,
          confidence: 0.75
        });
      }
      
      // All text is captured
      elements.text.push({
        id: `text_${index}`,
        text: trimmed,
        confidence: 0.9
      });
    });

    return elements;
  }

  _isButtonText(text) {
    const buttonPatterns = [
      /^(Click|Submit|Send|Save|Cancel|Delete|Edit|Add|Remove|Upload|Download)$/i,
      /^(OK|Yes|No|Apply|Reset|Clear|Search|Login|Logout|Sign\s+in|Sign\s+up)$/i,
      /^[A-Z][a-z]+\s+(Now|Here)$/i
    ];
    
    return buttonPatterns.some(pattern => pattern.test(text)) || 
           (text.length < 20 && /^[A-Z]/.test(text));
  }

  _isLinkText(text) {
    const linkPatterns = [
      /https?:\/\//,
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      /^(www\.|[a-zA-Z0-9.-]+\.com|\.org|\.net)/
    ];
    
    return linkPatterns.some(pattern => pattern.test(text));
  }

  _calculateOCRConfidence(ocrText) {
    if (!ocrText || ocrText.length === 0) return 0;
    
    // Simple confidence based on text characteristics
    const hasUppercase = /[A-Z]/.test(ocrText);
    const hasLowercase = /[a-z]/.test(ocrText);
    const hasNumbers = /[0-9]/.test(ocrText);
    const hasSpaces = /\s/.test(ocrText);
    const reasonableLength = ocrText.length > 10 && ocrText.length < 10000;
    
    let confidence = 0.5;
    if (hasUppercase) confidence += 0.1;
    if (hasLowercase) confidence += 0.1;
    if (hasNumbers) confidence += 0.05;
    if (hasSpaces) confidence += 0.1;
    if (reasonableLength) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }
}