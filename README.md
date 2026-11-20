# 🎂 Prajna's Birthday Dashboard

A single-page, no-dependency, fully offline birthday experience. Runs on localhost.

## Run it

```bash
cd ~/Desktop/dashboard
./start.command          # or:  python3 -m http.server 8000
```

Then open **http://localhost:8000** — or just double-click `start.command` in Finder.

## What's inside

| | |
|---|---|
| 🎁 **Sealed gift intro** | The page starts locked. Opening the gift fires the confetti cannon. |
| 📊 **Live telemetry** | Seconds-alive counter ticking in real time, heartbeats, sunrises, days to next birthday. |
| 🍰 **Click the cake** | Opens a card with a drawn cake — the birthday message piped onto it in icing — plus a cut slice on a plate. Edit the wording in `config.js` → `cakeCard`. |
| 🕯️ **Blow-out-able candles** | Click them — or hit **Enable mic blowing** and actually blow into the mic. The flames shrink and lean as the meter climbs; **hit 100% and every candle goes out at once**. The mic then releases itself. |
| ✨ **Reason generator** | Endless shuffled reasons why Prajna is great. |
| 📸 **Memory vault** | Click a frame to pick a photo, drag & drop onto one, or **Upload photos** to fill several at once. Images are downscaled before saving so they fit in browser storage. Hover a filled frame for the ✕ to remove it. |
| 🧭 **Timeline** | The official Prajna history. |
| 💌 **Wish wall** | Anyone on the machine can post a wish; it persists. |
| 👑 **Secret** | Type `prajna` anywhere on the page. |

## Make it yours

Everything personal lives in **`config.js`** — name, real birth date, taglines, reasons,
timeline entries, memory captions, seed wishes, and the cake card wording. Edit, save, refresh. No build step.

```js
birth: { year: 2001, month: 12, day: 18 },  // ← set the real date so the counters are true
```

## Files

```
index.html   structure
styles.css   the look
config.js    ← all your personal content
app.js       confetti engine, synth, counters, mic, storage
start.command double-click launcher
```
