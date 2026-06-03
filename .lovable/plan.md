## Goal
Make the floating center button stay perfectly centered above the notch on all supported mobile sizes and safe-area inset combinations, with the exact same behavior for Client, Designer, and Worker.

## Plan
1. **Unify the nav geometry with the app shell**
   - Anchor the BottomNav to the same centered app-width container used by the page content instead of mixing a full-width fixed wrapper with an inner `max-w-md` shell.
   - Remove the layout mismatch that makes the FAB appear offset relative to the visible bar/notch.

2. **Refactor the layout hook into a single source of truth**
   - Keep one reusable hook for all roles.
   - Make it return stable geometry values for:
     - bar width context
     - notch width/radius
     - FAB size
     - FAB vertical offset
     - safe-area-aware bottom padding
     - left/right slot distribution
   - Ensure the split logic always resolves to a strict `2 + center + 2` layout without placeholder behavior affecting visual spacing.

3. **Align the notch mask and FAB from the same measurements**
   - Replace duplicated hardcoded numbers across CSS and component markup with shared values.
   - Make the notch cutout, grid spacer, and FAB position derive from the same dimensions so they cannot drift apart.

4. **Make safe-area handling symmetrical**
   - Apply bottom/left/right inset handling in a way that preserves visual centering instead of shifting the nav’s internal content box.
   - Keep the FAB centered relative to the visible bar, not the viewport edge or padded wrapper.

5. **Verify across all role flows**
   - Check the Designer, Client, and Worker bottom nav variants using the same BottomNav component path.
   - Validate on common mobile widths and inset scenarios so the center button remains centered and the side items stay balanced.

## Technical details
- Update `src/components/BottomNav.tsx` to use one consistent positioning context for the bar and FAB.
- Update `src/hooks/useBottomNavLayout.ts` so it computes geometry once and returns only layout-safe values used by every role.
- Update the curved-bar styling in `src/index.css` so the notch mask uses the same dimensions as the hook/component.
- Validate at multiple mobile viewports (e.g. 320, 375, 390, 414 widths) and confirm the center button stays centered visually and structurally.

## Expected result
- No right drift.
- FAB sits directly above the notch.
- Same centered behavior for Client, Designer, and Worker.
- Safe-area insets do not break centering.