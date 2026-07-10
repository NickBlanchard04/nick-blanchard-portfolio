document.body.classList.add("motion-ready");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const menuButton = document.querySelector(".menu-toggle");
const menuLabel = menuButton?.querySelector(".sr-only");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const faqItems = document.querySelectorAll(".faq-item");
const copyEmailButtons = document.querySelectorAll("[data-copy-email]");
const currentYear = document.querySelector("[data-current-year]");

const setMenuState = (isOpen) => {
  if (!menuButton || !menuLabel || !nav) {
    return;
  }

  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuLabel.textContent = isOpen ? "Close menu" : "Open menu";
  nav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    setMenuState(false);
  }
});

faqItems.forEach((item) => {
  const trigger = item.querySelector("button");
  const symbol = trigger?.querySelector("strong");

  if (!trigger || !symbol) {
    return;
  }

  trigger.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    symbol.textContent = isOpen ? "-" : "+";
  });
});

const fallbackCopy = (value) => {
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

copyEmailButtons.forEach((button) => {
  const email = button.dataset.copyEmail;
  const status = button.querySelector(".copy-status");

  button.addEventListener("click", async () => {
    if (!email || !status) {
      return;
    }

    let copied = false;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await Promise.race([
        navigator.clipboard.writeText(email),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("Clipboard API timed out")), 500);
        })
      ]);
      copied = true;
    } catch {
      copied = fallbackCopy(email);
    }

    status.textContent = copied ? "Copied" : email;

    window.setTimeout(() => {
      status.textContent = "Ready";
    }, 2400);
  });
});

const projectData = {
  "green-wave": {
    title: "Green Wave Landscaping",
    type: "Local service business",
    description: "A direct path from first impression to quote request.",
    src: "assets/green-wave-landscaping-desktop.png",
    alt: "Green Wave Landscaping website homepage",
    url: "https://cosmicgames.info/GW/"
  },
  upstate: {
    title: "Upstate Basketball League",
    type: "Sports organization",
    description: "Schedules, standings, teams, and league identity in one home.",
    src: "assets/upstate-basketball-league-desktop.png",
    alt: "Upstate Basketball League website homepage",
    url: "https://nickblanchard04.github.io/upstate-basketball-league/concept/index.html"
  }
};

const projectTabs = [...document.querySelectorAll("[data-project]")];
const previewImage = document.querySelector("[data-preview-image]");
const previewLink = document.querySelector("[data-preview-link]");
const previewTitle = document.querySelector("[data-preview-title]");
const previewType = document.querySelector("[data-preview-type]");
const previewDescription = document.querySelector("[data-preview-description]");
let previewTimer;

const updateProjectPreview = (projectKey) => {
  const project = projectData[projectKey];

  if (!project || !previewImage || !previewLink || !previewTitle || !previewType || !previewDescription) {
    return;
  }

  projectTabs.forEach((tab) => {
    const isActive = tab.dataset.project === projectKey;
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  window.clearTimeout(previewTimer);
  previewImage.classList.add("is-switching");

  const renderProject = () => {
    previewImage.src = project.src;
    previewImage.alt = project.alt;
    previewLink.href = project.url;
    previewLink.setAttribute("aria-label", `Open ${project.title} website`);
    previewTitle.textContent = project.title;
    previewType.textContent = project.type;
    previewDescription.textContent = project.description;
    previewImage.classList.remove("is-switching");
  };

  if (prefersReducedMotion) {
    renderProject();
    return;
  }

  previewTimer = window.setTimeout(renderProject, 150);
};

projectTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    updateProjectPreview(tab.dataset.project);
  });

  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + projectTabs.length) % projectTabs.length;
    projectTabs[nextIndex].focus();
    updateProjectPreview(projectTabs[nextIndex].dataset.project);
  });
});

const previewStage = document.querySelector("[data-preview-stage]");

if (previewStage && !prefersReducedMotion) {
  previewStage.addEventListener("pointermove", (event) => {
    const bounds = previewStage.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width);
    const y = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height);
    const shiftX = ((x / bounds.width) - 0.5) * 8;
    const shiftY = ((y / bounds.height) - 0.5) * 8;

    previewStage.style.setProperty("--guide-x", `${x}px`);
    previewStage.style.setProperty("--guide-y", `${y}px`);
    previewStage.style.setProperty("--shift-x", `${shiftX.toFixed(2)}px`);
    previewStage.style.setProperty("--shift-y", `${shiftY.toFixed(2)}px`);
  });

  previewStage.addEventListener("pointerleave", () => {
    previewStage.style.setProperty("--guide-x", "50%");
    previewStage.style.setProperty("--guide-y", "50%");
    previewStage.style.setProperty("--shift-x", "0px");
    previewStage.style.setProperty("--shift-y", "0px");
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.08
  });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const projectForm = document.querySelector("#project-brief-form");
const formStatus = document.querySelector("#form-status");
const packageSelect = projectForm?.querySelector('select[name="package"]');
const packageLinks = document.querySelectorAll("[data-package]");

packageLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!packageSelect) {
      return;
    }

    packageSelect.value = link.dataset.package;
  });
});

projectForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!projectForm.reportValidity()) {
    return;
  }

  const data = new FormData(projectForm);
  const name = data.get("name");
  const email = data.get("email");
  const business = data.get("business");
  const selectedPackage = data.get("package");
  const goal = data.get("goal");
  const subject = `Website project from ${business}`;
  const message = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Business: ${business}`,
    `Starting point: ${selectedPackage}`,
    "",
    "Website goal:",
    goal
  ].join("\n");
  const mailto = `mailto:nickblanchardbusiness@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  if (formStatus) {
    formStatus.textContent = "Your email app is opening with the project brief filled in.";
  }

  window.location.href = mailto;
});

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
