# Field Kit

A phone-first, single-page web app for running a two-day, 14-ride driver interview round in Stockholm.

**Live:** see the Pages URL in the repo's About section.

## Design constraint

Rides are chosen against a strict priority order:

1. **Time in the car** — 15 minutes minimum. Everything bends around this.
2. **Fare** — around 150 kr (300 kr on traditional companies). A bit over is fine.
3. **Distance** — barely matters.

Average traffic speed decides how far you must travel to buy 15 minutes, which is why the three route variants have such different leg lengths:

| Route | Avg speed | Distance for ~15 min | Typical fare |
|---|---|---|---|
| Central | ~16 km/h | 4.5 km | ~133 kr |
| South | ~23 km/h | 6.2 km | ~150 kr |
| North | ~28 km/h | 7.2 km | ~165 kr |

Each variant is a self-contained 14-leg chain — every drop-off is the next pickup — so you can start any of them from wherever you are, and switch mid-day if one area is surging.

## What's in it

- **Route picker** — south / central / north, with per-route progress.
- **Legs + map** — side by side on desktop, list first on mobile. Tick a leg off, copy pickup or drop-off text for the cab apps, open the leg in Google Maps, log the fare. Live GPS tracking with distance to the next pickup.
- **Script** — pre-ride, in-cab and closing, in English and Swedish. In-cab and closing cards can be reordered.
- **Notes** — briefing on timing, the congestion cordon, surge traps, plus the client's do's and don'ts, all with read-tick boxes.
- **Question guide** — what each of the 28 survey questions is actually digging for, and how to get more than the form asks.
- **Leads** — a blank lead is always waiting; filling the last one spawns another. Collapsible, with a one-tap copy for the write-up email.

## Privacy

The repo is public so GitHub Pages can serve it, so **it contains no personal data**. Phone numbers, names and every driver contact you record are entered on your device and live in `localStorage` only. There is no backend and nothing is transmitted.

The two survey form links are the client's "anyone with the link" Microsoft Forms and are included so the form is one tap away.

Use **Setup → Export** before clearing browser data.

## Files

| file | what |
|---|---|
| `routes.js` | fare models, stop coordinates, the three 14-leg chains |
| `content.js` | scripts (EN/SV), briefing notes, do's and don'ts, question guide |
| `app.js` | state, rendering, map, geolocation, leads |
| `styles.css` | light and dark themes, mobile-first |
| `index.html` | shell |

Distances are `haversine × 1.35`; times are distance over the route's average speed; fares come from a linear model calibrated against the *jämförpris* traditional operators must display. All three are early warnings only — the app's own quote is the truth.

## Running locally

```bash
npx serve .
```
