/* GoSnap HTML Demo — aligned to design mockups */

const COLORS = {
  unclaimed: '#155dfc',
  claimed: '#f59e0b',
  completed: '#16a34a',
  second: '#8B5CF6',
  high: '#f62929',
  progress: {
    completed: '#6366F1',
    collected: '#0EA5E9',
    reviewing: '#F59E0B',
    approved: '#16a34a',
    rejected: '#f62929',
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

const CHECK_ICONS = {
  gps: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>',
  battery: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M21 10v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="6" y="10" width="8" height="4" rx="1" fill="currentColor"/></svg>',
  network: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" stroke="currentColor" stroke-width="1.8"/></svg>',
  storage: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="14" width="16" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M7 7h.01M7 17h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
};

const DEVICE_CHECKS = [
  { id: 'gps', title: 'GPS Positioning', subtitleOk: 'Set to Always Allow', subtitleErr: 'Permission required', modal: 'modal-location' },
  { id: 'battery', title: 'Device Battery', subtitleOk: 'Bat Lvl : 85%', subtitleErr: 'Battery too low', modal: 'modal-battery' },
  { id: 'network', title: 'Network', subtitleOk: 'Network is good', subtitleErr: 'Connection failed', modal: 'modal-network' },
  { id: 'storage', title: 'Storage Space', subtitleOk: '45GB remaining', subtitleErr: 'Insufficient space', modal: 'modal-storage' },
];

function seg(id, name, address, start, end, opts = {}) {
  const mid = { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 };
  return {
    task_id: id,
    poi_name: name,
    poi_address: address,
    polyline: [start, mid, end],
    start_point: start,
    end_point: end,
    distance_km: 1.4,
    distance_from_user_km: 0.8,
    priority: opts.priority || 'normal',
    dispatch_round: opts.dispatch_round || 'first',
    display_state: opts.display_state || 'unclaimed',
    claimed_by_me: !!opts.claimed_by_me,
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
  selectedTaskId: null,
  mapMode: 'idle', // idle | navigating | recording | completing | review
  recSeconds: 0,
  recInterval: null,
  skipSafety: false,
  deviceChecks: { gps: true, battery: true, network: true, storage: true },
  preconditions: { bluetooth: true, network: true },
  polylines: {},
  progressPolylines: {},
  undoTaskId: null,
  mapTasks: [
    seg('task_vermont_001', 'Sorrento Valley', '900 Exposition Blvd, Los Angeles, CA', { lat: 34.0522, lng: -118.2915 }, { lat: 34.0535, lng: -118.289 }),
    seg('task_high_002', 'Sunset Blvd', 'Sunset Blvd, Los Angeles, CA', { lat: 34.098, lng: -118.326 }, { lat: 34.1, lng: -118.32 }, { display_state: 'claimed', claimed_by_me: true, priority: 'high' }),
    seg('task_wilshire_003', 'Wilshire Blvd', '3400 Wilshire Blvd, Los Angeles, CA', { lat: 34.0615, lng: -118.308 }, { lat: 34.063, lng: -118.3 }),
    seg('task_fig_004', 'Figueroa St', '2200 Figueroa St, Los Angeles, CA', { lat: 34.038, lng: -118.278 }, { lat: 34.041, lng: -118.272 }, { display_state: 'claimed', claimed_by_me: true }),
    seg('task_melrose_005', 'Melrose Ave', '7600 Melrose Ave, Los Angeles, CA', { lat: 34.083, lng: -118.365 }, { lat: 34.085, lng: -118.358 }, { display_state: 'completed_local' }),
    seg('task_broadway_006', 'Broadway DTLA', '500 S Broadway, Los Angeles, CA', { lat: 34.047, lng: -118.252 }, { lat: 34.05, lng: -118.245 }, { dispatch_round: 'second' }),
    seg('task_hollywood_009', 'Hollywood Blvd', '6801 Hollywood Blvd, Los Angeles, CA', { lat: 34.101, lng: -118.337 }, { lat: 34.104, lng: -118.33 }, { priority: 'high' }),
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
    { task_id: 'task_done_100', title: 'S Vermont Ave Mapping', shot_at: new Date().toISOString(), duration: '10m3s', size: '50.2M', status: 'approved', group: 'today' },
    { task_id: 'task_pending_103', title: 'Wilshire Blvd Mapping', shot_at: new Date(Date.now() - 5400000).toISOString(), duration: '7m20s', size: '38.5M', status: 'pending', group: 'today' },
    { task_id: 'task_upload_101', title: 'S Vermont Ave Mapping', shot_at: new Date(Date.now() - 3600000).toISOString(), duration: '8m12s', size: '42.1M', status: 'uploading', group: 'today' },
    { task_id: 'task_review_102', title: 'Hollywood Blvd Mapping', shot_at: new Date(Date.now() - 86400000).toISOString(), duration: '9m45s', size: '48.0M', status: 'rejected', group: 'yesterday' },
    { task_id: 'task_yday_upload', title: 'S Vermont Ave Mapping', shot_at: new Date(Date.now() - 90000000).toISOString(), duration: '8m12s', size: '42.1M', status: 'uploading', group: 'yesterday' },
    { task_id: 'task_claimed_104', title: 'Figueroa St Mapping', shot_at: new Date(Date.now() - 86400000).toISOString(), duration: '—', size: '—', status: 'claimed', group: 'yesterday' },
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

function getLifecycleColor(t) {
  const lc = getTaskLifecycle(t);
  if (lc === 'completed') return COLORS.completed;
  if (lc === 'claimed') return COLORS.claimed;
  return COLORS.unclaimed;
}

/** PRD: unclaimed high-priority routes render red; otherwise lifecycle color */
function getTaskLineColor(t) {
  if (getTaskLifecycle(t) === 'unclaimed' && getTaskPriority(t) === 'high') {
    return COLORS.high;
  }
  return getLifecycleColor(t);
}

function renderTaskBadges(t) {
  const badges = [];
  if (t.priority === 'high') badges.push('<span class="badge badge-high">HIGH</span>');
  if (t.dispatch_round === 'second') badges.push('<span class="badge badge-second">2ND</span>');
  if (!badges.length) return '';
  return `<div class="badges">${badges.join('')}</div>`;
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

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

function computeStats() {
  return { done: 12, todo: 150, passed: 10 };
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

const STATUS_META = {
  approved: { label: 'Approved', tone: 'approved', corner: '✓' },
  pending: { label: 'Pending', tone: 'pending', corner: '…' },
  rejected: { label: 'Rejected', tone: 'rejected', corner: '×' },
  uploading: { label: 'Uploading', tone: 'uploading', corner: '↻' },
  reviewing: { label: 'Reviewing', tone: 'pending', corner: '…' },
  claimed: { label: 'Claimed', tone: 'pending', corner: '…' },
};

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
      'progress-map': 'screen-progress-map',
      settings: 'screen-settings',
    };
    document.getElementById(map[screen]).classList.add('active');
    state.screen = screen;
    document.getElementById('filter-sheet').classList.remove('show');
    document.getElementById('progress-layer-panel').classList.remove('show');

    if (screen === 'precheck') App.renderPrecheck();
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
    App.go('precheck');
  },

  toggleLoginPass() {
    const input = document.getElementById('login-pass');
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  renderPrecheck() {
    document.getElementById('check-list').innerHTML = DEVICE_CHECKS.map((c) => {
      const ok = state.deviceChecks[c.id];
      return `<div class="check-item ${ok ? 'ok' : 'err'}" onclick="App.openCheckModal('${c.id}')">
        <div class="check-icon">${CHECK_ICONS[c.id]}</div>
        <div class="check-copy">
          <div class="check-title">${c.title}</div>
          <div class="check-sub">${ok ? c.subtitleOk : c.subtitleErr}</div>
        </div>
        <div class="check-badge">${ok ? '<span class="check-mark">✓</span> Satisfied' : 'Fix'}</div>
      </div>`;
    }).join('');

    const btn = document.getElementById('btn-start-check');
    btn.disabled = !allDeviceChecksOk();
    btn.classList.toggle('disabled', !allDeviceChecksOk());
  },

  refreshPrecheck() {
    toast('Re-checking device status…');
    App.renderPrecheck();
  },

  openCheckModal(id) {
    if (state.deviceChecks[id]) return;
    const check = DEVICE_CHECKS.find((c) => c.id === id);
    if (check) document.getElementById(check.modal).classList.add('show');
  },

  fixCheck(id) {
    state.deviceChecks[id] = true;
    if (id === 'network') state.preconditions.network = true;
    DEVICE_CHECKS.forEach((c) => {
      if (c.id === id) document.getElementById(c.modal).classList.remove('show');
    });
    App.renderPrecheck();
    App.renderPrecondition();
    toast('Status updated');
  },

  enterHome() {
    if (!allDeviceChecksOk()) return;
    App.go('map');
  },

  startCheck() {
    App.enterHome();
  },

  closeModal(id) {
    document.getElementById(id).classList.remove('show');
  },

  updateMapChrome() {
    const topChrome = document.getElementById('map-top-chrome');
    const deviceDot = document.getElementById('device-dot');
    const deviceConn = document.getElementById('device-conn');
    const deviceBatt = document.getElementById('device-batt');
    const nav = document.getElementById('nav-banner');
    const speed = document.getElementById('speed-pill');
    const recordReady = document.getElementById('record-ready');
    const recPanel = document.getElementById('recording-panel');
    const driveBar = document.getElementById('drive-bar');
    const sheet = document.getElementById('task-sheet');
    const mapRail = document.getElementById('map-rail');

    const driving = ['navigating', 'recording', 'completing'].includes(state.mapMode);
    topChrome.classList.toggle('hidden', driving);
    nav.classList.toggle('hidden', !driving);
    speed.classList.toggle('hidden', !driving);

    recordReady.classList.toggle('hidden', state.mapMode !== 'navigating');
    recPanel.classList.toggle('hidden', state.mapMode !== 'recording');
    driveBar.classList.toggle('hidden', !['recording', 'completing'].includes(state.mapMode));

    const hideSheet = driving || state.mapMode === 'review' || !state.selectedTaskId;
    sheet.classList.toggle('hidden', hideSheet);

    mapRail.classList.toggle('hidden', driving);

    document.getElementById('drive-done').classList.toggle('hidden', state.mapMode !== 'completing');
    document.getElementById('drive-stop').classList.toggle('disabled', state.mapMode === 'completing');

    if (state.mapMode === 'recording' || state.mapMode === 'completing') {
      document.getElementById('drive-timer').textContent = formatTime(state.recSeconds);
    }

    if (state.mapMode === 'recording') {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'REC';
      deviceBatt.textContent = '78';
    } else if (allPreconditionsOk()) {
      deviceDot.className = 'device-dot';
      deviceConn.textContent = 'CONN';
      deviceBatt.textContent = '98';
    } else {
      deviceDot.className = 'device-dot err';
      deviceConn.textContent = 'DISC';
      deviceBatt.textContent = '98';
    }

    const t = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);
    if (t) document.getElementById('rec-location').textContent = t.poi_name;
  },

  tickRec() {
    state.recSeconds++;
    const t = formatTime(state.recSeconds);
    document.getElementById('rec-time').textContent = t;
    document.getElementById('drive-timer').textContent = t;
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

  renderMapTasks() {
    if (!state.map) return;
    Object.values(state.polylines).forEach((p) => state.map.removeLayer(p));
    state.polylines = {};

    const visible = filterTasksByMapFilters(state.mapTasks, state.mapFilters);
    const selected = state.mapTasks.find((x) => x.task_id === state.selectedTaskId);

    visible.forEach((t) => {
      const latlngs = t.polyline.map((p) => [p.lat, p.lng]);
      const isSelected = t.task_id === state.selectedTaskId;
      const color = getTaskLineColor(t);
      const line = L.polyline(latlngs, {
        color,
        weight: isSelected ? 8 : 5,
        opacity: 0.92,
      }).addTo(state.map);
      line.on('click', () => App.selectTask(t.task_id));
      state.polylines[t.task_id] = line;
    });

    if (selected) {
      state.map.fitBounds(
        L.latLngBounds(selected.polyline.map((p) => [p.lat, p.lng])),
        { padding: [60, 40], animate: true }
      );
    } else if (visible.length) {
      const bounds = L.latLngBounds(visible.flatMap((t) => t.polyline.map((p) => [p.lat, p.lng])));
      state.map.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  },

  renderProgressMap() {
    if (!state.progressMap) return;
    Object.values(state.progressPolylines).forEach((p) => state.progressMap.removeLayer(p));
    state.progressPolylines = {};

    const visible = state.progressTasks.filter((t) => state.progressLayers[t.progress_status]);

    visible.forEach((t) => {
      const latlngs = t.polyline.map((p) => [p.lat, p.lng]);
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

    if (visible.length) {
      const bounds = L.latLngBounds(visible.flatMap((t) => t.polyline.map((p) => [p.lat, p.lng])));
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
    if (['navigating', 'recording', 'completing'].includes(state.mapMode)) return;
    state.selectedTaskId = null;
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

    const claimed = t.display_state === 'claimed' && t.claimed_by_me;
    const completed = t.display_state === 'completed_local';
    const badges = renderTaskBadges(t);
    const distKm = (t.distance_from_user_km * 1.25).toFixed(1);

    let actionBtn = '';
    if (state.mapMode === 'review' || completed) {
      actionBtn = `<button class="btn btn-review sheet-cta" disabled>Completed</button>`;
    } else if (claimed) {
      actionBtn = `<button class="btn btn-success sheet-cta" onclick="App.openBegin()">Begin</button>`;
    } else {
      actionBtn = `<button class="btn btn-primary sheet-cta" onclick="App.acceptTask('${t.task_id}')">Accept</button>`;
    }

    const previewRow = claimed && state.mapMode === 'idle'
      ? `<div class="sheet-preview-row"><button type="button" class="preview-btn" onclick="toast('Opening preview…')"><span>👁</span>Preview</button></div>`
      : '';

    sheet.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="sheet-head">
        ${badges || '<span></span>'}
        <button type="button" class="sheet-close" onclick="App.closeTaskSheet()">×</button>
      </div>
      <h2 class="sheet-poi">${t.poi_name}</h2>
      <p class="sheet-meta">${distKm} kilometers away from you | ${t.poi_address}</p>
      <div class="sheet-route-bar">
        <span class="route-pin" aria-hidden="true">📍</span>
        <div class="route-dash"><span>${t.distance_km}km</span></div>
        <div class="route-actions">
          <button type="button" class="route-action" onclick="toast('Opening Google Maps…')" aria-label="Navigate">↗</button>
          <button type="button" class="route-action" onclick="toast('Task ID copied')" aria-label="Copy task ID">⎘</button>
        </div>
      </div>
      ${previewRow}
      ${actionBtn}
    `;
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
    App.renderPrecondition();
    document.getElementById('modal-precondition').classList.add('show');
  },

  renderPrecondition() {
    const rows = [
      { id: 'bluetooth', title: 'Bluetooth', ok: 'Connected to GoPro', err: 'Not connected to GoPro' },
      { id: 'network', title: 'Network', ok: 'Network is good', err: 'Weak or No Connection' },
    ];
    document.getElementById('precondition-rows').innerHTML = rows
      .map((r) => {
        const ok = state.preconditions[r.id];
        return `<div class="pre-row ${ok ? 'ok' : 'err'}">
          <div><strong>${r.title}</strong><span>${ok ? r.ok : r.err}</span></div>
          ${ok ? '<span class="pre-check">✓</span>' : `<button class="pre-action" onclick="App.fixPrecondition('${r.id}')">Set ›</button>`}
        </div>`;
      })
      .join('');
    const btn = document.getElementById('btn-precondition-go');
    btn.disabled = !allPreconditionsOk();
    btn.classList.toggle('disabled', !allPreconditionsOk());
  },

  fixPrecondition(id) {
    if (id === 'bluetooth') document.getElementById('modal-bluetooth').classList.add('show');
    if (id === 'network') document.getElementById('modal-network').classList.add('show');
  },

  preconditionGo() {
    if (!allPreconditionsOk()) return;
    App.closeModal('modal-precondition');
    state.mapMode = 'navigating';
    App.renderTaskSheet();
    App.updateMapChrome();
    toast('Navigate to route start');
  },

  tapRecord() {
    state.mapMode = 'recording';
    state.recSeconds = 0;
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
    if (t) {
      t.display_state = 'completed_local';
      state.mapMode = 'review';
      App.renderMapTasks();
      App.renderTaskSheet();
      App.updateMapChrome();
      toast('Congrats! Your task has been completed successfully.');
    }
  },

  openLogoutModal() {
    document.getElementById('modal-logout').classList.add('show');
  },

  logout() {
    App.closeModal('modal-logout');
    state.selectedTaskId = null;
    state.mapMode = 'idle';
    clearInterval(state.recInterval);
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
      <div class="summary-card">
        <div class="summary-item blue"><strong>${stats.done}</strong><span>DONE</span></div>
        <div class="summary-divider"></div>
        <div class="summary-item"><strong>${stats.todo}</strong><span>TO DO</span></div>
        <div class="summary-divider"></div>
        <div class="summary-item red"><strong>${stats.passed}</strong><span>PASSED</span></div>
      </div>`;

    document.getElementById('task-filters').innerHTML = `
      <button class="filter-pill dark" type="button">Date ▾</button>
      <button class="filter-pill" type="button">Status ▾</button>`;

    const groups = [
      { label: 'Today', key: 'today' },
      { label: 'Yesterday', key: 'yesterday' },
    ];

    document.getElementById('task-list').innerHTML = groups
      .map((group) => {
        const items = state.records.filter((r) => r.group === group.key);
        if (!items.length) return '';
        return `<div class="task-group">
          <h3 class="task-group-title">${group.label}</h3>
          ${items.map((r) => App.renderTaskCard(r)).join('')}
        </div>`;
      })
      .join('');
  },

  renderTaskCard(r) {
    const meta = STATUS_META[r.status] || STATUS_META.pending;
    const thumbClass = `task-thumb tone-${meta.tone}`;
    return `<div class="task-card-v2" onclick="App.onTaskCardClick('${r.task_id}','${r.status}')">
      <div class="${thumbClass}">
        <span class="thumb-overlay">${r.duration} | ${r.size}</span>
        <span class="thumb-corner ${meta.tone}">${meta.corner}</span>
      </div>
      <div class="task-card-body">
        <div class="task-card-head">
          <h4>${r.title}</h4>
          <span class="status-pill ${meta.tone}">${meta.label}</span>
        </div>
        <div class="task-card-time">${formatRecordDate(r.shot_at)}</div>
      </div>
    </div>`;
  },

  setTaskFilter(id) {
    state.taskFilter = id;
    App.renderTaskList();
  },

  onTaskCardClick(taskId, status) {
    if (status === 'claimed') App.go('map');
  },

  openCardMenu(event, taskId, status) {
    const dd = document.getElementById('card-dropdown');
    const canUndo = status === 'pending' || status === 'reviewing';
    dd.innerHTML = `<div class="dropdown-item danger ${canUndo ? '' : 'disabled'}" id="undo-item">Undo</div>`;
    const rect = event.target.getBoundingClientRect();
    dd.style.top = `${rect.bottom + 4}px`;
    dd.style.left = `${rect.right - 140}px`;
    dd.classList.add('show');
    if (canUndo) {
      document.getElementById('undo-item').onclick = () => {
        dd.classList.remove('show');
        state.undoTaskId = taskId;
        document.getElementById('modal-undo').classList.add('show');
        document.getElementById('undo-confirm-btn').onclick = () => App.confirmUndo();
      };
    }
    setTimeout(() => {
      document.addEventListener('click', () => dd.classList.remove('show'), { once: true });
    }, 0);
  },

  confirmUndo() {
    const r = state.records.find((x) => x.task_id === state.undoTaskId);
    if (r && (r.status === 'pending' || r.status === 'reviewing')) {
      r.status = 'claimed';
      toast('Upload withdrawn — task is Claimed again');
    }
    App.closeModal('modal-undo');
    App.renderTaskList();
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
App.renderPrecheck();

if (new URLSearchParams(location.search).get('demo') === 'map') {
  state.deviceChecks = { gps: true, battery: true, network: true, storage: true };
  state.preconditions = { bluetooth: true, network: true };
  App.go('map');
}
