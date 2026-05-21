/* ============================================================
 * lib/jetlag-core.js
 * Jetlag Commander — pure data + math, zero DOM access.
 * Loaded by both /index.html and /plan/index.html.
 * ============================================================ */

/* ─── Cities (zone list shared by both pages) ─── */
const CITIES = [
  { en:'Honolulu', zh:'檀香山', zone:'Pacific/Honolulu' },
  { en:'Anchorage', zh:'安克雷奇', zone:'America/Anchorage' },
  { en:'Los Angeles', zh:'洛杉矶', zone:'America/Los_Angeles' },
  { en:'Vancouver', zh:'温哥华', zone:'America/Vancouver' },
  { en:'Denver', zh:'丹佛', zone:'America/Denver' },
  { en:'Chicago', zh:'芝加哥', zone:'America/Chicago' },
  { en:'New York', zh:'纽约', zone:'America/New_York' },
  { en:'Toronto', zh:'多伦多', zone:'America/Toronto' },
  { en:'Mexico City', zh:'墨西哥城', zone:'America/Mexico_City' },
  { en:'São Paulo', zh:'圣保罗', zone:'America/Sao_Paulo' },
  { en:'London', zh:'伦敦', zone:'Europe/London' },
  { en:'Paris', zh:'巴黎', zone:'Europe/Paris' },
  { en:'Berlin', zh:'柏林', zone:'Europe/Berlin' },
  { en:'Rome', zh:'罗马', zone:'Europe/Rome' },
  { en:'Athens', zh:'雅典', zone:'Europe/Athens' },
  { en:'Moscow', zh:'莫斯科', zone:'Europe/Moscow' },
  { en:'Dubai', zh:'迪拜', zone:'Asia/Dubai' },
  { en:'New Delhi / Mumbai', zh:'新德里 / 孟买', zone:'Asia/Kolkata' },
  { en:'Bangkok', zh:'曼谷', zone:'Asia/Bangkok' },
  { en:'Singapore', zh:'新加坡', zone:'Asia/Singapore' },
  { en:'Hong Kong', zh:'香港', zone:'Asia/Hong_Kong' },
  { en:'Beijing / Shanghai', zh:'北京 / 上海', zone:'Asia/Shanghai' },
  { en:'Taipei', zh:'台北', zone:'Asia/Taipei' },
  { en:'Tokyo', zh:'东京', zone:'Asia/Tokyo' },
  { en:'Seoul', zh:'首尔', zone:'Asia/Seoul' },
  { en:'Sydney', zh:'悉尼', zone:'Australia/Sydney' },
  { en:'Melbourne', zh:'墨尔本', zone:'Australia/Melbourne' },
  { en:'Auckland', zh:'奥克兰', zone:'Pacific/Auckland' }
];

/* ─── i18n strings ─── */
const I18N = {
  zh: {
    'hero-sub':'科学调整睡眠',
    'home-sleep':'我要调整睡眠','home-jet':'我要倒时差',
    'prep-title':'开始之前，请准备好','prep-lede':'这三样东西，能帮助你完成一次干净的节律重置。',
    'prep-helper':'没有这些？没关系，点击它们让我知道。',
    'prep-q-coffee':'没有咖啡？','prep-q-melatonin':'没有褪黑素？','prep-q-mind':'没有好心态？',
    'prep-r-coffee':'我没有咖啡','prep-r-melatonin':'我没有褪黑素',
    'mind-modal-text':'好心态是调整睡眠必不可少的。','modal-ok':'好的',
    'prep-coffee-h':'一杯咖啡','prep-coffee-p':'让我们更清醒。',
    'prep-pill-h':'一颗褪黑素','prep-pill-p':'约0.5mg，给你一个好睡眠。',
    'prep-mind-h':'一份好心态','prep-mind-p':'相信自己，保持良好的精神状态。',
    'prep-ready':'准备好了，开始','back':'返回',
    'sleep-h':'调整你的睡眠','sleep-lede':'左侧为目前的时间，右侧为你想调整的时间。',
    'sleep-mode-regular':'规律','sleep-mode-custom':'自定义',
    'sleep-tgt-hint-regular':'默认 23:00 入睡，07:00 起床',
    'sleep-tgt-hint-custom':'⬤ 拖动表盘两端调整，15 分钟为一档',
    'jet-h':'倒时差','jet-lede':'左侧为你在家的睡眠节律，右侧为到达后想要的节律。',
    'ck-now':'现在','ck-tgt':'目标','ck-home':'在家睡眠习惯','ck-tgt-jet':'目的地节律',
    'ck-sleep':'入睡','ck-wake':'起床','ck-hint':'⬤ 拖动表盘两端调整，15 分钟为一档',
    'jet-from':'出发地','jet-to':'目的地','jet-arrive':'到达时间（目的地当地）',
    'jet-mode-regular':'规律','jet-mode-keep':'保持','jet-mode-custom':'自定义',
    'jet-tgt-hint-regular':'默认 23:00 入睡，07:00 起床',
    'jet-tgt-hint-keep':'和左侧保持一致',
    'jet-tgt-hint-custom':'⬤ 拖动表盘两端调整，15 分钟为一档',
    'section-morning':'早上','section-afternoon':'下午','section-evening':'晚上',
    'generate':'生成行动计划',
    'lbl-direction':'理论方向','lbl-shift':'时差','lbl-days':'恢复天数','lbl-rate':'每日推进',
    'dir-advance':'向东移动','dir-delay':'向西移动','dir-none':'无明显时差',
    'plan-sub':'你的专属生活计划',
    'h':'小时','min':'分钟','day-fmt':'第 %N% 天','arrival-day-fmt':'到达第 %N% 天',
    'wake':'起床 见阳光','wake-sub':'拉开窗帘走出门，让阳光唤醒身体。',
    'no-light':'暂时避光','no-light-sub':'戴上墨镜或拉好窗帘，等到上午十点再迎光。',
    'water':'喝水吃早餐','water-sub':'一大杯水加一份蛋白质，启动新的一天。',
    'walk':'出去走走','walk-sub':'二三十分钟，阳光下溜达一圈。',
    'caf-ok':'喝一杯咖啡','caf-ok-sub':'今天就这一杯，慢慢享受。',
    'lunch':'吃午饭','lunch-sub':'按目的地的时间吃，让肠胃跟上节奏。',
    'nap':'小睡一下','nap-sub':'设个三十分钟闹钟，下午三点前结束。',
    'caf-stop':'咖啡因截止','caf-stop-sub':'茶，可乐，咖啡 从现在开始禁止食用',
    'exercise':'动一动','exercise-sub':'快走、拉伸或瑜伽，温和就够了。',
    'dinner':'吃晚餐','dinner-sub':'清淡一点，今晚不要喝酒。',
    'dim':'调暗灯光','dim-sub':'手机亮度调低，戴上蓝光眼镜。',
    'warm-bath':'洗个热水澡','warm-bath-sub':'四十度左右，泡十分钟就好。',
    'mel':'吃褪黑素','mel-sub':'约 0.5mg，舌下含服或快释。',
    'bed':'上床睡觉','bed-sub':'卧室全黑，手机放在卧室外。',
    'preflight-shift-advance':'今晚起，比平时早 1 小时上床、早 1 小时起','preflight-shift-delay':'今晚起，比平时晚 1 小时上床、晚 1 小时起',
    'flight-no-alc':'机上滴酒不沾，每小时 200 ml 水','flight-no-alc-sub':'酒精破坏 REM，加剧脱水。',
    'flight-time':'按目的地时间作息','flight-time-sub':'他们的"夜"= 你睡 (眼罩 + 耳塞)；他们的"昼"= 你保持清醒。',
    'flight-meal':'最后一餐对齐目的地下一顿','flight-meal-sub':'空腹 12–16 小时再吃，给肝脏快速授时。',
    'result-h':'你的行动计划',
    'plan-h-sleep':'调整睡眠计划','plan-h-jet':'倒时差计划',
    'after-arrival':'抵达后',
    'result-save':'保存','result-cal':'添加至日历','result-share':'复制分享链接','result-restart':'重新开始',
    'toast-copied':'链接已复制','toast-copy-fail':'复制失败，请手动复制：',
    'pre-flight':'起飞前 / 飞行中','pre-flight-sub':'在飞机上就开始让身体向目的地节律靠拢。',
    'no-shift':'你的当前作息已经接近目标，今晚执行一次完整计划即可。',
    'aggressive':'⚡ 时差较大，3 天方案推进幅度高于自然节律。务必严格执行光照与褪黑素时机。',
    'wake-bed-line':'起床 %WAKE% → 入睡 %BED%','on-target':'已对齐目标节律',
    'jet-target':'想几点睡（目的地）',
    'remain-advance':'还需向前 ','remain-delay':'还需向后 '
  },
  en: {
    'hero-sub':'Science-grade sleep reset',
    'home-sleep':'Shift my sleep','home-jet':'Beat jet lag',
    'prep-title':'Before we start, grab these','prep-lede':'These three things help you complete a clean rhythm reset.',
    'prep-helper':'Don\'t have them? No problem. Click to let me know.',
    'prep-q-coffee':'No coffee?','prep-q-melatonin':'No melatonin?','prep-q-mind':'No good mindset?',
    'prep-r-coffee':'I don\'t have coffee','prep-r-melatonin':'I don\'t have melatonin',
    'mind-modal-text':'A good mindset is essential to resetting your sleep.','modal-ok':'OK',
    'prep-coffee-h':'Coffee','prep-coffee-p':'Keeps you sharper.',
    'prep-pill-h':'Melatonin','prep-pill-p':'About 0.5 mg, for a clean night of sleep.',
    'prep-mind-h':'Patient Mind','prep-mind-p':'Trust the process. Keep a clear head.',
    'prep-ready':'I\'m ready, start','back':'Back',
    'sleep-h':'Shift your sleep','sleep-lede':'Left dial: where you are now. Right dial: where you want to be.',
    'sleep-mode-regular':'Regular','sleep-mode-custom':'Custom',
    'sleep-tgt-hint-regular':'Default 23:00 sleep, 07:00 wake',
    'sleep-tgt-hint-custom':'⬤ Drag either handle, snaps to 15 min',
    'jet-h':'Beat jet lag','jet-lede':'Left dial: your home rhythm. Right dial: target rhythm at destination.',
    'ck-now':'Now','ck-tgt':'Target','ck-home':'Home rhythm','ck-tgt-jet':'Destination rhythm',
    'ck-sleep':'Sleep','ck-wake':'Wake','ck-hint':'⬤ Drag either handle, snaps to 15 min',
    'jet-from':'Origin','jet-to':'Destination','jet-arrive':'Arrival (destination local)','jet-target':'Target bedtime (destination)',
    'jet-mode-regular':'Regular','jet-mode-keep':'Mirror','jet-mode-custom':'Custom',
    'jet-tgt-hint-regular':'Default 23:00 sleep, 07:00 wake',
    'jet-tgt-hint-keep':'Mirrors your home rhythm',
    'jet-tgt-hint-custom':'⬤ Drag either handle, snaps to 15 min',
    'section-morning':'Morning','section-afternoon':'Afternoon','section-evening':'Night',
    'generate':'Generate plan',
    'lbl-direction':'Theoretical shift','lbl-shift':'Time gap','lbl-days':'Recovery days','lbl-rate':'Per-day',
    'dir-advance':'Move east','dir-delay':'Move west','dir-none':'No shift',
    'plan-sub':'Your personal living plan',
    'h':'h','min':'min','day-fmt':'Day %N%','arrival-day-fmt':'Day %N%',
    'wake':'Wake up, see the sun','wake-sub':'Open the curtains or step outside to wake your body.',
    'no-light':'Stay dim for now','no-light-sub':'Wear sunglasses or keep the curtains drawn until about 10 am.',
    'water':'Water and breakfast','water-sub':'A big glass of water with some protein to start the day.',
    'walk':'Take a walk','walk-sub':'Twenty to thirty minutes outside in the sun.',
    'caf-ok':'Have a coffee','caf-ok-sub':'Just this one today — enjoy it slowly.',
    'lunch':'Eat lunch','lunch-sub':'On the destination\'s local clock, so digestion catches up.',
    'nap':'Take a short nap','nap-sub':'Thirty-minute alarm, done before 3 pm.',
    'caf-stop':'Caffeine cutoff','caf-stop-sub':'No tea, cola, or coffee from now on.',
    'exercise':'Move a bit','exercise-sub':'Walk, stretch, or yoga — keep it gentle.',
    'dinner':'Eat dinner','dinner-sub':'Light meal, no alcohol tonight.',
    'dim':'Dim the lights','dim-sub':'Turn phone brightness way down, blue blockers help.',
    'warm-bath':'Take a warm shower','warm-bath-sub':'Around 40°C for about ten minutes.',
    'mel':'Take melatonin','mel-sub':'About 0.5 mg, sublingual or fast-release.',
    'bed':'Lights out','bed-sub':'Dark room, phone in another room.',
    'preflight-shift-advance':'Tonight: 1 h earlier to bed, 1 h earlier wake','preflight-shift-delay':'Tonight: 1 h later to bed, 1 h later wake',
    'flight-no-alc':'Zero alcohol on the plane · 200 ml water per hour','flight-no-alc-sub':'Alcohol wrecks REM and accelerates dehydration.',
    'flight-time':'Live on destination time on board','flight-time-sub':'Their "night" = you sleep (eye mask + earplugs); their "day" = stay awake.',
    'flight-meal':'Time your last meal to destination\'s next mealtime','flight-meal-sub':'12–16-h fast before that meal entrains the liver clock fast.',
    'result-h':'Your action plan',
    'plan-h-sleep':'Sleep Plan','plan-h-jet':'Jet Lag Plan',
    'after-arrival':'Arrival',
    'result-save':'Save','result-cal':'Add to calendar','result-share':'Copy share link','result-restart':'Start over',
    'toast-copied':'Link copied','toast-copy-fail':'Copy failed, please copy manually:',
    'pre-flight':'Pre-flight','pre-flight-sub':'Start drifting toward destination rhythm while still airborne.',
    'no-shift':'Already close to target. Run one full day of the plan tonight.',
    'aggressive':'⚡ Large shift. This 3-day plan exceeds the natural pace. Strict light & melatonin timing required.',
    'wake-bed-line':'wake %WAKE% → bed %BED%','on-target':'on target rhythm',
    'remain-advance':'Move rhythm earlier by ','remain-delay':'Move rhythm later by '
  }
};

/* ─── Base64url for compact JSON-in-hash ─── */
function b64uEnc(s){
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64uDec(s){
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return decodeURIComponent(escape(atob(s)));
}

/* ─── Time math ─── */
function modMin(x){ return ((x%1440)+1440)%1440; }
function fmt(m){
  m = modMin(m);
  return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
}
function shortestDelta(a, b){ let d = modMin(b-a); if (d>720) d -= 1440; return d; }
// 0 = top of dial, clockwise.
function minToAngle(m){ return (m / 1440) * Math.PI * 2; }
function angleToMin(a, snapMin){
  const snap = snapMin || 15;
  let aa = a;
  while (aa < 0) aa += Math.PI * 2;
  aa = aa % (Math.PI * 2);
  let m = Math.round((aa / (Math.PI * 2)) * 1440 / snap) * snap;
  return ((m % 1440) + 1440) % 1440;
}
function polar(angleRad, r){ return { x: r * Math.sin(angleRad), y: -r * Math.cos(angleRad) }; }

/* ─── Algorithm — aggressive 1-3 day reset ───
 * Natural drift ≈ 1 h/day. Light + low-dose melatonin can achieve
 * up to ~3 h/day (St Hilaire 2012, Burgess 2010). Pick the shortest
 * plan that respects the 1-3 day envelope.
 */
function computeDays(magnitudeH){
  if (magnitudeH < 1) return { days: 1, perDay: 0 };
  const dRaw = Math.ceil(magnitudeH / 3);
  const days = Math.max(1, Math.min(3, dRaw));
  return { days, perDay: magnitudeH / days };
}
function planFromShift(magnitudeH, direction, targetBedMin, targetWakeMin){
  const { days, perDay } = computeDays(magnitudeH);
  const aggressive = perDay > 2.7;
  const out = [];
  for (let i = 1; i <= days; i++){
    const remain = (days - i) * perDay;
    const offMin = remain * 60;
    let bed, wake;
    if (direction === 'advance'){ bed = modMin(targetBedMin + offMin); wake = modMin(targetWakeMin + offMin); }
    else if (direction === 'delay'){ bed = modMin(targetBedMin - offMin); wake = modMin(targetWakeMin - offMin); }
    else { bed = targetBedMin; wake = targetWakeMin; }
    out.push({ i, days, bed, wake, remain });
  }
  return { days, perDay, aggressive, plan: out };
}

/* ─── Plan-row inline SVG icons ─── */
const ICON = {
  sun:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  glass: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="14" r="3"/><circle cx="18" cy="14" r="3"/><path d="M9 14h6M2 9l3-4h4M22 9l-3-4h-4"/></svg>',
  coffee:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/></svg>',
  drop:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z"/></svg>',
  pill:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5a7 7 0 1 1 9.9-9.9l-9.9 9.9z"/><path d="M8.5 8.5l7 7"/></svg>',
  fork:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7a2 2 0 0 0 2 2h2v11M7 2v9M19 15V3a2 2 0 0 0-2 2v10h2a2 2 0 0 0 2-2"/></svg>',
  nap:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M6 12V7M18 12V7M2 18h20"/></svg>',
  bath:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6V4a2 2 0 1 1 4 0v2"/><path d="M2 12h20l-1.5 6a2 2 0 0 1-2 1.5H5.5a2 2 0 0 1-2-1.5z"/></svg>',
  run:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="m4 22 5-7 4 2 3-5 4 4"/></svg>',
  ban:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
  plane: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
  // Compact 12px icons used in the per-day "remain" badge.
  // Only the left-pointing arrow is defined — for "delay" we flip the
  // same glyph horizontally via the .flip-x CSS helper so both directions
  // share an identical visual weight.
  arrowL:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
};

/* ─── Plan action-button icons (save/cal/share/restart) ─── */
const ICON_SAVE    = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
const ICON_CAL     = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const ICON_SHARE   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const ICON_RESTART = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
