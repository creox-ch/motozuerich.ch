/* MOTO-ZÜRICH UI kit — shared helpers: scroll fade-in + sequential counters */
const { useEffect, useRef } = React;

/* Fade element up on scroll-in (mirrors .body-fade behavior). */
function FadeIn({ as = "div", className = "", delay = 0, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add("in"), delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.18 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  const Tag = as;
  return <Tag ref={ref} className={"body-fade " + className} {...rest}>{children}</Tag>;
}

/* Swiss integer formatting: 22117 -> 22'117 */
function chInt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}
function deDecimal(n) {
  return n.toFixed(1).replace(".", ",");
}

const EASE = t => 1 - Math.pow(1 - t, 3);

function fmtVal(v, fmt, suffix) {
  return (fmt === "ch" ? chInt(v) : fmt === "dec" ? deDecimal(v) : Math.round(v)) + suffix;
}

/* Animate one number cell over `dur` ms, resolve when done.
   Uses setTimeout ticks (not rAF) so it still completes and lands on the
   final value even when the tab/iframe is backgrounded (rAF gets paused). */
function animateCell(big, target, fmt, suffix, dur = 550) {
  return new Promise((resolve) => {
    const start = performance.now();
    function step() {
      const p = Math.min((performance.now() - start) / dur, 1);
      big.textContent = fmtVal(target * EASE(p), fmt, suffix);
      if (p < 1) {
        setTimeout(step, 16);
      } else {
        big.textContent = fmtVal(target, fmt, suffix);
        big.closest(".num").classList.add("done");
        setTimeout(resolve, 280);
      }
    }
    step();
  });
}

/* Run all .num cells inside a grid sequentially, once it scrolls into view.
   Uses both IntersectionObserver and a scroll/visibility fallback so the
   sequence fires reliably regardless of how the grid enters the viewport. */
function useSequentialCounters(gridRef) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    let started = false;

    async function run() {
      if (started) return;
      started = true;
      const cells = Array.from(grid.querySelectorAll(".num-big"));
      for (const big of cells) {
        await animateCell(big, parseFloat(big.dataset.target), big.dataset.fmt, big.dataset.suffix || "");
      }
    }
    function visible() {
      const r = grid.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.85 && r.bottom > 0;
    }
    function check() {
      if (!started && visible()) { run(); cleanup(); }
    }
    function cleanup() {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (io) io.disconnect();
    }

    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) { run(); cleanup(); }
      }, { threshold: 0.2 });
      io.observe(grid);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check(); // in case the grid is already on-screen at mount

    return cleanup;
  }, []);
}

Object.assign(window, { FadeIn, useSequentialCounters });
