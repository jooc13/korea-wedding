# Anna & Joo Wedding Website — Project Context

---

## 1. What This Is

A static HTML/CSS wedding website for **Anna & Joo**, wedding date **Saturday, September 5, 2026**, at **Rakkojae Seoul Main Hall (락고재 서울 본관)**, Bukchon Hanok Village, Seoul, South Korea.

Styled as a **retro Windows 95 OS running on a physical CRT monitor**. No frameworks, no build tools — pure HTML/CSS/vanilla JS.

**Dev server:** `python3 server.py` (sends `Cache-Control: no-store` — no cache-busting needed)  
**Reset flow in preview:** `sessionStorage.clear(); location.href='index.html'`

---

## 2. File Structure

```
/Users/joo/Wedding Website/
├── index.html            ← Entry point — redirects to lockscreen.html
├── lockscreen.html       ← Password gate (any password works)
├── lockscreen.css
├── desktop.html          ← Win95 desktop (single-page app via wm.js)
├── style.css             ← Win95 UI design system (shared)
├── monitor.css           ← Physical CRT monitor shell + room background
├── server.py             ← Dev server (no-cache headers)
├── wm.js                 ← Window Manager + openBrowser()
├── coffee.js             ← Coffee cup easter egg
├── annacoffeepic.png     ← Upright mug (transparent bg)
├── annacoffeespill.png   ← Fallen cup + spill photo
├── annacoffeeempty.png   ← Empty mug (post-cleanup state)
├── ohfuck.png            ← Reaction image shown during spill
├── postit.png            ← Sticky note — lockscreen bezel
├── annapostit.png        ← Sticky note — desktop bezel
├── rakkojae.webp         ← Venue photo (in mail reading pane)
├── glitrsoep-preview.jpg ← Browser bookmark preview (Anna's Substack)
├── joochung-preview.jpg  ← Browser bookmark preview (Joo's Substack)
├── theweekend.html       ← The Weekend itinerary (Calendar icon)
├── todo.html             ← To-Do List (checklist app)
├── travel.html           ← Seoul travel guide
├── staying.html          ← Staying Around? guide
├── contacts.html         ← Win95 Address Book
├── mail.html             ← Win95 email client (7 messages, timed reveals)
├── photos.html           ← Photo gallery + lightbox
├── game.html             ← QWOP: Get to the Altar
└── context.md            ← this file
```

---

## 3. Navigation Flow

```
index.html → lockscreen.html → (any password) → desktop.html
```

- Sub-pages redirect to `desktop.html?open=<id>` when visited directly. `?open=` consumed via `history.replaceState`.
- **Shut Down** in Start menu clears `sessionStorage` and redirects to `lockscreen.html`.

---

## 4. Window Manager (wm.js)

IIFE exposing `window.WM = { open, close, minimize, restore, toggleMax, openInline }`.

**Program registry (PROGS):**
```
calendar → theweekend.html
todo     → todo.html
travel   → travel.html
contacts → contacts.html
staying  → staying.html
mail     → mail.html
photos   → photos.html
game     → game.html
browser  → (no URL — custom renderer via openBrowser())
```

**Content loading:** Fetches `prog.url?wm=1`, extracts `.window-body` innerHTML + `.status-segment`, injects into window. `<style>` tags injected into `<head>` once. Scripts tagged `data-wm-init` execute after injection.

**`WM.openInline(title, html, opts)`** — creates a standalone window without a URL fetch.  
Options: `width`, `height`, `icon`, `noMinMax` (X only), `onClose` (callback, receives id).

**`openBrowser(id, prog, area, top, left)`** — custom two-page browser. Bookmarks: `glitrsoep.substack.com` and `joochung.substack.com`. Preview screenshots; clicking opens real URL in new tab.

**Touch/iPad support:**
- Window dragging: `touchstart`/`touchmove`/`touchend` in `makeDraggable` mirror the mouse handlers. Single shared `_drag` state.
- Reliable tap dispatch: one delegated `touchend` on `document` calls `.click()` directly for `.wm-btn-min/.max/.cls`, `.wm-lb-close`, `.wm-lb-btn`, `.photo-thumb` — bypasses iOS's unreliable click synthesis.
- Title bar buttons: `color:#000`, `touch-action:manipulation`, 28×24px at ≤1100px viewport.
- Start button: `color:#000` explicit (Safari default was blue).

---

## 5. Desktop (desktop.html)

**Icon grid** — `position:absolute; top:16px; left:16px; grid-template-columns: repeat(2, 84px); gap: 20px 8px; id="icon-grid"`

| Row | Col 1 | Col 2 |
|-----|-------|-------|
| 1 | 📅 Calendar | ✉️ Mail |
| 2 | 📋 To-Do List | 📷 Photos |
| 3 | ✈️ Travel | Guest List FINAL.xls (Excel decoy → password prompt) |
| 4 | 🇰🇷 Staying around? | Guest List FINAL FINAL.xls (Excel decoy → countdown) |
| 5 | 📒 Contacts | 🌐 Web Browser |

**Mail toasts (timed):**
| Delay | Sender | Subject | sessionStorage key |
|-------|--------|---------|-------------------|
| 1s | Anna & Joo | You're invited. | — |
| 31s | Prince Adebayo… | !!! URGENT… ROYAL PROPOSLE… | `mail_deleted_prince` |
| 4m 0s | Mike | who invited greg | `mail_deleted_mike` |
| 4m 2s | Marcus | quick question about the wedding | `mail_deleted_marcus` |
| 5m 0s | Sam | question about dress code | `mail_deleted_sam` |
| 5m 30s | Den | can everyone stop saying "that's him" | `mail_deleted_den` |
| 6m 0s | Emma | RE: wedding website feedback | `mail_deleted_emma` |

Toasts stack vertically (`#toast-stack`). Clicking a toast: if mail window open, calls `_mailSelectMsg` directly; otherwise sets `window._pendingMailMsg` and opens mail.

**Start menu:** Calendar, Mail, To-Do List, Photos, Travel, Staying Around?, Contacts, Get to the Altar, Web Browser, Shut Down.

**Z-index layers:** WM windows ~60–100 → Start menu 200 → coffee cup 1001 → speech bubble 9999 → hacked overlay 9000 / hacked windows 9001+ → BSOD 999999 → sticky note 1000001.

---

## 6. Mail (mail.html)

Two-pane Win95 email client. All state is **sessionStorage** (resets on page reload).

**Messages (inbox order, newest first):**
1. Emma — "RE: wedding website feedback" (arrives 6m)
2. Den — "can everyone stop saying 'that's him'" (arrives 5m 30s)
3. Sam — "question about dress code" (arrives 5m)
4. Marcus — "quick question about the wedding" (arrives 4m 2s)
5. Mike — "who invited greg" (arrives 4m)
6. Prince Adebayo Chukwudi Olusegun — "!!! URGENT & CONFIDENCHAL ROYAL PROPOSLE (NOT A SCAM) !!!" (arrives 31s). Deletable. Body link triggers hacked chain.
7. Anna & Joo — "You're invited." — invite letter with venue photo. Not deletable ("Now that's just rude.").

**sessionStorage keys:** `mail_read_<id>`, `mail_deleted_<id>` — one pair per message.

**Toolbar:** Reply/Forward on invite → `WM.openInline` error box (cascading). Delete on prince/others → hides row, suppresses future toast.

**Reveal pattern:** desktop.html `setTimeout` sets `window._<sender>EmailArrived = true`, shows row via `getElementById`, calls `window._mailReveal<Sender>()` if mail is open, fires toast.

---

## 6b. Coffee Easter Egg (coffee.js)

Clickable mug, bottom-right corner. Three states: `full` → `spilled` → `empty`.

- **Click mug:** cup falls, `ohfuck.png` pops up (3.2s animation), spill becomes clickable.
- **Click spill/pool:** mug reappears as empty.
- **iPad:** scaled to 62% at `max-width: 1100px` (mug + spill state). `pointer: coarse` not used — kept visible on touch devices.

---

## 7. Sticky Note (monitor.css)

Photo of a handwritten sticky note on the **bottom-left** of the monitor bezel. `postit.png` (lockscreen), `annapostit.png` (desktop).

- `position: absolute; bottom: -4px; left: 20px; width: 187px; transform: rotate(-2deg);`
- z-index: 1000001 (above everything including BSOD)

---

## 8. Hacked Window Chain + BSOD

Triggered by clicking "this link" in the Prince email.

1. `window.openHackedError()` resets `_hackedCount = 0`, clears existing elements, calls `spawnHackedWindow()`.
2. Each call creates `#hacked-overlay` (z-index 9000) + `.hacked-win` (z-index 9001+count, cascade 22px). X button gets `pointer-events:none` after click.
3. After 3 clicks: everything removed, BSOD triggered.
4. **BSOD** (z-index 999999): 3-page flow — "Did you try sending money?" → "Do you feel good about that?" → "Wedding details" (exits) or "Fucking around" (loops).

---

## 9. Calendar (theweekend.html)

3-day timeline. Each event row is fully clickable (entire highlighted box, `onclick` on `<tr>`), opens URL in new tab. Italic description on the line below each event name.

| Time | Event | URL |
|------|-------|-----|
| Fri 12–2 PM | MMCA Seoul | mmca.go.kr/eng/ |
| Fri 6–8 PM | Gwangjang Market | youtube.com/… |
| Sat 4–7 PM | Ceremony, Rakkojae Seoul | rkj.co.kr/en-seoul/main/ |
| Sat 8–11 PM | Noraebang @ TBD | theculturetrip.com/… |
| Sun 12–2 PM | Lunch, Korean BBQ @ TBD | *(no link — RSVP note below)* |
| Sun 7–9 PM | Han River Ramen Stroll | youtube.com/… |

---

## 10. Game (game.html)

Inverted-pendulum QWOP game — balance a stick figure down a 35ft aisle.

- Character select: Bride or Groom. Outfit drawn accordingly (dress+veil vs. suit+tie).
- **Waiting partner:** opposite character drawn at the altar (static, facing the player).
- **Altar:** arch with ♥ (30px). On win: shows distance + "Congratulations." + `[ R ] try again`.
- Controls: SPACE or click to apply a balance correction. Mashing penalised.

---

## 11. Page Status

| Page | Notes |
|------|-------|
| lockscreen.html | Any password unlocks |
| desktop.html | Icons, Start, taskbar, 7 timed toasts, hacked chain, BSOD |
| mail.html | 7 messages, sessionStorage state, timed reveals |
| todo.html | Checklist app |
| travel.html | Travel guide + Korean phrase table with Web Speech API |
| staying.html | Activities, neighborhoods, excursions |
| contacts.html | 11 contacts, list + detail panel |
| photos.html | 12-photo grid + lightbox (touch: delegated touchend handler) |
| theweekend.html | Clickable event rows with links + italic descriptions |
| game.html | Balance game, waiting partner at altar, win screen |

---

## 12. Wedding Content

| Field | Value |
|-------|-------|
| Couple | Anna & Joo |
| Date | Saturday, September 5, 2026 |
| Venue | Rakkojae Seoul Main Hall (락고재 서울 본관), Bukchon Hanok Village, Seoul |
| Ceremony & Reception | 4:00 PM – 7:00 PM |
| About | Korean-American fusion ceremony, Hanok courtyard, lunchbox feast by Michelin-starred Soul Dining, Pyebaek |
| Attire | Formal, cocktail, or Hanbok. Colors and patterns welcome. Open cobblestone — block heel or flat recommended. |

---

## 13. Design System

- **Font:** Tahoma / MS Sans Serif / Arial; Kalam (Google Fonts) for sticky note
- **Background:** `#f0eeeb` wall (top 63.5%) + red oak wood table (bottom 36.5%)
- **Monitor:** `.mon-screen-recess` has `isolation: isolate` + `overflow: hidden` to contain BSOD

**Formatting patterns:**
```html
<div class="win-label">Section Name</div>
<div class="win-inset"><!-- content --></div>
<hr class="win-rule" />
```
Classes: `win-heading`, `win-label`, `win-value`, `win-inset`, `win-rule`, `stub-note`

---

## 14. Key Globals (desktop.html runtime)

| Global | Purpose |
|--------|---------|
| `WM` | Window manager API |
| `showMailToast(from, subject, msgId)` | Show a mail toast |
| `window._<sender>EmailArrived` | Set true at reveal time; used by mail to show row |
| `window._mailReveal<Sender>()` | Call to reveal row if mail is open |
| `window._mailSelectMsg(msgId)` | Opens that message in mail pane |
| `window._pendingMailMsg` | Set before `WM.open('mail')` to auto-select on load |
| `window.openHackedError()` | Starts the hacked window chain |
| `window._hackedCount` | Tracks X-clicks in the hacked chain (0→3) |

---

## 15. How to Continue

- **Add a program:** add to `PROGS` in wm.js + desktop grid + Start menu + create sub-page following travel.html pattern
- **Add a timed email:** add row in mail.html + `setTimeout` block in desktop.html + `_mailReveal<Sender>()` handler in mail.html
- **Add photos:** add to `PHOTOS` array in photos.html, drop file in `photos/`
- **Add a contact:** add to `CONTACTS` array in contacts.html
