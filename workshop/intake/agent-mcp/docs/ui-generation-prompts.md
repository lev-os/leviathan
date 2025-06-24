# UI Generation Prompts for Analytics Dashboard

## Component Generation Prompts

### Metric Card Component
```
Create a metric card component with the following specifications:
- Display a label, primary value, and percentage change
- Show positive changes in green (#4CAF50) with an up arrow
- Show negative changes in red (#F44336) with a down arrow
- Include a subtle shadow and hover effect
- Use Inter or system font, with the value in 32px bold
- Add smooth transitions for all interactive states
- Ensure accessibility with proper ARIA labels
```

### Area Chart Component
```
Generate a responsive area chart component:
- Smooth curved lines with gradient fill underneath
- X-axis showing months, Y-axis showing values with K/M suffixes
- Interactive tooltip showing exact values on hover
- Grid lines in light gray (#E0E0E0)
- Primary color #4CAF50 with gradient fade to transparent
- Responsive sizing that maintains aspect ratio
- Animate the chart drawing on initial load
- Include proper accessibility descriptions
```

### Donut Chart Component
```
Create a donut chart for browser distribution:
- Center hole showing total percentage
- Colored segments with smooth transitions
- Legend showing browser names and percentages
- Colors: Chrome (#4CAF50), Mozilla (#FF9800), Edge (#2196F3)
- Interactive hover states that slightly expand segments
- Smooth rotation animation on load
- Mobile-responsive with legend below on small screens
```

### Sidebar Navigation Component
```
Build a collapsible sidebar navigation:
- 280px width on desktop, full height
- Light gray background (#F8F9FA)
- Logo area at top with proper spacing
- Navigation items with icons and hover states
- Expandable sections with smooth accordion animation
- Active state indication with left border accent
- User profile section at bottom
- Hamburger menu for mobile with slide-in animation
- Maintain scroll position between page changes
```

### Data Table Component
```
Generate a responsive data table for country sales:
- Alternating row colors for better readability
- Sortable columns with arrow indicators
- Bar visualization within cells for percentages
- Country flags or codes in first column
- Responsive horizontal scroll on mobile
- Sticky header when scrolling
- Hover states on rows
- Export functionality with CSV/Excel options
```

## Layout Generation Prompts

### Dashboard Layout
```
Create a responsive dashboard layout:
- Fixed sidebar (280px) with collapsible navigation
- Main content area with 32px padding
- 12-column grid system with 24px gutters
- Metric cards in a 4-column grid on desktop
- Charts section with 2/3 + 1/3 split layout
- Stack all components vertically on mobile
- Smooth transitions between breakpoints
- Maintain scroll position on sidebar toggle
```

### Empty State
```
Design an empty state for no data scenarios:
- Centered illustration or icon
- Clear heading explaining the empty state
- Helpful description with next steps
- Primary CTA button to take action
- Maintain brand colors and typography
- Subtle animation to draw attention
- Different messages for different data types
```

### Loading State
```
Create loading states for async data:
- Skeleton screens matching component shapes
- Subtle shimmer animation effect
- Preserve layout to prevent content jumping
- Progressive loading for better perceived performance
- Show stale data with loading indicator for updates
- Timeout handling with error state after 10 seconds
```

## Interaction Prompts

### Filter System
```
Build an advanced filter system:
- Dropdown menus for date ranges and categories
- Multi-select with checkboxes for complex filters
- Clear visual indication of active filters
- "Clear all" option to reset filters
- Real-time data updates as filters change
- Save filter presets for common queries
- Responsive design that works on mobile
```

### Data Export
```
Implement data export functionality:
- Export button with dropdown for format selection
- Support CSV, Excel, PDF, and PNG (for charts)
- Include all visible data respecting current filters
- Progress indicator for large exports
- Email option for scheduled exports
- Maintain formatting and calculations in exports
```

## Responsive Behavior Prompts

### Mobile Optimization
```
Optimize dashboard for mobile devices:
- Single column layout below 768px
- Collapsible sidebar with hamburger menu
- Touch-friendly tap targets (minimum 44px)
- Horizontal scroll for wide tables
- Bottom navigation for primary actions
- Swipe gestures for chart interactions
- Optimized font sizes for readability
- Reduced animations for performance
```

### Tablet Layout
```
Create tablet-optimized layout (768-1199px):
- 2-column grid for metric cards
- Maintain sidebar but allow overlay mode
- Optimize chart sizes for tablet viewing
- Touch-optimized interactions
- Landscape and portrait orientation support
- Adjust spacing for touch interfaces
```

## Accessibility Prompts

### Screen Reader Support
```
Ensure full screen reader compatibility:
- Descriptive ARIA labels for all components
- Announce data updates and changes
- Provide text alternatives for charts
- Logical heading structure (h1-h6)
- Skip navigation links
- Form labels and error associations
- Live regions for dynamic content
```

### Keyboard Navigation
```
Implement comprehensive keyboard navigation:
- Tab order following visual hierarchy
- Arrow keys for menu navigation
- Enter/Space for activating controls
- Escape to close modals/dropdowns
- Focus trap in modal dialogs
- Visible focus indicators
- Keyboard shortcuts for common actions
```

## Performance Optimization Prompts

### Lazy Loading
```
Implement lazy loading strategy:
- Load visible content first
- Defer below-fold chart rendering
- Progressive image loading
- Code split by route
- Virtualize long lists
- Cache API responses
- Preload critical resources
```

### Animation Performance
```
Optimize animations for 60fps:
- Use CSS transforms over position changes
- Implement will-change for heavy animations
- Reduce animation on low-end devices
- Use requestAnimationFrame for JS animations
- Debounce rapid user interactions
- GPU acceleration for transforms
```