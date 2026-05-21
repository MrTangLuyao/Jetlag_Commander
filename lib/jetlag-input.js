/* ============================================================
 * lib/jetlag-input.js
 * Questionnaire page only. Clock dials + form handlers + the
 * generate* functions that navigate the user to /plan/#<code>.
 * Loaded ONLY by /index.html. Depends on core + app.
 * ============================================================ */

/* ─── Prep flow ─── */
let _prepTimers = [];

function togglePrepItem(key){
  // Mindset is non-negotiable — show the modal, don't dim the card.
  if (key === 'mind') { openMindModal(); return; }
  if (!_prepHave.hasOwnProperty(key)) return;
  _prepHave[key] = !_prepHave[key];
  const item = document.querySelector(`.prep-item[data-item="${key}"]`);
  if (!item) return;
  item.classList.toggle('dimmed', !_prepHave[key]);
  const slot = item.closest('.prep-slot');
  const btn = slot ? slot.querySelector('.prep-toggle') : null;
  if (btn) {
    const i18nKey = _prepHave[key] ? ('prep-q-' + key) : ('prep-r-' + key);
    btn.setAttribute('data-i18n', i18nKey);
    btn.textContent = t(i18nKey);
  }
}
function openMindModal(){
  const m = document.getElementById('mind-modal');
  if (m) m.classList.add('open');
}
function closeMindModal(){
  const m = document.getElementById('mind-modal');
  if (m) m.classList.remove('open');
}

function startFlow(which){
  _flow = which;
  showView('prep');
  _prepTimers.forEach(clearTimeout); _prepTimers = [];
  // Reset the three cards to their hidden state without animating back.
  const items = ['prep-1','prep-2','prep-3'].map(id => document.getElementById(id));
  if (!items[0]) return;
  items.forEach(el => { el.style.transition = 'none'; el.classList.remove('show'); });
  void items[0].offsetWidth; // force reflow
  items.forEach(el => { el.style.transition = ''; });
  items.forEach((el, i) => {
    _prepTimers.push(setTimeout(() => el.classList.add('show'), 250 + i * 450));
  });
}
function afterPrep(){
  showView(_flow === 'sleep' ? 'input-sleep' : 'input-jet');
}

/* ─── 24-hour clock-dial picker ─── */
const _CLOCK_R = 110;
const _CLOCK_HANDLE_R = 14;
const _CLOCK_SNAP_MIN = 15;
let clockNow, clockTgt, clockHome, clockJetTgt;
const SLEEP_REGULAR_SLEEP = 23 * 60;
const SLEEP_REGULAR_WAKE  = 7  * 60;
const JET_REGULAR_SLEEP   = 23 * 60;
const JET_REGULAR_WAKE    = 7  * 60;

function createClock(svgId, opts){
  const svg = document.getElementById(svgId);
  if (!svg) return null;
  const NS = 'http://www.w3.org/2000/svg';
  const state = { sleepMin: opts.sleepMin, wakeMin: opts.wakeMin };

  const bg = document.createElementNS(NS, 'circle');
  bg.setAttribute('cx', 0); bg.setAttribute('cy', 0); bg.setAttribute('r', _CLOCK_R);
  bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', 'var(--border)'); bg.setAttribute('stroke-width', 14);
  svg.appendChild(bg);

  const center = document.createElementNS(NS, 'circle');
  center.setAttribute('cx', 0); center.setAttribute('cy', 0); center.setAttribute('r', _CLOCK_R - 24);
  center.setAttribute('class', 'ck-center');
  svg.appendChild(center);

  for (let i = 0; i < 24; i++){
    const a = (i/24) * Math.PI*2;
    const major = i % 6 === 0;
    const inner = major ? _CLOCK_R - 22 : _CLOCK_R - 16;
    const p1 = polar(a, _CLOCK_R - 10);
    const p2 = polar(a, inner);
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('x1', p1.x.toFixed(2)); ln.setAttribute('y1', p1.y.toFixed(2));
    ln.setAttribute('x2', p2.x.toFixed(2)); ln.setAttribute('y2', p2.y.toFixed(2));
    ln.setAttribute('class', 'ck-tick' + (major ? ' major' : ''));
    ln.setAttribute('stroke-width', major ? 2 : 1);
    svg.appendChild(ln);
  }

  const NR = _CLOCK_R - 36;
  [['0', 0, -NR], ['6', NR, 0], ['12', 0, NR], ['18', -NR, 0]].forEach(([txt, x, y]) => {
    const tx = document.createElementNS(NS, 'text');
    tx.setAttribute('x', x); tx.setAttribute('y', y);
    tx.setAttribute('text-anchor', 'middle');
    tx.setAttribute('dominant-baseline', 'central');
    tx.setAttribute('class', 'ck-numeral');
    tx.textContent = txt;
    svg.appendChild(tx);
  });

  const arc = document.createElementNS(NS, 'path');
  arc.setAttribute('class', 'ck-arc');
  svg.appendChild(arc);

  function makeHandle(){
    const g = document.createElementNS(NS, 'g');
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', _CLOCK_HANDLE_R); c.setAttribute('class', 'ck-handle');
    g.appendChild(c);
    svg.appendChild(g);
    return g;
  }
  const sleepHandle = makeHandle();
  const wakeHandle  = makeHandle();
  // Crescent moon (shifted to compensate the asymmetric cutout).
  sleepHandle.innerHTML += `
    <g pointer-events="none" transform="translate(0.6, 0)">
      <circle cx="0" cy="0" r="4.2" fill="var(--accent-on)"/>
      <circle cx="1.7" cy="-0.4" r="3.3" fill="var(--bg)"/>
    </g>`;
  // Sun (disc + 8 symmetric rays).
  wakeHandle.innerHTML += `
    <g pointer-events="none">
      <circle cx="0" cy="0" r="3" fill="var(--accent-on)"/>
      <g stroke="var(--accent-on)" stroke-width="1.3" stroke-linecap="round" fill="none">
        <line x1="0"    y1="-5"   x2="0"    y2="-7.2"/>
        <line x1="0"    y1="5"    x2="0"    y2="7.2"/>
        <line x1="-5"   y1="0"    x2="-7.2" y2="0"/>
        <line x1="5"    y1="0"    x2="7.2"  y2="0"/>
        <line x1="-3.5" y1="-3.5" x2="-5.1" y2="-5.1"/>
        <line x1="3.5"  y1="-3.5" x2="5.1"  y2="-5.1"/>
        <line x1="-3.5" y1="3.5"  x2="-5.1" y2="5.1"/>
        <line x1="3.5"  y1="3.5"  x2="5.1"  y2="5.1"/>
      </g>
    </g>`;

  function render(){
    const aS = minToAngle(state.sleepMin);
    const aW = minToAngle(state.wakeMin);
    const pS = polar(aS, _CLOCK_R);
    const pW = polar(aW, _CLOCK_R);
    sleepHandle.setAttribute('transform', `translate(${pS.x.toFixed(2)},${pS.y.toFixed(2)})`);
    wakeHandle .setAttribute('transform', `translate(${pW.x.toFixed(2)},${pW.y.toFixed(2)})`);
    const sweep = ((state.wakeMin - state.sleepMin + 1440) % 1440) / 1440;
    const largeArc = sweep > 0.5 ? 1 : 0;
    arc.setAttribute('d',
      `M ${pS.x.toFixed(2)} ${pS.y.toFixed(2)} A ${_CLOCK_R} ${_CLOCK_R} 0 ${largeArc} 1 ${pW.x.toFixed(2)} ${pW.y.toFixed(2)}`);
    opts.onChange && opts.onChange(state.sleepMin, state.wakeMin);
  }

  function eventToAngle(evt){
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top  + rect.height/2;
    const px = (evt.touches ? evt.touches[0].clientX : evt.clientX);
    const py = (evt.touches ? evt.touches[0].clientY : evt.clientY);
    return Math.atan2(px - cx, -(py - cy));
  }

  function attachDrag(handle, which){
    let active = false;
    const start = (e) => { active = true; e.preventDefault(); };
    const move  = (e) => {
      if (!active) return;
      state[which] = angleToMin(eventToAngle(e), _CLOCK_SNAP_MIN);
      render();
    };
    const end = () => { active = false; };
    handle.addEventListener('mousedown',  start);
    handle.addEventListener('touchstart', start, { passive:false });
    window.addEventListener('mousemove',  move);
    window.addEventListener('touchmove',  move, { passive:false });
    window.addEventListener('mouseup',    end);
    window.addEventListener('touchend',   end);
    window.addEventListener('touchcancel',end);
  }
  attachDrag(sleepHandle, 'sleepMin');
  attachDrag(wakeHandle,  'wakeMin');

  // Tap on the ring to move the nearest handle.
  svg.addEventListener('mousedown', (e) => {
    if (e.target.closest('.ck-handle')) return;
    const m = angleToMin(eventToAngle(e), _CLOCK_SNAP_MIN);
    const dS = Math.min(Math.abs(m - state.sleepMin), 1440 - Math.abs(m - state.sleepMin));
    const dW = Math.min(Math.abs(m - state.wakeMin),  1440 - Math.abs(m - state.wakeMin));
    if (dS < dW) state.sleepMin = m; else state.wakeMin = m;
    render();
  });

  render();
  return {
    get: () => ({ sleepMin: state.sleepMin, wakeMin: state.wakeMin }),
    set: (s, w) => { state.sleepMin = s; state.wakeMin = w; render(); }
  };
}

function initClocks(){
  clockNow = createClock('clock-now', {
    sleepMin: 3*60, wakeMin: 11*60,
    onChange: (s, w) => {
      const a = document.getElementById('now-sleep-val');
      const b = document.getElementById('now-wake-val');
      if (a) a.textContent = fmt(s);
      if (b) b.textContent = fmt(w);
    }
  });
  clockTgt = createClock('clock-tgt', {
    sleepMin: 23*60, wakeMin: 7*60,
    onChange: (s, w) => {
      const a = document.getElementById('tgt-sleep-val');
      const b = document.getElementById('tgt-wake-val');
      if (a) a.textContent = fmt(s);
      if (b) b.textContent = fmt(w);
    }
  });
  clockHome = createClock('clock-jet-home', {
    sleepMin: 23*60, wakeMin: 7*60,
    onChange: (s, w) => {
      const a = document.getElementById('jet-home-sleep-val');
      const b = document.getElementById('jet-home-wake-val');
      if (a) a.textContent = fmt(s);
      if (b) b.textContent = fmt(w);
      if (_jetMode === 'keep' && clockJetTgt) clockJetTgt.set(s, w);
    }
  });
  clockJetTgt = createClock('clock-jet-tgt', {
    sleepMin: JET_REGULAR_SLEEP, wakeMin: JET_REGULAR_WAKE,
    onChange: (s, w) => {
      const a = document.getElementById('jet-tgt-sleep-val');
      const b = document.getElementById('jet-tgt-wake-val');
      if (a) a.textContent = fmt(s);
      if (b) b.textContent = fmt(w);
    }
  });
}

function setSleepMode(mode){
  _sleepMode = (mode === 'custom') ? 'custom' : 'regular';
  document.querySelectorAll('#sleep-mode-seg .mode-seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === _sleepMode);
  });
  const card = document.getElementById('sleep-tgt-card');
  const hint = document.getElementById('sleep-tgt-hint');
  if (!card || !hint) return;
  if (_sleepMode === 'regular') {
    card.classList.add('disabled');
    clockTgt && clockTgt.set(SLEEP_REGULAR_SLEEP, SLEEP_REGULAR_WAKE);
    hint.setAttribute('data-i18n', 'sleep-tgt-hint-regular');
    hint.textContent = t('sleep-tgt-hint-regular');
  } else {
    card.classList.remove('disabled');
    hint.setAttribute('data-i18n', 'sleep-tgt-hint-custom');
    hint.textContent = t('sleep-tgt-hint-custom');
  }
}

function setJetMode(mode){
  _jetMode = mode;
  document.querySelectorAll('#jet-mode-seg .mode-seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  const card = document.getElementById('jet-tgt-card');
  const hint = document.getElementById('jet-tgt-hint');
  if (!card || !hint) return;
  if (mode === 'regular') {
    card.classList.add('disabled');
    clockJetTgt && clockJetTgt.set(JET_REGULAR_SLEEP, JET_REGULAR_WAKE);
    hint.setAttribute('data-i18n', 'jet-tgt-hint-regular');
    hint.textContent = t('jet-tgt-hint-regular');
  } else if (mode === 'keep') {
    card.classList.add('disabled');
    if (clockHome && clockJetTgt) {
      const h = clockHome.get();
      clockJetTgt.set(h.sleepMin, h.wakeMin);
    }
    hint.setAttribute('data-i18n', 'jet-tgt-hint-keep');
    hint.textContent = t('jet-tgt-hint-keep');
  } else {
    card.classList.remove('disabled');
    hint.setAttribute('data-i18n', 'jet-tgt-hint-custom');
    hint.textContent = t('jet-tgt-hint-custom');
  }
}

function fillCityDropdowns(){
  ['jet-from','jet-to'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '';
    CITIES.forEach(c => {
      const o = document.createElement('option');
      o.value = c.zone;
      o.textContent = (LANG==='zh' ? c.zh : c.en);
      sel.appendChild(o);
    });
    sel.value = prev || (id==='jet-from' ? 'Asia/Shanghai' : 'America/New_York');
  });
}

/* ─── Generate handlers — navigate to /plan/#<code> ───
 * `displayUrl()` resolves relative to the current document so this
 * works both at jetlag.louie1.com (→ "/plan/") and when the user
 * opens index.html straight from disk (→ "plan/index.html"). */
function generateSleep(){
  const n = clockNow.get();
  const tg = clockTgt.get();
  _flow = 'sleep';
  _lastPlan = computeSleepPlan(n, tg);
  window.location.assign(displayUrl() + '#' + b64uEnc(JSON.stringify(captureShareState())));
}
function generateJetlag(){
  const fromZone = document.getElementById('jet-from').value;
  const toZone   = document.getElementById('jet-to').value;
  const arriveStr = document.getElementById('jet-arrive').value;
  if (!arriveStr) { alert(LANG==='zh' ? '请填写到达日期 / 时间' : 'Please pick arrival date/time'); return; }
  const lp = computeJetPlan(fromZone, toZone, arriveStr, clockJetTgt.get());
  if (!lp) { alert('Invalid date'); return; }
  _flow = 'jet';
  _lastPlan = lp;
  window.location.assign(displayUrl() + '#' + b64uEnc(JSON.stringify(captureShareState())));
}

/* ─── Boot the questionnaire ─── */
(function bootInput(){
  // Default arrival = tomorrow 14:00.
  const arr = document.getElementById('jet-arrive');
  if (arr) {
    const d = new Date(); d.setDate(d.getDate() + 1);
    arr.value = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+
                String(d.getDate()).padStart(2,'0')+'T14:00';
  }
  fillCityDropdowns();
  initClocks();
  applyLang(LANG);
  bindRipples();
  // If we arrived with a hash (e.g. user clicked "Restart" on /plan/), pre-fill
  // the questionnaire forms from it. Don't auto-redirect — the user came
  // here to edit, not to view.
  const s = decodeStateFromHash();
  if (s) applyShareState(s);
  window.addEventListener('hashchange', () => {
    const ns = decodeStateFromHash();
    if (ns) applyShareState(ns);
  });
})();
