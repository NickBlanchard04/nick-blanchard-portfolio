const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const menuButton = document.querySelector(".menu-toggle");
const menuLabel = menuButton?.querySelector(".sr-only");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = [...document.querySelectorAll(".mobile-menu a")];
const currentYear = document.querySelector("[data-current-year]");
const copyButton = document.querySelector("[data-copy-email]");
const workCards = [...document.querySelectorAll("[data-work-card]")];
const hero = document.querySelector(".hero");
const storyLine = document.querySelector(".story-line");
const viewedWorkProjects = new Set();
const contactHashes = new Set(["#contact", "#resource-contact", "#inquiry"]);
const sectionNavLinks = [
  ...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]')
];

let activeWorkIndex = 0;

const trackAnalytics = (eventName, parameters) => {
  window.bbbAnalytics?.track(eventName, parameters);
};

const getLinkPlacement = (link) => {
  if (link.closest(".desktop-nav")) {
    return "desktop-navigation";
  }

  if (link.closest(".mobile-menu")) {
    return "mobile-navigation";
  }

  if (link.closest(".hero-actions")) {
    return "hero";
  }

  if (link.closest(".site-footer")) {
    return "footer";
  }

  if (link.closest(".contact")) {
    return "contact-section";
  }

  return "page-content";
};

const setMenuState = (isOpen) => {
  if (!menuButton || !menuLabel || !mobileMenu) {
    return;
  }

  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuLabel.textContent = isOpen ? "Close menu" : "Open menu";
  mobileMenu.classList.toggle("is-open", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  mobileMenu.toggleAttribute("inert", !isOpen);
  document.body.classList.toggle("menu-open", isOpen);

  if (isOpen) {
    window.setTimeout(() => mobileMenuLinks[0]?.focus(), 430);
  }
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || menuButton?.getAttribute("aria-expanded") !== "true") {
    return;
  }

  setMenuState(false);
  menuButton.focus();
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    setMenuState(false);
  }
});

const navSections = [...new Set(
  sectionNavLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean)
)];

const setActiveNavSection = (sectionId) => {
  sectionNavLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${sectionId}`;
    const currentValue = link.getAttribute("aria-current");

    if (isCurrent) {
      link.setAttribute("aria-current", "location");
    } else if (currentValue === "location") {
      link.removeAttribute("aria-current");
    }
  });
};

if (navSections.length) {
  let navUpdateFrame = 0;

  const updateActiveNav = () => {
    const readingLine = window.innerHeight * 0.32;
    const activeSection = navSections.find((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= readingLine && bounds.bottom > readingLine;
    });

    setActiveNavSection(activeSection?.id || "");
    navUpdateFrame = 0;
  };

  const scheduleNavUpdate = () => {
    if (!navUpdateFrame) {
      navUpdateFrame = window.requestAnimationFrame(updateActiveNav);
    }
  };

  window.addEventListener("scroll", scheduleNavUpdate, { passive: true });
  window.addEventListener("resize", scheduleNavUpdate);
  scheduleNavUpdate();
}

const setActiveWork = (index) => {
  if (!workCards.length) {
    return;
  }

  activeWorkIndex = (index + workCards.length) % workCards.length;

  workCards.forEach((card, cardIndex) => {
    card.classList.toggle("is-active", cardIndex === activeWorkIndex);
  });

  const activeCard = workCards[activeWorkIndex];
  const projectId = activeCard?.dataset.analyticsProject;

  if (projectId && !viewedWorkProjects.has(projectId)) {
    viewedWorkProjects.add(projectId);
    trackAnalytics("portfolio_project_view", {
      project_id: projectId,
      project_name: activeCard.dataset.analyticsProjectName || projectId,
      placement: "portfolio"
    });
  }
};

workCards.forEach((card, index) => {
  card.addEventListener("pointerenter", () => setActiveWork(index));
  card.addEventListener("focusin", () => setActiveWork(index));
});

const copyWithFallback = (value) => {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();
  return copied;
};

copyButton?.addEventListener("click", async () => {
  const email = copyButton.dataset.copyEmail;
  const status = copyButton.querySelector("small");

  if (!email || !status) {
    return;
  }

  let copied = false;

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(email);
    copied = true;
  } catch {
    copied = copyWithFallback(email);
  }

  status.textContent = copied ? "Email copied" : "Select email";

  if (copied) {
    trackAnalytics("contact_intent", {
      contact_method: "email",
      placement: "copy-email"
    });
  }

  window.setTimeout(() => {
    status.textContent = "Copy email";
  }, 2400);
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link) {
    return;
  }

  if (link.dataset.analyticsProject) {
    trackAnalytics("portfolio_project_click", {
      project_id: link.dataset.analyticsProject,
      project_name: link.dataset.analyticsProjectName || link.dataset.analyticsProject,
      placement: link.dataset.analyticsPlacement || "portfolio"
    });
    return;
  }

  if (link.dataset.analyticsPlan) {
    trackAnalytics("pricing_cta_click", {
      plan_name: link.dataset.analyticsPlan,
      placement: "pricing"
    });
    return;
  }

  const href = link.getAttribute("href") || "";
  let contactMethod = "";

  const destination = href ? new URL(href, window.location.href) : null;

  if (
    destination?.origin === window.location.origin &&
    contactHashes.has(destination.hash)
  ) {
    contactMethod = "contact";
  } else if (href.startsWith("mailto:")) {
    contactMethod = "email";
  } else if (href.startsWith("tel:")) {
    contactMethod = "phone";
  } else if (href.startsWith("sms:")) {
    contactMethod = "text";
  }

  if (contactMethod) {
    trackAnalytics("contact_intent", {
      contact_method: contactMethod,
      placement: getLinkPlacement(link)
    });
  }
});

hero?.addEventListener("pointermove", (event) => {
  if (prefersReducedMotion || event.pointerType === "touch") {
    return;
  }

  const bounds = hero.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;

  hero.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
  hero.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);
});

hero?.addEventListener("pointerleave", () => {
  hero.style.setProperty("--pointer-x", "70%");
  hero.style.setProperty("--pointer-y", "35%");
});

if (storyLine) {
  const words = storyLine.textContent.trim().split(/\s+/);
  storyLine.replaceChildren();

  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word;
    storyLine.append(span);

    if (index < words.length - 1) {
      storyLine.append(document.createTextNode(" "));
    }
  });
}

const initializeMotion = () => {
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("motion-ready");

  const heroTimeline = gsap.timeline({
    defaults: {
      duration: 0.58,
      ease: "power3.out"
    }
  });

  heroTimeline.from(".site-header", {
    y: -12
  });

  if (document.querySelector(".hero-role")) {
    heroTimeline.from(".hero-role", {
      y: 10
    }, "-=0.3");
  }

  if (document.querySelector(".hero h1 span")) {
    heroTimeline.from(".hero h1 span", {
      yPercent: 12,
      stagger: 0.06
    }, "-=0.46");
  }

  const heroDetailTargets = [".hero-intro", ".hero-actions"]
    .filter((selector) => document.querySelector(selector));

  if (heroDetailTargets.length) {
    heroTimeline.from(heroDetailTargets, {
      y: 12,
      stagger: 0.08
    }, "-=0.38");
  }

  if (document.querySelector(".hero-frame-green")) {
    heroTimeline.from(".hero-frame-green", {
      y: 10,
      duration: 0.72
    }, "-=0.62");
  }

  if (document.querySelector(".hero-frame-ubl")) {
    heroTimeline.from(".hero-frame-ubl", {
      y: 12,
      duration: 0.72
    }, "-=0.56");
  }

  gsap.utils.toArray(".image-scale").forEach((image) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: image,
        start: "top 92%",
        end: "bottom 8%",
        scrub: 0.65
      }
    })
      .fromTo(image, {
        scale: 0.9,
        opacity: 0.38
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "none"
      })
      .to(image, {
        scale: 1.025,
        opacity: 0.35,
        duration: 0.5,
        ease: "none"
      });
  });

  const storyWords = gsap.utils.toArray(".story-line .word");

  if (storyWords.length) {
    gsap.to(storyWords, {
      color: "#f2efe8",
      stagger: 0.08,
      ease: "none",
      scrollTrigger: {
        trigger: ".story",
        start: "top 72%",
        end: "bottom 42%",
        scrub: true
      }
    });
  }

  gsap.utils.toArray(".service-grid article, .process-list li").forEach((item) => {
    gsap.from(item, {
      y: 34,
      opacity: 0,
      duration: 0.78,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
};

initializeMotion();
setActiveWork(0);

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
