# Design System Tokens

## Color Tokens

### Brand Colors
```css
--color-brand-primary: #4CAF50;    /* Primary green */
--color-brand-secondary: #2196F3;  /* Blue accent */
--color-brand-tertiary: #FF9800;   /* Orange accent */
```

### Semantic Colors
```css
/* Status */
--color-success: #4CAF50;
--color-success-light: #81C784;
--color-error: #F44336;
--color-error-light: #EF5350;
--color-warning: #FF9800;
--color-info: #2196F3;

/* Metrics */
--color-positive: #4CAF50;  /* +12.5% */
--color-negative: #F44336;  /* -2.7% */
--color-neutral: #9E9E9E;   /* 0% */
```

### Neutral Colors
```css
--color-gray-50: #FAFAFA;
--color-gray-100: #F5F5F5;
--color-gray-200: #EEEEEE;
--color-gray-300: #E0E0E0;
--color-gray-400: #BDBDBD;
--color-gray-500: #9E9E9E;
--color-gray-600: #757575;
--color-gray-700: #616161;
--color-gray-800: #424242;
--color-gray-900: #212121;
```

### Background Colors
```css
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F8F9FA;
--color-bg-tertiary: #F5F5F5;
--color-bg-sidebar: #F8F9FA;
--color-bg-card: #FFFFFF;
--color-bg-hover: rgba(0, 0, 0, 0.04);
```

### Chart Colors
```css
--chart-primary: #4CAF50;
--chart-secondary: #2196F3;
--chart-tertiary: #FF9800;
--chart-quaternary: #9C27B0;
--chart-gradient-start: rgba(76, 175, 80, 0.3);
--chart-gradient-end: rgba(76, 175, 80, 0.0);
```

## Typography Tokens

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 2rem;      /* 32px */
--font-size-4xl: 2.5rem;    /* 40px */
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

## Spacing Tokens

### Base Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Component Spacing
```css
--padding-card: var(--space-6);
--padding-section: var(--space-8);
--gap-cards: var(--space-6);
--gap-metrics: var(--space-4);
```

## Border Tokens

### Border Radius
```css
--radius-sm: 4px;
--radius-base: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Border Width
```css
--border-width-thin: 1px;
--border-width-base: 2px;
--border-width-thick: 4px;
```

### Border Colors
```css
--border-color-light: var(--color-gray-200);
--border-color-base: var(--color-gray-300);
--border-color-dark: var(--color-gray-400);
```

## Shadow Tokens

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Animation Tokens

```css
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

--easing-base: cubic-bezier(0.4, 0, 0.2, 1);
--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```