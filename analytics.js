(() => {
  "use strict";

  // GA4 measurement IDs are public site identifiers, not credentials.
  const measurementId = "G-6JKKRXFKGN";
  const productionHosts = new Set(["builtbyblanch.com", "www.builtbyblanch.com"]);
  const debugMode = new URLSearchParams(window.location.search).get("ga_debug") === "1";
  const honorsPrivacySignal =
    navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1";

  const allowedEvents = new Set([
    "portfolio_project_view",
    "portfolio_project_click",
    "pricing_cta_click",
    "contact_intent",
    "booking_section_view",
    "booking_inquiry_prepared"
  ]);
  const allowedParameters = new Set([
    "project_id",
    "project_name",
    "plan_name",
    "contact_method",
    "placement",
    "preferred_date",
    "preferred_time"
  ]);

  const sanitizeParameters = (parameters = {}) => Object.fromEntries(
    Object.entries(parameters)
      .filter(([key, value]) => allowedParameters.has(key) && typeof value === "string")
      .map(([key, value]) => [key, value.trim().slice(0, 80)])
      .filter(([, value]) => value)
  );

  const track = (eventName, parameters = {}) => {
    if (!allowedEvents.has(eventName) || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", eventName, sanitizeParameters(parameters));
  };

  window.bbbAnalytics = Object.freeze({ track });

  if (
    honorsPrivacySignal ||
    (!productionHosts.has(window.location.hostname) && !debugMode)
  ) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 90,
    cookie_flags: "SameSite=Lax;Secure",
    cookie_update: false,
    debug_mode: debugMode,
    send_page_view: true
  });

  const googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(googleTag);
})();
