/* Field kit — one page: route picker, legs + map, scripts, notes,
   question guide, leads. All state is local to the device. */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = 'fieldkit.v3';

/* From the briefing email. Call first; never argue with a driver. */
const CONTACTS = {
  coName: 'Robin Ray',  coTel: '073 536 6082',
  bkName: 'Denis',      bkTel: 'denis@rekmatch.se'
};

/* Survey links are public "anyone with the link" forms. Personal
   phone numbers deliberately are NOT in here — they go in Setup. */
const FORMS = {
  sv: 'https://forms.cloud.microsoft/r/9hXm5kNc1F',
  en: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=OSlq7VPRkk-U-D15DZbJ-FD6XkaxkXlLv0MjADfLsEZUOFk4MUgxTk9DMjJUMUFSV1A0UjRYNVg2TS4u&origin=Invitation&channel=0'
};

const blank = () => ({
  route: 'central',             // cheapest way to buy 15 minutes
  tab:   'run',
  lang:  'en',
  theme: null,                  // null = follow the system
  cordon: true,
  legs:  {},                    // "route:n" -> {done, fare, notes}
  leads: [],
  notes: {},                    // note id -> bool
  dos:   {}, donts: {},
  cfg:   { ...CONTACTS, name:'Nam' },
  order: { cab:null, close:null }
});

let S = load();
function load(){
  try { const r = JSON.parse(localStorage.getItem(KEY)); return r ? Object.assign(blank(), r) : blank(); }
  catch { return blank(); }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); }

const route   = () => ROUTES.find(r => r.id === S.route) || ROUTES[0];
const legKey  = n => S.route + ':' + n;
const legOf   = n => S.legs[legKey(n)] ||= { done:false, fare:'', notes:'' };

function toast(m){
  const t = $('#toast'); t.textContent = m; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 1700);
}
const esc = s => (s || '').replace(/[<>&"]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;' }[c]));
function copyTxt(t, label){
  navigator.clipboard?.writeText(t).then(() => toast((label || 'Copied') + ' ✓'), () => toast('Copy failed'));
}

/* ---------- geometry, time, money ---------- */
const R = 6371, rad = d => d * Math.PI / 180;
function haversine(a, b){
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const isTrad = L => L.co !== 'Uber' && L.co !== 'Bolt';
const model  = L => isTrad(L) ? FARE.trad : FARE.app;
function est(L, kmh){
  const km = haversine(L.from, L.to) * ROAD_FACTOR, mins = km / kmh * 60, f = model(L);
  return { km, mins, kr: f.base + f.perKm * km + f.perMin * mins, f };
}

const gmapsDir = (a, b) =>
  `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}&travelmode=driving`;

/* ================= THEME ================= */
function applyTheme(){
  const sys  = matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = S.theme === null ? sys : S.theme === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  $('meta[name=theme-color]').content = dark ? '#0f1115' : '#ffffff';
  $('#btnTheme').textContent = dark ? '☾' : '☀';
  $('#btnTheme').title = S.theme === null ? 'Following your system setting' : `Forced ${S.theme}`;
  if (map) swapBasemap(dark);
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.theme === null) applyTheme(); });

/* ================= EMERGENCY CONTACT =================
   A floating call button, present on every tab. One tap dials the
   coordinator — that's the whole point, so no confirm step. */
function renderSos(){
  const { coName, coTel } = S.cfg;
  const fab = $('#fab'), tip = $('#fabTip'), nameTag = $('#fabName');
  $('#hdrForm').href = FORMS[S.lang] || FORMS.en;
  const who = coName || 'coordinator';

  if (coTel){
    fab.href = 'tel:' + coTel.replace(/\s/g,'');
    fab.classList.remove('off');
    fab.title = fab.ariaLabel = `Call ${who} — ${coTel}`;
    tip.textContent = `Call ${who}`;
    nameTag.textContent = who.split(' ')[0];
    fab.onclick = null;
  } else {
    fab.href = '#'; fab.classList.add('off');
    fab.title = fab.ariaLabel = 'Add a coordinator number in Setup';
    tip.textContent = 'Add a number in Setup';
    nameTag.textContent = 'Setup';
    fab.onclick = e => { e.preventDefault(); showTab('setup'); };
  }

  /* Greet once with the full name, then hand over to the small
     permanent label so you always know who the button dials. */
  if (!renderSos._greeted){
    renderSos._greeted = true;
    tip.hidden = false;
    setTimeout(() => tip.classList.add('on'), 400);
    setTimeout(() => tip.classList.remove('on'), 4200);
    setTimeout(() => nameTag.classList.add('on'), 4600);
  }
}

/* ================= ROUTE PICKER ================= */
/* Ray casting against the cordon ring. */
function inCordon(p){
  let c = false;
  for (let i = 0, j = CORDON.length - 1; i < CORDON.length; j = i++){
    const [yi, xi] = CORDON[i], [yj, xj] = CORDON[j];
    if (((yi > p.lat) !== (yj > p.lat)) && (p.lng < (xj - xi) * (p.lat - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
/* Every stop on one side of the line means no leg is ever charged. */
function cordonStatus(r){
  const stops = [...new Map(r.legs.flatMap(L => [[L.from.name, L.from], [L.to.name, L.to]])).values()];
  const ins = stops.filter(inCordon).length;
  if (ins === 0)            return { ok:true,  side:'outside', txt:`All ${stops.length} stops sit <b>outside</b> the congestion cordon — no leg ever crosses it, so you pay no charge.` };
  if (ins === stops.length) return { ok:true,  side:'inside',  txt:`All ${stops.length} stops sit <b>inside</b> the cordon. Driving around within the ring is free — you only pay to cross it — so no leg is ever charged.` };
  return { ok:false, side:'mixed', txt:`<b>Warning:</b> ${ins} of ${stops.length} stops are inside the cordon and the rest outside, so some legs cross it and will cost extra.` };
}

function renderRoutePick(){
  $('#routePick').innerHTML = ROUTES.map(r => {
    const done = r.legs.filter(L => (S.legs[r.id + ':' + L.n] || {}).done).length;
    return `<button class="rp ${r.id === S.route ? 'on' : ''}" onclick="pickRoute('${r.id}')">
      <b>${r.name}</b><span>${r.area}</span>
      <i>${r.kmh} km/h${done ? ` · ${done}/14 done` : ''}</i></button>`;
  }).join('');

  const r = route(), cs = cordonStatus(r);
  $('#routeInfo').innerHTML =
    `<p>${r.blurb}</p>
     <p class="cordon ${cs.ok ? 'ok' : 'bad'}">${cs.ok ? '✓' : '!'} ${cs.txt}</p>
     <p class="watch"><b>Watch out.</b> ${r.watch}</p>`;
  $('#legHint').textContent = r.area;
}
function pickRoute(id){
  S.route = id; highlight = null; save();
  renderRoutePick(); renderLegs(); drawCordon(); drawRoute(); fitAll(); paintCounters();
  toast(route().name + ' route');
}

/* ================= LEGS ================= */
function paintCounters(){
  const r = route();
  const done  = r.legs.filter(L => legOf(L.n).done).length;
  const leads = S.leads.filter(l => (l.name || l.phone).trim()).length;
  $('#pillDone').textContent  = `${done}/14`;
  $('#pillLeads').textContent = `${leads} lead${leads === 1 ? '' : 's'}`;
  $('#pillMoney').textContent = `${done * 150 + leads * 150} kr`;
  $('#barFill').style.width   = `${done / 14 * 100}%`;
}

function renderLegs(){
  const r = route();
  $('#legList').innerHTML = r.legs.map(L => {
    const st = legOf(L.n), e = est(L, r.kmh);
    const warn = e.mins < MIN_MINUTES ? ' short' : '';
    return `
<div class="lg ${st.done ? 'done' : ''}" data-n="${L.n}" id="lg${L.n}">
  <div class="lg-hd">
    <label class="tick"><input type="checkbox" ${st.done ? 'checked' : ''} onchange="toggleDone(${L.n})"><span></span></label>
    <div class="lg-mid" onclick="focusLeg(${L.n})">
      <div class="lg-rt"><b>${L.n}</b> ${esc(L.from.name)} <i>→</i> ${esc(L.to.name)}</div>
      <div class="lg-meta">
        <span class="co ${L.co === 'Uber' ? 'uber' : L.co === 'Bolt' ? 'bolt' : 'trad'}">${L.co}</span>
        <span class="mins${warn}">${Math.round(e.mins)} min</span>
        <span>${Math.round(e.kr)} kr</span>
        <span class="dim">${e.km.toFixed(1)} km</span>
      </div>
    </div>
    <button class="expand" onclick="this.closest('.lg').classList.toggle('open')">▾</button>
  </div>
  <div class="lg-body">
    <div class="cp"><span class="cplbl">Pick up</span>
      <button onclick="copyTxt('${esc(L.from.name).replace(/'/g,"\\'")}','Pickup copied')">${esc(L.from.name)} ⧉</button>
      <span class="hint">${esc(L.from.hint)}</span></div>
    <div class="cp"><span class="cplbl">Drop off</span>
      <button onclick="copyTxt('${esc(L.to.name).replace(/'/g,"\\'")}','Drop-off copied')">${esc(L.to.name)} ⧉</button>
      <span class="hint">${esc(L.to.hint)}</span></div>
    <div class="acts2">
      <a class="go" href="${gmapsDir(L.from, L.to)}" target="_blank" rel="noopener">See it on Google Maps</a>
      <a href="${FORMS[S.lang] || FORMS.en}" target="_blank" rel="noopener">Open the form</a>
    </div>
    ${L.note ? `<div class="notebox">${esc(L.note)}</div>` : ''}
    <div class="grid2">
      <label>Fare paid (kr)<input type="number" inputmode="numeric" value="${esc(st.fare)}" oninput="setLeg(${L.n},'fare',this.value)"></label>
      <label>Notes<input value="${esc(st.notes)}" placeholder="a gripe, a quote" oninput="setLeg(${L.n},'notes',this.value)"></label>
    </div>
  </div>
</div>`;
  }).join('');
}

function setLeg(n, k, v){ legOf(n)[k] = v; save(); }
function toggleDone(n){
  const st = legOf(n); st.done = !st.done; save();
  $('#lg' + n).classList.toggle('done', st.done);
  paintCounters(); renderRoutePick(); drawRoute();
}
function focusLeg(n){
  initMap();
  const lg = route().legs.find(l => l.n === n);
  highlight = n; drawRoute();
  map.flyToBounds(L.latLngBounds([[lg.from.lat, lg.from.lng], [lg.to.lat, lg.to.lng]]).pad(0.35),
                  { duration:.6 });
  $('#map').scrollIntoView({ behavior:'smooth', block:'nearest' });
  toast(`Leg ${n} pinned on the map`);
}

/* ================= MAP ================= */
let map, meMarker, meCircle, watchId = null, legLayer, cordonLayer, tiles, highlight = null;
const TILE = d => d
  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

function isDark(){ return document.documentElement.getAttribute('data-theme') === 'dark'; }
function swapBasemap(dark){ if (tiles) tiles.setUrl(TILE(dark)); }

function initMap(){
  if (map) { map.invalidateSize(); return; }
  map = L.map('map', { zoomControl:false }).setView([59.32, 18.05], 12);
  /* bottom-LEFT: the floating call button owns the bottom-right corner */
  L.control.zoom({ position:'bottomleft' }).addTo(map);
  tiles = L.tileLayer(TILE(isDark()), { attribution:'© OpenStreetMap, © CARTO', maxZoom:19 }).addTo(map);
  cordonLayer = L.layerGroup().addTo(map);
  legLayer = L.layerGroup().addTo(map);
  addFitCtl();
  drawCordon(); drawRoute(); fitAll();
}

/* The congestion-charge ring, so it's obvious at a glance that no leg
   crosses it. Drawn under the route, never interactive on the fill. */
function drawCordon(){
  if (!map) return;
  cordonLayer.clearLayers();
  $('#btnCordon').classList.toggle('ghost', !S.cordon);
  if (!S.cordon) return;

  const cs = cordonStatus(route());
  L.polygon(CORDON, {
    color:'#e11d48', weight:2, opacity:.85, dashArray:'7 5',
    fillColor:'#e11d48', fillOpacity: cs.side === 'inside' ? .07 : .04,
    interactive:false
  }).addTo(cordonLayer);

  /* A label anchored on the ring itself, not floating in the middle,
     so it never sits on top of a leg line. */
  L.marker([CORDON[0][0], CORDON[0][1]], {
    interactive:false,
    icon: L.divIcon({ className:'', iconSize:[200,22], iconAnchor:[100,11],
      html:`<div class="cordonwrap"><span class="cordonlbl">congestion cordon</span></div>` })
  }).addTo(cordonLayer);
}

const ptKey  = p => p.lat.toFixed(4) + ',' + p.lng.toFixed(4);
const colour = L2 => L2.co === 'Uber' ? '#0284c7' : L2.co === 'Bolt' ? '#16a34a' : '#d97706';

function pinIcon(txt, c){
  return L.divIcon({ className:'', iconSize:[24,24], iconAnchor:[12,12],
    html:`<div class="mrk" style="background:${c}">${txt}</div>` });
}
function arrowIcon(deg, c, big){
  const s = big ? 20 : 15;
  return L.divIcon({ className:'', iconSize:[s,s], iconAnchor:[s/2,s/2],
    html:`<svg width="${s}" height="${s}" viewBox="0 0 18 18" style="transform:rotate(${deg}deg)">
            <path d="M3 3.5 L14.5 9 L3 14.5 Z" fill="${c}" stroke="${isDark()?'#0f1115':'#fff'}" stroke-width="1.6" stroke-linejoin="round"/>
          </svg>` });
}

/* Several legs can start at the same place. Stacked markers hide each
   other, so fan them out and run the lines to the fanned positions. */
function fanOut(specs){
  const pos = {}, groups = {};
  specs.forEach(s => (groups[ptKey(s.pt)] ||= []).push(s));
  Object.values(groups).forEach(arr => {
    if (arr.length === 1){ pos[arr[0].id] = [arr[0].pt.lat, arr[0].pt.lng]; return; }
    const r = 0.20;
    arr.forEach((s, i) => {
      const a = (i * 360 / arr.length - 90) * Math.PI / 180;
      pos[s.id] = [ s.pt.lat + (r * Math.sin(a)) / 111.2,
                    s.pt.lng + (r * Math.cos(a)) / (111.32 * Math.cos(rad(s.pt.lat))) ];
    });
    const home = [arr[0].pt.lat, arr[0].pt.lng];
    arr.forEach(s => L.polyline([home, pos[s.id]],
      { color:'#94a3b8', weight:1.5, opacity:.8, dashArray:'2 4' }).addTo(legLayer));
    L.circleMarker(home, { radius:4, color:isDark()?'#0f1115':'#fff', weight:1.5, fillColor:'#64748b', fillOpacity:1 })
      .addTo(legLayer)
      .bindPopup(`<b>${arr[0].pt.name}</b><br>One place, used more than once — legs
                  ${arr.map(s => s.label).join(', ')} all start here.<br>
                  <small>Markers pulled apart so you can tell the lines apart. The grey dot is the real spot.</small>`);
  });
  return pos;
}

function drawRoute(){
  if (!map) return;
  legLayer.clearLayers();
  const r = route();
  const specs = r.legs.map(L2 => ({ id:'L'+L2.n, label:String(L2.n), pt:L2.from }));
  const finish = r.legs[r.legs.length - 1].to;
  specs.push({ id:'FIN', label:'★', pt:finish });
  const pos = fanOut(specs);

  r.legs.forEach(L2 => {
    const done = legOf(L2.n).done, hot = L2.n === highlight, c = colour(L2);
    const from = pos['L'+L2.n], to = L2.n < r.legs.length ? pos['L'+(L2.n+1)] : pos['FIN'];
    const op = done ? .25 : (hot ? 1 : .65);
    const e = est(L2, r.kmh);

    L.polyline([from, to], { color:c, weight: hot ? 6 : 3, opacity:op,
      dashArray: hot ? null : '1 7', lineCap:'round' })
      .addTo(legLayer)
      .bindPopup(`<b>Leg ${L2.n} · ${L2.co}</b><br>${L2.from.name} → ${L2.to.name}<br>
                  <small>${Math.round(e.mins)} min · ${Math.round(e.kr)} kr</small>`);

    const t = .62, dx = (to[1]-from[1]) * Math.cos(rad(from[0])), dy = to[0]-from[0];
    L.marker([from[0] + dy*t, from[1] + (to[1]-from[1])*t],
      { icon: arrowIcon(Math.atan2(-dy, dx) * 180/Math.PI, c, hot), opacity:op, interactive:false })
      .addTo(legLayer);

    L.marker(from, { icon: pinIcon(done ? '✓' : L2.n, done ? '#94a3b8' : c) })
      .addTo(legLayer)
      .bindPopup(`<b>Leg ${L2.n} starts here</b><br>${L2.from.name}<br><small>${L2.from.hint}</small>
                  <br>→ drops at <b>${L2.to.name}</b>`);
  });

  L.marker(pos['FIN'], { icon: pinIcon('★', '#0d9488') })
    .addTo(legLayer).bindPopup(`<b>Finish</b><br>${finish.name}`);
}

/* Everything that should be on screen when you're "seeing the whole
   route" — the legs, plus the cordon ring when it's showing. */
function routeBounds(){
  const pts = route().legs.flatMap(L2 => [[L2.from.lat, L2.from.lng], [L2.to.lat, L2.to.lng]]);
  if (S.cordon) pts.push(...CORDON);
  return L.latLngBounds(pts);
}
function fitAll(animate){
  if (!map) return;
  const b = routeBounds().pad(0.08);
  animate ? map.flyToBounds(b, { duration:.6 }) : map.fitBounds(b);
  updateFitCtl();
}

/* A floating "zoom back out" control, top-right of the map. It only
   appears once you've zoomed in far enough that the whole route no
   longer fits — otherwise it would be a button that does nothing. */
let fitCtl;
function addFitCtl(){
  const Ctl = L.Control.extend({
    options: { position:'topright' },
    onAdd(){
      const a = L.DomUtil.create('a', 'fitctl hide');
      a.href = '#';
      a.title = a.ariaLabel = 'Zoom out to the whole route';
      a.innerHTML = `<svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true">
        <path d="M3 7.5V3h4.5M16.5 7.5V3H12M3 12.5V17h4.5M16.5 12.5V17H12"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      L.DomEvent.on(a, 'click', L.DomEvent.stop);
      L.DomEvent.on(a, 'click', () => {
        const was = highlight;
        highlight = null; drawRoute(); fitAll(true);
        toast(was ? `Leg ${was} unpinned — showing all 14` : 'Showing all 14 legs');
      });
      this._el = a;
      return a;
    }
  });
  fitCtl = new Ctl();
  map.addControl(fitCtl);
  /* resize matters: the map is in a hidden tab at boot, so its size
     settles after the first fit and the bounds change underneath us. */
  map.on('moveend zoomend resize', updateFitCtl);
}
function updateFitCtl(){
  if (!fitCtl || !fitCtl._el) return;
  fitCtl._el.classList.toggle('hide', map.getBounds().contains(routeBounds()));
}

function renderLegend(){
  $('#mapLegend').innerHTML = `
    <div class="lgd">
      <span><i class="sw" style="background:#0284c7"></i>Uber</span>
      <span><i class="sw" style="background:#16a34a"></i>Bolt</span>
      <span><i class="sw" style="background:#d97706"></i>Taxi Stockholm · Kurir · Sverigetaxi</span>
      <span><i class="sw" style="background:#94a3b8"></i>done</span>
      <span><i class="sw" style="background:#0d9488"></i>finish</span>
    </div>
    <p><b>A numbered pin is where that leg starts</b>, so leg 1's line ends on pin 2, leg 2's on pin 3, and so on. The arrow points at the drop-off.</p>
    <p><b>Pins joined to a grey dot</b> are one place used more than once — pulled apart so you can tell the lines apart.</p>`;
}

function startTracking(){
  if (!navigator.geolocation) return toast('No geolocation here');
  if (watchId !== null){
    navigator.geolocation.clearWatch(watchId); watchId = null;
    $('#btnLocate').textContent = 'Track me'; $('#btnLocate').classList.add('ghost');
    $('#mapInfo').textContent = ''; return;
  }
  initMap();
  $('#btnLocate').textContent = 'Tracking…'; $('#btnLocate').classList.remove('ghost');
  watchId = navigator.geolocation.watchPosition(pos => {
    const { latitude:lat, longitude:lng, accuracy } = pos.coords;
    if (!meMarker){
      meMarker = L.circleMarker([lat,lng], { radius:7, color:'#fff', weight:2.5, fillColor:'#0d9488', fillOpacity:1 }).addTo(map);
      meCircle = L.circle([lat,lng], { radius:accuracy, color:'#0d9488', weight:1, fillOpacity:.08 }).addTo(map);
      map.setView([lat,lng], 14);
    } else { meMarker.setLatLng([lat,lng]); meCircle.setLatLng([lat,lng]).setRadius(accuracy); }

    const r = route(), next = r.legs.find(L2 => !legOf(L2.n).done);
    if (!next){ $('#mapInfo').textContent = 'All 14 done.'; return; }
    const d = haversine({lat,lng}, next.from);
    $('#mapInfo').innerHTML = `Leg <b>${next.n}</b> starts at <b>${next.from.name}</b> —
      ${d < 1 ? Math.round(d*1000)+' m' : d.toFixed(1)+' km'} away
      <span class="small">(~${Math.max(1, Math.round(d*1000/80))} min walk)</span>`;
  }, () => {
    toast('Location denied'); $('#btnLocate').textContent = 'Track me';
    $('#btnLocate').classList.add('ghost'); watchId = null;
  }, { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
}

/* ================= SCRIPT ================= */
/* Scripts carry {name} tokens filled from Setup, so changing your name
   there updates every line immediately. */
const fill = t => (t || '').replace(/\{name\}/g, S.cfg.name.trim() || '[your name]');

function cardHTML(c, movable, group, i, len){
  const body = fill((S.lang === 'sv' ? c.sv : c.en) || c.en);
  return `
<div class="sc">
  <div class="sc-top">
    <span class="sc-tag ${/NO|PUSHBACK|SKIP/.test(c.tag) ? 'warn' : ''}">${c.tag}</span>
    <span class="sc-ttl">${c.title}</span>
    ${movable ? `<button class="mv" ${i===0?'disabled':''} onclick="mv('${group}','${c.id}',-1)">↑</button>
                 <button class="mv" ${i===len-1?'disabled':''} onclick="mv('${group}','${c.id}',1)">↓</button>` : ''}
  </div>
  ${c.tone ? `<p class="sc-tone">${c.tone}</p>` : ''}
  <div class="sc-big">${esc(body)}</div>
  <p class="sc-why"><b>Why:</b> ${c.why}</p>
</div>`;
}
function ordered(list, group){
  const ord = S.order[group];
  if (!ord) return list;
  const by = Object.fromEntries(list.map(c => [c.id, c]));
  const out = ord.map(id => by[id]).filter(Boolean);
  list.forEach(c => { if (!out.includes(c)) out.push(c); });
  return out;
}
function renderScripts(){
  $('#scPre').innerHTML = SCRIPT_PRE.map(c => cardHTML(c, false)).join('');
  const cab = ordered(SCRIPT_CAB, 'cab'), cl = ordered(SCRIPT_CLOSE, 'close');
  $('#scCab').innerHTML   = cab.map((c,i) => cardHTML(c, true, 'cab',   i, cab.length)).join('');
  $('#scClose').innerHTML = cl .map((c,i) => cardHTML(c, true, 'close', i, cl.length)).join('');
  $$('#langSeg button').forEach(b => b.classList.toggle('on', b.dataset.lang === S.lang));
  $('#svWarn').hidden = S.lang !== 'sv';
}
function mv(group, id, dir){
  const src = group === 'cab' ? SCRIPT_CAB : SCRIPT_CLOSE;
  const cur = ordered(src, group).map(c => c.id);
  const i = cur.indexOf(id), j = i + dir;
  if (j < 0 || j >= cur.length) return;
  [cur[i], cur[j]] = [cur[j], cur[i]];
  S.order[group] = cur; save(); renderScripts();
}

/* ================= NOTES + DO'S / DON'TS ================= */
function renderNotes(){
  $('#noteList').innerHTML = NOTES.map(n => `
    <div class="note ${S.notes[n.id] ? 'read' : ''}">
      <label class="tick"><input type="checkbox" ${S.notes[n.id] ? 'checked' : ''}
        onchange="S.notes['${n.id}']=this.checked;save();this.closest('.note').classList.toggle('read',this.checked)"><span></span></label>
      <div><h3>${n.h}</h3><div class="bd">${n.b}</div></div>
    </div>`).join('');

  const list = (arr, store, cls) => arr.map((t, i) => `
    <label class="ddi ${S[store][i] ? 'read' : ''}">
      <span class="tick"><input type="checkbox" ${S[store][i] ? 'checked' : ''}
        onchange="S.${store}[${i}]=this.checked;save();this.closest('.ddi').classList.toggle('read',this.checked)"><span></span></span>
      <span class="${cls}">${t}</span></label>`).join('');
  $('#dosList').innerHTML   = list(DOS,   'dos',   'ddtx');
  $('#dontsList').innerHTML = list(DONTS, 'donts', 'ddtx');
}

/* ================= QUESTION GUIDE ================= */
function renderQ(){
  $('#qGuide').innerHTML = QGUIDE.map(g => `
    <div class="qsec">
      <h3>${g.sec}</h3>
      ${g.intro ? `<p class="qintro">${g.intro}</p>` : ''}
      ${g.items.map(it => `
        <div class="qi">
          <div class="qn">${it.n}</div>
          <div>
            <div class="qq">${it.q}</div>
            <div class="qa">${it.a}</div>
            ${it.probe && it.probe !== '—' ? `<div class="qp"><b>Go further:</b> ${it.probe}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`).join('');
}

/* ================= LEADS ================= */
const leadFilled = l => !!(l.name || l.phone || l.co || l.note);
function ensureBlankLead(){
  if (!S.leads.length || leadFilled(S.leads[S.leads.length - 1]))
    S.leads.push({ name:'', phone:'', co:'', ride:'', note:'', open:true });
}
function renderLeads(){
  ensureBlankLead();
  $('#leadList').innerHTML = S.leads.map((l, i) => {
    const filled = leadFilled(l);
    const title = filled ? `${esc(l.name || '(no name)')} — ${esc(l.phone || 'no contact')}` : 'New lead';
    return `
<div class="lead ${l.open ? 'open' : ''} ${filled ? 'filled' : ''}">
  <div class="lead-hd" onclick="toggleLead(${i})">
    <span class="lead-n">${i + 1}</span>
    <span class="lead-t">${title}</span>
    <span class="chev">▾</span>
  </div>
  <div class="lead-bd">
    <div class="grid2">
      <label>First name<input value="${esc(l.name)}" oninput="setLead(${i},'name',this.value)"></label>
      <label>Phone or email<input value="${esc(l.phone)}" inputmode="tel" oninput="setLead(${i},'phone',this.value)"></label>
    </div>
    <div class="grid2">
      <label>Drives for<input value="${esc(l.co)}" placeholder="Uber / Bolt / Taxi Sthlm…" oninput="setLead(${i},'co',this.value)"></label>
      <label>Which ride<input value="${esc(l.ride)}" placeholder="leg number" oninput="setLead(${i},'ride',this.value)"></label>
    </div>
    <label>Note<input value="${esc(l.note)}" placeholder="what they cared about" oninput="setLead(${i},'note',this.value)"></label>
    <button class="btn danger wide" onclick="delLead(${i})">Delete this lead</button>
  </div>
</div>`;
  }).join('');
}
function setLead(i, k, v){
  S.leads[i][k] = v;
  const wasLast = i === S.leads.length - 1;
  save(); paintCounters();
  if (wasLast && leadFilled(S.leads[i])){ ensureBlankLead(); renderLeads(); }
}
function toggleLead(i){ S.leads[i].open = !S.leads[i].open; save(); renderLeads(); }
function delLead(i){ S.leads.splice(i, 1); save(); renderLeads(); paintCounters(); }
function copyLeads(){
  const f = S.leads.filter(leadFilled);
  if (!f.length) return toast('No leads yet');
  copyTxt(`${f.length} drivers agreed to share contact details:\n\n` +
    f.map((l, i) => `${i+1}. ${l.name || '(no name)'} — ${l.phone} — drives for ${l.co || 'n/a'}${l.ride ? ` (ride ${l.ride})` : ''}`).join('\n'),
    'Leads copied');
}

/* ================= SETUP ================= */
function renderSetup(){
  $('#cfgCoName').value = S.cfg.coName; $('#cfgCoTel').value = S.cfg.coTel;
  $('#cfgBkName').value = S.cfg.bkName; $('#cfgBkTel').value = S.cfg.bkTel;
  $('#cfgName').value   = S.cfg.name;
  $('#lnkSv').href = FORMS.sv; $('#lnkEn').href = FORMS.en;
}
function saveCfg(){
  S.cfg = { coName:$('#cfgCoName').value.trim(), coTel:$('#cfgCoTel').value.trim(),
            bkName:$('#cfgBkName').value.trim(), bkTel:$('#cfgBkTel').value.trim(),
            name:$('#cfgName').value.trim() };
  save(); renderSos(); renderScripts();   // the script uses {name} live
  toast('Saved to this phone');
}
function exportAll(){
  const b = new Blob([JSON.stringify(S, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = 'fieldkit-backup.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importAll(file){
  const r = new FileReader();
  r.onload = () => { try { S = Object.assign(blank(), JSON.parse(r.result)); save(); renderAll(); toast('Imported'); }
                     catch { toast('That file did not parse'); } };
  r.readAsText(file);
}
function wipe(){
  if (!confirm('Erase every ride, lead and setting stored on this phone?')) return;
  localStorage.removeItem(KEY); S = blank(); renderAll(); toast('Erased');
}

/* ================= TABS ================= */
const TABS = ['run','script','notes','q','leads','setup'];
function showTab(name){
  S.tab = name; save();
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
  TABS.forEach(t => $('#tab-' + t).hidden = t !== name);
  window.scrollTo({ top:0 });
  if (name === 'run'){
    initMap();
    setTimeout(() => { map.invalidateSize(); fitAll(); }, 60);
  }
}

/* ================= BOOT ================= */
function renderAll(){
  applyTheme(); renderSos(); renderRoutePick(); renderLegs(); renderScripts();
  renderNotes(); renderQ(); renderLeads(); renderSetup(); renderLegend(); paintCounters();
  if (map) { drawCordon(); drawRoute(); fitAll(); }
}

function boot(){
  $$('.tabs button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
  $('#btnCordon').onclick = () => {
    S.cordon = !S.cordon; save(); initMap(); drawCordon(); updateFitCtl();
    toast(S.cordon ? 'Cordon shown' : 'Cordon hidden');
  };
  $('#btnTheme').onclick = () => {
    const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
    S.theme = S.theme === null ? (sysDark ? 'light' : 'dark') : (S.theme === 'dark' ? 'light' : 'dark');
    save(); applyTheme(); drawRoute();
  };
  $('#btnLocate').onclick = startTracking;
  $('#btnBig').onclick = () => {
    document.body.classList.toggle('big');
    $('#btnBig').textContent = document.body.classList.contains('big') ? 'Normal text' : 'Bigger text';
  };
  $$('#langSeg button').forEach(b => b.onclick = () => {
    S.lang = b.dataset.lang; save(); renderScripts(); renderLegs(); renderSos();
  });
  $('#btnResetOrder').onclick = () => { S.order = { cab:null, close:null }; save(); renderScripts(); toast('Order reset'); };
  $('#btnSaveCfg').onclick = saveCfg;
  $('#btnCopyLeads').onclick = copyLeads;
  $('#btnExport').onclick = exportAll;
  $('#btnWipe').onclick = wipe;
  $('#fileImport').onchange = e => e.target.files[0] && importAll(e.target.files[0]);

  renderAll();
  showTab(TABS.includes(S.tab) ? S.tab : 'run');
}
boot();
