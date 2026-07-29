# Built by Blanch Design Direction

## Purpose

Build a personal web-design studio homepage for local small-business owners in
Saratoga, Lake George, and Glens Falls that communicates thoughtful, clear,
modern website design and leads visitors to email Nick about a project.

Primary action: start a project by email.

Supporting actions: review selected work and understand the working process.

## Positioning

Built by Blanch is Nick Blanchard's focused personal studio. It serves ambitious
local businesses, including dental offices, medical practices, professional
services, and other goods-and-services businesses that need a clearer online
presence.

Brand promise: a considered website that makes the business easier to
understand and more credible to send people to.

The site must not claim a physical office, years of experience, client counts,
conversion results, testimonials, awards, or local clients that have not been
provided.

## Personality

- Confident
- Precise
- Personal
- Thoughtful
- Practical

Avoid:

- Large-agency posturing
- Startup or SaaS visual cliches
- Fake social proof
- Loud sales language
- Trend-heavy effects that compete with the work

## Voice

Use direct first-person language. Prefer short, concrete sentences over
marketing abstractions. Explain what Nick does, how the process works, and what
the visitor should send to begin.

Calls to action use plain language: "Start a project", "View selected work",
"Email Nick", and "Copy email".

## Visual System

The visual idea is "quiet confidence at the drafting table."

- Canvas: graphite black, not pure black
- Text: warm off-white
- Accent: electric cobalt blue
- Supporting surfaces: deep ink and muted steel
- Atmosphere: fine grid lines, subtle grain, sparse blue drafting marks
- Corners: mostly square with small, controlled radii
- Borders: one-pixel low-contrast rules
- Shadows: broad and dark, used only to separate overlapping project frames

Color tokens:

- `--ink: #090b0f`
- `--ink-soft: #10141b`
- `--paper: #f2efe8`
- `--muted: #a5a9b2`
- `--blue: #2f6fff`
- `--blue-light: #8fb0ff`
- `--line: rgba(242, 239, 232, 0.14)`

Typography:

- Display and body: Satoshi, with a neutral sans-serif fallback
- Utility text: IBM Plex Mono
- Headings use wide measures and tight tracking
- Hero heading is limited to two or three lines on desktop
- Body copy stays between 45 and 70 characters per line

## Layout

- Mobile-first fluid layout
- Maximum content width around 90rem
- Compact floating navigation on desktop
- Asymmetric hero: copy left, layered real project imagery right
- Two live selected projects plus clearly disclosed, self-directed concept work;
  every concept must remain visibly labeled as an industry demonstration and
  never be presented as a client project
- Three equal service columns
- Four-step process rail
- Concise split About section
- High-contrast contact close

## Components

- Brand wordmark: `BUILT BY BLANCH`
- Waffle menu that slowly resolves into a close mark
- Blue primary button and outlined secondary button
- Layered project frames with restrained pointer response
- Two-project interactive work rail
- Numbered process list
- Direct email and copy-email controls

## Motion

Motion should guide attention and reinforce the drafting-table idea.

- Coordinated hero entrance
- Pointer-following hero grid on capable devices
- Project images scale gently as they enter the viewport
- One short paragraph uses a scrubbed word reveal
- Hover states move by only a few pixels
- Respect `prefers-reduced-motion`
- Keep the page complete and readable when GSAP is unavailable

## Imagery

Use the supplied Green Wave Landscaping and Upstate Basketball League
screenshots for those live projects. Keep their natural colors so the projects
remain authentic. Self-directed concept work may use its own original assets
when the card, destination, metadata, and interactions all preserve an
unmistakable concept / non-client disclosure.

- Set explicit width and height attributes
- Use `object-fit: cover` only when the crop is intentional
- Keep mobile screenshots available for narrow compositions
- Use actual rendered captures for portfolio concept cards rather than
  flattening exploratory design frames into the destination
- Do not add stock photography, fake office photos, fake team photos, or client
  logos

## Accessibility And Responsive Rules

- Meet WCAG AA text contrast
- Keep body text at least 1rem
- Interactive targets are at least 44 by 44 pixels
- Provide visible keyboard focus
- The mobile menu is dismissible with Escape
- Prevent horizontal overflow
- Preserve semantic heading order and useful alt text
- Disable nonessential motion when reduced motion is requested
