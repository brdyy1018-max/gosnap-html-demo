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

const BOTTOM_NAV_SCREENS = ['map', 'tasks', 'settings', 'daily-summary'];
const BOTTOM_NAV_TAB_FOR_SCREEN = {
  map: 'map',
  tasks: 'tasks',
  'daily-summary': 'tasks',
  settings: 'settings',
};

/** Demo credentials — user ID + password must match */
const DEMO_ACCOUNTS = [
  { region: 'US', userId: 'US-156', password: 'demo123', displayName: 'User Wang' },
  { region: 'UK', userId: 'UK-088', password: 'demo123', displayName: 'User Smith' },
  { region: 'SG', userId: 'SG-042', password: 'demo123', displayName: 'User Tan' },
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
  },
  {
    id: 'storage',
    title: 'Storage Space',
    icon: 'storage',
    ok: 'Storage available',
    err: 'Insufficient storage space',
  },
];

const DEVICE_CHECKS = [
  { id: 'gps', icon: '📍', title: 'GPS Positioning', modal: 'modal-location' },
  { id: 'bluetooth', icon: '📶', title: 'Bluetooth', modal: 'modal-bluetooth' },
  { id: 'network', icon: '📡', title: 'Network', modal: 'modal-network' },
  { id: 'storage', icon: '💾', title: 'Storage Space', modal: 'modal-storage' },
];

const GOPRO_DEVICES = ['GoPro-1', 'GoPro-2', 'GoPro-3'];
const GOPRO_MAX_SELECTION = 2;
const PRECHECK_STEPS = ['device'];
const PRECHECK_FOOTER = {
  device: { show: true, primary: 'Next', action: 'deviceNext' },
  failed: { show: true, primary: 'Try Again', action: 'retryConnect' },
};

function getPrecheckProgress(step) {
  if (step === 'device') return 1;
  if (step === 'failed') return 0.45;
  return 0;
}

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

const TASK_PROXIMITY_MAX_KM = 0.5;
const PROXIMITY_FAIL_TOAST = 'The target needs to be within 500 meters of the location...';

function isTaskWithinProximity() {
  const t = getSelectedMapTask();
  if (!t) return true;
  return (t.distance_from_user_km || 0) <= TASK_PROXIMITY_MAX_KM;
}

function shouldFailProximityCheck(alreadyRetried) {
  if (alreadyRetried) return false;
  return state.settings.simulateFailedChecks || !isTaskWithinProximity();
}

function resetBeginCaptureState() {
  state.beginPreconditionPassed = false;
  state.beginProximityRetried = false;
  state.beginButtonLoading = false;
  state.completeProximityRetried = false;
  state.completeButtonLoading = false;
}

function syncGpsPrecondition() {
  state.preconditions.gps = state.preconditionGps.authorized;
}

function getPreconditionSubtitle(row) {
  if (row.id === 'gps') {
    return state.preconditions.gps ? row.ok : row.err;
  }
  return state.preconditions[row.id] ? row.ok : row.err;
}

function getPreconditionAction(row) {
  if (state.preconditions[row.id]) {
    return '<span class="pre-card-check" aria-label="Ready"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M5 10.5 8.5 14 15 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
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
    distance_km: opts.distance_km ?? 1.4,
    distance_from_user_km: opts.distance_from_user_km ?? 0.8,
    priority: opts.priority || 'normal',
    dispatch_round: opts.dispatch_round || 'first',
    display_state: opts.display_state || 'unclaimed',
    claimed_by_me: !!opts.claimed_by_me,
    review_status: opts.review_status,
    ticket_id: opts.ticket_id,
    duration_minutes: opts.duration_minutes ?? Math.max(30, Math.round((opts.distance_km ?? 1.4) * 22)),
  };
}

function getTaskSheetTitle(t) {
  if (/^street[\s_]/i.test(t.poi_name)) return t.poi_name.replace(/^street[\s_]/i, 'Street ');
  if (/^street_/i.test(t.task_id)) return `Street ${t.task_id.replace(/^street_/i, '')}`;
  return t.poi_name;
}

function getTaskDurationLabel(t) {
  const mins = t.duration_minutes ?? Math.max(30, Math.round((t.distance_km || 1.4) * 22));
  return `Task duration ${mins}m`;
}

function formatTaskSheetMeta(t) {
  const km = Number(t.distance_from_user_km || 0).toFixed(1);
  return `${km} kilometers away from you | ${t.poi_address}`;
}

const TASK_SHEET_NAV_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3 11 18-8-8 18-2-7-8-3Z" stroke-linejoin="round"/></svg>';
const TASK_SHEET_COPY_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="14" rx="2"/><path d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
const TASK_SHEET_RELEASE_ICON =
  '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 19h12M9 19V8.5l5.2-5.2a1 1 0 011.4 0l3.1 3.1a1 1 0 010 1.4L14 13.5V19" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14.5h6" stroke-linecap="round"/></svg>';

const RECORDING_ALERTS = {
  device_disconnect: {
    title: 'GoPro Disconnected',
    banner: 'GoPro disconnected — recording paused',
    body: 'The camera lost its Bluetooth connection during recording.',
    primary: 'Reconnect',
    icon: '📷',
  },
  storage_full: {
    title: 'Run Out Of Memory',
    banner: 'Run out of memory — recording paused',
    body: 'Your GoPro storage is full.',
    primary: 'Storage',
    icon: '💾',
  },
  wifi_lost: {
    title: 'WiFi Connection Lost',
    banner: 'WiFi connection lost — recording paused',
    body: 'The camera WiFi dropped during recording.',
    primary: 'Reconnect WiFi',
    icon: '📡',
  },
};

function renderTaskCardCloseBtn(handler) {
  return `<button type="button" class="task-card-close" onclick="${handler}" aria-label="Close">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18"/>
    </svg>
  </button>`;
}

function renderTaskSheetLinks(t) {
  return `<div class="task-sheet-links">
    <button type="button" class="task-sheet-link" onclick="toast('Opening Google Maps…')">
      ${TASK_SHEET_NAV_ICON}
      <span>Navigate</span>
    </button>
    <button type="button" class="task-sheet-link" onclick="App.copyTicketId('${t.ticket_id || t.task_id}')">
      ${TASK_SHEET_COPY_ICON}
      <span>Copy ID</span>
    </button>
  </div>`;
}

const state = {
  screen: 'login',
  map: null,
  progressMap: null,
  mapFilters: JSON.parse(JSON.stringify(DEFAULT_MAP_FILTERS)),
  filterDraft: null,
  progressLayers: Object.fromEntries(PROGRESS_LAYERS.map((l) => [l.id, true])),
  taskDatePreset: 'all',
  taskDateLabel: 'Date',
  taskDateSelected: null,
  selectedRecordId: null,
  selectedTaskId: null,
  dismissedRecordIds: [],
  mapMode: 'idle', // idle | navigating | recording | completing | review
  recSeconds: 0,
  recInterval: null,
  backgroundRecording: false,
  backgroundRecSeconds: 0,
  backgroundRecInterval: null,
  shiftActive: false,
  shiftPaused: false,
  shiftDistanceKm: 0,
  shiftDemoTimers: [],
  shiftStartPending: false,
  shiftDragSuppressClick: false,
  activeRouteLayer: null,
  recordingAlertType: null,
  recordingAlertDismissed: {},
  recordingPausedByAlert: false,
  recordingDeviceFault: null,
  captureRestMode: false,
  skipSafety: false,
  beginPreconditionPassed: false,
  beginProximityRetried: false,
  beginButtonLoading: false,
  completeProximityRetried: false,
  completeButtonLoading: false,
  deviceChecks: { gps: true, bluetooth: true, network: true, storage: true },
  preconditionGps: { authorized: false, distanceOk: false },
  preconditions: { bluetooth: true, network: true, gps: true, storage: true },
  mapTaskLayers: {},
  progressPolylines: {},
  routeCache: {},
  routePending: new Set(),
  precheckMap: null,
  precheckStep: 'location',
  precheckLocationReady: false,
  precheckLocationResolved: false,
  precheckLocationTimer: null,
  selectedGopros: [],
  precheckTimer: null,
  precheckConnectFail: false,
  precheckFooterAction: 'skipToMap',
  precheckBootTimer: null,
  precheckScanTimer: null,
  precheckDiscoveredDevices: [],
  precheckSetupPhase: 'idle', // idle | location | bluetooth | scanning | ready
  onboardingComplete: false,
  statusBarCollapsed: false,
  splashTimer: null,
  auth: null,
  mapTasks: [
    seg('task_vermont_001', 'S Vermont Ave', '1200 S Vermont Ave, Los Angeles, CA', { lat: 34.0522, lng: -118.2915 }, { lat: 34.0535, lng: -118.289 }),
    seg('task_high_002', 'Sunset Blvd', 'Sunset Blvd, Los Angeles, CA', { lat: 34.098, lng: -118.326 }, { lat: 34.1, lng: -118.32 }, { display_state: 'claimed', claimed_by_me: true, priority: 'high' }),
    seg('task_wilshire_003', 'Wilshire Blvd', '3400 Wilshire Blvd, Los Angeles, CA', { lat: 34.0615, lng: -118.308 }, { lat: 34.063, lng: -118.3 }),
    seg('task_fig_004', 'Figueroa St', '2200 Figueroa St, Los Angeles, CA', { lat: 34.038, lng: -118.278 }, { lat: 34.041, lng: -118.272 }, { display_state: 'claimed', claimed_by_me: true }),
    seg('task_melrose_005', 'Melrose Ave', '7600 Melrose Ave, Los Angeles, CA', { lat: 34.083, lng: -118.365 }, { lat: 34.085, lng: -118.358 }, { display_state: 'completed_local', review_status: 'approved' }),
    seg('task_broadway_006', 'Broadway DTLA', '500 S Broadway, Los Angeles, CA', { lat: 34.047, lng: -118.252 }, { lat: 34.05, lng: -118.245 }, { dispatch_round: 'second' }),
    seg('task_hollywood_009', 'Street 1928374858', '900 Exposition Blvd, Los Angeles, CA', { lat: 34.101, lng: -118.337 }, { lat: 34.104, lng: -118.33 }, { priority: 'high', distance_from_user_km: 36.6, distance_km: 6.3, duration_minutes: 144, dispatch_round: 'second', ticket_id: '1928374858' }),
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
      task_id: 'street_1928374858',
      title: 'Street 1928374858',
      mapping_title: 'Street 1928374858',
      ticket_id: '490539356-479',
      address: '1200 S Vermont Ave, Los Angeles, CA 90006, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(10, 0, 0, 0);
        return d.toISOString();
      })(),
      duration: '13m10s',
      size: '20.1M',
      distance_km: 6.2,
      status: 'approved',
      audit_stage: 'completed',
      thumb: 'pool',
      upload_status: 'uploaded',
    },
    {
      task_id: 'street_3827948374',
      title: 'Street 3827948374',
      mapping_title: 'Street 3827948374',
      ticket_id: '490528901-468',
      address: '1800 W Olympic Blvd, Los Angeles, CA 90006, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(11, 30, 0, 0);
        return d.toISOString();
      })(),
      duration: '18m46s',
      size: '30.5M',
      distance_km: 7.6,
      status: 'pending',
      audit_stage: 'reviewing',
      thumb: 'palm',
      upload_status: 'uploading',
    },
    {
      task_id: 'street_2894785643',
      title: 'Street 2894785643',
      mapping_title: 'Street 2894785643',
      ticket_id: '490520056-470',
      address: '3400 Wilshire Blvd, Los Angeles, CA 90010, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(14, 15, 0, 0);
        return d.toISOString();
      })(),
      duration: '11m10s',
      size: '17.0M',
      distance_km: 4.6,
      status: 'rejected',
      audit_stage: 'completed',
      thumb: 'street',
      upload_status: 'uploaded',
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
      distance_km: 5.1,
      status: 'pending',
      audit_stage: 'reviewing',
      thumb: 'pool',
      upload_status: 'uploading',
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
  todayLoggedTasks: 7,
  dailySummaryMonth: new Date(2025, 5, 1),
  dailySummarySelectedDay: 20,
  dailySummaryTargets: { km: 20, tasks: 10 },
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
    const loading = state.completeButtonLoading;
    const completeBtn = loading
      ? '<button type="button" class="capture-complete is-loading" disabled aria-label="Complete task"><span class="capture-btn-spinner" aria-hidden="true"></span></button>'
      : '<button type="button" class="capture-complete" onclick="App.completeTask()" aria-label="Complete task">✓</button>';
    el.innerHTML =
      '<button type="button" class="capture-cancel" disabled aria-label="Cancel">×</button>' +
      '<button type="button" class="capture-stop is-disabled" disabled aria-label="Stopped"></button>' +
      completeBtn;
  }
}

const REVIEW_STATUS_LABELS = {
  awaiting: 'Submitted',
  rejected: 'Submitted',
  approved: 'Submitted',
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
  badges.push(`<span class="task-tag task-tag-duration">${getTaskDurationLabel(t)}</span>`);
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
    state.preconditionGps = { authorized: true, distanceOk: true };
  } else {
    state.preconditionGps = { authorized: false, distanceOk: false };
  }
  syncGpsPrecondition();
}

function syncPreconditionsForShift() {
  state.preconditions.bluetooth = state.deviceChecks.bluetooth;
  state.preconditions.network = state.deviceChecks.network;
  state.preconditions.storage = state.deviceChecks.storage;
  if (state.deviceChecks.gps) {
    state.preconditionGps = { authorized: true, distanceOk: true };
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

function formatDistanceKm(km) {
  if (!km) return '0 km';
  if (km >= 100) return `${Math.round(km)} km`;
  if (km >= 10) return `${(Math.round(km * 10) / 10).toFixed(1)} km`;
  return `${km.toFixed(1)} km`;
}

function getMapTaskDistanceByPoi(poiName) {
  const t = state.mapTasks.find((x) => x.poi_name === poiName);
  return t?.distance_km ?? 0;
}

function getMapStatsContext(screen) {
  if (screen === 'precheck') {
    return { distanceKm: 0, compactTop: false, mode: 'off' };
  }
  if (screen === 'progress-map') {
    const visible = state.progressTasks.filter((t) => state.progressLayers[t.progress_status]);
    const distanceKm = visible.reduce((sum, pt) => sum + getMapTaskDistanceByPoi(pt.poi_name), 0);
    return { distanceKm, compactTop: false, mode: 'off' };
  }
  const taskActive = ['navigating', 'recording', 'completing'].includes(state.mapMode);
  if (state.shiftPaused) {
    return {
      distanceKm: state.shiftDistanceKm || 0,
      compactTop: taskActive,
      mode: taskActive ? 'task' : 'paused',
    };
  }
  if (state.shiftActive) {
    return {
      distanceKm: state.shiftDistanceKm || 0,
      compactTop: taskActive,
      mode: taskActive ? 'task' : 'shift',
    };
  }
  return { distanceKm: 0, compactTop: false, mode: 'off' };
}

function updateMapStatsWidgets() {
  const todayMetrics = computeTodayMetrics();
  document.querySelectorAll('.map-stats-widget').forEach((el) => {
    const ctx = getMapStatsContext(el.dataset.mapScreen);
    const distEl = el.querySelector('[data-stat="distance"]');
    const distLabel = el.querySelector('[data-stat="distance-label"]');
    const tasksEl = el.querySelector('[data-stat="tasks"]');
    if (distEl) distEl.textContent = formatDistanceKm(ctx.distanceKm);
    if (tasksEl) tasksEl.textContent = `${todayMetrics.tasks}/${todayMetrics.targets.tasks}`;
    el.classList.toggle('is-compact-top', ctx.compactTop);
    if (el.classList.contains('map-shift-panel')) {
      el.classList.toggle('is-on-shift', state.shiftActive && !state.shiftPaused);
      el.classList.toggle('is-paused', state.shiftPaused);
      el.classList.toggle('is-recording', state.backgroundRecording);
      el.classList.toggle('is-task-overlay', ctx.mode === 'task');
      const btn = el.querySelector('.map-shift-btn');
      const actionEl = el.querySelector('[data-shift-action]');
      const recDot = el.querySelector('[data-shift-rec-dot]');
      if (btn) {
        btn.setAttribute(
          'aria-pressed',
          state.shiftActive || state.shiftPaused ? 'true' : 'false'
        );
        if (state.shiftPaused) {
          btn.setAttribute('aria-label', 'Resume shift');
        } else if (state.shiftActive) {
          btn.setAttribute('aria-label', 'Pause shift');
        } else {
          btn.setAttribute('aria-label', 'Start shift');
        }
      }
      if (actionEl) {
        if (state.shiftPaused) actionEl.textContent = 'Resume';
        else if (state.shiftActive) actionEl.textContent = 'Pause';
        else actionEl.textContent = 'Start';
      }
      if (recDot) recDot.classList.toggle('hidden', !state.backgroundRecording);
      if (distLabel) distLabel.textContent = 'Total Distance';
    }
  });
}

function updateBackgroundRecordingBar() {
  updateMapStatsWidgets();
}

function startBackgroundRecording() {
  if (state.backgroundRecording) return;
  state.backgroundRecording = true;
  if (!state.backgroundRecSeconds) state.backgroundRecSeconds = 0;
  clearInterval(state.backgroundRecInterval);
  state.backgroundRecInterval = setInterval(() => {
    state.backgroundRecSeconds += 1;
    if (state.shiftActive) state.shiftDistanceKm += 0.012;
    updateBackgroundRecordingBar();
    updateMapStatsWidgets();
  }, 1000);
  updateBackgroundRecordingBar();
  updateMapStatsWidgets();
}

function stopBackgroundRecording() {
  state.backgroundRecording = false;
  clearInterval(state.backgroundRecInterval);
  state.backgroundRecInterval = null;
  updateBackgroundRecordingBar();
  updateMapStatsWidgets();
}

function beginShiftRecording() {
  if (state.shiftActive) return;
  state.shiftActive = true;
  state.shiftDistanceKm = 0;
  state.backgroundRecSeconds = 0;
  startBackgroundRecording();
}

function startShift() {
  if (state.shiftActive) return;
  beginShiftRecording();
  runShiftDemo();
}

function stopShift() {
  state.shiftActive = false;
  state.shiftPaused = false;
  state.shiftDistanceKm = 0;
  state.backgroundRecSeconds = 0;
  clearShiftDemo();
  stopBackgroundRecording();
}

function pauseShift() {
  if (!state.shiftActive || state.shiftPaused) return;
  state.shiftActive = false;
  state.shiftPaused = true;
  clearShiftDemo();
  stopBackgroundRecording();
  updateMapStatsWidgets();
}

function resumeShift() {
  if (!state.shiftPaused || state.shiftActive) return;
  state.shiftPaused = false;
  state.shiftActive = true;
  startBackgroundRecording();
  updateMapStatsWidgets();
}

const SHIFT_DEMO_TASK_ID = 'task_vermont_001';
const SHIFT_DEMO_STEP_MS = 3000;

function syncMapTaskSheet() {
  App.renderTaskSheet();
  App.updateMapChrome();
}

function fillRecordingAlertModal(type) {
  const config = RECORDING_ALERTS[type];
  if (!config) return;

  const iconEl = document.getElementById('recording-alert-icon');
  if (iconEl) {
    iconEl.textContent = config.icon;
    iconEl.classList.toggle('red', type === 'storage_full');
  }
  document.getElementById('recording-alert-title').textContent = config.title;
  document.getElementById('recording-alert-body').textContent = config.body;
  document.getElementById('recording-alert-primary').textContent = config.primary;
}

function pauseRecordingForAlert() {
  if (state.recInterval) {
    clearInterval(state.recInterval);
    state.recInterval = null;
  }
  state.recordingPausedByAlert = true;
}

function resumeRecordingAfterAlert() {
  if (!state.recordingPausedByAlert || state.mapMode !== 'recording') return;
  state.recordingPausedByAlert = false;
  if (!state.recInterval) state.recInterval = setInterval(App.tickRec, 1000);
}

function bootDemoRecording(alertType) {
  applyReadyChecks();
  state.onboardingComplete = true;
  state.shiftActive = true;
  state.shiftPaused = false;
  state.recordingAlertDismissed = {};
  state.recordingDeviceFault = null;

  const task = state.mapTasks.find((t) => t.task_id === 'task_hollywood_009') || state.mapTasks[0];
  if (task) {
    state.selectedTaskId = task.task_id;
    task.display_state = 'claimed';
    task.claimed_by_me = true;
  }

  state.mapMode = 'recording';
  state.recSeconds = alertType === 'storage_full' ? 498 : 42;
  clearInterval(state.recInterval);
  state.recInterval = setInterval(App.tickRec, 1000);
  state.recordingPausedByAlert = false;

  App.showLoginScreen();
  App.initLoginForm();
  App.go('map');
  setTimeout(() => {
    App.renderMapTasks();
    syncMapTaskSheet();
    if (alertType) App.showRecordingAlert(alertType);
  }, 250);
}

function canDragShiftToStop() {
  return state.shiftActive || state.shiftPaused;
}

const SHIFT_DRAG_MORPH_THRESHOLD = 22;
const SHIFT_DRAG_END_THRESHOLD = 56;
let shiftDragState = null;

function bindShiftControls() {
  const btn = document.getElementById('map-shift-btn');
  const wrap = document.getElementById('map-shift-drag');
  const actionEl = btn?.querySelector('[data-shift-action]');
  if (!btn || !wrap || btn.dataset.shiftBound === '1') return;
  btn.dataset.shiftBound = '1';

  const resetShiftDrag = (commit) => {
    if (!shiftDragState) return;
    const moved = shiftDragState.moved;
    shiftDragState = null;
    btn.style.transform = '';
    btn.classList.remove('is-dragging', 'is-drag-stop', 'is-drop-ready');
    wrap.classList.remove('is-dragging');
    updateMapStatsWidgets();
    if (commit) {
      state.shiftDragSuppressClick = true;
      App.endShift();
      return;
    }
    if (moved) state.shiftDragSuppressClick = true;
  };

  btn.addEventListener('pointerdown', (e) => {
    if (!canDragShiftToStop()) return;
    if (e.button !== undefined && e.button !== 0) return;
    shiftDragState = {
      startY: e.clientY,
      offsetY: 0,
      moved: false,
      pointerId: e.pointerId,
    };
    btn.setPointerCapture(e.pointerId);
  });

  btn.addEventListener('pointermove', (e) => {
    if (!shiftDragState || e.pointerId !== shiftDragState.pointerId) return;
    const offsetY = Math.max(0, Math.min(68, e.clientY - shiftDragState.startY));
    if (offsetY > 6) shiftDragState.moved = true;
    shiftDragState.offsetY = offsetY;
    const morphStop = offsetY >= SHIFT_DRAG_MORPH_THRESHOLD;
    const dropReady = offsetY >= SHIFT_DRAG_END_THRESHOLD;

    btn.classList.toggle('is-dragging', offsetY > 6);
    btn.classList.toggle('is-drag-stop', morphStop);
    btn.classList.toggle('is-drop-ready', dropReady);
    wrap.classList.toggle('is-dragging', offsetY > 6);
    btn.style.transform = `translateY(${offsetY}px)`;

    if (actionEl && morphStop) actionEl.textContent = 'Stop';
    else if (actionEl) updateMapStatsWidgets();
  });

  const finishDrag = (e) => {
    if (!shiftDragState || e.pointerId !== shiftDragState.pointerId) return;
    const commit = shiftDragState.offsetY >= SHIFT_DRAG_END_THRESHOLD;
    if (btn.hasPointerCapture(e.pointerId)) btn.releasePointerCapture(e.pointerId);
    resetShiftDrag(commit);
  };

  btn.addEventListener('pointerup', finishDrag);
  btn.addEventListener('pointercancel', finishDrag);
}

function enterMapScreen() {
  if (!state.map) App.initMap();
  else state.map.invalidateSize();
  App.renderMapTasks();
  syncMapTaskSheet();
  updateBackgroundRecordingBar();
  updateMapStatsWidgets();
}

function clearShiftDemo() {
  (state.shiftDemoTimers || []).forEach((id) => clearTimeout(id));
  state.shiftDemoTimers = [];
}

function scheduleShiftDemo(fn, ms) {
  const id = setTimeout(fn, ms);
  state.shiftDemoTimers.push(id);
  return id;
}

function resetShiftDemoTask(taskId = SHIFT_DEMO_TASK_ID) {
  const t = state.mapTasks.find((x) => x.task_id === taskId);
  if (!t) return;
  t.display_state = 'unclaimed';
  t.claimed_by_me = false;
  delete t.review_status;
  t.distance_from_user_km = 2.4;
  t.distance_km = 0.8;
}

function runShiftDemo() {
  clearShiftDemo();
  const taskId = SHIFT_DEMO_TASK_ID;
  resetShiftDemoTask(taskId);
  state.selectedTaskId = null;
  state.mapMode = 'idle';
  state.recSeconds = 0;
  clearInterval(state.recInterval);
  if (state.screen !== 'map') App.go('map');
  App.renderMapTasks();
  App.renderTaskSheet();
  App.updateMapChrome();

  scheduleShiftDemo(() => {
    if (!state.shiftActive) return;
    toast('Driving to nearest task…');
  }, SHIFT_DEMO_STEP_MS);

  scheduleShiftDemo(() => {
    if (!state.shiftActive) return;
    const t = state.mapTasks.find((x) => x.task_id === taskId);
    if (!t) return;
    t.distance_from_user_km = 0.2;
    state.selectedTaskId = taskId;
    App.renderMapTasks({ skipFit: true });
    App.renderTaskSheet();
    App.updateMapChrome();
    toastSuccess('Location verified — task nearby');
  }, SHIFT_DEMO_STEP_MS * 2);

  scheduleShiftDemo(() => {
    if (!state.shiftActive) return;
    App.runShiftDemoTaskFlow(taskId);
  }, SHIFT_DEMO_STEP_MS * 3);
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

function parseDurationText(text) {
  if (!text) return 0;
  let sec = 0;
  const h = text.match(/(\d+)h/);
  const m = text.match(/(\d+)m/);
  const s = text.match(/(\d+)s/);
  if (h) sec += parseInt(h[1], 10) * 3600;
  if (m) sec += parseInt(m[1], 10) * 60;
  if (s) sec += parseInt(s[1], 10);
  return sec;
}

function computeTodayMetrics() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = state.records.filter((r) => new Date(r.shot_at) >= startOfToday);
  const kmSum = today.reduce((sum, r) => sum + (r.distance_km || 0), 0);
  const targets = state.dailySummaryTargets;
  const km = kmSum || 18.4;
  const tasks = today.length || state.todayLoggedTasks || 0;
  return {
    km: km.toFixed(1),
    tasks: String(tasks),
    kmPct: Math.min(100, Math.round((km / targets.km) * 100)),
    tasksPct: Math.min(100, Math.round((tasks / targets.tasks) * 100)),
    targets,
  };
}


function getDailySummaryMonthData(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data = {};
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isFuture = isCurrentMonth && todayDay !== null && day > todayDay;
    if (isFuture) {
      data[day] = { status: 'empty', km: 0, tasks: 0 };
      continue;
    }

    if (day === 20 && year === 2025 && month === 5) {
      data[day] = { status: 'fail', km: 18.4, tasks: 7 };
    } else if (day % 9 === 0 || day === 13) {
      data[day] = { status: 'fail', km: 11.6 + (day % 3), tasks: 4 + (day % 3) };
    } else if (day % 7 === 0) {
      data[day] = { status: 'pending', km: 0, tasks: 0 };
    } else {
      data[day] = {
        status: 'pass',
        km: 19.8 + (day % 5) * 0.3,
        tasks: 10 + (day % 2),
      };
    }
  }
  return data;
}

function computeDailySummaryMonthStats(year, month) {
  const monthData = getDailySummaryMonthData(year, month);
  let completed = 0;
  let failed = 0;
  let totalKm = 0;
  let totalTasks = 0;
  Object.values(monthData).forEach((info) => {
    if (info.status === 'pass') {
      completed += 1;
      totalKm += info.km || 0;
      totalTasks += info.tasks || 0;
    } else if (info.status === 'fail') {
      failed += 1;
    } else if (info.status === 'progress') {
      totalKm += info.km || 0;
      totalTasks += info.tasks || 0;
    }
  });
  const tracked = completed + failed;
  const passRate = tracked ? Math.round((completed / tracked) * 100) : 0;
  return { completed, failed, totalKm, totalTasks, passRate };
}

function formatDailySummaryDetailTitle(year, month, day) {
  const d = new Date(year, month, day);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (isToday) return "Today's Detail";
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' }) + ' Detail';
}

function renderDailySummaryStatusIcon(status) {
  if (status === 'pass') {
    return `<span class="daily-cell-icon daily-cell-icon--pass" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17 19 7"/></svg>
    </span>`;
  }
  if (status === 'fail') {
    return `<span class="daily-cell-icon daily-cell-icon--fail" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17"/></svg>
    </span>`;
  }
  if (status === 'pending') {
    return '<span class="daily-cell-icon daily-cell-icon--pending" aria-hidden="true"></span>';
  }
  return '<span class="daily-cell-icon-spacer" aria-hidden="true"></span>';
}

function renderDailySummaryStatusBadge(status, label) {
  if (status === 'progress') {
    return `<span class="daily-status-pill daily-status-pill--progress">
      <span class="daily-status-toggle" aria-hidden="true"><span class="daily-status-toggle-knob"></span></span>
      ${label}
    </span>`;
  }
  return `<span class="daily-status-pill daily-status-pill--${status}">
    <i class="daily-status-dot daily-status-dot--${status}"></i>${label}
  </span>`;
}


function getDailySummaryDayInfo(year, month, day) {
  const monthData = getDailySummaryMonthData(year, month);
  return monthData[day] || { status: 'empty', km: 0, tasks: 0 };
}

function formatDailySummaryStatus(status) {
  if (status === 'pass') return 'Completed';
  if (status === 'fail') return 'Failed';
  if (status === 'progress') return 'In Progress';
  if (status === 'pending') return 'Holiday';
  return 'No Data';
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

function getRecordUploadStatus(r) {
  return r.upload_status === 'uploading' ? 'uploading' : 'uploaded';
}

function renderTaskUploadStatusBadge(r) {
  const status = getRecordUploadStatus(r);
  if (status === 'uploading') {
    return `<span class="task-upload-status task-upload-status--uploading"><span class="task-upload-spinner" aria-hidden="true"></span>Uploading</span>`;
  }
  return `<span class="task-upload-status task-upload-status--uploaded"><svg class="task-upload-check" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 6l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Uploaded</span>`;
}

function formatRecordDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m${s}s`;
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
  let rows = state.records.filter(
    (r) =>
      ['approved', 'pending', 'reviewing', 'rejected'].includes(r.status) &&
      !state.dismissedRecordIds.includes(r.task_id)
  );
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

function updateBottomNav() {
  const nav = document.getElementById('bottom-nav');
  const phone = document.getElementById('app');
  if (!nav) return;

  const driving =
    state.screen === 'map' && ['navigating', 'recording', 'completing'].includes(state.mapMode);
  const show = BOTTOM_NAV_SCREENS.includes(state.screen) && !driving;

  nav.classList.toggle('hidden', !show);
  phone?.classList.toggle('has-bottom-nav', show);

  nav.querySelectorAll('[data-tab]').forEach((btn) => {
    const tab = btn.dataset.tab;
    const active = tab === BOTTOM_NAV_TAB_FOR_SCREEN[state.screen];
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

const App = {
  tabNav(screen) {
    if (state.screen === screen) {
      if (screen === 'map') enterMapScreen();
      return;
    }
    App.go(screen);
  },

  go(screen) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    const map = {
      login: 'screen-login',
      precheck: 'screen-precheck',
      map: 'screen-map',
      tasks: 'screen-tasks',
      'daily-summary': 'screen-daily-summary',
      'task-detail': 'screen-task-detail',
      'progress-map': 'screen-progress-map',
      settings: 'screen-settings',
      version: 'screen-version',
    };
    document.getElementById(map[screen]).classList.add('active');
    state.screen = screen;
    document.getElementById('filter-sheet').classList.remove('show');
    document.getElementById('progress-layer-panel').classList.remove('show');

    if (screen === 'precheck') {
      App.startPrecheckFlow();
    }
    if (screen === 'map') {
      setTimeout(enterMapScreen, 100);
    }
    if (screen === 'task-detail') App.renderTaskDetail();
    if (screen === 'settings') App.updateSettingsProfile();
    if (screen === 'version') App.syncSettingsToggles();
    if (screen === 'progress-map') {
      setTimeout(() => {
        if (!state.progressMap) App.initProgressMap();
        else state.progressMap.invalidateSize();
        App.renderProgressMap();
        App.renderSettlementPanel();
        updateBackgroundRecordingBar();
        updateMapStatsWidgets();
      }, 100);
    }
    if (screen === 'tasks') App.renderTaskList();
    if (screen === 'daily-summary') App.renderDailySummary();
    updateBottomNav();
  },

  login() {
    const userId = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;

    if (!userId || !password) {
      App.showLoginError('Enter your user ID and password.');
      return;
    }

    const account = DEMO_ACCOUNTS.find(
      (a) => (a.userId === userId || a.displayName === userId) && a.password === password
    );

    if (!account) {
      document.getElementById('login-user-wrap').classList.add('is-error');
      document.getElementById('login-pass-wrap').classList.add('is-error');
      App.showLoginError('Invalid user ID or password.');
      return;
    }

    state.auth = {
      region: account.region,
      userId: account.userId,
      displayName: account.displayName,
    };
    App.clearLoginError();
    setTimeout(() => App.go('precheck'), 280);
  },

  unlockPrecheckLocationAlert(delay = 650) {
    state.precheckLocationReady = false;
    state.precheckLocationResolved = false;
    const alertEl = document.getElementById('precheck-location-alert');
    if (alertEl) {
      alertEl.classList.add('is-locked');
      alertEl.classList.remove('is-hidden');
    }
    if (state.precheckLocationTimer) clearTimeout(state.precheckLocationTimer);
    state.precheckLocationTimer = setTimeout(() => {
      state.precheckLocationReady = true;
      state.precheckLocationTimer = null;
      alertEl?.classList.remove('is-locked');
    }, delay);
  },

  initPrecheckMap() {
    const mapEl = document.getElementById('precheck-map');
    if (!mapEl) return;
    if (state.precheckMap) {
      state.precheckMap.invalidateSize();
      return;
    }
    state.precheckMap = L.map('precheck-map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([34.06, -118.32], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(state.precheckMap);
  },

  initLoginForm() {
    const defaultAccount = DEMO_ACCOUNTS[0];
    const userInput = document.getElementById('login-user');
    const passInput = document.getElementById('login-pass');
    if (userInput) userInput.value = defaultAccount.userId;
    if (passInput) passInput.value = defaultAccount.password;
    App.onPassInput();
  },

  finishSplash() {
    if (state.splashTimer) {
      clearTimeout(state.splashTimer);
      state.splashTimer = null;
    }
    const splash = document.getElementById('screen-splash');
    if (splash) {
      splash.classList.remove('active');
      splash.classList.add('is-dismissed');
      splash.setAttribute('aria-hidden', 'true');
    }
    App.showLoginScreen();
    try {
      App.initLoginForm();
    } catch (err) {
      console.error('initLoginForm failed after splash', err);
    }
  },

  startSplash() {
    const SPLASH_DURATION_MS = 2000;
    const bar = document.getElementById('splash-progress-bar');
    const splash = document.getElementById('screen-splash');
    const login = document.getElementById('screen-login');
    if (!splash || !login) {
      App.showLoginScreen();
      App.initLoginForm();
      return;
    }
    splash.classList.add('active');
    login.classList.remove('active');
    state.screen = 'splash';
    if (state.splashTimer) clearTimeout(state.splashTimer);
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        bar.style.transition = `width ${SPLASH_DURATION_MS}ms linear`;
        bar.style.width = '100%';
      });
    }
    state.splashTimer = setTimeout(() => App.finishSplash(), SPLASH_DURATION_MS);
  },

  showLoginScreen() {
    if (state.splashTimer) {
      clearTimeout(state.splashTimer);
      state.splashTimer = null;
    }
    const splash = document.getElementById('screen-splash');
    if (splash) {
      splash.classList.remove('active');
      splash.classList.add('is-dismissed');
      splash.setAttribute('aria-hidden', 'true');
    }
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    document.getElementById('screen-login')?.classList.add('active');
    state.screen = 'login';
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
    toast(on ? 'Auto Position enabled' : 'Auto Position disabled');
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

  onUserFocus(focused) {
    document.getElementById('login-user-wrap').classList.toggle('is-focused', focused);
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
    if (state.precheckBootTimer) {
      clearTimeout(state.precheckBootTimer);
      state.precheckBootTimer = null;
    }
    if (state.precheckScanTimer) {
      clearTimeout(state.precheckScanTimer);
      state.precheckScanTimer = null;
    }
    state.precheckStep = 'device';
    state.selectedGopros = [];
    state.precheckDiscoveredDevices = [];
    state.precheckSetupPhase = 'location';
    state.precheckConnectFail =
      state.settings.simulateFailedChecks ||
      new URLSearchParams(location.search).get('precheckFail') === '1';
    state.deviceChecks = { gps: false, bluetooth: false, network: true, storage: true };
    state.preconditions = { bluetooth: false, network: true, gps: false, storage: true };
    state.preconditionGps = { authorized: false, distanceOk: false };
    const toggle = document.getElementById('precheck-device-toggle');
    if (toggle) toggle.checked = true;
    App.showPrecheckStep('device');
    App.renderPrecheckDeviceUI();
    App.beginDevicePageSetup();
  },

  beginDevicePageSetup() {
    state.precheckSetupPhase = 'location';
    App.closeModal('modal-gps-auth');
    App.closeModal('modal-bluetooth');
    if (state.precheckBootTimer) clearTimeout(state.precheckBootTimer);
    state.precheckBootTimer = setTimeout(() => {
      state.precheckBootTimer = null;
      document.getElementById('modal-gps-auth')?.classList.add('show');
    }, 450);
  },

  renderPrecheckDeviceUI() {
    const connectedEl = document.getElementById('device-connected-list');
    const listEl = document.getElementById('gopro-list');
    if (connectedEl) {
      if (!state.selectedGopros.length) {
        connectedEl.innerHTML = '';
        connectedEl.classList.add('hidden');
      } else {
        connectedEl.classList.remove('hidden');
        connectedEl.innerHTML = state.selectedGopros
          .map(
            (name) =>
              `<div class="device-connected-item">
                <span class="device-connected-dot" aria-hidden="true"></span>
                <span class="device-connected-name">${name}</span>
                <span class="device-connected-status">Connected</span>
              </div>`
          )
          .join('');
      }
    }

    if (!listEl) return;

    if (state.precheckSetupPhase === 'scanning') {
      listEl.innerHTML =
        '<div class="device-scan-state">' +
        '<span class="device-scan-spinner" aria-hidden="true"></span>' +
        '<span>Searching nearby devices…</span>' +
        '</div>';
      return;
    }

    if (state.precheckSetupPhase !== 'ready' || !state.precheckDiscoveredDevices.length) {
      listEl.innerHTML =
        '<div class="device-scan-state device-scan-state--idle">' +
        '<span>Waiting for Bluetooth…</span>' +
        '</div>';
      return;
    }

    listEl.innerHTML = state.precheckDiscoveredDevices
      .map((name, index) => {
        const id = name.toLowerCase();
        const selected = state.selectedGopros.includes(name);
        const divider = index ? '<div class="device-list-divider"></div>' : '';
        return (
          `${divider}<label class="device-list-item${selected ? ' selected' : ''}" id="device-pick-${id}">` +
          `<input type="checkbox" name="gopro" value="${name}" ${selected ? 'checked' : ''} onchange="App.precheckToggleGopro('${name}', this.checked)" />` +
          `<span class="gopro-check" aria-hidden="true">${selected ? '✓' : ''}</span>` +
          `<span class="device-list-name">${name}</span>` +
          `<span class="device-list-status">${selected ? 'Connected' : 'Ready'}</span>` +
          `</label>`
        );
      })
      .join('');

    const atMax = state.selectedGopros.length >= GOPRO_MAX_SELECTION;
    state.precheckDiscoveredDevices.forEach((name) => {
      const el = document.getElementById(`device-pick-${name.toLowerCase()}`);
      if (!el) return;
      const selected = state.selectedGopros.includes(name);
      el.classList.toggle('is-disabled', atMax && !selected);
    });
  },

  precheckStartDeviceScan() {
    state.precheckSetupPhase = 'scanning';
    state.precheckDiscoveredDevices = [];
    state.selectedGopros = [];
    App.renderPrecheckDeviceUI();
    if (state.precheckScanTimer) clearTimeout(state.precheckScanTimer);
    const delay = state.precheckConnectFail ? 3200 : 1800;
    state.precheckScanTimer = setTimeout(() => {
      state.precheckScanTimer = null;
      if (state.precheckConnectFail) {
        App.showPrecheckStep('failed');
        return;
      }
      state.precheckDiscoveredDevices = ['GoPro-1', 'GoPro-2'];
      state.precheckSetupPhase = 'ready';
      App.renderPrecheckDeviceUI();
    }, delay);
  },

  updatePrecheckChrome(step) {
    const bar = document.getElementById('configure-progress-bar');
    const footer = document.getElementById('precheck-footer');
    const skipBtn = document.getElementById('precheck-skip-btn');
    const primaryBtn = document.getElementById('precheck-primary-btn');

    if (bar) bar.style.width = `${Math.round(getPrecheckProgress(step) * 100)}%`;

    const footerCfg = PRECHECK_FOOTER[step] || PRECHECK_FOOTER.bluetooth;
    if (footer) {
      footer.classList.toggle('hidden', !footerCfg.show);
      footer.classList.toggle('is-skip-only', !!footerCfg.skipOnly);
    }
    if (primaryBtn) {
      primaryBtn.textContent = footerCfg.primary || 'Next';
      primaryBtn.style.display = footerCfg.skipOnly ? 'none' : '';
    }
    if (skipBtn) skipBtn.style.display = '';
    state.precheckFooterAction = footerCfg.action || 'skipToMap';
  },

  showPrecheckStep(step) {
    state.precheckStep = step;
    document.querySelectorAll('.precheck-page').forEach((el) => el.classList.remove('show'));
    const target = document.getElementById(`precheck-step-${step}`);
    if (target) target.classList.add('show');
    App.updatePrecheckChrome(step);
    if (step === 'location') {
      App.unlockPrecheckLocationAlert();
      requestAnimationFrame(() => {
        App.initPrecheckMap();
        setTimeout(() => state.precheckMap?.invalidateSize(), 120);
      });
    }
    if (step === 'device') App.renderPrecheckDeviceUI();
  },

  precheckFooterSkip() {
    App.precheckSkipToMap();
  },

  precheckFooterPrimary() {
    const action = state.precheckFooterAction;
    if (action === 'deviceNext') App.precheckDeviceNext();
    else if (action === 'retryConnect') App.precheckRetryConnect();
    else App.precheckSkipToMap();
  },

  precheckLocationAllow(mode, ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    }
    if (!state.precheckLocationReady) return;
    if (state.precheckLocationResolved) return;
    if (state.precheckStep !== 'location') return;
    state.precheckLocationResolved = true;
    if (state.precheckLocationTimer) {
      clearTimeout(state.precheckLocationTimer);
      state.precheckLocationTimer = null;
    }
    document.getElementById('precheck-location-alert')?.classList.remove('is-locked');
    if (mode === 'deny') {
      state.deviceChecks.gps = false;
      state.preconditionGps = { authorized: false, distanceOk: false };
      syncGpsPrecondition();
      toast('Location access denied');
    } else {
      state.deviceChecks.gps = true;
      state.preconditionGps = { authorized: true, distanceOk: true };
      syncGpsPrecondition();
    }
    App.showPrecheckStep('bluetooth');
  },

  precheckBluetoothNext() {
    state.deviceChecks.bluetooth = true;
    state.preconditions.bluetooth = true;
    App.precheckStartConnecting();
  },

  precheckStartConnecting() {
    App.showPrecheckStep('connecting');
    if (state.precheckTimer) clearTimeout(state.precheckTimer);
    state.precheckTimer = setTimeout(() => {
      state.precheckTimer = null;
      if (state.precheckConnectFail) {
        App.showPrecheckStep('failed');
      } else {
        App.showPrecheckStep('device');
      }
    }, 2200);
  },

  precheckConnectingSkip() {
    if (state.precheckTimer) {
      clearTimeout(state.precheckTimer);
      state.precheckTimer = null;
    }
    App.showPrecheckStep('device');
  },

  syncGoproSelectionUI() {
    App.renderPrecheckDeviceUI();
  },

  precheckToggleGopro(value, checked) {
    let selected = [...state.selectedGopros];
    if (checked) {
      if (selected.includes(value)) return;
      if (selected.length >= GOPRO_MAX_SELECTION) {
        const input = document.querySelector(`input[name="gopro"][value="${value}"]`);
        if (input) input.checked = false;
        toast(`You can connect up to ${GOPRO_MAX_SELECTION} devices`);
        return;
      }
      selected.push(value);
      toast(`Connected to ${value}`);
    } else {
      selected = selected.filter((item) => item !== value);
    }
    state.selectedGopros = selected;
    App.renderPrecheckDeviceUI();
  },

  precheckSelectGopro(value) {
    App.precheckToggleGopro(value, !state.selectedGopros.includes(value));
  },

  precheckDeviceToggle(on) {
    if (!on) toast('Device connection disabled');
  },

  precheckDeviceNext() {
    const toggle = document.getElementById('precheck-device-toggle');
    if (toggle && !toggle.checked) {
      toast('Turn on Device Connection to continue');
      return;
    }
    if (state.precheckSetupPhase !== 'ready') {
      toast('Wait for nearby devices to appear');
      return;
    }
    if (state.selectedGopros.length < GOPRO_MAX_SELECTION) {
      toast(`Connect ${GOPRO_MAX_SELECTION} devices to continue`);
      return;
    }
    state.deviceChecks.bluetooth = true;
    state.preconditions.bluetooth = true;
    App.precheckFinishSetup();
  },

  precheckFinishSetup() {
    state.deviceChecks = { gps: true, bluetooth: true, network: true, storage: true };
    state.preconditionGps = { authorized: true, distanceOk: true };
    state.preconditions = { bluetooth: true, network: true, gps: true, storage: true };
    state.onboardingComplete = true;
    toastSuccess(`Connected to ${state.selectedGopros.join(' & ')}`);
    App.go('map');
  },

  precheckSkipToMap() {
    if (state.precheckTimer) {
      clearTimeout(state.precheckTimer);
      state.precheckTimer = null;
    }
    state.onboardingComplete = false;
    App.go('map');
  },

  precheckRetryConnect() {
    state.precheckConnectFail = false;
    App.showPrecheckStep('device');
    App.precheckStartDeviceScan();
  },

  precheckBack() {
    if (state.precheckStep === 'failed') {
      App.showPrecheckStep('device');
      App.beginDevicePageSetup();
      return;
    }
    App.go('login');
  },

  renderPrecheck() {
    App.startPrecheckFlow();
  },

  refreshPrecheck() {
    App.startPrecheckFlow();
    toast('Refreshed');
  },

  openCheckModal(id) {
    if (state.deviceChecks[id]) return;
    const check = DEVICE_CHECKS.find((c) => c.id === id);
    if (check) {
      if (id === 'bluetooth') App.prepareBluetoothModal();
      document.getElementById(check.modal).classList.add('show');
    }
  },

  prepareBluetoothModal() {
    const toggle = document.getElementById('bluetooth-modal-toggle');
    const doneBtn = document.getElementById('btn-bluetooth-done');
    const on = !!state.deviceChecks.bluetooth;
    if (toggle) toggle.checked = on;
    if (doneBtn) doneBtn.disabled = !on;
  },

  onBluetoothModalToggle(on) {
    const doneBtn = document.getElementById('btn-bluetooth-done');
    if (doneBtn) doneBtn.disabled = !on;
  },

  cancelBluetoothModal() {
    App.closeModal('modal-bluetooth');
    if (state.preconditionFixReturn) {
      document.getElementById('modal-precondition').classList.add('show');
    }
  },

  confirmBluetoothModal() {
    const toggle = document.getElementById('bluetooth-modal-toggle');
    if (!toggle?.checked) return;
    App.fixCheck('bluetooth');
  },

  fixCheck(id) {
    state.deviceChecks[id] = true;
    if (id === 'bluetooth') state.preconditions.bluetooth = true;
    if (id === 'network') state.preconditions.network = true;
    if (id === 'storage') state.preconditions.storage = true;
    DEVICE_CHECKS.forEach((c) => {
      if (c.id === id) document.getElementById(c.modal).classList.remove('show');
    });
    if (state.screen === 'precheck' && state.precheckStep === 'device' && id === 'bluetooth') {
      state.precheckSetupPhase = 'bluetooth';
      App.precheckStartDeviceScan();
      return;
    }
    App.renderPrecondition();
    App.updateMapChrome();
    if (state.preconditionFixReturn) {
      document.getElementById('modal-precondition').classList.add('show');
    }
    toast('Status updated');
  },

  confirmGpsAuth(mode) {
    App.closeModal('modal-gps-auth');
    const fromShiftStart = state.shiftStartPending;

    if (mode === 'deny') {
      state.preconditionGps = { authorized: false, distanceOk: false };
      state.deviceChecks.gps = false;
    } else {
      state.preconditionGps = { authorized: true, distanceOk: true };
      state.deviceChecks.gps = true;
    }
    syncGpsPrecondition();
    if (state.screen === 'precheck' && state.precheckStep === 'device') {
      state.precheckSetupPhase = 'bluetooth';
      setTimeout(() => {
        App.prepareBluetoothModal();
        document.getElementById('modal-bluetooth')?.classList.add('show');
      }, 320);
      return;
    }
    App.renderPrecondition();
    App.updateMapChrome();
    if (state.preconditionFixReturn || fromShiftStart) {
      document.getElementById('modal-precondition').classList.add('show');
    }
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
    if (id === 'modal-precondition') {
      state.preconditionFixReturn = false;
      state.shiftStartPending = false;
    }
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
    const captureSheet = document.getElementById('capture-sheet');
    const mapFloats = document.getElementById('map-float-actions');
    const sheet = document.getElementById('task-sheet');
    const mapRail = document.getElementById('map-rail');

    const driving = ['navigating', 'recording', 'completing'].includes(state.mapMode);

    topChrome.classList.toggle('hidden', driving);
    nav.classList.toggle('hidden', !driving);
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
      state.mapMode === 'recording' &&
      state.recSeconds >= 15 &&
      !state.recordingAlertDismissed.storage_full &&
      !state.recordingAlertType;
    if (showMemoryAlert) App.showRecordingAlert('storage_full');

    const alertModal = document.getElementById('modal-recording-alert');
    if (alertModal && !state.recordingAlertType) alertModal.classList.remove('show');

    const showRest = state.mapMode === 'recording' && state.recSeconds >= 995;
    document.getElementById('map-float-rest').classList.toggle('hidden', !showRest);
    document.getElementById('map-float-over').classList.toggle('hidden', showRest);

    const deviceBattBolt = document.getElementById('device-batt-bolt');

    if (state.recordingDeviceFault === 'device_disconnect') {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'DISCONNECTED';
      deviceBatt.textContent = '78';
      deviceBattWrap.className = 'device-batt-wrap warn';
      statusBar.classList.remove('is-online');
      deviceSignal.dataset.level = '0';
    } else if (state.recordingDeviceFault === 'wifi_lost') {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'NO WIFI';
      deviceBatt.textContent = '78';
      deviceBattWrap.className = 'device-batt-wrap warn has-bolt';
      statusBar.classList.remove('is-online');
      deviceSignal.dataset.level = '0';
    } else if (state.mapMode === 'recording') {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'REC';
      deviceBatt.textContent = '78';
      deviceBattWrap.className = 'device-batt-wrap warn has-bolt';
      statusBar.classList.remove('is-online');
      deviceSignal.dataset.level = '3';
    } else if (!state.settings.simulateFailedChecks || allPreconditionsOk()) {
      deviceDot.className = 'device-dot';
      deviceConn.textContent = 'CONNECTED';
      deviceBatt.textContent = state.onboardingComplete ? '98' : '51';
      deviceBattWrap.className = 'device-batt-wrap connected has-bolt';
      statusBar.classList.add('is-online');
      deviceSignal.dataset.level = '5';
    } else {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'DISCONNECTED';
      deviceBatt.textContent = '14';
      deviceBattWrap.className = 'device-batt-wrap low';
      statusBar.classList.remove('is-online');
      deviceSignal.dataset.level = '0';
    }

    statusBar.classList.toggle('is-disconnected', deviceConn.textContent === 'DISCONNECTED');

    if (deviceBattBolt) {
      deviceBattBolt.classList.toggle('hidden', !deviceBattWrap.classList.contains('has-bolt'));
    }

    statusBar.classList.toggle('is-collapsed', state.statusBarCollapsed);

    if (driving) App.renderMapTasks({ skipFit: true });
    updateMapStatsWidgets();
    updateBackgroundRecordingBar();
    updateBottomNav();
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
    bindShiftControls();
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
    resetBeginCaptureState();
    state.selectedTaskId = taskId;
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
  },

  closeTaskSheet() {
    state.selectedTaskId = null;
    resetBeginCaptureState();
    if (state.mapMode === 'review') state.mapMode = 'idle';
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
  },

  dismissTaskCard(taskId) {
    if (!state.dismissedRecordIds.includes(taskId)) {
      state.dismissedRecordIds.push(taskId);
    }
    if (state.selectedRecordId === taskId) state.selectedRecordId = null;
    App.renderTaskList();
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
    const links = renderTaskSheetLinks(t);
    const title = getTaskSheetTitle(t);

    let actions = '';
    let actionClass = 'task-sheet-actions';
    if (inReview) {
      const status = t.review_status || 'awaiting';
      const cls =
        status === 'rejected' ? 'is-failed' : status === 'approved' ? 'is-success' : '';
      actions = `<button type="button" class="btn btn-submitted task-sheet-accept ${cls}" disabled>${REVIEW_STATUS_LABELS[status] || REVIEW_STATUS_LABELS.awaiting}</button>`;
    } else if (claimed) {
      actionClass += ' split';
      const beginLoading = state.beginButtonLoading;
      const beginBtnClass = `task-sheet-begin${beginLoading ? ' is-loading' : ''}`;
      const beginBtnAttrs = beginLoading ? ' disabled aria-busy="true"' : '';
      const beginBtnContent = beginLoading
        ? '<span class="task-sheet-begin-spinner" aria-hidden="true"></span>Begin'
        : 'Begin';
      actions = `<button type="button" class="task-release-btn" onclick="App.releaseTask('${t.task_id}')">
        ${TASK_SHEET_RELEASE_ICON}
        <span>Release</span>
      </button>
      <button type="button" class="${beginBtnClass}"${beginBtnAttrs} onclick="App.openBegin()">${beginBtnContent}</button>`;
    } else {
      actions = `<button type="button" class="btn btn-primary task-sheet-accept" onclick="App.acceptTask('${t.task_id}')">Accept</button>`;
    }

    sheet.innerHTML = `
      <div class="task-sheet-card">
        <div class="task-sheet-head">
          <div class="task-sheet-head-copy">
            <h2 class="task-sheet-title">${title}</h2>
            <p class="task-sheet-meta">${formatTaskSheetMeta(t)}</p>
          </div>
          ${renderTaskCardCloseBtn('App.closeTaskSheet()')}
        </div>
        ${tags}
        ${links}
        <div class="${actionClass}">${actions}</div>
      </div>
    `;
  },

  releaseTask(id) {
    const t = state.mapTasks.find((x) => x.task_id === id);
    if (!t || !t.claimed_by_me) return;
    t.display_state = 'unclaimed';
    t.claimed_by_me = false;
    resetBeginCaptureState();
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
    if (state.beginButtonLoading) return;
    if (!state.beginPreconditionPassed) {
      if (state.skipSafety) {
        App.openPrecondition();
        return;
      }
      document.getElementById('modal-safety').classList.add('show');
      return;
    }
    App.tryBeginCapture();
  },

  tryBeginCapture() {
    if (state.beginButtonLoading) return;

    if (shouldFailProximityCheck(state.beginProximityRetried)) {
      state.beginButtonLoading = true;
      App.renderTaskSheet();
      toast(PROXIMITY_FAIL_TOAST);
      setTimeout(() => {
        state.beginProximityRetried = true;
        state.beginButtonLoading = false;
        App.renderTaskSheet();
      }, 900);
      return;
    }

    resetBeginCaptureState();
    state.recSeconds = 0;
    state.recordingAlertDismissed = {};
    state.captureRestMode = false;
    App.renderMapTasks({ skipFit: true });
    App.renderTaskSheet();
    App.tapRecord();
  },

  confirmSafety() {
    if (document.getElementById('skip-safety').checked) state.skipSafety = true;
    App.closeModal('modal-safety');
    App.openPrecondition();
  },

  openPrecondition() {
    if (state.settings.simulateFailedChecks) {
      applyFailedChecks();
    } else if (state.shiftStartPending) {
      syncPreconditionsForShift();
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
    if (id === 'bluetooth') App.prepareBluetoothModal();
    document.getElementById(modalId).classList.add('show');
  },

  preconditionGo() {
    if (!allPreconditionsOk()) return;
    const startingShift = state.shiftStartPending;
    state.preconditionFixReturn = false;
    App.closeModal('modal-precondition');
    if (startingShift) {
      startShift();
      return;
    }
    state.beginPreconditionPassed = true;
    state.beginProximityRetried = false;
    state.beginButtonLoading = false;
    App.renderMapTasks({ skipFit: true });
    App.renderTaskSheet();
    App.updateMapChrome();
  },

  tapRecord() {
    if (!state.shiftActive) beginShiftRecording();
    state.mapMode = 'recording';
    if (!state.recSeconds) state.recSeconds = 0;
    clearInterval(state.recInterval);
    state.recInterval = setInterval(App.tickRec, 1000);
    App.updateMapChrome();
    toast('Task recording started');
  },

  stopRecording() {
    if (state.mapMode !== 'recording') return;
    state.mapMode = 'completing';
    clearInterval(state.recInterval);
    App.updateMapChrome();
  },

  completeTask() {
    if (state.completeButtonLoading) return;
    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (!t || state.mapMode !== 'completing') return;

    if (shouldFailProximityCheck(state.completeProximityRetried)) {
      state.completeButtonLoading = true;
      App.updateMapChrome();
      toast(PROXIMITY_FAIL_TOAST);
      setTimeout(() => {
        state.completeProximityRetried = true;
        state.completeButtonLoading = false;
        App.updateMapChrome();
      }, 900);
      return;
    }

    t.display_state = 'completed_local';
    t.review_status = 'awaiting';
    state.todayLoggedTasks = Number(state.todayLoggedTasks || 0) + 1;
    const durationSec = state.recSeconds || 0;
    const newRecord = {
      task_id: t.task_id,
      title: getTaskSheetTitle(t),
      mapping_title: t.poi_name,
      ticket_id: t.ticket_id || `490${Date.now().toString().slice(-6)}`,
      address: t.poi_address,
      shot_at: new Date().toISOString(),
      duration: formatRecordDuration(durationSec || 780),
      size: '18.5M',
      distance_km: t.distance_km,
      status: 'pending',
      audit_stage: 'submitted',
      thumb: ['pool', 'palm', 'street'][Math.floor(Math.random() * 3)],
      upload_status: 'uploading',
    };
    state.records.unshift(newRecord);
    setTimeout(() => {
      const rec = state.records.find((x) => x.task_id === newRecord.task_id && x.shot_at === newRecord.shot_at);
      if (rec) {
        rec.upload_status = 'uploaded';
        if (state.screen === 'tasks') App.renderTaskList();
      }
    }, 4000);
    state.mapMode = 'review';
    clearInterval(state.recInterval);
    state.recSeconds = 0;
    state.completeProximityRetried = false;
    state.completeButtonLoading = false;
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    updateBackgroundRecordingBar();
    toast('Task submitted');
  },

  exitCapture() {
    clearInterval(state.recInterval);
    state.mapMode = 'idle';
    state.recSeconds = 0;
    state.recordingAlertType = null;
    state.recordingAlertDismissed = {};
    state.recordingPausedByAlert = false;
    state.recordingDeviceFault = null;
    state.captureRestMode = false;
    App.closeModal('modal-recording-alert');
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    toast(state.shiftActive ? 'Task cancelled' : 'Capture cancelled');
  },

  showRecordingAlert(type) {
    const config = RECORDING_ALERTS[type];
    if (!config) return;

    state.recordingAlertType = type;
    if (['device_disconnect', 'wifi_lost'].includes(type)) {
      state.recordingDeviceFault = type === 'device_disconnect' ? 'device_disconnect' : 'wifi_lost';
    }

    if (state.mapMode === 'recording') pauseRecordingForAlert();

    fillRecordingAlertModal(type);
    document.getElementById('modal-recording-alert').classList.add('show');
    App.updateMapChrome();
  },

  previewRecordingAlert(type) {
    if (!['navigating', 'recording', 'completing'].includes(state.mapMode)) {
      bootDemoRecording(type);
      return;
    }
    App.showRecordingAlert(type);
  },

  dismissRecordingAlert() {
    if (state.recordingAlertType) {
      state.recordingAlertDismissed[state.recordingAlertType] = true;
    }
    state.recordingAlertType = null;
    state.recordingDeviceFault = null;
    App.closeModal('modal-recording-alert');
    resumeRecordingAfterAlert();
    App.updateMapChrome();
  },

  handleRecordingAlertPrimary() {
    const type = state.recordingAlertType;
    App.dismissRecordingAlert();

    if (type === 'device_disconnect') {
      App.prepareBluetoothModal();
      document.getElementById('modal-bluetooth').classList.add('show');
      return;
    }
    if (type === 'storage_full') {
      document.getElementById('modal-storage-settings').classList.add('show');
      return;
    }
    if (type === 'wifi_lost') {
      document.getElementById('modal-network').classList.add('show');
    }
  },

  toggleCaptureRest() {
    state.captureRestMode = !state.captureRestMode;
    toast(state.captureRestMode ? 'Over — paused segment' : 'Over — resumed');
  },

  endShift() {
    if (['navigating', 'recording', 'completing'].includes(state.mapMode)) {
      clearInterval(state.recInterval);
      state.mapMode = 'idle';
      state.recSeconds = 0;
      state.recordingAlertType = null;
      state.recordingAlertDismissed = {};
      state.recordingPausedByAlert = false;
      state.recordingDeviceFault = null;
      state.captureRestMode = false;
      resetBeginCaptureState();
      App.closeModal('modal-recording-alert');
      App.renderMapTasks();
      App.renderTaskSheet();
    }
    stopShift();
    App.updateMapChrome();
  },

  toggleShift() {
    if (state.shiftDragSuppressClick) {
      state.shiftDragSuppressClick = false;
      return;
    }
    if (state.shiftPaused) {
      if (['navigating', 'recording', 'completing'].includes(state.mapMode)) {
        toast('Finish or cancel the current task first');
        return;
      }
      resumeShift();
      App.updateMapChrome();
      return;
    }
    if (state.shiftActive) {
      if (['navigating', 'recording', 'completing'].includes(state.mapMode)) {
        toast('Finish or cancel the current task first');
        return;
      }
      pauseShift();
      App.updateMapChrome();
      return;
    }
    if (state.screen !== 'map') App.go('map');
    state.shiftStartPending = true;
    App.openPrecondition();
  },

  runShiftDemoTaskFlow(taskId) {
    const t = state.mapTasks.find((x) => x.task_id === taskId);
    if (!t || !state.shiftActive) return;
    if (t.display_state === 'unclaimed' || !t.claimed_by_me) {
      App.acceptTask(taskId);
      scheduleShiftDemo(() => App.runShiftDemoCapture(taskId), SHIFT_DEMO_STEP_MS);
      return;
    }
    App.runShiftDemoCapture(taskId);
  },

  runShiftDemoCapture(taskId) {
    const t = state.mapTasks.find((x) => x.task_id === taskId);
    if (!t || !state.shiftActive) return;

    state.selectedTaskId = taskId;
    state.skipSafety = true;
    syncPreconditionsFromDevice();
    state.preconditionGps = { authorized: true, distanceOk: true };
    syncGpsPrecondition();
    state.recSeconds = 0;
    state.recordingAlertDismissed = {};
    state.captureRestMode = false;
    state.mapMode = 'navigating';
    App.renderMapTasks({ skipFit: true });
    App.renderTaskSheet();
    App.updateMapChrome();
    toast('Navigation started');

    scheduleShiftDemo(() => {
      if (!state.shiftActive) return;
      App.tapRecord();
    }, SHIFT_DEMO_STEP_MS);

    scheduleShiftDemo(() => {
      if (!state.shiftActive || state.mapMode !== 'recording') return;
      App.stopRecording();
    }, SHIFT_DEMO_STEP_MS * 2);

    scheduleShiftDemo(() => {
      if (!state.shiftActive || state.mapMode !== 'completing') return;
      state.completeProximityRetried = true;
      App.completeTask();
      toastSuccess('Task submitted');
    }, SHIFT_DEMO_STEP_MS * 3);

    scheduleShiftDemo(() => {
      if (!state.shiftActive) return;
      state.mapMode = 'idle';
      state.selectedTaskId = null;
      App.renderMapTasks();
      App.renderTaskSheet();
      App.updateMapChrome();
      App.locateUser();
    }, SHIFT_DEMO_STEP_MS * 4);
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
    state.onboardingComplete = false;
    clearInterval(state.recInterval);
    stopBackgroundRecording();
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    App.onPassInput();
    App.clearLoginError();
    App.initLoginForm();
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
        updateMapStatsWidgets();
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
    const metrics = computeTodayMetrics();
    document.getElementById('tasks-summary').innerHTML = `
      <div class="tasks-metrics">
        <article class="tasks-metric-card">
          <span class="tasks-metric-badge">Today's KM</span>
          <div class="tasks-metric-main">
            <span class="tasks-metric-num">${metrics.km}</span>
            <span class="tasks-metric-unit">km</span>
          </div>
          <p class="tasks-metric-goal">${metrics.km} / ${metrics.targets.km} km</p>
          <div class="tasks-metric-progress" role="progressbar" aria-valuenow="${metrics.kmPct}" aria-valuemin="0" aria-valuemax="100">
            <span class="tasks-metric-progress-fill" style="width:${metrics.kmPct}%"></span>
          </div>
        </article>
        <article class="tasks-metric-card">
          <span class="tasks-metric-badge">Today's Tasks</span>
          <div class="tasks-metric-main">
            <span class="tasks-metric-num">${metrics.tasks}</span>
            <span class="tasks-metric-unit">tasks</span>
          </div>
          <p class="tasks-metric-goal">${metrics.tasks} / ${metrics.targets.tasks} tasks</p>
          <div class="tasks-metric-progress" role="progressbar" aria-valuenow="${metrics.tasksPct}" aria-valuemin="0" aria-valuemax="100">
            <span class="tasks-metric-progress-fill tasks-metric-progress-fill--tasks" style="width:${metrics.tasksPct}%"></span>
          </div>
        </article>
      </div>`;

    document.getElementById('task-date-filter-label').textContent = state.taskDateLabel;

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
    const title = r.title || r.mapping_title || r.task_id;
    const copyIcon =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="14" rx="2"/><path d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

    return `<article class="task-submit-card" onclick="App.openTaskDetail('${r.task_id}')">
      ${renderTaskCardCloseBtn(`event.stopPropagation();App.dismissTaskCard('${r.task_id}')`)}
      <div class="task-submit-thumb task-media-thumb--${r.thumb || 'street'}"></div>
      <div class="task-submit-body">
        <h4 class="task-submit-title">${title}</h4>
        ${renderTaskUploadStatusBadge(r)}
        <p class="task-submit-time">${formatRecordDate(r.shot_at)}</p>
        <p class="task-submit-meta">${r.duration} | ${r.size}</p>
        <div class="task-submit-actions">
          <button type="button" class="task-submit-btn task-submit-btn--copy" onclick="event.stopPropagation();App.copyTicketId('${r.ticket_id || r.task_id}')">${copyIcon}<span>Copy ID</span></button>
        </div>
      </div>
    </article>`;
  },

  refreshTaskList() {
    App.renderTaskList();
    toast('Refreshed');
  },

  openDailySummary() {
    App.go('daily-summary');
  },

  shiftDailySummaryMonth(delta) {
    const d = state.dailySummaryMonth;
    state.dailySummaryMonth = new Date(d.getFullYear(), d.getMonth() + delta, 1);
    const daysInMonth = new Date(
      state.dailySummaryMonth.getFullYear(),
      state.dailySummaryMonth.getMonth() + 1,
      0
    ).getDate();
    if (state.dailySummarySelectedDay > daysInMonth) {
      state.dailySummarySelectedDay = daysInMonth;
    }
    App.renderDailySummary();
  },

  selectDailySummaryDay(day) {
    state.dailySummarySelectedDay = day;
    App.renderDailySummary();
  },

  renderDailySummary() {
    const el = document.getElementById('daily-summary-body');
    if (!el) return;

    const monthDate = state.dailySummaryMonth;
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthLabel = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const monthData = getDailySummaryMonthData(year, month);
    const targets = state.dailySummaryTargets;

    let cells = '';
    for (let i = 0; i < firstDow; i += 1) {
      cells += '<div class="daily-cell daily-cell--blank"></div>';
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const info = monthData[day] || { status: 'empty', km: 0, tasks: 0 };
      const hasMetrics = ['pass', 'fail'].includes(info.status);
      const kmLine = hasMetrics ? `${info.km.toFixed(1)}km` : '';
      const tasksLine = hasMetrics ? `${info.tasks}/${targets.tasks}` : '';
      cells += `<div class="daily-cell daily-cell--${info.status}" aria-label="Day ${day}, ${formatDailySummaryStatus(info.status)}">
        <span class="daily-cell-day">${day}</span>
        <span class="daily-cell-icon-wrap">${renderDailySummaryStatusIcon(info.status)}</span>
        <span class="daily-cell-meta">
          <span class="daily-cell-meta-line">${kmLine || '&nbsp;'}</span>
          <span class="daily-cell-meta-line">${tasksLine || '&nbsp;'}</span>
        </span>
      </div>`;
    }

    el.innerHTML = `
      <section class="daily-calendar-card" aria-label="Monthly attendance">
        <div class="daily-summary-month">
          <button type="button" class="daily-month-nav" onclick="App.shiftDailySummaryMonth(-1)" aria-label="Previous month">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <strong>${monthLabel}</strong>
          <button type="button" class="daily-month-nav" onclick="App.shiftDailySummaryMonth(1)" aria-label="Next month">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>

        <div class="daily-legend" aria-hidden="true">
          <span class="daily-legend-item"><i class="daily-legend-dot daily-legend-dot--pass"></i>Completed</span>
          <span class="daily-legend-item"><i class="daily-legend-dot daily-legend-dot--fail"></i>Missed</span>
          <span class="daily-legend-item"><i class="daily-legend-dot daily-legend-dot--pending"></i>Holiday</span>
        </div>

        <div class="daily-weekdays">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
        <div class="daily-calendar-grid">${cells}</div>
      </section>`;
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
    `;
  },

  copyTicketId(id) {
    navigator.clipboard?.writeText(id);
    toast('Copied ID');
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

  onTaskCardClick(taskId) {
    App.openTaskDetail(taskId);
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
  if (sheet && sheet.classList.contains('show') && e.target === sheet) App.closeFilterSheet();
  const layerPanel = document.getElementById('progress-layer-panel');
  if (layerPanel && !e.target.closest('.layer-panel') && !e.target.closest('.layer-fab')) {
    layerPanel.classList.remove('show');
  }
});

window.toast = toast;
window.App = App;

function bootApp() {
  const bootParams = new URLSearchParams(location.search);
  if (bootParams.get('checks') === 'fail' || bootParams.get('fail') === '1') {
    state.settings.simulateFailedChecks = true;
    applyFailedChecks();
  }
  if (bootParams.get('demo') === 'map') {
    if (!state.settings.simulateFailedChecks) applyReadyChecks();
    state.onboardingComplete = true;
    App.showLoginScreen();
    App.initLoginForm();
    App.go('map');
    return;
  }
  if (bootParams.get('demo') === 'recording') {
    const alertMap = {
      disconnect: 'device_disconnect',
      storage: 'storage_full',
      memory: 'storage_full',
      wifi: 'wifi_lost',
    };
    const alert = alertMap[bootParams.get('alert')] || null;
    bootDemoRecording(alert);
    return;
  }
  if (bootParams.get('demo') === 'precheck') {
    state.auth = { region: 'US', userId: 'US-156', displayName: 'User Wang' };
    App.showLoginScreen();
    App.go('precheck');
    return;
  }
  if (bootParams.get('precheckFail') === '1') {
    state.precheckConnectFail = true;
  }
  if (bootParams.get('skipSplash') === '1') {
    const splash = document.getElementById('screen-splash');
    if (splash) {
      splash.classList.remove('active');
      splash.classList.add('is-dismissed');
    }
    App.showLoginScreen();
    App.initLoginForm();
    return;
  }
  App.startSplash();
}

try {
  bindShiftControls();
  bootApp();
} catch (err) {
  console.error('GoSnap boot failed', err);
  App.showLoginScreen();
  try {
    App.initLoginForm();
  } catch (initErr) {
    console.error('initLoginForm failed during boot fallback', initErr);
  }
}
