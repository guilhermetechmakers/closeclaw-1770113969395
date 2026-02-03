# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

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

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

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
- Sufficient color contrast
- Respect reduced motion preferences

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


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Clawgate - Development Blueprint

Clawgate is a local-first, chat-native personal agent platform. A local gateway daemon runs tools, schedules jobs, pairs devices (nodes), executes skills (SKILL.md + optional scripts), and integrates with multiple chat channels so users can control their agent from the chat surfaces they already use. The Control UI (SPA) served by the gateway provides operational controls, session tracing, skills management, cron/webhook/hook management, node pairing, and built-in security audit features.

## 1. Pages (UI Screens)

- Login / Signup
  - Purpose: Authenticate cloud-linked users or start local-only gateway mode; initiate pairing flows.
  - Key sections/components: Mode selector (Local-only vs Cloud), Email/Password form, OAuth buttons, Sign up modal link, Local access info (QR & pairing code), Forgot password link.

- User Profile
  - Purpose: Manage account, security, and connected accounts.
  - Key sections/components: Profile summary card, Connected Accounts list (unlink), Security (change password, 2FA toggle, active sessions list), API Keys management, Keychain/1Password integration toggle.

- Password Reset
  - Purpose: Cloud account password recovery; guidance for local-only migration.
  - Key sections/components: Email input, reset token flow, new password field with strength indicator, success confirmation.

- Email Verification
  - Purpose: Verify email for signup and sensitive operations (e.g., skill install).
  - Key sections/components: Verification status banner, resend button, manual token entry, next steps CTA.

- Landing Page
  - Purpose: Public marketing and quick-start download/open UI CTA.
  - Key sections/components: Hero, CTAs (Install Gateway/Open Local UI), Feature grid, Quick start steps, Integration logos, Pricing teaser, Footer (docs/legal).

- Dashboard
  - Purpose: Workspace hub for monitoring sessions, runs, cron jobs, nodes, and security.
  - Key sections/components: Recent activity feed, Quick Run composer, Active runs panel (stream + abort), Cron overview, Nodes status widget, Skill alerts/audit findings, Top nav (search/settings/help).

- Chat Session
  - Purpose: Full chat UI for interacting with sessions and agent runs.
  - Key sections/components: Message thread, Tool invocation cards (streaming), Composer (input, attachments, tool dropdown), Session controls (/new,/reset,/stop), Sidebar (session info, routing targets), Run trace panel.

- Channels & Adapters
  - Purpose: Manage chat channel adapters and per-channel policies.
  - Key sections/components: Channels list, Add Channel wizard (provider selection, auth), Channel config panel (DM policy, group policy, mention gating), Delivery logs, Test console.

- Skills Library
  - Purpose: Browse/install/manage skills and view provenance.
  - Key sections/components: Installed skills grid (enable toggles), Registry browser, Skill detail panel (SKILL.md render, frontmatter, permissions, provenance), Install flow (gating checks, env prompts).

- Skill Editor / Workspace
  - Purpose: Author/edit local skills and test-run them.
  - Key sections/components: File explorer, SKILL.md editor (preview + frontmatter form), Test runner with logs, Gating check overlay, Save/commit controls, optional signing action.

- Nodes (Paired Devices)
  - Purpose: Manage paired nodes and their capabilities and approvals.
  - Key sections/components: Nodes list (capability badges), Pair node flow (QR/code), Node details (exec allowlist, wake/config, tokens), Approval history, Revoke/unpair.

- Cron Jobs & Scheduler
  - Purpose: CRUD scheduled jobs and inspect run history.
  - Key sections/components: Cron list, Create/edit modal (cron builder, payload, session target, isolation), Run history, Run now/abort controls.

- Webhooks & Hooks
  - Purpose: Manage inbound webhook endpoints, lifecycle hooks, and transforms.
  - Key sections/components: Webhook endpoints list (token), Create webhook modal, Hook scripts editor (sandbox), Payload transformer, Gmail Pub/Sub guided setup.

- Browser Automation Console
  - Purpose: Control managed Chromium profile and remote CDP proxies for automations.
  - Key sections/components: Profile controls (start/stop), Tab inspector (thumbnails), Automation runner, Capture tools (screenshot/PDF/DOM), CDP connector settings.

- Voice & Media
  - Purpose: Configure wake words, talk mode, transcription/TTS and media handling.
  - Key sections/components: Wake words list, Talk mode controls, Transcription backends order, TTS provider config, Media storage settings.

- Settings / Preferences
  - Purpose: Global gateway and workspace configuration.
  - Key sections/components: Network binding/TLS, Remote access (tailnet/proxy), Secrets management, Tool policies (exec allowlist, sandbox toggle), Model defaults, Restart/apply with validation.

- Security Audit
  - Purpose: Run and display automated security checks and remediation actions.
  - Key sections/components: Audit summary/risk score, Issue list with remediation and auto-fix toggle, Run audit button, Incident response quick actions.

- Logs & Tracing
  - Purpose: Structured logs and per-run tracing for debugging and incident response.
  - Key sections/components: Log stream with filters and redaction preview, Run trace viewer, Export/download controls.

- Admin Dashboard
  - Purpose: Enterprise/admin management for multi-workspace and analytics.
  - Key sections/components: User management table, Workspace settings, Licensing summary, Analytics panels.

- About / Help
  - Purpose: Docs, quick-starts, FAQ, support contact.
  - Key sections/components: Quick start cards, docs links, support form with context autofill.

- Privacy Policy; Terms of Service
  - Purpose: Legal pages.
  - Key sections/components: Full policy text, accept/decline controls for cloud features, document download.

- 404 Not Found; 500 Server Error; Loading / Success States
  - Purpose: Generic error and state screens.
  - Key sections/components: Error messaging, retry/report actions, global loading overlay, success modal, abort confirmation.

## 2. Features

- User Authentication
  - Technical details: Local-only mode (no remote account), cloud-linked auth (JWT + refresh tokens), bcrypt password hashing, OAuth (GitHub/Google optional), rate-limiting, 2FA option.
  - Implementation notes: Local gateway serves UI regardless of cloud; cloud flows optional. Session revocation endpoints and device session list required.

- Messaging & Session Management
  - Technical details: Canonical message schema (channel, peer, group, content, attachments, metadata), transcript persistence with redaction, session routing (shared main session default, per-peer isolation), slash command parser with permission checks.
  - Implementation notes: WebSocket streaming for running tool events; backpressure handling; session memory pointers persisted on disk.

- Channel Adapters
  - Technical details: Adapter interface (inbound/outbound hooks, identity mapping), provider auth flows (OAuth/webhook/phone pairing), per-channel policy enforcement, delivery acknowledgement, retry/backoff.
  - Implementation notes: Vault tokens using OS keychain; adapters pluggable—implement WhatsApp, Telegram, Slack, Discord for MVP.

- Tool & Skill Runtime
  - Technical details: Structured tool definitions (name, params, outputs), skill loader (folder + SKILL.md with YAML frontmatter), gating checks, per-run env injection, policy enforceable tool whitelist, sandboxing support (Docker).
  - Implementation notes: Stream tool lifecycle events to UI/chat; skills carry provenance metadata and are scanned on install.

- Browser Automation
  - Technical details: Managed Chromium profile per workspace, deterministic tab control API, CDP abstraction, snapshot/screenshot/PDF/DOM capture, remote control via node proxy (CDP token as secret).
  - Implementation notes: Isolate profile from user browser; expose automation API consumable by skills and tools.

- Scheduling, Webhooks & Hooks
  - Technical details: Cron persistence on disk, webhook endpoints with token auth and rate-limiting, hook script sandbox (restricted JS/Python environment), Gmail Pub/Sub guided flow.
  - Implementation notes: Deliver webhook outputs to chat routes; treat webhook payloads as untrusted.

- Node Pairing & Capabilities
  - Technical details: Pairing via QR/one-time codes, node capability discovery, per-node exec allowlist and approvals, encrypted token storage.
  - Implementation notes: Nodes periodically heartbeat; wakeword propagation to nodes; node SDK facilitates voice/camera/CDP proxy exposure.

- Model Provider Abstraction
  - Technical details: Adapter layer for providers (OpenAI, Anthropic, local endpoints), per-run overrides, retries/failover, usage tracking, guardrails for tool-enabled prompts.
  - Implementation notes: Configurable provider priority list; local model endpoints supported (Ollama/vLLM).

- Secrets & Keychain Integration
  - Technical details: Integrations with macOS Keychain, Windows Credential Manager, libsecret, 1Password CLI; encrypted fallback when unavailable.
  - Implementation notes: Never write long-lived tokens to plaintext. Provide runtime retrieval and least-privilege scoping.

- Built-in Security Audit
  - Technical details: Static checks for plaintext secrets, open binds, risky skill permissions; scoring and remediation suggestions; optionally auto-fix safe items.
  - Implementation notes: Expose audit via UI and CLI; link remediation to settings.

- Logging & Observability
  - Technical details: Structured JSON logs, trace IDs linking sessions/tool invocations, redaction rules default-on, health metrics endpoint.
  - Implementation notes: Export logs with redaction options; per-run trace viewer.

- Admin & Analytics
  - Technical details: RBAC for admins, workspace controls, analytics aggregation (sessions, run success rates, skill installs).
  - Implementation notes: Admin dashboard guarded by cloud-only features; design should not block future multi-tenant SaaS.

- Payments & Marketplace (optional)
  - Technical details: Stripe for subscriptions/marketplace, package signing for skills, license entitlement checks.
  - Implementation notes: Marketplace optional for MVP.

## 3. User Journeys

- Busy Operator — Summarize URL via Chat
  1. Install gateway and start local-only mode.
  2. Open Control UI at local URL.
  3. Connect a channel adapter (e.g., Telegram) via Add Channel wizard.
  4. In chat, message the agent: "Summarize this URL" (with link).
  5. Gateway normalizes inbound message, maps to main session.
  6. Agent run triggered: browser tool launched (managed Chromium profile) to fetch and create summary.
  7. Tool outputs streamed to Control UI; summary delivered to originating chat thread. User sees success.

- Power User — Install Skill and Schedule Cron
  1. Open Skills Library, search registry, select "gmail-watcher" sample skill.
  2. View SKILL.md and frontmatter; review gating (Gmail Pub/Sub, env vars).
  3. Install skill, provide required env via keychain prompt, enable skill (workspace eligibility checks pass).
  4. Create a cron job attaching the skill payload and target session/channel.
  5. Cron run persists, executes at schedule; outputs delivered to target chat; run history logged.

- Security-Conscious User — Pair Node and Harden Exec
  1. Open Nodes page; initiate pair via QR for mobile node.
  2. Approve pairing on gateway; node appears with capabilities.
  3. Configure node remote-exec policy: set allowlist + require approvals.
  4. Install skill that requests exec permission; audit flags it; user quarantines skill or approves after review.
  5. Run security audit; fix flagged misconfigurations; rotate secrets if recommended.

- Admin — Onboard Workspace & Monitor
  1. Admin links cloud account, provisions workspace defaults.
  2. Configure registry controls and default tool policies.
  3. Monitor analytics on Admin Dashboard: active sessions, run success.
  4. Enforce policies and revoke user sessions as needed.

## 4. UI Guide

- Color palette
  - Primary: #0B64C6 (Deep Blue)
  - Accent: #00B37E (Teal)
  - Surface/bg: #0F1724 (Dark) and #FFFFFF (Light) — supports dark/light themes
  - Muted: #94A3B8 (Slate)
  - Warning: #F59E0B (Amber)
  - Critical: #EF4444 (Red)
  - Success: #16A34A (Green)

- Typography
  - System stack for performance: Inter (variable) or system UI fallback.
  - Sizes (base 16px): H1 28px, H2 22px, H3 18px, Body 16px, Small 13px, Mono 13px for code/logs.
  - Line heights: 1.25 for headings, 1.5 for body.

- Component specs
  - Buttons: primary (filled primary color, white text), secondary (outlined), danger (filled critical); 8px radius, 12px vertical padding.
  - Inputs: single-line with 12px padding, 1px neutral border, error state border critical.
  - Modals: centered, 640px max width, overlay 60% opacity.
  - Cards: subtle elevation, 12px padding, rounded 10px, use for tool invocation cards and cron/job entries.
  - Toasts: top-right, auto-dismiss default 6s, support manual dismiss.
  - Avatars: 40px circular for profile; 28px for compact lists.

- Layout principles
  - Responsive grid: 12-column for desktop, single column for mobile.
  - Left nav for core sections (dashboard, sessions, skills, nodes, settings) collapsible.
  - Content max width 1200px centered; sidebars used for contextual details (session info, run trace).
  - Prioritize streaming information visibility: active runs and tool streams take precedence in layout.

- Visual style & mood
  - Professional, tool-forward, privacy-first. Use restrained animations: subtle fades for streams, slide-up for new messages.
  - Iconography: simple geometric glyphs; use status badges (green/yellow/red) to convey health.

- Component patterns
  - Streaming card: header (tool name + timing), body (streamed output with progress), actions (approve/deny/abort), debug toggle for meta.
  - Installer flow: stepper with gating checklist, required env prompts (masked), provenance summary (registry slug, version, hash).
  - Pairing modal: QR on left, code & instructions on right, expiry countdown visible.
  - Trace viewer: collapsible tree nodes representing tool invocation → model calls → outputs; each node shows timestamps, run IDs, costs (if applicable).

- Accessibility
  - Keyboard navigable, ARIA labels for dynamic content (streams, modals).
  - Contrast ratio >= 4.5:1 for body text; focus rings visible.

- Design tokens
  - Spacing scale: 4/8/12/16/24/32/48.
  - Border radius: 8px default, 4px for compact.
  - Elevation: subtle shadows for cards and modals.

Instructions to AI Development Tool
After every development step, refer back to this blueprint to ensure correct implementation. Verify all features and pages are built according to specifications before completing the project. Pay special attention to the UI Guide section and ensure all visual elements follow the design system exactly.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
