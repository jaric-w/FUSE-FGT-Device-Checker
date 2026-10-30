// Moving backgrounds drawn in code, in place of photographs.
// Any element with data-scene="<name>" gets a canvas that plays that scene.
// Scenes only run while on screen, and hold still for people who prefer less motion.

(() => {
  const css = getComputedStyle(document.documentElement);
  const SIGNAL = css.getPropertyValue("--signal").trim() || "#4be38f";
  const INK = "247,249,250";
  const GREEN = "75,227,143";
  const GROUND = "#090909";
  const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  const SCENES = {
    // A night sky of drifting green glows, stars and the odd streak passing over, like signals overhead.
    aurora(w, h) {
      const glows = [
        { c: "75,227,143", a: .42, r: .55, x: .78, y: .28, sx: .10, sy: .08, p: 0 },
        { c: "29,138,122", a: .50, r: .65, x: .30, y: .85, sx: .14, sy: .06, p: 2 },
        { c: "14,92,58", a: .70, r: .70, x: .95, y: .90, sx: .08, sy: .10, p: 4 },
        { c: "120,255,190", a: .18, r: .40, x: .55, y: .55, sx: .18, sy: .12, p: 1 },
      ];
      const stars = Array.from({ length: Math.round(w * h / 5000) }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(.3, 1.3), p: rand(0, 6.3), v: rand(.02, .12) }));
      const streaks = [];
      return (ctx, t) => {
        ctx.fillStyle = GROUND; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
        const s = t / 1000, m = Math.max(w, h);
        for (const g of glows) {
          const x = (g.x + Math.sin(s * .13 + g.p) * g.sx) * w, y = (g.y + Math.cos(s * .11 + g.p) * g.sy) * h, r = g.r * m;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, `rgba(${g.c},${g.a})`); grad.addColorStop(1, `rgba(${g.c},0)`);
          ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        }
        for (const st of stars) {
          st.x -= st.v; if (st.x < 0) st.x = w;
          ctx.fillStyle = `rgba(${INK},${.25 + .5 * Math.abs(Math.sin(s * .8 + st.p))})`;
          ctx.fillRect(st.x, st.y, st.r, st.r);
        }
        if (Math.random() < .008 && streaks.length < 3) streaks.push({ x: -200, y: rand(.1, .7) * h, v: rand(4, 8), len: rand(120, 260) });
        for (let i = streaks.length - 1; i >= 0; i--) {
          const k = streaks[i]; k.x += k.v; k.y -= k.v * .08;
          const grad = ctx.createLinearGradient(k.x - k.len, 0, k.x, 0);
          grad.addColorStop(0, `rgba(${GREEN},0)`); grad.addColorStop(1, `rgba(${INK},.9)`);
          ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(k.x - k.len, k.y + k.len * .08); ctx.lineTo(k.x, k.y); ctx.stroke();
          if (k.x - k.len > w) streaks.splice(i, 1);
        }
        ctx.globalCompositeOperation = "source-over";
      };
    },

    // Thousands of parts drifting along one current: the stream of things people pass on.
    flow(w, h) {
      const n = Math.round(w * h / 380);
      const ps = Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), g: Math.random() < .18 }));
      let first = true;
      return (ctx, t) => {
        ctx.fillStyle = first ? GROUND : "rgba(9,9,9,.09)"; first = false;
        ctx.fillRect(0, 0, w, h);
        const s = t / 1000;
        for (const p of ps) {
          const a = Math.sin(p.x * .006 + s * .3) * 1.4 + Math.cos(p.y * .008 - s * .2) * 1.2;
          p.x += Math.cos(a) * .9 + .35; p.y += Math.sin(a) * .9;
          if (p.x > w || p.x < 0 || p.y > h || p.y < 0) { p.x = rand(-10, w * .2); p.y = rand(0, h); }
          ctx.fillStyle = p.g ? `rgba(${GREEN},.9)` : `rgba(${INK},.45)`;
          ctx.fillRect(p.x, p.y, 1.4, 1.4);
        }
      };
    },

    // Grey scrap falls. Now and then a piece is caught, turns green and rises again.
    rise(w, h) {
      const n = Math.round(w * h / 2600);
      const make = (top) => ({ x: rand(0, w), y: top ? rand(-h, 0) : rand(0, h), s: rand(4, 14), r: rand(0, 6.3), vr: rand(-.02, .02), v: rand(.6, 1.6), saved: false, glow: 0 });
      const bits = Array.from({ length: n }, () => make(false));
      return (ctx) => {
        ctx.fillStyle = GROUND; ctx.fillRect(0, 0, w, h);
        const floor = ctx.createLinearGradient(0, h * .6, 0, h);
        floor.addColorStop(0, "rgba(255,122,107,0)"); floor.addColorStop(1, "rgba(255,122,107,.10)");
        ctx.fillStyle = floor; ctx.fillRect(0, h * .6, w, h * .4);
        for (let i = 0; i < bits.length; i++) {
          const b = bits[i];
          if (!b.saved && b.y > h * .55 && Math.random() < .004) b.saved = true;
          if (b.saved) { b.v += (-1.4 - b.v) * .03; b.glow = Math.min(1, b.glow + .03); }
          b.y += b.v; b.r += b.vr;
          if (b.y > h + 20 || b.y < -40) { bits[i] = make(true); continue; }
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
          if (b.saved) { ctx.shadowColor = SIGNAL; ctx.shadowBlur = 14 * b.glow; ctx.fillStyle = `rgba(${GREEN},${.4 + .6 * b.glow})`; }
          else ctx.fillStyle = `rgba(${INK},${.10 + b.s / 70})`;
          ctx.fillRect(-b.s / 2, -b.s * .35, b.s, b.s * .7);
          ctx.restore();
        }
      };
    },

    // A dot map of the blocks around the shop, with a ping going out from Sudbury Street.
    ping(w, h) {
      const gap = 18, cx = w * .56, cy = h * .48;
      const dots = [];
      for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dots.push({ x, y, d: Math.hypot(x - cx, y - cy) });
      return (ctx, t) => {
        ctx.fillStyle = GROUND; ctx.fillRect(0, 0, w, h);
        const s = t / 1000, max = Math.hypot(w, h) * .6, waves = [0, 1, 2].map(k => ((s * 70 + k * max / 3) % max));
        for (const p of dots) {
          let lit = 0;
          for (const r of waves) lit = Math.max(lit, Math.max(0, 1 - Math.abs(p.d - r) / 26) * (1 - r / max));
          ctx.fillStyle = lit > .05 ? `rgba(${GREEN},${.15 + lit * .85})` : `rgba(${INK},.13)`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.3 + lit * 1.6, 0, 6.3); ctx.fill();
        }
        // Queen St runs east to west below the shop, the rail corridor angles across above it.
        ctx.strokeStyle = `rgba(${INK},.28)`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, cy + h * .22); ctx.lineTo(w, cy + h * .19); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy - h * .05); ctx.lineTo(w, cy - h * .32); ctx.stroke();
        ctx.fillStyle = `rgba(${INK},.5)`; ctx.font = `11px ${MONO}`;
        ctx.fillText("QUEEN ST W", 16, cy + h * .22 - 8);
        const pulse = 1 + Math.sin(s * 3) * .15;
        ctx.shadowColor = SIGNAL; ctx.shadowBlur = 24; ctx.fillStyle = SIGNAL;
        ctx.beginPath(); ctx.arc(cx, cy, 7 * pulse, 0, 6.3); ctx.fill(); ctx.shadowBlur = 0;
      };
    },

    // A drive's contents scrambled in hex, wiped to zeros line by line as the scan passes.
    wipe(w, h) {
      const size = 14, cols = Math.floor(w / (size * 1.6)), rows = Math.floor(h / (size * 1.5));
      const hex = "0123456789ABCDEF";
      const cell = () => hex[(Math.random() * 16) | 0] + hex[(Math.random() * 16) | 0];
      const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, cell));
      const ox = (w - cols * size * 1.6) / 2 + 2, oy = (h - rows * size * 1.5) / 2 + size;
      return (ctx, t) => {
        ctx.fillStyle = GROUND; ctx.fillRect(0, 0, w, h);
        const cycle = 9000, p = (t % cycle) / cycle, scan = Math.min(1, p / .8) * rows;
        ctx.font = `${size - 3}px ${MONO}`;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const x = ox + c * size * 1.6, y = oy + r * size * 1.5;
          if (r < scan - 1) { ctx.fillStyle = `rgba(${GREEN},.35)`; ctx.fillText("00", x, y); }
          else {
            if (Math.random() < .02) grid[r][c] = cell();
            ctx.fillStyle = `rgba(${INK},${Math.abs(r - scan) < 1.5 ? .95 : .3})`; ctx.fillText(grid[r][c], x, y);
          }
        }
        const sy = oy + scan * size * 1.5 - size;
        const band = ctx.createLinearGradient(0, sy - 60, 0, sy + 4);
        band.addColorStop(0, `rgba(${GREEN},0)`); band.addColorStop(1, `rgba(${GREEN},.35)`);
        ctx.fillStyle = band; ctx.fillRect(0, sy - 60, w, 64);
        ctx.fillStyle = SIGNAL; ctx.fillRect(0, sy + 3, w, 2);
      };
    },

    // Devices arriving from everywhere and settling into one batch on the floor.
    converge(w, h) {
      const cx = w / 2, cy = h * .52, n = Math.round(w * h / 900);
      const spawn = () => { const a = rand(0, 6.3), d = Math.max(w, h) * rand(.6, .9); return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, v: rand(.006, .014), g: Math.random() < .2 }; };
      const ps = Array.from({ length: n }, () => { const p = spawn(); const k = Math.random(); p.x += (cx - p.x) * k; p.y += (cy - p.y) * k; return p; });
      return (ctx, t) => {
        ctx.fillStyle = "rgba(9,9,9,.22)"; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          p.x += (cx - p.x) * p.v; p.y += (cy - p.y) * p.v;
          if (Math.hypot(cx - p.x, cy - p.y) < 30) { ps[i] = spawn(); continue; }
          ctx.fillStyle = p.g ? `rgba(${GREEN},.9)` : `rgba(${INK},.55)`;
          ctx.fillRect(p.x, p.y, 1.6, 1.6);
        }
        const s = t / 1000, bw = Math.min(160, w * .32), bh = bw * .62;
        ctx.shadowColor = SIGNAL; ctx.shadowBlur = 30 + Math.sin(s * 2) * 10;
        ctx.strokeStyle = SIGNAL; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 10); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(${GREEN},.08)`; ctx.fill();
      };
    },

    // A refurbished laptop's first boot: checks pass, Linux Mint installs, and it starts again.
    boot(w, h) {
      const lines = [
        ["memory test", "8 GB", "ok"], ["drive health", "256 GB SSD", "ok"], ["battery", "81% of design", "ok"],
        ["keyboard and trackpad", "", "ok"], ["wifi", "connected", "ok"], ["webcam", "", "ok"],
        ["installing Linux Mint", "", "bar"], ["browser, office, video calls", "", "ok"], ["ready for a new owner", "", "end"],
      ];
      const size = Math.max(12, Math.min(15, w / 34)), lh = size * 2.1, top = Math.max(28, (h - lines.length * lh) / 2), left = Math.max(20, w * .09);
      return (ctx, t) => {
        ctx.fillStyle = GROUND; ctx.fillRect(0, 0, w, h);
        const glow = ctx.createRadialGradient(w * .5, h * .5, 0, w * .5, h * .5, Math.max(w, h) * .7);
        glow.addColorStop(0, `rgba(${GREEN},.10)`); glow.addColorStop(1, `rgba(${GREEN},0)`);
        ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
        const step = 900, cycle = (lines.length + 4) * step, at = (t % cycle) / step;
        ctx.font = `${size}px ${MONO}`; ctx.textBaseline = "middle";
        lines.forEach(([label, note, kind], i) => {
          if (at < i) return;
          const y = top + i * lh, k = Math.min(1, at - i);
          const shown = label.slice(0, Math.ceil(label.length * Math.min(1, k * 2)));
          ctx.fillStyle = kind === "end" ? SIGNAL : `rgba(${INK},.85)`; ctx.fillText(shown, left, y);
          if (note && k > .5) { ctx.fillStyle = `rgba(${INK},.4)`; ctx.fillText(note, left + ctx.measureText(label + "  ").width, y); }
          const rx = w - left;
          if (kind === "bar") {
            const bw = Math.min(160, w * .3), pct = Math.min(1, (at - i) / 1);
            ctx.fillStyle = `rgba(${INK},.12)`; ctx.fillRect(rx - bw, y - 3, bw, 6);
            ctx.fillStyle = SIGNAL; ctx.fillRect(rx - bw, y - 3, bw * pct, 6);
          } else if (k > .6) {
            ctx.fillStyle = SIGNAL; ctx.textAlign = "right"; ctx.fillText(kind === "end" ? "●" : "ok", rx, y); ctx.textAlign = "left";
          }
        });
        if (Math.floor(t / 500) % 2) { const i = Math.min(lines.length - 1, Math.floor(at)); ctx.fillStyle = SIGNAL; ctx.fillRect(left - 14, top + i * lh - size / 2, 6, size); }
      };
    },
  };

  const live = new Set();
  const mount = (el) => {
    const make = SCENES[el.dataset.scene];
    if (!make) return;
    const c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    el.prepend(c);
    const ctx = c.getContext("2d");
    const s = { el, draw: null, t: rand(0, 4000), on: false };
    s.size = () => {
      // The sky is all soft light, so it renders at 1x to stay smooth on big screens.
      const r = el.getBoundingClientRect(), dpr = el.dataset.scene === "aurora" ? 1 : Math.min(devicePixelRatio || 1, 2);
      if (!r.width || !r.height) { s.draw = null; return; }
      c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.draw = make(r.width, r.height);
      if (still) { for (let i = 0; i < 160; i++) s.draw(ctx, 4000 + i * 16); }
    };
    s.frame = (dt) => { if (s.draw) { s.t += dt; s.draw(ctx, s.t); } };
    s.size();
    new ResizeObserver(() => s.size()).observe(el);
    if (!still) view.observe(el);
    live.add(s);
  };

  const view = new IntersectionObserver((entries) => {
    entries.forEach(e => { for (const s of live) if (s.el === e.target) s.on = e.isIntersecting; });
  }, { rootMargin: "100px" });

  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(50, now - last); last = now;
    if (!document.hidden) for (const s of live) if (s.on) s.frame(dt);
    requestAnimationFrame(tick);
  };

  document.querySelectorAll("[data-scene]").forEach(mount);
  if (!still) requestAnimationFrame(tick);
})();
