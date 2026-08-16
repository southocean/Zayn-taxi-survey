# Field Kit

A small phone-first web app for running a two-day, 14-ride driver interview round in Stockholm.

**Live:** see the Pages URL in the repo's About section.

## What's in it

- **Run** — the 14 legs as a chain (each pickup is the previous drop-off), with distance/time/fare estimates, two converging backups per leg, and per-leg capture of fare, driver name, phone and notes.
- **Map** — Leaflet map of the whole chain, live GPS tracking, distance to the next pickup.
- **Script** — pre-ride, in-cab and closing scripts as separate cards. The in-cab and closing blocks can be reordered; the pre-ride block is fixed.
- **Notes** — briefing on rush hours, the congestion-charge cordon, surge traps, and the decision order when a quote comes back out of band.
- **Log** — leads table with a one-tap copy for the write-up email, plus JSON export/import.

## Privacy

The repo is public so GitHub Pages can serve it, so **it contains no client, company or personal information**.

Survey links, the coordinator's phone number and your name are entered once on your phone in **Log → Setup** and live in `localStorage` only. Same for every driver contact you record. Nothing is ever sent anywhere — there is no backend.

Use **Log → Export** before wiping browser data.

## Files

| file | what |
|---|---|
| `data.js` | pickup points, the 14 legs, all script text, briefing notes, fare models |
| `app.js` | state, rendering, map, geolocation, log |
| `styles.css` | dark mobile-first styling |
| `index.html` | shell |

Distances are `haversine × 1.35`; fares come from a rough linear model. Both are there to warn you early — the app's own quote is always the truth.

## Running locally

Any static server, e.g.

```bash
npx serve .
```
