const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const navGroups = document.querySelectorAll(".nav-group");
const faqItems = document.querySelectorAll(".faq-item");
const copyEmailButtons = document.querySelectorAll("[data-copy-email]");
const heroOrbits = document.querySelector(".hero-orbits");
const menuLabel = menuButton?.querySelector(".sr-only");

window.addEventListener("load", () => {
  window.requestAnimationFrame(() => {
    heroOrbits?.classList.add("is-visible");
  });
});

const setMenuState = (isOpen) => {
  if (!menuButton || !nav || !menuLabel) {
    return;
  }

  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  menuLabel.textContent = isOpen ? "Close menu" : "Open menu";
  nav.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
};

const closeMenu = () => {
  setMenuState(false);
  navGroups.forEach((group) => {
    group.removeAttribute("open");
  });
};

if (menuButton && nav && menuLabel) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
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

copyEmailButtons.forEach((button) => {
  const email = button.dataset.copyEmail;
  const status = button.querySelector(".copy-status");
  const defaultMessage = status?.textContent || "Copy email";

  button.addEventListener("click", async () => {
    if (!email || !status) {
      return;
    }

    try {
      await navigator.clipboard.writeText(email);
      status.textContent = "Copied";
      button.classList.add("is-copied");
    } catch {
      status.textContent = email;
    }

    window.setTimeout(() => {
      status.textContent = defaultMessage;
      button.classList.remove("is-copied");
    }, 2200);
  });
});
