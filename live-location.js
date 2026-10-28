/* SpareFixer live map, integrated fix 2026-10-28. No GPS data is written to storage or analytics.
 * Deploy over HTTPS (localhost works for development).
 * Allow Location in browser/site settings and enable device Location Services.
 * If embedded, the parent iframe needs allow="geolocation" and its server
 * Permissions-Policy must allow this site's origin. JS cannot override a block.
 * Tracking runs while this page is active; browsers may suspend background tabs.
 */
(() => {
  'use strict';
  const CONFIG = Object.freeze({
    // Use a managed/self-hosted Overpass endpoint for sustained production traffic.
    overpassURLs: ['https://overpass.private.coffee/api/interpreter', 'https://overpass-api.de/api/interpreter'],
    radius: 10000, searchInterval: 60000, refreshInterval: 120000, searchDistance: 500
  });
  let map, user, accuracy, shops, watch = null, latest = null, frame = 0;
  let active = false, follow = true, consent = true, generation = 0;
  let controller, searchTimer, staleTimer, retryTimer, resizeObserver, removalObserver;
  let resumeOnShow = false, stoppedByUser = false, fixPending = false, lastFixAttempt = 0;
  let resultBounds = null, fitNextResults = true, searchCenterOverride = null;
  let searchOrigin = null, lastAttempt = 0, searching = false, bindings = false;
  let searchRadius = CONFIG.radius, lastSuccess = 0, requestId = 0, radiusPending = false;
  const $ = id => document.getElementById(id);
  const text = (id, value) => { if ($(id)) $(id).textContent = value; };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function status(message, kind = 'idle') {
    text('gpsStatus', message);
    if (!$('gpsStatus')) return;
    $('gpsStatus').dataset.state = kind;
    $('liveMap')?.classList.toggle('gps-stale', kind !== 'live');
  }
  function setFollow(value) {
    follow = value;
    $('gpsFollow')?.setAttribute('aria-pressed', String(value));
    text('gpsFollow', value ? 'Following you' : 'Follow location');
  }
  function nearbyUI() {
    if (!$('gpsNearbyPanel')) {
      const panel = document.createElement('section'); panel.id = 'gpsNearbyPanel';
      panel.setAttribute('aria-label', 'Nearby vehicle services');
      panel.innerHTML = `<style>
        #gpsNearbyPanel{padding:18px;margin:16px 0;border:1px solid #dbe3ee;border-radius:16px;background:#f8fafc;color:#17243b;font:14px/1.5 system-ui,sans-serif}
        #gpsNearbyPanel h3{margin:0 0 12px;font-size:20px}#gpsNearbyPanel label{display:inline-flex;gap:8px;align-items:center;margin:4px 16px 4px 0}
        #gpsNearbyPanel select,#gpsNearbyPanel button{padding:9px 12px;border:1px solid #cad5e2;border-radius:8px;background:white;color:#17243b}
        #gpsNearbyPanel p{margin:8px 0}#nearbyList{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px;max-height:580px;overflow:auto}
        #nearbyList>li{padding:16px;border:1px solid #dbe3ee;border-radius:12px;background:white;color:#17243b} .gps-shop-detail a{display:inline-block;margin:4px 12px 4px 0} .gps-shop-detail p{margin:5px 0}
        .gps-shop-marker{display:grid!important;place-items:center;border:2px solid white;border-radius:50%;background:#2563eb;color:white;font:bold 14px system-ui;box-shadow:0 2px 8px #0005}
        .gps-shop-marker.gps-showroom{background:#7c3aed}.gps-shop-marker.gps-parts{background:#0f766e}
      </style><h3>Vehicle services near you</h3>`;
      const sidebar = document.querySelector('.gps-sidebar');
      if (sidebar) sidebar.prepend(panel);
      else $('liveMap').closest('.gps-map-wrap')?.insertAdjacentElement('afterend', panel) || $('liveMap').insertAdjacentElement('afterend', panel);
      if (!$('gpsRadius')) {
        const label=document.createElement('label'); label.textContent='Search radius ';
        const select=document.createElement('select'); select.id='gpsRadius';
        for (const km of [5,10]) { const option=document.createElement('option'); option.value=String(km*1000);option.textContent=km+' km';select.append(option); }
        label.append(select);panel.append(label);
      }
      if (!$('gpsNearby')) {
        const label=document.createElement('label'); const checkbox=document.createElement('input');
        checkbox.id='gpsNearby';checkbox.type='checkbox';label.append(checkbox,'Auto-refresh nearby places');panel.append(label);
      }
      if (!$('gpsSearch')) { const button=document.createElement('button');button.id='gpsSearch';button.type='button';button.textContent='Refresh places';panel.append(button); }
      const note=document.createElement('p');note.textContent='M · Mechanics & workshops   S · Showrooms   P · Parts & tyres. Automatic search sends your approximate area to OpenStreetMap’s search service. Distances are straight-line estimates; listings may be incomplete.';panel.append(note);
      for (const [id,tag] of [['nearbyStatus','p'],['nearbyList','ul']]) if (!$(id)) {const element=document.createElement(tag);element.id=id;if(tag==='p')element.setAttribute('aria-live','polite');panel.append(element);}
    }
    $('gpsNearby').checked=consent;
    $('gpsRadius').value=String(searchRadius);
  }
  function searchThisArea() {
    if (!map || map.getZoom()<9) {
      text('mapSearchStatus','Zoom into a town first, or type a town/business above and press Search Google Maps.');
      return;
    }
    searchCenterOverride=map.getCenter();fitNextResults=true;radiusPending=true;
    consent=true;if ($('gpsNearby')) $('gpsNearby').checked=true;
    setFollow(false);
    text('mapSearchStatus',`Searching ${searchRadius/1000} km around the centre of this map…`);
    searchNearby(true);
  }
  function openMapSearch(event) {
    event?.preventDefault();
    const typed=$('mapSearchQuery')?.value.trim();
    const center=searchCenterOverride || latest || (map && map.getZoom()>=9 ? map.getCenter() : null);
    const query=typed || (center ? `mechanic workshops near ${center.lat.toFixed(3)},${(center.lng).toFixed(3)}` : 'mechanic workshops near me');
    // The visitor explicitly submits this search. No background Google requests.
    const link=safeLink(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, 'Open Google Maps search');
    if (link) link.click();
    text('mapSearchStatus','Opening Google Maps in a new tab. Google results appear there, not as pins on this map.');
  }
  function init() {
    if (!$('liveMap')) return false;
    if (!bindings) {
      nearbyUI();
      bindings = true;
      $('gpsEnable')?.addEventListener('click', () => { stoppedByUser = false; start(); });
      $('gpsStop')?.addEventListener('click', () => { stoppedByUser = true; resumeOnShow = false; stop(); });
      $('gpsFollow')?.addEventListener('click', () => { setFollow(!follow); if (follow) recenter(); });
      $('gpsRecenter')?.addEventListener('click', recenter);
      $('gpsNearby')?.addEventListener('change', e => {
        consent = e.target.checked;
        if (consent && latest && active) searchNearby(true);
        else { cancelSearch(); clearShops(); text('nearbyStatus', 'Nearby search is off.'); }
        controls();
      });
      $('gpsRadius')?.addEventListener('change', e => {
        const value=Number(e.target.value);if (![5000,10000].includes(value)) return;
        searchRadius=value;radiusPending=true;fitNextResults=true;cancelSearch();clearShops();
        text('nearbyStatus', `Radius changed to ${searchRadius/1000} km. Waiting for the next available search…`);
        if ((searchCenterOverride || (active && latest)) && consent) searchNearby(true);
      });
      $('gpsSearch')?.addEventListener('click', () => searchNearby(true));
      $('gpsShowAll')?.addEventListener('click', showAll);
      $('mapSearchForm')?.addEventListener('submit', openMapSearch);
      $('gpsSearchArea')?.addEventListener('click', searchThisArea);
      for (const [id, term] of [['gpsMoreMechanics','mechanic workshops'],['gpsMoreShowrooms','car motorcycle showrooms']]) {
        $(id)?.addEventListener('click', () => {
          if (!latest) return;
          // Navigation only on an explicit click, not an automatic location upload.
          const query=`${term} near ${latest.lat.toFixed(3)},${latest.lng.toFixed(3)}`;
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
        });
      }
      window.addEventListener('pagehide', () => { resumeOnShow = active; stop(); });
      window.addEventListener('pageshow', () => {
        if (resumeOnShow && !stoppedByUser) { resumeOnShow = false; start(); }
      });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && active) { map?.invalidateSize(); beginWatch(generation); }
      });
      window.addEventListener('offline', () => text('tileStatus', 'Offline: GPS may still work; map tiles and nearby search need internet.'));
      window.addEventListener('online', () => {text('tileStatus', 'Connection restored.');if(active && consent) searchNearby(false);});
    }
    if (map) { map.invalidateSize(); return true; }
    if (!window.L) {
      status('Map library could not load. Check your connection, then retry.', 'error');
      text('gpsEnable', 'Retry map and location');
      return false;
    }
    map = L.map('liveMap', { zoomControl: true, worldCopyJump: true });
    // World view only: never an assumed user location.
    map.fitWorld();
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).on('tileerror', () => text('tileStatus', 'Some map tiles could not load. Check your internet connection.'))
      .on('load', () => text('tileStatus', '')).addTo(map);
    shops = L.layerGroup().addTo(map);
    map.on('dragstart', () => setFollow(false));
    // Only user-originated zooms disable follow; internal fit/pan do not.
    map.on('zoomstart', e => { if (e.originalEvent) setFollow(false); });
    $('liveMap').addEventListener('wheel', () => setFollow(false), { passive: true });
    $('liveMap').addEventListener('keydown', e => { if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) setFollow(false); });
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }));
      resizeObserver.observe($('liveMap'));
    }
    removalObserver = new MutationObserver(() => { if (!$('liveMap')?.isConnected) destroy(); });
    removalObserver.observe(document.body, { childList: true, subtree: true });
    return true;
  }
  function controls() {
    if ($('gpsEnable')) $('gpsEnable').disabled = active;
    if ($('gpsStop')) $('gpsStop').disabled = !active;
    if ($('gpsRecenter')) $('gpsRecenter').disabled = !latest;
    if ($('gpsFollow')) $('gpsFollow').disabled = !latest;
    if ($('gpsShowAll')) $('gpsShowAll').disabled = !resultBounds;
    for (const id of ['gpsMoreMechanics','gpsMoreShowrooms']) if ($(id)) $(id).disabled = !latest;
    const remaining = CONFIG.searchInterval - (Date.now() - lastAttempt);
    if ($('gpsSearch')) $('gpsSearch').disabled = ((!active || !latest) && !searchCenterOverride) || !consent || searching || remaining > 0;
    if ($('gpsSearchArea')) $('gpsSearchArea').disabled=searching;
    clearTimeout(searchTimer); searchTimer = null;
    if (active && consent) searchTimer = setTimeout(() => { searchTimer = null; searchNearby(false); controls(); }, Math.max(10000, remaining + 20));
  }
  function start() {
    if (active || stoppedByUser || !$('liveMap') || $('liveMap').closest('[hidden]')) return;
    if (!init()) { // Retry a failed CDN download without a page refresh.
      if ($('leafletRetry')) return;
      const script = document.createElement('script'); script.id = 'leafletRetry';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { script.remove(); start(); };
      script.onerror = () => { script.remove(); status('Map download failed. Check your connection and retry.', 'error'); };
      document.head.append(script); return;
    }
    if (!window.isSecureContext) { status('Location requires HTTPS (or localhost for development). Open the secure site and retry.', 'error'); return; }
    if (!navigator.geolocation) { status('This browser does not support location. Use a current Safari, Chrome or Firefox browser.', 'error'); return; }
    const policy = document.permissionsPolicy || document.featurePolicy;
    if (policy?.allowsFeature && !policy.allowsFeature('geolocation')) {
      status('Location is blocked by this page or embedded preview. Open the HTTPS site directly in your browser. The host must allow geolocation in its Permissions-Policy and iframe settings.', 'error');
      return;
    }
    active = true;fitNextResults=true; const token = ++generation; setFollow(true);
    status('Waiting for location permission and a GPS fix…', 'waiting'); controls();
    staleTimer = setInterval(() => {
      if (!document.hidden && active && (!latest || Date.now()-latest.timestamp > 20000)) refreshFix();
      if (latest && Date.now() - latest.timestamp > 30000) {
        status('Signal is stale — showing the last known position. Check location services or retry.', 'waiting');
      }
    }, 5000);
    beginWatch(token);
  }
  function beginWatch(token) {
    clearTimeout(retryTimer);
    if (!active || generation !== token) return;
    if (watch !== null) navigator.geolocation.clearWatch(watch);
    watch = null;
    try {
      watch = navigator.geolocation.watchPosition(p => {
        if (active && generation === token) { clearTimeout(retryTimer); position(p); }
      }, e => {
        if (!active || generation !== token) return;
        if (e.code === 1) {
          stop('Location access blocked. Allow Location in this site’s browser settings, enable device Location Services, then press Enable Live Location / Retry. If this is an embedded preview, open the HTTPS site directly.', 'error');
          return;
        }
        status((e.code === 3 ? 'GPS timed out.' : 'GPS signal unavailable.') +
          (latest ? ' Showing the last known position.' : '') + ' Retrying automatically…', 'waiting');
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => beginWatch(token), 5000);
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    } catch (_) { stop('Location could not start. Check site permissions and retry.', 'error'); }
  }
  function refreshFix() {
    if (!active || fixPending || Date.now()-lastFixAttempt<20000) return;
    fixPending=true;lastFixAttempt=Date.now();const token=generation;
    try {
      navigator.geolocation.getCurrentPosition(p => {
        if (!active || token!==generation) return;
        fixPending=false;position(p);
      }, e => {
        if (!active || token!==generation) return;
        fixPending=false;
        if (e.code===1) stop('Location access blocked. Allow Location in browser settings, then retry.', 'error');
        else status('Waiting for a fresh location. Previous map results may be out of date.', 'waiting');
      }, {enableHighAccuracy:true,maximumAge:0,timeout:15000});
    } catch (_) {fixPending=false;}
  }
  function showAll() {
    if (!map || !resultBounds) return;
    setFollow(false);
    map.fitBounds(resultBounds,{padding:[35,35],maxZoom:15,animate:!reduced()});
  }
  function position(p) {
    const { latitude: lat, longitude: lng, accuracy: radius } = p.coords;
    if (![lat,lng,radius,p.timestamp].every(Number.isFinite) || Math.abs(lat)>90 || Math.abs(lng)>180 || radius<0) return;
    if (latest && p.timestamp < latest.timestamp) return;
    const first = !latest; latest = { lat, lng, accuracy: radius, timestamp: p.timestamp };
    text('gpsCoords', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    text('gpsAccuracy', `±${Math.round(radius).toLocaleString()} m`);
    const date = new Date(p.timestamp);
    text('gpsUpdated', date.toLocaleString()); if ($('gpsUpdated')) $('gpsUpdated').dateTime = date.toISOString();
    status(Date.now()-p.timestamp > 30000 ? 'Last position is stale — waiting for a fresh fix.' : radius > 100 ? 'Live · approximate position (weak accuracy)' : 'Live · receiving location', Date.now()-p.timestamp > 30000 ? 'waiting' : 'live');
    const target = L.latLng(lat,lng);
    if (!user) {
      user = L.marker(target, { icon: L.divIcon({ className: 'gps-user', html: '<span class="gps-dot"></span>', iconSize: [24,24], iconAnchor:[12,12] }), title:'Your browser-reported location', zIndexOffset:1000 }).addTo(map);
      accuracy = L.circle(target, { radius, color:'#2879ee', weight:1, fillColor:'#2879ee', fillOpacity:0.12, interactive:false }).addTo(map);
    }
    accuracy.setRadius(radius);
    cancelAnimationFrame(frame);
    const from = user.getLatLng(), began = performance.now();
    const animate = now => {
      const t = reduced() || first ? 1 : Math.min(1,(now-began)/450);
      const point = L.latLng(from.lat+(lat-from.lat)*t, from.lng+(lng-from.lng)*t);
      user.setLatLng(point); accuracy.setLatLng(point);
      if (t<1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    if (first) map.fitBounds(accuracy.getBounds(), { maxZoom:16, padding:[40,40], animate:false });
    else if (follow) map.panTo(target, { animate:!reduced(), duration:0.45 });
    controls();
    if (consent && Date.now()-p.timestamp <= 30000) searchNearby(false);
  }
  function recenter() {
    if (!latest || !map) return;
    searchCenterOverride=null;fitNextResults=true;setFollow(true); map.setView([latest.lat,latest.lng], Math.max(map.getZoom(),16), { animate:!reduced() });
  }
  function cancelSearch() {
    ++requestId; controller?.abort(); controller = null; searching = false;
    clearTimeout(searchTimer); searchTimer = null; controls();
  }
  function clearShops() { shops?.clearLayers(); $('nearbyList')?.replaceChildren(); searchOrigin = null;resultBounds=null;text('gpsResultCount','No shop results loaded'); }
  function stop(message = 'Tracking stopped. Your location has been cleared. Enable live location to restart.', kind = 'idle') {
    active = false; searchCenterOverride=null; ++generation;fixPending=false;lastFixAttempt=0;
    if (watch !== null) navigator.geolocation.clearWatch(watch);
    watch = null; clearTimeout(retryTimer); clearInterval(staleTimer); cancelAnimationFrame(frame); cancelSearch();
    if (map && user) map.removeLayer(user);
    if (map && accuracy) map.removeLayer(accuracy);
    user = accuracy = latest = null;
    clearShops(); text('gpsCoords','—'); text('gpsAccuracy','—'); text('gpsUpdated','—'); $('gpsUpdated')?.removeAttribute('datetime');
    text('gpsEnable', 'Enable Live Location / Retry'); status(message,kind);
    text('nearbyStatus', 'Enable location to automatically find nearby vehicle services.'); controls();
    // Release the exact-position viewport as well as the marker.
    map?.fitWorld({ animate:false });
  }
  function safeLink(url, label) {
    try { const u = new URL(url); if (!['https:','http:'].includes(u.protocol)) return null;
      const a = document.createElement('a'); a.href=u.href; a.textContent=label; a.target='_blank'; a.rel='noopener noreferrer'; return a;
    } catch (_) { return null; }
  }
  function detail(shop) {
    const box=document.createElement('div'); box.className='gps-shop-detail';
    const title=document.createElement('strong'); title.textContent=shop.name; box.append(title);
    for (const value of [shop.kind, `${(shop.distance/1000).toFixed(1)} km from the search location (straight-line)`, shop.address || 'Address not listed', shop.tags.opening_hours && `Hours: ${shop.tags.opening_hours}`, (shop.tags.phone || shop.tags['contact:phone']) && `Phone: ${shop.tags.phone || shop.tags['contact:phone']}`].filter(Boolean)) {
      const p=document.createElement('p'); p.textContent=value; box.append(p);
    }
    const web = safeLink(shop.tags.website || shop.tags['contact:website'], 'Website'); if(web) box.append(web);
    const osm=safeLink(`https://www.openstreetmap.org/${shop.type}/${shop.id}`, 'View OpenStreetMap listing'); box.append(osm);
    const directions=safeLink(`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`, 'Directions');if(directions)box.append(directions);
    return box;
  }
  async function searchNearby(manual) {
    if (((!active || !latest) && !searchCenterOverride) || !consent || searching) return;
    const elapsed=Date.now()-lastAttempt;
    if (elapsed<CONFIG.searchInterval) { if(manual) {const message=`Please wait ${Math.ceil((CONFIG.searchInterval-elapsed)/1000)} seconds before searching again.`;text('nearbyStatus',message);text('mapSearchStatus',message);} return; }
    if (!manual && !searchCenterOverride && !radiusPending && searchOrigin && Date.now()-lastSuccess<CONFIG.refreshInterval && L.latLng(latest.lat,latest.lng).distanceTo(searchOrigin)<CONFIG.searchDistance) return;
    if (!searchCenterOverride && Date.now()-latest.timestamp>30000) { text('nearbyStatus','Updating your location before searching…');refreshFix();return; }
    const token=generation, thisRequest=++requestId, radius=searchRadius;
    // Rounded area (roughly 100 m), never the GPS accuracy/timestamp or a movement trail.
    const origin=searchCenterOverride || latest;
    const center=L.latLng(Number(origin.lat.toFixed(3)),Number(origin.lng.toFixed(3)));
    const around=`(around:${radius+100},${center.lat},${center.lng})`;
    const query=`[out:json][timeout:20];(nwr[shop~"^(car_repair|truck_repair|car_parts|motorcycle_repair|motorcycle_parts|tyres|car|motorcycle)$"]${around};nwr[craft~"^(mechanic|car_repair|car_painter)$"]${around};nwr["service:vehicle:repair"=yes]${around};nwr["service:vehicle:car_repair"=yes]${around};nwr["car:repair"=yes]${around};nwr["motorcycle:repair"=yes]${around};);out center tags;`;
    controller=new AbortController(); const localController=controller;
    searching=true; lastAttempt=Date.now(); controls(); text('nearbyStatus',`Finding mechanics, workshops and showrooms within ${radius/1000} km…`);
    try {
      const data=await fetchListings(query,localController.signal);
      if ((!active && !searchCenterOverride) || !consent || generation!==token || thisRequest!==requestId) return;
      const unique=new Map();
      for(const element of data.elements) {
        if (!['node','way','relation'].includes(element.type) || !Number.isSafeInteger(element.id)) continue;
        const lat=element.lat ?? element.center?.lat, lng=element.lon ?? element.center?.lon;
        if (!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180) continue;
        const tags=element.tags || {};
        const kind=['car','motorcycle'].includes(tags.shop)?'Showroom / vehicle dealer':['car_parts','motorcycle_parts','tyres'].includes(tags.shop)?'Parts & tyres':'Mechanic / workshop';
        const distance=center.distanceTo([lat,lng]);if (distance>radius) continue;
        const address=tags['addr:full'] || [tags['addr:housenumber'],tags['addr:street'],tags['addr:suburb'],tags['addr:city'],tags['addr:postcode']].filter(Boolean).join(', ');
        unique.set(`${element.type}/${element.id}`, { ...element, lat,lng,tags,kind,distance,address,name:tags.name || tags.brand || `Unnamed ${kind.toLowerCase()}` });
      }
      const results=[...unique.values()].sort((a,b)=>a.distance-b.distance);
      const fitArea=fitNextResults || radiusPending;
      clearShops(); searchOrigin=center;lastSuccess=Date.now();radiusPending=false;
      fitNextResults=false;
      resultBounds=L.latLngBounds([[center.lat,center.lng],...results.map(shop=>[shop.lat,shop.lng])]);
      if (fitArea && (follow || searchCenterOverride) && results.length) map.fitBounds(resultBounds, {padding:[35,35],maxZoom:15,animate:!reduced()});
      for(const shop of results) {
        const marker=L.marker([shop.lat,shop.lng], {icon:L.divIcon({className:'gps-shop-marker '+(shop.kind.startsWith('Showroom')?'gps-showroom':shop.kind==='Parts & tyres'?'gps-parts':''),html:shop.kind.startsWith('Showroom')?'S':shop.kind==='Parts & tyres'?'P':'M',iconSize:[30,30],iconAnchor:[15,15]}),title:shop.name}).bindPopup(detail(shop)).addTo(shops);
        const card=document.createElement('li'); card.append(detail(shop));
        const button=document.createElement('button'); button.type='button'; button.className='btn btn-secondary btn-sm'; button.textContent='Show on map';
        button.addEventListener('click',()=>{setFollow(false);map.setView([shop.lat,shop.lng],17);marker.openPopup();});card.append(button);$('nearbyList')?.append(card);
      }
      text('gpsResultCount',`${results.length} vehicle services · ${radius/1000} km`);
      text('mapSearchStatus',results.length ? `Loaded ${results.length} shop pins. Tap a coloured pin for details.` : 'No matching OpenStreetMap records in this area. Try Search Google Maps above.');
      text('nearbyStatus', results.length ? `${results.length} mapped places within ${radius/1000} km · updated ${new Date().toLocaleTimeString()}. Refreshes automatically. Opening hours and availability are not verified.` : `The search succeeded, but OpenStreetMap has no matching listings in this ${radius/1000} km area. ${radius===5000?'Try 10 km, or use':'Use'} the Google Maps search buttons below to check another directory.`);
    } catch (error) {
      if ((active || searchCenterOverride) && consent && token===generation && thisRequest===requestId) {
        text('nearbyStatus',`Shop search could not load: ${error.message}. This is a search-service failure, not evidence that there are no shops. Automatic retry will follow; previous results, if any, remain. You can also use the Google Maps search buttons below.`);
        text('mapSearchStatus',`The shop servers could not load results (${error.message}). Press Search Google Maps above to search another directory.`);
        if (!searchOrigin) text('gpsResultCount','Shop search unavailable — use Search Google Maps above');
      }
    } finally {
      if(controller===localController) {controller=null;searching=false;controls();}
    }
  }
  async function fetchListings(query, signal) {
    const failures=[];
    for (const endpoint of CONFIG.overpassURLs) {
      if (signal.aborted) throw new Error('Search cancelled');
      const attempt=new AbortController();
      const cancel=()=>attempt.abort();signal.addEventListener('abort',cancel,{once:true});
      const timer=setTimeout(cancel,22000);
      try {
        const response=await fetch(`${endpoint}?${new URLSearchParams({data:query})}`,{method:'GET',signal:attempt.signal,credentials:'omit',referrerPolicy:'no-referrer'});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data=await response.json();
        if (!Array.isArray(data.elements) || data.remark) throw new Error('incomplete search response');
        return data;
      } catch (error) {
        if (signal.aborted) throw new Error('Search cancelled');
        failures.push(attempt.signal.aborted?'server timeout':error instanceof TypeError?'network or browser policy blocked the request':error.message);
        text('nearbyStatus', failures.length===1?'The first shop server is unavailable. Trying the backup…':'Both shop search servers are unavailable.');
      } finally {clearTimeout(timer);signal.removeEventListener('abort',cancel);}
    }
    throw new Error(failures.join('; '));
  }
  function destroy() {
    stop(); resizeObserver?.disconnect(); removalObserver?.disconnect(); map?.remove(); map=null;
  }
  window.SparefixerLiveMap={
    enter:()=>{init();controls();if (!stoppedByUser) start();},
    leave:()=>{resumeOnShow = false;if(bindings)stop();},
    destroy,
    start:()=>{stoppedByUser = false;start();},
    stop:()=>{stoppedByUser = true;resumeOnShow = false;stop();}
  };
  // Also support ordinary pages that do not call the enter() integration hook.
  const boot = () => { if ($('liveMap') && !$('liveMap').closest('[hidden]')) window.SparefixerLiveMap.enter(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
