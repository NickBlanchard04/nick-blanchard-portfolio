document.documentElement.classList.add("js-enabled");

const menuFilterButtons = [...document.querySelectorAll("[data-menu-filter]")];
const menuGroups = [...document.querySelectorAll("[data-menu-group]")];
const addItemButtons = [...document.querySelectorAll("[data-add-item]")];
const openOrderButtons = [...document.querySelectorAll("[data-open-order]")];
const closeOrderButtons = [...document.querySelectorAll("[data-close-order]")];
const cartCountNodes = [...document.querySelectorAll("[data-cart-count]")];
const orderDialog = document.querySelector("#order-dialog");
const cartItemsNode = document.querySelector("[data-cart-items]");
const cartEmptyNode = document.querySelector("[data-cart-empty]");
const cartFilledNode = document.querySelector("[data-cart-filled]");
const cartSubtotalNode = document.querySelector("[data-cart-subtotal]");
const cartStatusNode = document.querySelector("#cart-status");
const mobileCartBar = document.querySelector(".mobile-cart-bar");
const bagView = document.querySelector('[data-order-view="bag"]');
const confirmationView = document.querySelector('[data-order-view="confirmation"]');
const reviewOrderButton = document.querySelector("[data-review-order]");
const keepBrowsingButton = document.querySelector("[data-keep-browsing]");
const clearCartButton = document.querySelector("[data-clear-cart]");
const mobileMenuButton = document.querySelector(".mobile-menu-button");
const mobileNavigation = document.querySelector("#mobile-navigation");
const reservationControls = document.querySelector("#reservation-controls");
const reservationDialog = document.querySelector("#reservation-dialog");
const reservationSummary = document.querySelector("[data-reservation-summary]");
const closeReservationButtons = [...document.querySelectorAll("[data-close-reservation]")];
const reservationDate = document.querySelector("#reservation-date");
const reservationTime = document.querySelector("#reservation-time");
const reservationParty = document.querySelector("#reservation-party");
const reservationActionButton = document.querySelector("[data-reservation-preview]");

const cart = new Map();
const addFeedbackTimers = new WeakMap();
let lastOrderTrigger = null;
let lastReservationTrigger = null;

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const getCartCount = () =>
  [...cart.values()].reduce((total, item) => total + item.quantity, 0);

const getCartSubtotal = () =>
  [...cart.values()].reduce((total, item) => total + item.price * item.quantity, 0);

const announce = (message) => {
  cartStatusNode.textContent = "";
  window.requestAnimationFrame(() => {
    cartStatusNode.textContent = message;
  });
};

const setOrderView = (view) => {
  const showingConfirmation = view === "confirmation";
  bagView.hidden = showingConfirmation;
  confirmationView.hidden = !showingConfirmation;
};

const renderCart = () => {
  const count = getCartCount();
  const hasItems = count > 0;

  cartCountNodes.forEach((node) => {
    node.textContent = String(count);
    if (node.classList.contains("header-order-count")) {
      node.hidden = !hasItems;
    }
  });

  mobileCartBar.hidden = !hasItems;
  cartEmptyNode.hidden = hasItems;
  cartFilledNode.hidden = !hasItems;
  cartSubtotalNode.textContent = formatCurrency(getCartSubtotal());
  cartItemsNode.replaceChildren();

  cart.forEach((item) => {
    const cartItem = document.createElement("article");
    cartItem.className = "cart-item";
    cartItem.dataset.cartItemId = item.id;

    const heading = document.createElement("h3");
    heading.textContent = item.name;

    const price = document.createElement("span");
    price.className = "cart-item-price";
    price.textContent = formatCurrency(item.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const decreaseButton = document.createElement("button");
    decreaseButton.className = "quantity-button";
    decreaseButton.type = "button";
    decreaseButton.dataset.cartAction = "decrease";
    decreaseButton.dataset.itemId = item.id;
    decreaseButton.setAttribute("aria-label", `Decrease ${item.name} quantity`);
    decreaseButton.textContent = "−";

    const quantity = document.createElement("span");
    quantity.className = "cart-item-quantity";
    quantity.textContent = String(item.quantity);
    quantity.setAttribute("aria-label", `Quantity ${item.quantity}`);

    const increaseButton = document.createElement("button");
    increaseButton.className = "quantity-button";
    increaseButton.type = "button";
    increaseButton.dataset.cartAction = "increase";
    increaseButton.dataset.itemId = item.id;
    increaseButton.setAttribute("aria-label", `Increase ${item.name} quantity`);
    increaseButton.textContent = "+";

    const removeButton = document.createElement("button");
    removeButton.className = "text-button";
    removeButton.type = "button";
    removeButton.dataset.cartAction = "remove";
    removeButton.dataset.itemId = item.id;
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${item.name} from sample order`);

    controls.append(decreaseButton, quantity, increaseButton, removeButton);
    cartItem.append(heading, price, controls);
    cartItemsNode.append(cartItem);
  });
};

const addItem = (button) => {
  const item = {
    id: button.dataset.itemId,
    name: button.dataset.itemName,
    price: Number(button.dataset.itemPrice),
  };
  const existingItem = cart.get(item.id);

  cart.set(item.id, {
    ...item,
    quantity: existingItem ? existingItem.quantity + 1 : 1,
  });

  renderCart();
  const currentCount = getCartCount();
  announce(
    `${item.name} added for preview. Sample order now has ${currentCount} ${currentCount === 1 ? "item" : "items"}.`,
  );

  const feedbackLabel = button.querySelector("span:last-child");
  const originalText = feedbackLabel.dataset.defaultText || feedbackLabel.textContent;
  feedbackLabel.dataset.defaultText = originalText;

  const existingTimer = addFeedbackTimers.get(button);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  feedbackLabel.textContent = "Added for preview";
  const feedbackTimer = window.setTimeout(() => {
    feedbackLabel.textContent = feedbackLabel.dataset.defaultText;
    addFeedbackTimers.delete(button);
  }, 1100);
  addFeedbackTimers.set(button, feedbackTimer);
};

const updateCartItem = (itemId, action) => {
  const item = cart.get(itemId);
  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
    announce(`${item.name} quantity increased to ${item.quantity}.`);
  }

  if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.delete(itemId);
      announce(`${item.name} removed from the sample order.`);
    } else {
      announce(`${item.name} quantity decreased to ${item.quantity}.`);
    }
  }

  if (action === "remove") {
    cart.delete(itemId);
    announce(`${item.name} removed from the sample order.`);
  }

  renderCart();
};

const openOrderDialog = (trigger) => {
  lastOrderTrigger = trigger;
  setOrderView("bag");
  if (!orderDialog.open) {
    orderDialog.showModal();
  }
  orderDialog.querySelector("[data-close-order]").focus();
};

const closeOrderDialog = () => {
  if (orderDialog.open) {
    orderDialog.close();
  }
};

menuFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedGroup = button.dataset.menuFilter;

    menuFilterButtons.forEach((filterButton) => {
      filterButton.setAttribute(
        "aria-pressed",
        String(filterButton.dataset.menuFilter === selectedGroup),
      );
    });

    menuGroups.forEach((group) => {
      group.hidden = group.dataset.menuGroup !== selectedGroup;
    });

    const visibleHeading = document.querySelector(
      `[data-menu-group="${selectedGroup}"] .menu-group-heading h3`,
    );
    announce(`${visibleHeading.textContent} menu shown.`);
  });
});

addItemButtons.forEach((button) => {
  button.addEventListener("click", () => addItem(button));
});

openOrderButtons.forEach((button) => {
  button.addEventListener("click", () => openOrderDialog(button));
});

closeOrderButtons.forEach((button) => {
  button.addEventListener("click", closeOrderDialog);
});

cartItemsNode.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-cart-action]");
  if (!actionButton) return;
  updateCartItem(actionButton.dataset.itemId, actionButton.dataset.cartAction);
});

reviewOrderButton.addEventListener("click", () => {
  if (getCartCount() === 0) return;
  setOrderView("confirmation");
  confirmationView.querySelector("h3").focus?.();
  keepBrowsingButton.focus();
});

keepBrowsingButton.addEventListener("click", closeOrderDialog);

clearCartButton.addEventListener("click", () => {
  cart.clear();
  renderCart();
  setOrderView("bag");
  announce("Sample order cleared.");
  cartEmptyNode.querySelector("button").focus();
});

orderDialog.addEventListener("close", () => {
  setOrderView("bag");
  const focusTarget = [
    lastOrderTrigger,
    mobileCartBar,
    mobileMenuButton,
    ...openOrderButtons,
    document.querySelector(".site-logo"),
  ].find(
    (element) =>
      element?.isConnected &&
      element.getClientRects().length > 0 &&
      window.getComputedStyle(element).visibility !== "hidden",
  );

  focusTarget?.focus();
  lastOrderTrigger = null;
});

orderDialog.addEventListener("click", (event) => {
  if (event.target === orderDialog) {
    closeOrderDialog();
  }
});

mobileMenuButton.addEventListener("click", () => {
  const isOpen = mobileMenuButton.getAttribute("aria-expanded") === "true";
  mobileMenuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileNavigation.hidden = isOpen;
  mobileMenuButton.querySelector(".mobile-menu-label").textContent = isOpen ? "Menu" : "Close";
});

mobileNavigation.addEventListener("click", (event) => {
  if (!event.target.closest("a, button")) return;
  mobileNavigation.hidden = true;
  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenuButton.querySelector(".mobile-menu-label").textContent = "Menu";
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (reservationDialog.open) {
    event.preventDefault();
    reservationDialog.close();
    return;
  }

  if (orderDialog.open) {
    event.preventDefault();
    closeOrderDialog();
    return;
  }

  if (!mobileNavigation.hidden) {
    mobileNavigation.hidden = true;
    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuButton.querySelector(".mobile-menu-label").textContent = "Menu";
    mobileMenuButton.focus();
  }
});

const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
  .toISOString()
  .split("T")[0];
reservationDate.min = localDate;

const openReservationPreview = () => {
  const requiredFields = [reservationDate, reservationTime, reservationParty];
  const invalidField = requiredFields.find((field) => !field?.checkValidity());

  if (invalidField) {
    invalidField.reportValidity();
    return;
  }

  lastReservationTrigger = reservationActionButton;
  const selectedDate = new Date(`${reservationDate.value}T12:00:00`);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(selectedDate);
  const partySize = reservationParty.value;
  const peopleLabel = partySize === "1" ? "person" : "people";

  reservationSummary.textContent = `${formattedDate} at ${reservationTime.value} for ${partySize} ${peopleLabel}.`;
  reservationDialog.showModal();
  reservationDialog.querySelector("[data-close-reservation]").focus();
};

reservationActionButton.addEventListener("click", openReservationPreview);

reservationControls.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    openReservationPreview();
  }
});

closeReservationButtons.forEach((button) => {
  button.addEventListener("click", () => reservationDialog.close());
});

reservationDialog.addEventListener("close", () => {
  lastReservationTrigger?.focus();
});

reservationDialog.addEventListener("click", (event) => {
  if (event.target === reservationDialog) {
    reservationDialog.close();
  }
});

const revealElements = [...document.querySelectorAll("[data-reveal]")];

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

window.setTimeout(() => {
  document
    .querySelectorAll(".hero [data-reveal]")
    .forEach((element) => element.classList.add("is-visible"));
}, 90);

window.setTimeout(() => {
  revealElements.forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      element.classList.add("is-visible");
    }
  });
}, 180);

window.setTimeout(() => {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}, 1200);

renderCart();
