# ProsperouSSS Design System

## Design Philosophy
Our design system aims to create a sophisticated, data-rich environment that feels more like a professional financial terminal than a typical web app. The design should convey:
- **Precision**: Through crisp typography and sharp visual elements
- **Depth**: Using layered information and subtle shadows
- **Intelligence**: With real-time data streaming and smooth transitions
- **Trust**: Through a professional color palette and consistent visual hierarchy

## Color System

### Primary Palette
- **Base**: `#0A0A0A` - Near-black background
- **Surface**: `#1A1A1A` - Card and component backgrounds
- **Accent**: `#00FF95` - Primary interactive elements (like Bloomberg Terminal green)
- **Secondary**: `#FF3B3B` - Alerts and critical information
- **Tertiary**: `#FFB800` - Warnings and notifications

### Data Visualization Palette
- **Positive**: `#00C853` - Upward trends, success states
- **Negative**: `#FF3D00` - Downward trends, error states
- **Neutral**: `#78909C` - Baseline data
- **Highlight**: `#448AFF` - Selected data points
- **Accent Series**: `['#00BCD4', '#7C4DFF', '#FFD740', '#FF6E40']` - For multi-series charts

### Gradient System
- **Surface Gradient**: `linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)`
- **Accent Gradient**: `linear-gradient(90deg, #00FF95 0%, #00E5FF 100%)`
- **Data Gradient**: `linear-gradient(180deg, rgba(0,255,149,0.1) 0%, rgba(0,255,149,0) 100%)`

## Typography

### Font Stack
```css
--font-display: "JetBrains Mono", monospace;  /* For data and numbers */
--font-body: "Inter", -apple-system, sans-serif;  /* For general text */
```

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Section headers
- **Semibold**: 600 - Important data points
- **Bold**: 700 - Key metrics and CTAs

## Component Design

### Cards
- Subtle gradient backgrounds
- Sharp corners (0px radius)
- Thin border (1px) with accent color
- Hover state: Slight elevation increase
- Active state: Accent border glow

### Data Visualization
- Dark theme optimized
- Minimal grid lines
- Data point highlights on hover
- Animated transitions for data updates
- Real-time streaming indicators

### Navigation
- Tab-based navigation with underline indicators
- Active state: Accent color fill
- Hover state: 60% opacity of active state
- Clear visual hierarchy for sub-navigation

### Forms
- Minimal, borderless inputs
- Accent color focus states
- Inline validation
- Real-time feedback
- Smart defaults with placeholder data

## Layout System

### Grid System
- 12-column grid
- Gutter: 24px
- Margin: 32px
- Breakpoints:
  - Mobile: 320px
  - Tablet: 768px
  - Desktop: 1024px
  - Wide: 1440px

### Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 1rem;     /* 16px */
--space-4: 1.5rem;   /* 24px */
--space-5: 2rem;     /* 32px */
--space-6: 3rem;     /* 48px */
```

## Animation & Interaction

### Transitions
- **Duration**: 200ms for UI, 400ms for data
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Properties**: transform, opacity, background-color

### Hover States
- Scale: 1.02 for interactive elements
- Opacity: 0.8 for icons and buttons
- Background: Lighten by 5%
- Shadow: Increase elevation slightly

### Loading States
- Skeleton screens with gradient animation
- Pulsing animation for real-time updates
- Progress indicators for long operations

## Data Presentation

### Metrics Display
- Monospace font for numbers
- Right-aligned numerical values
- Thousands separator for large numbers
- Consistent decimal places
- Color-coded positive/negative changes
- Subtle animations for value changes

### Charts & Graphs
- Minimal axis lines
- Data-ink ratio optimization
- Interactive tooltips
- Zoom and pan controls
- Real-time streaming capability
- Consistent color coding

### Tables
- Zebra striping with 5% opacity
- Sticky headers
- Hover row highlight
- Sort indicators
- Pagination controls
- Column resize handles

## Responsive Behavior

### Mobile Adaptations
- Single column layouts
- Collapsible sections
- Touch-optimized controls
- Simplified data visualizations
- Bottom sheet navigation

### Tablet Adaptations
- Two column layouts
- Side panel navigation
- Hybrid touch/pointer interactions
- Responsive data visualizations

### Desktop Optimizations
- Multi-column layouts
- Advanced filtering
- Keyboard shortcuts
- Detailed tooltips
- Multiple visible panels

## Accessibility

### Color Contrast
- Minimum contrast ratio: 4.5:1
- Enhanced contrast mode available
- Color-blind friendly palette
- Text against gradients tested

### Focus States
- Visible focus indicators
- Skip navigation links
- Keyboard accessible controls
- ARIA labels and roles

### Motion & Animation
- Respects reduced-motion preferences
- Essential animations only
- No purely decorative motion

## Implementation Notes

### CSS Architecture
- CSS Modules for component styles
- CSS Custom Properties for theming
- Utility classes for common patterns
- BEM naming convention

### Performance Considerations
- Code-split components
- Lazy-load visualizations
- Optimized font loading
- Efficient re-renders
- Debounced real-time updates

### Browser Support
- Modern evergreen browsers
- Graceful degradation
- Progressive enhancement
- Fallback patterns

## Next Steps

1. **Immediate Actions**
   - Implement new color system
   - Update typography
   - Redesign card components
   - Enhance data visualizations

2. **Short-term Goals**
   - Add micro-interactions
   - Improve loading states
   - Implement responsive layouts
   - Enhance accessibility

3. **Long-term Vision**
   - Advanced data filtering
   - Custom visualization tools
   - Personalization options
   - AI-driven UI adaptations 