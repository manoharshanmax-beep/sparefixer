# SpareFixer — map search buttons update

## Install

1. Extract this ZIP.
2. Upload/replace `index.html`, `style.css`, `script.js`, and `live-location.js` together in your existing site folder. Keep the exact filenames (without numbered download suffixes).
3. Keep your existing `assets/` folder. It was not included in the supplied files and is not included in this ZIP.
4. Open your HTTPS site, then choose Live map or visit `/#/live-map`. Allow location in your browser. Reload the page after replacing the files; the HTML includes a cache version on the updated CSS and location script.

For development only, serve the folder with `python3 -m http.server 8000` and open `http://localhost:8000/#/live-map`. A phone accessing an ordinary HTTP LAN address needs HTTPS for geolocation.

## Search buttons above the map

- **Search this area** runs the vehicle-service query around the visible map centre. Pan/zoom to a town first. It does not search the words typed in the text field. It uses the selected 5/10 km radius and can be invoked without a GPS fix after you navigate the map.
- **Search Google Maps** submits the text field as a Google Maps search in a new tab. Enter a town/business, or leave it blank to search mechanics around the selected map area or last GPS position. If neither is available, it searches "mechanic workshops near me". Google decides its own result radius; its results are not imported into the Leaflet map.
- Errors and cooldown messages are visible immediately above the map. Repeated internal searches remain limited to one cycle per minute.
- Overpass now uses GET queries, but a changed request method cannot guarantee access to a failing server. The separate Google search avoids dependence on Overpass; it still requires an internet connection and Google Maps access.

## What changed

- Location starts when the map route is visible, not on the hidden map during home-page loading.
- Mechanics/workshops, vehicle dealers and parts/tyre businesses are queried automatically after location permission, within 10 km by default. The sidebar provides 5 km and 10 km choices.
- A fresh one-shot location request recovers the search when a stationary browser stops sending watch updates. GPS stays browser-controlled; this is not background tracking.
- Two public Overpass endpoints are attempted sequentially. Failures, timeouts and incomplete responses are distinguished from a successful search returning zero businesses.
- Coloured M, S and P pins and the results list show only returned vehicle-service records. A result counter and Show all shop pins button make them easier to locate.
- Hospital, school and other labels are part of the OpenStreetMap background tiles. They are not shop-search results and cannot be selectively removed from these raster tiles.
- Search controls live in the original sidebar rather than an extra panel inside the map wrapper.
- Google Maps search buttons offer an explicit-click fallback. They open a separate directory using approximate coordinates; they do not import Google data or guarantee the selected radius there.
- Existing marketplace code (`script.js`) is unchanged. Demo catalogue/workshop cards elsewhere are not substituted for map results.

## Data and refresh behavior

Search includes car and motorcycle repair, truck repair, mechanic/car-painter workshops, car/motorcycle showrooms, parts and tyres, and tagged vehicle-repair services. Results are drawn only from OpenStreetMap records; coverage can be incomplete or outdated. A small query boundary margin is filtered client-side to the selected radius around the rounded search center. Distances are straight-line estimates, not driving distances. Way/relation coordinates use their mapped centers.

The primary endpoint is `https://overpass.private.coffee/api/interpreter`, with `https://overpass-api.de/api/interpreter` as a backup. Each request has a 22-second client timeout. Search cycles are throttled to at least one minute, and successful results refresh after about two minutes or at least 500 metres of reported movement, when a fresh location is available. A radius change during cooldown waits for the next permitted search. There is no API key in this package.

The automatic-search checkbox stops shop requests and clears results when unchecked. Stop tracking, route exit and page exit clear the location and outstanding work. Explicit Stop is respected until Enable is pressed. Public servers may fail; there is no promise that every nearby business is listed or that service is continuously available. For sustained production use, configure a managed service or your own backend rather than relying on free public endpoints.

## Privacy and hosting

Location permission remains required. Browsers can pause location while locked, suspended or closed. Allow geolocation through your hosting policy, normally `Permissions-Policy: geolocation=(self)`. Embedded pages need explicit parent delegation and iframe `allow="geolocation"`; JavaScript cannot bypass those settings.

SpareFixer does not persist GPS data. With automatic shop search on, rounded coordinates are sent to the configured Overpass providers. Map tiles reveal the viewed area to OpenStreetMap. Clicking an external directory/directions link shares its query with that provider. Provider retention is outside this frontend's control.

Your Content Security Policy/firewall must permit:
- `https://unpkg.com` for Leaflet JS and CSS.
- `https://tile.openstreetmap.org` for map tiles.
- Both Overpass origins above for `connect-src`/fetch.
- Your existing marketplace resources.

Do not replace an existing CSP wholesale without preserving the other resources your site needs.

## Troubleshooting

- **No coloured pins + search failed:** look at the sidebar error. Server/network failures are different from an empty directory. Use Refresh after the cooldown or the external-directory buttons.
- **Search succeeded, zero results:** try 10 km or another directory. Missing OSM records cannot be fabricated by this script.
- **Wrong area:** check the coordinates and GPS accuracy; desktop/indoor locations can be approximate.
- **Only old interface appears:** ensure the files are named exactly as above and the new index.html is deployed, then hard reload.
- **Permission blocked:** allow location in site/browser and device settings; open the HTTPS page directly rather than an embedded preview.

See VALIDATION.md for checks performed and limitations. No deployment was performed.
