# Anna & Joo Wedding Website — Project Context

---

## 1. What This Is

A static HTML/CSS wedding website for **Anna & Joo**, wedding date **Saturday, September 5, 2026**, at **Rakkojae Seoul Main Hall (락고재 서울 본관)**, Bukchon Hanok Village, Seoul, South Korea.

Styled as a **retro Windows 95 OS running on a physical CRT monitor**. No frameworks, no build tools — pure HTML/CSS/vanilla JS.

**Dev server:** `python3 server.py` (sends `Cache-Control: no-store` on every response — no cache-busting needed)  
**Reset flow in preview:** `sessionStorage.clear(); location.href='index.html'`

---

## 2. File Structure

```
/Users/joo/Wedding Website/
├── index.html        ← Entry point — redirects to lockscreen.html
├── lockscreen.html   ← Password gate (any password works); has sticky note
├── lockscreen.css
├── desktop.html      ← Win95 desktop (single-page app via wm.js)
├── style.css         ← Win95 UI design system (shared)
├── monitor.css       ← Physical CRT monitor shell + room background
├── server.py         ← Dev server (no-cache headers; replaces plain http.server)
├── wm.js             ← Window Manager (v3)
├── coffee.js         ← Coffee cup easter egg (clickable mug → spill; no steam)
├── annacoffeepic.png ← Mug photo (transparent background, 285px tall)
├── rakkojae.webp     ← Venue photo (used in mail reading pane)
├── theweekend.html   ← The Weekend itinerary
├── travel.html       ← Seoul travel guide
├── staying.html      ← Staying Around? guide
├── contacts.html     ← Win95 Address Book
├── mail.html         ← Win95 email client (2 messages)
├── photos.html       ← Photo gallery + lightbox
└── context.md        ← this file
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
weekend  → theweekend.html
todo     → theweekend.html
travel   → travel.html
contacts → contacts.html
staying  → staying.html
mail     → mail.html
photos   → photos.html
```

**Content loading:** Fetches `prog.url?wm=1`, extracts `.window-body` innerHTML + `.status-segment`, injects into window. `<style>` tags injected into `<head>` once. Scripts tagged `data-wm-init` execute after injection.

**`WM.openInline(title, html, opts)`** — creates a standalone window without a URL fetch.  
Options: `width`, `height`, `icon`, `noMinMax` (X only), `onClose` (callback, receives id), `center` (no cascade offset).

---

## 5. Desktop (desktop.html)

**Icon grid** — `position:absolute; top:16px; left:16px; grid-template-columns: repeat(2, 84px); gap: 20px 8px`

| Row | Col 1 | Col 2 |
|-----|-------|-------|
| 1 | 🎉 The Weekend | ✉️ Mail |
| 2 | 📋 To-Do List | 📷 Photos |
| 3 | ✈️ Travel | — |
| 4 | 🇰🇷 Staying around? | — |
| 5 | 📒 Contacts | — |

**Mail toasts:** Two fire automatically — "You're invited." at 1s, "!!! URGENT & CONFIDENCHAL ROYAL PROPOSLE (NOT A SCAM) !!!" at 31s. Toasts stack vertically (flex column container `#toast-stack`). Clicking a toast opens mail and directly selects the relevant message via `window._pendingMailMsg` / `window._mailSelectMsg`.

**Start menu:** All programs + Shut Down.

**Z-index layers:** WM windows ~60–100 → Start menu 200 → coffee cup 1001 → speech bubble 9999 → hacked modal overlay 9000 / hacked window 9001 → BSOD 999999 → sticky note 1000001.

---

## 6. Mail (mail.html)

Two-pane Win95 email client. Inbox rows bold when unread, normal weight after opening.

**Messages (newest first):**
1. **Prince Adebayo Chukwudi Olusegun of Nigeria** — "!!! URGENT & CONFIDENCHAL ROYAL PROPOSLE (NOT A SCAM) !!!" — hidden until 31s, revealed by `window._princeEmailArrived` + `window._mailRevealPrince()`.
2. **Anna & Joo** — "You're invited." — invite letter with rakkojae.webp venue photo (between Venue and About the Day sections).

**Toolbar buttons:**
- **Reply / Forward** → `WM.openInline` error box with snarky message, cascading.
- **Delete** → `WM.openInline` error box: "Now that's just rude."

**Nigerian prince email easter egg:** Body contains a hyperlink (`onclick="window.openHackedError()"`) that triggers the hacked window chain (see §8).

---

## 7. Sticky Note (monitor.css + desktop.html / lockscreen.html)

Pink (`#f9c8d0`) sticky note on the top-right of the monitor bezel. Present on **both** lockscreen and desktop.

- Font: Kalam (Google Fonts), regular weight
- Text: `password:` / `p$m&Z#2!wQ*9%_X` (two lines)
- z-index: 1000001 (above BSOD)

---

## 8. Hacked Window Chain + BSOD

Triggered by clicking "this link" in the Nigerian prince email.

**Flow:**
1. `window.openHackedError()` resets `_hackedCount = 0`, calls `spawnHackedWindow()`.
2. Each call creates: a full-desktop blocking overlay (z-index 9000) + a manually-built "⚠️ Error / Your computer is HACKED." window (z-index 9001, centered, X-only). No WM involvement.
3. Clicking X: removes overlay + window, increments `_hackedCount`, spawns next window OR (on 3rd click) triggers BSOD.
4. **BSOD:** appended to `.mon-screen-recess` (which has `isolation: isolate` + `overflow: hidden`), z-index 999999. Multi-page interactive flow:
   - Page 1: ":( A problem has been detected. / Did you try sending money to a Nigerian prince?" → yes/no
   - Page 2: "Do you feel good about that choice?" → yes/no
   - Page 3: "Wedding details" (removes BSOD) or "Fucking around" (loops to page 1)

---

## 9. Page Status

| Page | Status | Notes |
|------|--------|-------|
| lockscreen.html | ✅ Complete | Any password unlocks |
| desktop.html | ✅ Complete | Icons, Start, taskbar, dual toasts, hacked chain, BSOD |
| mail.html | ✅ Complete | 2 messages, read/unread state, toolbar error boxes |
| travel.html | ✅ Complete | Travel guide + Korean phrase table with Web Speech API |
| staying.html | ✅ Complete | Activities, neighborhoods, excursions |
| contacts.html | ✅ Complete | 11 contacts, list + detail panel |
| photos.html | ✅ Complete | 12-photo grid + lightbox |
| theweekend.html | ✅ Complete | 3-day timeline: Fri Sep 4, Sat Sep 5, Sun Sep 6 |

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
- WM windows: `position:absolute` flex columns; `.wm-body` has `flex:1; overflow-y:auto`

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
| `window._princeEmailArrived` | Set true at 31s; reveals prince row in mail |
| `window._mailRevealPrince()` | Call to reveal prince row if mail is open |
| `window._mailSelectMsg(msgId)` | `'invite'` or `'prince'` — opens that message |
| `window._pendingMailMsg` | Set before `WM.open('mail')` to auto-select on load |
| `window.openHackedError()` | Starts the hacked window chain |
| `spawnHackedWindow()` | Internal — spawns one hacked window + overlay |
| `triggerBSOD()` | Internal — renders the BSOD overlay |
| `window._hackedCount` | Tracks X-clicks in the hacked chain (0→3) |

---

## 13. How to Continue

- **Add a program:** add to `PROGS` in wm.js + desktop grid + Start menu + create sub-page following travel.html pattern
- **Add photos:** add to `PHOTOS` array in photos.html, drop file in `photos/`
- **Add a contact:** add to `CONTACTS` array in contacts.html
