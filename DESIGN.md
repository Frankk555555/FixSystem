---
name: Campus Fix Hub
description: A unified online repair request system for the university.
colors:
  primary: "oklch(0.38 0.18 295)"
  primary-glow: "oklch(0.62 0.22 295)"
  secondary: "oklch(0.96 0.03 95)"
  accent: "oklch(0.85 0.17 92)"
  background: "oklch(0.99 0.01 95)"
  foreground: "oklch(0.22 0.05 295)"
typography:
  display:
    fontFamily: "IBM Plex Sans Thai, Sarabun, system-ui, sans-serif"
  body:
    fontFamily: "Sarabun, IBM Plex Sans Thai, system-ui, sans-serif"
rounded:
  md: "0.75rem"
spacing:
  sm: "8px"
  md: "16px"
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: Campus Fix Hub

## Overview

**Creative North Star: "The Modern Campus Blueprint"**

The design is structured, clear, and highly reliable. It uses "University Royal Purple" and "Achievement Gold" to project institutional authority without feeling stale. Surfaces are tactile and lifted, ensuring that interactive elements like buttons feel distinctly clickable while cards float gracefully on soft purple shadows. The system avoids visual clutter to streamline the maintenance reporting flow for students and technicians alike.

**Key Characteristics:**
- Institutional but modern
- Tactile surfaces with clear elevation
- Deep purple contrasts with warm cream backgrounds
- Highly legible typography

## Colors

The palette balances authoritative institution tones with warm, approachable surfaces.

### Primary
- **University Royal Purple** (oklch(0.38 0.18 295)): The anchor of the brand. Used for prominent buttons, headers, and active states.
- **Purple Glow** (oklch(0.62 0.22 295)): Used for hover states, focus rings, and soft elevation shadows.

### Secondary
- **Soft Cream** (oklch(0.96 0.03 95)): Used for secondary backgrounds and subtle differentiation.

### Tertiary
- **Achievement Gold** (oklch(0.85 0.17 92)): Used sparingly for badges, warnings, and highlighting success or priority.

### Neutral
- **Warm Canvas** (oklch(0.99 0.01 95)): The primary background color.
- **Deep Ink** (oklch(0.22 0.05 295)): The primary text color, nearly black but retaining a hint of purple.

### Named Rules
**The One Accent Rule.** Achievement Gold is reserved for critical status indicators (like priority tickets) or specific CTAs. It should never be used as a structural background.

## Typography

**Display Font:** IBM Plex Sans Thai (with Sarabun, system-ui fallback)
**Body Font:** Sarabun (with IBM Plex Sans Thai, system-ui fallback)

**Character:** Highly legible and structured, combining a modern geometric sans (IBM Plex) for headings with a readable, slightly formal sans (Sarabun) for long-form reading and ticket descriptions.

### Hierarchy
- **Display** (bold, large): Used for page titles and major dashboard metrics.
- **Title** (semibold, medium): Used for card headers and section titles.
- **Body** (regular, base size): Used for ticket details, chat messages, and general UI text.
- **Label** (medium, small): Used for metadata, dates, and status chips.

## Layout

The layout follows a structured, dashboard-like grid for technicians and admins, while presenting a single-column, highly focused flow for students reporting issues. Spacing relies on standard 4px/8px increments (0.25rem/0.5rem base) to maintain rhythm.

## Elevation & Depth

The system uses a "Tactile and Lifted" approach. Elements are not purely flat; instead, they use soft, ambient shadows tinted with the brand's primary purple to establish hierarchy.

### Shadow Vocabulary
- **Soft Lift** (`0 6px 18px -10px oklch(0.38 0.18 295 / 0.25)`): Applied to default cards and elevated containers.
- **Elegant Floating** (`0 18px 40px -20px oklch(0.38 0.18 295 / 0.35)`): Applied to modals, dropdowns, and highlighted priority tickets.
- **Action Glow** (`0 0 40px oklch(0.62 0.22 295 / 0.35)`): Applied behind primary buttons on hover or critical active states.

### Named Rules
**The Tinted Shadow Rule.** Shadows are never pure black or gray. They must always carry a slight opacity of University Royal Purple (oklch(0.38 0.18 295)) to ensure they blend harmoniously with the warm canvas.

## Shapes

Forms are approachable but structured. The primary corner radius is `0.75rem` (12px), providing a friendly but controlled geometry that suits a modern utility application.

## Components

Components are designed to feel tactile and confident.

### Buttons
- **Shape:** Softly rounded corners (12px radius, `0.75rem`).
- **Primary:** Filled with University Royal Purple.
- **Hover / Focus:** Transitions to a slightly lighter purple or gains the Action Glow shadow.
- **Secondary:** Outline or light cream background with purple text.

### Cards / Containers
- **Corner Style:** 12px radius.
- **Background:** Solid white or warm canvas.
- **Shadow Strategy:** Uses the Soft Lift shadow to float above the background.
- **Border:** Subtle borders (`oklch(0.9 0.02 295)`) are used to define edges when shadows alone are insufficient.

### Inputs / Fields
- **Style:** Light gray/purple tinted background (`oklch(0.94 0.02 295)`) with subtle borders.
- **Focus:** Gains a solid University Royal Purple ring (`oklch(0.55 0.18 295)`).

## Do's and Don'ts

### Do:
- **Do** use tinted purple shadows to create depth and hierarchy.
- **Do** ensure all text has high contrast against the warm canvas background.
- **Do** reserve Achievement Gold for actionable or priority highlights.

### Don't:
- **Don't** use pure black (`#000000`) for text; always use Deep Ink (`oklch(0.22 0.05 295)`).
- **Don't** mix multiple accent colors on a single card; let the ticket status dictate the color coding.
