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

/* 2) Nav highlight（導覽列高亮） */
/* ✅ 改良：把 Hero(#top) 也納入監聽，回到封面時能清掉高亮 */
const heroTop = document.querySelector("#top");

const setActiveNav = (id) => {
  // top nav
  navLinks.forEach((a) => a.classList.remove("is-active"));
  if (id) {
    const link = document.querySelector(`.nav__links a[href="#${id}"]`);
    if (link) link.classList.add("is-active");
  }

  // ✅ side rail
  railItems.forEach((el) => el.classList.remove("is-active"));
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

/* ===== Rail: 把每個節點放到 SVG 弧線上（CTM 版：精準貼線） ===== */
(() => {
  const nav = document.querySelector(".rail__nav");
  const svg = document.querySelector(".rail__curve");
  const path = document.querySelector("#railPath");
  const items = Array.from(document.querySelectorAll(".rail__item"));
  if (!nav || !svg || !path || items.length === 0) return;

  // 你有 5 個主題就用這組（可微調比例點）
  const ratios =
    items.length === 5
      ? [0.06, 0.28, 0.50, 0.72, 0.94]
      : items.map((_, i) => (i + 0.5) / items.length);

  const place = () => {
    const navRect = nav.getBoundingClientRect();
    const total = path.getTotalLength();

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    ratios.forEach((r, i) => {
      const el = items[i];
      if (!el) return;

      // 取弧線上的點（SVG 內座標）
      const p = path.getPointAtLength(total * r);

      // 轉成螢幕座標
      const screenX = p.x * ctm.a + p.y * ctm.c + ctm.e;
      const screenY = p.x * ctm.b + p.y * ctm.d + ctm.f;

      // 再轉成 nav 內座標
      const x = screenX - navRect.left;
      const y = screenY - navRect.top;

      // 讓「圓點中心」貼在弧線上
      const dot = el.querySelector(".rail__dot");
      const dotSize = dot ? dot.getBoundingClientRect().width : 12;

      el.style.left = `${x - dotSize / 2}px`;
      el.style.top = `${y - 10}px`; // 10 是讓整個 item 垂直視覺置中（可微調）
    });
  };

  // 初始與重算
  place();
  window.addEventListener("resize", place, { passive: true });
})();
