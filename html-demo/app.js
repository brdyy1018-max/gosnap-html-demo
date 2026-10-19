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
const GOPRO_MAX_SELECTION = 1;
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
  '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3.2 20.2 12 12 20.8 3.8 12Z" stroke-linejoin="round"/></svg>';

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
    <button type="button" class="task-sheet-link" onclick="event.stopPropagation(); toast('Opening Google Maps…')">
      ${TASK_SHEET_NAV_ICON}
      <span>Navigate</span>
    </button>
    <button type="button" class="task-sheet-link" onclick="event.stopPropagation(); App.copyTicketId('${t.ticket_id || t.task_id}')">
      ${TASK_SHEET_COPY_ICON}
      <span>Copy ID</span>
    </button>
  </div>`;
}

function beginCardVisible() {
  const sheet = document.getElementById('task-sheet');
  if (!sheet || sheet.classList.contains('hidden')) return false;
  if (state.mapMode === 'next' || state.mapMode === 'recording') return false;
  if (state.mapMode === 'enroute' && !state.enrouteArrived) return false;
  const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
  return !!(task && isClaimedTask(task));
}

function renderStartActions(task, label = 'Begin', action = `App.beginAcceptedTask('${task.task_id}')`) {
  return `<div class="task-sheet-actions split">
    <button type="button" class="task-release-btn" onclick="event.stopPropagation(); App.releaseTask('${task.task_id}')">
      ${TASK_SHEET_RELEASE_ICON}
      <span>Release</span>
    </button>
    <button type="button" class="task-sheet-begin" onclick="event.stopPropagation(); ${action}">${label}</button>
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
  claimDeckKeptIds: [],
  dismissedRecordIds: [],
  mapMode: 'idle', // idle | overview | navigating | enroute | recording | completing | review
  transitPts: null,
  transitDistanceM: 0,
  transitLayers: null,
  enrouteArrived: false,
  taskFoldOpen: false,
  autoFinishing: false,
  enrouteStartedBackground: false,
  nextDestHidden: false,
  mapCameraMode: 'follow-north',
  routeOverviewHold: false,
  mapBearing: 0,
  mapFreeBrowse: false,
  navFollow: false,
  navDistanceM: 0,
  navSimTimer: null,
  navSimGen: 0,
  navRecenterTimer: null,
  mapGestureSuppress: 0,
  navGesturesBound: false,
  userPos: null,
  userHeadingTrusted: null,
  userSpeed: 0,
  userMarker: null,
  routeArrowMarkers: [],
  routeSplitLines: [],
  recSeconds: 0,
  recInterval: null,
  cardRecording: false,
  backgroundRecording: false,
  backgroundRecSeconds: 0,
  backgroundRecInterval: null,
  shiftActive: false,
  shiftPaused: false,
  collectMode: 'manual',
  shiftDistanceKm: 0,
  shiftDemoTimers: [],
  shiftStartPending: false,
  recordAfterPrecondition: false,
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
  uploadDeviceConnected: false,
  uploadBatchRunning: false,
  uploadPaused: false,
  uploadConnecting: false,
  uploadActiveTitle: null,
  uploadDoneCount: 0,
  uploadTotalCount: 0,
  uploadQueueIndex: 0,
  uploadQueueTargets: null,
  uploadTick: null,
  uploadQueue: [
    { collect_id: 'c_upload_101', task_id: 'task_upload_101', title: 'S Vermont Ave', size: '42.1M', state: 'pending', progress: 0, retry_count: 0 },
    { collect_id: 'c_pending_103', task_id: 'task_pending_103', title: 'Wilshire Blvd', size: '38.5M', state: 'pending', progress: 0, retry_count: 1 },
    { collect_id: 'c_fail_106', task_id: 'task_fail_106', title: 'Crenshaw Blvd', size: '51.0M', state: 'failed', progress: 0, retry_count: 2 },
    { collect_id: 'c_done_100', task_id: 'task_done_100', title: 'Sorrento Valley', size: '50.2M', state: 'uploaded', progress: 100, retry_count: 0 },
  ],
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
      upload_progress: 100,
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
      audit_stage: 'submitted',
      thumb: 'palm',
      upload_status: 'pending',
      upload_progress: 0,
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
      upload_progress: 100,
    },
    {
      task_id: 'street_5748392011',
      title: 'Street 5748392011',
      mapping_title: 'Street 5748392011',
      ticket_id: '490511883-452',
      address: '3600 Crenshaw Blvd, Los Angeles, CA 90016, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(15, 40, 0, 0);
        return d.toISOString();
      })(),
      duration: '15m22s',
      size: '28.4M',
      distance_km: 5.8,
      status: 'pending',
      audit_stage: 'submitted',
      thumb: 'street',
      upload_status: 'failed',
      upload_progress: 37,
      upload_retry_count: 1,
    },
    {
      task_id: 'street_6612048831',
      title: 'Street 6612048831',
      mapping_title: 'Street 6612048831',
      ticket_id: '490509441-439',
      address: '2200 Figueroa St, Los Angeles, CA 90007, United States',
      shot_at: (() => {
        const d = new Date();
        d.setHours(16, 5, 0, 0);
        return d.toISOString();
      })(),
      duration: '9m48s',
      size: '16.2M',
      distance_km: 3.9,
      status: 'pending',
      audit_stage: 'submitted',
      thumb: 'coast',
      upload_status: 'paused',
      upload_progress: 62,
      upload_retry_count: 0,
    },
    {
      task_id: 'task_vermont_yesterday',
      title: 'S Vermont Ave Mapping',
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
      audit_stage: 'submitted',
      thumb: 'pool',
      upload_status: 'pending',
      upload_progress: 0,
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
  if (t.display_state === 'discarded') return 'discarded';
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

function clearTransitLayers() {
  (state.transitLayers || []).forEach((layer) => {
    if (layer) layer.remove();
  });
  state.transitLayers = null;
}

function clearMapTaskLayers() {
  if (!state.map) return;
  clearRouteDecorations();
  clearTransitLayers();
  Object.values(state.mapTaskLayers).forEach((layers) => {
    layers.line.remove();
    if (layers.done) layers.done.remove();
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

function requestRoad(start, end) {
  const key = routeCacheKey(start, end);
  if (state.routeCache[key] && state.routeCache[key].length > 2) {
    return Promise.resolve(state.routeCache[key]);
  }
  if (!state.routePromises) state.routePromises = {};
  if (state.routePromises[key]) return state.routePromises[key];
  state.routePending.add(key);
  const promise = fetchRoadRoute(start, end)
    .catch(() => fetchRoadRoute(start, end))
    .then((points) => {
      const pts = normPts(points);
      if (pts.length > 2) state.routeCache[key] = pts;
      return state.routeCache[key] || pts;
    })
    .finally(() => {
      state.routePending.delete(key);
      if (state.routePromises) delete state.routePromises[key];
    });
  state.routePromises[key] = promise;
  return promise;
}

function ensureTaskRoutes(tasks, onUpdate) {
  tasks.forEach((t) => {
    if (t._routeLocked) return;
    const { start, end } = getTaskEndpoints(t);
    const key = routeCacheKey(start, end);

    if (state.routeCache[key] && state.routeCache[key].length > 2) {
      t.routedPolyline = state.routeCache[key];
      t._maneuverKey = null;
      return;
    }

    requestRoad(start, end)
      .then((points) => {
        if (!points || points.length < 3) return;
        tasks.forEach((task) => {
          if (task._routeLocked) return;
          const ep = getTaskEndpoints(task);
          if (routeCacheKey(ep.start, ep.end) !== key) return;
          task.routedPolyline = points;
          task._maneuverKey = null;
        });
        onUpdate?.();
      })
      .catch(() => {});
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
  const rounded = Math.round(km * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} km`;
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
  const taskActive = ['navigating', 'enroute', 'recording', 'completing'].includes(state.mapMode);
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
  return { distanceKm: state.shiftDistanceKm || 0, compactTop: false, mode: 'off' };
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
      const sessionOn = state.shiftActive || state.shiftPaused;
      el.classList.toggle('is-on-shift', state.shiftActive && !state.shiftPaused);
      el.classList.toggle('is-paused', state.shiftPaused);
      el.classList.toggle('is-session', sessionOn);
      el.classList.toggle('is-recording', state.backgroundRecording);
      el.classList.toggle('is-task-overlay', ctx.mode === 'task');
      el.classList.toggle('is-auto-running', state.collectMode === 'auto' && (state.shiftActive || state.shiftPaused));
      const btn = el.querySelector('.map-shift-btn');
      const actionEl = el.querySelector('[data-shift-action]');
      const recDot = el.querySelector('[data-shift-rec-dot]');
      if (btn) {
        btn.setAttribute(
          'aria-pressed',
          state.shiftActive || state.shiftPaused ? 'true' : 'false'
        );
        btn.setAttribute('aria-label', sessionOn ? 'Stop collecting' : 'Start collecting');
      }
      if (actionEl) actionEl.textContent = sessionOn ? 'Stop' : 'Start';
      el.querySelectorAll('[data-collect-mode]').forEach((modeBtn) => {
        modeBtn.classList.toggle('is-on', modeBtn.dataset.collectMode === state.collectMode);
        modeBtn.disabled = sessionOn;
      });
      el.querySelector('.collect-mode')?.classList.toggle('is-locked', sessionOn);
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
    if (state.mapMode === 'enroute' && !state.enrouteArrived) {
      const time = document.getElementById('capture-time');
      if (time) time.textContent = formatTime(state.backgroundRecSeconds);
    }
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
  if (!state.backgroundRecSeconds) state.backgroundRecSeconds = 0;
  startBackgroundRecording();
}

function seedCollectUser() {
  if (state.userPos) return;
  const seed = listNearbyOpenTasks(null)[0];
  const start = seed ? getTaskEndpoints(seed.task).start : null;
  if (start) state.userPos = { lat: start.lat - 0.0022, lng: start.lng };
}

function startShift() {
  if (state.shiftActive) return;
  beginShiftRecording();
  if (state.collectMode === 'auto') beginAutoCollect();
  else runShiftDemo();
}

function stopShift() {
  state.shiftActive = false;
  state.shiftPaused = false;
  clearShiftDemo();
  stopBackgroundRecording();
  updateMapStatsWidgets();
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
  state.userSpeed = 0;
  clearTimeout(state.navRecenterTimer);
  updateRecenterButton();
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

function bindShiftControls() {
  const btn = document.getElementById('map-shift-btn');
  if (!btn || btn.dataset.shiftBound === '1') return;
  btn.dataset.shiftBound = '1';
}

function enterMapScreen() {
  if (!state.map) App.initMap();
  else state.map.invalidateSize();
  App.renderMapTasks();
  syncMapTaskSheet();
  updateBackgroundRecordingBar();
  updateMapStatsWidgets();
  if (state.mapMode === 'recording' && state.navFollow && !state.mapFreeBrowse) followCamera(false);
  if (state.mapMode === 'overview') {
    const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
    if (task) requestAnimationFrame(() => fitTaskWithNeighbors(task));
  }
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
  seedCollectUser();
  const nearby = listNearbyOpenTasks(state.userPos);
  state.selectedTaskId = nearby[0]?.task.task_id || null;
  state.mapMode = 'next';
  state.continuousCollect = true;
  state.recSeconds = 0;
  clearInterval(state.recInterval);
  state.recInterval = null;
  state.transitPts = null;
  state.enrouteArrived = false;
  state.navFollow = false;
  state.navDistanceM = 0;
  if (state.screen !== 'map') App.go('map');
  App.renderPushedTaskCard(null);
  App.renderNextTaskDeck();
  App.renderMapTasks();
  App.updateMapChrome();
  toast(nearby.length ? 'Pick a task, then tap Begin' : 'No claimed tasks nearby');
}

const AT_TASK_START_M = 50;

function beginAutoCollect() {
  clearShiftDemo();
  seedCollectUser();
  const nearby = listNearbyOpenTasks(state.userPos);
  state.continuousCollect = true;
  state.recSeconds = 0;
  clearInterval(state.recInterval);
  state.recInterval = null;
  state.transitPts = null;
  state.enrouteArrived = false;
  state.navFollow = false;
  state.navDistanceM = 0;
  state.cardRecording = false;
  App.renderPushedTaskCard(null);
  if (!nearby.length) {
    state.mapMode = 'idle';
    state.selectedTaskId = null;
    if (state.screen !== 'map') App.go('map');
    App.renderMapTasks();
    App.updateMapChrome();
    toast('No claimed tasks nearby');
    return;
  }
  const nearest = nearby[0];
  state.selectedTaskId = nearest.task.task_id;
  if (nearest.distanceM <= AT_TASK_START_M) {
    state.mapMode = 'enroute';
    state.enrouteArrived = true;
    if (state.screen !== 'map') App.go('map');
    App.showArrivedTaskCard();
    return;
  }
  state.mapMode = 'next';
  if (state.screen !== 'map') App.go('map');
  App.startNextNavigation(nearest.task.task_id);
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
  const taskCount = today.length || state.todayLoggedTasks || 3;
  const kmDisplay = kmSum > 0 ? (kmSum * (12.4 / 18.4)).toFixed(1) : '12.4';
  const kmProgress = kmSum > 0 ? (kmSum * (7.4 / 18.4)).toFixed(1) : '7.4';
  const kmProgressNum = parseFloat(kmProgress, 10);
  return {
    kmDisplay,
    kmProgress,
    kmPct: Math.min(100, Math.round((kmProgressNum / targets.km) * 100)),
    tasks: String(taskCount),
    tasksPct: Math.min(100, Math.round((taskCount / targets.tasks) * 100)),
    targets,
  };
}

const TASKS_METRIC_KM_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10Z" fill="#fff"/><circle cx="12" cy="11" r="2.2" fill="#f5a623"/></svg>';
const TASKS_METRIC_TASKS_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true"><rect x="5" y="6" width="14" height="13" rx="2" fill="#fff"/><path d="M9 4.5V7M15 4.5V7M5 10.5h14" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><path d="m9.2 14.2 1.6 1.6 3.6-3.8" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';


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
  const s = r.upload_status;
  if (s === 'pending' || s === 'uploading' || s === 'paused' || s === 'failed' || s === 'uploaded') {
    return s;
  }
  return 'uploaded';
}

function isRecordUploadIncomplete(r) {
  const s = getRecordUploadStatus(r);
  return s === 'pending' || s === 'uploading' || s === 'paused' || s === 'failed';
}

function getUploadProgress(r) {
  const p = Number(r.upload_progress);
  if (Number.isFinite(p)) return Math.max(0, Math.min(100, Math.round(p)));
  return getRecordUploadStatus(r) === 'uploaded' ? 100 : 0;
}

function getIncompleteUploadRecords() {
  return state.records.filter((r) => isRecordUploadIncomplete(r));
}

function syncUploadQueueFromRecords() {
  state.uploadQueue = state.records
    .filter((r) => getRecordUploadStatus(r) !== 'uploaded' || r._keepInUploadQueue)
    .map((r) => ({
      collect_id: r.task_id,
      task_id: r.task_id,
      title: r.title || r.mapping_title || r.task_id,
      size: r.size || '—',
      state: getRecordUploadStatus(r),
      progress: getUploadProgress(r),
      retry_count: r.upload_retry_count || 0,
    }));
}

const TASK_COPY_ID_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="14" rx="2"/><path d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
const TASK_RETRY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 12a8 8 0 10-2.3 5.7" stroke-linecap="round"/><path d="M20 12v-5h-5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const TASK_RESUME_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 6.5v11l9-5.5-9-5.5Z" stroke-linejoin="round"/></svg>';

function renderTaskUploadStatusBadge(r) {
  const status = getRecordUploadStatus(r);
  if (status === 'uploading') {
    return `<span class="task-upload-status task-upload-status--uploading"><span class="task-upload-spinner" aria-hidden="true"></span>Uploading</span>`;
  }
  if (status === 'pending') {
    return `<span class="task-upload-status task-upload-status--pending">Waiting</span>`;
  }
  if (status === 'paused') {
    return `<span class="task-upload-status task-upload-status--paused">Paused</span>`;
  }
  if (status === 'failed') {
    return `<span class="task-upload-status task-upload-status--failed">Failed</span>`;
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
    state.screen === 'map' && ['navigating', 'enroute', 'recording', 'completing', 'next'].includes(state.mapMode);
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
      'upload-status': 'screen-upload-status',
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
    if (screen === 'upload-status') App.renderUploadStatus();
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
      state.precheckDiscoveredDevices = ['GoPro-1'];
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
        toast('Only one device can be connected');
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
    if (!state.selectedGopros.length) {
      toast('Connect one device to continue');
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
    state.selectedTaskId = null;
    state.mapMode = 'idle';
    if (typeof stopNavSimulation === 'function') stopNavSimulation();
    if (typeof clearShiftDemo === 'function') clearShiftDemo();
    toastSuccess(`Connected to ${state.selectedGopros[0]}`);
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
      state.recordAfterPrecondition = false;
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

    const driving = ['navigating', 'enroute', 'recording', 'completing'].includes(state.mapMode);
    const overview = state.mapMode === 'overview';
    const arrivedCard = state.mapMode === 'enroute' && state.enrouteArrived;

    const turnPinned = state.mapMode === 'recording' || (state.mapMode === 'enroute' && !arrivedCard);
    topChrome.classList.toggle('hidden', turnPinned);
    nav.classList.toggle('hidden', arrivedCard || (state.mapMode !== 'recording' && state.mapMode !== 'enroute'));
    captureSheet.classList.toggle('hidden', !driving || arrivedCard);
    mapFloats.classList.toggle('hidden', !driving || arrivedCard);

    const pickingNext = state.mapMode === 'next' || state.mapMode === 'claim';
    const hideSheet = ((driving && !arrivedCard) || !state.selectedTaskId) && !pickingNext;
    sheet.classList.toggle('hidden', hideSheet);

    mapRail.classList.remove('hidden');
    const filterBtn = document.getElementById('map-filter-btn');
    if (filterBtn) filterBtn.classList.toggle('hidden', driving || overview);

    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (t && driving) {
      document.getElementById('capture-title').textContent = t.poi_name;
    }

    document.getElementById('capture-enroute')?.classList.toggle('hidden', state.mapMode !== 'enroute');
    const turnHud = state.mapMode === 'recording' || (state.mapMode === 'enroute' && !arrivedCard);
    document.querySelector('.capture-submit-row')?.classList.toggle('hidden', arrivedCard);
    document.getElementById('capture-submit')?.classList.toggle('hidden', turnHud);
    document.getElementById('map-discard')?.classList.toggle('hidden', !(turnHud || beginCardVisible()));
    const foldBtn = document.getElementById('map-task-fold');
    const foldCard = document.getElementById('task-fold-card');
    if (!turnHud) state.taskFoldOpen = false;
    foldBtn?.classList.toggle('hidden', !turnHud);
    foldBtn?.classList.toggle('is-open', !!state.taskFoldOpen);
    foldBtn?.setAttribute('aria-expanded', String(!!state.taskFoldOpen));
    foldCard?.classList.toggle('hidden', !turnHud || !state.taskFoldOpen);
    if (turnHud && state.taskFoldOpen) App.renderTaskFoldCard();

    if (driving && !arrivedCard) {
      renderCaptureControls();
      const time = formatTime(state.mapMode === 'enroute' ? state.backgroundRecSeconds : state.recSeconds);
      document.getElementById('capture-time').textContent = time;
      document.getElementById('capture-dot').classList.toggle('hidden', state.mapMode === 'navigating' && !state.recSeconds);
    }

    const alertModal = document.getElementById('modal-recording-alert');
    if (state.recordingAlertType === 'storage_full') {
      state.recordingAlertType = null;
      alertModal?.classList.remove('show');
      document.getElementById('modal-ios-storage')?.classList.remove('show');
      document.getElementById('modal-storage')?.classList.remove('show');
    }
    if (alertModal && !state.recordingAlertType) alertModal.classList.remove('show');

    const showRest = state.mapMode === 'recording' && state.recSeconds >= 995;
    document.getElementById('map-float-rest').classList.toggle('hidden', !showRest);

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

    updateMapStatsWidgets();
    updateBackgroundRecordingBar();
    updateBottomNav();
    updateNavBanner();
    updateOrientButton();
    updateRecenterButton();
    document.getElementById('screen-map')?.classList.toggle('is-recording', state.mapMode === 'recording');
    document.getElementById('screen-map')?.classList.toggle('is-enroute', state.mapMode === 'enroute');
    document.getElementById('screen-map')?.classList.toggle('is-arrived', arrivedCard);
    App.syncNextDestination();
  },

  tickRec() {
    if (state.shiftPaused || state.discardSheetOpen) return;
    state.recSeconds++;
    const t = formatTime(state.recSeconds);
    const captureTime = document.getElementById('capture-time');
    if (captureTime) captureTime.textContent = t;
    App.updateMapChrome();
  },

  initMap() {
    state.map = L.map('map', {
      zoomControl: false,
      rotate: true,
      bearing: 0,
      rotateControl: false,
      touchRotate: false,
      shiftKeyRotate: false,
    }).setView([34.06, -118.32], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(state.map);
    bindShiftControls();
    bindNavGestures();
    App.renderMapTasks();
    updateOrientButton();
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

    const visible = filterTasksByMapFilters(state.mapTasks, state.mapFilters).filter(
      (t) => !t.overview_only || t.task_id === state.selectedTaskId
    );
    const driving = ['navigating', 'enroute', 'recording', 'completing'].includes(state.mapMode);
    const inReview = state.mapMode === 'review';
    const overview = state.mapMode === 'overview';
    let tasksToDraw = visible;

    if ((driving || inReview) && state.selectedTaskId) {
      tasksToDraw = visible.filter((t) => t.task_id === state.selectedTaskId);
    } else if (state.mapMode === 'next') {
      tasksToDraw = visible.filter((t) => isClaimedTask(t));
    }

    ensureTaskRoutes(tasksToDraw, () => {
      scheduleRouteRefresh('map', (opts) => App.renderMapTasks(opts));
    });

    tasksToDraw.forEach((t) => {
      const latlngs = getTaskLatLngs(t);
      const endpoints = getTaskEndpoints(t);
      const isSelected = t.task_id === state.selectedTaskId;
      const navigatingFocus = isSelected && (state.mapMode === 'recording' || state.mapMode === 'completing' || state.mapMode === 'enroute' || state.mapMode === 'navigating');
      let line;
      let done = null;
      if (navigatingFocus && state.mapMode === 'enroute') {
        line = L.polyline(latlngs, {
          color: '#c5ccd4',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(state.map);
        state.routeSplitLines = [null, line];
        const transit = normPts(state.transitPts);
        if (transit.length > 1) {
          const split = splitRouteLatLngs(transit, state.transitDistanceM || 0);
          let doneLine = null;
          if (split.done.length > 1) {
            doneLine = L.polyline(split.done, {
              color: '#93c5fd',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(state.map);
          }
          const pendingLine = L.polyline(split.pending.length > 1 ? split.pending : transit, {
            color: '#1a73e8',
            weight: 7,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(state.map);
          state.transitLayers = [doneLine, pendingLine];
          drawRouteArrows(split.pending.length > 1 ? split.pending : transit);
        }
      } else if (navigatingFocus) {
        const along = state.mapMode === 'recording' || state.mapMode === 'completing' ? state.navDistanceM || 0 : 0;
        const split = splitRouteLatLngs(latlngs, along);
        if (split.done.length > 1) {
          done = L.polyline(split.done, {
            color: '#94a3b8',
            weight: 7,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(state.map);
        }
        line = L.polyline(split.pending.length > 1 ? split.pending : latlngs, {
          color: '#9aa3ad',
          weight: 8,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(state.map);
        state.routeSplitLines = [done, line];
        drawRouteArrows(split.pending.length > 1 ? split.pending : latlngs);
        state._arrowAt = along;
      } else {
        line = L.polyline(latlngs, getTaskLineStyle(t, isSelected)).addTo(state.map);
      }
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

      state.mapTaskLayers[t.task_id] = { line, done, start: startMarker, end: endMarker };
    });

    const selected = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);

    if (!options.skipFit && state.mapMode !== 'recording' && state.mapMode !== 'completing' && state.mapMode !== 'enroute') {
      if (selected && (overview || state.mapMode === 'next' || state.mapMode === 'claim' || state.mapMode === 'idle')) {
        fitTaskWithNeighbors(selected);
      } else if (selected) {
        state.map.fitBounds(L.latLngBounds(getTaskLatLngs(selected)), { padding: [60, 40], animate: true });
      } else if (tasksToDraw.length) {
        const bounds = L.latLngBounds(tasksToDraw.flatMap((t) => getTaskLatLngs(t)));
        state.map.fitBounds(bounds, { padding: [40, 40], animate: true });
      }
    }
    updateUserMarker();
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
    if (['navigating', 'enroute', 'recording', 'completing'].includes(state.mapMode)) return;
    const task = state.mapTasks.find((x) => x.task_id === taskId);
    if (!task) return;
    resetBeginCaptureState();
    const unclaimed = isUnclaimedTask(task);
    if (state.mapMode === 'next') {
      if (!isClaimedTask(task)) return;
      state.selectedTaskId = taskId;
      App.markNextDeckCard(taskId);
      App.renderMapTasks();
      App.updateMapChrome();
      return;
    }
    if (state.mapMode === 'claim' && (unclaimed || state.claimDeckKeptIds.includes(taskId))) {
      state.selectedTaskId = taskId;
      App.markNextDeckCard(taskId);
      App.renderMapTasks();
      App.updateMapChrome();
      return;
    }
    state.selectedTaskId = taskId;
    if (unclaimed) {
      state.mapMode = 'claim';
      App.renderClaimDeck();
      App.renderMapTasks();
      App.updateMapChrome();
      return;
    }
    if (state.mapMode === 'claim' || state.mapMode === 'next') state.mapMode = 'idle';
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
  },

  closeTaskSheet() {
    state.selectedTaskId = null;
    resetBeginCaptureState();
    if (state.mapMode === 'enroute' && state.enrouteArrived) {
      state.mapMode = 'idle';
      state.enrouteArrived = false;
      clearTransitLayers();
      state.transitPts = null;
    }
    if (state.mapMode === 'review' || state.mapMode === 'claim') state.mapMode = 'idle';
    state.claimDeckKeptIds = [];
    const sheet = document.getElementById('task-sheet');
    sheet?.classList.remove('is-next-deck', 'is-recommend');
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
    if (state.mapMode === 'next') {
      App.renderNextTaskDeck();
      return;
    }
    if (state.mapMode === 'claim') {
      App.renderClaimDeck();
      return;
    }
    const sheet = document.getElementById('task-sheet');
    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (!t) {
      sheet.classList.add('hidden');
      return;
    }
    sheet.classList.remove('hidden');

    const completed = t.display_state === 'completed_local';
    const inReview = state.mapMode === 'review' || completed;
    const tags = renderTaskBadges(t);
    const links = renderTaskSheetLinks(t);
    const title = getTaskSheetTitle(t);

    let actions = '';
    const actionClass = 'task-sheet-actions';
    if (inReview) {
      const status = t.review_status || 'awaiting';
      const cls =
        status === 'rejected' ? 'is-failed' : status === 'approved' ? 'is-success' : '';
      actions = `<button type="button" class="btn btn-submitted task-sheet-accept ${cls}" disabled>${REVIEW_STATUS_LABELS[status] || REVIEW_STATUS_LABELS.awaiting}</button>`;
    } else if (isClaimedTask(t)) {
      actions = renderStartActions(t);
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
    state.claimDeckKeptIds = state.claimDeckKeptIds.filter((x) => x !== id);
    resetBeginCaptureState();
    state.selectedTaskId = id;
    state.mapMode = 'claim';
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    toast('Task released');
  },

  acceptTask(id) {
    const t = state.mapTasks.find((x) => x.task_id === id);
    if (!t || !isUnclaimedTask(t)) return;
    t.display_state = 'claimed';
    t.claimed_by_me = true;
    if (!state.claimDeckKeptIds.includes(id)) state.claimDeckKeptIds.push(id);
    state.selectedTaskId = id;
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    toast('Task accepted');
  },

  beginAcceptedTask(id) {
    const t = state.mapTasks.find((x) => x.task_id === id);
    if (!t || !isClaimedTask(t)) return;
    state.selectedTaskId = id;
    state.claimDeckKeptIds = [];
    state.mapMode = 'idle';
    App.startOverviewRecording();
  },

  openBegin() {
    if (state.beginButtonLoading) return;
    syncPreconditionsFromDevice();
    if (allPreconditionsOk() && !state.settings.simulateFailedChecks) {
      state.beginPreconditionPassed = true;
      App.tryBeginCapture();
      return;
    }
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
    syncPreconditionsFromDevice();
    if (allPreconditionsOk() && !state.settings.simulateFailedChecks) {
      state.beginPreconditionPassed = true;
      App.tryBeginCapture();
      return;
    }
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
    if (allPreconditionsOk() && !state.settings.simulateFailedChecks) {
      App.preconditionGo();
      return;
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
    const recordAfter = state.recordAfterPrecondition;
    state.recordAfterPrecondition = false;
    state.preconditionFixReturn = false;
    App.closeModal('modal-precondition');
    if (startingShift) {
      startShift();
      return;
    }
    state.beginPreconditionPassed = true;
    state.beginProximityRetried = false;
    state.beginButtonLoading = false;
    if (recordAfter) {
      App.startOverviewRecording();
      return;
    }
    App.renderMapTasks({ skipFit: true });
    App.renderTaskSheet();
    App.updateMapChrome();
  },

  tapRecord() {
    if (!state.shiftActive) beginShiftRecording();
    state.mapMode = 'recording';
    state.taskFoldOpen = false;
    if (!state.recSeconds) state.recSeconds = 0;
    clearInterval(state.recInterval);
    state.recInterval = setInterval(App.tickRec, 1000);
    beginNavSimulation();
    App.updateMapChrome();
    followCamera(true);
    toast('Task recording started');
  },

  startPushedRecording(force) {
    if (state.mapMode !== 'enroute' || state.cardRecording) return;
    const task = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    const start = task ? normPts(getTaskLatLngs(task))[0] : null;
    const dist = start && state.userPos ? haversineM(state.userPos, start) : Infinity;
    if (!force && dist > 50) return;
    state.cardRecording = true;
    state.recSeconds = 0;
    clearInterval(state.recInterval);
    state.recInterval = setInterval(() => {
      if (state.shiftPaused || !state.cardRecording || state.mapMode !== 'enroute') return;
      state.recSeconds += 1;
      App.syncCardRecordButton();
    }, 1000);
    App.syncCardRecordButton();
  },

  toggleCardRecording() {
    if (state.mapMode !== 'enroute' || state.cardRecording) return;
    App.startPushedRecording(true);
  },

  syncCardRecordButton() {
    const btn = document.querySelector('.pushed-next-record');
    if (!btn) return;
    btn.parentElement?.classList.toggle('is-live', !!state.cardRecording);
    btn.disabled = !!state.cardRecording;
    btn.setAttribute('aria-label', state.cardRecording ? 'Recording' : 'Start recording');
    const time = btn.parentElement?.querySelector('.pushed-next-rec-time');
    if (time) {
      time.textContent = formatTime(state.recSeconds || 0);
      time.classList.toggle('hidden', !state.cardRecording);
    }
  },

  arriveTaskEnd() {
    if (state.mapMode !== 'recording' || state.autoFinishing) return;
    state.autoFinishing = true;
    state.completeProximityRetried = true;
    App.stopRecording();
    App.completeTask();
    state.autoFinishing = false;
  },

  submitCapture() {
    if (state.completeButtonLoading) return;
    if (state.mapMode === 'recording') App.stopRecording();
    if (state.mapMode === 'completing') App.completeTask();
  },

  stopRecording() {
    if (state.mapMode !== 'recording') return;
    state.mapMode = 'completing';
    state.navFollow = false;
    state.mapFreeBrowse = false;
    stopNavSimulation();
    clearInterval(state.recInterval);
    App.renderMapTasks({ skipFit: true });
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
      upload_status: 'pending',
      upload_progress: 0,
      upload_retry_count: 0,
    };
    state.records.unshift(newRecord);
    stopNavSimulation();
    clearInterval(state.recInterval);
    state.recSeconds = 0;
    state.completeProximityRetried = false;
    state.completeButtonLoading = false;
    state.mapFreeBrowse = false;
    if (state.collectMode === 'auto' && state.shiftActive) {
      beginAutoCollect();
      return;
    }
    const nearby = listNearbyOpenTasks(state.userPos || getTaskEndpoints(t).end);
    if (nearby.length) {
      state.selectedTaskId = nearby[0].task.task_id;
      state.continuousCollect = true;
      state.mapMode = 'next';
      state.navDistanceM = 0;
      state.recSeconds = 0;
      clearInterval(state.recInterval);
      state.recInterval = null;
      state.transitPts = null;
      state.enrouteArrived = false;
      state.navFollow = false;
      App.renderPushedTaskCard(null);
      App.renderNextTaskDeck();
      App.renderMapTasks();
      App.updateMapChrome();
      toast('Choose a task, then start navigation');
      return;
    }
    state.continuousCollect = false;
    state.transitPts = null;
    state.enrouteArrived = false;
    App.renderPushedTaskCard(null);
    state.mapMode = 'idle';
    state.selectedTaskId = null;
    state.navFollow = false;
    state.mapBearingMode = 'north';
    state.userPos = null;
    updateUserMarker();
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    updateBackgroundRecordingBar();
    toast('All tasks completed');
  },

  renderNextTaskDeck() {
    App.renderTaskDeck(
      'next',
      listNearbyOpenTasks(state.userPos),
      'App.dismissRecommendation()',
      (task) => `App.beginOrNavigate('${task.task_id}')`,
      'Begin'
    );
  },

  renderClaimDeck() {
    const selected = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
    const anchor = state.userPos || (selected ? getTaskEndpoints(selected).start : null);
    const unclaimed = listNearbyUnclaimedTasks(anchor);
    const seen = new Set(unclaimed.map((item) => item.task.task_id));
    const origin = (typeof normPt === 'function' ? normPt(anchor) : anchor) || state.userPos;
    const kept = state.claimDeckKeptIds
      .filter((id) => !seen.has(id))
      .map((id) => {
        const task = state.mapTasks.find((t) => t.task_id === id);
        if (!task || !isClaimedTask(task)) return null;
        const start = getTaskEndpoints(task).start;
        const distanceM = origin && start && typeof haversineM === 'function' ? haversineM(origin, start) : 0;
        return { task, distanceM };
      })
      .filter(Boolean);
    App.renderTaskDeck(
      'claim',
      [...unclaimed, ...kept].sort((a, b) => a.distanceM - b.distanceM),
      'App.closeTaskSheet()',
      (task) =>
        isClaimedTask(task)
          ? `App.beginAcceptedTask('${task.task_id}')`
          : `App.acceptTask('${task.task_id}')`,
      (task) => (isClaimedTask(task) ? 'Begin' : 'Accept')
    );
  },

  renderTaskDeck(mode, nearby, closeHandler, actionCall, actionLabel) {
    const sheet = document.getElementById('task-sheet');
    if (!sheet || state.mapMode !== mode) return;
    if (!nearby.length) {
      sheet.classList.add('hidden');
      sheet.classList.remove('is-next-deck', 'is-recommend');
      return;
    }
    if (!nearby.some((item) => item.task.task_id === state.selectedTaskId)) {
      state.selectedTaskId = nearby[0].task.task_id;
    }
    sheet.classList.remove('hidden', 'is-recommend');
    sheet.classList.add('is-next-deck');
    sheet.innerHTML = `<div class="next-task-scroller" id="next-task-scroller">${nearby
      .map(({ task, distanceM }) => {
        const km = (distanceM / 1000).toFixed(1);
        const active = task.task_id === state.selectedTaskId ? ' is-active' : '';
        return `<article class="task-sheet-card next-deck-card${active}" data-task-id="${task.task_id}" onclick="App.selectTask('${task.task_id}')">
          <div class="task-sheet-head">
            <div class="task-sheet-head-copy">
              <h2 class="task-sheet-title">${getTaskSheetTitle(task)}</h2>
              <p class="task-sheet-meta">${km} kilometers away from you | ${task.poi_address || ''}</p>
            </div>
            ${renderTaskCardCloseBtn(`event.stopPropagation(); ${closeHandler}`)}
          </div>
          ${renderTaskBadges(task)}
          ${renderTaskSheetLinks(task)}
          ${
            mode === 'next' && isClaimedTask(task)
              ? renderStartActions(task, 'Begin', `App.beginOrNavigate('${task.task_id}')`)
              : mode === 'claim' && isClaimedTask(task)
              ? renderStartActions(task)
              : `<div class="task-sheet-actions">
            <button type="button" class="btn btn-primary task-sheet-accept" onclick="event.stopPropagation(); ${actionCall(task)}">${typeof actionLabel === 'function' ? actionLabel(task) : actionLabel}</button>
          </div>`
          }
        </article>`;
      })
      .join('')}</div>`;
    const scroller = document.getElementById('next-task-scroller');
    if (scroller) {
      scroller.addEventListener(
        'scroll',
        () => {
          clearTimeout(state.nextDeckTimer);
          state.nextDeckTimer = setTimeout(() => App.onNextDeckScroll(), 90);
        },
        { passive: true }
      );
    }
    App.markNextDeckCard(state.selectedTaskId, true);
  },

  markNextDeckCard(taskId, quiet) {
    const scroller = document.getElementById('next-task-scroller');
    if (!scroller) return;
    scroller.querySelectorAll('.next-deck-card').forEach((card) => {
      card.classList.toggle('is-active', card.dataset.taskId === taskId);
    });
    const card = scroller.querySelector(`[data-task-id="${taskId}"]`);
    if (!card) return;
    state.nextDeckQuiet = true;
    card.scrollIntoView({ inline: 'center', block: 'nearest', behavior: quiet ? 'auto' : 'smooth' });
    clearTimeout(state.nextDeckQuietTimer);
    state.nextDeckQuietTimer = setTimeout(() => {
      state.nextDeckQuiet = false;
    }, 400);
  },

  onNextDeckScroll() {
    if (!['next', 'claim'].includes(state.mapMode) || state.nextDeckQuiet) return;
    const scroller = document.getElementById('next-task-scroller');
    if (!scroller) return;
    const cards = [...scroller.querySelectorAll('.next-deck-card')];
    const mid = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = null;
    let bestDist = Infinity;
    cards.forEach((card) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = card;
      }
    });
    if (!best || best.dataset.taskId === state.selectedTaskId) return;
    state.selectedTaskId = best.dataset.taskId;
    cards.forEach((card) => card.classList.toggle('is-active', card === best));
    App.renderMapTasks();
    App.updateMapChrome();
  },

  beginOrNavigate(id) {
    const task = state.mapTasks.find((t) => t.task_id === id);
    if (!task || !isClaimedTask(task)) return;
    state.selectedTaskId = id;
    const start = getTaskEndpoints(task).start;
    const distanceM = state.userPos && start && typeof haversineM === 'function' ? haversineM(state.userPos, start) : Infinity;
    if (distanceM <= AT_TASK_START_M) {
      App.beginAcceptedTask(id);
      return;
    }
    if (state.mapMode !== 'next') state.mapMode = 'next';
    App.startNextNavigation(id);
  },

  startNextNavigation(taskId) {
    if (state.mapMode !== 'next') return;
    const task = state.mapTasks.find((t) => t.task_id === (taskId || state.selectedTaskId));
    if (!task) return;
    state.selectedTaskId = task.task_id;
    state.mapMode = 'enroute';
    state.navDistanceM = 0;
    state.nextDestHidden = false;
    state.enrouteArrived = false;
    state.taskFoldOpen = false;
    state.enrouteStartedBackground = !state.backgroundRecording;
    startBackgroundRecording();
    const sheet = document.getElementById('task-sheet');
    if (sheet) {
      sheet.classList.remove('is-next-deck', 'is-recommend');
      sheet.classList.add('hidden');
      sheet.innerHTML = '';
    }
    App.renderPushedTaskCard(null);
    beginTransit(task);
    App.renderMapTasks({ skipFit: true });
    App.updateMapChrome();
    toast(state.collectMode === 'auto' ? 'Heading to the nearest task' : 'Navigation started');
  },

  renderPushedTaskCard(task) {
    const el = document.getElementById('pushed-task-card');
    const phone = document.getElementById('screen-map');
    if (!el) return;
    if (!task) {
      el.classList.add('hidden');
      el.innerHTML = '';
      phone?.classList.remove('has-pushed-card');
      return;
    }
    el.classList.remove('hidden');
    phone?.classList.add('has-pushed-card');
    document.getElementById('capture-title').textContent = getTaskSheetTitle(task);
    const mins = task.duration_minutes ?? Math.max(30, Math.round((task.distance_km || 1.4) * 22));
    const badges = [];
    if (task.priority === 'high') badges.push('<span class="task-tag task-tag-high">HIGH</span>');
    if (task.dispatch_round === 'second') badges.push('<span class="task-tag task-tag-second">2ND</span>');
    badges.push(`<span class="task-tag task-tag-duration">${mins} min</span>`);
    el.innerHTML = `
      <div class="task-sheet-card pushed-next-card">
        <div class="pushed-next-rec${state.cardRecording ? ' is-live' : ''}">
          <button type="button" class="pushed-next-record" onclick="App.toggleCardRecording()" aria-label="${state.cardRecording ? 'Recording' : 'Start recording'}"${state.cardRecording ? ' disabled' : ''}></button>
          <span class="pushed-next-live">
            <span class="pushed-next-breathe" aria-hidden="true"></span>
            <span class="pushed-next-rec-time">${formatTime(state.recSeconds || 0)}</span>
          </span>
        </div>
        <div class="pushed-next-main">
        <div class="pushed-next-top">
          <div class="task-sheet-head-copy">
            <p class="pushed-task-kicker">Next task</p>
            <h2 class="task-sheet-title">${getTaskSheetTitle(task)}</h2>
            <p class="task-sheet-meta">${task.poi_address || ''}</p>
          </div>
          <div class="pushed-next-side">
            ${renderTaskCardCloseBtn('App.dismissRecommendation()')}
            <div class="pushed-next-remain">
              <span id="enroute-status">—</span>
              <span class="pushed-next-remain-label">to start</span>
            </div>
          </div>
        </div>
        <div class="pushed-next-foot">
          <div class="task-sheet-tags">${badges.join('')}</div>
          ${renderTaskSheetLinks(task)}
        </div>
        </div>
      </div>
    `;
    syncEnrouteSheet();
  },

  onTransitArrived() {
    state.cardRecording = false;
    App.renderPushedTaskCard(null);
    App.showArrivedTaskCard();
  },

  showArrivedTaskCard() {
    const task = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    const sheet = document.getElementById('task-sheet');
    if (!task || !sheet) return;
    state.enrouteArrived = true;
    const start = getTaskEndpoints(task).start;
    const distanceM = state.userPos && start && typeof haversineM === 'function' ? haversineM(state.userPos, start) : 0;
    const km = (distanceM / 1000).toFixed(1);
    sheet.classList.remove('hidden', 'is-next-deck', 'is-recommend');
    sheet.innerHTML = `
      <div class="task-sheet-card">
        <div class="task-sheet-head">
          <div class="task-sheet-head-copy">
            <h2 class="task-sheet-title">${getTaskSheetTitle(task)}</h2>
            <p class="task-sheet-meta">${km} kilometers away from you | ${task.poi_address || ''}</p>
          </div>
          ${renderTaskCardCloseBtn('App.closeTaskSheet()')}
        </div>
        ${renderTaskBadges(task)}
        ${renderTaskSheetLinks(task)}
        ${renderStartActions(task)}
      </div>
    `;
    App.renderPushedTaskCard(null);
    App.updateMapChrome();
    if (state.collectMode === 'auto' && state.shiftActive) App.continueAutoTask();
  },

  continueAutoTask() {
    if (state.collectMode !== 'auto' || !state.shiftActive || state.autoAdvancing) return;
    const id = state.selectedTaskId;
    if (!id) return;
    state.autoAdvancing = true;
    document.querySelector('.task-sheet-begin')?.classList.add('is-auto-press');
    setTimeout(() => {
      state.autoAdvancing = false;
      if (state.collectMode !== 'auto' || !state.shiftActive) return;
      if (state.mapMode === 'recording' || state.mapMode === 'completing') return;
      if (state.selectedTaskId !== id) return;
      App.beginAcceptedTask(id);
    }, 480);
  },

  toggleTaskFold() {
    if (state.mapMode !== 'recording' && !(state.mapMode === 'enroute' && !state.enrouteArrived)) return;
    state.taskFoldOpen = !state.taskFoldOpen;
    App.updateMapChrome();
  },

  renderTaskFoldCard() {
    const el = document.getElementById('task-fold-card');
    const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
    if (!el || !task) return;
    const start = getTaskEndpoints(task).start;
    const distanceM = state.userPos && start && typeof haversineM === 'function' ? haversineM(state.userPos, start) : (task.distance_from_user_km || 0) * 1000;
    const km = (distanceM / 1000).toFixed(1);
    el.innerHTML = `
      <article class="task-sheet-card">
        <div class="task-sheet-head">
          <div class="task-sheet-head-copy">
            <h2 class="task-sheet-title">${getTaskSheetTitle(task)}</h2>
            <p class="task-sheet-meta">${km} kilometers away from you | ${task.poi_address || ''}</p>
          </div>
          ${renderTaskCardCloseBtn('App.toggleTaskFold()')}
        </div>
        ${renderTaskBadges(task)}
        ${renderTaskSheetLinks(task)}
      </article>`;
  },

  dismissNextDest() {
    state.nextDestHidden = true;
    App.syncNextDestination();
  },

  syncNextDestination() {
    const el = document.getElementById('next-dest');
    if (!el) return;
    const task = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    const show = state.mapMode === 'enroute' && !state.enrouteArrived && !state.nextDestHidden && !state.taskFoldOpen && !!task;
    el.classList.toggle('hidden', !show);
    if (!show || !task) return;
    const total = typeof routeCumul === 'function' ? (routeCumul(state.transitPts || []).pop() || 0) : 0;
    const remain = Math.max(0, total - (state.transitDistanceM || 0));
    const dist = document.getElementById('next-dest-dist');
    if (dist) dist.textContent = `Next Destination: ${typeof formatNavMeters === 'function' ? formatNavMeters(remain) : ''}`;
  },

  setCollectMode(mode) {
    if (state.shiftActive || state.shiftPaused) return;
    if (mode !== 'manual' && mode !== 'auto') return;
    state.collectMode = mode;
    updateMapStatsWidgets();
  },

  toggleShiftPause() {
    if (!state.shiftActive && !state.shiftPaused) return;
    if (state.shiftPaused) resumeShift();
    else pauseShift();
    App.updateMapChrome();
  },

  dismissRecommendation() {
    const stopTransitBackground = state.mapMode === 'enroute' && state.enrouteStartedBackground;
    clearInterval(state.recInterval);
    stopNavSimulation();
    clearShiftDemo();
    state.mapMode = 'idle';
    state.selectedTaskId = null;
    state.recSeconds = 0;
    state.mapFreeBrowse = false;
    state.mapBearingMode = 'north';
    state.userHeadingTrusted = null;
    state.continuousCollect = false;
    clearTransitLayers();
    state.transitPts = null;
    state.enrouteArrived = false;
    state.enrouteStartedBackground = false;
    state.navFollow = false;
    state.navDistanceM = 0;
    state.cardRecording = false;
    if (stopTransitBackground) stopBackgroundRecording();
    if (state.map && typeof state.map.setBearing === 'function') state.map.setBearing(0);
    App.renderPushedTaskCard(null);
    const sheet = document.getElementById('task-sheet');
    if (sheet) {
      sheet.classList.remove('is-next-deck', 'is-recommend');
      sheet.classList.add('hidden');
      sheet.innerHTML = '';
    }
    App.renderMapTasks();
    App.updateMapChrome();
  },

  openDiscardSheet() {
    const onRoute = state.mapMode === 'recording' || state.mapMode === 'enroute';
    if (!onRoute && !beginCardVisible()) return;
    state.discardSheetOpen = true;
    state.discardPhotos = [];
    document.querySelectorAll('input[name="discard-reason"]').forEach((input) => {
      input.checked = false;
    });
    const note = document.getElementById('discard-note');
    if (note) note.value = '';
    App.onDiscardNote();
    App.onDiscardReason();
    App.renderDiscardPhotos();
    document.getElementById('discard-layer')?.classList.remove('hidden');
  },

  closeDiscardSheet() {
    state.discardSheetOpen = false;
    document.getElementById('discard-layer')?.classList.add('hidden');
  },

  onDiscardReason() {
    const picked = document.querySelector('input[name="discard-reason"]:checked');
    document.getElementById('discard-check')?.classList.toggle('hidden', !picked);
    const confirm = document.getElementById('discard-confirm');
    if (confirm) confirm.disabled = !picked;
  },

  onDiscardNote() {
    const note = document.getElementById('discard-note');
    const count = document.getElementById('discard-count');
    if (count) count.textContent = `${note?.value.length || 0}/300`;
  },

  onDiscardPhoto(input) {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    if (!state.discardPhotos) state.discardPhotos = [];
    if (state.discardPhotos.length >= 3) return;
    state.discardPhotos.push(URL.createObjectURL(file));
    App.renderDiscardPhotos();
  },

  removeDiscardPhoto(index) {
    const url = state.discardPhotos[index];
    if (url) URL.revokeObjectURL(url);
    state.discardPhotos.splice(index, 1);
    App.renderDiscardPhotos();
  },

  renderDiscardPhotos() {
    const wrap = document.getElementById('discard-photos');
    if (!wrap) return;
    const photos = state.discardPhotos || [];
    const thumbs = photos
      .map(
        (url, index) =>
          `<span class="discard-thumb"><img src="${url}" alt="" /><button type="button" onclick="App.removeDiscardPhoto(${index})" aria-label="Remove photo">×</button></span>`
      )
      .join('');
    const add =
      photos.length >= 3
        ? ''
        : `<button type="button" class="discard-add" onclick="document.getElementById('discard-file').click()"><span>+</span><small>Up to three</small></button>`;
    wrap.innerHTML = thumbs + add;
  },

  confirmDiscard() {
    if (!document.querySelector('input[name="discard-reason"]:checked')) return;
    App.closeDiscardSheet();
    App.discardRecording();
  },

  discardRecording() {
    const onRoute = state.mapMode === 'recording' || state.mapMode === 'enroute';
    const fromBeginCard = beginCardVisible();
    if (!onRoute && !fromBeginCard) return;
    const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
    if (task) {
      task.display_state = 'discarded';
      task.claimed_by_me = false;
    }
    state.claimDeckKeptIds = (state.claimDeckKeptIds || []).filter((id) => id !== state.selectedTaskId);
    if (!onRoute) {
      const wasClaim = state.mapMode === 'claim';
      state.selectedTaskId = null;
      state.enrouteArrived = false;
      if (wasClaim) {
        App.renderClaimDeck();
      } else if (state.shiftActive || state.shiftPaused || state.continuousCollect) {
        const remaining = listNearbyOpenTasks(state.userPos);
        state.mapMode = 'next';
        state.selectedTaskId = remaining[0]?.task.task_id || null;
        App.renderNextTaskDeck();
      } else {
        state.mapMode = 'idle';
        const sheet = document.getElementById('task-sheet');
        if (sheet) {
          sheet.classList.add('hidden');
          sheet.innerHTML = '';
        }
      }
      App.renderMapTasks();
      App.updateMapChrome();
      toast('Task discarded');
      return;
    }
    clearInterval(state.recInterval);
    state.recInterval = null;
    stopNavSimulation();
    clearTransitLayers();
    state.transitPts = null;
    state.recSeconds = 0;
    state.navDistanceM = 0;
    state.transitDistanceM = 0;
    state.navFollow = false;
    state.cardRecording = false;
    state.captureRestMode = false;
    state.enrouteArrived = false;
    state.enrouteStartedBackground = false;
    state.mapFreeBrowse = false;
    state.mapBearingMode = 'north';
    if (state.map && typeof state.map.setBearing === 'function') state.map.setBearing(0);
    const remaining = listNearbyOpenTasks(state.userPos);
    state.mapMode = 'next';
    state.selectedTaskId = remaining[0]?.task.task_id || null;
    App.renderPushedTaskCard(null);
    App.renderNextTaskDeck();
    App.renderMapTasks();
    App.updateMapChrome();
    toast(remaining.length ? 'Task discarded' : 'Task discarded. No claimed tasks left');
  },

  exitCapture() {
    const stopTransitBackground = state.mapMode === 'enroute' && state.enrouteStartedBackground;
    clearInterval(state.recInterval);
    stopNavSimulation();
    state.mapMode = 'idle';
    state.recSeconds = 0;
    state.mapFreeBrowse = false;
    state.mapBearingMode = 'north';
    state.userHeadingTrusted = null;
    state.recordingAlertType = null;
    state.recordingAlertDismissed = {};
    state.recordingPausedByAlert = false;
    state.recordingDeviceFault = null;
    state.captureRestMode = false;
    state.continuousCollect = false;
    clearTransitLayers();
    state.transitPts = null;
    state.enrouteArrived = false;
    state.enrouteStartedBackground = false;
    state.cardRecording = false;
    if (stopTransitBackground) stopBackgroundRecording();
    App.renderPushedTaskCard(null);
    document.getElementById('task-sheet')?.classList.remove('is-next-deck', 'is-recommend');
    App.closeModal('modal-recording-alert');
    App.renderMapTasks();
    App.renderTaskSheet();
    App.updateMapChrome();
    toast(state.shiftActive ? 'Task cancelled' : 'Capture cancelled');
  },

  showRecordingAlert(type) {
    if (type === 'storage_full') return;
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
    state.shiftDistanceKm = 0;
    state.backgroundRecSeconds = 0;
    App.updateMapChrome();
  },

  stopAutoCollect() {
    clearInterval(state.recInterval);
    stopNavSimulation();
    clearShiftDemo();
    state.mapMode = 'idle';
    state.selectedTaskId = null;
    state.recSeconds = 0;
    state.mapFreeBrowse = false;
    state.mapBearingMode = 'north';
    state.userHeadingTrusted = null;
    state.continuousCollect = false;
    clearTransitLayers();
    state.transitPts = null;
    state.enrouteArrived = false;
    state.enrouteStartedBackground = false;
    state.navFollow = false;
    state.navDistanceM = 0;
    state.cardRecording = false;
    state.recordingAlertType = null;
    state.recordingPausedByAlert = false;
    state.recordingDeviceFault = null;
    if (state.map && typeof state.map.setBearing === 'function') state.map.setBearing(0);
    App.renderPushedTaskCard(null);
    const sheet = document.getElementById('task-sheet');
    if (sheet) {
      sheet.classList.remove('is-next-deck', 'is-recommend');
      sheet.classList.add('hidden');
      sheet.innerHTML = '';
    }
    App.closeModal('modal-recording-alert');
    stopShift();
    App.renderMapTasks();
    App.updateMapChrome();
  },

  toggleShift() {
    if (state.shiftActive || state.shiftPaused) {
      App.stopAutoCollect();
      return;
    }
    if (state.screen !== 'map') App.go('map');
    state.shiftStartPending = true;
    App.openPrecondition();
  },

  runShiftDemoTaskFlow(taskId) {
    const t = state.mapTasks.find((x) => x.task_id === taskId);
    if (!t || !state.shiftActive) return;
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
    if (!state.map) return;
    if (state.mapMode === 'recording') {
      App.recenterMap();
      return;
    }
    if (state.userPos) {
      frameLatLng(state.userPos, Math.max(state.map.getZoom(), 15), true);
      if (state.mapMode !== 'recording') animateMapBearing(state.mapBearingMode === 'heading' ? desiredBearing() : 0);
      return;
    }
    state.map.setView([34.0522, -118.2915], 14);
    toast('Centered on your location');
  },

  openTaskOverview(taskId) {
    const record = state.records.find((r) => r.task_id === taskId);
    const task = ensureOverviewTask(record) || state.mapTasks.find((t) => t.task_id === taskId);
    if (!task) return;
    stopNavSimulation();
    state.selectedTaskId = task.task_id;
    state.mapMode = 'overview';
    state.mapBearingMode = 'north';
    state.navFollow = false;
    state.mapFreeBrowse = false;
    state.userHeadingTrusted = null;
    state.navDistanceM = 0;
    App.go('map');
    setTimeout(() => {
      placeBrowseUser(task);
      fitTaskWithNeighbors(task);
      updateOrientButton();
      App.renderTaskSheet();
      App.updateMapChrome();
    }, 220);
  },

  startOverviewRecording() {
    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (!t) return;
    syncPreconditionsFromDevice();
    if (!allPreconditionsOk() || state.settings.simulateFailedChecks) {
      state.recordAfterPrecondition = true;
      App.openPrecondition();
      return;
    }
    state.recordAfterPrecondition = false;
    t.display_state = 'claimed';
    t.claimed_by_me = true;
    resetBeginCaptureState();
    state.recSeconds = 0;
    App.tapRecord();
  },

  toggleMapCamera() {
    if (!state.map) return;
    const task = state.mapTasks.find((t) => t.task_id === state.selectedTaskId);
    if (state.mapCameraMode === 'route-overview') {
      state.mapCameraMode = 'follow-north';
      state.mapBearingMode = 'heading';
      state.routeOverviewHold = false;
      state.mapFreeBrowse = false;
      state.navFollow = state.mapMode === 'recording' || state.mapMode === 'enroute';
      if (state.map.stop) state.map.stop();
      updateOrientButton();
      updateRecenterButton();
      syncCourseMarkerRotation();
      if (state.userPos && state.navFollow) followCamera(true);
      return;
    }
    state.mapCameraMode = 'route-overview';
    state.routeOverviewHold = true;
    state.navFollow = false;
    state.mapFreeBrowse = true;
    clearTimeout(state.navRecenterTimer);
    if (typeof state.map.setBearing === 'function') state.map.setBearing(0);
    updateOrientButton();
    updateRecenterButton();
    syncCourseMarkerRotation();
    if (state.mapMode === 'enroute') fitTransitInSafeArea(task);
    else if (task) fitTaskInSafeArea(task);
  },

  toggleMapBearing() {
    App.toggleMapCamera();
  },

  recenterMap() {
    if (!state.map || !state.userPos) return;
    clearTimeout(state.navRecenterTimer);
    state.mapFreeBrowse = false;
    if (state.mapMode === 'recording' || state.mapMode === 'enroute') state.navFollow = true;
    updateRecenterButton();
    state.mapCameraMode = 'follow-north';
    state.routeOverviewHold = false;
    state.navFollow = state.mapMode === 'recording' || state.mapMode === 'enroute';
    updateRecenterButton();
    updateOrientButton();
    state.mapBearingMode = 'heading';
    if (state.navFollow) followCamera(true);
    else {
      syncCourseMarkerRotation();
      const zoom = state.map.getZoom() < 15 ? 16 : state.map.getZoom();
      frameLatLng(state.userPos, zoom, true);
    }
  },

  zoomMap(dir) {
    if (state.map) state.map.setZoom(state.map.getZoom() + dir);
  },

  renderTaskList() {
    const metrics = computeTodayMetrics();
    document.getElementById('tasks-summary').innerHTML = `
      <div class="tasks-metrics">
        <article class="tasks-metric-card tasks-metric-card--km">
          <div class="tasks-metric-head">
            <span class="tasks-metric-icon tasks-metric-icon--km">${TASKS_METRIC_KM_ICON}</span>
            <span class="tasks-metric-label">Today's KM</span>
          </div>
          <div class="tasks-metric-num">${metrics.kmDisplay}</div>
          <div class="tasks-metric-foot">
            <p class="tasks-metric-goal">${metrics.kmProgress}/${metrics.targets.km}km</p>
            <div class="tasks-metric-progress" role="progressbar" aria-valuenow="${metrics.kmPct}" aria-valuemin="0" aria-valuemax="100">
              <span class="tasks-metric-progress-fill tasks-metric-progress-fill--km" style="width:${metrics.kmPct}%"></span>
            </div>
          </div>
        </article>
        <article class="tasks-metric-card tasks-metric-card--tasks">
          <div class="tasks-metric-head">
            <span class="tasks-metric-icon tasks-metric-icon--tasks">${TASKS_METRIC_TASKS_ICON}</span>
            <span class="tasks-metric-label">Today's Tasks</span>
          </div>
          <div class="tasks-metric-num">${metrics.tasks}</div>
          <div class="tasks-metric-foot">
            <p class="tasks-metric-goal">${metrics.tasks}/${metrics.targets.tasks} tasks</p>
            <div class="tasks-metric-progress" role="progressbar" aria-valuenow="${metrics.tasksPct}" aria-valuemin="0" aria-valuemax="100">
              <span class="tasks-metric-progress-fill tasks-metric-progress-fill--tasks" style="width:${metrics.tasksPct}%"></span>
            </div>
          </div>
        </article>
      </div>`;

    document.getElementById('task-date-filter-label').textContent = state.taskDateLabel;

    const filtered = filterRecordsForTasksPage();
    const groups = groupRecordsByDay(filtered);

    if (!groups.length) {
      document.getElementById('task-list').innerHTML =
        '<div class="task-empty">No tasks match your filters.</div>';
      App.updateUploadFab();
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
    App.updateUploadFab();
  },

  renderTaskCardHtml(r) {
    const title = r.title || r.mapping_title || r.task_id;
    const uploadStatus = getRecordUploadStatus(r);
    const incomplete = isRecordUploadIncomplete(r);
    const progress = getUploadProgress(r);
    const ticketId = r.ticket_id || r.task_id;
    const closeBtn = renderTaskCardCloseBtn(`event.stopPropagation();App.dismissTaskCard('${r.task_id}')`);

    if (incomplete) {
      const statusText =
        uploadStatus === 'uploading'
          ? 'Uploading'
          : uploadStatus === 'paused'
            ? 'Paused'
            : uploadStatus === 'failed'
              ? 'Failed'
              : 'Waiting';
      const barTone =
        uploadStatus === 'failed'
          ? 'is-failed'
          : uploadStatus === 'paused'
            ? 'is-paused'
            : uploadStatus === 'uploading'
              ? 'is-uploading'
              : '';

      // Max 2 controls: Copy ID always; Retry/Resume only when recovery is needed
      let actionBtn = '';
      if (uploadStatus === 'failed') {
        actionBtn = `<button type="button" class="task-submit-btn task-submit-btn--action task-submit-btn--fail" onclick="event.stopPropagation();App.retryTaskUpload('${r.task_id}')">${TASK_RETRY_ICON}<span>Retry</span></button>`;
      } else if (uploadStatus === 'paused') {
        actionBtn = `<button type="button" class="task-submit-btn task-submit-btn--action task-submit-btn--resume" onclick="event.stopPropagation();App.resumeTaskUpload('${r.task_id}')">${TASK_RESUME_ICON}<span>Resume</span></button>`;
      }

      const copyBtn = actionBtn
        ? `<button type="button" class="task-submit-btn task-submit-btn--copy task-submit-btn--icon" title="Copy ID" aria-label="Copy ID" onclick="event.stopPropagation();App.copyTicketId('${ticketId}')">${TASK_COPY_ID_ICON}</button>`
        : `<button type="button" class="task-submit-btn task-submit-btn--copy" onclick="event.stopPropagation();App.copyTicketId('${ticketId}')">${TASK_COPY_ID_ICON}<span>Copy ID</span></button>`;

      return `<article class="task-submit-card task-submit-card--pending task-submit-card--${uploadStatus}" onclick="App.openTaskOverview('${r.task_id}')">
        ${closeBtn}
        <div class="task-submit-body task-submit-body--pending">
          <h4 class="task-submit-title">${title}</h4>
          <p class="task-submit-time">${formatRecordDate(r.shot_at)}</p>
          <div class="task-card-progress-row">
            <div class="task-card-progress ${barTone}" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${statusText} ${progress}%">
              <span style="width:${progress}%"></span>
            </div>
            <span class="task-card-progress-pct">${progress}%</span>
          </div>
          <div class="task-submit-actions task-submit-actions--split">
            <span class="task-card-status-text task-card-status-text--${uploadStatus}">${statusText}</span>
            <div class="task-submit-action-group">
              ${copyBtn}
              ${actionBtn}
            </div>
          </div>
        </div>
      </article>`;
    }

    return `<article class="task-submit-card" onclick="App.openTaskOverview('${r.task_id}')">
      ${closeBtn}
      <div class="task-submit-thumb task-media-thumb--${r.thumb || 'street'}">
        <span class="task-submit-status task-submit-status--uploaded">Uploaded</span>
      </div>
      <div class="task-submit-body">
        <h4 class="task-submit-title">${title}</h4>
        <p class="task-submit-time">${formatRecordDate(r.shot_at)}</p>
        <p class="task-submit-meta">${r.duration} | ${r.size}</p>
        <div class="task-submit-actions">
          <button type="button" class="task-submit-btn task-submit-btn--copy" onclick="event.stopPropagation();App.copyTicketId('${ticketId}')">${TASK_COPY_ID_ICON}<span>Copy ID</span></button>
        </div>
      </div>
    </article>`;
  },

  updateUploadFab() {
    const fab = document.getElementById('upload-fab');
    if (!fab) return;
    const pending = getIncompleteUploadRecords().length;
    const running = !!state.uploadBatchRunning;
    const paused = !!state.uploadPaused;
    const connecting = !!state.uploadConnecting;

    fab.classList.toggle('is-busy', running || connecting);
    fab.classList.toggle('is-paused', paused && !running);
    fab.classList.toggle('is-empty', pending === 0 && !running && !paused);

    let label = 'Batch upload';
    let icon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.2" aria-hidden="true">
      <path d="M12 16V5" stroke-linecap="round"/>
      <path d="m8 9 4-4 4 4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 19h14" stroke-linecap="round"/>
    </svg>`;

    if (connecting) {
      label = 'Connecting…';
      icon = `<span class="upload-fab-spinner" aria-hidden="true"></span>`;
    } else if (running) {
      label = 'Pause upload';
      icon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" aria-hidden="true"><path d="M8 6h3v12H8zM13 6h3v12h-3z"/></svg>`;
    } else if (paused) {
      label = 'Resume upload';
      icon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" aria-hidden="true"><path d="M8 6.5v11l9-5.5-9-5.5Z" stroke-linejoin="round"/></svg>`;
    }

    const badge =
      pending > 0 && !running && !connecting
        ? `<span class="upload-fab-badge">${pending > 9 ? '9+' : pending}</span>`
        : '';

    fab.setAttribute('aria-label', label);
    fab.innerHTML = `${icon}${badge}<span class="upload-fab-label">${label}</span>`;
  },

  refreshTaskList() {
    App.renderTaskList();
    toast('Refreshed');
  },

  onUploadFabClick() {
    if (state.uploadConnecting) return;
    if (state.uploadBatchRunning) {
      App.pauseBatchUpload();
      return;
    }
    if (state.uploadPaused) {
      App.resumeBatchUpload();
      return;
    }
    App.startBatchUploadFromTasks();
  },

  startBatchUploadFromTasks() {
    const targets = getIncompleteUploadRecords();
    if (!targets.length) {
      toast('Nothing to upload');
      App.updateUploadFab();
      return;
    }

    const kickOff = () => {
      state.uploadQueueTargets = targets;
      state.uploadQueueIndex = 0;
      state.uploadBatchRunning = true;
      state.uploadPaused = false;
      state.uploadDoneCount = 0;
      state.uploadTotalCount = targets.length;
      state.uploadActiveTitle = null;
      targets.forEach((r) => {
        if (r.upload_status === 'failed' || r.upload_status === 'paused') {
          // keep progress so resume continues; failed retries from progress
        }
        if (r.upload_status === 'pending') r.upload_progress = 0;
      });
      toast(`Uploading ${targets.length} video(s)…`);
      if (state.screen === 'tasks') App.renderTaskList();
      else if (state.screen === 'upload-status') App.renderUploadStatus();
      App._uploadTickCurrent();
    };

    if (!state.uploadDeviceConnected) {
      state.uploadConnecting = true;
      App.updateUploadFab();
      if (state.screen === 'tasks') App.renderTaskList();
      setTimeout(() => {
        state.uploadConnecting = false;
        state.uploadDeviceConnected = true;
        toast('GoPro connected');
        kickOff();
      }, 700);
      return;
    }
    kickOff();
  },

  retryTaskUpload(taskId) {
    const r = state.records.find((x) => x.task_id === taskId);
    if (!r) return;
    r.upload_status = 'pending';
    r.upload_progress = 0;
    r.upload_retry_count = (r.upload_retry_count || 0) + 1;
    toast('Queued for retry');
    if (state.uploadBatchRunning || state.uploadPaused) {
      App.renderTaskList();
      return;
    }
    App.startBatchUploadFromTasks();
  },

  resumeTaskUpload(taskId) {
    const r = state.records.find((x) => x.task_id === taskId);
    if (!r) return;
    r.upload_status = 'pending';
    if (state.uploadPaused) {
      App.resumeBatchUpload();
      return;
    }
    App.startBatchUploadFromTasks();
  },

  openUploadStatus() {
    state.uploadBatchRunning = false;
    state.uploadPaused = false;
    state.uploadConnecting = false;
    state.uploadActiveTitle = null;
    state.uploadDoneCount = 0;
    state.uploadTotalCount = 0;
    if (state.uploadTick) {
      clearInterval(state.uploadTick);
      state.uploadTick = null;
    }
    syncUploadQueueFromRecords();
    App.go('upload-status');
  },

  renderUploadStatus() {
    const body = document.getElementById('upload-status-body');
    const footer = document.getElementById('upload-status-footer');
    if (!body || !footer) return;

    syncUploadQueueFromRecords();

    const connected = state.uploadDeviceConnected;
    const connecting = !!state.uploadConnecting;
    const running = !!state.uploadBatchRunning;
    const paused = !!state.uploadPaused;
    const order = { uploading: 0, pending: 1, paused: 2, failed: 3, uploaded: 4 };
    const items = [...state.uploadQueue].sort((a, b) => (order[a.state] ?? 9) - (order[b.state] ?? 9));
    const ready = items.filter((i) => i.state === 'pending' || i.state === 'failed' || i.state === 'paused').length;
    const uploading = items.filter((i) => i.state === 'uploading').length;
    const actionable = ready + uploading;

    const banner = connected
      ? `<div class="upload-device-banner upload-device-banner--ok">
          <div>
            <strong>Connected · GoPro HERO</strong>
            <p>${
              running
                ? `Uploading${state.uploadActiveTitle ? ` · ${state.uploadActiveTitle}` : ''} · ${state.uploadDoneCount}/${state.uploadTotalCount}`
                : paused
                  ? `Paused · ${state.uploadDoneCount}/${state.uploadTotalCount} done`
                  : ready > 0
                    ? `${ready} waiting in queue`
                    : 'Queue is clear'
            }</p>
          </div>
        </div>`
      : `<div class="upload-device-banner upload-device-banner--warn">
          <div><strong>GoPro not connected</strong><p>Connect to pull local media and start batch upload</p></div>
        </div>`;

    const pct = state.uploadTotalCount
      ? Math.round((state.uploadDoneCount / state.uploadTotalCount) * 100)
      : 0;
    const progressBlock =
      running || paused
        ? `<div class="upload-overall-wrap">
            <div class="upload-overall ${paused ? 'is-paused' : ''}"><span style="width:${pct}%"></span></div>
            <p class="upload-overall-label">${paused ? 'Paused' : 'Uploading'} · ${pct}%</p>
          </div>`
        : '';

    const list = items.length
      ? items
          .map((i) => {
            const label =
              i.state === 'pending'
                ? 'Pending'
                : i.state === 'failed'
                  ? 'Failed'
                  : i.state === 'paused'
                    ? 'Paused'
                    : i.state === 'uploading'
                      ? 'Uploading'
                      : 'Uploaded';
            const tone =
              i.state === 'failed'
                ? 'fail'
                : i.state === 'uploading'
                  ? 'up'
                  : i.state === 'paused'
                    ? 'up'
                    : i.state === 'uploaded'
                      ? 'done'
                      : 'pend';
            const bar =
              i.state === 'uploading' || i.state === 'paused' || (i.state === 'failed' && i.progress > 0) || (i.state === 'uploaded' && i.progress > 0)
                ? `<div class="upload-progress"><span style="width:${i.progress}%"></span></div>
                   ${i.state === 'uploading' || i.state === 'paused' ? `<p class="upload-progress-label">${i.progress}%</p>` : ''}`
                : '';
            return `<article class="upload-queue-card">
              <div class="upload-queue-top">
                <h4>${i.title}</h4>
                <span class="upload-badge upload-badge--${tone}">${label}</span>
              </div>
              <p class="upload-queue-meta">${i.size} · Task ${i.task_id}${i.retry_count ? ` · Retry ${i.retry_count}` : ''}</p>
              ${bar}
            </article>`;
          })
          .join('')
      : '<div class="task-empty">Upload queue is empty</div>';

    body.innerHTML = `${banner}${progressBlock}${list}`;

    let label = 'Connect & upload all';
    let action = 'App.startBatchUploadFromTasks()';
    let disabled = connecting;
    let btnClass = 'btn-primary';

    if (connected) {
      if (running) {
        label = 'Pause';
        action = 'App.pauseBatchUpload()';
        disabled = false;
        btnClass = 'btn-ghost upload-btn-pause';
      } else if (paused) {
        label = 'Resume';
        action = 'App.resumeBatchUpload()';
        disabled = false;
      } else {
        label = actionable > 0 ? `Upload all (${actionable})` : 'Upload all';
        action = 'App.startBatchUploadFromTasks()';
        disabled = actionable === 0;
      }
    } else if (connecting) {
      label = 'Connecting…';
    }

    footer.innerHTML = `
      <button type="button" class="btn ${btnClass}" ${disabled ? 'disabled' : ''} onclick="${action}">
        ${label}
      </button>`;
  },

  connectUploadDevice() {
    if (state.uploadConnecting) return;
    state.uploadConnecting = true;
    App.renderUploadStatus();
    setTimeout(() => {
      state.uploadConnecting = false;
      state.uploadDeviceConnected = true;
      toast('GoPro connected');
      if (state.screen === 'upload-status') App.renderUploadStatus();
      App.updateUploadFab();
    }, 400);
  },

  pauseBatchUpload() {
    if (!state.uploadBatchRunning) return;
    state.uploadPaused = true;
    state.uploadBatchRunning = false;
    if (state.uploadTick) {
      clearInterval(state.uploadTick);
      state.uploadTick = null;
    }
    (state.uploadQueueTargets || []).forEach((r) => {
      if (r.upload_status === 'uploading') r.upload_status = 'paused';
    });
    toast('Upload paused');
    if (state.screen === 'tasks') App.renderTaskList();
    if (state.screen === 'upload-status') App.renderUploadStatus();
    App.updateUploadFab();
  },

  resumeBatchUpload() {
    if (!state.uploadDeviceConnected || !state.uploadPaused) {
      App.startBatchUploadFromTasks();
      return;
    }
    state.uploadPaused = false;
    state.uploadBatchRunning = true;
    (state.uploadQueueTargets || []).forEach((r) => {
      if (r.upload_status === 'paused') r.upload_status = 'uploading';
    });
    if (state.screen === 'tasks') App.renderTaskList();
    if (state.screen === 'upload-status') App.renderUploadStatus();
    App.updateUploadFab();
    App._uploadTickCurrent();
  },

  runBatchUpload() {
    App.startBatchUploadFromTasks();
  },

  _uploadTickCurrent() {
    if (state.uploadPaused || !state.uploadBatchRunning) return;
    const targets = state.uploadQueueTargets || [];
    if (state.uploadQueueIndex >= targets.length) {
      state.uploadBatchRunning = false;
      state.uploadActiveTitle = null;
      toast(`${state.uploadTotalCount} video(s) uploaded`);
      if (state.screen === 'tasks') App.renderTaskList();
      if (state.screen === 'upload-status') App.renderUploadStatus();
      App.updateUploadFab();
      return;
    }

    const item = targets[state.uploadQueueIndex];
    // Skip already finished (e.g. after partial run)
    if (getRecordUploadStatus(item) === 'uploaded') {
      state.uploadQueueIndex += 1;
      setTimeout(() => App._uploadTickCurrent(), 40);
      return;
    }

    state.uploadActiveTitle = item.title || item.mapping_title || item.task_id;
    item.upload_status = 'uploading';
    item.upload_progress = item.upload_progress || 0;
    if (state.screen === 'tasks') App.renderTaskList();
    if (state.screen === 'upload-status') App.renderUploadStatus();
    App.updateUploadFab();

    if (state.uploadTick) clearInterval(state.uploadTick);
    state.uploadTick = setInterval(() => {
      if (state.uploadPaused || !state.uploadBatchRunning) {
        clearInterval(state.uploadTick);
        state.uploadTick = null;
        return;
      }
      item.upload_progress = Math.min(
        100,
        (item.upload_progress || 0) + 14 + Math.floor(Math.random() * 12)
      );
      // Demo: first failed card fails again once if retry_count is 0 — skip, always succeed for demo flow
      if (item.upload_progress >= 100) {
        clearInterval(state.uploadTick);
        state.uploadTick = null;
        item.upload_status = 'uploaded';
        item.upload_progress = 100;
        item.upload_retry_count = 0;
        item.audit_stage = item.audit_stage === 'submitted' ? 'reviewing' : item.audit_stage;
        state.uploadDoneCount += 1;
        state.uploadQueueIndex += 1;
        if (state.screen === 'tasks') App.renderTaskList();
        if (state.screen === 'upload-status') App.renderUploadStatus();
        App.updateUploadFab();
        setTimeout(() => App._uploadTickCurrent(), 160);
        return;
      }
      if (state.screen === 'tasks') App.renderTaskList();
      if (state.screen === 'upload-status') App.renderUploadStatus();
    }, 220);
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
  if (bootParams.get('demo') === 'tasks' || bootParams.get('demo') === 'upload') {
    if (!state.settings.simulateFailedChecks) applyReadyChecks();
    state.onboardingComplete = true;
    state.auth = { region: 'US', userId: 'US-156', displayName: 'User Wang' };
    App.showLoginScreen();
    App.initLoginForm();
    if (bootParams.get('demo') === 'upload') {
      state.uploadDeviceConnected = false;
      state.uploadPaused = false;
      state.uploadBatchRunning = false;
      App.go('upload-status');
    } else {
      App.go('tasks');
    }
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
    bootDemoRecording(alert === 'storage_full' ? null : alert);
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
  console.error('Project Rover boot failed', err);
  App.showLoginScreen();
  try {
    App.initLoginForm();
  } catch (initErr) {
    console.error('initLoginForm failed during boot fallback', initErr);
  }
}
