/* ============================================================
 * lib/jetlag-app.js
 * Shared DOM utilities, plan rendering, and share-link plumbing.
 * Loaded by both /index.html (questionnaire) and /plan/index.html
 * (display). Depends on jetlag-core.js.
 * ============================================================ */

const DT = luxon.DateTime;

/* ─── Page-level mutable state ─── */
let LANG = navigator.language.toLowerCase().includes('zh') ? 'zh' : 'en';
let _lastPlan = null;
let _flow = null;                 // 'sleep' | 'jet'
let _sleepMode = 'regular';       // 'regular' | 'custom'
let _jetMode = 'regular';         // 'regular' | 'keep' | 'custom'
const _prepHave = { coffee: true, melatonin: true };

/* ─── i18n ─── */
function t(k){ return (I18N[LANG]&&I18N[LANG][k])||I18N.en[k]||k; }
function applyLang(lang){
  LANG = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (I18N[lang][k] !== undefined) el.textContent = I18N[lang][k];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const k = el.getAttribute('data-i18n-html');
    if (I18N[lang][k] !== undefined) el.innerHTML = I18N[lang][k];
  });
  const langLbl = document.getElementById('lang-label');
  if (langLbl) langLbl.textContent = lang==='zh' ? '文 ⇄ EN' : 'EN ⇄ 文';
  document.documentElement.lang = lang==='zh' ? 'zh-CN' : 'en';
  // Both pages call these; they're DOM-tolerant.
  if (typeof fillCityDropdowns === 'function') fillCityDropdowns();
  bindRipples();
  // Plan view content is innerHTML-injected with translations baked in,
  // so [data-i18n] swaps don't touch it. Re-render if it's mounted.
  const mount = document.getElementById('plan-content');
  if (mount && _lastPlan) {
    mount.innerHTML = renderPlanHtml(_lastPlan);
    bindRipples();
  }
}
function toggleLang(){ applyLang(LANG==='zh'?'en':'zh'); }

/* ─── Ripples ─── */
function createRipple(event){
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter/2;
  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = diameter+'px';
  circle.style.left = (event.clientX-rect.left-radius)+'px';
  circle.style.top  = (event.clientY-rect.top-radius)+'px';
  circle.classList.add('ripple');
  const ex = button.querySelector('.ripple'); if (ex) ex.remove();
  circle.addEventListener('animationend', () => circle.remove());
  button.appendChild(circle);
}
function bindRipples(){
  document.querySelectorAll('.ripple-surface').forEach(el => {
    if (el.dataset.rippleBound) return;
    el.dataset.rippleBound = '1';
    el.addEventListener('touchstart', (e) => {
      el._lastTouch = Date.now();
      createRipple({ currentTarget: el, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }, { passive: true });
    el.addEventListener('mousedown', (e) => {
      if (Date.now() - (el._lastTouch||0) < 500) return;
      createRipple(e);
    });
  });
}

/* ─── View switching (only meaningful on /; harmless on /plan/) ─── */
function showView(name){
  document.querySelectorAll('.ripple').forEach(r => r.remove());
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + name);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ─── Cross-page navigation ───
 * The two HTML files reference each other. We resolve URLs relative to
 * the current document so the app works in three deployment contexts:
 *
 *   1. Served at a domain root (jetlag.louie1.com/)  → clean "/plan/" URLs
 *   2. Served from a subdirectory                     → still relative
 *   3. Opened straight from disk (file://…/index.html)→ "plan/index.html"
 *
 * Browsers don't auto-serve index.html for a file:// directory, so on
 * the file:// branch we have to spell out the filename explicitly.
 */
function isOnDisplayPage(){
  const p = window.location.pathname;
  return /\/plan\/(?:index\.html)?$/.test(p) || p === '/plan';
}
function homeUrl(){
  const onDisplay = isOnDisplayPage();
  if (window.location.protocol === 'file:') {
    return new URL((onDisplay ? '../' : './') + 'index.html', window.location.href).toString();
  }
  return new URL(onDisplay ? '../' : './', window.location.href).toString();
}
function displayUrl(){
  const onDisplay = isOnDisplayPage();
  if (window.location.protocol === 'file:') {
    return new URL(onDisplay ? './index.html' : 'plan/index.html', window.location.href).toString();
  }
  return new URL(onDisplay ? './' : 'plan/', window.location.href).toString();
}

/* Any anchor marked with `data-home-link` gets its href rewritten to the
 * resolved homeUrl(). This way the static HTML can ship a sensible fallback
 * (`index.html` / `../index.html`) for file:// use, and the rewriter cleans
 * it up to a root URL when served over HTTP. */
(function rewriteHomeLinks(){
  const url = homeUrl();
  document.querySelectorAll('[data-home-link]').forEach(a => { a.href = url; });
})();

/* ─── Toast (used for share-link copy feedback) ─── */
function toast(msg){
  let el = document.getElementById('share-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'share-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 1800);
}

/* ─── Scroll-driven navbar frost (both pages) ─── */
(function(){
  const root = document.documentElement;
  let ticking = false;
  function update(){
    ticking = false;
    const p = Math.min(1, Math.max(0, window.scrollY / 120));
    root.style.setProperty('--frost-progress', p.toFixed(3));
  }
  window.addEventListener('scroll', () => { if (!ticking){ticking=true;requestAnimationFrame(update);} }, { passive: true });
  update();
})();

/* ============================================================
 * Plan rendering
 * ============================================================ */
function dirLabel(dir){ return t('dir-' + dir); }
function magnitudeDisplay(h){
  const wh = Math.floor(h);
  const fm = Math.round((h - wh) * 60);
  let s = '';
  if (wh) s += wh + ' ' + t('h');
  if (fm) s += (s?' ':'') + fm + ' ' + t('min');
  return s || ('0 ' + t('h'));
}
function row(time, cls, icon, title, sub){
  return `<div class="tl-row"><div class="tl-time">${time}</div><div class="tl-icon ${cls}">${icon}</div><div class="tl-text">${title}${sub?`<span class="tl-sub">${sub}</span>`:''}</div></div>`;
}

// Day timeline items. Reads _prepHave to skip caffeine/melatonin rows
// when the user has declared they don't have those.
//
// Color taxonomy (icon background + accent):
//   warn  (yellow) — alertness / wake-state cues
//   good  (green)  — neutral daily routine (meals, walks, exercise)
//   bad   (red)    — explicit prohibitions ("stop X")
//   sleep (blue)   — sleep itself + the wind-down ramp that leads into it
function buildDayItems(direction, bedMin, wakeMin, day1){
  const items = [];
  if (direction === 'delay') {
    items.push({ t: wakeMin, c:'warn', i:ICON.glass, key:'no-light', h:t('no-light'), s:t('no-light-sub') });
  } else {
    items.push({ t: wakeMin, c:'warn', i:ICON.sun, key:'wake', h:t('wake'), s:t('wake-sub') });
  }
  items.push({ t: modMin(wakeMin + 30),  c:'good', i:ICON.drop,   key:'water', h:t('water'),  s:t('water-sub') });
  items.push({ t: modMin(wakeMin + 60),  c:'good', i:ICON.sun,    key:'walk',  h:t('walk'),   s:t('walk-sub') });
  if (_prepHave.coffee) {
    items.push({ t: modMin(wakeMin + 240), c:'warn', i:ICON.coffee, key:'caf-ok', h:t('caf-ok'), s:t('caf-ok-sub') });
  }
  items.push({ t: modMin(wakeMin + 300), c:'good', i:ICON.fork,   key:'lunch', h:t('lunch'),  s:t('lunch-sub') });
  if (day1 && direction !== 'none') {
    items.push({ t: modMin(wakeMin + 390), c:'sleep', i:ICON.nap, key:'nap',   h:t('nap'),    s:t('nap-sub') });
  }
  if (_prepHave.coffee) {
    items.push({ t: modMin(wakeMin + 420), c:'bad', i:ICON.ban,   key:'caf-stop', h:t('caf-stop'), s:t('caf-stop-sub') });
  }
  items.push({ t: modMin(bedMin - 300),  c:'good',  i:ICON.run,    key:'exercise', h:t('exercise'), s:t('exercise-sub') });
  items.push({ t: modMin(bedMin - 240),  c:'good',  i:ICON.fork,   key:'dinner',   h:t('dinner'),   s:t('dinner-sub') });
  items.push({ t: modMin(bedMin - 120),  c:'sleep', i:ICON.glass,  key:'dim',      h:t('dim'),      s:t('dim-sub') });
  items.push({ t: modMin(bedMin - 60),   c:'sleep', i:ICON.bath,   key:'warm-bath',h:t('warm-bath'),s:t('warm-bath-sub') });
  if (_prepHave.melatonin) {
    items.push({ t: modMin(bedMin - 30), c:'sleep', i:ICON.pill,   key:'mel',      h:t('mel'),      s:t('mel-sub') });
  }
  items.push({ t: bedMin, c:'sleep', i:ICON.moon, key:'bed', h:t('bed'), s:t('bed-sub') });
  return items;
}

function renderDay(label, direction, bedMin, wakeMin, day1, remainHours){
  const items = buildDayItems(direction, bedMin, wakeMin, day1);
  const ordered = items.slice().sort((a,b) => modMin(a.t - wakeMin) - modMin(b.t - wakeMin));

  // Compact "still to shift" indicator: arrow + number for in-progress days,
  // a checkmark when the day already lands on the target rhythm. Lives in
  // the icon grid column of the h3 so it sits over the timeline icons.
  let remainBadge;
  if (remainHours > 0.1) {
    // Reuse the left arrow glyph for both directions; CSS mirrors it when
    // we're shifting "later" so the two arrows match in stroke weight.
    const arrow = direction === 'advance'
      ? ICON.arrowL
      : `<span class="flip-x">${ICON.arrowL}</span>`;
    // Trim a trailing ".0" so "2.0h" reads "2h" but "2.5h" survives.
    const hStr = remainHours.toFixed(1).replace(/\.0$/, '');
    remainBadge = `<span class="day-remain">${arrow}<span>${hStr}${t('h')}</span></span>`;
  } else {
    remainBadge = `<span class="day-remain on" title="${t('on-target')}">${ICON.check}</span>`;
  }
  const wakeBedLine = t('wake-bed-line').replace('%WAKE%', fmt(wakeMin)).replace('%BED%', fmt(bedMin));

  // Group rows into morning / afternoon / evening relative to wake & bed.
  const tlParts = [];
  let curSec = null;
  ordered.forEach(o => {
    const wakeOff = modMin(o.t - wakeMin);
    const bedOff  = modMin(bedMin - o.t);
    let sec;
    if (wakeOff <= 240)      sec = 'morning';
    else if (bedOff <= 300)  sec = 'evening';
    else                     sec = 'afternoon';
    if (sec !== curSec) {
      curSec = sec;
      tlParts.push(`<div class="tl-section" data-i18n="section-${sec}">${t('section-' + sec)}</div>`);
    }
    tlParts.push(row(fmt(o.t), o.c, o.i, o.h, o.s));
  });

  return `
    <div class="day-card">
      <h3>
        <span class="day-pill">${label}</span>
        ${remainBadge}
        <span class="day-rhythm">${wakeBedLine}</span>
      </h3>
      <div class="timeline">${tlParts.join('')}</div>
    </div>`;
}

/* ─── Plan compute: pure functions that don't touch DOM ───
 * computeSleepPlan(now, tgt) and computeJetPlan(...) produce a
 * "plan state" object consumed by renderPlanHtml + buildICS.
 * Called from /index.html boot (after reading clocks) AND from
 * /plan/index.html boot (after decoding the hash).
 */
function computeSleepPlan(now, tgt){
  const delta = shortestDelta(now.sleepMin, tgt.sleepMin);
  const mag = Math.abs(delta);
  const direction = mag < 15 ? 'none' : (delta < 0 ? 'advance' : 'delay');
  const magH = mag / 60;
  const r = planFromShift(magH, direction, tgt.sleepMin, tgt.wakeMin);
  return {
    mode: 'sleep', direction, magH,
    days: r.days, perDay: r.perDay, aggressive: r.aggressive, plan: r.plan,
    startDate: DT.local().startOf('day'),
    timezone: DT.local().zoneName
  };
}
function computeJetPlan(fromZone, toZone, arriveStr, tgt){
  const arrivalLocal = DT.fromISO(arriveStr, { zone: toZone });
  if (!arrivalLocal.isValid) return null;
  const fromOffset = DT.fromMillis(arrivalLocal.toUTC().toMillis(), { zone: fromZone }).offset / 60;
  const toOffset   = arrivalLocal.offset / 60;
  const rawShift = toOffset - fromOffset;
  const magH = Math.min(Math.abs(rawShift), 24 - Math.abs(rawShift));
  const direction = Math.abs(rawShift) < 1 ? 'none' : (rawShift > 0 ? 'advance' : 'delay');
  const r = planFromShift(magH, direction, tgt.sleepMin, tgt.wakeMin);
  return {
    mode: 'jet', direction, magH,
    days: r.days, perDay: r.perDay, aggressive: r.aggressive, plan: r.plan,
    startDate: arrivalLocal.startOf('day'),
    timezone: toZone,
    fromZone, toZone
  };
}

function renderPlanHtml(state){
  const { mode, direction, plan, magH, days, perDay, aggressive } = state;
  // Wrap the whole output with a data attribute that scopes the CSS
  // variables for column widths — jet mode needs a wider time column for
  // its "到达第 N 天" pill, sleep mode keeps the narrow default.
  // Title now reflects which flow this is — sleep vs jet — instead of the
  // generic "your action plan" header.
  let html = `
    <h2 style="font-size: clamp(28px,5vw,40px); font-weight:800; margin: 0 0 6px;">${t('plan-h-' + mode)}</h2>
    <p style="color:var(--muted); font-size:14px; margin: 0 0 24px;">${t('plan-sub')}</p>
    <div class="summary">
      <div class="s-cell"><span class="s-label">${t('lbl-direction')}</span><span class="s-value">${direction==='none'?t('dir-none'):dirLabel(direction)}</span></div>
      <div class="s-cell"><span class="s-label">${t('lbl-shift')}</span><span class="s-value">${magnitudeDisplay(magH)}</span></div>
      <div class="s-cell"><span class="s-label">${t('lbl-days')}</span><span class="s-value">${days}</span></div>
      <div class="s-cell"><span class="s-label">${t('lbl-rate')}</span><span class="s-value">${perDay.toFixed(1)} ${t('h')}</span></div>
    </div>
    ${aggressive ? `<div class="note" style="margin-bottom:20px;">${t('aggressive')}</div>` : ''}
  `;
  if (mode === 'jet') {
    const preItems = [];
    if (direction !== 'none') {
      preItems.push(row('—','warn', ICON.sun, t(direction==='advance'?'preflight-shift-advance':'preflight-shift-delay'),''));
    }
    preItems.push(row('—','bad',   ICON.ban,   t('flight-no-alc'), t('flight-no-alc-sub')));
    preItems.push(row('—','sleep', ICON.plane, t('flight-time'),   t('flight-time-sub')));
    preItems.push(row('—','good',  ICON.fork,  t('flight-meal'),   t('flight-meal-sub')));
    // Pre-flight is wrapped between two phase labels, NOT inside a day-pill
    // anymore — the labels act as section dividers that separate the
    // pre-arrival block from the arrival-day cards below.
    html += `
      <div class="phase-label">${t('pre-flight')}</div>
      <div class="day-card">
        <div class="day-sub">${t('pre-flight-sub')}</div>
        <div class="timeline">${preItems.join('')}</div>
      </div>
      <div class="phase-label">${t('after-arrival')}</div>`;
  } else if (direction === 'none') {
    html += `<div class="day-card"><div class="day-sub">${t('no-shift')}</div></div>`;
  }
  plan.forEach(d => {
    const label = (mode === 'jet' ? t('arrival-day-fmt') : t('day-fmt')).replace('%N%', d.i);
    html += renderDay(label, direction, d.bed, d.wake, d.i === 1, d.remain);
  });
  html += planActionsHtml(mode);
  return `<div data-plan-mode="${mode}">${html}</div>`;
}

/* ============================================================
 * Plan actions (save / calendar / share / restart)
 * ============================================================ */
function planActionsHtml(mode){
  return `<div class="row-actions plan-actions">
    <button class="btn-ghost ripple-surface plan-action-btn" onclick="savePlan()">${ICON_SAVE}<span>${t('result-save')}</span></button>
    <button class="btn-ghost ripple-surface plan-action-btn" onclick="addPlanToCalendar()">${ICON_CAL}<span>${t('result-cal')}</span></button>
    <button class="btn-ghost ripple-surface plan-action-btn" onclick="copyShareLink()">${ICON_SHARE}<span>${t('result-share')}</span></button>
    <button class="btn-ghost ripple-surface plan-action-btn" onclick="restartPlan('${mode}')">${ICON_RESTART}<span>${t('result-restart')}</span></button>
  </div>`;
}
function savePlan(){ window.print(); }

/* Restart goes back to the questionnaire with state preserved in the
 * hash, so the input forms re-populate. On /plan/ this means a top-level
 * navigation home; on / it's a same-page view switch. */
function restartPlan(mode){
  if (isOnDisplayPage()) {
    window.location.assign(homeUrl() + window.location.hash);
  } else {
    showView(mode === 'jet' ? 'input-jet' : 'input-sleep');
  }
}

function addPlanToCalendar(){
  if (!_lastPlan) return;
  const ics = buildICS(_lastPlan);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jetlag-commander-' + (_lastPlan.mode || 'plan') + '.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

function _escIcs(s){
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
function buildICS(state){
  const { plan, direction, startDate, timezone, mode } = state;
  const stamp = DT.utc().toFormat("yyyyLLdd'T'HHmmss'Z'");
  const seriesId = Date.now().toString(36);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jetlag Commander 2//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + _escIcs((mode === 'jet' ? 'Jetlag — ' : 'Sleep — ') + 'Jetlag Commander 2')
  ];
  let uidCounter = 0;
  plan.forEach((d, dayIdx) => {
    const dayBase = startDate.plus({ days: dayIdx });
    const items = buildDayItems(direction, d.bed, d.wake, d.i === 1);
    items.forEach(item => {
      // Items with t < wakeMin belong to the same subjective day but
      // happen after midnight clock-wise — push them to the next calendar
      // day so the .ics output matches how the user reads the plan.
      let dt = dayBase.set({ hour: Math.floor(item.t / 60), minute: item.t % 60, second: 0 });
      if (item.t < d.wake) dt = dt.plus({ days: 1 });
      const dtStr = dt.toFormat("yyyyLLdd'T'HHmmss");
      const dtEnd = dt.plus({ minutes: 30 }).toFormat("yyyyLLdd'T'HHmmss");
      uidCounter += 1;
      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + seriesId + '-' + uidCounter + '@jetlag-commander');
      lines.push('DTSTAMP:' + stamp);
      lines.push('DTSTART;TZID=' + timezone + ':' + dtStr);
      lines.push('DTEND;TZID=' + timezone + ':' + dtEnd);
      lines.push('SUMMARY:' + _escIcs(item.h));
      lines.push('DESCRIPTION:' + _escIcs(item.s));
      lines.push('END:VEVENT');
    });
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

/* ============================================================
 * Share link — encode/decode the input state as #<base64url(JSON)>
 *
 * Canonical share URL: jetlag.louie1.com/plan/#<code>
 * Versioned (v=1).
 * ============================================================ */
function _cityIdx(zone){
  const i = CITIES.findIndex(c => c.zone === zone);
  return i < 0 ? 0 : i;
}

/* Read everything we need to round-trip the user's inputs back into a
 * working plan. Tolerant of missing clocks/dropdowns so /plan/ can also
 * call this (its clocks are undefined, falls back to last-known values
 * from the decoded hash). */
function captureShareState(){
  const tryGet = (clk, fallbackSleep, fallbackWake) => {
    if (clk && typeof clk.get === 'function') {
      const v = clk.get();
      return { sleepMin: v.sleepMin, wakeMin: v.wakeMin };
    }
    return { sleepMin: fallbackSleep, wakeMin: fallbackWake };
  };
  const n  = tryGet(typeof clockNow    !== 'undefined' ? clockNow    : null, _lastShareInput.ns, _lastShareInput.nw);
  const tg = tryGet(typeof clockTgt    !== 'undefined' ? clockTgt    : null, _lastShareInput.ts, _lastShareInput.tw);
  const jh = tryGet(typeof clockHome   !== 'undefined' ? clockHome   : null, _lastShareInput.jhs, _lastShareInput.jhw);
  const jt = tryGet(typeof clockJetTgt !== 'undefined' ? clockJetTgt : null, _lastShareInput.jts, _lastShareInput.jtw);
  const fromEl = document.getElementById('jet-from');
  const toEl   = document.getElementById('jet-to');
  const arrEl  = document.getElementById('jet-arrive');
  return {
    v:  1,
    m:  (_lastPlan && _lastPlan.mode) || _flow || 'sleep',
    c:  _prepHave.coffee    ? 1 : 0,
    p:  _prepHave.melatonin ? 1 : 0,
    ns: n.sleepMin,  nw: n.wakeMin,
    ts: tg.sleepMin, tw: tg.wakeMin,
    sm: _sleepMode,
    jm: _jetMode,
    jf: fromEl ? _cityIdx(fromEl.value) : _lastShareInput.jf,
    jt: toEl   ? _cityIdx(toEl.value)   : _lastShareInput.jt,
    ja: arrEl  ? (arrEl.value || '')    : _lastShareInput.ja,
    jhs: jh.sleepMin, jhw: jh.wakeMin,
    jts: jt.sleepMin, jtw: jt.wakeMin,
    l:  LANG
  };
}
// Mirrors the last loaded share-state so captureShareState can rebuild
// the same URL even on /plan/ where the form/clock DOM doesn't exist.
const _lastShareInput = {
  ns: 3*60, nw: 11*60, ts: 23*60, tw: 7*60,
  jhs: 23*60, jhw: 7*60, jts: 23*60, jtw: 7*60,
  jf: 21, jt: 6, ja: ''
};

function buildShareLink(){
  return displayUrl() + '#' + b64uEnc(JSON.stringify(captureShareState()));
}

function copyShareLink(){
  const url = buildShareLink();
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = url; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    if (ok) toast(t('toast-copied'));
    else prompt(t('toast-copy-fail'), url);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => toast(t('toast-copied')), fallback);
  } else {
    fallback();
  }
}

/* Apply decoded state to globals + DOM. Caller is responsible for
 * deciding what to *do* with the state afterwards (the questionnaire
 * page just pre-fills forms; the display page also renders the plan). */
function applyShareState(s){
  if (!s || s.v !== 1) return false;
  // Cache for round-tripping on the display page where no forms exist.
  ['ns','nw','ts','tw','jhs','jhw','jts','jtw','jf','jt','ja'].forEach(k => {
    if (s[k] !== undefined) _lastShareInput[k] = s[k];
  });
  if (s.l === 'zh' || s.l === 'en') applyLang(s.l);
  _prepHave.coffee    = !!s.c;
  _prepHave.melatonin = !!s.p;
  ['coffee', 'melatonin'].forEach(key => {
    const item = document.querySelector(`.prep-item[data-item="${key}"]`);
    if (!item) return;
    item.classList.toggle('dimmed', !_prepHave[key]);
    const slot = item.closest('.prep-slot');
    const btn  = slot ? slot.querySelector('.prep-toggle') : null;
    if (btn) {
      const k = _prepHave[key] ? ('prep-q-' + key) : ('prep-r-' + key);
      btn.setAttribute('data-i18n', k);
      btn.textContent = t(k);
    }
  });
  // Clocks (only set if they exist on this page).
  if (typeof clockNow    !== 'undefined' && clockNow    && typeof s.ns  === 'number') clockNow   .set(s.ns,  s.nw);
  if (typeof clockTgt    !== 'undefined' && clockTgt    && typeof s.ts  === 'number') clockTgt   .set(s.ts,  s.tw);
  if (typeof clockHome   !== 'undefined' && clockHome   && typeof s.jhs === 'number') clockHome  .set(s.jhs, s.jhw);
  if (typeof clockJetTgt !== 'undefined' && clockJetTgt && typeof s.jts === 'number') clockJetTgt.set(s.jts, s.jtw);
  // Dropdowns + arrival (only on /).
  const fromEl = document.getElementById('jet-from');
  const toEl   = document.getElementById('jet-to');
  const arrEl  = document.getElementById('jet-arrive');
  if (fromEl && typeof s.jf === 'number' && CITIES[s.jf]) fromEl.value = CITIES[s.jf].zone;
  if (toEl   && typeof s.jt === 'number' && CITIES[s.jt]) toEl.value   = CITIES[s.jt].zone;
  if (arrEl  && s.ja) arrEl.value = s.ja;
  if (typeof setSleepMode === 'function') {
    setSleepMode(s.sm === 'custom' ? 'custom' : 'regular');
  } else {
    _sleepMode = s.sm === 'custom' ? 'custom' : 'regular';
  }
  if (typeof setJetMode === 'function') {
    setJetMode(s.jm === 'keep' || s.jm === 'custom' ? s.jm : 'regular');
  } else {
    _jetMode = (s.jm === 'keep' || s.jm === 'custom') ? s.jm : 'regular';
  }
  _flow = (s.m === 'jet') ? 'jet' : 'sleep';
  return true;
}

function decodeStateFromHash(){
  const h = window.location.hash;
  if (!h || h.length < 2) return null;
  try { return JSON.parse(b64uDec(h.slice(1))); }
  catch (e) { console.warn('Bad share hash:', e); return null; }
}
