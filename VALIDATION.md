# Validation — integrated fix

## Passed

- JavaScript syntax checks for `live-location.js` and the unchanged `script.js`.
- HTML ID uniqueness and local script/stylesheet filename checks.
- Node VM integration harness using IDs from the actual HTML with controlled DOM, Leaflet, geolocation, timers and network responses:
  - No location request while the map route is hidden.
  - Route entry starts tracking and a successful fix triggers a 10 km search.
  - Returned businesses render as markers and list cards; outside-radius records are excluded.
  - 5 km selection changes the request and result filtering.
  - A stale fix triggers a new geolocation request and resumes the pending search.
  - The stationary-location refresh path does not require device movement.
  - Show-all uses result bounds; external directory buttons construct search URLs only when clicked.
  - Route exit clears locations, results, timers and requests; re-entry works; explicit Stop remains respected.
  - A failed primary server falls back to a different endpoint.
  - Dual HTTP failures produce a visible error distinct from a successful empty search.
  - A late request after route exit does not repopulate results.
  - Transient GPS errors retain tracking; permission denial stops it.

The harness used synthetic coordinates/business records exclusively outside the deliverable. Production code does not contain those test records or an assumed user location.

## Not verified end to end

Live HTTP tests from this runtime returned HTTP 406 from overpass-api.de and a timeout from overpass.private.coffee. These results do not establish how the user's browser or network will reach those services. Successful public-provider lookup and actual local business coverage remain unverified.

A headless Chromium download failed (invalid/truncated archive), so visual layout and real browser integration were not verified. Rendering checks use controlled DOM/Leaflet doubles rather than a real browser. Physical GPS, permission prompts, iPhone/Android behavior and hosting CSP must be checked on the deployed HTTPS site.

## Device checklist

1. Visit Home: no location prompt. Open Live map: allow permission and verify position/accuracy.
2. Confirm M/S/P pins match list entries and Show all shop pins includes them.
3. Switch between 5 km and 10 km; during cooldown allow up to one minute for the next request.
4. Stay stationary, then move; check that location timestamps and shop results refresh.
5. Test offline/blocked requests and an empty mapped area: messages should distinguish failure from no records.
6. Stop, leave/reopen the route, and verify tracking respects the controls.
7. Keep existing assets and verify marketplace pages after replacing the files.

## Map-search update checks

- Re-ran the integration harness after changing Overpass requests to GET.
- Verified that Search this area uses the current map centre rather than an assumed GPS position.
- Verified that submitting the text-search form does not trigger an Overpass request and displays the external-navigation status.
- Confirmed the HTML includes the search input and both buttons, with unique IDs, responsive CSS and updated asset cache versions.
- Tested public-landmark connectivity using the Eiffel Tower in Paris: overpass-api.de returned HTTP 406; overpass.private.coffee timed out. No successful live lookup is claimed.
- Automatic approval review blocked a separate test using the user's screenshot location. No retry of that personal-location request was made; the public-landmark test was used instead. Actual local coverage remains unverified.
- No real-browser visual verification or deployment was performed; earlier Chromium-install limitations still apply.
