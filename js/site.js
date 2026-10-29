// Shared behaviour for every page: menu, header, entrance motion, counters,
// and on the home page the quick check and the second-life journey.

const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- menu ----------
const head = document.querySelector(".site-head");
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");
if (menuBtn && nav) {
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    head.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.textContent = open ? "Close" : "Menu";
  };
  menuBtn.onclick = () => setMenu(!nav.classList.contains("open"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
}

// ---------- header hides while reading down, returns when scrolling up ----------
let lastY = scrollY;
addEventListener("scroll", () => {
  const y = scrollY;
  if (!head.classList.contains("open")) head.classList.toggle("hide", y > lastY && y > 300);
  lastY = y;
}, { passive: true });

// ---------- entrances: each part of a section rises in turn ----------
document.querySelectorAll("[data-reveal]").forEach(el => [...el.children].forEach((c, i) => c.style.setProperty("--i", i)));
const seen = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); seen.unobserve(e.target); } });
}, { rootMargin: "0px 0px -12% 0px" });
document.querySelectorAll("[data-reveal], .zoom").forEach(el => seen.observe(el));

// ---------- stamped titles decode into place, like a label being printed ----------
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&$@";
const scramble = (el) => {
  const text = el.textContent, start = performance.now(), dur = 900;
  el.setAttribute("aria-label", text);
  const step = (t) => {
    const p = Math.min(1, (t - start) / dur), fixed = Math.floor(p * text.length);
    el.textContent = text.split("").map((c, i) => i < fixed || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
    if (p < 1) requestAnimationFrame(step); else { el.textContent = text; el.removeAttribute("aria-label"); }
  };
  requestAnimationFrame(step);
};
if (!calm) {
  const stamps = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { stamps.unobserve(e.target); scramble(e.target); } });
  }, { threshold: .8 });
  document.querySelectorAll("main h2:not(.sr):not(.panel h2), .ways h3").forEach(h => { if (!h.children.length) stamps.observe(h); });
}

// ---------- counters ----------
const counted = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    counted.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    const show = (n) => el.textContent = pre + Math.round(n).toLocaleString("en-CA") + suf;
    if (calm) return show(end);
    const t0 = performance.now(), dur = 1600;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur); show(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}, { threshold: .6 });
document.querySelectorAll("[data-count]").forEach(el => counted.observe(el));

// ---------- hero picture drifts slower than the page ----------
const heroImg = document.querySelector(".hero-media img");
if (heroImg && !calm) {
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(scrollY, 900);
      heroImg.style.translate = `0 ${y * 0.12}px`;
      ticking = false;
    });
  }, { passive: true });
}

// ---------- second life: the picture follows the step being read ----------
const steps = [...document.querySelectorAll(".journey-steps > li")];
const frames = [...document.querySelectorAll(".stack > *")];
const jbar = document.querySelector(".jbar i");
if (steps.length) {
  const show = (i) => {
    steps.forEach((s, k) => s.classList.toggle("on", k === i));
    frames.forEach((f, k) => f.classList.toggle("on", k === i));
    if (jbar) jbar.style.width = ((i + 1) / steps.length * 100) + "%";
  };
  const watch = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) show(steps.indexOf(e.target)); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  steps.forEach(s => watch.observe(s));
  show(0);
}

// ---------- quick check: type anything, see at once whether Free Geek takes it ----------
const qc = document.getElementById("qc");
if (qc && typeof DEVICES !== "undefined") {
  const out = document.getElementById("qc-out");
  const examples = ["laptop", "microwave", "PS5", "old monitor"];
  const hint = () => {
    out.innerHTML = `<p class="check-hint">Try ${examples.map(x => `<button type="button" data-x="${x}">${x}</button>`).join(", ")}.</p>`;
    out.querySelectorAll("[data-x]").forEach(b => b.onclick = () => { qc.value = b.dataset.x; qc.dispatchEvent(new Event("input")); qc.focus(); });
  };
  const SAY = {
    need: ["vc-need", "Yes, most needed", "How to donate"],
    ok: ["vc-ok", "Yes, we accept it", "How to donate"],
    no: ["vc-no", "Sorry, we can't take it", "Where it can go instead"],
  };
  qc.addEventListener("input", () => {
    const raw = qc.value.trim(), words = raw.toLowerCase().split(/\s+/).filter(w => !["old", "my", "a", "an", "some", "used", "broken"].includes(w));
    if (!raw) return hint();
    const d = words.length ? DEVICES.find(x => words.every(w => (x.name + " " + x.keys).toLowerCase().includes(w))) : null;
    if (!d) {
      out.innerHTML = `<div class="verdict-chip vc-unknown"><span><b>Not on our list.</b> Give us a call first.</span><a href="tel:+14165723737">416-572-3737</a></div>`;
      return;
    }
    const [cls, say, go] = SAY[d.tier];
    out.innerHTML = `<div class="verdict-chip ${cls}"><span><b>${esc(d.name)}:</b> ${say}.</span><a href="donate.html?d=${d.id}">${go} <span aria-hidden="true">→</span></a></div>`;
  });
  hint();
}
