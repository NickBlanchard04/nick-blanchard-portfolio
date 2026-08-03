const founderSection = document.querySelector(".about-founder");
const readMoreButton = document.querySelector(".about-read-more");

readMoreButton?.addEventListener("click", () => {
  if (!founderSection) return;

  const expanded = !founderSection.classList.contains("is-expanded");
  founderSection.classList.toggle("is-expanded", expanded);
  readMoreButton.setAttribute("aria-expanded", String(expanded));
  readMoreButton.textContent = expanded ? "Read less" : "Read more";
});
