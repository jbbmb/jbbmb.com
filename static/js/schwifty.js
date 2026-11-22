"use strict";

/* ==========================================================================
   Content and DOM references
   ========================================================================== */
const getTimeBasedIntro = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return "Says good morning, still half asleep.";
  } else if (hour >= 12 && hour < 18) {
    return "Says good afternoon while battling food coma.";
  } else if (hour >= 18 && hour < 22) {
    return "Says good evening with a full to-do list.";
  } else {
    return "Says good night, screen still glowing.";
  }
};

const getMonthBasedIntro = () => {
  const month = new Date().getMonth(); // 0 = January
  if (month === 11) {
    return "Wishes you a happy holiday season.";
  } else if (month <= 1) {
    return "Wishes you a happy winter.";
  } else if (month <= 4) {
    return "Wishes you a happy spring.";
  } else if (month <= 7) {
    return "Wishes you a happy summer.";
  } else {
    return "Wishes you a happy autumn.";
  }
};

const phrases = [
  "Homo Sapiens specimen in his late 20s.",
  getTimeBasedIntro,
  getMonthBasedIntro,
  "Currently lives in the city of Porto.",
  "Born in northern Portugal, Earth.",
  "Raised in a big family with no religion.",
  "Studies software and cybersecurity.",
  "Writes code in his free time.",
  "Automates tasks no one asked to be automated.",
  "Obsesses over privacy and user experience.",
  "Nags companies to delete unused accounts.",
  "Believes AI must be used responsibly.",
  "Wants to leave a meaningful legacy.",
  "Stays hungry and foolish.",
  "Never settles on an iPhone wallpaper.",
  "Hates notifications and texting.",
  "Drives a very demure Audi.",
  "Rocks to blues, pop and electronic beats.",
  "Orders a gin and tonic instead of beer.",
  "Prefers cats over dogs all day, any day.",
  "Speaks three languages fluently.",
  "Spends his money on massages and trips.",
  "Has set foot in nine countries so far.",
  "Always takes pictures of the sunset.",
  "Takes care of plants that end up dying.",
  "Believes in climate change and vaccines.",
  "Votes every time there is an election.",
  "Overthinks a lot, including this sentence.",
  "Thanks You for visiting."
];

/** Routing config */
const redirects = {
  "?system_status": {
    url: "https://stats.uptimerobot.com/OXmELf5EPJ",
    message: "Opening UptimeRobot...",
    category: "system_status"
  },
  "?about_project": {
    url: "https://github.com/jbbmb/jbbmb.com",
    message: "Opening GitHub...",
    category: "copyright"
  }
};

/** Names used in the "Opening ..." notification, by bubble id (a data-name attribute wins if present) */
const bubbleNames = {
  linkedin: "LinkedIn",
  git: "GitHub",
  shortcuts: "RoutineHub",
  videos: "YouTube",
  bluesky: "Bluesky",
  mail: "Mail",
  revolut: "Revolut",
  copyright: "GitHub"
};

const body = document.querySelector("body");
const greeting = document.getElementById("greeting");
const description = document.getElementById("description");
const action = document.getElementById("action");
const supportsClipboard = navigator.clipboard && typeof navigator.clipboard.writeText === "function";
const prefersTouch = window.matchMedia("(hover: none)").matches;
let flagActionNotification = false;
let resetBubbles = () => { }; // assigned once the bubbles exist; clears hover / press / tagline state
let afterActionNotification = () => { }; // assigned once the bubbles exist; runs when an action message ends

/* ==========================================================================
   TextScramble
   ========================================================================== */
class TextScramble {
  constructor(element) {
    this.element = element;
    this.chars = "0 1";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.element.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.element.innerHTML = output;
    if (complete === this.queue.length) this.resolve();
    else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}


/* ==========================================================================
   Page lifecycle
   ========================================================================== */

/** Activates the TextScramble effect (page views are counted by GoatCounter's own script) */
window.addEventListener("load", () => {
  const fx = new TextScramble(greeting);
  let i = 0;
  const rotate = () => {
    const text = typeof phrases[i] === "function" ? phrases[i]() : phrases[i];
    fx.setText(text).then(() => setTimeout(rotate, 3500));
    i = (i + 1) % phrases.length;
  };
  rotate();
  handleExternalRedirect(window.location.search);
});

/** Prevents Visitor from right clicking */
body.addEventListener("contextmenu", e => e.preventDefault());

/** Removes hover effect upon Visitor's return.
    The page can come back from the back/forward cache with its JS state frozen, so the bubbles are reset too. */
window.addEventListener("pageshow", () => {
  if (document.activeElement) {
    document.activeElement.blur();
  }
  resetBubbles();
});
window.addEventListener("pagehide", () => resetBubbles());
document.addEventListener("visibilitychange", () => { if (document.hidden) resetBubbles(); });

/* ==========================================================================
   Helpers
   ========================================================================== */

/** Checks if Visitor's device is mobile or not */
function isDeviceMobile() {
  if (supportsClipboard && !prefersTouch) {
    return false; // Desktop with clipboard access and non-touch input
  } else {
    return true; // Touch-based input or clipboard unsupported
  }
}

/** Sets e-mail action based on device type (called from the mail bubble's onclick) */
function handleEmailButton(event) {
  if (event) event.preventDefault(); // the link is a real mailto: (crawlable, works without JS); this decides what happens instead
  if (isDeviceMobile()) {
    showActionNotification("Opening e-mail app...", 1500);
    window.location.href = "mailto:hello@jbbmb.com";
  } else {
    navigator.clipboard.writeText("hello@jbbmb.com")
      .then(() => showActionNotification("E-mail address copied to the clipboard.", 3500))
      .catch(() => {
        showActionNotification("Opening e-mail app...", 1500);
        window.location.href = "mailto:hello@jbbmb.com"; // Fallback to mailto if clipboard fails
      });
  }
}

/** Redirects external Visitors accordingly */
function handleExternalRedirect(route) {
  if (!route) return;
  const config = redirects[route];
  if (config) {
    track("redirect-" + config.category);
    showActionNotification(config.message, 3500);
    window.open(config.url, "_self");
  } else {
    showActionNotification("The requested page was not found!", 3500);
  }
}

/** Notifies Visitor of a description in the tagline */
function showDescriptionNotification(icon, description, greeting, action) {
  if (!flagActionNotification) {
    description.textContent = icon.getAttribute("aria-label");
    description.style.display = "block";
    greeting.style.display = "none";
    action.style.display = "none";
  }
}

/** Hides a description from the tagline */
function hideDescriptionNotification(icon, description, greeting, action) {
  if (!flagActionNotification) {
    description.style.display = "none";
    greeting.style.display = "block";
    action.style.display = "none";
  }
}

/** Notifies Visitor of an action in the tagline */
function showActionNotification(text, timeout) {
  flagActionNotification = true;
  action.textContent = text;
  description.style.display = "none";
  greeting.style.display = "none";
  action.style.display = "block";
  setTimeout(() => {
    flagActionNotification = false;
    description.style.display = "none";
    greeting.style.display = "block";
    action.style.display = "none";
    afterActionNotification();
  }, timeout);
}

/** Counts an event in GoatCounter (cookieless, no personal data). Its script loads async, so if it is not
    there yet the call waits a moment (up to ~5s) and tries again; with the script blocked it just does nothing. */
function track(name, tries = 10) {
  if (window.goatcounter && typeof window.goatcounter.count === "function") {
    window.goatcounter.count({ path: name, title: name, event: true });
  } else if (tries > 0) {
    setTimeout(() => track(name, tries - 1), 500);
  }
}

/* ==========================================================================
   One animation loop for everything that moves (a single requestAnimationFrame)
   ========================================================================== */
const frameTasks = [];
const onFrame = fn => frameTasks.push(fn);

function startLoop() {
  const t0 = performance.now();
  let last = t0;
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000; // seconds since start
    for (const fn of frameTasks) fn(t, dt, now);
  };
  requestAnimationFrame(tick);
}

const clamp01 = v => Math.min(1, Math.max(0, v));

/** CSS cubic-bezier() easing, so the entrance keeps the curves it had as CSS animations */
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = s => ((ax * s + bx) * s + cx) * s;
  const sy = s => ((ay * s + by) * s + cy) * s;
  const dx = s => (3 * ax * s + 2 * bx) * s + cx;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let s = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(s) - x;
      if (Math.abs(e) < 1e-5) break;
      const d = dx(s);
      if (Math.abs(d) < 1e-6) break;
      s -= e / d;
    }
    return sy(s);
  };
}

/* ==========================================================================
   Background (WebGL)
   Rings radiating from the avatar, seen through a rotated dot grid, plus the
   and the vignette, all computed per pixel in one tiny shader.
   Replaces a huge animated CSS gradient that was repainted every frame.
   Returns null (and leaves the plain --bkg page) when WebGL is unavailable.
   ========================================================================== */
function createBackground({ reduce, getOrigin }) {
  const VERT = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2  uRes;      // canvas size, device px
    uniform float uDpr;      // device px per CSS px
    uniform vec2  uView;     // viewport size, CSS px
    uniform vec2  uOrigin;   // avatar centre, CSS px
    uniform float uCs;       // ring phase 0..1
    uniform float uGrow;     // dot size 0..1 (springs past 1 on entrance)
    uniform float uReveal;   // radius revealed so far, CSS px
    uniform float uFeather;  // soft edge of the reveal, CSS px
    uniform float uScrim;    // vignette opacity 0..1
    uniform float uL;        // ring ray length, CSS px
    uniform vec3  uBkg;
    uniform vec3  uC2;
    uniform vec3  uC3;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    vec4 pm(vec3 rgb, float a) { return vec4(rgb * a, a); }

    void main() {
      vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr; // CSS px, origin top-left
      vec2 d = p - uOrigin;
      float r = length(d);
      float aa = 1.0 / uDpr;

      // dots: 60px grid rotated 45deg, centred on the avatar, antialiased
      vec2 q = vec2(d.x + d.y, d.y - d.x) * 0.70710678;
      vec2 f = (fract(q / 60.0 + 0.5) - 0.5) * 60.0;
      float dotR = 2.0 * uGrow;
      float cov = (1.0 - smoothstep(dotR - 0.5 * aa, dotR + 0.5 * aa, length(f))) * smoothstep(0.0, aa, dotR);

      // rings: transparent -> c2 -> c3 -> c2 -> transparent, repeating every half ray length
      float t = mod(r / uL - uCs, 0.5);
      float ra = 1.0;
      vec3 rc = uC2;
      if (t < 0.15)      { ra = t / 0.15; }
      else if (t < 0.25) { rc = mix(uC2, uC3, (t - 0.15) / 0.10); }
      else if (t < 0.30) { rc = mix(uC3, uC2, (t - 0.25) / 0.05); }
      else               { ra = 1.0 - (t - 0.30) / 0.20; }
      vec3 ring = mix(uBkg, rc, ra);

      // rings show only inside the dots, revealed outward from the avatar
      float reveal = clamp((uReveal - r) / uFeather, 0.0, 1.0);
      vec3 col = mix(uBkg, ring, cov * reveal);

      // vignette: ellipse around the avatar, plus a darker lower half behind the signature
      float e = length(d / vec2(0.8 * uView.x, 0.65 * uView.y));
      vec4 s1 = pm(vec3(10.0, 10.0, 12.0) / 255.0, 0.16);
      vec4 s2 = pm(vec3(6.0, 6.0, 8.0) / 255.0, 0.42);
      vec4 rs = e < 0.58 ? mix(vec4(0.0), s1, e / 0.58) : mix(s1, s2, clamp((e - 0.58) / 0.42, 0.0, 1.0));
      float y = p.y / uView.y;
      vec4 l1 = pm(vec3(20.0, 20.0, 22.0) / 255.0, 0.3);
      vec4 l2 = pm(vec3(20.0, 20.0, 22.0) / 255.0, 0.5);
      vec4 ls = y < 0.38 ? vec4(0.0) : (y < 0.68 ? mix(vec4(0.0), l1, (y - 0.38) / 0.30) : mix(l1, l2, clamp((y - 0.68) / 0.32, 0.0, 1.0)));
      vec4 sc = (rs + ls * (1.0 - rs.a)) * uScrim;
      float k = clamp(uBkg.r * 255.0 / 28.0, 0.0, 1.0); // a true black page stays true black: the vignette only darkens it
      sc.rgb *= k;
      col = sc.rgb + col * (1.0 - sc.a);

      col += (hash(gl_FragCoord.xy) - 0.5) / 255.0 * k; // dither: no banding in the dark gradients
      gl_FragColor = vec4(col, 1.0);
    }`;

  /* Colours come from the stylesheet so there is one source of truth */
  const css = getComputedStyle(document.documentElement);
  const hex = (name, fallback) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(css.getPropertyValue(name).trim());
    const n = parseInt(m ? m[1] : fallback, 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  };
  let bkg, accent, c2;
  function readColors() {
    bkg = hex("--bkg", "1C1C1E");
    accent = hex("--accent-color", "fc9e0e");
    c2 = bkg.map((v, i) => v + (accent[i] - v) * 0.34); // color-mix(accent 34%, bkg)
  }
  function applyColors() {
    readColors();
    gl.uniform3fv(U.uBkg, bkg);
    gl.uniform3fv(U.uC2, c2);
    gl.uniform3fv(U.uC3, accent);
  }
  readColors();

  const canvas = document.createElement("canvas");
  canvas.id = "bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  let gl, prog, U;
  let scale = Math.min(window.devicePixelRatio || 1, 2); // render resolution; lowered automatically if the device struggles
  let software = false; // true when WebGL runs on the CPU (no GPU, VM, remote desktop, lab tools)
  let dirty = true;
  let lastDraw = 0;

  const bezReveal = cubicBezier(0.22, 0.7, 0.2, 1);
  const bezScrim = cubicBezier(0.25, 0.1, 0.25, 1);

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }

  function init() {
    gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: "low-power" // integrated GPU is plenty, and spares laptop batteries
    });
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "");
    if (software) scale = Math.min(scale, 0.75); // per-pixel work on a CPU: fewer pixels, the page stays responsive
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one big triangle
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    U = {};
    for (const n of ["uRes", "uDpr", "uView", "uOrigin", "uCs", "uGrow", "uReveal", "uFeather", "uScrim", "uL", "uBkg", "uC2", "uC3"]) {
      U[n] = gl.getUniformLocation(prog, n);
    }
    applyColors();
    resize();
    return true;
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    dirty = true;
    paint(); // setting the canvas size clears it: repaint in the same task, before the browser shows a frame
  }

  /* Draws the current state right now (the animation clock is whatever the last frame had) */
  let curT = 0;
  function paint() {
    if (U && gl && !gl.isContextLost()) draw(reduce ? 0 : curT);
  }

  function draw(t) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    const vmax = Math.max(w, h) / 100;
    const [ox, oy] = getOrigin();

    let cs = 0, grow = 1, reveal = 1e5, scrim = 1;
    if (!reduce) {
      cs = (t / 10) % 1;                                              // one ring period every 5s
      const tg = t - 0.2;                                             // dots spring up
      grow = tg <= 0 ? 0 : tg > 2 ? 1 : 1 - Math.exp(-5.5 * tg) * Math.cos(11 * tg);
      const tr = clamp01((t - 0.1) / 2);                              // reveal expands from the avatar
      reveal = tr >= 1 ? 1e5 : bezReveal(tr) * 180 * vmax;
      scrim = bezScrim(clamp01((t - 0.1) / 1.4));                     // vignette fades in
    }

    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uDpr, canvas.width / w);
    gl.uniform2f(U.uView, w, h);
    gl.uniform2f(U.uOrigin, ox, oy);
    gl.uniform1f(U.uCs, cs);
    gl.uniform1f(U.uGrow, grow);
    gl.uniform1f(U.uReveal, reveal);
    gl.uniform1f(U.uFeather, 16 * vmax);
    gl.uniform1f(U.uScrim, scrim);
    gl.uniform1f(U.uL, 0.70710678 * 2.2 * Math.max(w, h));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  if (!init()) {
    canvas.remove();
    return null;
  }

  canvas.addEventListener("webglcontextlost", e => e.preventDefault());
  canvas.addEventListener("webglcontextrestored", () => { if (init()) dirty = true; });
  new ResizeObserver(() => { if (gl && !gl.isContextLost()) resize(); }).observe(canvas);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { // live switch, no reload
    if (gl && !gl.isContextLost()) { applyColors(); dirty = true; paint(); }
  });
  draw(0); // paint straight away so there is no black flash before the first frame

  /* Quality guard: if the entrance runs below ~40 fps, drop the render resolution one step (down to 1x) */
  let samples = 0, slow = 0, lastNow = 0;
  function guard(t, now) {
    if (t > 6) return;
    if (lastNow) {
      samples++;
      if (now - lastNow > 26) slow++;
      if (samples >= 40) {
        const floor = software ? 0.5 : 1;
        if (slow > 20 && scale > floor) {
          scale = Math.max(floor, scale - 0.25);
          resize();
        }
        samples = slow = 0;
      }
    }
    lastNow = now;
  }

  onFrame((t, dt, now) => {
    if (!gl || gl.isContextLost()) return;
    curT = t;
    if (reduce) {                                  // reduced motion: one static frame, redrawn only when needed
      if (dirty) { draw(0); dirty = false; }
      return;
    }
    if ((software || t > 3.2) && now - lastDraw < (software ? 50 : 30)) return; // entrance at full rate, then ~30 fps (20 on a CPU): the rings are slow
    guard(t, now);
    lastDraw = now;
    dirty = false;
    draw(t);
  });

  return { redraw: () => { dirty = true; paint(); } };
}

/* ==========================================================================
   Intro: the signature block drops out of the avatar
   The signature and tagline themselves (no background) start as a small speck behind the avatar,
   fall out of its lower edge stretching with speed, overshoot their place on a spring, and pop to full
   size. Skipped under reduced motion. Leaves no inline styles behind when done.
   ========================================================================== */
function createIntro({ el, getGeometry, at }) {
  const BORN = at;                      // s: the same moment the bubbles and avatar enter
  const FALL = { a: 4.2, w: 8.5 };      // spring for the fall: ~21% overshoot, lands after ~0.24s
  const POP = { at: 0.05, a: 7, w: 11 }; // growth to full size, ~13% overshoot
  const START_SCALE = 0.1;
  const END = 1.7;                      // s after BORN: every spring has settled to well under a pixel

  /* Underdamped spring from 1 to 0 (starting at rest), and its derivative */
  const spring = (a, w, s) => Math.exp(-a * s) * (Math.cos(w * s) + (a / w) * Math.sin(w * s));
  const dspring = (a, w, s) => -Math.exp(-a * s) * ((a * a + w * w) / w) * Math.sin(w * s);
  const smooth = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  el.style.animation = "none";  // cancel the CSS fallback fade: this takes over
  el.style.opacity = "0";
  let done = false;

  onFrame(t => {
    if (done) return;
    const tau = t - BORN;
    if (tau < 0) return;
    if (tau > END) {
      done = true;
      el.style.opacity = el.style.transform = ""; // keep animation:none, or the CSS fade would replay
      return;
    }

    const g = getGeometry(); // avatar centre and the block's natural centre, in px
    const E = spring(FALL.a, FALL.w, tau);
    const dx = (g.ox - g.tx) * E;
    const dy = (g.oy - g.ty) * E;

    /* Stretch along the fall in proportion to speed; narrower as it gets longer */
    const sq = Math.sqrt(1 + Math.min(0.85, 0.15 * Math.abs(dspring(FALL.a, FALL.w, tau))));
    const P = 1 - spring(POP.a, POP.w, Math.max(0, tau - POP.at));
    const s = START_SCALE + (1 - START_SCALE) * P;

    el.style.opacity = smooth(tau / 0.3);
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s / sq}, ${s * sq})`;
  });
}

/* ==========================================================================
   Images that fail to load (blocked, a format the browser cannot decode, offline)
   The failed image's container gets .img-failed, and the stylesheet shows text in its place: the initials on the
   avatar, the name on a bubble, the name where the signature goes. Nothing happens when every image loads.
   ========================================================================== */
function watchImages() {
  const failed = img => {
    const box = img.parentElement;
    if (!box) return;
    box.classList.add("img-failed");
    const bubble = box.closest(".bubble");
    if (bubble) box.dataset.fb = bubble.dataset.name || bubbleNames[bubble.id] || "";
  };
  const sweep = () => { for (const img of document.images) if (!img.naturalWidth) failed(img); };
  for (const img of document.images) {
    if (img.complete) { if (!img.naturalWidth) failed(img); }
    else img.addEventListener("error", () => failed(img), { once: true });
  }
  /* Some browsers never request the images at all (Safari with "Disable Images") and so never fire "error":
     by the window's load event every image is either loaded or it is not going to be. */
  if (document.readyState === "complete") sweep();
  else addEventListener("load", sweep, { once: true });
}

/* ==========================================================================
   Bubbles (the former .glass-icon tiles)
   Orbit, entrance and "closer to the user" motion, plus the original interaction logic.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  watchImages();
  const field = document.getElementById("bubbles");
  const avatar = document.getElementById("bubble-avatar");
  if (!field || !avatar) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ENTER_DELAY = 0.25; // seconds; every bubble enters together
  let flagTouchingTarget = false;

  /* Each bubble gets a wrapper ("slot"): the slot carries the orbit position, the bubble inside keeps its own
     `transform` for the hover / press animations, so the two never fight over the same property. */
  const bubbles = [...field.querySelectorAll(".bubble")].map((el, i, all) => {
    const slot = document.createElement("div");
    slot.className = "bubble-slot";
    const slotIndex = el.dataset.slot !== undefined ? +el.dataset.slot : i;
    slot.style.setProperty("--k", slotIndex); // stacking order of overlapping bubbles, as before
    el.parentNode.insertBefore(slot, el);
    slot.appendChild(el);
    return {
      el,
      slot,
      z: +el.dataset.z,                                   // size relative to the avatar
      r: +el.dataset.r,                                   // how far it tucks toward the avatar
      base: (slotIndex / all.length) * Math.PI * 2 - Math.PI / 2, // starting angle (data-slot keeps the orbit layout independent of tab order)
      ph: Math.random() * 6.28,
      ph2: Math.random() * 6.28,
      j: { ox: 0, oy: 0, vx: 0, vy: 0 }, // jelly: how far the bubble is pulled from its orbit spot (px) and how fast it moves
      x: 0, y: 0,                         // centre in the field, last frame
      drag: false,                        // being dragged right now
      dragged: false,                     // was dragged since the last press: the release must not open the link
      down: null,                         // the press that may become a drag
      px: 0, py: 0, gx: 0, gy: 0,         // pointer, and where on the bubble it grabbed
      tf: "",                             // transform last written to the DOM
      f: 0,    // current "closer" amount (0..1)
      fT: 0,   // target "closer" amount
      size: 0, // base size, px
      cur: -1  // size last written to the DOM
    };
  });

  let S = 0, AV = 0;
  let dpr = window.devicePixelRatio || 1;
  let focused = null;
  let fMix = 0, fMixT = 0;
  let mouseX = 0, mouseY = 0;
  let raisedBy = null;   // "mouse" | "touch" | "key"
  let lastTouch = 0;     // browsers fire compatibility mouse events after a touch; those must be ignored
  let lastHoverCheck = 0;
  let fl = 0, ft = 0;    // the field's top-left corner in the viewport
  const DRAG_SLOP = 10;  // px a press must travel before it is a drag; less than that is a normal click

  /* ---- Bring a bubble closer / put it back ---- */
  const raise = (b, by = "mouse") => {
    if (focused === b) return;
    focused = b;
    raisedBy = by;
    fMixT = 1;
    for (const o of bubbles) {
      o.fT = o === b ? 1 : 0;
      o.el.classList.toggle("on", o === b);
      o.slot.classList.toggle("on", o === b);
    }
  };

  const lower = () => {
    focused = null;
    raisedBy = null;
    fMixT = 0;
    for (const o of bubbles) {
      o.fT = 0;
      o.el.classList.remove("on");
      o.slot.classList.remove("on");
    }
  };

  /* ---- Press state from pointer events (never :active, which can stick after a drag-off) ---- */
  let pressed = null;
  const releasePress = () => {
    if (pressed) {
      pressed.classList.remove("pressed");
      pressed = null;
    }
  };
  /* A drag ends on release (or if the browser takes the pointer away): the bubble springs back */
  const endDrag = b => {
    b.down = null;
    if (!b.drag) return;
    b.drag = false;
    b.el.classList.remove("dragging");
  };
  const endDrags = () => bubbles.forEach(endDrag);
  addEventListener("pointerup", () => { releasePress(); endDrags(); }, true);
  addEventListener("pointercancel", () => { releasePress(); endDrags(); }, true);
  addEventListener("mouseup", releasePress, true);
  addEventListener("dragend", releasePress, true);
  addEventListener("blur", releasePress);

  /* Clears everything: page hidden, restored from the back/forward cache, or the cursor left the window */
  resetBubbles = () => {
    releasePress();
    endDrags();
    lower();
    hideDescriptionNotification(null, description, greeting, action);
  };
  document.documentElement.addEventListener("mouseleave", () => resetBubbles());

  /* When an action message ends and a bubble is still held, the tagline returns to that bubble's description */
  afterActionNotification = () => {
    if (focused) showDescriptionNotification(focused.el, description, greeting, action);
  };

  /* ---- Interactivity (original logic: aria-label in the tagline, click, touch) ---- */
  bubbles.forEach(b => {
    const icon = b.el;
    setTimeout(() => icon.classList.add("in"), ENTER_DELAY * 1000);

    icon.addEventListener("mousemove", () => {
      if (Date.now() - lastTouch < 800) return; // compatibility mouse event after a tap: not a hover
      showDescriptionNotification(icon, description, greeting, action);
      raise(b, "mouse");
    });

    icon.addEventListener("focus", () => {
      showDescriptionNotification(icon, description, greeting, action);
      raise(b, "key");
    });

    icon.addEventListener("mouseout", () => {
      hideDescriptionNotification(icon, description, greeting, action);
      lower();
      document.activeElement.blur();
    });

    icon.addEventListener("click", () => {
      track("click-" + icon.id);
      if ("vibrate" in navigator) {
        navigator.vibrate([10, 30, 10]); // Layered haptic feedback
      }
      if (icon.id != "mail") {
        showActionNotification(("Opening " + (icon.getAttribute("alt") || bubbleNames[icon.id]) + "..."), 1500);
      }
      // No blur here: the click may not take the Visitor away (e.g. e-mail copy), so the bubble stays
      // raised while the cursor is on it and only lowers when the cursor leaves.
    });

    icon.addEventListener("blur", () => {
      hideDescriptionNotification(icon, description, greeting, action);
      lower();
    });

    icon.addEventListener("touchstart", () => {
      lastTouch = Date.now();
      flagTouchingTarget = true;
      showDescriptionNotification(icon, description, greeting, action);
      raise(b, "touch");
    });

    icon.addEventListener("touchmove", (event) => {
      if (b.drag) return; // being dragged: it follows the finger, so "finger left the button" no longer applies
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!icon.contains(target)) {
        flagTouchingTarget = false; // Cancel if finger moved outside the button
        icon.dispatchEvent(new Event("mouseout", { bubbles: true }));
      }
    });

    icon.addEventListener("touchend", () => {
      lastTouch = Date.now();
      if (flagTouchingTarget && icon.id != "mail" && !b.dragged) {
        icon.click();
      } else {
        flagTouchingTarget = false;
        icon.dispatchEvent(new Event("mouseout", { bubbles: true }));
      }
    });

    /* press state */
    icon.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      pressed = icon;
      icon.classList.add("pressed");
    });
    icon.addEventListener("pointerleave", () => {
      releasePress();
      if (!b.drag) b.down = null; // left before it became a drag
    });

    /* Jelly: a press pokes the bubble (it gives way, then wobbles back); dragging pulls it like rubber; release
       springs it back. The motion itself is in the frame loop below. */
    if (!reduce) {
      icon.draggable = false;
      icon.addEventListener("keydown", () => { b.dragged = false; });
      icon.addEventListener("pointerdown", e => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        b.dragged = false;
        b.down = { id: e.pointerId, x: e.clientX, y: e.clientY };
        b.px = e.clientX;
        b.py = e.clientY;
        const dx = fl + b.x - e.clientX, dy = ft + b.y - e.clientY;
        const len = Math.hypot(dx, dy) || 1;
        const kick = Math.min(1, len / (b.cur * 0.5 || 1)) * b.cur * 2.2; // harder the further from the centre
        b.j.vx += (dx / len) * kick;
        b.j.vy += (dy / len) * kick;
      });
      icon.addEventListener("pointermove", e => {
        if (!b.down || e.pointerId !== b.down.id) return;
        b.px = e.clientX;
        b.py = e.clientY;
        if (!b.drag && Math.hypot(e.clientX - b.down.x, e.clientY - b.down.y) > DRAG_SLOP) {
          b.drag = true;
          b.dragged = true;
          b.gx = b.down.x - fl - b.x; // where on the bubble it was grabbed: that spot stays under the finger
          b.gy = b.down.y - ft - b.y;
          icon.classList.add("dragging");
          try { icon.setPointerCapture(e.pointerId); } catch (_) { /* the drag still works while over the bubble */ }
          showDescriptionNotification(icon, description, greeting, action);
          raise(b, e.pointerType === "mouse" ? "mouse" : "touch");
        }
      });
      icon.addEventListener("lostpointercapture", e => {
        if (e.target === icon) endDrag(b); // not the inner element handing the pointer over (touch captures it implicitly)
      });
    }
    icon.addEventListener("dragstart", e => e.preventDefault()); // links must not start a native drag
  });

  /* Only the cursor position is tracked, for the "still under the cursor?" check in the frame loop */
  /* A release after a drag must not open the link (this runs before the link's own click handlers) */
  field.addEventListener("click", e => {
    const b = bubbles.find(o => o.el.contains(e.target));
    if (b && b.dragged) {
      e.preventDefault();
      e.stopPropagation();
      b.dragged = false;
    }
  }, true);

  body.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, { passive: true });

  /* ---- Layout, and the avatar's centre (the background radiates from it) ----
     Measured only when something actually resizes, never per frame. */
  let ox = 0, oy = 0;
  const topSection = document.querySelector(".top-section");
  const sig = { tx: 0, ty: 0 }; // signature block: its natural (untransformed) centre

  function measure() {
    S = field.offsetWidth;
    AV = S / 2.5;
    field.style.setProperty("--av", AV + "px");
    for (const b of bubbles) {
      b.size = AV * b.z;
      b.cur = -1; // forces the next frame to write the size
    }
    const r = field.getBoundingClientRect();
    fl = r.left;
    ft = r.top;
    ox = r.left + r.width / 2;
    oy = r.top + r.height / 2;
    if (topSection) {
      // offsetLeft/Top are layout values: unlike getBoundingClientRect they ignore the intro's transform.
      // The offset parent is .page-content, which sits at the viewport origin.
      sig.tx = topSection.offsetLeft + topSection.offsetWidth / 2;
      sig.ty = topSection.offsetTop + topSection.offsetHeight / 2;
    }
    background && background.redraw();
  }

  /* The cluster's own size, the signature block (its height changes when the tagline wraps) and the page
     padding all move the avatar, so those are what we watch. */
  const background = createBackground({
    reduce,
    getOrigin: () => [ox, oy],
  });
  const ro = new ResizeObserver(measure);
  ro.observe(field);
  ro.observe(document.querySelector(".page-content"));
  if (topSection) ro.observe(topSection);
  addEventListener("resize", () => { dpr = window.devicePixelRatio || 1; });
  measure();

  /* ---- Bubbles frame ----
     Orbit position goes on the slot (translate only). The entrance spring and the "closer" growth change the
     bubble's real size instead of scaling it: a transform stretches an already-drawn bitmap (soft icons and
     glass), a real size is redrawn sharp. Nothing is written to the DOM unless its value changed. */
  let rot = 0;

  onFrame((t, dt, now) => {
    if (raisedBy === "mouse" && now - lastHoverCheck > 120 && !bubbles.some(o => o.drag)) {
      lastHoverCheck = now;
      const hit = document.elementFromPoint(mouseX, mouseY);
      if (!hit || !focused.el.contains(hit)) {
        hideDescriptionNotification(null, description, greeting, action);
        lower();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      }
    }

    fMix += (fMixT - fMix) * Math.min(1, dt * 6);
    if (!reduce) rot += 0.045 * dt * (1 - fMix * 0.92); // orbit slows while one is held close

    const snap = v => Math.round(v * dpr) / dpr; // whole device pixels, never between two

    const w = reduce ? 0 : 1; // wobble on/off
    const tt = Math.max(0, t - ENTER_DELAY);
    const ease = reduce ? 1 : (tt > 2.2 ? 1 : 1 - Math.exp(-5.5 * tt) * Math.cos(11 * tt)); // springy entrance (reduced motion: in place from the start, CSS fades it in)

    for (const b of bubbles) {
      b.f += (b.fT - b.f) * Math.min(1, dt * 9);
      const f = reduce ? 0 : b.f; // reduced motion: a held bubble does not come closer or grow

      const ang = b.base + rot + w * Math.sin(t * 0.35 + b.ph) * 0.14;
      let rho = AV / 2 + b.size * (1 - b.r) * 0.5 + AV * 0.07 + b.size * 0.12 * w * Math.sin(t * 0.5 + b.ph2);
      rho = rho * (1 - f * 0.08) * ease;

      const x = S / 2 + Math.cos(ang) * rho;
      const y = S / 2 + Math.sin(ang) * rho * 0.96;

      const s = b.size * ease * (1 + f * 0.25);
      if (Math.abs(s - b.cur) > 0.05) {
        b.cur = s;
        const px = s + "px";
        b.slot.style.width = b.slot.style.height = px;
        b.el.style.width = b.el.style.height = px;
        b.el.style.padding = s * 0.23 + "px";
      }

      b.x = x;
      b.y = y;
      const tx = snap(x - s / 2), ty = snap(y - s / 2);

      /* Jelly. While dragged, the bubble is pulled toward the pointer through a rubber band (1:1 at first, then
         it resists) and follows on a soft spring; on release the spring is looser, so it overshoots and wobbles
         back. It stretches along its motion and thins across it, keeping its area. At rest nothing is applied
         but the plain translate, so the glass and the icon stay sharp. */
      const J = b.j;
      let tf;
      if (!reduce && (b.drag || J.ox || J.oy || J.vx || J.vy)) {
        let gx = 0, gy = 0;
        if (b.drag) {
          const rx = b.px - fl - b.gx - x, ry = b.py - ft - b.gy - y;
          const m = Math.hypot(rx, ry);
          if (m > 0.01) {
            const L = AV * 0.5; // furthest it can be pulled
            const k = L * Math.tanh(m / L) / m;
            gx = rx * k;
            gy = ry * k;
          }
        }
        const stiff = b.drag ? 240 : 190, damp = 2 * (b.drag ? 0.7 : 0.42) * Math.sqrt(stiff);
        const steps = Math.ceil(dt / (1 / 120)) || 1, h = dt / steps;
        for (let i = 0; i < steps; i++) {
          J.vx += (stiff * (gx - J.ox) - damp * J.vx) * h;
          J.vy += (stiff * (gy - J.oy) - damp * J.vy) * h;
          J.ox += J.vx * h;
          J.oy += J.vy * h;
        }
        const m = Math.hypot(J.ox, J.oy), sp = Math.hypot(J.vx, J.vy);
        if (!b.drag && m < 0.25 && sp < 6) {
          J.ox = J.oy = J.vx = J.vy = 0;
          tf = `translate(${tx}px, ${ty}px)`;
        } else {
          const st = Math.min(0.2, 0.32 * m / s + 0.005 * sp / s);              // how much longer along the motion
          const axis = m > 0.5 ? Math.atan2(J.oy, J.ox) : Math.atan2(J.vy, J.vx);
          const deg = (axis * 180 / Math.PI).toFixed(2);
          tf = `translate(${(tx + J.ox).toFixed(2)}px, ${(ty + J.oy).toFixed(2)}px) rotate(${deg}deg) ` +
            `scale(${(1 + st).toFixed(4)}, ${(1 / Math.sqrt(1 + st)).toFixed(4)}) rotate(${-deg}deg)`;
        }
      } else {
        tf = `translate(${tx}px, ${ty}px)`;
      }
      if (tf !== b.tf) {
        b.tf = tf;
        b.slot.style.transform = tf;
      }
    }
  });

  if (!reduce && topSection) {
    createIntro({ el: topSection, at: ENTER_DELAY, getGeometry: () => ({ ox, oy, tx: sig.tx, ty: sig.ty }) });
  }

  startLoop();
});