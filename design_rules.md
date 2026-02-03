# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- **Primary Background:** Deep charcoal #181A20 (main canvas), with a subtle dot grid texture overlay.
- **Surface/Panel:** Slightly lighter charcoal #22242C for sidebars, panels, and cards.
- **Accent Colors:** Neon green #3DFF7F (node highlights and connection points), electric blue #2F87FF (active/selected state), bright yellow #FFC24B (notification/alert icon).
- **Text Colors:** High-contrast white #FFFFFF for primary text, muted gray #A0A3AD for secondary/label text, and dimmer gray #5C5F6E for placeholder or disabled states.
- **Borders/Dividers:** Low-opacity white/gray #31343C or #2B2D36 for subtle separation.
- **Other Accents:** Occasional pastel gradients for user avatars in the top-right (rainbow spectrum: #56CCF2, #2F80ED, #9B51E0, #F2994A, #F2C94C).
- **Button States:** Blue #2F87FF for active, #22242C for default/inactive, with lighter overlays on hover.

### Typography & Layout:
- **Font Family:** Rounded, modern sans-serif (e.g., Inter, SF Pro Display, or similar).
- **Weights:** Medium (500) for headings, Regular (400) for body, SemiBold (600) for emphasis or key labels.
- **Hierarchy:** Large, bold section titles; medium-sized node/device labels; smaller, lighter secondary info.
- **Spacing:** Generous padding (24-32px on panels), compact vertical spacing (8-12px) between related items, consistent 16px grid for alignment.
- **Alignment:** Strong left alignment for lists/panels, centered alignment for node diagrams.

### Key Design Elements

#### Card Design:
- **Styling:** Rounded corners (12-16px radius), subtle inner shadows, and soft drop shadows (#00000033, 8-16px blur) for elevation.
- **Borders:** Minimal/no visible borders; separation achieved via shadows and contrasting backgrounds.
- **Hover States:** Slightly brighter background and soft glow effect on hover/active.
- **Hierarchy:** Card titles bolded, content clearly grouped with spacing and visual cues.

#### Navigation:
- **Patterns:** Horizontal top bar for global actions; vertical sidebar with icon-only navigation, highlighted by subtle background on active item.
- **Sidebar:** Rounded, floating appearance with icons in white or muted gray, active icon in neon green or blue.
- **Active States:** Glowing/neon ring or solid background behind active navigation items.
- **Expandable Elements:** Minimal, only visible when in use (e.g., simulation panel collapse/expand).

#### Data Visualization:
- **Chart Styles:** Node-link diagrams with curved neon lines (green/blue) connecting rounded device nodes.
- **Colors:** Active nodes glow in blue, inactive in gray; connection points highlighted in green.
- **Visual Treatments:** Minimalist, schematic-style diagrams with icons and labels; event lists use compact rows with pill-shaped protocol tags.
- **Patterns:** Grid overlays for reference; clear visual mapping between list items and diagram nodes.

#### Interactive Elements:
- **Buttons:** Rounded rectangles, solid fill (charcoal or blue), white iconography, subtle glowing effect on hover.
- **Form Elements:** Rounded input fields, high-contrast placeholder text, clear focus/active states with neon-blue borders.
- **Interactive States:** Soft glow or color shift on hover/click, ripple or shadow effects for feedback.
- **Micro-interactions:** Animation on play/pause controls, real-time highlighting of active nodes/events.

### Design Philosophy
This interface embodies:
- A bold, futuristic, and highly readable aesthetic, leveraging dark mode with neon accents for clarity and energy.
- Minimalist, utilitarian principles focused on reducing visual clutter while maximizing information density and legibility.
- Rounded corners and soft shadows create an approachable, contemporary feel, balancing professionalism with a touch of playfulness.
- The user experience prioritizes speed and focus, allowing power users to parse complex data at a glance, with strong visual hierarchy and interactive feedback guiding workflows.
- Visual strategy ensures that actionable elements stand out while background elements recede, supporting efficient multitasking and confident control.

---

This project follows the "---

## Visual Style

### Color Palette:
- **Primary Background:** Deep charcoal #181A20 (main canvas), with a subtle dot grid texture overlay.
- **Surface/Panel:** Slightly lighter charcoal #22242C for sidebars, panels, and cards.
- **Accent Colors:** Neon green #3DFF7F (node highlights and connection points), electric blue #2F87FF (active/selected state), bright yellow #FFC24B (notification/alert icon).
- **Text Colors:** High-contrast white #FFFFFF for primary text, muted gray #A0A3AD for secondary/label text, and dimmer gray #5C5F6E for placeholder or disabled states.
- **Borders/Dividers:** Low-opacity white/gray #31343C or #2B2D36 for subtle separation.
- **Other Accents:** Occasional pastel gradients for user avatars in the top-right (rainbow spectrum: #56CCF2, #2F80ED, #9B51E0, #F2994A, #F2C94C).
- **Button States:** Blue #2F87FF for active, #22242C for default/inactive, with lighter overlays on hover.

### Typography & Layout:
- **Font Family:** Rounded, modern sans-serif (e.g., Inter, SF Pro Display, or similar).
- **Weights:** Medium (500) for headings, Regular (400) for body, SemiBold (600) for emphasis or key labels.
- **Hierarchy:** Large, bold section titles; medium-sized node/device labels; smaller, lighter secondary info.
- **Spacing:** Generous padding (24-32px on panels), compact vertical spacing (8-12px) between related items, consistent 16px grid for alignment.
- **Alignment:** Strong left alignment for lists/panels, centered alignment for node diagrams.

### Key Design Elements

#### Card Design:
- **Styling:** Rounded corners (12-16px radius), subtle inner shadows, and soft drop shadows (#00000033, 8-16px blur) for elevation.
- **Borders:** Minimal/no visible borders; separation achieved via shadows and contrasting backgrounds.
- **Hover States:** Slightly brighter background and soft glow effect on hover/active.
- **Hierarchy:** Card titles bolded, content clearly grouped with spacing and visual cues.

#### Navigation:
- **Patterns:** Horizontal top bar for global actions; vertical sidebar with icon-only navigation, highlighted by subtle background on active item.
- **Sidebar:** Rounded, floating appearance with icons in white or muted gray, active icon in neon green or blue.
- **Active States:** Glowing/neon ring or solid background behind active navigation items.
- **Expandable Elements:** Minimal, only visible when in use (e.g., simulation panel collapse/expand).

#### Data Visualization:
- **Chart Styles:** Node-link diagrams with curved neon lines (green/blue) connecting rounded device nodes.
- **Colors:** Active nodes glow in blue, inactive in gray; connection points highlighted in green.
- **Visual Treatments:** Minimalist, schematic-style diagrams with icons and labels; event lists use compact rows with pill-shaped protocol tags.
- **Patterns:** Grid overlays for reference; clear visual mapping between list items and diagram nodes.

#### Interactive Elements:
- **Buttons:** Rounded rectangles, solid fill (charcoal or blue), white iconography, subtle glowing effect on hover.
- **Form Elements:** Rounded input fields, high-contrast placeholder text, clear focus/active states with neon-blue borders.
- **Interactive States:** Soft glow or color shift on hover/click, ripple or shadow effects for feedback.
- **Micro-interactions:** Animation on play/pause controls, real-time highlighting of active nodes/events.

### Design Philosophy
This interface embodies:
- A bold, futuristic, and highly readable aesthetic, leveraging dark mode with neon accents for clarity and energy.
- Minimalist, utilitarian principles focused on reducing visual clutter while maximizing information density and legibility.
- Rounded corners and soft shadows create an approachable, contemporary feel, balancing professionalism with a touch of playfulness.
- The user experience prioritizes speed and focus, allowing power users to parse complex data at a glance, with strong visual hierarchy and interactive feedback guiding workflows.
- Visual strategy ensures that actionable elements stand out while background elements recede, supporting efficient multitasking and confident control.

---" design pattern.
All design decisions should align with this pattern's best practices.

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)
- Adjust shadow intensity based on theme (lighter in dark mode)

---

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions
9. **Be Themeable** - Support both dark and light modes seamlessly

---

