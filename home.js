const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const menuButton = document.querySelector(".menu-toggle");
const menuLabel = menuButton?.querySelector(".sr-only");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = [...document.querySelectorAll(".mobile-menu a")];
const currentYear = document.querySelector("[data-current-year]");
const buildWindow = document.querySelector("[data-build-window]");
const buildStatus = document.querySelector("[data-build-status]");
const progressBar = document.querySelector("[data-progress-bar]");
const progressValue = document.querySelector("[data-progress-value]");

const setMenuState = (open) => {
  if (!menuButton || !menuLabel || !mobileMenu) return;

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuLabel.textContent = open ? "Close menu" : "Open menu";
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.toggleAttribute("inert", !open);
  document.body.classList.toggle("menu-open", open);
};

menuButton?.addEventListener("click", () => {
  setMenuState(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileMenuLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    setMenuState(false);
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) setMenuState(false);
});

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const buildSteps = [
  { value: 18, text: "Designing a clear customer path..." },
  { value: 42, text: "Shaping the responsive layout..." },
  { value: 68, text: "Connecting the important actions..." },
  { value: 86, text: "Testing the final details..." },
  { value: 100, text: "Ready to launch." }
];

if (buildWindow && buildStatus && progressBar && progressValue) {
  if (reducedMotion) {
    const finalStep = buildSteps.at(-1);
    progressBar.style.width = `${finalStep.value}%`;
    progressValue.textContent = `${finalStep.value}%`;
    buildStatus.textContent = finalStep.text;
    buildWindow.classList.add("is-complete");
  } else {
    let buildStepIndex = 0;

    window.setInterval(() => {
      buildStepIndex = (buildStepIndex + 1) % buildSteps.length;
      const step = buildSteps[buildStepIndex];
      progressBar.style.width = `${step.value}%`;
      progressValue.textContent = `${step.value}%`;
      buildStatus.textContent = step.text;
      buildWindow.classList.toggle("is-complete", step.value === 100);
    }, 1800);
  }
}

const initializeWorkWall = () => {
  const workWall = document.querySelector("[data-work-wall]");
  if (!workWall) return;

  workWall.querySelectorAll("[data-work-column]").forEach((column) => {
    const track = column.querySelector(".work-column-track");
    const sequence = column.querySelector("[data-work-sequence]");
    if (!track || !sequence || track.querySelector("[data-work-clone]")) return;

    for (let copyIndex = 0; copyIndex < 2; copyIndex += 1) {
      const clone = sequence.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("data-work-clone", "");
      clone.removeAttribute("data-work-sequence");
      clone.querySelectorAll("a").forEach((link) => {
        link.tabIndex = -1;
        link.removeAttribute("data-project-card");
      });
      track.appendChild(clone);
    }
  });

  workWall.classList.add("is-looping");
};

initializeWorkWall();

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  if (link.matches("[data-contact-link]")) {
    window.bbbAnalytics?.track("contact_intent", {
      contact_method: "email",
      placement: link.closest(".site-header") ? "navigation" : link.closest(".hero") ? "hero" : "contact-section"
    });
  }

  if (link.matches("[data-project-card]")) {
    window.bbbAnalytics?.track("portfolio_project_click", {
      project_name: link.querySelector(".project-meta h3, .project-meta strong")?.textContent.trim() || "Selected work",
      placement: document.body.classList.contains("examples-page") ? "examples-gallery" : "homepage-work-wall"
    });
  }
});

const initializeMotion = () => {
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("motion-ready");

  if (document.querySelector(".hero-badge")) {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline
      .from(".hero-badge", { y: 12, opacity: 0, duration: 0.5 })
      .from(".hero-wordmark", { y: 18, opacity: 0, duration: 0.65 }, "-=0.3")
      .from(".hero-intro, .hero-actions, .hero-benefits", { y: 14, opacity: 0, stagger: 0.08, duration: 0.55 }, "-=0.35")
      .from(".build-window", { x: 30, opacity: 0, scale: 0.97, duration: 0.8 }, "-=0.65");
  }

  gsap.utils.toArray(".process-grid li").forEach((card) => {
    gsap.from(card, {
      y: 34,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%", once: true }
    });
  });

  if (!document.body.classList.contains("examples-page")) {
    gsap.utils.toArray("[data-project-card]").forEach((card) => {
      gsap.fromTo(card,
        { scale: 0.92, opacity: 0.36 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 96%",
            end: "center 58%",
            scrub: true
          }
        }
      );
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
};

initializeMotion();

if (currentYear) currentYear.textContent = new Date().getFullYear();
