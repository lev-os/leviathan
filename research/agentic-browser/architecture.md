# 🏗️ Architecture

## Tech Stack

- **Flutter** (Dart)
- **flutter_inappwebview** for powerful WebView embedding
- **OpenAI or LLM backend** for agentic reasoning
- **Dart-JS Bridge** for event and command communication

## Data Flow

1. User loads page in WebView
2. Injected JS captures events & DOM
3. Data sent to Dart via message channel
4. Dart sends data to LLM with system prompt
5. LLM returns command or text output
6. Dart injects JS commands back into WebView

---