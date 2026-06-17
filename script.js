const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const navGroups = document.querySelectorAll(".nav-group");
const faqItems = document.querySelectorAll(".faq-item");
const menuLabel = menuButton.querySelector(".sr-only");

const setMenuState = (isOpen) => {
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

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

faqItems.forEach((item) => {
  const trigger = item.querySelector("button");
  const symbol = trigger.querySelector("strong");

  trigger.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    symbol.textContent = isOpen ? "-" : "+";
  });
});
