const bands = document.querySelectorAll(".band");
const navLinks = document.querySelectorAll(".nav__links a");

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

/* 2) Nav highlight（導覽列高亮） */
/* ✅ 改良：把 Hero(#top) 也納入監聽，回到封面時能清掉高亮 */
const heroTop = document.querySelector("#top");

const setActiveNav = (id) => {
  navLinks.forEach((a) => a.classList.remove("is-active"));
  if (!id) return;
  const link = document.querySelector(`.nav__links a[href="#${id}"]`);
  if (link) link.classList.add("is-active");
};

const navWatchTargets = [];
bands.forEach((b) => navWatchTargets.push(b));
if (heroTop) navWatchTargets.push(heroTop);

const navIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;

      const id = e.target.getAttribute("id");

      // 在 Hero 區：清掉高亮（或你想高亮某一個也行）
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

/* ===== HERO Parallax (very subtle) ===== */
(() => {
  const hero = document.querySelector(".hero");
  const overlay = document.querySelector(".hero__overlay");
  if (!hero || !overlay) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) return;

  // 視差幅度（px）：桌機小、手機更小（避免暈）
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const MAX_SHIFT = isMobile ? 8 : 14; // 非常輕微

  let ticking = false;

  const update = () => {
    ticking = false;

    const rect = hero.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    // hero 在視窗中的可視比例（-1 ~ 1）
    const progress = (rect.top + rect.height * 0.5 - vh * 0.5) / (vh * 0.5);
    const clamped = Math.max(-1, Math.min(1, progress));

    // 反向微移動：看起來像慢慢漂浮
    const shift = -clamped * MAX_SHIFT;

    // 寫到 CSS 變數（影響 ::before 圖片層）
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
