const startReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const bookingSection = document.querySelector("#book");

document.querySelectorAll("[data-scroll-booking]").forEach((button) => {
  button.addEventListener("click", () => {
    bookingSection?.scrollIntoView({
      behavior: startReducedMotion ? "auto" : "smooth",
      block: "start"
    });

    window.bbbAnalytics?.track("booking_section_view", {
      placement: button.closest(".start-hero") ? "start-hero" : "start-page"
    });
  });
});

const introToggle = document.querySelector("[data-intro-toggle]");
const introPanel = document.querySelector("#studio-intro");

introToggle?.addEventListener("click", () => {
  if (!introPanel) return;

  const open = introToggle.getAttribute("aria-expanded") !== "true";
  introToggle.setAttribute("aria-expanded", String(open));
  introToggle.textContent = open ? "Close introduction" : "View studio introduction";
  introPanel.hidden = !open;
});

const comparison = document.querySelector("[data-comparison]");
const comparisonTop = document.querySelector("[data-comparison-top]");
const comparisonRange = document.querySelector("[data-comparison-range]");

const updateComparison = () => {
  if (!comparison || !comparisonTop || !comparisonRange) return;

  const position = Number(comparisonRange.value);
  comparison.style.setProperty("--comparison-position", `${position}%`);
  comparisonTop.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
};

comparisonRange?.addEventListener("input", updateComparison);

const updateComparisonFromPointer = (event) => {
  if (!comparison || !comparisonRange) return;

  const bounds = comparison.getBoundingClientRect();
  const minimum = Number(comparisonRange.min) || 0;
  const maximum = Number(comparisonRange.max) || 100;
  const percentage = ((event.clientX - bounds.left) / bounds.width) * 100;
  comparisonRange.value = String(Math.round(Math.min(maximum, Math.max(minimum, percentage))));
  updateComparison();
};

comparisonRange?.addEventListener("pointerdown", updateComparisonFromPointer);
comparisonRange?.addEventListener("pointermove", (event) => {
  if (event.buttons === 1) updateComparisonFromPointer(event);
});
updateComparison();

const bookingDateButtons = [...document.querySelectorAll("[data-booking-date]")];
const bookingTimeButtons = [...document.querySelectorAll("[data-booking-time]")];
const bookingForm = document.querySelector("[data-booking-form]");
const bookingResult = document.querySelector("[data-booking-result]");
const bookingDateInput = document.querySelector("[data-booking-date-input]");
const bookingTimeInput = document.querySelector("[data-booking-time-input]");

bookingDateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    bookingDateButtons.forEach((other) => {
      other.classList.toggle("is-selected", other === button);
      other.setAttribute("aria-pressed", String(other === button));
    });

    if (bookingDateInput) bookingDateInput.value = button.dataset.bookingDate || "";

    bookingTimeButtons.forEach((timeButton) => {
      timeButton.disabled = false;
    });

    bookingTimeButtons[0]?.focus();
  });
});

bookingTimeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    bookingTimeButtons.forEach((other) => {
      other.classList.toggle("is-selected", other === button);
      other.setAttribute("aria-pressed", String(other === button));
    });

    if (bookingTimeInput) bookingTimeInput.value = button.dataset.bookingTime || "";
    if (bookingForm) bookingForm.hidden = false;
    if (bookingResult) bookingResult.hidden = true;

    bookingForm?.querySelector("input")?.focus({ preventScroll: true });
  });
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity() || !bookingResult) return;

  const data = new FormData(bookingForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const business = String(data.get("business") || "").trim();
  const goal = String(data.get("goal") || "").trim();
  const date = String(data.get("date") || "").trim();
  const time = String(data.get("time") || "").trim();
  const subject = encodeURIComponent(`Built by Blanch call request — ${business || name}`);
  const body = encodeURIComponent([
    `Name: ${name}`,
    `Email: ${email}`,
    `Business: ${business || "Not provided"}`,
    `Preferred time: ${date} at ${time}`,
    "",
    `Website goal: ${goal || "Not provided"}`
  ].join("\n"));

  const message = document.createElement("p");
  message.textContent = "Your inquiry is ready. Nothing has been sent yet. ";

  const link = document.createElement("a");
  link.href = `mailto:nickblanchardbusiness@gmail.com?subject=${subject}&body=${body}`;
  link.textContent = "Open your email app to send it.";

  bookingResult.replaceChildren(message, link);
  bookingResult.hidden = false;
  bookingResult.focus?.();

  window.bbbAnalytics?.track("booking_inquiry_prepared", {
    preferred_date: date,
    preferred_time: time
  });
});
