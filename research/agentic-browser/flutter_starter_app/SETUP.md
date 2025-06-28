# ⚙️ Flutter Starter App Setup

1. Ensure Flutter SDK is installed
2. `flutter create agenticbrowse`
3. Replace `lib/` contents with:

- `main.dart` – entrypoint
- `browser_screen.dart` – WebView UI
- `agent_bridge.dart` – LLM calls
- `utils/inject_scripts.dart` – JS injections

4. Add dependency:

```
flutter_inappwebview: ^6.0.0
```

5. Run on emulator or device

---