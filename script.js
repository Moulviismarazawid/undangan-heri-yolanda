// Helpers
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("to");
  if (!raw) return "Tamu Undangan";
  try {
    return (
      decodeURIComponent(raw.replace(/\+/g, " ")).trim() || "Tamu Undangan"
    );
  } catch {
    return raw.replace(/\+/g, " ").trim() || "Tamu Undangan";
  }
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/* =========================
   LUCIDE
========================= */
function initLucide() {
  if (window.lucide) lucide.createIcons();
}

/* =========================
   MUSIC
========================= */
let musicOn = false;

function setMusicIcon() {
  const icon = $("#musicToggle i");
  if (!icon) return;
  icon.setAttribute("data-lucide", musicOn ? "volume-2" : "volume-x");
  initLucide();
}

function toggleMusic(forceOn = null) {
  const audio = $("#bgm");
  if (!audio) return;

  const next = forceOn === null ? !musicOn : !!forceOn;
  musicOn = next;

  if (musicOn) audio.play().catch(() => {});
  else audio.pause();

  setMusicIcon();
}

function initMusicToggle() {
  const btn = $("#musicToggle");
  if (!btn) return;
  btn.addEventListener("click", () => toggleMusic());
  setMusicIcon();
}

/* =========================
   REVEAL (SCROLL)
========================= */
function initReveal() {
  const els = $$(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("show");
      });
    },
    { threshold: 0.12 },
  );

  els.forEach((el) => io.observe(el));
}

/* =========================
   COUNTDOWN
========================= */
function initCountdown() {
  const dEl = $("#cdDays"),
    hEl = $("#cdHours"),
    mEl = $("#cdMinutes"),
    sEl = $("#cdSeconds");
  if (!dEl || !hEl || !mEl || !sEl) return;

  // 15 Feb 2026 09:00 WIB (UTC+7) => 02:00 UTC
  const targetUTC = Date.UTC(2026, 1, 15, 2, 0, 0);

  const tick = () => {
    const diff = targetUTC - Date.now();
    if (diff <= 0) {
      dEl.textContent = "0";
      hEl.textContent = "0";
      mEl.textContent = "0";
      sEl.textContent = "0";
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    dEl.textContent = String(days);
    hEl.textContent = String(hours);
    mEl.textContent = String(mins);
    sEl.textContent = String(secs);
  };

  tick();
  setInterval(tick, 1000);
}

/* =========================
   WISHES (LOCAL)
========================= */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initWishes() {
  const form = $("#wishForm");
  const list = $("#wishList");
  if (!form || !list) return;

  const storeKey = "wishes_local_v1";

  function render() {
    const data = JSON.parse(localStorage.getItem(storeKey) || "[]");
    list.innerHTML = data
      .map(
        (item) => `
      <div class="panel">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="panel-title">${escapeHtml(item.name)}</div>
            <div class="isi opacity-80">${escapeHtml(item.attend)}</div>
          </div>
          <div class="isi opacity-70">${escapeHtml(item.time)}</div>
        </div>
        <p class="isi opacity-90 mt-2">${escapeHtml(item.text)}</p>
      </div>
    `,
      )
      .join("");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#wishName").value.trim();
    const text = $("#wishText").value.trim();
    const attend = $("#wishAttend").value;

    if (!name || !text) return;

    const now = new Date();
    const time = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

    const data = JSON.parse(localStorage.getItem(storeKey) || "[]");
    data.unshift({ name, text, attend, time });
    localStorage.setItem(storeKey, JSON.stringify(data));

    form.reset();
    render();
  });

  render();
}

/* =========================
   COPY + TOAST
========================= */
let toastTimer = null;

function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.bottom = "18px";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "999px";
    el.style.border = "1px solid rgba(255,255,255,.14)";
    el.style.background = "rgba(0,0,0,.35)";
    el.style.backdropFilter = "blur(8px)";
    el.style.color = "rgba(255,255,255,.92)";
    el.style.zIndex = "100";
    el.style.boxShadow = "0 16px 50px rgba(0,0,0,.45)";
    el.style.transition = "opacity 220ms ease";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.style.opacity = "0"), 1800);
}

function initCopy() {
  const copyDana = $("#copyDana");
  const copyLink = $("#copyLink");

  if (copyDana) {
    copyDana.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("085709324981");
        toast("Nomor DANA tersalin ✅");
      } catch {
        toast("Gagal copy. Tekan & tahan untuk salin.");
      }
    });
  }

  if (copyLink) {
    copyLink.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast("Link undangan tersalin ✅");
      } catch {
        toast("Gagal copy link.");
      }
    });
  }
}

/* =========================
   CURTAIN OPEN (ACARA)
========================= */
function initCurtain() {
  const sec = document.querySelector("#acara");
  if (!sec) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) sec.classList.add("curtain-open");
      });
    },
    { threshold: 0.2 },
  );

  io.observe(sec);
}

/* =========================
   HERO INTRO (ASSET SATU-SATU)
   ✅ dibuat lebih smooth (stagger + easing)
========================= */
function resetIntro() {
  const root = document.querySelector("#heroScene");
  if (!root) return;

  root
    .querySelectorAll(".intro.show")
    .forEach((el) => el.classList.remove("show"));
  root.querySelectorAll(".live").forEach((el) => el.classList.remove("live"));
  root.querySelector(".accent-maroon")?.classList.remove("show");
  root.querySelector(".introText")?.classList.remove("show");
}

async function runIntro() {
  const root = document.querySelector("#heroScene");
  if (!root) return;

  const order = [
    ".treeLayer",
    ".frameLayer",
    ".branchLayer",
    ".brownLayer",
    ".colorfulLayer",
    ".grassLayer",
  ];

  // 1) Asset muncul satu-satu (lebih smooth)
  for (let i = 0; i < order.length; i++) {
    const sel = order[i];
    const el = root.querySelector(sel);
    if (!el) continue;

    el.classList.add("show");
    // stagger halus (sedikit melambat)
    await wait(220 + i * 18);
  }

  // 2) Accent muncul
  await wait(220);
  root.querySelector(".accent-maroon")?.classList.add("show");

  // 3) Nama muncul terakhir
  await wait(260);
  root.querySelector(".introText")?.classList.add("show");

  // 4) Baru angin jalan
  await wait(320);
  root
    .querySelectorAll(".sway, .sway2, .sway3, .float, .float2")
    .forEach((el) => el.classList.add("live"));
}

/* =========================
   OPENING FLOW
========================= */
function initOpening() {
  const guestName = $("#guestName");
  if (guestName) guestName.textContent = getGuestName();

  const openBtn = $("#openBtn");
  const opening = $("#opening");
  const content = $("#content");

  if (!openBtn || !opening || !content) return;

  openBtn.addEventListener("click", () => {
    // show content
    content.classList.remove("hidden");

    // animate opening out
    opening.classList.add("hide");

    // start music after user gesture
    toggleMusic(true);

    // icons refresh
    initLucide();

    // run hero intro
    resetIntro();
    setTimeout(() => runIntro(), 260);

    // scroll to top of main content
    window.scrollTo({ top: 0, behavior: "smooth" });

    // after animation, remove opening
    setTimeout(() => {
      opening.style.display = "none";
    }, 720);
  });
}

/* =========================
   STORY BUBBLE MOTION (STAGGER)
========================= */
function initStoryBubbles() {
  const items = document.querySelectorAll(".bubbleMotion");
  if (!items.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const n = parseInt(el.getAttribute("data-stagger") || "1", 10);
        const delay = Math.min(900, Math.max(0, (n - 1) * 160));

        setTimeout(() => el.classList.add("show"), delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.25 },
  );

  items.forEach((el) => io.observe(el));
}

/* =========================
   GALLERY: reveal stagger + modal (tanpa blur)
========================= */
function initGallery() {
  const grid = document.getElementById("galleryGrid");
  const modal = document.getElementById("gModal");
  const modalImg = document.getElementById("gModalImg");
  const modalCap = document.getElementById("gModalCap");
  const modalClose = document.getElementById("gModalClose");

  if (!grid || !modal || !modalImg) return;

  // ---- REVEAL STAGGER ----
  const items = grid.querySelectorAll(".g2-item.reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const n = parseInt(el.getAttribute("data-stagger") || "1", 10);
        const delay = Math.min(900, Math.max(0, (n - 1) * 120));
        setTimeout(() => el.classList.add("show"), delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.2 },
  );
  items.forEach((el) => io.observe(el));

  // ---- MODAL OPEN ----
  function openModal(src, caption) {
    modalImg.onerror = () => {
      modalImg.removeAttribute("src");
      modalCap.textContent = "Gambar tidak ditemukan: " + src;
    };

    modalImg.src = src;
    modalCap.textContent = caption || "";
    modal.classList.remove("hidden");
    requestAnimationFrame(() => modal.classList.add("open"));
    document.body.style.overflow = "hidden";
  }

  // ---- MODAL CLOSE ----
  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      modal.classList.add("hidden");
      modalImg.src = "";
      modalCap.textContent = "";
    }, 260);
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".g2-item");
    if (!btn) return;

    const full = btn.getAttribute("data-full");
    const img = btn.querySelector("assets");
    const caption = img ? img.alt : "";

    if (!full) return;

    // ✅ bikin jadi absolute URL biar gak salah folder
    const resolved = new URL(full, document.baseURI).href;

    openModal(resolved, caption);
  });

  modalClose?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    const figure = e.target.closest(".gmodal-figure");
    const closeBtn = e.target.closest("#gModalClose");
    if (!figure && !closeBtn) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
}
function initMusicAutoUnlock() {
  const audio = $("#bgm");
  if (!audio) return;

  // coba autoplay (kadang bisa di desktop)
  audio
    .play()
    .then(() => {
      musicOn = true;
      setMusicIcon();
    })
    .catch(() => {});

  // fallback: sekali sentuh layar / scroll / klik -> langsung play
  const unlock = () => {
    if (musicOn) return;
    toggleMusic(true);
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("scroll", unlock);
  };

  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
  document.addEventListener("scroll", unlock, { once: true });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initLucide();
  initOpening();
  initMusicToggle();
  initMusicAutoUnlock();
  initReveal();
  initCountdown();
  initWishes();
  initCopy();
  initCurtain();
  initStoryBubbles();
  initGallery();

  // render icons once more (aman)
  initLucide();
});
