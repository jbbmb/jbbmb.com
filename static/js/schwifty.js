"use strict";

/** Sets constants and variables */
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
}, phrases = [
  "Homo Sapiens specimen in his late 20s.",
  getTimeBasedIntro(),
  "Currently lives in the city of Porto.",
  "Born in northern Portugal, Earth.",
  "Studies software and cybersecurity.",
  "Writes code in his free time.",
  "Obsesses over privacy and user experience.",
  "Nags companies to delete unused accounts.",
  "Believes ChatGPT is nothing to be scared of.",
  "Wants to leave a meaningful legacy.",
  "Stays hungry and foolish.",
  "Can't settle on an iPhone wallpaper.",
  "Hates notifications and texting.",
  "Raised in a big family with no religion.",
  "Rocks to blues, pop and electronic beats.",
  "Orders a gin and tonic instead of beer.",
  "Prefers cats over dogs all day, any day.",
  "Speaks three languages fluently.",
  "Spends his money on massages and trips.",
  "Has set foot in eight countries so far.",
  "Always takes pictures of the sunset.",
  "Takes care of plants that end up dying.",
  "Believes in climate change and vaccines.",
  "Votes every time there is an election.",
  "Thanks You for visiting."
], redirects = {
  "?cvitae_pdf": {
    url: "https://github.com/jbbmb/jbbmb.com/raw/main/static/pdf/Curriculum%20Vitae%20of%20João%20de%20Macedo%20Borges.pdf",
    message: "Curriculum Vitæ download started...",
    category: "cvitae_pdf"
  },
  "?system_status": {
    url: "http://stats.uptimerobot.com/OXmELf5EPJ",
    message: "Opening UptimeRobot...",
    category: "system_status"
  }
}, body = document.querySelector("body"),
  greeting = document.getElementById("greeting"),
  description = document.getElementById("description"),
  action = document.getElementById("action"),
  glassIcons = document.querySelectorAll(".glass-icon"),
  supportsClipboard = navigator.clipboard && typeof navigator.clipboard.writeText === "function",
  prefersTouch = window.matchMedia("(hover: none)").matches;
let flagActionNotification = false,
  flagTouchingTarget = false,
  lastMouseMove = 0;

/** Activates Analytics and TextScramble effect */
window.addEventListener("load", () => {
  console.log("🤔 Inspecting, are we? What are You hoping to find exactly?");
  gtag('js', new Date());
  gtag('config', 'G-FMEDZDBVNJ');
  const fx = new TextScramble(document.querySelector("#greeting"));
  let i = 0;
  const rotate = () => {
    fx.setText(phrases[i]).then(() => setTimeout(rotate, 3500));
    i = (i + 1) % phrases.length;
  };
  rotate();
  handleExternalRedirect(window.location.search);
});

/** Prevents Visitor from right clicking */
body.addEventListener("contextmenu", e => e.preventDefault());

/** Removes hover effect upon Visitor's return */
window.addEventListener('pageshow', () => {
  if (document.activeElement) {
    document.activeElement.blur();
  }
});

/** Adds interactivity to all Liquid Glass elements */
document.addEventListener("DOMContentLoaded", function () {

  body.addEventListener("mousemove", function (event) {
    const now = performance.now();
    if (now - lastMouseMove < 8.33) return; // Cap at 120 FPS
    lastMouseMove = now;
    glassIcons.forEach(icon => {
      const rect = icon.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const specular = icon.querySelector(".glass-specular");
      if (!isDeviceMobile() && distance < 100) {
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        specular.style.background = `
          radial-gradient(
            100px circle at ${localX}px ${localY}px,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.2) 30%,
            rgba(255, 255, 255, 0) 60%
          )`;
      } else {
        specular.style.background = "none";
      }
    });
  });

  glassIcons.forEach(icon => {
    icon.addEventListener("mousemove", () => {
      showDescriptionNotification(icon, description, greeting, action);
    });

    icon.addEventListener("focus", () => {
      showDescriptionNotification(icon, description, greeting, action);
    });

    icon.addEventListener("mouseout", () => {
      hideDescriptionNotification(icon, description, greeting, action);
      document.activeElement.blur();
    });

    icon.addEventListener("click", () => {
      gtag("event", "click", { event_category: icon.id });
      if ("vibrate" in navigator) {
        navigator.vibrate([10, 30, 10]); // Layered haptic feedback
      }
      if (icon.id != "mail") {
        showActionNotication(("Opening " + icon.getAttribute("data-tag") + "..."), 1500);
      }
      document.activeElement.blur();
    });

    icon.addEventListener("blur", () => {
      hideDescriptionNotification(icon, description, greeting, action);
    });

    icon.addEventListener('touchstart', () => {
      flagTouchingTarget = true;
      showDescriptionNotification(icon, description, greeting, action);
    });

    icon.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!icon.contains(target)) {
        flagTouchingTarget = false; // Cancel if finger moved outside the button
        hideDescriptionNotification(icon, description, greeting, action);
        document.activeElement.blur();
      }
    });

    icon.addEventListener('touchend', () => {
      if (flagTouchingTarget) {
        icon.click();
      }
      flagTouchingTarget = false;
      hideDescriptionNotification(icon, description, greeting, action);
      document.activeElement.blur();
    });
  });
});

/** Checks if Visitor's device is mobile or not */
function isDeviceMobile() {
  if (supportsClipboard && !prefersTouch) {
    return false; // Desktop with clipboard access and non-touch input
  } else {
    return true; // Touch-based input or clipboard unsupported
  }
}

/** Sets e-mail action based on device type */
function handleEmailButton() {
  if (isDeviceMobile()) {
    showActionNotication("Opening e-mail app...", 1500);
    window.location.href = "mailto:hello@jbbmb.com";
  } else {
    navigator.clipboard.writeText("hello@jbbmb.com")
      .then(() => showActionNotication("Copied e-mail address to the clipboard.", 3500))
      .catch(() => {
        showActionNotication("Opening e-mail app...", 1500);
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
    showActionNotication(config.message, 3500);
    window.open(config.url, "_self");
  } else {
    showActionNotication("The requested page was not found!", 3500);
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
function showActionNotication(text, timeout) {
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
  }, timeout);
}

/** Pushes to Analytics */
function gtag() {
  window.dataLayer = window.dataLayer || [];
  dataLayer.push(arguments);
}

/** Defines TextScramble class */
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