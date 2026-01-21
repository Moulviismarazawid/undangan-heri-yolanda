// Jalankan animasi pop satu-per-satu (stagger)
function playPopSequence() {
  const items = document.querySelectorAll(".pop-item");

  items.forEach((el, i) => {
    // jeda 220ms antar item
    setTimeout(() => {
      el.classList.add("pop-in");
    }, 220 * i);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btnOpen = document.getElementById("btnOpen");
  const cover = document.getElementById("cover");
  const content = document.getElementById("content");

  btnOpen.addEventListener("click", () => {
    // sembunyikan cover
    cover.style.display = "none";

    // tampilkan konten
    content.classList.add("show");
    content.setAttribute("aria-hidden", "false");

    // scroll ke atas konten biar rapi
    window.scrollTo({ top: 0, behavior: "smooth" });

    // mainkan animasi pop
    playPopSequence();
  });
});
