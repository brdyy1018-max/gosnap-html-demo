/* Recording navigation: heading, maneuvers, route arrows, follow camera. */

function normPt(p) {
  if (!p) return null;
  if (Array.isArray(p)) return { lat: Number(p[0]), lng: Number(p[1]) };
  return { lat: Number(p.lat), lng: Number(p.lng) };
}

function normPts(pts) {
  return (pts || []).map(normPt).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

function haversineM(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function bearingDeg(a, b) {
  const y = Math.sin(((b.lng - a.lng) * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.cos(((b.lng - a.lng) * Math.PI) / 180);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function lerpAngle(from, to, t) {
  const d = ((to - from + 540) % 360) - 180;
  return (from + d * t + 360) % 360;
}

function angleDelta(from, to) {
  return ((to - from + 540) % 360) - 180;
}

function routeCumul(pts) {
  pts = normPts(pts);
  const cum = [0];
  for (let i = 1; i < pts.length; i += 1) cum[i] = cum[i - 1] + haversineM(pts[i - 1], pts[i]);
  return cum;
}

function pointAlong(pts, dist) {
  pts = normPts(pts);
  if (!pts.length) return null;
  if (pts.length === 1 || dist <= 0) {
    const next = pts[1] || pts[0];
    return { lat: pts[0].lat, lng: pts[0].lng, bearing: bearingDeg(pts[0], next), index: 0 };
  }
  let acc = 0;
  for (let i = 1; i < pts.length; i += 1) {
    const seg = haversineM(pts[i - 1], pts[i]);
    if (acc + seg >= dist || i === pts.length - 1) {
      const t = seg ? Math.max(0, Math.min(1, (dist - acc) / seg)) : 0;
      return {
        lat: pts[i - 1].lat + (pts[i].lat - pts[i - 1].lat) * t,
        lng: pts[i - 1].lng + (pts[i].lng - pts[i - 1].lng) * t,
        bearing: bearingDeg(pts[i - 1], pts[i]),
        index: i - 1,
      };
    }
    acc += seg;
  }
  return null;
}

function splitRouteLatLngs(pts, dist) {
  pts = normPts(pts);
  if (!pts.length) return { done: [], pending: [] };
  if (dist <= 1) return { done: [], pending: pts.slice() };
  const at = pointAlong(pts, dist);
  if (!at) return { done: [], pending: pts.slice() };
  const here = { lat: at.lat, lng: at.lng };
  return {
    done: pts.slice(0, at.index + 1).concat([here]),
    pending: [here].concat(pts.slice(at.index + 1)),
  };
}

function distanceToRouteM(pos, pts) {
  pos = normPt(pos);
  pts = normPts(pts);
  if (!pos || pts.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const ab = haversineM(a, b) || 1;
    const t = Math.max(0, Math.min(1, ((pos.lng - a.lng) * (b.lng - a.lng) + (pos.lat - a.lat) * (b.lat - a.lat)) / ((b.lng - a.lng) ** 2 + (b.lat - a.lat) ** 2 || 1)));
    const p = { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
    min = Math.min(min, haversineM(pos, p));
    void ab;
  }
  return min;
}

function buildManeuvers(pts) {
  pts = normPts(pts);
  if (pts.length < 2) return [{ type: 'depart', dist: 0 }, { type: 'arrive', dist: 0 }];
  const cum = routeCumul(pts);
  const maneuvers = [{ type: 'depart', dist: 0 }];
  for (let i = 1; i < pts.length - 1; i += 1) {
    const b1 = bearingDeg(pts[i - 1], pts[i]);
    const b2 = bearingDeg(pts[i], pts[i + 1]);
    const delta = angleDelta(b1, b2);
    let type = null;
    if (Math.abs(delta) >= 150) type = 'uturn';
    else if (delta >= 35) type = 'right';
    else if (delta <= -35) type = 'left';
    if (type) maneuvers.push({ type, dist: cum[i] });
  }
  maneuvers.push({ type: 'arrive', dist: cum[cum.length - 1] });
  return maneuvers;
}

function taskManeuvers(task) {
  const pts = normPts(getTaskLatLngs(task));
  const key = `${pts.length}:${pts[0] ? pts[0].lat.toFixed(5) : ''}:${pts[pts.length - 1] ? pts[pts.length - 1].lng.toFixed(5) : ''}`;
  if (task._maneuverKey !== key) {
    task._maneuvers = buildManeuvers(pts);
    task._routeLen = routeCumul(pts).pop() || 0;
    task._maneuverKey = key;
  }
  return task._maneuvers;
}

function resolveManeuverOn(pts, along) {
  pts = normPts(pts);
  const maneuvers = buildManeuvers(pts);
  const total = routeCumul(pts).pop() || 0;
  if (along < 28) return { type: 'depart', remain: Math.max(0, 28 - along), total };
  const next = maneuvers.find((m) => m.type !== 'depart' && m.dist > along + 10);
  if (!next || along >= total - 20) return { type: 'arrive', remain: Math.max(0, total - along), total };
  const remain = Math.max(0, next.dist - along);
  if (next.type !== 'arrive' && remain > 200) return { type: 'straight', remain, total };
  return { type: next.type, remain, total };
}

function resolveManeuver(task, along) {
  return resolveManeuverOn(getTaskLatLngs(task), along);
}

function closestAlong(pts, pos) {
  pts = normPts(pts);
  pos = normPt(pos);
  if (!pos || pts.length < 2) return 0;
  const cum = routeCumul(pts);
  let best = 0;
  let bestD = Infinity;
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const ab2 = (b.lat - a.lat) ** 2 + (b.lng - a.lng) ** 2 || 1e-12;
    let t = ((pos.lat - a.lat) * (b.lat - a.lat) + (pos.lng - a.lng) * (b.lng - a.lng)) / ab2;
    t = Math.max(0, Math.min(1, t));
    const p = { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
    const d = haversineM(pos, p);
    if (d < bestD) {
      bestD = d;
      best = cum[i - 1] + haversineM(a, p);
    }
  }
  return best;
}

function densifyLine(from, to) {
  from = normPt(from);
  to = normPt(to);
  if (!from || !to) return [];
  const dist = haversineM(from, to);
  const steps = Math.max(1, Math.ceil(dist / 20));
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    pts.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    });
  }
  return pts;
}

function formatNavMeters(m) {
  const v = Math.max(0, m);
  if (v >= 1000) {
    const km = v / 1000;
    return km >= 10 ? `${Math.round(km)} km` : `${(Math.round(km * 10) / 10).toFixed(1)} km`;
  }
  if (v >= 300) return `${Math.round(v / 100) * 100} m`;
  if (v >= 80) return `${Math.round(v / 10) * 10} m`;
  return `${Math.round(v)} m`;
}

function roadNameFromTask(task) {
  const raw = String(task.poi_address || '').split(',')[0].trim().replace(/^\d+\s+/, '');
  if (/\b(Ave|Avenue|St|Street|Blvd|Boulevard|Rd|Road|Way|Dr|Rue|路|街)\b/i.test(raw)) return raw;
  return '';
}

function maneuverArrow(type) {
  if (type === 'uturn') {
    return `<svg viewBox="0 0 48 48" width="42" height="42" aria-hidden="true"><path fill="currentColor" d="M34 8h-8a14 14 0 0 0-14 14v6h-8l12 14 12-14h-8v-6a6 6 0 0 1 6-6h8V8z"/></svg>`;
  }
  const rot = { left: -90, right: 90, arrive: 180 }[type] || 0;
  return `<svg viewBox="0 0 48 48" width="42" height="42" style="transform:rotate(${rot}deg)" aria-hidden="true"><path fill="currentColor" d="M24 3.5 39.5 20H31v24.5H17V20H8.5z"/></svg>`;
}

function maneuverLabel(type) {
  return {
    left: 'Turn left',
    right: 'Turn right',
    straight: 'Straight',
    uturn: 'U-turn',
    depart: 'Start',
    arrive: 'Arrive',
  }[type] || 'Straight';
}

function isFocusedRouteMode() {
  return state.mapMode === 'overview' || ['navigating', 'recording', 'completing', 'enroute'].includes(state.mapMode);
}

function currentMapBearing() {
  if (state.map && typeof state.map.getBearing === 'function') return state.map.getBearing() || 0;
  return state.mapBearing || 0;
}

function withMapProgrammatic(fn, holdMs) {
  state.mapGestureUntil = performance.now() + (holdMs == null ? 700 : holdMs);
  state.mapGestureSuppress = true;
  try {
    fn();
  } finally {
    state.mapGestureSuppress = false;
  }
}

function mapOcclusion() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return { top: 72, bottom: 120 };
  const mapRect = mapEl.getBoundingClientRect();
  let top = 16;
  ['map-top-chrome', 'nav-banner'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el || el.classList.contains('hidden')) return;
    const r = el.getBoundingClientRect();
    if (r.height < 4) return;
    if (id === 'nav-banner') return;
    top = Math.max(top, r.bottom - mapRect.top + 10);
  });
  const stats = document.querySelector('#screen-map .map-stats-widget');
  if (stats) {
    const r = stats.getBoundingClientRect();
    if (r.height > 4) top = Math.max(top, r.bottom - mapRect.top + 8);
  }
  let bottom = 24;
  ['capture-sheet', 'task-sheet'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el || el.classList.contains('hidden')) return;
    bottom = Math.max(bottom, el.offsetHeight + 12);
  });
  const nav = document.getElementById('bottom-nav');
  if (nav && !nav.classList.contains('hidden')) bottom += nav.offsetHeight;
  return { top, bottom };
}

function frameLatLng(latlng, zoom, animate) {
  if (!state.map || !latlng) return;
  const ll = L.latLng(latlng.lat != null ? latlng.lat : latlng[0], latlng.lng != null ? latlng.lng : latlng[1]);
  withMapProgrammatic(() => {
    if (zoom != null && Math.abs(state.map.getZoom() - zoom) > 0.05) {
      state.map.setZoom(zoom, { animate: false });
    }
    const size = state.map.getSize();
    const occ = mapOcclusion();
    const top = state.mapMode === 'recording' || state.mapMode === 'enroute' ? Math.max(occ.top, 210) : occ.top;
    const follow = state.mapCameraMode !== 'route-overview' && (state.mapMode === 'recording' || state.mapMode === 'enroute');
    const span = Math.max(40, size.y - top - occ.bottom);
    const desiredY = follow ? top + span * 0.68 : (size.y + top - occ.bottom) / 2;
    const desired = L.point(size.x / 2, Math.max(top + 20, Math.min(size.y - occ.bottom - 20, desiredY)));
    const userPx = state.map.latLngToContainerPoint(ll);
    const delta = desired.subtract(userPx);
    if (Math.abs(delta.x) < 3 && Math.abs(delta.y) < 3) return;
    state.map.panBy([-delta.x, -delta.y], { animate: !!animate });
  });
}

function desiredBearing() {
  if (state.mapCameraMode !== 'route-overview' && state.userHeadingTrusted != null && Number.isFinite(state.userHeadingTrusted)) {
    return (360 - ((state.userHeadingTrusted % 360) + 360) % 360) % 360;
  }
  return 0;
}

function screenRotation(geoBearing) {
  return geoBearing + currentMapBearing();
}

function guideBearing(pts, dist) {
  pts = normPts(pts);
  const total = routeCumul(pts).pop() || 0;
  const here = pointAlong(pts, dist);
  const next = pointAlong(pts, Math.min(total, dist + 14));
  if (here && next && haversineM(here, next) > 4) return bearingDeg(here, next);
  if (here && Number.isFinite(here.bearing)) return here.bearing;
  return state.guideBearing;
}

function arrowScreenRotation() {
  const b = state.guideBearing != null ? state.guideBearing : state.userHeadingTrusted;
  return screenRotation(b || 0);
}

function animateMapBearing(target) {
  if (!state.map || typeof state.map.setBearing !== 'function') {
    state.mapBearing = target;
    syncCourseMarkerRotation();
    return;
  }
  const start = currentMapBearing();
  const delta = angleDelta(start, target);
  if (Math.abs(delta) < 0.4) {
    state.map.setBearing(target);
    syncCourseMarkerRotation();
    return;
  }
  const t0 = performance.now();
  state.mapBearingAnim = true;
  state.mapGestureUntil = t0 + 560;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 480);
    const eased = 1 - (1 - k) ** 3;
    state.mapGestureSuppress = true;
    state.map.setBearing((start + delta * eased + 360) % 360);
    state.mapGestureSuppress = false;
    syncCourseMarkerRotation();
    if (k < 1) requestAnimationFrame(step);
    else state.mapBearingAnim = false;
  };
  requestAnimationFrame(step);
}

function clearRouteDecorations() {
  (state.routeArrowMarkers || []).forEach((m) => m.remove());
  state.routeArrowMarkers = [];
  state.routeSplitLines = [];
}

function arrowGapMeters(zoom) {
  const mPerPx = (156543.03 * Math.cos((34 * Math.PI) / 180)) / 2 ** zoom;
  return Math.max(28, Math.min(220, mPerPx * 78));
}

function drawRouteArrows(pendingPts) {
  pendingPts = normPts(pendingPts);
  (state.routeArrowMarkers || []).forEach((m) => m.remove());
  state.routeArrowMarkers = [];
  if (!state.map || pendingPts.length < 2) return;
  const zoom = state.map.getZoom();
  const gap = arrowGapMeters(zoom);
  const cum = routeCumul(pendingPts);
  const total = cum[cum.length - 1] || 0;
  const spots = [];
  const push = (dist, bearing, force) => {
    if (dist < 8 || dist > total - 6) return;
    if (!force && spots.some((s) => Math.abs(s.dist - dist) < gap * 0.45)) return;
    spots.push({ dist, bearing });
  };
  for (let i = 1; i < pendingPts.length - 1; i += 1) {
    const delta = angleDelta(bearingDeg(pendingPts[i - 1], pendingPts[i]), bearingDeg(pendingPts[i], pendingPts[i + 1]));
    if (Math.abs(delta) >= 28) push(cum[i], bearingDeg(pendingPts[i], pendingPts[i + 1]), true);
  }
  for (let d = gap * 0.65; d < total; d += gap) {
    const sample = pointAlong(pendingPts, d);
    if (sample) push(d, sample.bearing, false);
  }
  if (!spots.length && total > 12) {
    const mid = pointAlong(pendingPts, total / 2);
    if (mid) spots.push({ dist: total / 2, bearing: mid.bearing });
  }
  spots.forEach((s) => {
    const p = pointAlong(pendingPts, s.dist);
    if (!p) return;
    const rot = screenRotation(s.bearing);
    const marker = L.marker([p.lat, p.lng], {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: 'route-arrow-marker',
        html: `<div class="route-dir" data-bearing="${s.bearing}" style="transform:rotate(${rot}deg)"><span></span></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
    }).addTo(state.map);
    state.routeArrowMarkers.push(marker);
  });
}

function syncCourseMarkerRotation() {
  document.querySelectorAll('.route-dir').forEach((el) => {
    const b = Number(el.dataset.bearing);
    if (!Number.isFinite(b)) return;
    el.style.transform = `rotate(${screenRotation(b)}deg)`;
  });
  const arrow = document.querySelector('.user-loc-arrow');
  if (arrow && state.userHeadingTrusted != null) {
    arrow.style.transform = `rotate(${arrowScreenRotation()}deg)`;
  }
}

function userMarkerHtml(arrow) {
  if (!arrow) {
    return '<div class="user-loc user-loc--dot"><span class="user-loc-dot"></span></div>';
  }
  const rot = arrowScreenRotation();
  return `<div class="user-loc user-loc--arrow">
    <div class="user-loc-arrow" style="transform:rotate(${rot}deg)">
      <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
        <path d="M24 4 42 40 24 32 6 40Z" fill="#1a73e8"/>
      </svg>
    </div>
  </div>`;
}

function updateUserMarker() {
  if (!state.map || !state.userPos) {
    if (state.userMarker) {
      state.userMarker.remove();
      state.userMarker = null;
    }
    return;
  }
  const arrow = (state.mapMode === 'recording' || state.mapMode === 'enroute') && state.userHeadingTrusted != null;
  const icon = L.divIcon({
    className: 'user-loc-marker',
    html: userMarkerHtml(arrow),
    iconSize: arrow ? [36, 36] : [28, 28],
    iconAnchor: arrow ? [18, 18] : [14, 14],
  });
  if (!state.userMarker) {
    state.userMarker = L.marker([state.userPos.lat, state.userPos.lng], {
      icon,
      interactive: false,
      keyboard: false,
      zIndexOffset: 1200,
    }).addTo(state.map);
    return;
  }
  state.userMarker.setLatLng([state.userPos.lat, state.userPos.lng]);
  state.userMarker.setIcon(icon);
}

function updateNavBanner() {
  const el = document.getElementById('nav-banner');
  if (!el) return;
  const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
  const show =
    (state.mapMode === 'recording' || (state.mapMode === 'enroute' && !state.enrouteArrived)) &&
    task &&
    state.userPos;
  el.classList.toggle('hidden', !show);
  if (!show) return;
  if (state.mapMode === 'enroute') {
    const pts = state.transitPts || [];
    const m = resolveManeuverOn(pts, state.transitDistanceM || 0);
    const arrived = !!state.enrouteArrived || (m.type === 'arrive' && m.remain < 40);
    const type = arrived ? 'arrive' : (m.type === 'arrive' ? 'straight' : m.type);
    const near = arrived || (m.remain < 80 && type !== 'depart' && type !== 'straight');
    el.className = `nav-banner is-transit${near ? ' is-near' : ''}`;
    el.innerHTML = `<div class="nav-turn">${maneuverArrow(arrived ? 'arrive' : type)}</div>
      <div class="nav-copy">
        <div class="nav-dist">${arrived ? 'Here' : formatNavMeters(m.remain)}</div>
      </div>`;
    if (window.App) App.syncNextDestination();
    return;
  }
  const pts = getTaskLatLngs(task);
  if (distanceToRouteM(state.userPos, pts) > 45) {
    el.className = 'nav-banner is-offroute';
    el.innerHTML = '<p class="nav-offroute">已偏离任务路线，请返回高亮路线</p>';
    return;
  }
  const m = resolveManeuver(task, state.navDistanceM || 0);
  const near = m.remain < 80 && m.type !== 'depart' && m.type !== 'straight';
  el.className = `nav-banner is-transit${near ? ' is-near' : ''}`;
  el.innerHTML = `<div class="nav-turn">${maneuverArrow(m.type)}</div>
    <div class="nav-copy">
      <div class="nav-dist">${formatNavMeters(m.remain)}</div>
    </div>`;
}

function updateOrientButton() {
  const btn = document.getElementById('map-float-over');
  if (!btn) return;
  const overview = state.mapCameraMode === 'route-overview';
  btn.classList.toggle('is-overview', overview);
  btn.setAttribute('aria-pressed', overview ? 'true' : 'false');
  btn.setAttribute('aria-label', overview ? 'Follow' : 'Overview');
  const label = btn.querySelector('.map-orient-label');
  if (label) label.textContent = overview ? 'Follow' : 'Overview';
}

function updateRecenterButton() {}

function navPaused() {
  return !!(state.recordingPausedByAlert || state.shiftPaused || state.captureRestMode || state.discardSheetOpen || document.visibilityState === 'hidden');
}

function canAutoRecenter() {
  return (state.mapMode === 'recording' || state.mapMode === 'enroute') && state.mapFreeBrowse && !state.routeOverviewHold && !navPaused() && state.screen === 'map';
}

function scheduleNavRecenter() {
  clearTimeout(state.navRecenterTimer);
  if (!canAutoRecenter()) return;
  state.navRecenterTimer = setTimeout(() => {
    if (!canAutoRecenter()) return;
    if (window.App) App.recenterMap();
  }, 5000);
}

function lockMapNorth() {
  if (!state.map) return;
  if (state.map.touchRotate && state.map.touchRotate.enabled()) state.map.touchRotate.disable();
  if (typeof state.map.setBearing !== 'function') return;
  if (Math.abs(currentMapBearing()) < 0.2) return;
  withMapProgrammatic(() => state.map.setBearing(0), 1200);
  syncCourseMarkerRotation();
}

function onNavMapGesture(e) {
  const type = e && e.type;
  if (type === 'rotate' || type === 'rotatestart') {
    if (state.mapCameraMode === 'route-overview') lockMapNorth();
    return;
  }
  const blocked = state.mapGestureSuppress || performance.now() < (state.mapGestureUntil || 0);
  if (type !== 'dragstart' && blocked) return;
  if (state.mapMode === 'overview') {
    state.mapFreeBrowse = true;
    return;
  }
  if (state.mapMode !== 'recording' && state.mapMode !== 'enroute') return;
  if (state.mapCameraMode === 'follow-north' && type !== 'dragstart') return;
  state.navFollow = false;
  state.mapFreeBrowse = true;
  updateRecenterButton();
  scheduleNavRecenter();
}

function bindNavGestures() {
  if (!state.map || state.navGesturesBound) return;
  state.navGesturesBound = true;
  state.map.on('dragstart zoomstart rotatestart rotate', onNavMapGesture);
  state.map.on('zoomend', () => {
    if (state.mapGestureSuppress || performance.now() < (state.mapGestureUntil || 0)) return;
    if (isFocusedRouteMode() && state.selectedTaskId) {
      App.renderMapTasks({ skipFit: true });
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(state.navRecenterTimer);
    else if (state.mapFreeBrowse) scheduleNavRecenter();
  });
}

function followCamera(animate) {
  if (!state.userPos || !state.navFollow || state.mapFreeBrowse || !state.map) return;
  if (state.mapCameraMode === 'route-overview') return;
  const zoom = 17;
  const bearing = desiredBearing();
  const zoomOff = Math.abs(state.map.getZoom() - zoom) > 0.8;
  withMapProgrammatic(() => {
    if (zoomOff && state.map.stop) state.map.stop();
    if (zoomOff) state.map.setView([state.userPos.lat, state.userPos.lng], zoom, { animate: false });
    if (typeof state.map.setBearing === 'function' && Math.abs(angleDelta(currentMapBearing(), bearing)) > 0.4) {
      state.map.setBearing(bearing);
    }
  }, 500);
  frameLatLng(state.userPos, zoomOff ? zoom : null, false);
  syncCourseMarkerRotation();
}

const NAV_LEG_MS = 5000;
const NAV_TICK_MS = 50;

function resetNavLegClock() {
  state.navLegT0 = performance.now();
  state.navLegPauseT0 = 0;
}

function navLegAlong(total) {
  if (!state.navLegT0) resetNavLegClock();
  if (navPaused()) {
    if (!state.navLegPauseT0) state.navLegPauseT0 = performance.now();
    const frozen = Math.max(0, state.navLegPauseT0 - state.navLegT0);
    return Math.min(total, total * (frozen / NAV_LEG_MS));
  }
  if (state.navLegPauseT0) {
    state.navLegT0 += performance.now() - state.navLegPauseT0;
    state.navLegPauseT0 = 0;
  }
  const elapsed = Math.max(0, performance.now() - state.navLegT0);
  return Math.min(total, total * (elapsed / NAV_LEG_MS));
}

function stepNavSimulation() {
  if (state.mapMode !== 'recording') return;
  const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
  if (!task) return;
  const pts = getTaskLatLngs(task);
  taskManeuvers(task);
  const total = task._routeLen || 0;
  if ((state.navDistanceM || 0) < total - 1) {
    const along = navLegAlong(total);
    if (!navPaused()) {
    const step = Math.max(0, along - (state.navDistanceM || 0));
    state.navDistanceM = along;
    state.userSpeed = step / (NAV_TICK_MS / 1000);
    const sample = pointAlong(pts, state.navDistanceM);
    if (sample) {
      const guide = guideBearing(pts, state.navDistanceM);
      if (guide != null) state.guideBearing = guide;
      state.userHeadingTrusted = state.userHeadingTrusted == null
        ? state.guideBearing
        : lerpAngle(state.userHeadingTrusted, state.guideBearing, 0.8);
      state.userPos = { lat: sample.lat, lng: sample.lng };
    }
    }
  } else {
    state.userSpeed = 0;
  }
  refreshActiveRouteGraphics();
  updateUserMarker();
  updateNavBanner();
  if (state.navFollow && !state.mapFreeBrowse) followCamera(false);
}

function refreshActiveRouteGraphics() {
  const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
  if (!task || !state.routeSplitLines || state.routeSplitLines.length < 1) return;
  const pts = getTaskLatLngs(task);
  const along = state.mapMode === 'recording' || state.mapMode === 'completing' ? state.navDistanceM || 0 : 0;
  const split = splitRouteLatLngs(pts, along);
  const [done, pending] = state.routeSplitLines;
  if (done) done.setLatLngs(split.done.length > 1 ? split.done : []);
  if (pending) pending.setLatLngs(split.pending.length > 1 ? split.pending : pts);
  const moved = Math.abs((state.navDistanceM || 0) - (state._arrowAt || 0));
  if (moved > arrowGapMeters(state.map.getZoom()) * 0.35) {
    drawRouteArrows(split.pending.length > 1 ? split.pending : pts);
    state._arrowAt = state.navDistanceM || 0;
  } else {
    syncCourseMarkerRotation();
  }
}

function beginNavSimulation() {
  stopNavSimulation();
  const gen = state.navSimGen;
  const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
  if (!task || !state.map) return;
  if (normPts(task.routedPolyline).length < 3) {
    const ends = getTaskEndpoints(task);
    requestRoad(ends.start, ends.end)
      .catch(() => densifyLine(ends.start, ends.end))
      .then((points) => {
        if (state.navSimGen !== gen) return;
        if (state.mapMode !== 'recording' || state.selectedTaskId !== task.task_id) return;
        if (task._routeLocked) return;
        const pts = normPts(points);
        task.routedPolyline = pts.length > 2 ? pts : densifyLine(ends.start, ends.end);
        task._maneuverKey = null;
        beginNavSimulation();
      });
    return;
  }
  task._routeLocked = true;
  const pts = getTaskLatLngs(task);
  taskManeuvers(task);
  state.navDistanceM = 0;
  state.mapFreeBrowse = false;
  state.navFollow = true;
  state.mapCameraMode = 'follow-north';
  state.routeOverviewHold = false;
  state.mapBearingMode = 'heading';
  const sample = pointAlong(pts, 0);
  state.userPos = sample ? { lat: sample.lat, lng: sample.lng } : null;
  state.guideBearing = guideBearing(pts, 0);
  state.userHeadingTrusted = state.guideBearing;
  if (typeof state.map.setBearing === 'function' && state.userHeadingTrusted != null) {
    state.map.setBearing(desiredBearing());
  }
  state.userSpeed = 8;
  updateOrientButton();
  updateUserMarker();
  updateNavBanner();
  if (window.App) App.renderMapTasks({ skipFit: true });
  followCamera(true);
  resetNavLegClock();
  const loop = () => {
    if (state.navSimGen !== gen || state.mapMode !== 'recording') return;
    stepNavSimulation();
    if (state.navSimGen !== gen || state.mapMode !== 'recording') return;
    const total = task._routeLen || 0;
    if (total > 1 && (state.navDistanceM || 0) >= total - 1) {
      if (window.App) App.arriveTaskEnd();
      return;
    }
    state.navSimTimer = setTimeout(loop, NAV_TICK_MS);
  };
  state.navSimTimer = setTimeout(loop, NAV_TICK_MS);
}

function syncEnrouteSheet() {
  const status = document.getElementById('enroute-status');
  const btn = document.getElementById('capture-start-next');
  if (!status) return;
  const total = routeCumul(state.transitPts || []).pop() || 0;
  const remain = Math.max(0, total - (state.transitDistanceM || 0));
  if (state.enrouteArrived) {
    status.textContent = 'Here';
  } else {
    status.textContent = formatNavMeters(remain);
  }
  if (btn) btn.classList.toggle('is-ready', !!state.enrouteArrived);
}

function refreshTransitGraphics() {
  const pts = normPts(state.transitPts);
  if (!state.map || pts.length < 2 || !state.transitLayers) return;
  const split = splitRouteLatLngs(pts, state.transitDistanceM || 0);
  const [done, pending] = state.transitLayers;
  if (done) done.setLatLngs(split.done.length > 1 ? split.done : []);
  if (pending) pending.setLatLngs(split.pending.length > 1 ? split.pending : pts);
  drawRouteArrows(split.pending.length > 1 ? split.pending : pts);
}

function stepTransit() {
  if (state.mapMode !== 'enroute') return;
  const pts = normPts(state.transitPts);
  const total = routeCumul(pts).pop() || 0;
  if (!state.enrouteArrived && total > 1 && (state.transitDistanceM || 0) < total) {
    const along = navLegAlong(total);
    if (!navPaused()) {
    const step = Math.max(0, along - (state.transitDistanceM || 0));
    state.transitDistanceM = along;
    const sample = pointAlong(pts, state.transitDistanceM);
    if (sample) {
      const guide = guideBearing(pts, state.transitDistanceM || 0);
      if (guide != null) state.guideBearing = guide;
      state.userHeadingTrusted = state.userHeadingTrusted == null
        ? state.guideBearing
        : lerpAngle(state.userHeadingTrusted, state.guideBearing, 0.8);
      state.userPos = { lat: sample.lat, lng: sample.lng };
      state.userSpeed = step / (NAV_TICK_MS / 1000);
    }
    if (state.transitDistanceM >= total - 1) {
      state.transitDistanceM = total;
      state.enrouteArrived = true;
      state.userSpeed = 0;
      const end = pts[pts.length - 1];
      if (end) state.userPos = { lat: end.lat, lng: end.lng };
      if (typeof clearTransitLayers === 'function') clearTransitLayers();
      state.transitPts = null;
    }
    }
  }
  refreshTransitGraphics();
  updateUserMarker();
  updateNavBanner();
  if (state.navFollow && !state.mapFreeBrowse) followCamera(false);
}

function startTransitLoop(task, gen) {
  resetNavLegClock();
  const loop = () => {
    if (state.navSimGen !== gen || state.mapMode !== 'enroute') return;
    stepTransit();
    if (state.navSimGen !== gen || state.mapMode !== 'enroute') return;
    if (state.enrouteArrived && window.App) {
      App.onTransitArrived();
      return;
    }
    state.navSimTimer = setTimeout(loop, NAV_TICK_MS);
  };
  state.navSimTimer = setTimeout(loop, NAV_TICK_MS);
  if (state.mapCameraMode === 'route-overview') fitTransitInSafeArea(task);
  if (window.App) App.renderMapTasks({ skipFit: true });
  updateNavBanner();
}

function beginTransit(task) {
  stopNavSimulation();
  const gen = state.navSimGen;
  const route = normPts(getTaskLatLngs(task));
  const start = route[0];
  if (!start || !state.map) return;
  const from = normPt(state.userPos) || start;
  state.transitPts = null;
  state.transitDistanceM = 0;
  state.enrouteArrived = false;
  state.mapFreeBrowse = true;
  state.navFollow = false;
  state.mapCameraMode = 'route-overview';
  state.routeOverviewHold = true;
  if (typeof state.map.setBearing === 'function') state.map.setBearing(0);
  state.userHeadingTrusted = bearingDeg(from, start);
  state.userSpeed = 0;
  updateOrientButton();
  updateUserMarker();
  updateNavBanner();
  const taskId = task.task_id;
  const arm = (road) => {
    if (state.navSimGen !== gen) return;
    if (state.mapMode !== 'enroute' || state.selectedTaskId !== taskId) return;
    const pts = normPts(road);
    const path = pts.length > 2 ? pts.slice() : densifyLine(from, start);
    const last = path[path.length - 1];
    if (!last || haversineM(last, start) > 3) path.push(normPt(start));
    const total = routeCumul(path).pop() || 0;
    state.transitPts = path;
    state.transitDistanceM = total <= 8 ? total : 0;
    state.enrouteArrived = total <= 8;
    const first = path[1] || start;
    state.guideBearing = guideBearing(path, state.transitDistanceM || 0) || bearingDeg(from, first);
    state.userHeadingTrusted = state.guideBearing;
    state.userPos = { lat: from.lat, lng: from.lng };
    startTransitLoop(task, gen);
  };
  requestRoad(from, start).then(arm).catch(() => arm(densifyLine(from, start)));
}

function fitTransitInSafeArea(task) {
  if (!state.map) return;
  const pts = normPts(state.transitPts).concat(normPts(task ? getTaskLatLngs(task) : []));
  if (pts.length < 2) return;
  const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng]));
  const occ = mapOcclusion();
  withMapProgrammatic(() => {
    if (typeof state.map.setBearing === 'function') state.map.setBearing(0);
    state.map.fitBounds(bounds, {
      paddingTopLeft: [28, Math.max(72, occ.top)],
      paddingBottomRight: [36, Math.max(96, occ.bottom)],
      animate: true,
      maxZoom: 16,
    });
  });
}

function stopNavSimulation() {
  clearTimeout(state.navSimTimer);
  state.navSimTimer = null;
  state.navSimGen = (state.navSimGen || 0) + 1;
  clearTimeout(state.navRecenterTimer);
  state.navFollow = false;
  state.userSpeed = 0;
}

function placeBrowseUser(task) {
  const pts = getTaskLatLngs(task);
  const sample = pointAlong(pts, 0);
  state.userPos = sample ? { lat: sample.lat, lng: sample.lng } : null;
  state.userHeadingTrusted = null;
  state.userSpeed = 0;
  state.navDistanceM = 0;
  updateUserMarker();
}

function syntheticEnds(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 33 + id.charCodeAt(i)) % 997;
  const corridors = [
    [{ lat: 34.0472, lng: -118.256 }, { lat: 34.0568, lng: -118.256 }],
    [{ lat: 34.0616, lng: -118.308 }, { lat: 34.0616, lng: -118.289 }],
    [{ lat: 34.0832, lng: -118.352 }, { lat: 34.0832, lng: -118.328 }],
    [{ lat: 34.0405, lng: -118.278 }, { lat: 34.0495, lng: -118.268 }],
    [{ lat: 34.0525, lng: -118.291 }, { lat: 34.0625, lng: -118.284 }],
  ];
  const pair = corridors[h % corridors.length];
  return { start: pair[0], end: pair[1] };
}

function ensureOverviewTask(record) {
  if (!record) return null;
  const existing = state.mapTasks.find(
    (t) => t.task_id === record.task_id || t.poi_name === record.title || t.poi_name === record.mapping_title
  );
  if (existing) return existing;
  const ends = syntheticEnds(record.task_id);
  const task = seg(`ov_${record.task_id}`, record.title || record.mapping_title || 'Task', record.address || '', ends.start, ends.end, {
    distance_km: record.distance_km || 1.4,
    distance_from_user_km: 0.4,
    display_state: 'claimed',
    claimed_by_me: true,
    ticket_id: record.ticket_id,
  });
  task.overview_only = true;
  state.mapTasks.push(task);
  return task;
}

function fitTaskInSafeArea(task) {
  if (!state.map || !task) return;
  const bounds = L.latLngBounds(getTaskLatLngs(task));
  const occ = mapOcclusion();
  withMapProgrammatic(() => {
    if (typeof state.map.setBearing === 'function') state.map.setBearing(0);
    state.map.fitBounds(bounds, {
      paddingTopLeft: [28, Math.max(72, occ.top)],
      paddingBottomRight: [36, Math.max(96, occ.bottom)],
      animate: true,
      maxZoom: 16,
    });
  });
}

function fitTaskWithNeighbors(task) {
  if (!state.map || !task) return;
  const pts = normPts(getTaskLatLngs(task));
  if (!pts.length) return;
  const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng]));
  const center = bounds.getCenter();
  const corner = bounds.getNorthEast();
  const span = haversineM({ lat: center.lat, lng: center.lng }, { lat: corner.lat, lng: corner.lng });
  const reach = Math.max(400, Math.min(1400, span * 1.6));
  state.mapTasks.forEach((other) => {
    if (!other || other.task_id === task.task_id || other.overview_only) return;
    if (other.display_state === 'completed_local' || other.display_state === 'completed') return;
    if (state.mapMode === 'next' && !isClaimedTask(other)) return;
    normPts(getTaskLatLngs(other)).forEach((p) => {
      if (haversineM(p, { lat: center.lat, lng: center.lng }) <= reach) bounds.extend([p.lat, p.lng]);
    });
  });
  const occ = mapOcclusion();
  withMapProgrammatic(() => {
    if (typeof state.map.setBearing === 'function') state.map.setBearing(0);
    state.map.fitBounds(bounds, {
      paddingTopLeft: [28, Math.max(72, occ.top)],
      paddingBottomRight: [36, Math.max(120, occ.bottom)],
      animate: true,
      maxZoom: 16,
    });
  });
}

function isClaimedTask(t) {
  return t.display_state === 'claimed' && t.claimed_by_me;
}

function listNearbyOpenTasks(anchor) {
  const origin = normPt(anchor) || normPt(state.userPos);
  return state.mapTasks
    .filter((t) => !t.overview_only && isClaimedTask(t))
    .map((task) => {
      const start = getTaskEndpoints(task).start;
      return { task, distanceM: origin ? haversineM(origin, start) : 0 };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}

function pickNextOpenTask(currentId) {
  return (
    state.mapTasks.find(
      (t) => t.task_id !== currentId && !t.overview_only && isClaimedTask(t)
    ) || null
  );
}

function isUnclaimedTask(t) {
  return (
    t &&
    !t.overview_only &&
    t.display_state !== 'completed_local' &&
    t.display_state !== 'completed' &&
    t.display_state !== 'discarded' &&
    !isClaimedTask(t)
  );
}

function listNearbyUnclaimedTasks(anchor) {
  const origin = normPt(anchor) || normPt(state.userPos);
  return state.mapTasks
    .filter(isUnclaimedTask)
    .map((task) => {
      const start = getTaskEndpoints(task).start;
      return { task, distanceM: origin ? haversineM(origin, start) : 0 };
    })
    .sort((a, b) => a.distanceM - b.distanceM);
}
