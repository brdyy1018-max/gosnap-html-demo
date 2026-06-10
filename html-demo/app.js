/* GoSnap HTML Demo — aligned to design mockups */

const COLORS = {
  unclaimed: '#0052D9',
  claimed: '#F59E0B',
  completed: '#2BA471',
  second: '#8B5CF6',
  high: '#EF4444',
  progress: {
    completed: '#6366F1',
    collected: '#0EA5E9',
    reviewing: '#F59E0B',
    approved: '#2BA471',
    rejected: '#EF4444',
  },
};

const LIFECYCLE_LAYERS = [
  { id: 'unclaimed', label: 'Open', color: COLORS.unclaimed, hint: 'Line color' },
  { id: 'claimed', label: 'Claimed', color: COLORS.claimed, hint: 'Line color' },
  { id: 'completed', label: 'Done', color: COLORS.completed, hint: 'Line color' },
];

const DISPATCH_LAYERS = [
  { id: 'first', label: '1st dispatch', color: COLORS.unclaimed, hint: 'First round tasks' },
  { id: 'second', label: '2nd dispatch', color: COLORS.second, hint: 'Second round tasks' },
];

const PRIORITY_LAYERS = [
  { id: 'normal', label: 'Normal', color: '#94A3B8', hint: 'Standard priority' },
  { id: 'high', label: 'High priority', color: COLORS.high, hint: 'High priority tasks' },
];

const DEFAULT_MAP_FILTERS = {
  lifecycle: { unclaimed: true, claimed: true, completed: true },
  dispatch: { first: true, second: true },
  priority: { normal: true, high: true },
};

const PROGRESS_LAYERS = [
  { id: 'completed', label: 'Completed' },
  { id: 'collected', label: 'Collected' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const SETTLEMENT_BOTTOM = ['reviewing', 'approved', 'rejected'];

/** Demo credentials — region + user ID + password must all match */
const LOGIN_REGIONS = ['US', 'UK', 'SG'];
const DEMO_ACCOUNTS = [
  { region: 'US', userId: 'US-156', password: 'demo123', displayName: 'User Wang' },
  { region: 'UK', userId: 'UK-088', password: 'demo123', displayName: 'User Smith' },
  { region: 'SG', userId: 'SG-042', password: 'demo123', displayName: 'User Tan' },
];

const DEVICE_CHECKS = [
  { id: 'gps', icon: '📍', title: 'GPS Positioning', modal: 'modal-location' },
  { id: 'bluetooth', icon: '📶', title: 'Bluetooth', modal: 'modal-bluetooth' },
  { id: 'network', icon: '📡', title: 'Network', modal: 'modal-network' },
  { id: 'storage', icon: '💾', title: 'Storage Space', modal: 'modal-storage' },
];

const PRECONDITION_ROWS = [
  {
    id: 'bluetooth',
    title: 'Bluetooth',
    icon: 'bluetooth',
    ok: 'Connected to GoPro',
    err: 'Not connected to GoPro',
  },
  {
    id: 'network',
    title: 'Network',
    ok: 'Network is good',
    err: 'Weak or No Connection',
  },
  {
    id: 'gps',
    title: 'GPS Positioning',
    icon: 'gps',
    ok: 'Location ready',
    err: 'Location Access Denied',
    distanceErr: 'Distance to task does not meet requirements',
  },
  {
    id: 'storage',
    title: 'Storage Space',
    icon: 'storage',
    ok: 'Storage available',
    err: 'Insufficient storage space',
  },
];

const TASK_DISTANCE_MAX_KM = 1.0;

function preconditionRowIcon(name) {
  const icons = {
    bluetooth:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m7 7 10 10-5 1 1-5Z"/><path d="m17 7-10 10 5 1-1-5Z"/></svg>',
    network:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 010 18"/><path d="M12 3a15 15 0 000 18"/></svg>',
    gps:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    storage:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4V2h6v2M9 14h6M9 10h6" stroke-linecap="round"/></svg>',
  };
  return icons[name] || '';
}

function getSelectedMapTask() {
  return state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
}

function checkTaskDistanceOk() {
  const t = getSelectedMapTask();
  if (!t) return true;
  return (t.distance_km || 0) <= TASK_DISTANCE_MAX_KM;
}

function syncGpsPrecondition() {
  state.preconditions.gps =
    state.preconditionGps.authorized && state.preconditionGps.distanceOk;
}

function getPreconditionSubtitle(row) {
  if (row.id === 'gps') {
    if (state.preconditions.gps) return row.ok;
    if (state.preconditionGps.authorized && !state.preconditionGps.distanceOk) {
      return row.distanceErr;
    }
    return row.err;
  }
  return state.preconditions[row.id] ? row.ok : row.err;
}

function getPreconditionAction(row) {
  if (state.preconditions[row.id]) {
    return '<span class="pre-card-check" aria-label="Ready"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M5 10.5 8.5 14 15 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  }
  if (row.id === 'gps' && state.preconditionGps.authorized && !state.preconditionGps.distanceOk) {
    return '<button type="button" class="pre-card-action pre-card-action--refresh" onclick="App.refreshGpsDistance()">Refresh ↻</button>';
  }
  return `<button type="button" class="pre-card-action" onclick="App.fixPrecondition('${row.id}')">Set ›</button>`;
}

function seg(id, name, address, start, end, opts = {}) {
  return {
    task_id: id,
    poi_name: name,
    poi_address: address,
    polyline: [start, end],
    start_point: start,
    end_point: end,
    distance_km: 1.4,
    distance_from_user_km: 0.8,
    priority: opts.priority || 'normal',
    dispatch_round: opts.dispatch_round || 'first',
    display_state: opts.display_state || 'unclaimed',
    claimed_by_me: !!opts.claimed_by_me,
    review_status: opts.review_status,
  };
}

const state = {
  screen: 'login',
  map: null,
  progressMap: null,
  mapFilters: JSON.parse(JSON.stringify(DEFAULT_MAP_FILTERS)),
  filterDraft: null,
  progressLayers: Object.fromEntries(PROGRESS_LAYERS.map((l) => [l.id, true])),
  taskFilter: 'all',
  taskStatusFilter: 'all',
  taskDatePreset: 'all',
  taskDateLabel: 'Date',
  taskDateSelected: null,
  selectedRecordId: null,
  selectedTaskId: null,
  mapMode: 'idle', // idle | navigating | recording | completing | review
  recSeconds: 0,
  recInterval: null,
  activeRouteLayer: null,
  mapAlertDismissed: false,
  captureRestMode: false,
  skipSafety: false,
  deviceChecks: { gps: true, bluetooth: true, network: true, storage: true },
  preconditionGps: { authorized: false, distanceOk: false },
  preconditions: { bluetooth: true, network: true, gps: true, storage: true },
  mapTaskLayers: {},
  progressPolylines: {},
  routeCache: {},
  routePending: new Set(),
  precheckMap: null,
  precheckStep: 'location',
  selectedGopro: 'GoPro_1',
  precheckTimer: null,
  statusBarCollapsed: false,
  auth: null,
  mapTasks: [
    seg('task_vermont_001', 'S Vermont Ave', '1200 S Vermont Ave, Los Angeles, CA', { lat: 34.0522, lng: -118.2915 }, { lat: 34.0535, lng: -118.289 }),
    seg('task_high_002', 'Sunset Blvd', 'Sunset Blvd, Los Angeles, CA', { lat: 34.098, lng: -118.326 }, { lat: 34.1, lng: -118.32 }, { display_state: 'claimed', claimed_by_me: true, priority: 'high' }),
    seg('task_wilshire_003', 'Wilshire Blvd', '3400 Wilshire Blvd, Los Angeles, CA', { lat: 34.0615, lng: -118.308 }, { lat: 34.063, lng: -118.3 }),
    seg('task_fig_004', 'Figueroa St', '2200 Figueroa St, Los Angeles, CA', { lat: 34.038, lng: -118.278 }, { lat: 34.041, lng: -118.272 }, { display_state: 'claimed', claimed_by_me: true }),
    seg('task_melrose_005', 'Melrose Ave', '7600 Melrose Ave, Los Angeles, CA', { lat: 34.083, lng: -118.365 }, { lat: 34.085, lng: -118.358 }, { display_state: 'completed_local', review_status: 'approved' }),
    seg('task_broadway_006', 'Broadway DTLA', '500 S Broadway, Los Angeles, CA', { lat: 34.047, lng: -118.252 }, { lat: 34.05, lng: -118.245 }, { dispatch_round: 'second' }),
    seg('task_hollywood_009', 'Sorrento Valley', '900 Exposition Blvd, Los Angeles, CA', { lat: 34.101, lng: -118.337 }, { lat: 34.104, lng: -118.33 }, { priority: 'high', distance_from_user_km: 36.6, distance_km: 6.3 }),
    seg('task_venice_012', 'Venice Blvd', '1500 Venice Blvd, Los Angeles, CA', { lat: 34.005, lng: -118.44 }, { lat: 34.01, lng: -118.432 }, { display_state: 'claimed', claimed_by_me: true, dispatch_round: 'second' }),
    seg('task_done_high_013', 'Pico Blvd', '2300 Pico Blvd, Santa Monica, CA', { lat: 34.028, lng: -118.455 }, { lat: 34.032, lng: -118.448 }, { display_state: 'completed_local', priority: 'high' }),
    seg('task_second_high_014', 'Lincoln Blvd', '3100 Lincoln Blvd, Santa Monica, CA', { lat: 34.018, lng: -118.47 }, { lat: 34.022, lng: -118.462 }, { dispatch_round: 'second', priority: 'high' }),
    seg('task_claimed_second_high_015', 'Sepulveda Blvd', '11000 Sepulveda Blvd, Los Angeles, CA', { lat: 34.24, lng: -118.47 }, { lat: 34.245, lng: -118.462 }, { display_state: 'claimed', claimed_by_me: true, dispatch_round: 'second', priority: 'high' }),
    seg('task_high_unclaimed_016', 'La Brea Ave', '450 S La Brea Ave, Los Angeles, CA', { lat: 34.068, lng: -118.344 }, { lat: 34.072, lng: -118.338 }, { priority: 'high' }),
    seg('task_second_normal_017', 'Crenshaw Blvd', '3600 Crenshaw Blvd, Los Angeles, CA', { lat: 34.015, lng: -118.331 }, { lat: 34.02, lng: -118.325 }, { dispatch_round: 'second' }),
    seg('task_high_second_018', 'Santa Monica Blvd', '8400 Santa Monica Blvd, West Hollywood, CA', { lat: 34.09, lng: -118.38 }, { lat: 34.094, lng: -118.372 }, { priority: 'high', dispatch_round: 'second' }),
    seg('task_normal_open_019', 'Alameda St', '800 N Alameda St, Los Angeles, CA', { lat: 34.055, lng: -118.238 }, { lat: 34.058, lng: -118.232 }),
    seg('task_second_claimed_020', 'Western Ave', '5200 Western Ave, Los Angeles, CA', { lat: 34.105, lng: -118.309 }, { lat: 34.108, lng: -118.302 }, { display_state: 'claimed', claimed_by_me: true, dispatch_round: 'second' }),
    seg('task_high_completed_021', 'Olympic Blvd', '1800 W Olympic Blvd, Los Angeles, CA', { lat: 34.052, lng: -118.305 }, { lat: 34.055, lng: -118.298 }, { display_state: 'completed_local', priority: 'high' }),
    seg('task_second_completed_022', 'Vermont Ave North', '3000 N Vermont Ave, Los Angeles, CA', { lat: 34.115, lng: -118.292 }, { lat: 34.118, lng: -118.286 }, { display_state: 'completed_local', dispatch_round: 'second' }),
  ],
  records: [
    {
      task_id: 'task_vermont_today',
      mapping_title: 'S Vermont Ave Mapping',
      ticket_id: '490539356-479',
      address: '1200 S Vermont Ave, Los Angeles, CA 90006, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(10, 0, 0, 0);
        return d.toISOString();
      })(),
      duration: '10m3s',
      size: '50.2M',
      status: 'approved',
      audit_stage: 'completed',
      thumb: 'pool',
    },
    {
      task_id: 'task_olympic_today',
      mapping_title: 'Olympic Blvd Corridor',
      ticket_id: '490528901-468',
      address: '1800 W Olympic Blvd, Los Angeles, CA 90006, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(11, 30, 0, 0);
        return d.toISOString();
      })(),
      duration: '8m20s',
      size: '45.8M',
      status: 'pending',
      audit_stage: 'reviewing',
      thumb: 'urban',
    },
    {
      task_id: 'task_wilshire_today',
      mapping_title: 'Wilshire Transit Node',
      ticket_id: '490520056-470',
      address: '3400 Wilshire Blvd, Los Angeles, CA 90010, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(14, 15, 0, 0);
        return d.toISOString();
      })(),
      duration: '7m20s',
      size: '38.5M',
      status: 'rejected',
      audit_stage: 'completed',
      thumb: 'street',
    },
    {
      task_id: 'task_vermont_yesterday',
      mapping_title: 'S Vermont Ave Mapping',
      ticket_id: '490501122-441',
      address: '1200 S Vermont Ave, Los Angeles, CA 90006, United States',
      shot_at: (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(10, 0, 0, 0);
        return d.toISOString();
      })(),
      duration: '10m3s',
      size: '50.2M',
      status: 'pending',
      audit_stage: 'reviewing',
      thumb: 'pool',
    },
  ],
  progressTasks: [
    { task_id: 'prog_vermont', poi_name: 'S Vermont Ave', progress_status: 'approved', polyline: [{ lat: 34.0522, lng: -118.2915 }, { lat: 34.0535, lng: -118.289 }] },
    { task_id: 'prog_melrose', poi_name: 'Melrose Ave', progress_status: 'approved', polyline: [{ lat: 34.083, lng: -118.365 }, { lat: 34.085, lng: -118.358 }] },
    { task_id: 'prog_wilshire', poi_name: 'Wilshire Blvd', progress_status: 'reviewing', polyline: [{ lat: 34.0615, lng: -118.308 }, { lat: 34.063, lng: -118.3 }] },
    { task_id: 'prog_hollywood', poi_name: 'Hollywood Blvd', progress_status: 'reviewing', polyline: [{ lat: 34.101, lng: -118.337 }, { lat: 34.104, lng: -118.33 }] },
    { task_id: 'prog_fig', poi_name: 'Figueroa St', progress_status: 'collected', polyline: [{ lat: 34.038, lng: -118.278 }, { lat: 34.041, lng: -118.272 }] },
    { task_id: 'prog_broadway', poi_name: 'Broadway DTLA', progress_status: 'completed', polyline: [{ lat: 34.047, lng: -118.252 }, { lat: 34.05, lng: -118.245 }] },
    { task_id: 'prog_sunset', poi_name: 'Sunset Blvd', progress_status: 'rejected', polyline: [{ lat: 34.098, lng: -118.326 }, { lat: 34.1, lng: -118.32 }] },
  ],
  selectedProgressId: null,
  preconditionFixReturn: false,
  settings: {
    autoPosition: true,
    autoUpdates: true,
    simulateFailedChecks: false,
  },
};

function getTaskLifecycle(t) {
  if (t.display_state === 'completed_local') return 'completed';
  if (t.display_state === 'claimed') return 'claimed';
  return 'unclaimed';
}

function getTaskDispatch(t) {
  return t.dispatch_round === 'second' ? 'second' : 'first';
}

function getTaskPriority(t) {
  return t.priority === 'high' ? 'high' : 'normal';
}

/** Line color per icon status design spec */
function getTaskLineColor(t) {
  const lc = getTaskLifecycle(t);
  if (lc === 'completed') return COLORS.completed;
  if (lc === 'claimed') return COLORS.claimed;
  return getTaskPriority(t) === 'high' ? COLORS.high : COLORS.unclaimed;
}

function getTaskLineStyle(t, isSelected) {
  const high = getTaskPriority(t) === 'high';
  const driving = ['navigating', 'recording', 'completing'].includes(state.mapMode);
  const activeDrive =
    driving && t.task_id === state.selectedTaskId && getTaskLifecycle(t) !== 'completed';
  if (activeDrive) {
    return {
      color: '#F59E0B',
      weight: isSelected ? 10 : 8,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: null,
    };
  }
  return {
    color: getTaskLineColor(t),
    weight: isSelected ? 10 : 7,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: high ? null : '12 10',
  };
}

function renderCaptureControls() {
  const el = document.getElementById('capture-controls');
  if (!el) return;

  if (state.mapMode === 'navigating') {
    el.innerHTML =
      '<span class="capture-spacer" aria-hidden="true"></span>' +
      '<button type="button" class="capture-record" onclick="App.tapRecord()" aria-label="Start recording"></button>' +
      '<button type="button" class="capture-complete is-disabled" disabled aria-label="Complete">✓</button>';
    return;
  }

  if (state.mapMode === 'recording') {
    el.innerHTML =
      '<button type="button" class="capture-cancel" disabled aria-label="Cancel">×</button>' +
      '<button type="button" class="capture-stop" onclick="App.stopRecording()" aria-label="Stop recording"></button>' +
      '<button type="button" class="capture-complete is-disabled" disabled aria-label="Complete">✓</button>';
    return;
  }

  if (state.mapMode === 'completing') {
    el.innerHTML =
      '<button type="button" class="capture-cancel" disabled aria-label="Cancel">×</button>' +
      '<button type="button" class="capture-stop is-disabled" disabled aria-label="Stopped"></button>' +
      '<button type="button" class="capture-complete" onclick="App.completeTask()" aria-label="Complete task">✓</button>';
  }
}

const REVIEW_STATUS_LABELS = {
  awaiting: 'Submitted - Awaiting Review',
  rejected: 'Submitted - Review Failed',
  approved: 'Submitted - Review Successful',
};

function mapPinTargetIcon() {
  return (
    '<span class="map-pin-target" aria-hidden="true">' +
    '<span class="map-pin-target-outer"></span>' +
    '<span class="map-pin-target-inner"></span>' +
    '</span>'
  );
}

function mapPinCheckIcon(color) {
  return (
    '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">' +
    `<path d="M5 10.5 8.5 14 15 6.5" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` +
    '</svg>'
  );
}

function mapPinPersonIcon(color) {
  return (
    '<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">' +
    `<circle cx="10" cy="6.5" r="3" fill="${color}"/>` +
    `<path d="M4.5 17c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>` +
    '</svg>'
  );
}

/**
 * Icon status design spec — 5 glyphs total:
 * 1. Claimed: single person (1st/2nd dispatch share the same icon)
 * 2. Unclaimed 1st: target
 * 3. Unclaimed 2nd: "2"
 * 4. Completed: check
 * High vs normal differs by fill/outline + line style, not by doubling people.
 */
function getTaskStartMarkerHtml(t) {
  const lc = getTaskLifecycle(t);
  const second = getTaskDispatch(t) === 'second';
  const high = getTaskPriority(t) === 'high';
  const shapeClass = high ? 'shape-square' : 'shape-circle';

  let headClass = '';
  let inner = '';

  if (lc === 'completed') {
    headClass = high ? 'tone-green' : 'tone-green-outline';
    inner = mapPinCheckIcon(high ? '#fff' : '#2ba471');
  } else if (lc === 'claimed') {
    headClass = high ? 'tone-orange' : 'tone-orange-outline';
    inner = mapPinPersonIcon(high ? '#fff' : '#f59e0b');
  } else if (second) {
    headClass = 'tone-blue-outline';
    inner = '<span class="map-pin-num">2</span>';
  } else {
    headClass = 'tone-blue-outline';
    inner = mapPinTargetIcon();
  }

  return (
    `<div class="map-pin-wrap">` +
    `<div class="map-pin-head ${shapeClass} ${headClass}">${inner}</div>` +
    `<div class="map-pin-stem"></div>` +
    `<div class="map-pin-anchor"></div>` +
    `</div>`
  );
}

function getTaskEndMarkerHtml(t) {
  const high = getTaskPriority(t) === 'high';
  if (high) return '<div class="map-end-square"></div>';
  return '<div class="map-end-circle"></div>';
}

function clearMapTaskLayers() {
  if (!state.map) return;
  Object.values(state.mapTaskLayers).forEach((layers) => {
    layers.line.remove();
    layers.start.remove();
    layers.end.remove();
  });
  state.mapTaskLayers = {};
}

function getTaskEndpoints(t) {
  if (t.start_point && t.end_point) return { start: t.start_point, end: t.end_point };
  const pl = t.polyline;
  return { start: pl[0], end: pl[pl.length - 1] };
}

function routeCacheKey(start, end) {
  return `${start.lat.toFixed(5)},${start.lng.toFixed(5)}->${end.lat.toFixed(5)},${end.lng.toFixed(5)}`;
}

function getTaskLatLngs(t) {
  const pts = t.routedPolyline || t.polyline;
  return pts.map((p) => [p.lat, p.lng]);
}

async function fetchRoadRoute(start, end) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}` +
    '?overview=full&geometries=geojson';
  const res = await fetch(url);
  if (!res.ok) throw new Error('route request failed');
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates?.length) {
    throw new Error('no route found');
  }
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
}

function ensureTaskRoutes(tasks, onUpdate) {
  tasks.forEach((t) => {
    const { start, end } = getTaskEndpoints(t);
    const key = routeCacheKey(start, end);

    if (state.routeCache[key]) {
      t.routedPolyline = state.routeCache[key];
      return;
    }
    if (state.routePending.has(key)) return;

    state.routePending.add(key);
    fetchRoadRoute(start, end)
      .then((points) => {
        state.routeCache[key] = points;
        tasks.forEach((task) => {
          const ep = getTaskEndpoints(task);
          if (routeCacheKey(ep.start, ep.end) === key) task.routedPolyline = points;
        });
        onUpdate?.();
      })
      .catch(() => {})
      .finally(() => {
        state.routePending.delete(key);
      });
  });
}

let routeRefreshTimer;
function scheduleRouteRefresh(screen, fn) {
  clearTimeout(routeRefreshTimer);
  routeRefreshTimer = setTimeout(() => {
    if (state.screen === screen) fn({ skipFit: true });
  }, 120);
}

function renderTaskBadges(t) {
  const badges = [];
  if (t.priority === 'high') badges.push('<span class="task-tag task-tag-high">HIGH</span>');
  if (t.dispatch_round === 'second') badges.push('<span class="task-tag task-tag-second">2ND</span>');
  if (!badges.length) return '';
  return `<div class="task-sheet-tags">${badges.join('')}</div>`;
}

function filterTasksByMapFilters(tasks, filters) {
  return tasks.filter(
    (t) =>
      filters.lifecycle[getTaskLifecycle(t)] &&
      filters.dispatch[getTaskDispatch(t)] &&
      filters.priority[getTaskPriority(t)]
  );
}

function allDeviceChecksOk() {
  return Object.values(state.deviceChecks).every(Boolean);
}

function allPreconditionsOk() {
  return Object.values(state.preconditions).every(Boolean);
}

function applyFailedChecks() {
  state.deviceChecks = { gps: false, bluetooth: false, network: false, storage: false };
  state.preconditionGps = { authorized: false, distanceOk: false };
  state.preconditions = { bluetooth: false, network: false, gps: false, storage: false };
}

function applyReadyChecks() {
  state.deviceChecks = { gps: true, bluetooth: true, network: true, storage: true };
  state.preconditionGps = { authorized: true, distanceOk: true };
  state.preconditions = { bluetooth: true, network: true, gps: true, storage: true };
}

function syncPreconditionsFromDevice() {
  state.preconditions.bluetooth = state.deviceChecks.bluetooth;
  state.preconditions.network = state.deviceChecks.network;
  state.preconditions.storage = state.deviceChecks.storage;
  if (state.deviceChecks.gps) {
    state.preconditionGps.authorized = true;
    state.preconditionGps.distanceOk = checkTaskDistanceOk();
  } else {
    state.preconditionGps = { authorized: false, distanceOk: false };
  }
  syncGpsPrecondition();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('toast--success');
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2800);
}

function toastSuccess(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('toast--success', 'show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show', 'toast--success'), 2800);
}

function computeStats() {
  return { done: 12, todo: 150, passed: 10 };
}

function canUndoRecord(r) {
  return ['pending', 'reviewing'].includes(r.status);
}

function getRecordStatusClass(status) {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'pending';
}

function formatRecordDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getRecordStatusLabel(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function getRecordStatusTone(status) {
  if (status === 'approved') return ['#dcfce7', '#15803d'];
  if (status === 'rejected') return ['#fee2e2', '#dc2626'];
  return ['#fef3c7', '#a16207'];
}

function groupRecordsByDay(records) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const groups = [];
  const today = [];
  const yesterday = [];
  const earlier = [];

  records.forEach((r) => {
    const d = new Date(r.shot_at);
    if (d >= startOfToday) today.push(r);
    else if (d >= startOfYesterday) yesterday.push(r);
    else earlier.push(r);
  });

  if (today.length) groups.push({ label: 'Today', items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (earlier.length) groups.push({ label: 'Earlier', items: earlier });
  return groups;
}

function renderMonthCalendar(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const title = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let cells = '';
  for (let i = 0; i < firstDow; i += 1) {
    cells += '<span class="cal-cell cal-cell--empty" aria-hidden="true"></span>';
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const selected = state.taskDateSelected === iso;
    cells += `<button type="button" class="cal-cell cal-cell--day${selected ? ' is-selected' : ''}" onclick="App.selectTaskDate('${iso}')">${day}</button>`;
  }

  return (
    `<section class="calendar-block">` +
    `<h4 class="calendar-title">${title}</h4>` +
    `<div class="calendar-grid">${cells}</div>` +
    `</section>`
  );
}

function renderTaskDateCalendar() {
  const container = document.getElementById('task-date-calendar');
  if (!container) return;
  const now = new Date();
  const months = [
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 1),
  ];
  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    .map((d) => `<span>${d}</span>`)
    .join('');
  container.innerHTML =
    `<div class="calendar-weekdays">${weekdays}</div>` +
    months.map((month) => renderMonthCalendar(month)).join('');
}

function filterRecordsForTasksPage() {
  let rows = state.records.filter((r) => ['approved', 'pending', 'reviewing', 'rejected'].includes(r.status));
  if (state.taskStatusFilter !== 'all') {
    if (state.taskStatusFilter === 'pending') {
      rows = rows.filter((r) => ['pending', 'reviewing'].includes(r.status));
    } else {
      rows = rows.filter((r) => r.status === state.taskStatusFilter);
    }
  }
  if (state.taskDateSelected) {
    const selected = new Date(`${state.taskDateSelected}T00:00:00`);
    const next = new Date(selected);
    next.setDate(next.getDate() + 1);
    rows = rows.filter((r) => {
      const d = new Date(r.shot_at);
      return d >= selected && d < next;
    });
  } else if (state.taskDatePreset === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    rows = rows.filter((r) => new Date(r.shot_at) >= start);
  } else if (state.taskDatePreset === 'week') {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1));
    start.setHours(0, 0, 0, 0);
    rows = rows.filter((r) => new Date(r.shot_at) >= start);
  } else if (state.taskDatePreset === 'last7') {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    rows = rows.filter((r) => new Date(r.shot_at) >= start);
  } else if (state.taskDatePreset === 'month') {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    rows = rows.filter((r) => new Date(r.shot_at) >= start);
  }
  return rows;
}

function getAuditSteps(record) {
  const stage = record.audit_stage || 'submitted';
  return [
    { id: 'submitted', label: 'Submitted', state: 'done' },
    {
      id: 'reviewing',
      label: 'Reviewing',
      state: stage === 'reviewing' ? 'current' : stage === 'completed' ? 'done' : 'todo',
    },
    { id: 'completed', label: 'Completed', state: stage === 'completed' ? 'done' : 'todo' },
  ];
}

function settlementSummary() {
  const c = { reviewing: 0, approved: 0, rejected: 0, completed: 0, collected: 0 };
  state.progressTasks.forEach((t) => c[t.progress_status]++);
  const audit = c.reviewing + c.approved + c.rejected;
  return { ...c, passRate: audit ? Math.round((c.approved / audit) * 100) : 0 };
}

const App = {
  go(screen) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const map = {
      login: 'screen-login',
      precheck: 'screen-precheck',
      map: 'screen-map',
      tasks: 'screen-tasks',
      'task-detail': 'screen-task-detail',
      'progress-map': 'screen-progress-map',
      settings: 'screen-settings',
      version: 'screen-version',
    };
    document.getElementById(map[screen]).classList.add('active');
    state.screen = screen;
    document.getElementById('filter-sheet').classList.remove('show');
    document.getElementById('progress-layer-panel').classList.remove('show');

    if (screen === 'precheck') App.startPrecheckFlow();
    if (screen === 'map') {
      setTimeout(() => {
        if (!state.map) App.initMap();
        else state.map.invalidateSize();
        App.renderMapTasks();
        App.renderTaskSheet();
        App.updateMapChrome();
      }, 100);
    }
    if (screen === 'tasks') App.renderTaskList();
    if (screen === 'task-detail') App.renderTaskDetail();
    if (screen === 'settings') App.updateSettingsProfile();
    if (screen === 'version') App.syncSettingsToggles();
    if (screen === 'progress-map') {
      setTimeout(() => {
        if (!state.progressMap) App.initProgressMap();
        else state.progressMap.invalidateSize();
        App.renderProgressMap();
        App.renderSettlementPanel();
      }, 100);
    }
  },

  login() {
    const region = document.getElementById('login-region').value;
    const userId = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;

    if (!region) {
      App.showLoginError('Please select a region.');
      document.getElementById('login-region-wrap').classList.add('is-error');
      return;
    }
    if (!userId || !password) {
      App.showLoginError('Enter your user ID and password.');
      return;
    }

    const account = DEMO_ACCOUNTS.find(
      (a) =>
        a.region === region &&
        (a.userId === userId || a.displayName === userId) &&
        a.password === password
    );

    if (!account) {
      App.showLoginError('Invalid region, user ID, or password.');
      document.getElementById('login-user-wrap').classList.add('is-error');
      document.getElementById('login-pass-wrap').classList.add('is-error');
      return;
    }

    state.auth = {
      region: account.region,
      userId: account.userId,
      displayName: account.displayName,
    };
    App.clearLoginError();
    App.go('precheck');
  },

  initLoginForm() {
    const select = document.getElementById('login-region');
    LOGIN_REGIONS.forEach((code) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = code;
      select.appendChild(opt);
    });
    select.value = 'US';
    App.onRegionChange();
  },

  updateSettingsProfile() {
    const userId = state.auth?.userId || 'US-156';
    const nameEl = document.getElementById('settings-user-id');
    const logoutEl = document.getElementById('logout-user-id');
    if (nameEl) nameEl.textContent = userId;
    if (logoutEl) logoutEl.textContent = userId;
    App.syncSettingsToggles();
  },

  syncSettingsToggles() {
    const autoPos = document.getElementById('toggle-auto-position');
    const autoUpd = document.getElementById('toggle-auto-updates');
    const simulateFail = document.getElementById('toggle-simulate-failed-checks');
    if (autoPos) autoPos.checked = state.settings.autoPosition;
    if (autoUpd) autoUpd.checked = state.settings.autoUpdates;
    if (simulateFail) simulateFail.checked = state.settings.simulateFailedChecks;
  },

  onAutoPositionToggle(on) {
    state.settings.autoPosition = on;
    toast(on ? 'Auto-Position enabled' : 'Auto-Position disabled');
  },

  onAutoUpdatesToggle(on) {
    state.settings.autoUpdates = on;
    toast(on ? 'Auto Updates enabled' : 'Auto Updates disabled');
  },

  onSimulateFailedChecksToggle(on) {
    state.settings.simulateFailedChecks = on;
    if (on) {
      applyFailedChecks();
      toast('Precondition failures simulated');
    } else {
      applyReadyChecks();
      toast('All preconditions ready');
    }
    if (state.screen === 'map') App.updateMapChrome();
  },

  refreshSettings() {
    App.updateSettingsProfile();
    toast('Refreshed');
  },

  refreshVersion() {
    toast('This is the latest version');
  },

  onRegionChange() {
    const region = document.getElementById('login-region').value;
    const wrap = document.getElementById('login-region-wrap');
    const check = document.getElementById('region-check');
    const valid = !!region;
    wrap.classList.toggle('is-empty', !region);
    wrap.classList.toggle('is-valid', valid);
    check.classList.toggle('hidden', !valid);
    const account = DEMO_ACCOUNTS.find((a) => a.region === region);
    const userInput = document.getElementById('login-user');
    if (account && userInput && !userInput.dataset.edited) {
      userInput.value = account.displayName;
    }
    App.clearLoginError();
  },

  onPassInput() {
    const val = document.getElementById('login-pass').value;
    document.getElementById('login-clear').classList.toggle('hidden', !val);
    App.clearLoginError();
  },

  focusPass(focused) {
    document.getElementById('login-pass-wrap').classList.toggle('is-focused', focused);
  },

  clearLoginPass() {
    const input = document.getElementById('login-pass');
    input.value = '';
    input.type = 'password';
    document.getElementById('login-clear').classList.add('hidden');
    input.focus();
    App.clearLoginError();
  },

  showLoginError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.remove('hidden');
    document.getElementById('login-form').classList.add('has-error');
  },

  clearLoginError() {
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('login-form').classList.remove('has-error');
    document.getElementById('login-region-wrap').classList.remove('is-error');
    document.getElementById('login-user-wrap').classList.remove('is-error');
    document.getElementById('login-pass-wrap').classList.remove('is-error');
  },

  toggleLoginPass() {
    const input = document.getElementById('login-pass');
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  startPrecheckFlow() {
    if (state.precheckTimer) {
      clearTimeout(state.precheckTimer);
      state.precheckTimer = null;
    }
    state.precheckStep = 'location';
    state.selectedGopro = 'GoPro_1';
    state.deviceChecks = { gps: false, bluetooth: false, network: true, storage: true };
    state.preconditions = { bluetooth: false, network: true, gps: false, storage: true };
    state.preconditionGps = { authorized: false, distanceOk: false };
    document.querySelectorAll('#gopro-list .gopro-option').forEach((el, i) => {
      el.classList.toggle('selected', i === 0);
      const input = el.querySelector('input');
      if (input) input.checked = i === 0;
    });
    setTimeout(() => {
      App.initPrecheckMap();
      App.showPrecheckStep('location');
    }, 120);
  },

  initPrecheckMap() {
    if (state.precheckMap) {
      state.precheckMap.invalidateSize();
      return;
    }
    state.precheckMap = L.map('precheck-map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([48.8566, 2.3522], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(state.precheckMap);
  },

  showPrecheckStep(step) {
    state.precheckStep = step;
    document.querySelectorAll('.precheck-step').forEach((el) => el.classList.remove('show'));
    const target = document.getElementById(`precheck-step-${step}`);
    if (target) target.classList.add('show');
    if (state.precheckMap) setTimeout(() => state.precheckMap.invalidateSize(), 80);
  },

  precheckLocationAllow() {
    state.deviceChecks.gps = true;
    state.preconditionGps = { authorized: true, distanceOk: true };
    syncGpsPrecondition();
    App.showPrecheckStep('bluetooth');
  },

  precheckBluetoothNext() {
    state.deviceChecks.bluetooth = true;
    state.preconditions.bluetooth = true;
    App.precheckStartConnecting();
  },

  precheckBluetoothSkip() {
    if (state.precheckTimer) {
      clearTimeout(state.precheckTimer);
      state.precheckTimer = null;
    }
    App.go('map');
  },

  precheckStartConnecting() {
    App.showPrecheckStep('connecting');
    if (state.precheckTimer) clearTimeout(state.precheckTimer);
    state.precheckTimer = setTimeout(() => {
      state.precheckTimer = null;
      App.showPrecheckStep('select');
    }, 2200);
  },

  precheckSelectGopro(value) {
    state.selectedGopro = value;
    document.querySelectorAll('#gopro-list .gopro-option').forEach((el) => {
      el.classList.toggle('selected', el.querySelector('input')?.value === value);
    });
  },

  precheckGoproOk() {
    state.deviceChecks = { gps: true, bluetooth: true, network: true, storage: true };
    state.preconditionGps = { authorized: true, distanceOk: true };
    state.preconditions = { bluetooth: true, network: true, gps: true, storage: true };
    toast(`Connected to ${state.selectedGopro}`);
    App.go('map');
  },

  precheckGoproClose() {
    App.go('login');
  },

  renderPrecheck() {
    App.startPrecheckFlow();
  },

  refreshPrecheck() {
    App.startPrecheckFlow();
  },

  openCheckModal(id) {
    if (state.deviceChecks[id]) return;
    const check = DEVICE_CHECKS.find((c) => c.id === id);
    if (check) document.getElementById(check.modal).classList.add('show');
  },

  fixCheck(id) {
    state.deviceChecks[id] = true;
    if (id === 'bluetooth') state.preconditions.bluetooth = true;
    if (id === 'network') state.preconditions.network = true;
    if (id === 'storage') state.preconditions.storage = true;
    DEVICE_CHECKS.forEach((c) => {
      if (c.id === id) document.getElementById(c.modal).classList.remove('show');
    });
    App.renderPrecondition();
    App.updateMapChrome();
    if (state.preconditionFixReturn) {
      document.getElementById('modal-precondition').classList.add('show');
    }
    toast('Status updated');
  },

  confirmGpsAuth(mode) {
    App.closeModal('modal-gps-auth');
    if (mode === 'deny') {
      state.preconditionGps = { authorized: false, distanceOk: false };
      state.deviceChecks.gps = false;
    } else {
      state.preconditionGps.authorized = true;
      state.deviceChecks.gps = true;
      state.preconditionGps.distanceOk = state.settings.simulateFailedChecks
        ? false
        : checkTaskDistanceOk();
    }
    syncGpsPrecondition();
    App.renderPrecondition();
    App.updateMapChrome();
    if (state.preconditionFixReturn) {
      document.getElementById('modal-precondition').classList.add('show');
    }
  },

  refreshGpsDistance() {
    if (!state.preconditionGps.authorized) return;
    toast('Checking location…');
    setTimeout(() => {
      if (state.settings.simulateFailedChecks) {
        state.preconditionGps.distanceOk = true;
      } else {
        state.preconditionGps.distanceOk = checkTaskDistanceOk();
        if (!state.preconditionGps.distanceOk) {
          toast('Still too far from task start');
          return;
        }
      }
      syncGpsPrecondition();
      App.renderPrecondition();
      App.updateMapChrome();
      toastSuccess('Location meets task requirements');
    }, 700);
  },

  openStorageSettings() {
    App.closeModal('modal-ios-storage');
    document.getElementById('modal-precondition').classList.remove('show');
    document.getElementById('modal-storage-settings').classList.add('show');
  },

  returnFromStorageAlert() {
    App.closeModal('modal-ios-storage');
    if (state.preconditionFixReturn) {
      document.getElementById('modal-precondition').classList.add('show');
    }
  },

  closeStorageSettings() {
    document.getElementById('modal-storage-settings').classList.remove('show');
    if (state.preconditionFixReturn) {
      document.getElementById('modal-precondition').classList.add('show');
    }
  },

  confirmStorageFix() {
    state.deviceChecks.storage = true;
    state.preconditions.storage = true;
    document.getElementById('modal-storage-settings').classList.remove('show');
    App.renderPrecondition();
    App.updateMapChrome();
    if (state.preconditionFixReturn) {
      document.getElementById('modal-precondition').classList.add('show');
    }
    toastSuccess('Storage updated');
  },

  startCheck() {
    App.startPrecheckFlow();
  },

  closeModal(id) {
    document.getElementById(id).classList.remove('show');
    if (id === 'modal-precondition') state.preconditionFixReturn = false;
  },

  toggleStatusBar() {
    state.statusBarCollapsed = !state.statusBarCollapsed;
    const bar = document.getElementById('device-status-bar');
    const btn = document.getElementById('device-lens-btn');
    bar.classList.toggle('is-collapsed', state.statusBarCollapsed);
    btn.setAttribute('aria-expanded', String(!state.statusBarCollapsed));
  },

  updateMapChrome() {
    const topChrome = document.getElementById('map-top-chrome');
    const statusBar = document.getElementById('device-status-bar');
    const deviceDot = document.getElementById('device-dot');
    const deviceConn = document.getElementById('device-conn');
    const deviceBatt = document.getElementById('device-batt');
    const deviceBattWrap = document.getElementById('device-batt-wrap');
    const deviceSignal = document.getElementById('device-signal');
    const nav = document.getElementById('nav-banner');
    const speed = document.getElementById('speed-pill');
    const captureSheet = document.getElementById('capture-sheet');
    const mapFloats = document.getElementById('map-float-actions');
    const mapAlert = document.getElementById('map-alert');
    const sheet = document.getElementById('task-sheet');
    const mapRail = document.getElementById('map-rail');

    const driving = ['navigating', 'recording', 'completing'].includes(state.mapMode);

    topChrome.classList.toggle('hidden', driving);
    nav.classList.toggle('hidden', !driving);
    speed.classList.toggle('hidden', !driving);
    captureSheet.classList.toggle('hidden', !driving);
    mapFloats.classList.toggle('hidden', !driving);

    const hideSheet = driving || !state.selectedTaskId;
    sheet.classList.toggle('hidden', hideSheet);

    mapRail.classList.toggle('hidden', driving);

    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (t && driving) {
      document.getElementById('capture-title').textContent = t.poi_name;
    }

    if (driving) {
      renderCaptureControls();
      const time = formatTime(state.recSeconds);
      document.getElementById('capture-time').textContent = time;
      document.getElementById('capture-dot').classList.toggle('hidden', state.mapMode === 'navigating' && !state.recSeconds);
    }

    const showMemoryAlert =
      state.mapMode === 'recording' && state.recSeconds >= 497 && !state.mapAlertDismissed;
    mapAlert.classList.toggle('hidden', !showMemoryAlert);

    const showRest = state.mapMode === 'recording' && state.recSeconds >= 995;
    document.getElementById('map-float-rest').classList.toggle('hidden', !showRest);
    document.getElementById('map-float-over').classList.toggle('hidden', showRest);

    const deviceBattBolt = document.getElementById('device-batt-bolt');

    if (state.mapMode === 'recording') {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'REC';
      deviceBatt.textContent = '78';
      deviceBattWrap.className = 'device-batt-wrap warn has-bolt';
      statusBar.classList.remove('is-online');
      deviceSignal.dataset.level = '3';
    } else if (allPreconditionsOk()) {
      deviceDot.className = 'device-dot';
      deviceConn.textContent = 'CONNECTED';
      deviceBatt.textContent = '51';
      deviceBattWrap.className = 'device-batt-wrap connected has-bolt';
      statusBar.classList.add('is-online');
      deviceSignal.dataset.level = '5';
    } else {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'DISCONNECTED';
      deviceBatt.textContent = '14';
      deviceBattWrap.className = 'device-batt-wrap low';
      statusBar.classList.remove('is-online');
      deviceSignal.dataset.level = '2';
    }

    if (deviceBattBolt) {
      deviceBattBolt.classList.toggle('hidden', !deviceBattWrap.classList.contains('has-bolt'));
    }

    statusBar.classList.toggle('is-collapsed', state.statusBarCollapsed);

    if (driving) App.renderMapTasks({ skipFit: true });
  },

  tickRec() {
    state.recSeconds++;
    const t = formatTime(state.recSeconds);
    const captureTime = document.getElementById('capture-time');
    if (captureTime) captureTime.textContent = t;
    App.updateMapChrome();
  },

  initMap() {
    state.map = L.map('map', { zoomControl: false }).setView([34.06, -118.32], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(state.map);
    App.renderMapTasks();
  },

  initProgressMap() {
    state.progressMap = L.map('progress-map', { zoomControl: false }).setView([34.06, -118.32], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(state.progressMap);
    App.renderProgressMap();
  },

  renderMapTasks(options = {}) {
    if (!state.map) return;
    clearMapTaskLayers();

    const visible = filterTasksByMapFilters(state.mapTasks, state.mapFilters);
    const driving = ['navigating', 'recording', 'completing'].includes(state.mapMode);
    const inReview = state.mapMode === 'review';
    let tasksToDraw = visible;

    if (driving && state.selectedTaskId) {
      tasksToDraw = visible.filter((t) => t.task_id === state.selectedTaskId);
    } else if (inReview && state.selectedTaskId) {
      tasksToDraw = visible.filter((t) => t.task_id === state.selectedTaskId);
    }

    ensureTaskRoutes(tasksToDraw, () => {
      scheduleRouteRefresh('map', (opts) => App.renderMapTasks(opts));
    });

    tasksToDraw.forEach((t) => {
      const latlngs = getTaskLatLngs(t);
      const endpoints = getTaskEndpoints(t);
      const isSelected = t.task_id === state.selectedTaskId;
      const line = L.polyline(latlngs, getTaskLineStyle(t, isSelected)).addTo(state.map);
      line.on('click', () => App.selectTask(t.task_id));

      const startMarker = L.marker([endpoints.start.lat, endpoints.start.lng], {
        icon: L.divIcon({
          className: 'map-pin-marker',
          html: getTaskStartMarkerHtml(t),
          iconSize: [34, 52],
          iconAnchor: [17, 52],
        }),
        interactive: false,
      }).addTo(state.map);

      const endMarker = L.marker([endpoints.end.lat, endpoints.end.lng], {
        icon: L.divIcon({
          className: 'map-end-marker',
          html: getTaskEndMarkerHtml(t),
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
        interactive: false,
      }).addTo(state.map);

      state.mapTaskLayers[t.task_id] = { line, start: startMarker, end: endMarker };
    });

    const selected = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);

    if (!options.skipFit) {
      if (selected) {
        state.map.fitBounds(L.latLngBounds(getTaskLatLngs(selected)), { padding: [60, 40], animate: true });
      } else if (tasksToDraw.length) {
        const bounds = L.latLngBounds(tasksToDraw.flatMap((t) => getTaskLatLngs(t)));
        state.map.fitBounds(bounds, { padding: [40, 40], animate: true });
      }
    }
  },

  renderProgressMap(options = {}) {
    if (!state.progressMap) return;
    Object.values(state.progressPolylines).forEach((p) => state.progressMap.removeLayer(p));
    state.progressPolylines = {};

    const visible = state.progressTasks.filter((t) => state.progressLayers[t.progress_status]);

    ensureTaskRoutes(visible, () => {
      scheduleRouteRefresh('progress-map', (opts) => App.renderProgressMap(opts));
    });

    visible.forEach((t) => {
      const latlngs = getTaskLatLngs(t);
      const line = L.polyline(latlngs, {
        color: COLORS.progress[t.progress_status],
        weight: t.task_id === state.selectedProgressId ? 8 : 5,
        opacity: 0.9,
      }).addTo(state.progressMap);
      line.on('click', () => {
        state.selectedProgressId = t.task_id;
        App.renderProgressMap();
        App.renderSettlementPanel();
      });
      state.progressPolylines[t.task_id] = line;
    });

    if (!options.skipFit && visible.length) {
      const bounds = L.latLngBounds(visible.flatMap((t) => getTaskLatLngs(t)));
      state.progressMap.fitBounds(bounds, { padding: [30, 30] });
    }
  },

  selectTask(taskId) {
    if (['navigating', 'recording', 'completing'].includes(state.mapMode)) return;
    state.selectedTaskId = taskId;
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
  },

  closeTaskSheet() {
    state.selectedTaskId = null;
    if (state.mapMode === 'review') state.mapMode = 'idle';
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
  },

  renderTaskSheet() {
    const sheet = document.getElementById('task-sheet');
    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (!t) {
      sheet.classList.add('hidden');
      return;
    }
    sheet.classList.remove('hidden');

    const claimed = t.display_state === 'claimed' && t.claimed_by_me;
    const completed = t.display_state === 'completed_local';
    const inReview = state.mapMode === 'review' || completed;
    const tags = renderTaskBadges(t);

    const distanceActions = `<button type="button" class="task-icon-btn" onclick="toast('Opening Google Maps…')" aria-label="Navigate">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 11 18-8-8 18-2-7-8-3Z" stroke-linejoin="round"/></svg>
        </button>
        <button type="button" class="task-icon-btn" onclick="toast('Address copied')" aria-label="Copy address">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="14" rx="2"/><path d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>`;

    let actions = '';
    if (inReview) {
      const status = t.review_status || 'awaiting';
      const cls =
        status === 'rejected' ? 'is-failed' : status === 'approved' ? 'is-success' : '';
      actions = `<button type="button" class="btn btn-submitted ${cls}" disabled>${REVIEW_STATUS_LABELS[status] || REVIEW_STATUS_LABELS.awaiting}</button>`;
    } else if (claimed) {
      actions = `<div class="task-sheet-actions split">
        <button type="button" class="task-release-btn" onclick="App.releaseTask('${t.task_id}')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 5 18 12 12 19 6 12Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <span>Release</span>
        </button>
        <button class="btn btn-success task-sheet-begin" onclick="App.openBegin()">Begin</button>
      </div>`;
    } else {
      actions = `<button class="btn btn-primary task-sheet-accept" onclick="App.acceptTask('${t.task_id}')">Accept</button>`;
    }

    sheet.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="task-sheet-head">
        ${tags || '<span></span>'}
        <button type="button" class="task-sheet-close" onclick="App.closeTaskSheet()" aria-label="Close">×</button>
      </div>
      <h2 class="task-sheet-title">${t.poi_name}</h2>
      <p class="task-sheet-meta">${t.distance_from_user_km} kilometers away from you | ${t.poi_address}</p>
      <div class="task-distance-row">
        <span class="task-distance-pin" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Z" fill="#1a66ff"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>
        </span>
        <div class="task-distance-track">
          <div class="task-distance-line-wrap">
            <span class="task-distance-line" aria-hidden="true"></span>
            <span class="task-distance-value">${t.distance_km}km</span>
          </div>
        </div>
        <div class="task-distance-actions">
          ${distanceActions}
        </div>
      </div>
      ${actions}
    `;
  },

  releaseTask(id) {
    const t = state.mapTasks.find((x) => x.task_id === id);
    if (!t || !t.claimed_by_me) return;
    t.display_state = 'unclaimed';
    t.claimed_by_me = false;
    App.renderMapTasks();
    App.renderTaskSheet();
    toast('Task released');
  },

  acceptTask(id) {
    const t = state.mapTasks.find((x) => x.task_id === id);
    if (t) {
      t.display_state = 'claimed';
      t.claimed_by_me = true;
      App.renderMapTasks();
      App.renderTaskSheet();
      toast('Task accepted');
    }
  },

  openBegin() {
    if (state.skipSafety) {
      App.openPrecondition();
      return;
    }
    document.getElementById('modal-safety').classList.add('show');
  },

  confirmSafety() {
    if (document.getElementById('skip-safety').checked) state.skipSafety = true;
    App.closeModal('modal-safety');
    App.openPrecondition();
  },

  openPrecondition() {
    if (state.settings.simulateFailedChecks) {
      applyFailedChecks();
    } else {
      syncPreconditionsFromDevice();
    }
    App.renderPrecondition();
    App.updateMapChrome();
    document.getElementById('modal-precondition').classList.add('show');
  },

  renderPrecondition() {
    document.getElementById('precondition-rows').innerHTML = PRECONDITION_ROWS.map((row) => {
      const ok = state.preconditions[row.id];
      return (
        `<div class="pre-card ${ok ? 'is-ok' : 'is-err'}">` +
        `<span class="pre-card-icon">${preconditionRowIcon(row.icon)}</span>` +
        `<div class="pre-card-body"><strong>${row.title}</strong><span class="pre-card-sub">${getPreconditionSubtitle(row)}</span></div>` +
        getPreconditionAction(row) +
        `</div>`
      );
    }).join('');

    const btn = document.getElementById('btn-precondition-go');
    const ready = allPreconditionsOk();
    btn.disabled = !ready;
    btn.classList.toggle('disabled', !ready);
  },

  fixPrecondition(id) {
    const modals = {
      bluetooth: 'modal-bluetooth',
      network: 'modal-network',
      gps: 'modal-gps-auth',
      storage: 'modal-ios-storage',
    };
    const modalId = modals[id];
    if (!modalId) return;
    state.preconditionFixReturn = true;
    document.getElementById('modal-precondition').classList.remove('show');
    document.getElementById(modalId).classList.add('show');
  },

  preconditionGo() {
    if (!allPreconditionsOk()) return;
    state.preconditionFixReturn = false;
    App.closeModal('modal-precondition');
    state.mapMode = 'navigating';
    state.recSeconds = 0;
    state.mapAlertDismissed = false;
    state.captureRestMode = false;
    App.renderMapTasks({ skipFit: true });
    App.renderTaskSheet();
    App.updateMapChrome();
    toast('Navigate to route start');
  },

  tapRecord() {
    state.mapMode = 'recording';
    if (!state.recSeconds) state.recSeconds = 0;
    clearInterval(state.recInterval);
    state.recInterval = setInterval(App.tickRec, 1000);
    App.updateMapChrome();
    toast('Recording started');
  },

  stopRecording() {
    if (state.mapMode !== 'recording') return;
    state.mapMode = 'completing';
    clearInterval(state.recInterval);
    App.updateMapChrome();
  },

  completeTask() {
    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (!t || state.mapMode !== 'completing') return;
    t.display_state = 'completed_local';
    t.review_status = 'awaiting';
    state.mapMode = 'review';
    clearInterval(state.recInterval);
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    toast('Task submitted for review');
  },

  exitCapture() {
    clearInterval(state.recInterval);
    state.mapMode = 'idle';
    state.recSeconds = 0;
    state.mapAlertDismissed = false;
    state.captureRestMode = false;
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    toast('Capture cancelled');
  },

  dismissMapAlert() {
    state.mapAlertDismissed = true;
    document.getElementById('map-alert').classList.add('hidden');
  },

  toggleCaptureRest() {
    state.captureRestMode = !state.captureRestMode;
    toast(state.captureRestMode ? 'Over — paused segment' : 'Over — resumed');
  },

  openLogoutModal() {
    App.updateSettingsProfile();
    document.getElementById('modal-logout').classList.add('show');
  },

  logout() {
    App.closeModal('modal-logout');
    state.selectedTaskId = null;
    state.mapMode = 'idle';
    state.auth = null;
    clearInterval(state.recInterval);
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-region').value = '';
    App.onRegionChange();
    App.onPassInput();
    App.clearLoginError();
    App.go('login');
    toast('Logged out');
  },

  renderFilterSheet() {
    const draft = state.filterDraft || state.mapFilters;
    const sections = [
      {
        label: 'Task status',
        group: 'lifecycle',
        chips: [
          { id: 'unclaimed', label: 'Open' },
          { id: 'claimed', label: 'Claimed' },
          { id: 'completed', label: 'Done' },
        ],
      },
      {
        label: 'Dispatch',
        group: 'dispatch',
        chips: [
          { id: 'first', label: '1st dispatch' },
          { id: 'second', label: '2nd dispatch' },
        ],
      },
      {
        label: 'Priority',
        group: 'priority',
        chips: [
          { id: 'normal', label: 'Normal' },
          { id: 'high', label: 'High priority' },
        ],
      },
    ];

    document.getElementById('filter-sheet-body').innerHTML = sections
      .map(
        (sec) => `
      <div class="filter-section">
        <div class="filter-section-label">${sec.label.toUpperCase()}</div>
        <div class="filter-chips-row">
          ${sec.chips
            .map(
              (c) => `<button type="button" class="filter-chip-btn ${draft[sec.group][c.id] ? 'on' : ''}"
                onclick="App.toggleFilterChip('${sec.group}','${c.id}')">${c.label}</button>`
            )
            .join('')}
        </div>
      </div>`
      )
      .join('');
  },

  openFilterSheet() {
    state.filterDraft = JSON.parse(JSON.stringify(state.mapFilters));
    App.renderFilterSheet();
    document.getElementById('filter-sheet').classList.add('show');
  },

  closeFilterSheet() {
    document.getElementById('filter-sheet').classList.remove('show');
    state.filterDraft = null;
  },

  toggleFilterChip(group, id) {
    if (!state.filterDraft) state.filterDraft = JSON.parse(JSON.stringify(state.mapFilters));
    state.filterDraft[group][id] = !state.filterDraft[group][id];
    App.renderFilterSheet();
  },

  resetFilterDraft() {
    state.filterDraft = JSON.parse(JSON.stringify(DEFAULT_MAP_FILTERS));
    App.renderFilterSheet();
  },

  applyFilters() {
    if (state.filterDraft) state.mapFilters = JSON.parse(JSON.stringify(state.filterDraft));
    App.closeFilterSheet();
    App.renderMapTasks();
    toast('Filters applied');
  },

  toggleProgressLayers() {
    const panel = document.getElementById('progress-layer-panel');
    if (panel.classList.contains('show')) {
      panel.classList.remove('show');
      return;
    }
    panel.innerHTML = `<strong style="display:block;margin-bottom:12px">Progress layers</strong>`;
    PROGRESS_LAYERS.forEach((l) => {
      const row = document.createElement('label');
      row.className = 'layer-row';
      row.innerHTML = `<input type="checkbox" ${state.progressLayers[l.id] ? 'checked' : ''} />
        <span class="swatch" style="background:${COLORS.progress[l.id]}"></span>${l.label}`;
      row.querySelector('input').onchange = (e) => {
        state.progressLayers[l.id] = e.target.checked;
        App.renderProgressMap();
        App.renderSettlementPanel();
      };
      panel.appendChild(row);
    });
    panel.classList.add('show');
  },

  locateUser() {
    if (state.map) state.map.setView([34.0522, -118.2915], 14);
    toast('Centered on your location');
  },

  zoomMap(dir) {
    if (state.map) state.map.setZoom(state.map.getZoom() + dir);
  },

  renderTaskList() {
    const stats = computeStats();
    document.getElementById('tasks-summary').innerHTML = `
      <div class="summary-item blue"><strong>${stats.done}</strong><span>DONE</span></div>
      <div class="summary-item"><strong>${stats.todo}</strong><span>TO DO</span></div>
      <div class="summary-item red"><strong>${stats.passed}</strong><span>PASSED</span></div>`;

    document.getElementById('task-date-filter-label').textContent = state.taskDateLabel;
    document.getElementById('task-status-filter-label').textContent =
      state.taskStatusFilter === 'all'
        ? 'Status'
        : state.taskStatusFilter.charAt(0).toUpperCase() + state.taskStatusFilter.slice(1);

    const filtered = filterRecordsForTasksPage();
    const groups = groupRecordsByDay(filtered);

    if (!groups.length) {
      document.getElementById('task-list').innerHTML =
        '<div class="task-empty">No tasks match your filters.</div>';
      return;
    }

    document.getElementById('task-list').innerHTML = groups
      .map(
        (group) => `
        <section class="task-day-group">
          <h3 class="task-day-label">${group.label}</h3>
          ${group.items.map((r) => App.renderTaskCardHtml(r)).join('')}
        </section>`
      )
      .join('');
  },

  renderTaskCardHtml(r) {
    const [bg, fg] = getRecordStatusTone(r.status);
    const label = getRecordStatusLabel(r.status);
    const title = r.mapping_title || `${r.title} Mapping`;
    const canUndo = canUndoRecord(r);
    const copyIcon =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="14" rx="2"/><path d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
    const undoIcon =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 14 4 9l5-5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 20v-7a4 4 0 00-4-4H4" stroke-linecap="round"/></svg>';

    return `<article class="task-media-card" onclick="App.openTaskDetail('${r.task_id}')">
      <div class="task-media-card-top">
        <div class="task-media-thumb task-media-thumb--${r.thumb || 'street'}"></div>
        <span class="task-media-meta-pill">${r.duration} | ${r.size}</span>
        <div class="task-media-actions">
          <button type="button" class="task-media-action" onclick="event.stopPropagation();App.copyTicketId('${r.ticket_id || r.task_id}')" aria-label="Copy">${copyIcon}</button>
          ${canUndo ? `<button type="button" class="task-media-action" onclick="event.stopPropagation();App.promptUndo('${r.task_id}')" aria-label="Undo">${undoIcon}</button>` : ''}
        </div>
      </div>
      <div class="task-media-card-body">
        <div class="task-media-card-head">
          <h4>${title}</h4>
          <span class="status-badge status-badge--${getRecordStatusClass(r.status)}" style="background:${bg};color:${fg}">${label}</span>
        </div>
        <p class="task-media-time">${formatRecordDate(r.shot_at)}</p>
      </div>
    </article>`;
  },

  refreshTaskList() {
    App.renderTaskList();
    toast('Refreshed');
  },

  openTaskDetail(taskId) {
    state.selectedRecordId = taskId;
    App.go('task-detail');
  },

  renderTaskDetail() {
    const el = document.getElementById('task-detail-body');
    const r = state.records.find((x) => x.task_id === state.selectedRecordId);
    if (!r) {
      el.innerHTML = '<div class="task-empty">Task not found.</div>';
      return;
    }

    const steps = getAuditSteps(r);
    const tags = (r.tags || [])
      .map((tag) => `<span class="task-detail-tag">${tag}</span>`)
      .join('');
    const canUndo = canUndoRecord(r);

    const stepper = steps
      .map((step, index) => {
        const block =
          `<div class="audit-step audit-step--${step.state}">` +
          `<div class="audit-step-dot">${step.state === 'done' ? '✓' : step.state === 'current' ? '●' : ''}</div>` +
          `<span>${step.label}</span></div>`;
        if (index < steps.length - 1) return block + '<div class="audit-step-line"></div>';
        return block;
      })
      .join('');

    el.innerHTML = `
      <section class="audit-progress">
        <div class="audit-progress-label">AUDIT PROGRESS</div>
        <div class="audit-steps">${stepper}</div>
      </section>
      <section class="ticket-row">
        <div class="ticket-id">
          <strong>${r.ticket_id || r.task_id}</strong>
          <button type="button" class="ticket-copy" onclick="App.copyTicketId('${r.ticket_id || r.task_id}')" aria-label="Copy ID">⎘</button>
        </div>
        <button type="button" class="ticket-bell" aria-label="Notifications">🔔</button>
      </section>
      <section class="task-detail-info">
        <h3 class="task-detail-title">${r.mapping_title || `${r.title} Mapping`}</h3>
        <div class="task-detail-tags">${tags}</div>
        <p class="task-detail-address">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Z" fill="#1a66ff"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>
          ${r.address || r.sector}
        </p>
      </section>
      <div class="task-detail-preview task-media-thumb--${r.thumb || 'street'}"></div>
      ${
        canUndo
          ? `<button type="button" class="btn btn-outline task-detail-undo" onclick="App.promptUndo('${r.task_id}')">Undo submission</button>`
          : ''
      }
    `;
  },

  copyTicketId(id) {
    navigator.clipboard?.writeText(id);
    toast('Copied ID');
  },

  promptUndo(taskId) {
    state.undoTaskId = taskId;
    document.getElementById('modal-undo').classList.add('show');
    document.getElementById('undo-confirm-btn').onclick = () => App.confirmUndo();
  },

  openTaskStatusFilter() {
    const options = [
      { id: 'all', label: 'ALL' },
      { id: 'pending', label: 'Pending' },
      { id: 'approved', label: 'Approved' },
      { id: 'rejected', label: 'Rejected' },
    ];
    document.getElementById('task-status-options').innerHTML = options
      .map(
        (opt) =>
          `<button type="button" class="task-status-option ${state.taskStatusFilter === opt.id ? 'is-active' : ''}" onclick="App.setTaskStatusFilter('${opt.id}')">${opt.label}</button>`
      )
      .join('');
    document.getElementById('modal-task-status').classList.add('show');
  },

  setTaskStatusFilter(id) {
    state.taskStatusFilter = id;
    App.closeModal('modal-task-status');
    App.renderTaskList();
  },

  openTaskDateFilter() {
    renderTaskDateCalendar();
    App.syncTaskDatePresets();
    document.getElementById('modal-task-date').classList.add('show');
  },

  syncTaskDatePresets() {
    document.querySelectorAll('.date-preset-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.preset === state.taskDatePreset && !state.taskDateSelected);
    });
  },

  selectTaskDate(iso) {
    state.taskDateSelected = iso;
    state.taskDatePreset = 'custom';
    state.taskDateLabel = new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    renderTaskDateCalendar();
    App.syncTaskDatePresets();
    App.renderTaskList();
  },

  applyTaskDatePreset(preset) {
    const labels = {
      all: 'Date',
      today: 'Today',
      week: 'This week',
      last7: 'Last 7 days',
      month: 'This month',
    };
    state.taskDateSelected = null;
    state.taskDatePreset = preset === 'last7' ? 'last7' : preset;
    state.taskDateLabel = labels[preset] || 'Date';
    App.syncTaskDatePresets();
    renderTaskDateCalendar();
    App.renderTaskList();
    App.closeModal('modal-task-date');
  },

  setTaskFilter(id) {
    state.taskFilter = id;
    state.taskStatusFilter = id === 'all' ? 'all' : id;
    App.renderTaskList();
  },

  onTaskCardClick(taskId) {
    App.openTaskDetail(taskId);
  },

  openCardMenu(event, taskId, status) {
    const dd = document.getElementById('card-dropdown');
    const canUndo = canUndoRecord({ status });
    dd.innerHTML = `<div class="dropdown-item danger ${canUndo ? '' : 'disabled'}" id="undo-item">Undo</div>`;
    const rect = event.target.getBoundingClientRect();
    dd.style.top = `${rect.bottom + 4}px`;
    dd.style.left = `${rect.right - 140}px`;
    dd.classList.add('show');
    if (canUndo) {
      document.getElementById('undo-item').onclick = () => {
        dd.classList.remove('show');
        App.promptUndo(taskId);
      };
    }
    setTimeout(() => {
      document.addEventListener('click', () => dd.classList.remove('show'), { once: true });
    }, 0);
  },

  confirmUndo() {
    const idx = state.records.findIndex((x) => x.task_id === state.undoTaskId);
    if (idx >= 0 && canUndoRecord(state.records[idx])) {
      state.records.splice(idx, 1);
      toastSuccess('Deleted successful');
    }
    App.closeModal('modal-undo');
    App.renderTaskList();
    if (state.screen === 'task-detail') App.go('tasks');
  },

  renderSettlementPanel() {
    const s = settlementSummary();
    const sel = state.progressTasks.find((t) => t.task_id === state.selectedProgressId);

    const chips = SETTLEMENT_BOTTOM.map((key) => {
      const on = state.progressLayers[key];
      const opt = PROGRESS_LAYERS.find((l) => l.id === key);
      return `<button class="filter-chip ${on ? 'on' : 'off'}" style="border-color:${COLORS.progress[key]}"
        onclick="App.toggleSettlementFilter('${key}')">
        <div class="dot" style="background:${COLORS.progress[key]}"></div>
        <strong>${s[key]}</strong>
        <span>${opt.label}</span>
      </button>`;
    }).join('');

    document.getElementById('settlement-panel').innerHTML = `
      <div class="sheet-handle"></div>
      <strong>Settlement progress</strong>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">Current settlement cycle</div>
      <div class="payout-row">
        <div class="payout-box"><span>Pending payout</span><strong>$186.40</strong></div>
        <div class="payout-box"><span>Paid this cycle</span><strong class="paid">$420.00</strong></div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${s.passRate}%"></div></div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:6px">${s.approved} approved · ${s.passRate}% pass rate</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:14px;margin-bottom:8px">Audit status</div>
      <div class="filter-chips">${chips}</div>
      ${
        sel
          ? `<div style="margin-top:10px;padding:12px;background:var(--primary-soft);border-radius:12px">
          <strong>${sel.poi_name}</strong>
          <div style="font-size:12px;color:var(--primary);margin-top:4px">${sel.progress_status}</div>
        </div>`
          : ''
      }`;
  },

  toggleSettlementFilter(key) {
    state.progressLayers[key] = !state.progressLayers[key];
    App.renderProgressMap();
    App.renderSettlementPanel();
  },
};

document.addEventListener('click', (e) => {
  const sheet = document.getElementById('filter-sheet');
  if (sheet.classList.contains('show') && e.target === sheet) App.closeFilterSheet();
  if (!e.target.closest('.layer-panel') && !e.target.closest('.layer-fab')) {
    document.getElementById('progress-layer-panel').classList.remove('show');
  }
});

window.toast = toast;
window.App = App;
App.initLoginForm();

const bootParams = new URLSearchParams(location.search);
if (bootParams.get('checks') === 'fail' || bootParams.get('fail') === '1') {
  state.settings.simulateFailedChecks = true;
  applyFailedChecks();
}
if (bootParams.get('demo') === 'map') {
  if (!state.settings.simulateFailedChecks) applyReadyChecks();
  App.go('map');
}
