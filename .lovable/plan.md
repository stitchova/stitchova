

# Worker Pages Premium Redesign

## Overview
Elevate all worker-facing pages to match the premium client redesign, with glassmorphism, rich animations, progress visualizations, and a new "Upload Finished Work" feature allowing workers to photograph/upload completed garments.

## Changes

### 1. WorkerDashboard.tsx -- Premium Dashboard Experience
- **Greeting header**: Animated time-of-day greeting with shimmer-text gradient on the worker's name
- **Performance ring**: Add a circular completion rate ring (animated on mount) showing overall task progress percentage
- **Quick stats**: Glassmorphism cards with icon glow backgrounds and spring-animated counters
- **Today's Tasks**: Richer task cards with progress indicator dots, deadline countdown ("2 days left"), and subtle border-left accent color per status (gold for in-progress, green for completed, muted for not started)
- **New section**: "Recent Uploads" horizontal scroll showing thumbnails of recently uploaded finished work

### 2. WorkerTasks.tsx -- Interactive Task Management + Image Upload
- **Filter bar**: Animated segmented control with `layoutId` sliding indicator (matching client orders style)
- **Task cards**: Glassmorphism cards with left accent border, larger status badges with pulse animation on active tasks
- **Expanded task detail**: Richer layout with a production stage mini-tracker (dots: Cutting → Sewing → Finishing → Done)
- **Upload finished work**: When task is "completed" or being marked complete, show an image upload section:
  - Camera/file picker button with animated icon
  - Image preview grid (up to 4 images per task) with remove button overlay
  - Before/after layout option
  - Images stored in component state as data URLs (local file reader)
  - Success toast on upload with confetti-style animation

### 3. WorkerProfile.tsx -- Profile Glow-Up
- **Avatar**: Gradient shimmer ring (gold) around avatar icon, larger size (w-24 h-24)
- **Stats row**: Glassmorphism stat cards with animated count-up effect
- **Specialization chips**: Subtle glow on hover/tap, slightly larger
- **New section**: "My Portfolio" -- grid of uploaded finished work images from tasks
- **Contact card**: Glassmorphism treatment with icon tints per field

### 4. WorkerMeasurements.tsx -- Form Polish
- **Input fields**: Glass-input styling with focus glow animation
- **Category/garment selectors**: 3D card press effect on selection with spring animation
- **Save button**: Gradient background with scale animation on tap

### 5. WorkerMaterials.tsx -- Visual Upgrade
- **Order cards**: Glassmorphism with subtle border glow
- **Material items**: Add quantity badges as colored pills, icon backgrounds with tint matching material type
- **Read-only banner**: Styled as a subtle glassmorphism info bar instead of plain text

### 6. Global Additions (index.css)
- Add `.worker-accent-border` utility for left-accent status borders
- Add `.count-up` keyframe for animated number reveals

## Technical Approach
- Image upload uses `<input type="file" accept="image/*" capture="environment">` for camera access on mobile
- FileReader API converts to data URLs for local preview (no backend needed)
- All animations use framer-motion with existing `[0.16, 1, 0.3, 1]` easing
- Glassmorphism: `backdrop-blur-xl bg-card/60 border-white/5`
- Consistent with dark theme + gold accent system
- Task images stored in component state alongside task data

## Files Modified
- `src/pages/WorkerDashboard.tsx`
- `src/pages/WorkerTasks.tsx`
- `src/pages/WorkerProfile.tsx`
- `src/pages/WorkerMeasurements.tsx`
- `src/pages/WorkerMaterials.tsx`
- `src/index.css`

