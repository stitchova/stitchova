

# Client Pages Premium Redesign

## Overview
Elevate every client-facing page with a modern, high-end visual treatment inspired by luxury fintech and fashion marketplace apps. Focus on richer layouts, micro-interactions, glassmorphism, parallax effects, and polished typography.

## Changes

### 1. ClientHome.tsx -- Hero-Level Home Experience
- **Greeting header**: Add a subtle gradient shimmer on the greeting text, animated time-of-day greeting ("Good morning/evening, Akua")
- **Hero banner**: Add a full-width promotional/seasonal banner with parallax scroll effect (e.g., "Spring Collection is here") using a portfolio image as background with glassmorphism overlay
- **Quick actions**: Redesign from flat cards to glassmorphism cards with animated icon backgrounds that pulse subtly on idle, glow on tap
- **Active orders**: Add designer avatar next to each order, animated progress bar (spring animation on mount), and a circular progress ring instead of flat bar
- **Recommended designers**: Larger cards (min-w-[220px]) with a hover/press 3D tilt effect using framer-motion's `rotateY`, verified badge with glow, and a "Book Now" micro-CTA button
- **New section**: "Trending Styles" horizontal scroll with masonry-style image cards from the style library
- **New section**: "Upcoming Appointments" compact card showing next appointment with countdown timer

### 2. ClientOrders.tsx -- Immersive Order Tracking
- **Tab bar**: Replace plain buttons with an animated segmented control using `layoutId` for the sliding indicator
- **Order cards**: Larger image thumbnails (w-28 h-28 rounded-xl), add designer avatar overlay on the image corner
- **Progress visualization**: Replace flat progress bar with a multi-step stage indicator (dots connected by lines: Cutting → Sewing → Finishing → Ready) showing current stage highlighted
- **Status badges**: Add subtle pulse animation on active statuses
- **Empty state**: Illustrated empty state with a CTA to discover designers

### 3. DiscoverDesigners.tsx -- Marketplace Polish
- **Search bar**: Add animated focus state with border glow (ring-primary/30 on focus)
- **Category pills**: Add icon emoji before each category label, animated underline indicator instead of bg change
- **Designer cards**: Full-width image (single hero image, not split), with a gradient overlay and floating info bar at bottom using glassmorphism. Add "Starting from" price badge as a floating pill
- **Verified badge**: Animated checkmark with a subtle shine/sweep effect
- **New**: "Featured Designer" spotlight card at top with larger layout, gold border glow

### 4. Messages.tsx -- Premium Chat Experience
- **Header**: Add glassmorphism background, online status dot with pulse animation, and a tap-to-view-profile on the avatar (navigate to designer profile)
- **Message bubbles**: Add read receipts (double checkmarks), subtle shadow on bubbles, typing indicator animation (three bouncing dots)
- **Input area**: Add attachment button (image, voice note icons), glassmorphism input bar, send button with scale animation
- **Timestamps**: Group messages by date with elegant divider ("Today", "Yesterday")

### 5. Profile.tsx -- Client Profile Glow-Up
- **Avatar section**: Add gradient ring around avatar (gold shimmer), larger avatar (w-24 h-24), add stats row below name (e.g., "5 Orders | 3 Designers | Member since 2024")
- **Menu items**: Add colored icon backgrounds (each item gets a unique subtle tint), right-side badges for notifications count
- **New section**: "My Designers" -- horizontal scroll of saved/favorite designer avatars
- **Logout button**: Red gradient background on hover/tap instead of just border

### 6. Global Enhancements (index.css)
- Add new utility: `.shimmer-text` for animated gradient text effect
- Add `.glass-input` for glassmorphism input fields
- Add `.progress-ring` CSS for circular progress indicators
- Add `.card-3d` for subtle 3D perspective transforms on tap

## Technical Approach
- All animations use framer-motion with the existing easing curve `[0.16, 1, 0.3, 1]`
- Glassmorphism uses `backdrop-blur-xl` with `bg-card/60` and `border-white/5`
- No new dependencies required
- Consistent with dark theme + gold accent system
- Mobile-first, all layouts tested at 375px width

## Files Modified
- `src/pages/ClientHome.tsx`
- `src/pages/ClientOrders.tsx`
- `src/pages/DiscoverDesigners.tsx`
- `src/pages/Messages.tsx`
- `src/pages/Profile.tsx`
- `src/index.css`

