(() => {
  "use strict";

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");

  const setMobileMenu = (isOpen) => {
    if (!menuToggle || !siteNav) return;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    siteNav.dataset.open = String(isOpen);
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMobileMenu(!isOpen);
    });

    siteNav.querySelectorAll("a, button").forEach((control) => {
      control.addEventListener("click", () => setMobileMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMobileMenu(false);
        menuToggle.focus();
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    desktopQuery.addEventListener("change", (event) => {
      if (event.matches) setMobileMenu(false);
    });
  }

  const menuSets = {
    first: [
      {
        name: "Dayboat scallop",
        description: "green strawberry · sea lettuce · smoked whey",
        price: "24"
      },
      {
        name: "Embered oyster",
        description: "country ham dashi · benne",
        price: "8 each"
      },
      {
        name: "Carolina Gold rice",
        description: "blue crab · burnt leek · preserved lemon",
        price: "34"
      }
    ],
    hearth: [
      {
        name: "Line-caught tilefish",
        description: "field peas · clam broth · fennel pollen",
        price: "42"
      },
      {
        name: "Aged duck",
        description: "satsuma · sorghum koji · chicory",
        price: "46"
      },
      {
        name: "Coal-roasted cabbage",
        description: "oyster caramel · rye · sweet onion",
        price: "28"
      }
    ],
    sweet: [
      {
        name: "Salted rice custard",
        description: "muscadine · bay laurel",
        price: "15"
      },
      {
        name: "Fig-leaf cake",
        description: "burnt honey · buttermilk · pecan",
        price: "16"
      },
      {
        name: "Muscadine ice",
        description: "lemon verbena · sea salt",
        price: "12"
      }
    ]
  };

  const menuTabs = Array.from(document.querySelectorAll("[data-menu-tab]"));
  const menuPanel = document.querySelector("#menu-panel");
  const menuList = document.querySelector("#menu-list");

  const buildMenuItem = (item) => {
    const listItem = document.createElement("li");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const price = document.createElement("span");

    title.textContent = item.name;
    description.textContent = item.description;
    price.textContent = item.price;
    listItem.append(title, description, price);

    return listItem;
  };

  const renderMenu = (key, focusTab = false) => {
    const activeTab = menuTabs.find((tab) => tab.dataset.menuTab === key);
    const menuItems = menuSets[key];
    if (!activeTab || !menuItems || !menuPanel || !menuList) return;

    menuPanel.classList.add("is-changing");

    window.setTimeout(() => {
      menuList.replaceChildren(...menuItems.map(buildMenuItem));
      menuPanel.setAttribute("aria-labelledby", activeTab.id);

      menuTabs.forEach((tab) => {
        const isActive = tab === activeTab;
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      menuPanel.classList.remove("is-changing");
      if (focusTab) activeTab.focus();
    }, 110);
  };

  menuTabs.forEach((tab, tabIndex) => {
    tab.addEventListener("click", () => renderMenu(tab.dataset.menuTab));

    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (event.key === "ArrowRight") nextIndex = (tabIndex + 1) % menuTabs.length;
      if (event.key === "ArrowLeft") nextIndex = (tabIndex - 1 + menuTabs.length) % menuTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = menuTabs.length - 1;

      if (nextIndex !== null) {
        event.preventDefault();
        renderMenu(menuTabs[nextIndex].dataset.menuTab, true);
      }
    });
  });

  const dialog = document.querySelector("[data-reservation-dialog]");
  const reservationForm = document.querySelector("#reservation-form");
  const reservationTriggers = document.querySelectorAll(".reserve-trigger");
  const dialogClose = document.querySelector("[data-dialog-close]");
  const dialogCancel = document.querySelector("[data-dialog-cancel]");
  const finishPreview = document.querySelector("[data-finish-preview]");
  const completePreview = document.querySelector("[data-complete-preview]");
  const backToDetails = document.querySelector("[data-back-details]");
  const dateInput = document.querySelector("#reservation-date");
  const dateError = document.querySelector("#date-error");
  const dialogStatus = document.querySelector("[data-dialog-status]");
  const summary = document.querySelector("[data-reservation-summary]");
  const dialogSteps = Array.from(document.querySelectorAll("[data-dialog-step]"));
  const progressSteps = Array.from(document.querySelectorAll("[data-progress-step]"));
  let dialogOpener = null;

  const toDateValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const clearDateError = () => {
    dateInput?.removeAttribute("aria-invalid");
    dateInput?.removeAttribute("aria-describedby");
    dateError?.classList.remove("is-visible");
  };

  const nextDinnerDate = () => {
    const next = new Date();
    next.setHours(12, 0, 0, 0);
    next.setDate(next.getDate() + 2);

    while (next.getDay() === 1 || next.getDay() === 2) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  };

  const initializeDate = () => {
    if (!dateInput) return;

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const finalReleaseDate = new Date(today);
    finalReleaseDate.setDate(finalReleaseDate.getDate() + 30);

    dateInput.min = toDateValue(today);
    dateInput.max = toDateValue(finalReleaseDate);
    if (!dateInput.value) dateInput.value = toDateValue(nextDinnerDate());
    clearDateError();
  };

  const setProgress = (stepName) => {
    progressSteps.forEach((step) => {
      if (step.dataset.progressStep === stepName) {
        step.setAttribute("aria-current", "step");
      } else {
        step.removeAttribute("aria-current");
      }
    });
  };

  const showDialogStep = (stepName, shouldFocus = true) => {
    dialogSteps.forEach((step) => {
      step.hidden = step.dataset.dialogStep !== stepName;
    });
    setProgress(stepName);

    if (dialogStatus) {
      const statusText = {
        details: "Reservation details.",
        review: "Reservation review.",
        complete: "Reservation preview complete."
      };
      dialogStatus.textContent = statusText[stepName];
    }

    if (shouldFocus) {
      const activeStep = dialogSteps.find((step) => step.dataset.dialogStep === stepName);
      const heading = activeStep?.querySelector("h3");
      const firstField = activeStep?.querySelector("select, input, button");
      const focusTarget = heading || firstField;

      if (heading) heading.tabIndex = -1;
      window.requestAnimationFrame(() => focusTarget?.focus());
    }
  };

  const openDialog = (trigger) => {
    if (!dialog) return;

    dialogOpener = trigger;
    initializeDate();
    showDialogStep("details", false);
    document.body.classList.add("dialog-open");

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
    }

    window.requestAnimationFrame(() => dialogClose?.focus());
  };

  const closeDialog = () => {
    if (!dialog) return;

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      document.body.classList.remove("dialog-open");
      dialogOpener?.focus();
    }
  };

  reservationTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openDialog(trigger));
  });

  dialogClose?.addEventListener("click", closeDialog);
  dialogCancel?.addEventListener("click", closeDialog);
  finishPreview?.addEventListener("click", closeDialog);

  dialog?.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    dialogOpener?.focus();
  });

  dialog?.addEventListener("cancel", () => {
    document.body.classList.remove("dialog-open");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog?.hasAttribute("open")) {
      event.preventDefault();
      closeDialog();
    }
  });

  dateInput?.addEventListener("input", clearDateError);

  const addSummaryRow = (label, value) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const definition = document.createElement("dd");

    term.textContent = label;
    definition.textContent = value;
    row.append(term, definition);
    return row;
  };

  reservationForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!dateInput?.value) {
      dateInput?.setAttribute("aria-invalid", "true");
      dateInput?.setAttribute("aria-describedby", "date-error");
      dateError?.classList.add("is-visible");
      dateInput?.focus();
      return;
    }

    const formData = new FormData(reservationForm);
    const selectedDate = new Date(`${formData.get("date")}T12:00:00`);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(selectedDate);
    const guestsSelect = reservationForm.querySelector("#guests");
    const guestLabel = guestsSelect.options[guestsSelect.selectedIndex].textContent;

    summary?.replaceChildren(
      addSummaryRow("Guests", guestLabel),
      addSummaryRow("Date", formattedDate),
      addSummaryRow("Seating", String(formData.get("seating"))),
      addSummaryRow("Time", String(formData.get("time")))
    );

    showDialogStep("review");
  });

  backToDetails?.addEventListener("click", () => showDialogStep("details"));
  completePreview?.addEventListener("click", () => showDialogStep("complete"));

  const revealItems = document.querySelectorAll(".reveal");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hashTarget = window.location.hash
    ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
    : null;

  if (hashTarget && hashTarget !== document.body) {
    const hashSection = hashTarget.closest("section") || hashTarget;
    const hashReveals = hashSection.matches(".reveal")
      ? [hashSection]
      : Array.from(hashSection.querySelectorAll(".reveal"));

    hashReveals.forEach((item) => item.classList.add("is-visible"));
  }

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "0px"
      }
    );

    revealItems.forEach((item) => {
      if (!item.classList.contains("is-visible")) revealObserver.observe(item);
    });
  }
})();
