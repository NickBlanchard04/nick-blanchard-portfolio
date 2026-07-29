document.documentElement.classList.add("js");

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const body = document.body;
const menuButton = $(".menu-button");
const mobileNavigation = $("#mobile-navigation");
const bookingDialog = $("#booking-dialog");
const bookingForm = $("#booking-form");
const bookingFormView = $("#booking-form-view");
const bookingSuccess = $("#booking-success");
const bookingSubmit = $("#booking-submit");
const errorSummary = $("#form-error-summary");
const bookingDate = $("#booking-date");
const quickDate = $("#quick-day");
const mobileBookingDock = $(".mobile-booking-dock");
const hasNativeDialog =
  typeof HTMLDialogElement !== "undefined" &&
  typeof HTMLDialogElement.prototype.showModal === "function";

let activeDialog = null;
let menuShouldRestoreFocus = true;
let heroBookingVisible = true;
let closingBookingVisible = false;

const today = new Date();
const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

bookingDate.min = todayString;
quickDate.min = todayString;

if (!hasNativeDialog) {
  $$("dialog").forEach((dialog) => {
    dialog.showModal = () => {
      dialog.setAttribute("open", "");
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
    };
    dialog.close = () => {
      if (!dialog.hasAttribute("open")) return;
      dialog.removeAttribute("open");
      dialog.dispatchEvent(new Event("close"));
    };
  });
}

function setBackgroundInert(dialog, inert) {
  $$("body > *").forEach((element) => {
    if (element === dialog || element.tagName === "SCRIPT") return;
    if (inert) {
      element.dataset.dialogAriaHidden = element.getAttribute("aria-hidden") ?? "";
      element.setAttribute("aria-hidden", "true");
      if ("inert" in element) element.inert = true;
    } else {
      const previous = element.dataset.dialogAriaHidden;
      if (previous === "") {
        element.removeAttribute("aria-hidden");
      } else if (previous !== undefined) {
        element.setAttribute("aria-hidden", previous);
      }
      delete element.dataset.dialogAriaHidden;
      if ("inert" in element) element.inert = false;
    }
  });
}

function lockBody() {
  body.classList.add("is-locked");
}

function unlockBodyIfClear() {
  const dialogOpen = Boolean($("dialog[open]"));
  const menuOpen = menuButton.getAttribute("aria-expanded") === "true";
  if (!dialogOpen && !menuOpen) {
    body.classList.remove("is-locked");
  }
}

function openDialog(dialog, opener) {
  if (!dialog || dialog.hasAttribute("open")) return;
  dialog._opener = opener || document.activeElement;
  activeDialog = dialog;
  dialog.showModal();
  setBackgroundInert(dialog, true);
  lockBody();

  const target =
    $("[autofocus]", dialog) ||
    $(".dialog__close", dialog) ||
    $("button, a, input, select, textarea", dialog);

  window.setTimeout(() => target?.focus(), reduceMotion.matches ? 0 : 40);
}

function closeDialog(dialog) {
  if (!dialog?.hasAttribute("open")) return;
  dialog.close();
}

$$("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.openDialog);
    openDialog(dialog, button);
  });
});

$$("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button.closest("dialog")));
});

$$("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      event.preventDefault();
    }
  });

  dialog.addEventListener("close", () => {
    setBackgroundInert(dialog, false);
    activeDialog = null;
    unlockBodyIfClear();
    updateMobileBookingDock();
    const opener = dialog._opener;
    dialog._opener = null;
    if (opener?.isConnected) {
      window.setTimeout(() => opener.focus(), 0);
    }
  });
});

function openMenu() {
  menuButton.setAttribute("aria-expanded", "true");
  mobileNavigation.hidden = false;
  lockBody();
  menuShouldRestoreFocus = true;
  window.setTimeout(() => $("a", mobileNavigation)?.focus(), 0);
}

function closeMenu({ restoreFocus = true } = {}) {
  menuButton.setAttribute("aria-expanded", "false");
  mobileNavigation.hidden = true;
  menuShouldRestoreFocus = restoreFocus;
  unlockBodyIfClear();
  if (menuShouldRestoreFocus) {
    window.setTimeout(() => menuButton.focus(), 0);
  }
}

menuButton.addEventListener("click", () => {
  if (menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
  } else {
    openMenu();
  }
});

$$("a", mobileNavigation).forEach((link) => {
  link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
});

document.addEventListener("keydown", (event) => {
  if (activeDialog?.hasAttribute("open")) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDialog(activeDialog);
      return;
    }

    if (event.key === "Tab") {
      const focusable = $$(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        activeDialog,
      ).filter((element) => !element.hidden && element.getClientRects().length > 0);

      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    return;
  }

  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true" &&
    !activeDialog
  ) {
    event.preventDefault();
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (
    window.matchMedia("(min-width: 64rem)").matches &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu({ restoreFocus: false });
  }
  updateMobileBookingDock();
});

$$("[data-service-card]").forEach((button) => {
  const card = button.closest(".service-card");
  const front = $(".service-card__face--front", button);
  const back = $(".service-card__face--back", button);
  const serviceName = button.dataset.serviceName;

  function setServiceCardState(expanded) {
    card.classList.toggle("is-flipped", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.setAttribute(
      "aria-label",
      `${serviceName}: ${expanded ? "show overview" : "show details"}`,
    );
    front.setAttribute("aria-hidden", String(expanded));
    back.setAttribute("aria-hidden", String(!expanded));
    front.toggleAttribute("inert", expanded);
    back.toggleAttribute("inert", !expanded);
  }

  setServiceCardState(false);
  const toggleServiceCard = () => {
    setServiceCardState(button.getAttribute("aria-expanded") !== "true");
  };

  button.addEventListener("click", toggleServiceCard);
  button.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleServiceCard();
  });
});

const caseContent = {
  routine: {
    title: "A gentler return to routine care",
    concern:
      "An adult returning after several years, with sensitivity and worry about being judged.",
    plan:
      "A comfort-led first visit, diagnostic records, stabilization, then shorter follow-up visits arranged around the person’s pace.",
    why:
      "Stabilize first, then phase care around comfort, time, and clinical need.",
  },
  refresh: {
    title: "Shaping a subtle smile refresh",
    concern:
      "A person curious about a small aesthetic change without committing to an extensive treatment plan.",
    plan:
      "A photo-led conversation, shade and contour preview, then a conservative mock-up before any decision.",
    why:
      "Explore goals and preview tradeoffs before choosing whether a subtle change feels worthwhile.",
  },
};

$$("[data-case]").forEach((button) => {
  button.addEventListener("click", () => {
    const content = caseContent[button.dataset.case];
    $("#case-dialog-title").textContent = content.title;
    $("#case-concern").textContent = content.concern;
    $("#case-plan").textContent = content.plan;
    $("#case-why").textContent = content.why;
    openDialog($("#case-dialog"), button);
  });
});

const routeTrigger = $("#route-trigger");
const conceptMap = $(".concept-map");
const routeStatus = $("#route-status");

routeTrigger.addEventListener("click", () => {
  const isRouting = routeTrigger.getAttribute("aria-pressed") === "true";
  routeTrigger.setAttribute("aria-pressed", String(!isRouting));
  conceptMap.classList.toggle("is-routing", !isRouting);
  routeTrigger.firstChild.textContent = isRouting ? "Preview the route " : "Reset route ";
  routeStatus.textContent = isRouting
    ? "Route preview reset. The map remains a fictional interface demonstration."
    : "Fictional route preview active: courtyard parking to Wrenfield Commons. No real location is represented.";

  if (!isRouting && !reduceMotion.matches) {
    const route = $(".map-route", conceptMap);
    route.style.animation = "none";
    route.getBoundingClientRect();
    route.style.animation = "";
  }
});

const paymentCopy = [
  "A clear interface starts with why care is being discussed, which parts are time-sensitive and which can wait.",
  "The next view demonstrates how a written estimate and benefits outline could separate known costs from variables.",
  "A final comparison could help someone weigh timing and payment paths without pressure. No option shown here is offered.",
];

const paymentLabels = ["Understand", "Estimate", "Choose"];
const paymentFlowLabels = ["Continue to Estimate", "Continue to Choose", "Return to Understand"];

function selectPaymentStep(index) {
  $$(".payment-step").forEach((step, stepIndex) => {
    const selected = stepIndex === index;
    step.classList.toggle("is-active", selected);
    step.setAttribute("aria-pressed", String(selected));
  });
  $("#payment-detail-title").textContent = paymentLabels[index];
  $("#payment-detail-copy").textContent = paymentCopy[index];
  $("#payment-flow-label").textContent = paymentFlowLabels[index];
  $("#payment-flow-button").dataset.currentStep = String(index);
}

$$(".payment-step").forEach((button, index) => {
  button.addEventListener("click", () => selectPaymentStep(index));
  button.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectPaymentStep(index);
  });
});

$("#payment-flow-button").addEventListener("click", (event) => {
  const current = Number(event.currentTarget.dataset.currentStep || 0);
  selectPaymentStep((current + 1) % paymentCopy.length);
});

function populateBookingFromSource(source) {
  const reason = source?.dataset.bookingReason;
  if (reason) {
    const matchingOption = $$("option", $("#booking-reason")).find(
      (option) => option.textContent === reason,
    );
    if (matchingOption) $("#booking-reason").value = matchingOption.value;
  }
}

function openBooking(opener) {
  if (menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu({ restoreFocus: false });
  }
  populateBookingFromSource(opener);
  openDialog(bookingDialog, opener);
  mobileBookingDock.hidden = true;
}

$$("[data-open-booking]").forEach((button) => {
  button.addEventListener("click", () => openBooking(button));
});

$$("[data-close-booking]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(bookingDialog));
});

$(".quick-booking__action", $("#quick-booking")).addEventListener("click", (event) => {
  const reason = $("#quick-reason").value;
  const date = quickDate.value;
  const time = $("#quick-time").value;

  if (reason) $("#booking-reason").value = reason;
  if (date) bookingDate.value = date;
  if (time) $("#booking-time").value = time;

  openBooking(event.currentTarget);
});

const fieldRules = {
  "booking-name"(input) {
    return input.value.trim().length >= 2 ? "" : "Enter a name using at least two characters.";
  },
  "booking-email"(input) {
    if (!input.value.trim()) return "Enter an email address.";
    return input.validity.typeMismatch ? "Enter a valid email address." : "";
  },
  "booking-phone"(input) {
    if (!input.value.trim()) return "";
    const digits = input.value.replace(/\D/g, "");
    return digits.length >= 7 ? "" : "Enter at least seven digits, or leave this optional field blank.";
  },
  "booking-reason"(input) {
    return input.value ? "" : "Choose what you’re looking for.";
  },
  "booking-date"(input) {
    if (!input.value) return "Choose a preferred day.";
    return input.value < todayString ? "Choose today or a future day." : "";
  },
  "booking-time"(input) {
    return input.value ? "" : "Choose a preferred time.";
  },
  "booking-consent"(input) {
    return input.checked ? "" : "Confirm that you understand this is a portfolio interaction.";
  },
};

function showFieldError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  if (!error) return;
  error.textContent = message;
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

function validateField(input) {
  const rule = fieldRules[input.id];
  if (!rule) return "";
  const message = rule(input);
  showFieldError(input, message);
  return message;
}

function validateBookingForm() {
  const errors = [];
  Object.keys(fieldRules).forEach((id) => {
    const input = document.getElementById(id);
    const message = validateField(input);
    if (message) errors.push({ input, message });
  });
  return errors;
}

function renderErrorSummary(errors) {
  const list = $("ul", errorSummary);
  list.replaceChildren();

  errors.forEach(({ input, message }) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${input.id}`;
    link.textContent = message;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      input.focus();
    });
    item.append(link);
    list.append(item);
  });

  errorSummary.hidden = errors.length === 0;
}

Object.keys(fieldRules).forEach((id) => {
  const input = document.getElementById(id);
  const eventName = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
  input.addEventListener(eventName, () => {
    if (input.hasAttribute("aria-invalid")) {
      validateField(input);
      const remainingErrors = validateBookingForm();
      renderErrorSummary(remainingErrors);
    }
  });
});

function resetBookingState({ focusName = false } = {}) {
  bookingForm.reset();
  Object.keys(fieldRules).forEach((id) => {
    const input = document.getElementById(id);
    showFieldError(input, "");
  });
  errorSummary.hidden = true;
  $("ul", errorSummary).replaceChildren();
  bookingSubmit.disabled = false;
  bookingSubmit.removeAttribute("aria-busy");
  bookingSubmit.textContent = "Show sample response";
  bookingFormView.hidden = false;
  bookingSuccess.hidden = true;
  bookingDialog.setAttribute("aria-labelledby", "booking-dialog-title");
  if (focusName) {
    window.setTimeout(() => $("#booking-name").focus(), 0);
  }
}

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const errors = validateBookingForm();
  renderErrorSummary(errors);

  if (errors.length) {
    errorSummary.focus();
    return;
  }

  bookingSubmit.disabled = true;
  bookingSubmit.setAttribute("aria-busy", "true");
  bookingSubmit.textContent = "Preparing sample response…";

  const finish = () => {
    bookingForm.reset();
    bookingFormView.hidden = true;
    bookingSuccess.hidden = false;
    bookingDialog.setAttribute("aria-labelledby", "booking-success-title");
    bookingSuccess.focus();
  };

  window.setTimeout(finish, reduceMotion.matches ? 0 : 280);
});

$("#booking-start-over").addEventListener("click", () => {
  resetBookingState({ focusName: true });
});

bookingDialog.addEventListener("close", () => {
  resetBookingState();
  updateMobileBookingDock();
});

const bookingSuccessTitle = $("h2", bookingSuccess);
bookingSuccessTitle.id = "booking-success-title";

const revealElements = $$(".reveal");
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const caseRail = $(".case-rail");
caseRail.addEventListener(
  "scroll",
  () => {
    const cards = $$(".case-card", caseRail);
    const railRect = caseRail.getBoundingClientRect();
    let closestIndex = 0;
    let closestDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - railRect.left);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    $$(".case-rail__progress span").forEach((item, index) => {
      item.classList.toggle("is-active", index === closestIndex);
    });
  },
  { passive: true },
);

function updateMobileBookingDock() {
  const shouldShow =
    window.matchMedia("(max-width: 47.999rem)").matches &&
    !heroBookingVisible &&
    !closingBookingVisible &&
    !bookingDialog.hasAttribute("open") &&
    menuButton.getAttribute("aria-expanded") !== "true";
  mobileBookingDock.hidden = !shouldShow;
}

if ("IntersectionObserver" in window) {
  const dockObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target.classList.contains("hero__booking-trigger")) {
          heroBookingVisible = entry.isIntersecting;
        } else {
          closingBookingVisible = entry.isIntersecting;
        }
      });
      updateMobileBookingDock();
    },
    { threshold: 0.2 },
  );

  dockObserver.observe($(".hero__booking-trigger"));
  dockObserver.observe($(".booking-cta [data-open-booking]"));
}

mobileBookingDock.addEventListener("click", () => openBooking(mobileBookingDock));

window.addEventListener("pageshow", () => {
  updateMobileBookingDock();
});
