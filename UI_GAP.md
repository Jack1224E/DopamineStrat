# UI Gap Analysis (Lower Section Only): DopamineStrat vs Habitica

This compares only the **lower task area** (Habits / Dailies / To Do’s / Rewards). Ignoring the top stats bars.

---

## 1) Missing Global Controls (Top of the task board)

### What Habitica has
- **Search bar** (find tasks instantly)
- **Tags filter dropdown**
- A clear **Add Task** button (global, not per-column)

### What your UI lacks
- No search
- No tag filtering/sorting
- “Add” exists inside each column, but there’s no *global control center*

### How to improve (and exceed)
- Add a **sticky “Board Toolbar”** above the columns:
  - Search input (search title + notes + tags)
  - Tag filter (multi-select)
  - Sort menu (A→Z, XP, created, due date, impact)
  - “Add Task” button opens a modal with type selector (Habit/Daily/Todo/Reward)
- Add **saved views** (e.g., “Health”, “Study”, “Today only”, “Boss tasks”) to beat Habitica.

---

## 2) Column Tabs / Filters (Per-list segmentation)

### What Habitica has
- Habits: **All / Weak / Strong**
- Dailies: **All / Due / Not Due**
- To Do’s: **Active / Scheduled / Complete**
- Rewards: **All / Custom / Wishlist**

### What your UI lacks
- No per-column filtering, no segmentation, no “Completed” lane
- Your To Do column looks empty + confusing because it lacks state tabs and meaningful empty state.

### How to improve (and exceed)
- Add **tabs in each column header** with counts:
  - Habits: All | Positive | Negative | Both (or All | “Needs work” | “Stable”)
  - Dailies: Due Today | Not Due | Completed Today
  - To Dos: Active | Scheduled | Completed
  - Rewards: Available | Locked | Wishlist
- Add a “Completed” view that collapses old clutter (Habitica does this well).

---

## 3) Visual Hierarchy & “Why Their UI Looks Better”

### What Habitica does well
- Columns have a **soft background** (light gray) which separates sections naturally.
- Spacing is consistent: padding, margins, card height rhythm.
- Headers feel like headers (typography + spacing + subtle dividers)
- Cards have clear hierarchy: icon → title → meta → actions

### What’s holding your UI back
- Heavy black borders everywhere make the board feel like a table/grid, not a modern product.
- Cards and rows don’t share a unified rhythm (padding/height differs).
- Empty states are less informative (especially To Do’s).
- Add buttons are visually “flat” and blend into list content.

### How to improve (and exceed)
- Replace heavy borders with:
  - **soft surfaces**, subtle shadows, and consistent rounded corners
  - lighter dividers only where needed
- Give each column a distinct “panel”:
  - header area, scroll area, footer area
- Make “Add task” a **strong CTA** (full-width button) with icon + label.

---

## 4) Card Design Improvements (Task Cards)

### Habitica’s advantage
- Cards look like interactive objects: padding, subtle shadow, consistent alignment.
- Icons and text have balanced sizing.
- Actions are minimal and predictable.

### Your gaps
- The plus/minus and checkbox feel visually detached from the content.
- Title text alignment and spacing feel cramped.
- The cards don’t show useful metadata (tags, difficulty/impact, due info).

### Improve (and exceed)
- Standardize TaskCard layout:
  - Left: icon/avatar
  - Middle: title + small subtitle (tags, impact, streak, due)
  - Right: action buttons
- Add compact metadata chips:
  - Tag chips, impact badge, due date badge
- Add inline edit (click title to edit) and drag handle (optional).

---

## 5) Rewards Section Legibility (Your known issue)

### What’s wrong now
- Reward description text is not readable unless hovered.
- Disabled state (“Need more”) lacks contrast and clarity.

### Fix (baseline)
- Make reward subtitle text **always visible** with sufficient contrast.
- Always show:
  - cost (gold)
  - “You need X more” text (not just hover)
  - disable button clearly but still readable

### Exceed Habitica
- Add “Reward preview” and “Why locked” microtext.
- Add “Earn path” shortcut: click “Need 80 more” → highlights top tasks that would earn it fastest.

---

## 6) Consistency / Polish

### What Habitica gets right
- Everything feels from one design system: same radius, same shadow, consistent spacing.

### Your improvements
- Standardize:
  - border radius scale (cards, columns, buttons)
  - shadows (one shadow style)
  - typography scale (H2 for column titles, body for cards, muted for meta)
- Add hover/focus states for accessibility (not just hover-only info).

---

## 7) UX Features That Make It Feel “Premium” (and beat Habitica)

- **Keyboard shortcuts**: `/` focus search, `A` add task, `1/2/3` switch columns
- **Command palette** (“Add habit”, “Search tags”, “Toggle theme”)
- **Drag & drop** reorder inside columns
- **Bulk actions**: select multiple tasks, tag them, archive, delete
- **Smart suggestions**: “You keep skipping this daily → reduce difficulty / change schedule”
- **Responsive layout**: columns become swipeable panels on small screens

---

## 8) Suggested UI Libraries / Packs (optional)
Use whichever fits your style, but pick one “base kit” for consistency:
- **Radix / shadcn-style components** (clean, modern, easy to customize)
- **Material UI** (fastest path to polished controls + Android-ish vibe)
- **Mantine** (nice components + theming)
- **Headless UI** (if you want full styling control)

Icons:
- Lucide or Phosphor (choose one primary set)

---

# Outcome Target
After changes, the board should feel like:
- “Habitica’s clarity” + “modern SaaS polish” + “Souls difficulty energy”
without needing retro sprites or gear systems.
