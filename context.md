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
├── wm.js                 ← Window Manager (v5) + openBrowser()
├── coffee.js             ← Coffee cup easter egg
├── annacoffeepic.png     ← Upright mug (transparent bg, 285px tall)
├── annacoffeespill.png   ← Fallen cup + spill photo
├── annacoffeeempty.png   ← Empty mug (post-cleanup state)
├── ohfuck.png            ← Reaction image shown during spill
├── postit.png            ← Sticky note photo — lockscreen bezel
├── annapostit.png        ← Sticky note photo — desktop bezel
├── rakkojae.webp         ← Venue photo (in mail reading pane)
├── glitrsoep-preview.jpg ← Browser bookmark preview (Anna's Substack)
├── joochung-preview.jpg  ← Browser bookmark preview (Joo's Substack)
├── theweekend.html       ← The Weekend itinerary (Calendar icon)
├── todo.html             ← To-Do List (checklist app)
├── travel.html           ← Seoul travel guide
├── staying.html          ← Staying Around? guide
├── contacts.html         ← Win95 Address Book
├── mail.html             ← Win95 email client (8 messages, timed reveals)
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

## 4. Window Manager (wm.js v5)

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
Options: `width`, `height`, `icon`, `noMinMax` (X only), `onClose` (callback, receives id), `center`.

**`openBrowser(id, prog, area, top, left)`** — custom two-page browser in wm.js. Page 1: bookmarks list. Page 2: preview screenshot (clicking opens real URL in new tab). Bookmarks: `glitrsoep.substack.com` and `joochung.substack.com`.

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
| 6m 30s | Planner | attire clarification | `mail_deleted_planner` |

Toasts stack vertically (`#toast-stack`). Clicking a toast: if mail window open, calls `_mailSelectMsg` directly; otherwise sets `window._pendingMailMsg` and opens mail.

**Start menu:** Calendar, Mail, To-Do List, Photos, Travel, Staying Around?, Contacts, Get to the Altar, Web Browser, Shut Down.

**Z-index layers:** WM windows ~60–100 → Start menu 200 → coffee cup 1001 → speech bubble 9999 → hacked overlay 9000 / hacked windows 9001+ → BSOD 999999 → sticky note 1000001.

---

## 6. Mail (mail.html)

Two-pane Win95 email client. All state is **sessionStorage** (resets on page reload).

**Messages (inbox order, newest first):**
1. Planner — "attire clarification" (arrives 6m 30s)
2. Emma — "RE: wedding website feedback" (arrives 6m)
3. Den — "can everyone stop saying 'that's him'" (arrives 5m 30s)
4. Sam — "question about dress code" (arrives 5m)
5. Marcus — "quick question about the wedding" (arrives 4m 2s)
6. Mike — "who invited greg" (arrives 4m)
7. Prince Adebayo Chukwudi Olusegun of Nigeria — "!!! URGENT & CONFIDENCHAL ROYAL PROPOSLE (NOT A SCAM) !!!" (arrives 31s). Deletable. Body link triggers hacked chain.
8. Anna & Joo — "You're invited." — invite letter with venue photo. Not deletable ("Now that's just rude.").

**sessionStorage keys pattern:** `mail_read_<id>`, `mail_deleted_<id>` — one pair per message.

**Toolbar buttons:**
- Reply/Forward on invite → `WM.openInline` error box, cascading.
- Delete on prince/others → sets `mail_deleted_<id>`, hides row, suppresses future toast.

**Reveal pattern (all timed emails):** desktop.html `setTimeout` sets `window._<sender>EmailArrived = true`, shows the row directly via `getElementById`, calls `window._mailReveal<Sender>()` if mail is open, fires toast.

---

## 6b. Coffee Easter Egg (coffee.js)

Clickable mug in bottom-right corner. Three states: `full` → `spilled` → `empty`.

- **Click mug:** cup falls (`annacoffeespill.png`), `ohfuck.png` pops up (3.2s animation), spill zone becomes clickable.
- **Click spill/pool:** mug reappears as empty (`annacoffeeempty.png`).
- **`ohfuck.png`:** 420px max-height, slides in from right, holds, fades out.

---

## 7. Sticky Note (monitor.css)

Photo of a handwritten sticky note stuck to the **bottom-left** of the monitor bezel. Two different images: `postit.png` (lockscreen) and `annapostit.png` (desktop).

- `position: absolute; bottom: -4px; left: 20px; width: 187px; transform: rotate(-2deg);`
- z-index: 1000001 (above everything including BSOD)
- Lockscreen uses `postit.png` (blank/generic); desktop uses `annapostit.png` (with password written on it)

---

## 8. Hacked Window Chain + BSOD

Triggered by clicking "this link" in the Nigerian prince email.

**Flow:**
1. `window.openHackedError()` resets `_hackedCount = 0`, clears any existing `.hacked-win` elements and `#hacked-overlay`, calls `spawnHackedWindow()`.
2. Each call creates/reuses a single `#hacked-overlay` (z-index 9000) + a new `.hacked-win` window (z-index 9001+count, cascaded by `HACKED_STEP=22px`). X button gets `pointer-events:none` after click (disabled in place, not removed) so only the topmost window is clickable.
3. After 3 clicks: all `.hacked-win` removed, overlay removed, BSOD triggered.
4. **BSOD:** appended to `.mon-screen-recess`, z-index 999999. Multi-page interactive flow:
   - Page 1: ":( A problem has been detected. / Did you try sending money to a Nigerian prince?" → yes/no
   - Page 2: "Do you feel good about that choice?" → yes/no
   - Page 3: "Wedding details" (removes BSOD) or "Fucking around" (loops to page 1)

---

## 9. Page Status

| Page | Status | Notes |
|------|--------|-------|
| lockscreen.html | ✅ Complete | Any password unlocks |
| desktop.html | ✅ Complete | Icons, Start, taskbar, 8 timed toasts, hacked chain, BSOD |
| mail.html | ✅ Complete | 8 messages, sessionStorage state, timed reveals |
| todo.html | ✅ Complete | Checklist app |
| travel.html | ✅ Complete | Travel guide + Korean phrase table with Web Speech API |
| staying.html | ✅ Complete | Activities, neighborhoods, excursions |
| contacts.html | ✅ Complete | 11 contacts, list + detail panel |
| photos.html | ✅ Complete | 12-photo grid + lightbox |
| theweekend.html | ✅ Complete | 3-day timeline: Fri Sep 4, Sat Sep 5, Sun Sep 6 |
| game.html | ✅ Complete | QWOP: Get to the Altar |

---

## 10. Wedding Content

| Field | Value |
|-------|-------|
| Couple | Anna & Joo |
| Date | Saturday, September 5, 2026 |
| Venue | Rakkojae Seoul Main Hall (락고재 서울 본관), Bukchon Hanok Village, Seoul |
| Ceremony & Reception | 4:00 PM – 7:00 PM |
| About | Korean-American fusion ceremony, Hanok courtyard, lunchbox feast by Soul Dining (Michelin), Pyebaek |
| Attire | Formal, cocktail, or Hanbok. Colors and patterns welcome. Open cobblestone — block heel or flat recommended. |

---

## 11. Design System

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

## 12. Key Globals (desktop.html runtime)

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

## 13. How to Continue

- **Add a program:** add to `PROGS` in wm.js + desktop grid + Start menu + create sub-page following travel.html pattern
- **Add a timed email:** add row in mail.html + `setTimeout` block in desktop.html + `_mailReveal<Sender>()` handler in mail.html
- **Add photos:** add to `PHOTOS` array in photos.html, drop file in `photos/`
- **Add a contact:** add to `CONTACTS` array in contacts.html
