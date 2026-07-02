/* =========================================================
   Riley Reese — Professional Persona Portfolio
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     ANALYSIS_DATA — sourced from Riley's Radian assessments
     -------------------------------------------------------
     SPI = Self-Perception Inventory (identity, self)
     PRS = Professional Reputation Survey, n=6 (reputation, others)
     Edit these numbers if your Radian results change; the
     charts redraw automatically. "navy" = self/identity,
     "gold" = others/reputation.
     ======================================================= */
  const ANALYSIS_DATA = {
    // Overview — Social Styles quadrant (axes −9 … +9)
    quadrant: {
      axisMax: 9,
      xLabel: "Proactivity",
      yLabel: "Reactivity",
      quadrants: { tr: "Expressive", tl: "Amiable", bl: "Analytical", br: "Driver" },
      points: [
        { name: "Identity (self · SPI)", color: "navy", x: 2.0, y: -3.0 },
        { name: "Reputation (others · PRS)", color: "gold", x: 4.8, y: 0.5 }
      ]
    },
    // Communication composites — self vs others (supports negatives)
    comm: {
      categories: ["Proactivity", "Reactivity"],
      min: -4, max: 6, steps: 5,
      series: [
        { name: "Identity (self · SPI)", color: "navy", values: [2.0, -3.0] },
        { name: "Reputation (others · PRS)", color: "gold", values: [4.8, 0.5] }
      ]
    },
    // Work Environment Preferences — SPI self-report (0 … 4)
    values: {
      categories: ["Debate", "Hierarchy", "Relations", "Feedback", "Chronemics", "Context", "Decisions", "Conflict"],
      max: 4, steps: 4,
      series: [
        { name: "My preference (0 to 4)", color: "navy", values: [2.67, 2.67, 2.67, 2.0, 1.67, 1.33, 1.33, 1.0] }
      ]
    },
    // Reputation adjectives — law-relevant selection from the 8 PRS reviewers
    // (diligence, analytical competence, composure, advocacy presence);
    // gold = I also chose it on my SPI (identity↔reputation overlap)
    growth: {
      categories: ["Hard-Working", "Social", "Self-Confident", "Problem-Solver", "Good w/ #s", "Even-Tempered"],
      max: 8, steps: 4, padB: 64, pctOfMax: true,
      series: [
        { name: "Reviewers (of 8)", color: "navy",
          values: [7, 7, 5, 6, 5, 5],
          barColors: ["navy", "gold", "gold", "navy", "navy", "navy"] }
      ],
      legendOverride: [
        { name: "Also how I describe myself", color: "gold" },
        { name: "Reviewers only", color: "navy" }
      ]
    }
  };

  const COLORS = { navy: "#003366", gold: "#B8860B", gray: "#9a958c", charcoal: "#4F4F4F" };
  const GRID = "#e6e1d6";
  const SVGNS = "http://www.w3.org/2000/svg";

  function svg(tag, attrs) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  const color = (c) => COLORS[c] || c;

  /* ---- Legend (HTML) ---- */
  function renderLegend(id, series) {
    const box = document.getElementById(id);
    if (!box) return;
    box.innerHTML = "";
    series.forEach((s) => {
      const item = document.createElement("span");
      item.className = "legend__item";
      const sw = document.createElement("span");
      sw.className = "legend__swatch";
      sw.style.background = color(s.color);
      item.appendChild(sw);
      item.appendChild(document.createTextNode(s.name));
      box.appendChild(item);
    });
  }

  const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

  /* ---- Grouped vertical bar chart (supports negatives + per-bar colors) ---- */
  function renderBars(mountId, legendId, cfg) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const W = 600, H = 320, padL = 42, padR = 16, padT = 22, padB = cfg.padB || 50;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const min = cfg.min || 0, max = cfg.max, range = max - min;
    const steps = cfg.steps || 5;
    const yOf = (v) => padT + plotH - ((v - min) / range) * plotH;
    const zeroY = yOf(Math.max(min, 0));
    const root = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "chart-svg", preserveAspectRatio: "xMidYMid meet" });

    // y gridlines + labels
    for (let i = 0; i <= steps; i++) {
      const val = min + (range * i) / steps;
      const y = yOf(val);
      root.appendChild(svg("line", { x1: padL, y1: y, x2: W - padR, y2: y, stroke: GRID, "stroke-width": 1 }));
      const t = svg("text", { x: padL - 8, y: y + 4, "text-anchor": "end", "font-size": 10, fill: COLORS.charcoal, opacity: 0.7 });
      t.textContent = fmt(val);
      root.appendChild(t);
    }

    const n = cfg.categories.length;
    const nb = cfg.series.length;
    const groupW = plotW / n;
    const innerPad = groupW * 0.2;
    const barGap = 6;
    const barsW = groupW - innerPad * 2;
    const barW = (barsW - (nb - 1) * barGap) / nb;

    cfg.categories.forEach((cat, g) => {
      const gx = padL + g * groupW + innerPad;
      cfg.series.forEach((s, si) => {
        const v = s.values[g];
        const yv = yOf(v);
        const top = Math.min(yv, zeroY);
        const h = Math.abs(yv - zeroY);
        const x = gx + si * (barW + barGap);
        const c = (s.barColors && s.barColors[g]) ? color(s.barColors[g]) : color(s.color);
        root.appendChild(svg("rect", { x: x, y: top, width: Math.max(barW, 1), height: Math.max(h, 0.5), rx: 2, fill: c }));
        if (barW > 13) {
          const above = v >= 0;
          const lbl = svg("text", { x: x + barW / 2, y: above ? top - 5 : top + h + 12, "text-anchor": "middle", "font-size": 10, fill: COLORS.charcoal, "font-weight": 600 });
          lbl.textContent = fmt(v);
          root.appendChild(lbl);
        }
      });
      const catLbl = svg("text", { x: padL + g * groupW + groupW / 2, y: H - padB + 20, "text-anchor": "middle", "font-size": 10.5, fill: COLORS.charcoal });
      catLbl.textContent = cat;
      root.appendChild(catLbl);
      // optional: percentage of the max (e.g. 7 of 8 = 88%) under each category
      if (cfg.pctOfMax) {
        const base = cfg.pctBase || cfg.max;
        const pct = Math.round((cfg.series[0].values[g] / base) * 100);
        const pctLbl = svg("text", { x: padL + g * groupW + groupW / 2, y: H - padB + 36, "text-anchor": "middle", "font-size": 11, fill: COLORS.gold, "font-weight": 700 });
        pctLbl.textContent = pct + "%";
        root.appendChild(pctLbl);
      }
    });

    // zero baseline
    root.appendChild(svg("line", { x1: padL, y1: zeroY, x2: W - padR, y2: zeroY, stroke: COLORS.charcoal, "stroke-width": 1.2, opacity: 0.55 }));

    mount.innerHTML = "";
    mount.appendChild(root);
    renderLegend(legendId, cfg.legendOverride || cfg.series);
  }

  /* ---- Social Styles quadrant (scatter, axes −max … +max) ---- */
  function renderQuadrant(mountId, legendId, cfg) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    const W = 460, H = 400, padL = 30, padR = 22, padT = 26, padB = 30;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const m = cfg.axisMax;
    const cx0 = padL + plotW / 2, cy0 = padT + plotH / 2;
    const xOf = (x) => cx0 + (x / m) * (plotW / 2);
    const yOf = (y) => cy0 - (y / m) * (plotH / 2);
    const root = svg("svg", { viewBox: "0 0 " + W + " " + H, class: "chart-svg", preserveAspectRatio: "xMidYMid meet" });

    // outer box
    root.appendChild(svg("rect", { x: padL, y: padT, width: plotW, height: plotH, fill: "none", stroke: GRID, "stroke-width": 1 }));
    // light gridlines every 3 units
    for (let v = -m + 3; v < m; v += 3) {
      if (v === 0) continue;
      root.appendChild(svg("line", { x1: xOf(v), y1: padT, x2: xOf(v), y2: padT + plotH, stroke: "#f1ede3", "stroke-width": 1 }));
      root.appendChild(svg("line", { x1: padL, y1: yOf(v), x2: padL + plotW, y2: yOf(v), stroke: "#f1ede3", "stroke-width": 1 }));
    }
    // quadrant labels
    const ql = cfg.quadrants;
    function qlabel(txt, x, y, anchor) {
      const t = svg("text", { x: x, y: y, "text-anchor": anchor, "font-size": 12, fill: COLORS.gold, "font-weight": 700, "letter-spacing": "0.04em" });
      t.textContent = txt; root.appendChild(t);
    }
    qlabel(ql.tr, padL + plotW - 8, padT + 17, "end");
    qlabel(ql.tl, padL + 8, padT + 17, "start");
    qlabel(ql.bl, padL + 8, padT + plotH - 9, "start");
    qlabel(ql.br, padL + plotW - 8, padT + plotH - 9, "end");
    // center axes
    root.appendChild(svg("line", { x1: padL, y1: cy0, x2: padL + plotW, y2: cy0, stroke: COLORS.charcoal, "stroke-width": 1.2, opacity: 0.5 }));
    root.appendChild(svg("line", { x1: cx0, y1: padT, x2: cx0, y2: padT + plotH, stroke: COLORS.charcoal, "stroke-width": 1.2, opacity: 0.5 }));
    // axis hints
    const xt = svg("text", { x: padL + plotW - 4, y: cy0 + 14, "text-anchor": "end", "font-size": 9.5, fill: COLORS.charcoal, opacity: 0.6 });
    xt.textContent = cfg.xLabel + " →"; root.appendChild(xt);
    const yt = svg("text", { x: cx0 + 6, y: padT + 11, "text-anchor": "start", "font-size": 9.5, fill: COLORS.charcoal, opacity: 0.6 });
    yt.textContent = "↑ " + cfg.yLabel; root.appendChild(yt);
    // points
    cfg.points.forEach((p) => {
      root.appendChild(svg("circle", { cx: xOf(p.x), cy: yOf(p.y), r: 7, fill: color(p.color), stroke: "#fff", "stroke-width": 2 }));
    });

    mount.innerHTML = "";
    mount.appendChild(root);
    renderLegend(legendId, cfg.points);
  }

  function renderCharts() {
    renderQuadrant("chart-radar", "legend-radar", ANALYSIS_DATA.quadrant);
    renderBars("chart-comm", "legend-comm", ANALYSIS_DATA.comm);
    renderBars("chart-values", "legend-values", ANALYSIS_DATA.values);
    renderBars("chart-growth", "legend-growth", ANALYSIS_DATA.growth);
  }

  /* =======================================================
     UI: nav, reveal, contact form, year
     ======================================================= */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    links.classList.remove("open");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("active", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* Scroll reveal */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || (i % 3) * 90;
          setTimeout(() => entry.target.classList.add("visible"), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* Contact form -> compose email (no data leaves the page) */
  const form = document.getElementById("contactForm");
  if (form) {
    const note = document.getElementById("cfNote");
    const defaultNote = note ? note.textContent : "";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) {
        if (note) { note.textContent = "Please fill in your name, email, and a message."; note.classList.add("error"); }
        return;
      }
      if (note) { note.textContent = defaultNote; note.classList.remove("error"); }
      const subject = encodeURIComponent("Portfolio inquiry from " + name);
      const body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:rileyr1@arizona.edu?subject=" + subject + "&body=" + body;
    });
  }

  /* Footer year */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* Draw charts */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderCharts);
  } else {
    renderCharts();
  }
})();
