const founderSection = document.querySelector(".about-founder");
const readMoreButton = document.querySelector(".about-read-more");
const aboutPreview = document.querySelector("[data-about-preview]");
const aboutReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

readMoreButton?.addEventListener("click", () => {
  if (!founderSection) return;

  const expanded = !founderSection.classList.contains("is-expanded");
  founderSection.classList.toggle("is-expanded", expanded);
  readMoreButton.setAttribute("aria-expanded", String(expanded));
  readMoreButton.textContent = expanded ? "Read less" : "Read more";
});

if (aboutPreview && !aboutReducedMotion) {
  const previewFrames = [
    "../assets/green-wave-landscaping-desktop.png",
    "../assets/green-wave-landscaping-services.png"
  ];
  let previewIndex = 0;

  window.setInterval(() => {
    aboutPreview.classList.add("is-switching");

    window.setTimeout(() => {
      previewIndex = (previewIndex + 1) % previewFrames.length;
      aboutPreview.src = previewFrames[previewIndex];
      aboutPreview.classList.remove("is-switching");
    }, 240);
  }, 4200);
}
