// The donation checker on donate.html. Data lives in devices.js.

const app = document.getElementById("app");
const state = { device: null, qty: 1, age: null, works: null, who: "biz", form: {} };
let trail = [];

const things = () => state.device.plural || "items";

// ---------- navigation ----------
function steps() {
  const d = state.device;
  if (!d || d.tier === "no" || d.tier === "unknown") return ["device", "result"];
  return d.computer ? ["device", "qty", "age", "works", "result"] : ["device", "qty", "result"];
}
function go(screen, push = true) {
  if (push && trail[trail.length - 1] !== screen) trail.push(screen);
  render(screen);
}
function back() { trail.pop(); render(trail[trail.length - 1] || "device"); }
document.getElementById("back").onclick = back;

function setProgress(screen) {
  const s = steps(), bulk = state.device && state.device.computer && state.qty >= BULK;
  const seq = bulk ? [...s, "pickup", "done"] : s;
  const pct = Math.round((Math.max(seq.indexOf(screen), 0) / (seq.length - 1)) * 100);
  document.getElementById("bar").style.width = pct + "%";
  document.querySelector(".track").setAttribute("aria-valuenow", pct);
  const remaining = s.indexOf("result") - s.indexOf(screen);
  document.getElementById("left").textContent =
    screen === "device" ? "Takes about 30 seconds" :
    screen === "result" ? "Your answer" :
    screen === "pickup" ? "Last step" :
    screen === "done" ? "Request sent" :
    remaining === 1 ? "Last question" : `${NUMBER_WORDS[remaining] || remaining} questions left`;
  document.getElementById("back").hidden = trail.length <= 1;
}

function render(screen) {
  setProgress(screen);
  // The first screen shows at once; later screens rise in as the visitor moves through.
  app.innerHTML = `<div class="panel${trail.length > 1 ? " rise" : ""}">${SCREENS[screen]()}</div>`;
  (BIND[screen] || (() => {}))();
  const h = app.querySelector("h2");
  if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  if (trail.length > 1) document.querySelector(".tool").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

// ---------- screens ----------
const SCREENS = {
  device: () => `
    <h2>What are you donating?</h2>
    <p class="help">Pick one, or search for anything else.</p>
    <div class="choices">${CHOICES.map(id => `<button class="choice" data-id="${id}">${byId(id).name}</button>`).join("")}</div>
    <div class="find">
      <label for="search">Search all items</label>
      <input type="text" id="search" placeholder="Printer, PS4, microwave" autocomplete="off"
        role="combobox" aria-expanded="false" aria-controls="suggest" aria-autocomplete="list">
      <ul class="suggest" id="suggest" role="listbox" aria-label="Matching items"></ul>
    </div>`,

  qty: () => `
    <h2>How many ${things()}?</h2>
    <p class="help">${state.device.computer ? `${BULK} or more computers and we can come and pick them up.` : "A rough number is fine."}</p>
    <div class="stepper">
      <button type="button" class="step-btn" id="minus" aria-label="One fewer">−</button>
      <input type="number" id="qty" min="1" max="2000" value="${state.qty}" inputmode="numeric" aria-label="How many">
      <button type="button" class="step-btn" id="plus" aria-label="One more">+</button>
    </div>
    <div class="presets">${[1, 3, 5, 10, 25, 50].map(n => `<button class="preset" data-n="${n}">${n}</button>`).join("")}</div>
    <p class="note" id="qty-note"></p>
    <div class="actions"><button class="btn block" id="next">Continue</button></div>`,

  age: () => `
    <h2>How old ${state.qty > 1 ? "are they" : "is it"}, roughly?</h2>
    <p class="help">This tells us whether ${state.qty > 1 ? "they" : "it"} can be refurbished.</p>
    <div class="options">${AGE.map(o => opt(o, state.age)).join("")}</div>`,

  works: () => `
    <h2>Do ${state.qty > 1 ? "they" : "it"} turn on?</h2>
    <p class="help">We take broken computers too.</p>
    <div class="options">${WORKS.filter(o => state.qty > 1 || o.v !== "some")
      .map(o => opt(state.qty > 1 ? o : { ...o, t: o.t.replace("they turn", "it turns").replace("they don't", "it doesn't") }, state.works)).join("")}</div>`,

  result: () => resultHTML(),

  pickup: () => {
    const f = state.form;
    return `
    <h2>Book a pickup</h2>
    <p class="help">${state.qty} ${things()}. We collect on Wednesdays and Thursdays.</p>
    <form id="pickup-form" novalidate>
      <div class="seg" role="group" aria-label="Who is donating">
        <button type="button" data-who="biz" aria-pressed="${state.who === "biz"}">A business or organization</button>
        <button type="button" data-who="solo" aria-pressed="${state.who === "solo"}">Just me</button>
      </div>
      ${state.who === "biz" ? field("org", "Organization name", "text", "", true, f.org, "organization") : ""}
      <div class="pair">
        ${field("name", "Your name", "text", "", true, f.name, "name")}
        ${field("email", "Email", "email", "", true, f.email, "email")}
      </div>
      ${field("addr", "Pickup address", "text", "", true, f.addr, "street-address")}
      <div class="pair">
        <div class="field"><label for="zone">Area</label>
          <select id="zone">${[["60", "Downtown Toronto"], ["70", "Midtown Toronto"], ["85", "Etobicoke or Scarborough"], ["100", "Peel or York Region"]]
            .map(([v, t]) => `<option value="${v}" ${f.zone === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
        <div class="field"><label for="day">Best day</label>
          <select id="day">${["Either day", "Wednesday", "Thursday"].map(t => `<option ${f.day === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label for="same">Are they the same model?</label>
        <select id="same">${[["same", "All or mostly the same"], ["few", "A few different models"], ["mixed", "All different"]]
          .map(([v, t]) => `<option value="${v}" ${f.same === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      ${field("model", "Brand and model", "text", "Lenovo ThinkPad T480", false, f.model, "off")}
      <p class="offer" id="offer"></p>
      <div class="actions"><button class="btn block" type="submit">Request pickup</button></div>
    </form>`;
  },

  done: () => doneHTML(),
};

function opt(o, cur) {
  return `<button class="opt" data-v="${o.v}" aria-pressed="${cur === o.v}"><b>${o.t}</b>${o.s ? `<span>${o.s}</span>` : ""}</button>`;
}
function field(id, label, type, ph, req, val, ac) {
  return `<div class="field"><label for="${id}">${label}${req ? "" : ' <span class="optional">(optional)</span>'}</label>
    <input type="${type}" id="${id}" ${ph ? `placeholder="${ph}"` : ""} value="${esc(val || "")}" autocomplete="${ac}" ${req ? "required" : ""} aria-describedby="${id}-err">
    <p class="err" id="${id}-err"></p></div>`;
}

// ---------- behaviour ----------
const BIND = {
  device: () => {
    app.querySelectorAll(".choice").forEach(c => c.onclick = () => chooseDevice(byId(c.dataset.id)));
    const input = app.querySelector("#search"), list = app.querySelector("#suggest");
    let active = -1, items = [];
    const draw = () => {
      list.innerHTML = items.map((d, i) => `<li role="option"><button aria-selected="${i === active}" data-i="${i}">
        <span>${esc(d.label || d.name)}</span>${TIER[d.tier] ? `<em class="${TIER[d.tier][1]}">${TIER[d.tier][0]}</em>` : ""}</button></li>`).join("");
      input.setAttribute("aria-expanded", items.length > 0);
      list.querySelectorAll("button").forEach(b => b.onclick = () => chooseDevice(items[+b.dataset.i]));
    };
    input.oninput = () => {
      const raw = input.value.trim(), words = raw.toLowerCase().split(/\s+/);
      active = -1;
      if (!raw) { items = []; return draw(); }
      items = DEVICES.filter(d => words.every(w => (d.name + " " + d.keys).toLowerCase().includes(w))).slice(0, 6);
      if (!items.length) items = [{ name: raw, tier: "unknown", label: `Not on our list. What should I do with "${raw}"?` }];
      draw();
    };
    input.onkeydown = (e) => {
      if (!items.length) return;
      if (e.key === "ArrowDown") { active = (active + 1) % items.length; draw(); e.preventDefault(); }
      if (e.key === "ArrowUp") { active = (active - 1 + items.length) % items.length; draw(); e.preventDefault(); }
      if (e.key === "Enter") { chooseDevice(items[Math.max(active, 0)]); e.preventDefault(); }
    };
  },
  qty: () => {
    const input = app.querySelector("#qty"), note = app.querySelector("#qty-note");
    const update = () => {
      state.qty = Math.max(1, Math.min(2000, parseInt(input.value, 10) || 1));
      const bulk = state.device.computer && state.qty >= BULK;
      note.className = "note" + (bulk ? " bulk" : "");
      note.textContent = !state.device.computer ? "You can drop these off at the shop."
        : bulk ? `${state.qty} computers counts as a bulk donation, so you can book a pickup.`
        : `Under ${BULK} computers, dropping them off is quickest.`;
    };
    const next = () => { update(); go(state.device.computer ? "age" : "result"); };
    app.querySelector("#minus").onclick = () => { input.value = Math.max(1, state.qty - 1); update(); };
    app.querySelector("#plus").onclick = () => { input.value = state.qty + 1; update(); };
    app.querySelectorAll(".preset").forEach(p => p.onclick = () => { input.value = p.dataset.n; update(); });
    input.oninput = update;
    input.onkeydown = (e) => { if (e.key === "Enter") next(); };
    app.querySelector("#next").onclick = next;
    update();
  },
  age: () => bindOptions("age", "works"),
  works: () => bindOptions("works", "result"),
  result: () => {
    app.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => go(b.dataset.edit));
    const p = app.querySelector("#to-pickup"); if (p) p.onclick = () => go("pickup");
    const r = app.querySelector("#restart"); if (r) r.onclick = restart;
  },
  pickup: () => {
    const form = app.querySelector("#pickup-form");
    const save = () => {
      ["org", "name", "email", "addr", "model"].forEach(k => { const el = form.querySelector("#" + k); if (el) state.form[k] = el.value.trim(); });
      ["zone", "day", "same"].forEach(k => state.form[k] = form.querySelector("#" + k).value);
      const offer = form.querySelector("#offer"), free = qualifiesFree();
      const dropoff = `Or skip the fee: drop-off at the shop is always free on ${HOURS}.`;
      offer.className = "offer" + (free ? " free" : "");
      offer.textContent = state.who !== "biz"
        ? `We don't usually collect from homes, but we'll look at your request. Pickup starts at $${state.form.zone}. ${dropoff}`
        : free ? `Good news: ${state.qty} similar computers in good shape qualify for free pickup.`
        : `Pickup in this area starts at $${state.form.zone}. Businesses with ${FREE_MIN} or more similar, working computers under 8 years old get it free. ${dropoff}`;
    };
    form.querySelectorAll("[data-who]").forEach(b => b.onclick = () => { save(); state.who = b.dataset.who; render("pickup"); });
    form.addEventListener("input", save);
    form.addEventListener("change", save);
    form.onsubmit = (e) => {
      e.preventDefault(); save();
      let first = null;
      form.querySelectorAll("input[required]").forEach(el => {
        const msg = !el.value.trim() ? "Please fill this in."
          : el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value) ? "That email doesn't look right. Try name@example.com." : "";
        el.setAttribute("aria-invalid", !!msg);
        form.querySelector("#" + el.id + "-err").textContent = msg;
        if (msg && !first) first = el;
      });
      if (first) { first.focus(); return; }
      go("done");
    };
    save();
  },
  done: () => {
    const c = app.querySelector("#see-cert");
    if (c) c.onclick = () => { const box = app.querySelector("#cert"); box.innerHTML = certHTML(); c.remove(); box.scrollIntoView({ behavior: "smooth", block: "start" }); };
    app.querySelector("#restart").onclick = restart;
  },
};

function bindOptions(key, nextScreen) {
  app.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    state[key] = b.dataset.v;
    app.querySelectorAll(".opt").forEach(x => x.setAttribute("aria-pressed", x === b));
    setTimeout(() => go(nextScreen), 180);   // brief pause so the choice is seen
  });
}
function chooseDevice(d) {
  if (state.device !== d) Object.assign(state, { device: d, qty: 1, age: null, works: null });
  go(d.tier === "no" || d.tier === "unknown" ? "result" : "qty");
}
function restart() {
  Object.assign(state, { device: null, qty: 1, age: null, works: null, who: "biz", form: {} });
  trail = []; go("device");
}
function qualifiesFree() {
  return state.who === "biz" && state.qty >= FREE_MIN && state.form.same !== "mixed" && state.age !== "old" && state.works !== "no";
}

// ---------- result content ----------
function answers() {
  const d = state.device, parts = [];
  if (d.tier === "no" || d.tier === "unknown") parts.push(d.name);
  else if (d.plural) parts.push(`${state.qty} ${state.qty > 1 ? d.plural : d.name.toLowerCase()}`);
  else parts.push(state.qty > 1 ? `${d.name}, ${state.qty} of them` : d.name);
  const many = state.qty > 1;
  if (state.age) parts.push(AGE.find(a => a.v === state.age).t.toLowerCase() + " old");
  if (state.works) parts.push({ yes: many ? "they turn on" : "it turns on", some: "some turn on", no: many ? "they don't turn on" : "it doesn't turn on", unsure: "not sure if " + (many ? "they work" : "it works") }[state.works]);
  return `<p class="answers">${esc(parts.join(", "))}.<button data-edit="device">Change</button></p>`;
}
function verdict(cls, kind, title, say) {
  return `<div class="verdict ${cls}"><p class="kind">${kind}</p><h2>${title}</h2><p class="say">${say}</p></div>`;
}
const DROPOFF = `
  <ul class="facts">
    <li><b>Bring ${"$"}{WHAT} to ${ADDRESS}</b><span>Entrance on the northeast corner, up a few stairs.</span></li>
    <li><b>${HOURS}</b><span>Bring chargers and cables if you have them.</span></li>
  </ul>
  <div class="actions">
    <a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}" target="_blank" rel="noopener">Get directions</a>
    <button class="btn quiet" id="restart">Check something else</button>
  </div>`;
const dropoff = (many) => DROPOFF.replace("${WHAT}", many ? "them" : "it");

function resultHTML() {
  const d = state.device, n = state.qty, many = n > 1;
  if (d.tier === "no") {
    return verdict("v-no", "Not accepted", "Sorry, we can't take this", "We can't reuse or safely process it, so please don't leave it at our door.") + answers() +
      `<ul class="facts">
        <li><b>Try a City of Toronto drop-off depot</b><span>They take many household items and electronics.</span></li>
        ${d.alt ? `<li><b>Good to know</b><span>${d.alt}</span></li>` : ""}
      </ul><div class="actions"><button class="btn quiet" id="restart">Check something else</button></div>`;
  }
  if (d.tier === "unknown") {
    return verdict("v-warn", "Not on our list", "Call us before you bring it", `We're not sure we can take "${esc(d.name)}". A quick call will save you the trip.`) + answers() +
      `<div class="actions"><a class="btn" href="tel:+14165723737">Call 416-572-3737</a><button class="btn quiet" id="restart">Check something else</button></div>`;
  }
  if (d.computer && n >= BULK) {
    const good = state.age !== "old" && state.works !== "no";
    return verdict(good ? "v-accent" : "v-soft", good ? "Bulk donation, most needed" : "Bulk donation",
      `Let's book a pickup for your ${n} ${things()}`,
      good ? `Batches like this are exactly what we need. Businesses giving ${FREE_MIN} or more similar computers usually qualify for free pickup.`
           : "Older or broken batches mostly go to parts and recycling, but we can still collect them.") + answers() +
      `<div class="actions"><button class="btn block" id="to-pickup">Book a pickup</button></div>
       <p class="small" style="margin:14px 0 0">Rather bring them in? Drop-off is free on ${HOURS}.</p>`;
  }
  if (d.computer) {
    const old = state.age === "old", dead = state.works === "no";
    if (old && dead) return verdict("v-soft", "Accepted for recycling", `We'll take ${many ? "them" : "it"}`,
      "Old computers that don't turn on usually can't be refurbished, so we'll keep the working parts and recycle the rest properly.") + answers() + dropoff(many);
    if (old || dead) return verdict("v-soft", "Accepted", `Yes, we can take ${many ? "these" : "this"}`,
      "Depending on condition, we'll refurbish it or reuse its parts.") + answers() + dropoff(many);
    return verdict("v-accent", "Most needed", `Yes, ${many ? "these are" : "this is"} exactly what we need`,
      "Computers like this are refurbished and sold at low cost to students, newcomers, seniors and families.") + answers() + dropoff(many);
  }
  if (d.tier === "need") return verdict("v-accent", "Most needed", `Yes, please bring ${many ? "them" : "it"} in`,
    "Accessories let us send refurbished computers out as complete setups.") + answers() + dropoff(many);
  return verdict("v-soft", "Accepted", `Yes, we can take ${many ? "these" : "this"}`,
    "Our biggest need is computers and accessories, but we'll reuse or properly recycle this.") + answers() + dropoff(many);
}

function doneHTML() {
  const f = state.form, free = qualifiesFree(), biz = state.who === "biz";
  const who = biz ? (f.org || f.name) : f.name;
  const day = f.day === "Either day" || !f.day ? "a Wednesday or Thursday" : `a ${f.day}`;
  const freeDrop = `Changed your mind? Drop-off is always free on ${HOURS}.`;
  return verdict(free ? "v-accent" : "v-soft", free ? "Request sent, free pickup" : "Request sent", `Thanks, ${esc(who)}`,
      free ? `Your ${state.qty} ${things()} qualify for free pickup, so the usual $${f.zone} fee is waived.`
           : biz ? `We'll email you to confirm the pickup and its fee, from $${f.zone}. ${freeDrop}`
           : `We'll look at your request and reply by email. Pickup starts at $${f.zone}. ${freeDrop}`) +
    `<div class="next">
       <h3>What happens next</h3>
       <ol>
         <li><b>We email you</b><span>At ${esc(f.email)}, to set a time on ${day}.</span></li>
         <li><b>We collect your ${things()}</b><span>From ${esc(f.addr)}.</span></li>
         <li><b>Every drive is securely wiped</b><span>${biz ? "You get a certificate listing each serial number." : "Your personal data is permanently erased."}</span></li>
         <li><b>They go to people who need them</b><span>${biz ? "You get a report showing where they went." : "Refurbished and sold at low cost in Toronto."}</span></li>
       </ol>
     </div>
     <div class="actions noprint">
       ${biz ? `<button class="btn" id="see-cert">See a sample certificate</button>` : ""}
       <button class="btn quiet" id="restart">Start again</button>
     </div>
     <div id="cert"></div>`;
}

function certHTML() {
  const f = state.form, d = state.device, usable = state.age !== "old" && state.works !== "no";
  const kgEach = d.id === "laptop" ? 2.2 : 8;   // rough prototype estimates
  const reused = Math.round(state.qty * (usable ? (state.age === "new" ? 0.9 : 0.75) : 0.2));
  const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const model = f.model || d.name;
  const rows = Array.from({ length: Math.min(state.qty, 5) }, (_, i) =>
    `<tr><td>${i + 1}</td><td>${esc(model)}</td><td>SN-${serial(i)}</td><td>Overwrite and verify</td><td>Passed</td></tr>`).join("");
  return `<div class="cert">
    <div class="cert-top"><span class="small">Free Geek Toronto partner program</span><span class="sample">Sample</span></div>
    <h3>Certificate of data sanitization and impact</h3>
    <p class="small" style="margin:0">Issued to ${esc(f.org || f.name)}, ${today}</p>
    <div class="figures">
      <div><b>${state.qty}</b>devices wiped</div>
      <div><b>${reused}</b>back in use</div>
      <div><b>${Math.round(state.qty * kgEach)} kg</b>kept from landfill</div>
    </div>
    <p style="margin:0 0 16px">Your donation puts affordable computers in the hands of students, newcomers, seniors and low-income families in Toronto.</p>
    <div class="tablewrap"><table><thead><tr><th scope="col">Device</th><th scope="col">Model</th><th scope="col">Serial</th><th scope="col">Method</th><th scope="col">Result</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${state.qty > 5 ? `<p class="small">And ${state.qty - 5} more devices in the full report.</p>` : ""}
    <p class="small" style="margin:16px 0 0">Proposed process: drives wiped following the NIST SP 800-88 guideline with FGT's existing tools. Figures are estimates for this prototype.</p>
    <div class="actions noprint"><button class="btn quiet" onclick="window.print()">Print or save as PDF</button></div>
  </div>`;
}

function serial(i) {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "", n = Math.imul(i + 7, 2654435761) >>> 0;
  for (let k = 0; k < 8; k++) { n = (Math.imul(n ^ (n >>> 15), 2246822519) + 12345) >>> 0; s += c[(n >>> 8) % c.length]; }
  return s;
}

// Start on the device screen, or jump straight in when the home page's quick check sent a device (?d=laptop).
const start = byId(new URLSearchParams(location.search).get("d"));
go("device");
if (start) chooseDevice(start);
