/* Field kit — state, route rendering, live map, script cards, log. */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = 'fieldkit.v1';

/* ---------------- state ---------------- */
const blank = () => ({
  legs: {},          // n -> {done, backup, fare, name, phone, worksFor, notes}
  cfg:  { sv:'', en:'', tel:'', name:'' },
  order:{ cab:null, close:null }
});
let S = load();

function load(){
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return raw ? Object.assign(blank(), raw) : blank();
  } catch { return blank(); }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); paintCounters(); }
function leg(n){ return S.legs[n] ||= { done:false, backup:'', fare:'', name:'', phone:'', worksFor:'', notes:'' }; }

function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 1700);
}

/* ---------------- geometry & money ---------------- */
const R = 6371;
const rad = d => d * Math.PI / 180;
function haversine(a, b){
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const roadKm = (a, b) => haversine(a, b) * ROAD_FACTOR;
const minsFor = km => km / AVG_KMH * 60;

function isTrad(L){ return L.co !== 'Uber' && L.co !== 'Bolt'; }
function model(L){ return isTrad(L) ? FARE.trad : FARE.app; }
function estFare(L, from, to){
  const km = roadKm(from, to), m = minsFor(km), f = model(L);
  return { km, mins: m, kr: f.base + f.perKm * km + f.perMin * m };
}

/* ---------------- links ---------------- */
const gmapsDir = (a, b) =>
  `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}&travelmode=driving`;
const gmapsPin = p =>
  `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;

/* ================================================================
   RUN TAB
   ================================================================ */
function nextLegN(){
  const L = LEGS.find(l => !leg(l.n).done);
  return L ? L.n : null;
}

function paintCounters(){
  const done  = LEGS.filter(l => leg(l.n).done).length;
  const leads = LEGS.filter(l => leg(l.n).phone.trim() || leg(l.n).name.trim()).length;
  $('#pillDone').textContent  = `${done}/14`;
  $('#pillLeads').textContent = `${leads} lead${leads === 1 ? '' : 's'}`;
  $('#pillMoney').textContent = `${done * 150 + leads * 150} kr`;
  $('#barFill').style.width   = `${done / 14 * 100}%`;
  paintNextUp();
}

function paintNextUp(){
  const n = nextLegN(), box = $('#nextUp');
  if (n === null){
    box.innerHTML = `<div class="lbl">Finished</div>
      <div class="rt">All 14 done.</div>
      <div class="sub">Copy the leads from the Log tab and email them over. Everything is due Wednesday 09:00.</div>`;
    return;
  }
  const L = LEGS.find(l => l.n === n);
  const e = estFare(L, L.pickup, L.drop), f = model(L);
  box.innerHTML = `
    <div class="lbl">Next up · leg ${L.n} of 14 · ${L.co}</div>
    <div class="rt">${L.pickup.name} → ${L.drop.name}</div>
    <div class="sub">≈ ${e.km.toFixed(1)} km · ≈ ${Math.round(e.mins)} min · accept ${f.lo}–${f.hi} kr</div>
    <div class="acts">
      <a href="${gmapsPin(L.pickup)}" target="_blank" rel="noopener">Pickup pin</a>
      <button onclick="copyTxt('${L.pickup.name.replace(/'/g,"\\'")}')">Copy pickup</button>
      <button onclick="jumpTo(${L.n})">Open leg</button>
    </div>`;
}

function copyTxt(t){
  navigator.clipboard?.writeText(t).then(() => toast('Copied'), () => toast('Copy failed'));
}
function jumpTo(n){
  showTab('run');
  const el = $(`#leg${n}`);
  el.classList.add('open');
  el.scrollIntoView({ behavior:'smooth', block:'center' });
}

function renderLegs(){
  $('#legList').innerHTML = LEGS.map(L => {
    const st = leg(L.n), f = model(L);
    const e  = estFare(L, L.pickup, L.drop);
    const b1 = estFare(L, L.altPickup, L.drop);
    const b2 = estFare(L, L.pickup, L.altDrop);
    const q  = s => (s || '').replace(/"/g, '&quot;');
    return `
<div class="card leg ${isTrad(L) ? 'trad' : ''} ${st.done ? 'done' : ''}" data-co="${L.co}" id="leg${L.n}">
  <div class="leghd" onclick="this.parentNode.classList.toggle('open')">
    <div class="legno">${st.done ? '✓' : L.n}</div>
    <div class="legmid">
      <div class="legrt">${L.pickup.name} → ${L.drop.name}</div>
      <div class="legmeta"><b>${L.co}</b> · ≈${e.km.toFixed(1)} km · ≈${Math.round(e.mins)} min · ${f.lo}–${f.hi} kr</div>
    </div>
    <div class="chev">▶</div>
  </div>

  <div class="legbody">
    <div class="stop">
      <div class="ico">◉</div>
      <div><div class="nm">Pick up · ${L.pickup.name}</div>
        <div class="hn">${L.pickup.hint}</div>
        <a href="${gmapsPin(L.pickup)}" target="_blank" rel="noopener">Open pin</a></div>
    </div>
    <div class="stop">
      <div class="ico">▾</div>
      <div><div class="nm">Drop off · ${L.drop.name}</div>
        <div class="hn">${L.drop.hint}</div>
        <a href="${gmapsDir(L.pickup, L.drop)}" target="_blank" rel="noopener">Preview the route</a></div>
    </div>

    <div class="band">
      <div><span>Target</span><b>${f.target} kr</b></div>
      <div><span>Accept</span><b>${f.lo}–${f.hi}</b></div>
      <div><span>Est.</span><b>${Math.round(e.kr)} kr</b></div>
    </div>

    <div class="bk">
      <h4>If the quote is out of band</h4>
      <p><b>B1 · move the pickup.</b> Walk to <b>${L.altPickup.name}</b> (${L.altPickup.hint}) — same drop-off, so nothing downstream changes. ≈${b1.km.toFixed(1)} km, ≈${Math.round(b1.kr)} kr ${swing(b1.kr, e.kr)}.</p>
      <p><b>B2 · move the drop.</b> Finish at <b>${L.altDrop.name}</b> instead. ≈${b2.km.toFixed(1)} km, ≈${Math.round(b2.kr)} kr ${swing(b2.kr, e.kr)}. ${nextConverge(L.n)}</p>
      <p><b>B3 · wait 8–10 min</b>, or swap this leg's operator with the next one and swap back later.</p>
    </div>

    <div class="notebox">${L.note}</div>

    <div class="acts2">
      <a class="go" href="${gmapsPin(L.pickup)}" target="_blank" rel="noopener">Pickup pin</a>
      <button onclick="openForm()">Open the form</button>
      <button onclick="toggleDone(${L.n})" class="${st.done ? 'undo' : ''}">${st.done ? 'Undo done' : 'Mark done'}</button>
    </div>

    <div class="grid2">
      <label>Fare paid (kr)<input type="number" inputmode="numeric" value="${q(st.fare)}" oninput="setF(${L.n},'fare',this.value)"></label>
      <label>Backup used<select onchange="setF(${L.n},'backup',this.value)">
        <option value=""${st.backup===''?' selected':''}>none</option>
        <option value="B1"${st.backup==='B1'?' selected':''}>B1 pickup</option>
        <option value="B2"${st.backup==='B2'?' selected':''}>B2 drop</option>
        <option value="B3"${st.backup==='B3'?' selected':''}>B3 wait/swap</option>
        <option value="cancel"${st.backup==='cancel'?' selected':''}>cancelled — declined</option>
      </select></label>
    </div>
    <div class="grid2">
      <label>Driver first name<input value="${q(st.name)}" oninput="setF(${L.n},'name',this.value)"></label>
      <label>Phone / email<input value="${q(st.phone)}" oninput="setF(${L.n},'phone',this.value)"></label>
    </div>
    <label>Drives for<input value="${q(st.worksFor)}" placeholder="Uber / Bolt / Taxi Sthlm / own permit…" oninput="setF(${L.n},'worksFor',this.value)"></label>
    <label>Anything worth remembering<textarea oninput="setF(${L.n},'notes',this.value)" placeholder="a gripe, a good quote, whether they seemed keen">${q(st.notes)}</textarea></label>
  </div>
</div>`;
  }).join('');
}

/* A backup is only useful if you know which direction it moves the
   fare. Some alternates are further away than the primary. */
function swing(alt, main){
  const d = Math.round(alt - main);
  if (Math.abs(d) < 8) return '<i style="color:var(--dim)">(about the same)</i>';
  return d < 0
    ? `<i style="color:var(--ok)">(${d} kr — cheaper)</i>`
    : `<i style="color:var(--warn)">(+${d} kr — dearer, use this to stretch a short ride)</i>`;
}

/* Explains the convergence so it's obvious the backup is safe. */
function nextConverge(n){
  const cur = LEGS.find(l => l.n === n), nxt = LEGS.find(l => l.n === n + 1);
  if (!nxt) return 'Last leg — nothing downstream.';
  if (nxt.altPickup.name === cur.altDrop.name)
    return `Leg ${nxt.n} already lists that as its backup pickup, so you re-converge straight away.`;
  return `Leg ${nxt.n} then starts from there instead of ${nxt.pickup.name} — about the same distance.`;
}

function setF(n, k, v){ leg(n)[k] = v; save(); }
function toggleDone(n){
  const st = leg(n); st.done = !st.done; save();
  renderLegs(); paintCounters();
  toast(st.done ? `Leg ${n} done` : `Leg ${n} reopened`);
}
function openForm(){
  const u = S.cfg.sv || S.cfg.en;
  if (!u) { showTab('log'); toast('Paste the survey links first'); return; }
  window.open(u, '_blank', 'noopener');
}

/* ================================================================
   MAP
   ================================================================ */
let map, meMarker, meCircle, watchId = null, legLayer, showBackups = false;

function initMap(){
  if (map) { map.invalidateSize(); return; }
  map = L.map('map', { zoomControl:false }).setView([59.293, 18.02], 12);
  L.control.zoom({ position:'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:'© OpenStreetMap, © CARTO', maxZoom:19
  }).addTo(map);
  legLayer = L.layerGroup().addTo(map);
  drawRoute();
  fitAll();
}

function pinIcon(txt, colour){
  return L.divIcon({
    className:'', iconSize:[24,24], iconAnchor:[12,12],
    html:`<div class="mrk" style="background:${colour}">${txt}</div>`
  });
}

const ptKey = p => p.lat.toFixed(4) + ',' + p.lng.toFixed(4);
const legColour = lg => lg.co === 'Uber' ? '#0284c7' : lg.co === 'Bolt' ? '#16a34a' : '#d97706';

/* An arrowhead partway along a leg, rotated to the direction of
   travel. Without this you cannot tell which end of a line is the
   pickup — especially where several lines meet at one point. */
function arrowIcon(deg, colour, big){
  const s = big ? 20 : 15;
  return L.divIcon({
    className: '', iconSize: [s, s], iconAnchor: [s/2, s/2],
    html: `<svg width="${s}" height="${s}" viewBox="0 0 18 18" style="transform:rotate(${deg}deg)">
             <path d="M3 3.5 L14.5 9 L3 14.5 Z" fill="${colour}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
           </svg>`
  });
}

/* Several legs can start at the same place (Bandhagen serves legs 2
   and 8; Gröndal is both leg 9's pickup and the finish). Stacked
   markers hide each other, so fan them out around the true point and
   run the leg lines to the fanned positions. */
function fanOut(specs){
  const pos = {}, groups = {};
  specs.forEach(s => (groups[ptKey(s.pt)] ||= []).push(s));

  Object.values(groups).forEach(arr => {
    if (arr.length === 1){ pos[arr[0].id] = [arr[0].pt.lat, arr[0].pt.lng]; return; }

    const r = 0.19;                                  // km from the true point
    arr.forEach((s, i) => {
      const a = (i * 360 / arr.length - 90) * Math.PI / 180;
      pos[s.id] = [
        s.pt.lat + (r * Math.sin(a)) / 111.2,
        s.pt.lng + (r * Math.cos(a)) / (111.32 * Math.cos(rad(s.pt.lat)))
      ];
    });

    const home = [arr[0].pt.lat, arr[0].pt.lng];
    const names = arr.map(s => s.label === '★' ? 'the finish' : 'leg ' + s.label);
    arr.forEach(s => L.polyline([home, pos[s.id]], {
      color: '#94a3b8', weight: 1.5, opacity: .8, dashArray: '2 4'
    }).addTo(legLayer));
    L.circleMarker(home, { radius: 4, color: '#fff', weight: 1.5, fillColor: '#64748b', fillOpacity: 1 })
      .addTo(legLayer)
      .bindPopup(`<b>${arr[0].pt.name}</b><br>One place, used twice — ${names.join(' and ')} both start here.<br>
                  <small>The two markers are pulled apart so you can see which line is which; the real spot is this grey dot.</small>`);
  });
  return pos;
}

function drawRoute(){
  legLayer.clearLayers();
  const nx = nextLegN();

  const specs = LEGS.map(lg => ({ id: 'L' + lg.n, label: String(lg.n), pt: lg.pickup }));
  const finish = LEGS[LEGS.length - 1].drop;
  specs.push({ id: 'FIN', label: '★', pt: finish });
  const pos   = fanOut(specs);
  const endOf = lg => lg.n < LEGS.length ? pos['L' + (lg.n + 1)] : pos['FIN'];
  const seen = {}, dupes = new Set();
  LEGS.forEach(lg => {
    const k = ptKey(lg.pickup);
    if (seen[k] !== undefined){ dupes.add(lg.n); dupes.add(seen[k]); } else seen[k] = lg.n;
  });

  LEGS.forEach(lg => {
    const done = leg(lg.n).done, isNext = lg.n === nx, c = legColour(lg);
    const from = pos['L' + lg.n], to = endOf(lg);
    const op   = done ? .25 : (isNext ? 1 : .6);

    L.polyline([from, to], {
      color: c, weight: isNext ? 5 : 3, opacity: op,
      dashArray: isNext ? null : '1 7', lineCap: 'round'
    }).addTo(legLayer)
      .bindPopup(`<b>Leg ${lg.n} · ${lg.co}</b><br>${lg.pickup.name} → ${lg.drop.name}`);

    // arrowhead at 62% along, pointing at the drop-off
    const t  = 0.62;
    const dx = (to[1] - from[1]) * Math.cos(rad(from[0])), dy = to[0] - from[0];
    L.marker([from[0] + dy * t, from[1] + (to[1] - from[1]) * t], {
      icon: arrowIcon(Math.atan2(-dy, dx) * 180 / Math.PI, c, isNext),
      opacity: op, interactive: false
    }).addTo(legLayer);

    L.marker(from, { icon: pinIcon(done ? '✓' : lg.n, done ? '#94a3b8' : c) })
      .addTo(legLayer)
      .bindPopup(`<b>Leg ${lg.n} starts here</b><br>${lg.pickup.name}<br>
                  <small>${lg.pickup.hint}</small>
                  ${dupes.has(lg.n) ? '<br><small><b>Shared point.</b> Another leg starts here too — the markers are fanned apart on purpose.</small>' : ''}
                  <br>→ drops at <b>${lg.drop.name}</b>`);

    if (showBackups || isNext){
      L.circleMarker([lg.altPickup.lat, lg.altPickup.lng], {
        radius: 4, color: c, weight: 1.5, fillColor: '#fff', fillOpacity: 1, opacity: .8
      }).addTo(legLayer)
        .bindPopup(`<b>Leg ${lg.n} backup pickup (B1)</b><br>${lg.altPickup.name}`);
    }
  });

  L.marker(pos['FIN'], { icon: pinIcon('★', '#0d9488') })
    .addTo(legLayer).bindPopup(`<b>Finish</b><br>${finish.name}`);
}

function fitAll(){
  const pts = LEGS.flatMap(L => [[L.pickup.lat, L.pickup.lng], [L.drop.lat, L.drop.lng]]);
  map.fitBounds(L.latLngBounds(pts).pad(0.12));
}
function fitNext(){
  const n = nextLegN(); if (n === null) return fitAll();
  const Lg = LEGS.find(l => l.n === n);
  map.fitBounds(L.latLngBounds([[Lg.pickup.lat, Lg.pickup.lng], [Lg.drop.lat, Lg.drop.lng]]).pad(0.35));
}

function startTracking(){
  if (!navigator.geolocation) return toast('No geolocation on this device');
  if (watchId !== null){
    navigator.geolocation.clearWatch(watchId); watchId = null;
    $('#btnLocate').textContent = 'Track me';
    $('#btnLocate').classList.add('ghost');
    return;
  }
  $('#btnLocate').textContent = 'Tracking…';
  $('#btnLocate').classList.remove('ghost');
  watchId = navigator.geolocation.watchPosition(pos => {
    const { latitude:lat, longitude:lng, accuracy } = pos.coords;
    if (!meMarker){
      meMarker = L.circleMarker([lat, lng], {
        radius:7, color:'#ffffff', weight:2.5, fillColor:'#0d9488', fillOpacity:1
      }).addTo(map);
      meCircle = L.circle([lat, lng], { radius:accuracy, color:'#0d9488', weight:1, fillOpacity:.08 }).addTo(map);
      map.setView([lat, lng], 14);
    } else {
      meMarker.setLatLng([lat, lng]);
      meCircle.setLatLng([lat, lng]).setRadius(accuracy);
    }
    const n = nextLegN();
    if (n === null){ $('#mapInfo').textContent = 'All legs done.'; return; }
    const Lg = LEGS.find(l => l.n === n);
    const d  = haversine({ lat, lng }, Lg.pickup);
    $('#mapInfo').innerHTML =
      `Leg <b>${Lg.n}</b> pickup — <b>${Lg.pickup.name}</b> — ${d < 1 ? Math.round(d*1000)+' m' : d.toFixed(1)+' km'} away
       <span class="small">(~${Math.max(1, Math.round(d*1000/80))} min walk)</span>`;
  }, err => {
    toast('Location denied'); $('#btnLocate').textContent = 'Track me';
    $('#btnLocate').classList.add('ghost'); watchId = null;
  }, { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
}

/* ================================================================
   SCRIPT CARDS
   ================================================================ */
function cardHTML(c, movable, group, i, len){
  return `
<div class="sc" data-id="${c.id}">
  <div class="sc-top">
    <span class="sc-tag ${/NO|PUSHBACK|SKIP/.test(c.tag) ? 'warn' : ''}">${c.tag}</span>
    <span class="sc-ttl">${c.title}</span>
    ${movable ? `<button class="mv" ${i===0?'disabled':''} onclick="mv('${group}','${c.id}',-1)">↑</button>
                 <button class="mv" ${i===len-1?'disabled':''} onclick="mv('${group}','${c.id}',1)">↓</button>` : ''}
  </div>
  ${c.tone ? `<p class="sc-tone">${c.tone}</p>` : ''}
  <div class="sc-big">${c.big}</div>
  <p class="sc-why"><b>Why:</b> ${c.why}</p>
</div>`;
}

function ordered(list, group){
  const ord = S.order[group];
  if (!ord) return list;
  const byId = Object.fromEntries(list.map(c => [c.id, c]));
  const out  = ord.map(id => byId[id]).filter(Boolean);
  list.forEach(c => { if (!out.includes(c)) out.push(c); });
  return out;
}

function renderScripts(){
  $('#scPre').innerHTML = SCRIPT_PRERIDE.map(c => cardHTML(c, false)).join('');
  const cab = ordered(SCRIPT_INCAB, 'cab');
  const cl  = ordered(SCRIPT_CLOSE, 'close');
  $('#scCab').innerHTML   = cab.map((c,i) => cardHTML(c, true, 'cab',   i, cab.length)).join('');
  $('#scClose').innerHTML = cl .map((c,i) => cardHTML(c, true, 'close', i, cl.length)).join('');
}

function mv(group, id, dir){
  const src = group === 'cab' ? SCRIPT_INCAB : SCRIPT_CLOSE;
  const cur = ordered(src, group).map(c => c.id);
  const i   = cur.indexOf(id), j = i + dir;
  if (j < 0 || j >= cur.length) return;
  [cur[i], cur[j]] = [cur[j], cur[i]];
  S.order[group] = cur; save(); renderScripts();
}

/* ================================================================
   NOTES
   ================================================================ */
function renderNotes(){
  $('#noteList').innerHTML = NOTES.map(n => `
    <div class="note">
      <h3 onclick="this.parentNode.classList.toggle('open')">${n.h}<span class="chev">▶</span></h3>
      <div class="bd">${n.b}</div>
    </div>`).join('');
}

/* ================================================================
   LOG / SETUP
   ================================================================ */
function renderLog(){
  $('#cfgSv').value = S.cfg.sv; $('#cfgEn').value = S.cfg.en;
  $('#cfgTel').value = S.cfg.tel; $('#cfgName').value = S.cfg.name;

  const rows = LEGS.filter(L => leg(L.n).name || leg(L.n).phone);
  $('#leadTable').innerHTML = rows.length
    ? `<table><tr><th>Leg</th><th>Name</th><th>Contact</th><th>Drives for</th></tr>${
        rows.map(L => { const s = leg(L.n);
          return `<tr><td>${L.n}</td><td>${esc(s.name)}</td><td>${esc(s.phone)}</td><td>${esc(s.worksFor)}</td></tr>`;
        }).join('')}</table>`
    : `<p class="muted small">Nothing yet. Names and numbers you enter on a leg show up here.</p>`;
}
const esc = s => (s || '').replace(/[<>&]/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c]));

function copyLeads(){
  const rows = LEGS.filter(L => leg(L.n).name || leg(L.n).phone);
  if (!rows.length) return toast('No leads yet');
  const txt = rows.map(L => { const s = leg(L.n);
    return `Ride ${L.n} (${L.co}) — ${s.name || '(no name)'} — ${s.phone} — drives for ${s.worksFor || 'n/a'}`;
  }).join('\n');
  copyTxt(`${rows.length} drivers agreed to share contact details:\n\n${txt}`);
}

function saveCfg(){
  S.cfg = { sv:$('#cfgSv').value.trim(), en:$('#cfgEn').value.trim(),
            tel:$('#cfgTel').value.trim(), name:$('#cfgName').value.trim() };
  save(); toast('Saved to this phone');
}

function exportAll(){
  const blob = new Blob([JSON.stringify(S, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'fieldkit-backup.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function importAll(file){
  const r = new FileReader();
  r.onload = () => {
    try { S = Object.assign(blank(), JSON.parse(r.result)); save(); renderAll(); toast('Imported'); }
    catch { toast('That file did not parse'); }
  };
  r.readAsText(file);
}
function wipe(){
  if (!confirm('Erase every ride, lead and setting stored on this phone?')) return;
  localStorage.removeItem(KEY); S = blank(); renderAll(); toast('Erased');
}

/* ================================================================
   TABS + BOOT
   ================================================================ */
function showTab(name){
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
  ['run','map','say','notes','log'].forEach(t => $('#tab-' + t).hidden = t !== name);
  window.scrollTo({ top:0 });
  if (name === 'map')  { initMap(); drawRoute(); setTimeout(() => map.invalidateSize(), 60); }
  if (name === 'log')  renderLog();
}

function renderAll(){ renderLegs(); renderScripts(); renderNotes(); renderLog(); paintCounters(); }

function boot(){
  $$('.tabs button').forEach(b => b.onclick = () => showTab(b.dataset.tab));
  $('#btnLocate').onclick  = startTracking;
  $('#btnFitAll').onclick  = () => { initMap(); fitAll(); };
  $('#btnFitNext').onclick = () => { initMap(); fitNext(); };
  $('#btnBackups').onclick = () => {
    showBackups = !showBackups; initMap(); drawRoute();
    $('#btnBackups').classList.toggle('ghost', !showBackups);
    toast(showBackups ? 'Showing every B1 backup' : 'Backups hidden except the next leg');
  };
  $('#btnBig').onclick     = () => { document.body.classList.toggle('big');
                                     $('#btnBig').textContent = document.body.classList.contains('big') ? 'Normal text' : 'Bigger text'; };
  $('#btnResetOrder').onclick = () => { S.order = { cab:null, close:null }; save(); renderScripts(); toast('Order reset'); };
  $('#btnSaveCfg').onclick = saveCfg;
  $('#btnCopyLeads').onclick = copyLeads;
  $('#btnExport').onclick  = exportAll;
  $('#btnWipe').onclick    = wipe;
  $('#fileImport').onchange = e => e.target.files[0] && importAll(e.target.files[0]);
  renderAll();
  // open the first unfinished leg so the app is useful on arrival
  const n = nextLegN(); if (n !== null) $(`#leg${n}`)?.classList.add('open');
}
boot();
