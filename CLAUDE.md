# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TurfCutter is a single-file web app (`index.html`) for campaign organizers in Medford, OR. It reads a supporter address list from an Excel file, clusters addresses into geographic turfs using k-means, and displays them on an interactive Leaflet map with per-turf checklist tables.

No build step, no dependencies to install — open `index.html` directly in a browser.

## Libraries (loaded via CDN)

- **Leaflet 1.9.4** — interactive map with OpenStreetMap tiles
- **SheetJS (xlsx 0.18.5)** — Excel/CSV parsing
- **Nominatim** (OpenStreetMap geocoding API) — free, no API key required; rate-limited to 1 req/sec per ToS

## Key architecture decisions

**Single HTML file** — all JS and CSS are inline. Keep it that way unless the user asks for a multi-file structure.

**Geocoding cache** — results are stored in `localStorage` under `turfcutter_v1` so re-running with the same file doesn't re-geocode. Cache key is the raw street address string from the Excel.

**Column detection** — `findCol()` does case-insensitive fuzzy matching against candidate column name lists. Expected Excel columns: Address (required), Name / First Name + Last Name (optional), Zip (optional). City defaults to Medford.

**K-means++ clustering** — geographic clustering runs on `(lat, lon)` with Euclidean distance (fine for a city-scale area). Supports up to 20 turfs; `actualK = Math.min(k, geocoded.length)` guards against more turfs than points.

**Turf colors** — 10-color palette in `COLORS[]`. Turf index mod 10 picks the color; same color is used for map markers and card headers.

**Checkbox strike-through** — `toggleStrike()` strikes through the whole row when a canvasser marks a door done. State is in-memory only (not persisted).

## Common tasks

- **Test with a real file**: open `index.html` in Chrome/Firefox, load an `.xlsx`, set turf count, click Cut Turfs.
- **Add a column**: update the candidate list in `findCol()` calls inside `extractRecords()`.
- **Change map style**: swap the tile URL in the `L.tileLayer(...)` call.
- **Add more turf colors**: extend the `COLORS` array.
- **Persist checkbox state**: wire `toggleStrike` to save checked address IDs to `localStorage`.
