/*
  Bala Hariharan · portfolio
  1. Chart data (the only numbers drawn; they match the project outputs and the resume)
  2. SVG charts
  3. Hero canvas: the signal and the 1,878-star galaxy
  4. Recruiter view, navigation menu, copy email
*/
"use strict";

/* ========================================================================
   1. Chart data
   ======================================================================== */
const DELAY_BUCKETS = [
  { label: ["Early"], review: 4.29, orders: 88379, late: false },
  { label: ["On time"], review: 4.03, orders: 1291, late: false },
  { label: ["1-3 days", "late"], compactLabel: ["1-3", "days", "late"], review: 3.29, orders: 1869, late: true },
  { label: ["4-7 days", "late"], compactLabel: ["4-7", "days", "late"], review: 2.10, orders: 1802, late: true },
  { label: ["7+ days", "late"], compactLabel: ["7+", "days", "late"], review: 1.70, orders: 2860, late: true },
];

const RFM_SEGMENTS = [
  { name: "Loyal (3+ orders)", customersPct: 0.25, revenuePct: 0.74 },
  { name: "Repeat – active", customersPct: 1.78, revenuePct: 3.12 },
  { name: "Repeat – lapsing", customersPct: 1.00, revenuePct: 1.70 },
  { name: "New – high value", customersPct: 15.56, revenuePct: 29.40, highlight: true },
  { name: "New – standard", customersPct: 23.35, revenuePct: 9.16 },
  { name: "One-time – cooling", customersPct: 19.42, revenuePct: 17.82 },
  { name: "Lost – high value", customersPct: 14.56, revenuePct: 28.58 },
  { name: "Lost – low value", customersPct: 24.08, revenuePct: 9.49 },
];

const OVERALL_LATE_PCT = 6.79;
const DISTANCE_BANDS = [
  { label: ["0-100"], latePct: 4.49 },
  { label: ["100-", "300"], latePct: 5.20 },
  { label: ["300-", "600"], latePct: 6.77 },
  { label: ["600-", "1,000"], latePct: 7.09 },
  { label: ["1,000-", "1,500"], latePct: 8.81 },
  { label: ["1,500+"], latePct: 11.64 },
];

const SKILL_SHARES = [
  { skill: "SQL", sharePct: 8.7, emphasis: true },
  { skill: "Python", sharePct: 5.2, emphasis: false },
];

const JOB_POSTINGS = 1878;     // stars in the galaxy
const OLIST_ORDERS = 99441;    // planet sizes are proportional to sqrt(record count)

/* ========================================================================
   2. SVG charts
   ======================================================================== */
const SVG_NS = "http://www.w3.org/2000/svg";

function svgElement(tagName, attributes, textContent) {
  const element = document.createElementNS(SVG_NS, tagName);
  for (const [name, value] of Object.entries(attributes || {})) element.setAttribute(name, value);
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}

function createSvg(width, height, ariaLabel) {
  return svgElement("svg", {
    width, height,
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-label": ariaLabel,
  });
}

/* A bar with rounded data-end (top) and a square base */
function columnPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height);
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
}

/* A horizontal bar with rounded data-end (right) */
function rowPath(x, y, width, height, radius) {
  const r = Math.min(radius, height / 2, width);
  return `M${x},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height - r} Q${x + width},${y + height} ${x + width - r},${y + height} H${x} Z`;
}

function addTitle(element, text) {
  element.appendChild(svgElement("title", {}, text));
  return element;
}

const formatCount = (value) => value.toLocaleString("en-IN");
const formatPct = (value) => `${value.toFixed(2)}%`;

/* Vertical bar chart with one scale, gridlines, value labels and multi-line category labels */
function drawColumnChart(container, width, options) {
  const { items, maxValue, ticks, valueOf, valueLabel, classOf, titleOf, notesOf, referenceValue, referenceLabel, ariaLabel, axisTitle } = options;
  // Narrow bars (phones) use the compact, more-lines label where one exists, so labels never touch
  const compact = (width - 42) / items.length < 72;
  const labelOf = (item) => (compact && item.compactLabel ? item.compactLabel : item.label);
  const labelLines = Math.max(...items.map((item) => labelOf(item).length)) + (notesOf ? 1 : 0);
  const margin = { top: 26, right: 8, bottom: 16 + labelLines * 14 + (axisTitle ? 18 : 0), left: 34 };
  const height = 300;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const yOf = (value) => margin.top + plotHeight * (1 - value / maxValue);
  const svg = createSvg(width, height, ariaLabel);

  for (const tick of ticks) {
    svg.appendChild(svgElement("line", { class: "grid-line", x1: margin.left, x2: width - margin.right, y1: yOf(tick), y2: yOf(tick) }));
    svg.appendChild(svgElement("text", { class: "axis-text", x: margin.left - 8, y: yOf(tick) + 4, "text-anchor": "end" }, String(tick)));
  }

  const band = plotWidth / items.length;
  const barWidth = Math.min(band * 0.58, 64);
  items.forEach((item, index) => {
    const value = valueOf(item);
    const centre = margin.left + band * index + band / 2;
    const top = yOf(value);
    const bar = svgElement("path", { class: classOf(item), d: columnPath(centre - barWidth / 2, top, barWidth, margin.top + plotHeight - top, 4) });
    svg.appendChild(addTitle(bar, titleOf(item)));
    svg.appendChild(svgElement("text", { class: "value-text", x: centre, y: top - 7, "text-anchor": "middle" }, valueLabel(item)));
    labelOf(item).forEach((line, lineIndex) => {
      svg.appendChild(svgElement("text", { class: "category-text", x: centre, y: margin.top + plotHeight + 18 + lineIndex * 14, "text-anchor": "middle" }, line));
    });
    if (notesOf) {
      svg.appendChild(svgElement("text", { class: "axis-text", x: centre, y: margin.top + plotHeight + 18 + (labelLines - 1) * 14, "text-anchor": "middle" }, notesOf(item)));
    }
  });

  if (referenceValue !== undefined) {
    const y = yOf(referenceValue);
    svg.appendChild(svgElement("line", { class: "reference-line", x1: margin.left, x2: width - margin.right, y1: y, y2: y }));
    // Key for the dashed line, top-left of the plot where the (short) first bars leave room
    const keyY = margin.top + 16;
    svg.appendChild(svgElement("line", { class: "reference-line", x1: margin.left + 6, x2: margin.left + 26, y1: keyY - 4, y2: keyY - 4 }));
    svg.appendChild(svgElement("text", { class: "axis-text", x: margin.left + 32, y: keyY }, referenceLabel));
  }
  if (axisTitle) {
    svg.appendChild(svgElement("text", { class: "axis-text", x: margin.left + plotWidth / 2, y: height - 4, "text-anchor": "middle" }, axisTitle));
  }
  container.replaceChildren(svg);
}

function renderDelayChart(container, width) {
  drawColumnChart(container, width, {
    items: DELAY_BUCKETS,
    maxValue: 5,
    ticks: [0, 1, 2, 3, 4, 5],
    valueOf: (bucket) => bucket.review,
    valueLabel: (bucket) => bucket.review.toFixed(2),
    classOf: (bucket) => (bucket.late ? "bar-amber" : "bar-signal"),
    titleOf: (bucket) => `${bucket.label.join(" ")}: average review ${bucket.review.toFixed(2)} from ${formatCount(bucket.orders)} orders`,
    notesOf: (bucket) => formatCount(bucket.orders),
    ariaLabel: "Bar chart, average review score (0 to 5) by delivery delay: early 4.29, on time 4.03, 1 to 3 days late 3.29, 4 to 7 days late 2.10, 7 or more days late 1.70.",
  });
}

function renderDistanceChart(container, width) {
  drawColumnChart(container, width, {
    items: DISTANCE_BANDS,
    maxValue: 12,
    ticks: [0, 4, 8, 12],
    valueOf: (band) => band.latePct,
    valueLabel: (band) => formatPct(band.latePct),
    classOf: (band) => (band.latePct > OVERALL_LATE_PCT ? "bar-amber" : "bar-signal"),
    titleOf: (band) => `${band.label.join("")} km: ${formatPct(band.latePct)} of orders late`,
    referenceValue: OVERALL_LATE_PCT,
    referenceLabel: `${formatPct(OVERALL_LATE_PCT)} overall`,
    axisTitle: "Distance from seller to customer (km)",
    ariaLabel: "Bar chart, late orders percentage by distance: 0 to 100 km 4.49%, 100 to 300 km 5.20%, 300 to 600 km 6.77%, 600 to 1,000 km 7.09%, 1,000 to 1,500 km 8.81%, over 1,500 km 11.64%. Overall 6.79%.",
  });
}

/* Paired horizontal bars, customers % vs revenue %, on one shared 0-30% scale */
function renderSegmentChart(container, width) {
  const wide = width >= 560;
  const labelWidth = wide ? 150 : 0;
  const barHeight = 11;   // 11 + 4 gap = 15 px between the pair's value labels (an 11 px label is ~14 px tall)
  const pairGap = 4;
  const rowGap = wide ? 16 : 14;
  const labelHeight = wide ? 0 : 18;
  const rowHeight = labelHeight + barHeight * 2 + pairGap + rowGap;
  const margin = { top: 8, right: 54, bottom: 26, left: labelWidth + 4 };
  const height = margin.top + rowHeight * RFM_SEGMENTS.length + margin.bottom - rowGap;
  const plotWidth = width - margin.left - margin.right;
  const maxValue = 30;
  const xOf = (value) => margin.left + plotWidth * (value / maxValue);
  const svg = createSvg(width, height, "Paired bar chart, share of customers vs share of revenue by RFM segment. New – high value: 15.56% of customers, 29.40% of revenue.");

  const plotBottom = height - margin.bottom;
  for (const tick of [0, 10, 20, 30]) {
    svg.appendChild(svgElement("line", { class: "grid-line", x1: xOf(tick), x2: xOf(tick), y1: margin.top, y2: plotBottom }));
    svg.appendChild(svgElement("text", { class: "axis-text", x: xOf(tick), y: plotBottom + 16, "text-anchor": tick === 0 ? "start" : "middle" }, `${tick}%`));
  }

  RFM_SEGMENTS.forEach((segment, index) => {
    const rowTop = margin.top + index * rowHeight;
    const barsTop = rowTop + labelHeight;
    if (segment.highlight) {
      svg.appendChild(svgElement("rect", { class: "highlight-band", x: 0, y: rowTop - rowGap / 2 + 2, width, height: rowHeight - 4, rx: 6 }));
      svg.appendChild(svgElement("rect", { class: "highlight-mark", x: 0, y: rowTop - rowGap / 2 + 2, width: 2, height: rowHeight - 4 }));
    }
    const labelClass = segment.highlight ? "category-text is-highlight" : "category-text";
    if (wide) {
      svg.appendChild(svgElement("text", { class: labelClass, x: 10, y: barsTop + barHeight + 4 }, segment.name));
    } else {
      svg.appendChild(svgElement("text", { class: labelClass, x: 10, y: rowTop + 12 }, segment.name));
    }
    const series = [
      { value: segment.customersPct, className: "bar-muted", noun: "customers", top: barsTop },
      { value: segment.revenuePct, className: "bar-signal", noun: "revenue", top: barsTop + barHeight + pairGap },
    ];
    for (const bar of series) {
      const barWidth = Math.max(xOf(bar.value) - margin.left, 1);
      const path = svgElement("path", { class: bar.className, d: rowPath(margin.left, bar.top, barWidth, barHeight, 3) });
      svg.appendChild(addTitle(path, `${segment.name}: ${formatPct(bar.value)} of ${bar.noun}`));
      svg.appendChild(svgElement("text", { class: "axis-text", x: margin.left + barWidth + 6, y: bar.top + barHeight - 1 }, formatPct(bar.value)));
    }
  });
  container.replaceChildren(svg);
}

/* Two horizontal bars: SQL vs Python share of postings */
function renderSkillChart(container, width) {
  const margin = { top: 8, right: 52, bottom: 26, left: 64 };
  const barHeight = 22;
  const rowGap = 14;
  const height = margin.top + SKILL_SHARES.length * (barHeight + rowGap) - rowGap + margin.bottom;
  const plotWidth = width - margin.left - margin.right;
  const maxValue = 10;
  const xOf = (value) => margin.left + plotWidth * (value / maxValue);
  const svg = createSvg(width, height, "Bar chart, share of postings asking for the skill: SQL 8.7%, Python 5.2%.");
  const plotBottom = height - margin.bottom;
  for (const tick of [0, 5, 10]) {
    svg.appendChild(svgElement("line", { class: "grid-line", x1: xOf(tick), x2: xOf(tick), y1: margin.top, y2: plotBottom }));
    svg.appendChild(svgElement("text", { class: "axis-text", x: xOf(tick), y: plotBottom + 16, "text-anchor": tick === 0 ? "start" : "middle" }, `${tick}%`));
  }
  SKILL_SHARES.forEach((item, index) => {
    const top = margin.top + index * (barHeight + rowGap);
    const barWidth = xOf(item.sharePct) - margin.left;
    svg.appendChild(svgElement("text", { class: item.emphasis ? "category-text is-highlight" : "category-text", x: margin.left - 10, y: top + barHeight / 2 + 4, "text-anchor": "end" }, item.skill));
    const path = svgElement("path", { class: item.emphasis ? "bar-signal" : "bar-muted", d: rowPath(margin.left, top, barWidth, barHeight, 4) });
    svg.appendChild(addTitle(path, `${item.skill}: ${item.sharePct.toFixed(1)}% of postings`));
    svg.appendChild(svgElement("text", { class: "value-text", x: margin.left + barWidth + 6, y: top + barHeight / 2 + 4 }, `${item.sharePct.toFixed(1)}%`));
  });
  container.replaceChildren(svg);
}

const CHART_RENDERERS = {
  delay: renderDelayChart,
  segments: renderSegmentChart,
  distance: renderDistanceChart,
  skills: renderSkillChart,
};

function initCharts() {
  const containers = document.querySelectorAll("[data-chart]");
  const lastWidths = new WeakMap();
  const render = (container) => {
    const width = Math.floor(container.clientWidth);
    if (width < 120 || lastWidths.get(container) === width) return;
    lastWidths.set(container, width);
    CHART_RENDERERS[container.dataset.chart](container, width);
  };
  containers.forEach(render);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver((entries) => entries.forEach((entry) => render(entry.target)));
    containers.forEach((container) => observer.observe(container));
  }
}

/* ========================================================================
   3. Hero canvas
   Timeline (seconds): 0-0.6 faint stars · 0.6-1.4 signal, beam, rings ·
   1.4-3.6 1,878 stars stream out and settle · 3.6-4.5 orbits and planets
   ======================================================================== */
const TIMELINE = {
  starsIn: [0, 0.6],
  signalIn: [0.6, 1.4],
  ringStarts: [0.9, 1.35],
  ringDuration: 1.7,
  streamFirst: 1.4,
  streamSpread: 1.1,
  streamDuration: 1.1,
  planetsIn: [3.6, 4.5],
  end: 4.5,
};
const GALAXY_SPIN = 0.03;        // radians per second, a slow rotation
const DISC_TILT = 0.42;          // vertical squash of the disc and orbits
const STORAGE_KEY = "bh-signal-played";
const COLOURS = { ink: "230,236,245", signal: "125,226,238", amber: "240,179,91", line: "30,44,69" };

/* Seeded random numbers: the same galaxy on every load and in every screenshot */
function seededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const progressBetween = (time, [start, end]) => clamp01((time - start) / (end - start));
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const easeInOutSine = (value) => -(Math.cos(Math.PI * value) - 1) / 2;

function buildGalaxyStars(count, random) {
  const stars = [];
  for (let index = 0; index < count; index += 1) {
    const inArm = random() < 0.8;
    const distance = inArm ? 0.07 + 0.93 * Math.pow(random(), 0.85) : Math.pow(random(), 0.55);
    const arm = index % 2;
    const spread = (random() + random() + random() - 1.5) * (inArm ? 0.5 : 3.2);
    const angle = inArm ? arm * Math.PI + distance * 3.4 + spread * (1 - distance * 0.4) : random() * Math.PI * 2;
    const colourRoll = random();
    stars.push({
      distance,
      angle,
      size: 0.6 + random() * (inArm ? 1.1 : 0.7),
      alpha: 0.3 + random() * 0.6,
      colour: colourRoll < 0.72 ? COLOURS.ink : colourRoll < 0.93 ? COLOURS.signal : COLOURS.amber,
      start: TIMELINE.streamFirst + distance * 0.75 + random() * (TIMELINE.streamSpread - 0.75),
      swirl: 1.4 + random() * 0.8,
    });
  }
  return stars;
}

function buildBackgroundStars(count, random) {
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    size: 0.4 + random() * 0.9,
    alpha: 0.12 + random() * 0.4,
  }));
}

function initHero() {
  const hero = document.querySelector(".hero");
  const canvas = hero && hero.querySelector(".hero-canvas");
  const context = canvas && canvas.getContext("2d");
  if (!context) return;

  const anchor = hero.querySelector(".hero-anchor");
  const planetLayer = hero.querySelector(".planet-layer");
  const replayButton = hero.querySelector(".replay-button");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  const random = seededRandom(1308);
  const galaxyStars = buildGalaxyStars(JOB_POSTINGS, random);
  let backgroundStars = [];

  const planets = [
    { key: "olist", records: OLIST_ORDERS, orbitScale: 1.22, phase: 0.55, speed: 0.010, tint: COLOURS.amber },
    { key: "jobs", records: JOB_POSTINGS, orbitScale: 1.5, phase: 3.75, speed: 0.008, tint: COLOURS.signal },
  ].map((planet) => ({ ...planet, link: planetLayer.querySelector(`[data-planet="${planet.key}"]`), x: 0, y: 0 }));

  const geometry = { width: 0, height: 0, pixelRatio: 1, centreX: 0, centreY: 0, radius: 0, olistPlanetRadius: 0, quietZones: [] };
  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let clock = 0;            // seconds on the animation timeline
  let planetClock = 0;      // separate clock so planets can hold still while hovered or focused
  let planetsHeld = false;
  let heroVisible = true;
  let frameId = null;
  let lastFrameTime = null;

  function readPlayed() {
    try { return window.sessionStorage.getItem(STORAGE_KEY) === "1"; } catch (error) { return false; }
  }
  function writePlayed(value) {
    try {
      if (value) window.sessionStorage.setItem(STORAGE_KEY, "1");
      else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) { /* storage blocked: the intro simply plays again next time */ }
  }

  function resize() {
    const heroBox = hero.getBoundingClientRect();
    const anchorBox = anchor.getBoundingClientRect();
    geometry.width = Math.max(1, Math.round(heroBox.width));
    geometry.height = Math.max(1, Math.round(heroBox.height));
    geometry.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(geometry.width * geometry.pixelRatio);
    canvas.height = Math.round(geometry.height * geometry.pixelRatio);
    context.setTransform(geometry.pixelRatio, 0, 0, geometry.pixelRatio, 0, 0);

    const desktop = geometry.width >= 1080;   // same breakpoint as the side-by-side layout in styles.css
    const anchorTop = anchorBox.top - heroBox.top;
    if (desktop) {
      // Place the galaxy in the space between the right edge of the actual text and the right edge of the hero,
      // so the outer orbit (1.5 x radius) and its planet links never reach the name
      const textRight = Math.max(...[...hero.querySelectorAll(".hero-name span, .hero-line, .hero-actions, .stat-strip, .eyebrow")]
        .map((element) => element.getBoundingClientRect().right - heroBox.left));
      const spaceLeft = textRight + 72;
      const spaceRight = geometry.width - 48;
      geometry.centreX = (spaceLeft + spaceRight) / 2;
      geometry.centreY = geometry.height * 0.47;
      geometry.radius = Math.max(60, Math.min((spaceRight - spaceLeft) / 3, geometry.height * 0.42, 260));
    } else {
      geometry.centreX = geometry.width / 2;
      geometry.centreY = anchorTop + Math.max(anchorBox.height, 260) * 0.5;
      geometry.radius = Math.min(geometry.width * 0.3, 150);
    }
    geometry.olistPlanetRadius = Math.max(12, Math.min(26, geometry.radius * 0.11));

    // Quiet zones: no stars, beam or rings are drawn directly behind the text, so it keeps full contrast
    geometry.quietZones = [...hero.querySelectorAll(".hero-text, .hero-foot > *")].map((element) => {
      const box = element.getBoundingClientRect();
      const padding = 10;
      return { x: box.left - heroBox.left - padding, y: box.top - heroBox.top - padding, width: box.width + padding * 2, height: box.height + padding * 2 };
    });

    const backgroundCount = Math.round(Math.min(260, (geometry.width * geometry.height) / 7000));
    backgroundStars = buildBackgroundStars(backgroundCount, seededRandom(8027));
    draw();
  }

  function planetRadius(planet) {
    // Area-true sizing: radius proportional to sqrt(records), Olist is the reference
    return geometry.olistPlanetRadius * Math.sqrt(planet.records / OLIST_ORDERS);
  }

  function draw() {
    const { width, height, centreX, centreY, radius } = geometry;
    context.clearRect(0, 0, width, height);
    const time = clock;
    const shiftX = parallax.x;
    const shiftY = parallax.y;

    // Everything except the planets is clipped out of the quiet zones (even-odd: the zones are holes)
    context.save();
    context.beginPath();
    context.rect(0, 0, width, height);
    for (const zone of geometry.quietZones) context.rect(zone.x, zone.y, zone.width, zone.height);
    context.clip("evenodd");

    // 1. Sparse faint background stars
    const starsAlpha = easeInOutSine(progressBetween(time, TIMELINE.starsIn));
    for (const star of backgroundStars) {
      context.fillStyle = `rgba(${COLOURS.ink},${star.alpha * starsAlpha})`;
      context.fillRect(star.x * width + shiftX * 0.4, star.y * height + shiftY * 0.4, star.size, star.size);
    }

    const signalX = centreX + shiftX;
    const signalY = centreY + shiftY;
    const signalProgress = easeOutCubic(progressBetween(time, TIMELINE.signalIn));

    // 2. One thin vertical beam: drawn in, then fades to a faint trace
    if (signalProgress > 0) {
      const beamFade = 1 - 0.8 * progressBetween(time, [2.2, 3.6]);
      const beamTop = signalY - signalY * signalProgress;
      const beam = context.createLinearGradient(0, signalY, 0, Math.max(beamTop, 0));
      beam.addColorStop(0, `rgba(${COLOURS.signal},${0.55 * beamFade})`);
      beam.addColorStop(1, `rgba(${COLOURS.signal},0)`);
      context.strokeStyle = beam;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(signalX + 0.5, signalY);
      context.lineTo(signalX + 0.5, beamTop);
      context.stroke();
    }

    // 2b. Two subtle expanding rings
    for (const ringStart of TIMELINE.ringStarts) {
      const ringProgress = progressBetween(time, [ringStart, ringStart + TIMELINE.ringDuration]);
      if (ringProgress <= 0 || ringProgress >= 1) continue;
      context.strokeStyle = `rgba(${COLOURS.signal},${0.35 * (1 - ringProgress)})`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(signalX, signalY, easeOutCubic(ringProgress) * radius * 0.9, 0, Math.PI * 2);
      context.stroke();
    }

    // 4a. Faint orbit ellipses (drawn under the stars)
    const planetsAlpha = easeInOutSine(progressBetween(time, TIMELINE.planetsIn));
    if (planetsAlpha > 0) {
      context.strokeStyle = `rgba(${COLOURS.line},${0.9 * planetsAlpha})`;
      context.lineWidth = 1;
      for (const planet of planets) {
        context.beginPath();
        context.ellipse(signalX, signalY, radius * planet.orbitScale, radius * planet.orbitScale * DISC_TILT, 0, 0, Math.PI * 2);
        context.stroke();
      }
    }

    // 3. The 1,878 stars stream out of the signal and settle into a rotating disc
    const rotation = GALAXY_SPIN * Math.max(0, time - TIMELINE.streamFirst);
    for (const star of galaxyStars) {
      const travel = clamp01((time - star.start) / TIMELINE.streamDuration);
      if (travel <= 0) continue;
      const eased = easeOutCubic(travel);
      const distance = star.distance * radius * eased;
      const angle = star.angle + rotation - (1 - eased) * star.swirl;
      const x = signalX + Math.cos(angle) * distance;
      const y = signalY + Math.sin(angle) * distance * DISC_TILT;
      context.fillStyle = `rgba(${star.colour},${star.alpha * (0.35 + 0.65 * eased)})`;
      context.fillRect(x - star.size / 2, y - star.size / 2, star.size, star.size);
    }

    // 2c. The signal point stays as the bright core
    if (signalProgress > 0) {
      const glowRadius = 22 + 10 * signalProgress;
      const glow = context.createRadialGradient(signalX, signalY, 0, signalX, signalY, glowRadius);
      glow.addColorStop(0, `rgba(${COLOURS.signal},${0.45 * signalProgress})`);
      glow.addColorStop(1, `rgba(${COLOURS.signal},0)`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(signalX, signalY, glowRadius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(${COLOURS.ink},${signalProgress})`;
      context.beginPath();
      context.arc(signalX, signalY, 2.2, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();

    // 4b. Project planets, radius proportional to sqrt(record count)
    for (const planet of planets) {
      const orbitAngle = planet.phase + planet.speed * planetClock;
      planet.x = signalX + Math.cos(orbitAngle) * radius * planet.orbitScale;
      planet.y = signalY + Math.sin(orbitAngle) * radius * planet.orbitScale * DISC_TILT;
      if (planetsAlpha <= 0) continue;
      const planetSize = planetRadius(planet);
      const shade = context.createRadialGradient(
        planet.x - planetSize * 0.35, planet.y - planetSize * 0.35, planetSize * 0.1,
        planet.x, planet.y, planetSize,
      );
      shade.addColorStop(0, `rgba(${planet.tint},${planetsAlpha})`);
      shade.addColorStop(1, `rgba(${COLOURS.line},${planetsAlpha})`);
      context.fillStyle = shade;
      context.beginPath();
      context.arc(planet.x, planet.y, Math.max(planetSize, 1.5), 0, Math.PI * 2);
      context.fill();
    }
    positionPlanetLinks(planetsAlpha);
  }

  function positionPlanetLinks(planetsAlpha) {
    for (const planet of planets) {
      const link = planet.link;
      if (!link) continue;
      const labelOnLeft = planet.x + 22 + link.offsetWidth - 44 > geometry.width - 12;
      link.classList.toggle("label-left", labelOnLeft);
      const offsetX = labelOnLeft ? link.offsetWidth - 22 : 22;
      link.style.transform = `translate(${Math.round(planet.x - offsetX)}px, ${Math.round(planet.y - 22)}px)`;
      const focused = link === document.activeElement;
      link.style.opacity = focused ? "1" : String(planetsAlpha);
      link.style.visibility = planetsAlpha > 0 || focused ? "visible" : "hidden";
    }
  }

  function frame(now) {
    if (lastFrameTime === null) lastFrameTime = now;
    const elapsed = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;
    const wasPlaying = clock < TIMELINE.end;
    clock += elapsed;
    if (!planetsHeld) planetClock += elapsed;
    if (wasPlaying && clock >= TIMELINE.end) writePlayed(true);
    parallax.x += (parallax.targetX - parallax.x) * 0.05;
    parallax.y += (parallax.targetY - parallax.y) * 0.05;
    draw();
    frameId = window.requestAnimationFrame(frame);
  }

  function updateRunning() {
    const shouldRun = heroVisible && !document.hidden && !reducedMotion.matches;
    if (shouldRun && frameId === null) {
      lastFrameTime = null;
      frameId = window.requestAnimationFrame(frame);
    } else if (!shouldRun && frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function showFinalState() {
    clock = TIMELINE.end;
    draw();
  }

  function applyMotionPreference() {
    replayButton.hidden = reducedMotion.matches;
    if (reducedMotion.matches) {
      parallax.x = parallax.y = parallax.targetX = parallax.targetY = 0;
      showFinalState();
    }
    updateRunning();
  }

  // Start: the final frame straight away on repeat visits or with reduced motion
  planetLayer.hidden = false;
  if (readPlayed() || reducedMotion.matches) clock = TIMELINE.end;
  resize();
  applyMotionPreference();

  replayButton.addEventListener("click", () => {
    writePlayed(false);
    clock = 0;
    draw();
    updateRunning();
  });

  for (const planet of planets) {
    if (!planet.link) continue;
    const hold = () => { planetsHeld = true; };
    const release = () => { planetsHeld = false; };
    planet.link.addEventListener("pointerenter", hold);
    planet.link.addEventListener("pointerleave", release);
    planet.link.addEventListener("focus", () => { hold(); draw(); });
    planet.link.addEventListener("blur", () => { release(); draw(); });
    planet.link.addEventListener("click", () => {
      const target = document.querySelector(planet.link.getAttribute("href"));
      const heading = target && target.querySelector(".project-title");
      if (heading) window.setTimeout(() => heading.focus({ preventScroll: true }), 0);
    });
  }

  hero.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const box = hero.getBoundingClientRect();
    parallax.targetX = ((event.clientX - box.left) / box.width - 0.5) * -12;
    parallax.targetY = ((event.clientY - box.top) / box.height - 0.5) * -8;
  });
  hero.addEventListener("pointerleave", () => { parallax.targetX = 0; parallax.targetY = 0; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
      updateRunning();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", updateRunning);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", applyMotionPreference);

  let resizeTimer = null;
  const scheduleResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 80);
  };
  if ("ResizeObserver" in window) new ResizeObserver(scheduleResize).observe(hero);
  else window.addEventListener("resize", scheduleResize);
  // Font loading can change the text height and so the anchor position
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
}

/* ========================================================================
   4. Recruiter view, navigation menu, copy email
   ======================================================================== */
function initRecruiterView() {
  const overlay = document.getElementById("recruiter");
  const panel = overlay.querySelector(".recruiter-panel");
  const backgroundParts = [document.querySelector(".site-header"), document.getElementById("main"), document.querySelector(".site-footer"), document.querySelector(".skip-link")];
  let returnFocusTo = null;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusableItems = () => [...panel.querySelectorAll(focusableSelector)].filter((element) => element.offsetParent !== null);

  function open() {
    if (overlay.classList.contains("is-open")) return;
    returnFocusTo = document.activeElement;
    overlay.classList.add("is-open");
    document.body.classList.add("panel-open");
    backgroundParts.forEach((part) => part && part.setAttribute("inert", ""));
    if (window.location.hash !== "#recruiter") history.replaceState(null, "", "#recruiter");
    panel.scrollTop = 0;
    moveFocusInside();
    // When the page loads at #recruiter, the browser can reset focus after this runs: move it in again
    window.requestAnimationFrame(moveFocusInside);
    if (document.readyState !== "complete") window.addEventListener("load", moveFocusInside, { once: true });
  }

  function isOpen() {
    return overlay.classList.contains("is-open");
  }

  function moveFocusInside() {
    if (!isOpen() || panel.contains(document.activeElement)) return;
    const closeButton = panel.querySelector(".close-button");
    (closeButton || panel).focus({ preventScroll: true });
  }

  function close(options = {}) {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("panel-open");
    backgroundParts.forEach((part) => part && part.removeAttribute("inert"));
    if (window.location.hash === "#recruiter") history.replaceState(null, "", window.location.pathname + window.location.search);
    if (options.restoreFocus !== false && returnFocusTo && document.contains(returnFocusTo)) {
      returnFocusTo.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll("[data-open-recruiter]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      open();
    });
  });
  overlay.querySelectorAll("[data-close-recruiter]").forEach((closer) => closer.addEventListener("click", () => close()));

  // "Jump to" links: close the panel, then go to the section and move focus there
  overlay.querySelectorAll("[data-jump]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      close({ restoreFocus: false });
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      history.replaceState(null, "", link.getAttribute("href"));
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      const heading = target.querySelector("h2, h3");
      if (heading) {
        if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
  });

  // Escape closes; Tab and Shift+Tab stay inside the panel (listening on the document, so it works wherever focus is)
  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusableItems();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!panel.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Safety net: if focus ever lands outside the open panel, bring it back
  document.addEventListener("focusin", (event) => {
    if (isOpen() && !panel.contains(event.target)) moveFocusInside();
  });

  const syncWithHash = () => {
    if (window.location.hash === "#recruiter") open();
    else close({ restoreFocus: false });
  };
  window.addEventListener("hashchange", syncWithHash);
  if (window.location.hash === "#recruiter") open();
}

function initMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.getElementById("nav-links");
  if (!toggle || !links) return;
  const setOpen = (isOpen) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "Close" : "Menu";
    links.classList.toggle("is-open", isOpen);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
}

function initCopyEmail() {
  const button = document.querySelector(".copy-button");
  const status = document.querySelector(".copy-status");
  if (!button || !status) return;
  if (!navigator.clipboard) { button.hidden = true; return; }
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = "Copied";
    } catch (error) {
      status.textContent = "Copy failed: select the address instead";
    }
    window.setTimeout(() => { status.textContent = ""; }, 2500);
  });
}

/* Highlight the nav link of the section on screen */
function initActiveNav() {
  if (!("IntersectionObserver" in window)) return;
  const links = new Map([...document.querySelectorAll(".nav-links a")].map((link) => [link.getAttribute("href").slice(1), link]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const link = links.get(entry.target.id);
      if (link && entry.isIntersecting) {
        links.forEach((other) => other.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "true");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((link, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

function runSafely(name, initialiser) {
  try { initialiser(); } catch (error) { console.error(`${name} failed to start`, error); }
}

runSafely("charts", initCharts);
runSafely("hero", initHero);
runSafely("recruiter view", initRecruiterView);
runSafely("menu", initMenu);
runSafely("copy email", initCopyEmail);
runSafely("active nav", initActiveNav);
