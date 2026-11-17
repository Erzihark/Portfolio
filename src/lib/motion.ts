// Page scripts: Crocky section lines, smooth scroll and reveal motion.
// Smooth scroll and reveal motion stay off with prefers-reduced-motion.
import { crocky, crockySay } from './store';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Each section has data-section (id) and data-crocky-line (text).
// A section becomes current when it crosses the middle of the viewport.
function watchSections() {
    const sections = document.querySelectorAll<HTMLElement>('[data-section]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                const el = e.target as HTMLElement;
                const id = el.dataset.section ?? '';
                if (!e.isIntersecting || id === crocky.section) continue;
                crocky.section = id;
                const line = el.dataset.crockyLine;
                if (line) crockySay(line, 'section');
            }
        },
        { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((s) => io.observe(s));
}

// Smooth scroll with Lenis. Anchor links keep an offset for the fixed header.
async function smoothScroll() {
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ anchors: { offset: -72 } });
    const loop = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

// Fade in blocks below the fold when they enter the viewport.
async function reveal() {
    const root = document.documentElement;
    let gsap: typeof import('gsap').gsap;
    try {
        ({ gsap } = await import('gsap'));
    } catch {
        root.classList.remove('reveal-pending');
        return;
    }
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92
    );
    if (!items.length) {
        root.classList.remove('reveal-pending');
        return;
    }
    gsap.set(items, { opacity: 0, y: 24 });
    // The inline styles now hide the items, so the CSS guard can go.
    root.classList.remove('reveal-pending');
    const io = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                if (!e.isIntersecting) continue;
                io.unobserve(e.target);
                gsap.to(e.target, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'all' });
            }
        },
        { rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach((el) => io.observe(el));
}

watchSections();
if (!reduced) {
    void smoothScroll();
    void reveal();
}
