const servicePageReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fitPanels = [...document.querySelectorAll("[data-horizontal-accordion] details")];

fitPanels.forEach((panel) => {
  panel.addEventListener("toggle", () => {
    if (!panel.open) {
      return;
    }

    fitPanels.forEach((otherPanel) => {
      if (otherPanel !== panel) {
        otherPanel.open = false;
      }
    });

    window.ScrollTrigger?.refresh();
  });
});

const initializeServicePageMotion = () => {
  if (servicePageReducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const heroTimeline = gsap.timeline({
    defaults: {
      duration: 0.9,
      ease: "power3.out"
    }
  });

  heroTimeline
    .from(".wd-breadcrumb", {
      y: 14,
      opacity: 0
    })
    .from(".wd-hero-context", {
      y: 18,
      opacity: 0
    }, "-=0.62")
    .from(".wd-hero h1", {
      yPercent: 22,
      opacity: 0,
      duration: 1.05
    }, "-=0.68")
    .from([".wd-hero-deck", ".wd-hero-actions", ".wd-hero-note"], {
      y: 20,
      opacity: 0,
      stagger: 0.08
    }, "-=0.62");

  gsap.from(".wd-proof p", {
    y: 42,
    opacity: 0,
    duration: 0.95,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".wd-proof",
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  gsap.utils.toArray(".wd-definition-list article, .wd-package, .wd-care-grid article")
    .forEach((item) => {
      gsap.from(item, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      });
    });

  const timelineCards = gsap.utils.toArray(".wd-timeline-stack > li");

  timelineCards.slice(0, -1).forEach((card, index) => {
    const nextCard = timelineCards[index + 1];

    gsap.to(card, {
      scale: 0.965,
      ease: "none",
      scrollTrigger: {
        trigger: nextCard,
        start: "top 82%",
        end: "top 34%",
        scrub: true
      }
    });
  });

  const motionMedia = gsap.matchMedia();

  motionMedia.add("(min-width: 1024px)", () => {
    const definitionSection = document.querySelector(".wd-definition");
    const definitionHeading = document.querySelector("[data-pin-heading]");

    if (!definitionSection || !definitionHeading) {
      return undefined;
    }

    const pin = ScrollTrigger.create({
      trigger: definitionSection,
      start: "top top+=128",
      end: () => `+=${Math.max(0, definitionSection.offsetHeight - definitionHeading.offsetHeight - 160)}`,
      pin: definitionHeading,
      pinSpacing: false,
      invalidateOnRefresh: true
    });

    return () => pin.kill();
  });

  const refreshAndRestoreHash = () => {
    ScrollTrigger.refresh();

    const hashTarget = document.getElementById(
      window.location.hash.slice(1)
    );

    if (!hashTarget) {
      return;
    }

    window.requestAnimationFrame(() => {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      hashTarget.scrollIntoView({ block: "start" });
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      window.requestAnimationFrame(() => ScrollTrigger.update());
    });
  };

  document.fonts?.ready.then(refreshAndRestoreHash);
  window.addEventListener("load", () => {
    window.requestAnimationFrame(refreshAndRestoreHash);
  }, { once: true });
};

initializeServicePageMotion();
