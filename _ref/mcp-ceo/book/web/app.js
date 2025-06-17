// Semantic Computing Revolution - Interactive Book App

// Chapter content mapping
const chapters = {
    'preface': '/chapters/00-preface.md',
    'chapter-1': '/chapters/01-beyond-software.md',
    'chapter-2': '/chapters/02-constitutional-framework.md',
    'chapter-3': '/chapters/03-llm-first-architecture.md',
    'chapter-4': '/chapters/04-protocol-based-discovery.md',
    'chapter-7': '/chapters/07-introduction-to-flowmind.md',
    'chapter-8': '/chapters/08-building-with-flowmind.md',
    'chapter-9': '/chapters/09-human-in-the-loop-intelligence.md',
    'chapter-16': '/chapters/16-enterprise-transformation.md'
};

// State management
let currentChapter = 'preface';
let annotations = JSON.parse(localStorage.getItem('bookAnnotations') || '{}');
let fontSize = parseInt(localStorage.getItem('fontSize') || '18');
let theme = localStorage.getItem('theme') || 'light';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeFontSize();
    loadChapter(currentChapter);
    setupEventListeners();
    updateReadingProgress();
});

// Theme management
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Font size management
function initializeFontSize() {
    document.body.style.fontSize = `${fontSize}px`;
}

function cycleFontSize() {
    const sizes = [16, 18, 20, 22, 24];
    const currentIndex = sizes.indexOf(fontSize);
    fontSize = sizes[(currentIndex + 1) % sizes.length];
    document.body.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize.toString());
}

// Chapter loading
async function loadChapter(chapterId) {
    const contentElement = document.getElementById('chapter-content');
    const chapterPath = chapters[chapterId];
    
    if (!chapterPath) {
        contentElement.innerHTML = '<h1>Chapter Not Found</h1><p>This chapter is coming soon!</p>';
        return;
    }
    
    try {
        // In production, these would be served from the server
        // For now, showing placeholder content
        const response = await fetch(chapterPath).catch(() => null);
        let content;
        
        if (response && response.ok) {
            content = await response.text();
        } else {
            // Fallback content for demo
            content = getPlaceholderContent(chapterId);
        }
        
        // Convert markdown to HTML
        const html = marked.parse(content);
        contentElement.innerHTML = html;
        
        // Highlight code blocks
        Prism.highlightAll();
        
        // Update UI
        updateActiveChapter(chapterId);
        updateChapterNav(chapterId);
        showInteractiveFeatures(chapterId);
        loadAnnotations(chapterId);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update URL without page reload
        history.pushState({ chapter: chapterId }, '', `#${chapterId}`);
        
    } catch (error) {
        console.error('Error loading chapter:', error);
        contentElement.innerHTML = '<h1>Error Loading Chapter</h1><p>Please try again later.</p>';
    }
}

// Placeholder content for demo
function getPlaceholderContent(chapterId) {
    const placeholders = {
        'preface': `# Preface: A Revolution in Progress

In the winter of 2024, a small team of developers stumbled upon something extraordinary...

> "The best way to predict the future is to implement it."

This book documents that journey - from frustration with AI integration to the breakthrough of semantic computing.`,
        
        'chapter-1': `# Chapter 1: Beyond Software - The Semantic Computing Platform

## The Integration Trap

Every developer knows the pain...

\`\`\`javascript
// The old way - configuration complexity
const ai = new AIService({
    apiKey: process.env.OPENAI_KEY,
    model: 'gpt-4',
    temperature: 0.7,
    // ... 50 more config options
});
\`\`\`

## The Semantic Solution

What if our systems could understand intent?

\`\`\`yaml
# The FlowMind way - natural language control
flowmind:
  when_semantic: "user needs help with technical issue"
  then:
    activate: technical_support_personality
    tone: helpful_and_patient
\`\`\``,
        
        'chapter-7': `# Chapter 7: Introduction to FlowMind

## The Great Divide

Developers face an impossible choice:
- Rigid workflow languages that can't adapt
- Chaotic prompting that can't be controlled

FlowMind bridges this divide...`
    };
    
    return placeholders[chapterId] || `# ${chapterId.replace('-', ' ').toUpperCase()}\n\nThis chapter is coming soon!`;
}

// Navigation
function updateActiveChapter(chapterId) {
    document.querySelectorAll('.toc a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${chapterId}`) {
            link.classList.add('active');
        }
    });
}

function updateChapterNav(chapterId) {
    const chapterList = Object.keys(chapters);
    const currentIndex = chapterList.indexOf(chapterId);
    
    const prevButton = document.getElementById('prev-chapter');
    const nextButton = document.getElementById('next-chapter');
    const indicator = document.querySelector('.chapter-indicator');
    
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === chapterList.length - 1;
    
    const chapterName = chapterId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    indicator.textContent = chapterName;
}

function navigateChapter(direction) {
    const chapterList = Object.keys(chapters);
    const currentIndex = chapterList.indexOf(currentChapter);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < chapterList.length) {
        currentChapter = chapterList[newIndex];
        loadChapter(currentChapter);
    }
}

// Interactive features
function showInteractiveFeatures(chapterId) {
    const playground = document.getElementById('playground');
    
    // Show code playground for FlowMind chapters
    if (chapterId.includes('7') || chapterId.includes('8') || chapterId.includes('9')) {
        playground.style.display = 'block';
    } else {
        playground.style.display = 'none';
    }
}

// Code execution (simulated)
function runCode() {
    const code = document.getElementById('code-editor').value;
    const output = document.getElementById('code-output');
    
    try {
        // Parse FlowMind YAML (simplified simulation)
        if (code.includes('flowmind:')) {
            output.innerHTML = `<div style="color: green;">✓ Valid FlowMind workflow detected!</div>
<pre>Workflow Analysis:
- Semantic conditions found
- Control flow validated
- Ready for execution</pre>`;
        } else {
            output.innerHTML = `<div style="color: orange;">⚠ No FlowMind definition found</div>
<pre>Hint: Start with:
flowmind:
  version: "1.0"
  flow:
    - when_semantic: "your condition"</pre>`;
        }
    } catch (error) {
        output.innerHTML = `<div style="color: red;">✗ Error: ${error.message}</div>`;
    }
}

// Annotations
function loadAnnotations(chapterId) {
    const notes = annotations[chapterId] || '';
    const textarea = document.querySelector('.annotation-panel textarea');
    if (textarea) {
        textarea.value = notes;
    }
}

function saveAnnotation() {
    const textarea = document.querySelector('.annotation-panel textarea');
    if (textarea) {
        annotations[currentChapter] = textarea.value;
        localStorage.setItem('bookAnnotations', JSON.stringify(annotations));
        showNotification('Note saved!');
    }
}

function toggleAnnotations() {
    const panel = document.querySelector('.annotation-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Reading progress
function updateReadingProgress() {
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const progress = (scrollPosition / scrollHeight) * 100;
        document.getElementById('reading-progress').style.width = `${progress}%`;
    });
}

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event listeners
function setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Font size
    document.getElementById('font-size').addEventListener('click', cycleFontSize);
    
    // Chapter navigation
    document.getElementById('prev-chapter').addEventListener('click', () => navigateChapter(-1));
    document.getElementById('next-chapter').addEventListener('click', () => navigateChapter(1));
    
    // TOC links
    document.querySelectorAll('.toc a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const chapterId = link.getAttribute('href').substring(1);
            currentChapter = chapterId;
            loadChapter(chapterId);
        });
    });
    
    // Code playground
    const runButton = document.getElementById('run-code');
    if (runButton) {
        runButton.addEventListener('click', runCode);
    }
    
    // Annotations
    document.getElementById('toggle-annotations').addEventListener('click', toggleAnnotations);
    document.getElementById('save-note').addEventListener('click', saveAnnotation);
    
    // Browser back/forward
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.chapter) {
            currentChapter = e.state.chapter;
            loadChapter(currentChapter);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
            navigateChapter(-1);
        } else if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
            navigateChapter(1);
        }
    });
}

// Mobile menu toggle (for responsive design)
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}