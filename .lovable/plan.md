## Problem

The floating center button uses `left-1/2 -translate-x-1/2`, so it is mathematically centered. It only *looks* shifted for the **Designer** role because that nav has an uneven split:

- Designer side items: Home, Clients, Showcase, Messages, More = **5** → split 3 left / 2 right (visually pushes the FAB right).
- Client side items: 4 → 2 / 2 (balanced).
- Worker side items: 4 → 2 / 2 (balanced).

So the FAB is fine; the **side items are unbalanced** for designers. Fix: enforce a symmetric 2 + [center] + 2 layout for every role, and tighten the layout math so the curved notch, spacer, and FAB always align.

## Changes (single file: `src/components/BottomNav.tsx`)

1. **Rebalance designer nav to 4 side items + 1 center** (matches client/worker):
   - Home, Clients, **[Add — center]**, Messages, More
   - Drop "Showcase" from designer's bottom bar (still reachable from More / Home). This keeps the bar symmetric.
   - *Alternative if you'd rather keep Showcase visible:* swap "More" out instead and move More into the Home header.

2. **Force symmetric split** regardless of role:
   - Replace the `Math.ceil` split with an assertion that `sideItems.length === 4`, then `leftItems = sideItems.slice(0,2)`, `rightItems = sideItems.slice(2)`. This guarantees 2/2.

3. **Lock the FAB to the geometric center of the bar**:
   - Keep `absolute left-1/2 -translate-x-1/2` on the FAB.
   - Keep the spacer width (`w-[84px]`) equal to the notch diameter used by the `.nav-curved` mask so the FAB sits exactly over the notch.
   - Use `justify-around` on both left/right groups so spacing mirrors around the center.

4. **No changes to** `index.css` (`.nav-curved` mask already centers at `50% 0`), routing, or the three role contexts. The fix automatically reflects for Designer, Client, and Worker because they all flow through the same `BottomNav` component.

## Question before I build

Designer currently has 5 side tabs. To make the bar symmetric I need to drop one. Which do you prefer?

- **A.** Remove "Showcase" from designer bottom nav (reachable from More / Home shortcut).
- **B.** Remove "More" from designer bottom nav (move its links into the Home header / Profile).
- **C.** Remove "Clients" from designer bottom nav (reachable from Home).

If you don't pick, I'll go with **A** (drop Showcase) since it was the most recent addition and is still surfaced elsewhere.
