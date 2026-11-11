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

const phrases = [
  "Homo Sapiens specimen in his late 20s.",
  getTimeBasedIntro,
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
  "?cvitae_pdf": {
    url: "#",
    message: "Curriculum Vitæ not available!",
    category: "cvitae_pdf"
  },
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
  cvitae: "LinkedIn",
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

/** Activates Analytics and TextScramble effect */
window.addEventListener("load", () => {
  gtag("js", new Date());
  gtag("config", "G-FMEDZDBVNJ");
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
function handleEmailButton() {
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
    gtag("event", "click", { event_category: config.category });
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

/** Pushes to Analytics */
function gtag() {
  window.dataLayer = window.dataLayer || [];
  dataLayer.push(arguments);
}

/* ==========================================================================
   Bubbles (the former .glass-icon tiles)
   Orbit, entrance and "closer to the user" motion, plus the original interaction logic.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const field = document.getElementById("bubbles");
  const avatar = document.getElementById("bubble-avatar");
  if (!field || !avatar) return;

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ENTER_DELAY = 0.25; // seconds; every bubble enters together
  let flagTouchingTarget = false;

  /* Each bubble gets a wrapper ("slot"): the slot carries the orbit position and scale, the bubble inside keeps
     its own `transform` for the hover / press animations, so the two never fight over the same property. */
  const bubbles = [...field.querySelectorAll(".bubble")].map((el, i, all) => {
    const slot = document.createElement("div");
    slot.className = "bubble-slot";
    el.parentNode.insertBefore(slot, el);
    slot.appendChild(el);
    return {
      el,
      slot,
      specular: el.querySelector(".glass-specular"),
      z: +el.dataset.z,                                   // size relative to the avatar
      r: +el.dataset.r,                                   // how far it tucks toward the avatar
      base: (i / all.length) * Math.PI * 2 - Math.PI / 2, // starting angle
      ph: Math.random() * 6.28,
      ph2: Math.random() * 6.28,
      f: 0,   // current "closer" amount (0..1)
      fT: 0,  // target "closer" amount
      size: 0
    };
  });

  let S, AV;
  let focused = null;
  let fMix = 0, fMixT = 0;
  let mousePending = false, mouseX = 0, mouseY = 0;
  let raisedBy = null;   // "mouse" | "touch" | "key"
  let lastTouch = 0;     // browsers fire compatibility mouse events after a touch; those must be ignored
  let lastHoverCheck = 0;

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
  addEventListener("pointerup", releasePress, true);
  addEventListener("pointercancel", releasePress, true);
  addEventListener("mouseup", releasePress, true);
  addEventListener("dragend", releasePress, true);
  addEventListener("blur", releasePress);

  resetBubbles = () => {
    releasePress();
    lower();
    hideDescriptionNotification(null, description, greeting, action);
  };
  document.documentElement.addEventListener("mouseleave", () => resetBubbles()); // cursor left the window

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
      gtag("event", "click", { event_category: icon.id });
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
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!icon.contains(target)) {
        flagTouchingTarget = false; // Cancel if finger moved outside the button
        icon.dispatchEvent(new Event("mouseout", { bubbles: true }));
      }
    });

    icon.addEventListener("touchend", () => {
      lastTouch = Date.now();
      if (flagTouchingTarget && icon.id != "mail") {
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
    icon.addEventListener("pointerleave", releasePress);
    icon.addEventListener("dragstart", e => e.preventDefault()); // links must not start a native drag
  });

  /* ---- Liquid-glass specular highlight: follows the cursor when it is near a bubble ---- */
  function updateSpeculars(x, y) {
    if (isDeviceMobile()) return;
    for (const b of bubbles) {
      const rect = b.el.getBoundingClientRect(); // live: bubbles move every frame
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (Math.hypot(x - cx, y - cy) < 100) {
        const k = b.el.offsetWidth / rect.width;  // undo the scale
        b.specular.style.background = `
          radial-gradient(
            100px circle at ${(x - rect.left) * k}px ${(y - rect.top) * k}px,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.2) 30%,
            rgba(255, 255, 255, 0) 60%
          )`;
      } else {
        b.specular.style.background = "none";
      }
    }
  }

  body.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!mousePending) {
      mousePending = true;
      requestAnimationFrame(() => {
        updateSpeculars(mouseX, mouseY);
        mousePending = false;
      });
    }
  });

  /* ---- Layout ---- */
  function layout() {
    S = field.offsetWidth;
    AV = S / 2.5;
    field.style.setProperty("--av", AV + "px");
    for (const b of bubbles) {
      b.size = AV * b.z;
      b.slot.style.width = b.slot.style.height = b.size + "px";
      b.el.style.width = b.el.style.height = b.size + "px";
      b.el.style.padding = b.size * 0.23 + "px";
    }
  }
  addEventListener("resize", layout);
  layout();

  /* Background rings radiate from the avatar: publish its centre as --ox / --oy */
  let ox = -1, oy = -1;
  function syncOrigin() {
    const r = field.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    if (Math.abs(x - ox) > 0.4 || Math.abs(y - oy) > 0.4) {
      ox = x;
      oy = y;
      root.style.setProperty("--ox", x.toFixed(1) + "px");
      root.style.setProperty("--oy", y.toFixed(1) + "px");
    }
  }
  syncOrigin();
  setTimeout(() => root.classList.add("bg-ready"), 2600); // lets the CSS drop the entrance mask

  /* ---- Animation loop ----
     Orbit position and scale go on the slot wrapper; the bubble's own `transform` is left to the
     hover / press animations in the stylesheet. */
  let last = performance.now();
  const t0 = last;
  let rot = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    const t = (now - t0) / 1000;
    last = now;

    syncOrigin();
    if (raisedBy === "mouse" && now - lastHoverCheck > 120) {
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
    avatar.style.transform = `translateY(${reduce ? 0 : Math.sin(t * 0.8) * 3}px)`;

    const w = reduce ? 0 : 1; // wobble on/off
    for (const b of bubbles) {
      const tt = Math.max(0, t - ENTER_DELAY);
      const ease = reduce ? Math.min(1, tt * 3) : (tt > 2.2 ? 1 : 1 - Math.exp(-5.5 * tt) * Math.cos(11 * tt)); // springy entrance
      b.f += (b.fT - b.f) * Math.min(1, dt * 9);

      const ang = b.base + rot + w * Math.sin(t * 0.35 + b.ph) * 0.14;
      let rho = AV / 2 + b.size * (1 - b.r) * 0.5 + AV * 0.07 + b.size * 0.12 * w * Math.sin(t * 0.5 + b.ph2);
      rho = rho * (1 - b.f * 0.08) * ease;

      const x = S / 2 + Math.cos(ang) * rho;
      const y = S / 2 + Math.sin(ang) * rho * 0.96;
      const sc = ease * (1 + b.f * 0.25) * (1 + w * Math.sin(t * 1.1 + b.ph) * 0.012);
      b.slot.style.transform = `translate(${x - b.size / 2}px, ${y - b.size / 2}px) scale(${sc})`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});