# GoSnap HTML Demo

Standalone browser demo for **GoSnap V1.0** — no build step required.

## Open locally

```bash
cd html-demo
# Option 1: open file directly
open index.html

# Option 2: local server (recommended for map tiles)
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Included flows

| Screen | Features |
|--------|----------|
| **Login** | Sign in → onboarding |
| **Onboarding** | Location + GoPro connect |
| **Map** | OpenStreetMap, task polylines, layer filter, task sheet (Accept / Start / Record / Complete) |
| **Tasks** | Progress stats, Settlement Map entry, task cards, **⋯ menu → Undo** (pending/reviewing) |
| **Settlement Map** | Progress routes by status, layer filter, bottom settlement panel (Reviewing / Approved / Rejected) |
| **Settings** | Profile + logout |

## Tech

- Vanilla HTML / CSS / JS
- [Leaflet](https://leafletjs.com/) + OpenStreetMap tiles
- Mobile phone frame layout (390×844)

## Relation to RN app

Mirrors the Expo prototype in `../gosnap-app/` with mock data aligned to the same task states and colors.
