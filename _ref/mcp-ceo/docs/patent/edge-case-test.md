# PDF Generation Edge Case Test Suite

## 1. Unicode Stress Test 🌍

### Extended Unicode Characters
- Arabic: مرحبا بالعالم (Hello World)
- Chinese: 你好世界 (Hello World)
- Japanese: こんにちは世界 (Hello World)
- Korean: 안녕하세요 세계 (Hello World)
- Hindi: नमस्ते दुनिया (Hello World)
- Russian: Привет мир (Hello World)
- Greek: Γεια σου κόσμος (Hello World)
- Hebrew: שלום עולם (Hello World - RTL)

### Mathematical Symbols
- ∀x ∈ ℝ: x² ≥ 0
- ∫₀^∞ e^(-x²) dx = √π/2
- ∇ × **B** = μ₀**J** + μ₀ε₀ ∂**E**/∂t
- ℵ₀ < 2^(ℵ₀) = ℵ₁ (Continuum Hypothesis)

### Special Typography
- ℌ𝔢𝔩𝔩𝔬 𝔚𝔬𝔯𝔩𝔡 (Fraktur)
- 𝓗𝓮𝓵𝓵𝓸 𝓦𝓸𝓻𝓵𝓭 (Script)
- 𝕳𝖊𝖑𝖑𝖔 𝖂𝖔𝖗𝖑𝖉 (Double-struck)
- H̸̡̪̯ͨ͊́̽̍̎ͯ͗̄ͮ̒̂̚e̵̢̘̫͍͉̠̞̞̪͎̻͊̈ͭ̍ͫ̾̕͜ͅl̨̢͇̪̟̭͓̞̠̰̤̱̽̓́̃́͋̏͊̐l̷̨̤̩̖̮̹̻̯̙̖̭͙̜̥̏̂̐̈́̏̊̌̍̇̚̚o̵̢̨̨̥̜̻̮̙̪̰̹̙̺̦͉̍̂̋̊̈́ (Zalgo text)

---

## 2. Complex Table Structures

### Nested Headers and Spans

| Category | Q1 2024 | | Q2 2024 | | Total |
|----------|---------|---------|---------|---------|-------|
| | Revenue | Profit | Revenue | Profit | |
| **Product A** | $100K | $20K | $150K | $35K | $305K |
| **Product B** | $200K | $50K | $180K | $40K | $470K |
| **Total** | $300K | $70K | $330K | $75K | $775K |

### Table with Complex Content

| Feature | Code Example | Mathematical Formula | Special Characters |
|---------|--------------|---------------------|-------------------|
| Inline | `const x = 42;` | $E = mc^2$ | ™ © ® § ¶ |
| Block | ```js
function test() {
  return true;
}
``` | $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$ | ← → ↑ ↓ ⇐ ⇒ ⇑ ⇓ |

---

## 3. Extreme Code Blocks

### Very Long Lines (Horizontal Scrolling Test)
```javascript
const extremelyLongVariableNameThatShouldDefinitelyTriggerHorizontalScrollingInMostPDFRenderersToTestHowTheyHandleCodeBlockOverflow = "This is a test of how different PDF generators handle very long lines of code that exceed the normal page width and whether they wrap, truncate, or provide horizontal scrolling capabilities in the generated PDF output";
```

### Syntax Highlighting Edge Cases
```javascript
// Test comment with unicode: 你好 مرحبا שלום
const regex = /(?:(?:^|.*;\s*)auth\s*=\s*([^;]*).*$)|^.*$/;
const template = `Multi-line
    template literal with ${nested.interpolation.expression}
    and escaped \${characters} plus \u{1F600} emoji`;

// Nested syntax
const jsx = <div className={`${styles.container} ${isActive ? 'active' : ''}`}>
    {/* Comment in JSX */}
    <span>Text with {"interpolation"}</span>
</div>;
```

### Multiple Language Mixing
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        /* CSS with gradients */
        .gradient { background: linear-gradient(45deg, #ff0099, #493240); }
    </style>
    <script>
        // JavaScript in HTML
        console.log("Testing mixed languages");
    </script>
</head>
<body>
    <?php echo "PHP in HTML"; ?>
    <div style="color: <%= rubyVariable %>">Mixed templating</div>
</body>
</html>
```

---

## 4. Page Break and Layout Challenges

<div style="height: 50vh; background: linear-gradient(red, blue);">
This div should be half viewport height - how do PDF generators handle viewport units?
</div>

<div class="page-break"></div>

### Content After Page Break

This content should appear on a new page. Testing page-break-after CSS property.

### Very Tall Content Block

<div style="height: 2000px; border: 1px solid purple;">
This extremely tall div tests how PDF generators handle content that exceeds page height.
Will it be cut off? Split across pages? Scaled down?
</div>

---

## 5. Image and Media Embedding

### Data URI Image (Inline SVG)
<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0icHVycGxlIiAvPgo8L3N2Zz4=" alt="Purple circle" />

### External Image with Broken Link
![This image won't load](https://definitely-not-a-real-domain-12345.com/image.png)

### Large Local Path Reference
![Test with very long path](/Users/very/long/path/that/might/not/exist/but/tests/how/pdf/generators/handle/missing/local/images/test.png)

---

## 6. CSS Edge Cases

<style>
/* Testing CSS that might not work in all PDF generators */
@supports (display: grid) {
    .grid-test {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
}

.animation-test {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}

.custom-counter {
    counter-reset: section;
}

.custom-counter h3::before {
    counter-increment: section;
    content: "Section " counter(section) ": ";
}

/* CSS Variables */
:root {
    --primary-color: #9d4edd;
    --secondary-color: #c77dff;
}

.var-test {
    color: var(--primary-color);
    background: var(--secondary-color);
}
</style>

<div class="grid-test">
    <div>Grid Item 1</div>
    <div>Grid Item 2</div>
    <div>Grid Item 3</div>
</div>

<div class="animation-test">This text should pulse (in browsers)</div>

<div class="custom-counter">
    <h3>First Section</h3>
    <h3>Second Section</h3>
    <h3>Third Section</h3>
</div>

---

## 7. Form Elements (Usually Not Rendered in PDFs)

<form>
    <input type="text" placeholder="Text input test" />
    <input type="checkbox" checked /> Checkbox test
    <input type="radio" name="test" /> Radio 1
    <input type="radio" name="test" /> Radio 2
    <select>
        <option>Dropdown test</option>
        <option>Option 2</option>
    </select>
    <textarea>Textarea content test</textarea>
    <button>Button Test</button>
</form>

---

## 8. Deeply Nested Structures

> Level 1 Blockquote
> > Level 2 Blockquote
> > > Level 3 Blockquote
> > > > Level 4 Blockquote
> > > > > Level 5 Blockquote - How deep can we go?

1. Ordered List Level 1
   1. Ordered List Level 2
      1. Ordered List Level 3
         1. Ordered List Level 4
            1. Ordered List Level 5
               - Mixed with unordered
                 - Even deeper
                   - And deeper still

---

## 9. Special Markdown Extensions

### Task Lists
- [x] Completed task
- [ ] Incomplete task
- [x] ~~Completed with strikethrough~~

### Footnotes
This is a sentence with a footnote[^1].

[^1]: This is the footnote content.

### Definition Lists
Term 1
:   Definition 1

Term 2
:   Definition 2a
:   Definition 2b

### Abbreviations
The HTML specification is maintained by the W3C.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

---

## 10. Performance Stress Test

<!-- Generating 1000 paragraphs to test memory/performance -->
<!-- In practice, truncating to a few for demo -->

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 

[Imagine this repeated 1000 times - tests memory limits and file size handling]

---

## Edge Case Summary

This document tests:
1. ✓ Unicode and special characters
2. ✓ Complex tables and layouts
3. ✓ Code block edge cases
4. ✓ Page breaks and tall content
5. ✓ Images and media handling
6. ✓ Advanced CSS features
7. ✓ Form elements
8. ✓ Deep nesting
9. ✓ Markdown extensions
10. ✓ Performance limits

🔬 End of edge case testing suite