const bands = document.querySelectorAll(".band");
const navLinks = document.querySelectorAll(".nav__links a");
const railItems = document.querySelectorAll(".rail__item");

const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 1) Band active（區塊浮現） */
if (prefersReducedMotion) {
  bands.forEach((b) => b.classList.add("is-active"));
} else {
  const bandIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-active");
        else e.target.classList.remove("is-active");
      });
    },
    {
      root: null,
      rootMargin: "-35% 0px -45% 0px",
      threshold: 0.01,
    }
  );

  bands.forEach((b) => bandIO.observe(b));
}

/* 2) Nav highlight（導覽列高亮 + Side rail 高亮） */
const heroTop = document.querySelector("#top");

const setActiveNav = (id) => {
  // top nav
  navLinks.forEach((a) => a.classList.remove("is-active"));
  if (id) {
    const link = document.querySelector(`.nav__links a[href="#${id}"]`);
    if (link) link.classList.add("is-active");
  }

  // side rail
  railItems.forEach((el) => el.classList.remove("is-active"));
  if (!id) return;
  const activeRail = document.querySelector(`.rail__item[data-target="${id}"]`);
  if (activeRail) activeRail.classList.add("is-active");
};

const navWatchTargets = [];
bands.forEach((b) => navWatchTargets.push(b));
if (heroTop) navWatchTargets.push(heroTop);

const navIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;

      const id = e.target.getAttribute("id");

      // 在 Hero 區：清掉高亮
      if (id === "top") {
        setActiveNav(null);
        return;
      }

      if (!id) return;
      setActiveNav(id);
    });
  },
  {
    root: null,
    rootMargin: "-40% 0px -50% 0px",
    threshold: 0.01,
  }
);

navWatchTargets.forEach((el) => navIO.observe(el));

/* 3) Rail 點擊：捲到對應章節（可保留 href 也可不用） */
railItems.forEach((item) => {
  item.addEventListener("click", (ev) => {
    const id = item.dataset.target;
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    ev.preventDefault();

    // 讓 nav/rail 立即亮（不等 IO）
    setActiveNav(id);

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
});

/* ===== HERO Parallax (very subtle) ===== */
(() => {
  const hero = document.querySelector(".hero");
  const overlay = document.querySelector(".hero__overlay");
  if (!hero || !overlay) return;
  if (prefersReducedMotion) return;

  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const MAX_SHIFT = isMobile ? 8 : 14;

  let ticking = false;

  const update = () => {
    ticking = false;

    const rect = hero.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    const progress = (rect.top + rect.height * 0.5 - vh * 0.5) / (vh * 0.5);
    const clamped = Math.max(-1, Math.min(1, progress));
    const shift = -clamped * MAX_SHIFT;

    overlay.style.setProperty("--hero-shift", `${shift}px`);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(update), { passive: true });
})();
