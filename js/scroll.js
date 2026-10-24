/* Scroll-linked motion. Every tween is scrubbed to the scroll position,
   so it plays forward going down and rewinds going back up. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // wrap each word in a span so a sentence can light up word by word
  const splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    return $$('.w', el);
  };

  const mm = gsap.matchMedia();

  mm.add({
    motion: '(prefers-reduced-motion: no-preference)',
    wide: '(min-width: 861px)',
  }, (ctx) => {
    const { motion, wide } = ctx.conditions;
    if (!motion) return;

    /* ---------- hero: the drawing recedes as you leave it ---------- */
    gsap.to('.scene', {
      yPercent: -10, scale: 1.06, opacity: .25, transformOrigin: '50% 75%', ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-foot', {
      y: -70, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true },
    });

    /* ---------- letter ---------- */
    gsap.fromTo('.letter', { y: 90 }, {
      y: -30, ease: 'none',
      scrollTrigger: { trigger: '.letter-section', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo($$('.letter > p, .letter-salute'), { opacity: .12, y: 26 }, {
      opacity: 1, y: 0, stagger: .12, ease: 'none',
      scrollTrigger: { trigger: '.letter', start: 'top 75%', end: 'bottom 70%', scrub: 1 },
    });
    gsap.fromTo('.letter-sign', { clipPath: 'inset(0 100% 0 0)' }, {
      clipPath: 'inset(0 0% 0 0)', ease: 'none',
      scrollTrigger: { trigger: '.letter-sign', start: 'top 92%', end: 'top 62%', scrub: 1 },
    });
    gsap.fromTo('.letter-photo .arch img', { clipPath: 'inset(100% 0 0 0)', scale: 1.25 }, {
      clipPath: 'inset(0% 0 0 0)', scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.letter-photo', start: 'top 95%', end: 'top 25%', scrub: 1 },
    });
    gsap.fromTo('.letter-photo', { y: 120 }, {
      y: -60, ease: 'none',
      scrollTrigger: { trigger: '.letter-section', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* ---------- words that light up like candles ---------- */
    const split = $$('.craft-head .display, .timeline-head .display, .promise-text');
    split.forEach((el) => {
      gsap.fromTo(splitWords(el), { opacity: .14 }, {
        opacity: 1, stagger: .08, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 50%', scrub: 1 },
      });
    });

    /* ---------- the drawing becomes the night ---------- */
    const compare = $('[data-compare]');
    if (compare) {
      const range = $('.compare-range', compare);
      const tagL = $('.compare-tag-l', compare);
      const tagR = $('.compare-tag-r', compare);
      const setPos = (p) => {
        const v = 97 - p * 94;
        compare.style.setProperty('--pos', `${v}%`);
        range.value = v;
        tagL.style.opacity = Math.min(1, v / 25);
        tagR.style.opacity = Math.min(1, (100 - v) / 25);
      };
      setPos(0);
      ScrollTrigger.create({
        trigger: compare,
        start: 'center 54%',
        end: wide ? '+=140%' : '+=100%',
        pin: true,
        scrub: true,
        // measured before the triggers below it, which depend on the space the pin adds
        refreshPriority: 1,
        onUpdate: (self) => setPos(self.progress),
      });
      gsap.fromTo(compare, { clipPath: 'inset(8% 6% 8% 6%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: compare, start: 'top bottom', end: 'center 54%', scrub: true },
      });
    }

    // the rule between the two crafts grows, the icons draw themselves
    gsap.fromTo('.crafts', { '--grow': 0 }, {
      '--grow': 1, ease: 'none',
      scrollTrigger: { trigger: '.crafts', start: 'top 80%', end: 'bottom 70%', scrub: true },
    });
    $$('.craft-icon').forEach((icon) => {
      const parts = $$('path, circle, rect', icon);
      parts.forEach((p) => p.setAttribute('pathLength', '1'));
      gsap.fromTo(parts, { strokeDasharray: 1, strokeDashoffset: 1 }, {
        strokeDashoffset: 0, ease: 'none', stagger: .05,
        scrollTrigger: { trigger: icon, start: 'top 90%', end: 'top 55%', scrub: 1 },
      });
    });
    gsap.fromTo($$('.craft-col > :not(.craft-icon)'), { opacity: .1, y: 30 }, {
      opacity: 1, y: 0, stagger: .06, ease: 'none',
      scrollTrigger: { trigger: '.crafts', start: 'top 82%', end: 'center 60%', scrub: 1 },
    });

    /* ---------- the material board ---------- */
    gsap.fromTo('.board-name', { letterSpacing: '.14em', opacity: .2 }, {
      letterSpacing: '-.02em', opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.board-name', start: 'top 90%', end: 'top 45%', scrub: 1 },
    });
    gsap.fromTo('.board-img-a img', { scale: 1.2, yPercent: -6 }, {
      scale: 1.05, yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.board-img-a', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    if (wide) {
      gsap.fromTo('.board-img-b', { y: 90 }, {
        y: -50, ease: 'none',
        scrollTrigger: { trigger: '.edit', start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.fromTo('.board-img-c', { y: 180 }, {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: '.edit', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
    gsap.fromTo('.sw', { scale: .3, rotate: -120, opacity: 0 }, {
      scale: 1, rotate: 0, opacity: 1, stagger: .15, ease: 'none',
      scrollTrigger: { trigger: '.swatches', start: 'top 92%', end: 'top 55%', scrub: 1 },
    });

    /* ---------- recent work ---------- */
    gsap.fromTo($$('.work-list li'), { x: -70, opacity: .08 }, {
      x: 0, opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: '.work-list', start: 'top 85%', end: 'bottom 75%', scrub: 1 },
    });
    gsap.fromTo('.work-view', { scale: .82, opacity: .3 }, {
      scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.work-grid', start: 'top 90%', end: 'top 35%', scrub: 1 },
    });

    /* ---------- the ruler is measured out week by week ---------- */
    const ruler = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.ruler', start: 'top 85%', end: 'top 30%', scrub: 1 },
    });
    ruler.fromTo('.ruler', { clipPath: 'inset(-30px 100% -30px 0)' }, { clipPath: 'inset(-30px 0% -30px 0)', duration: 12 }, 0);
    $$('.milestones li').forEach((li) => {
      const at = parseFloat(li.style.getPropertyValue('--at')) || 0;
      ruler.fromTo(li, { opacity: .08, y: 34 }, { opacity: 1, y: 0, duration: 2 }, Math.max(0, at - 1));
    });

    /* ---------- credits ---------- */
    gsap.fromTo($$('.credit-names li'), { opacity: .1, y: 40 }, {
      opacity: 1, y: 0, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: '.credit-names', start: 'top 88%', end: 'bottom 60%', scrub: 1 },
    });
    gsap.fromTo($$('.words figure'), { opacity: .1, y: 50 }, {
      opacity: 1, y: 0, stagger: .2, ease: 'none',
      scrollTrigger: { trigger: '.words', start: 'top 90%', end: 'top 50%', scrub: 1 },
    });

    /* ---------- promise ---------- */
    gsap.fromTo('.promise-bg', { scale: 1.3, yPercent: -8 }, {
      scale: 1.05, yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.promise', start: 'top bottom', end: 'bottom top', scrub: true },
    });
    gsap.fromTo('.promise-lotus', { rotate: -45, scale: .4, opacity: 0 }, {
      rotate: 0, scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.promise', start: 'top 80%', end: 'top 35%', scrub: 1 },
    });

    /* ---------- kindly reply: the card and Sumit's card are laid down ---------- */
    gsap.fromTo('.rsvp', { y: 120, rotate: -2.5 }, {
      y: 0, rotate: 0, ease: 'none',
      scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 25%', scrub: 1 },
    });
    gsap.fromTo('.bizcard', { x: wide ? 160 : 0, y: wide ? 60 : 100, rotate: 7, opacity: .2 }, {
      x: 0, y: 0, rotate: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.contact', start: 'top 85%', end: 'center 60%', scrub: 1 },
    });

    /* ---------- footer ---------- */
    gsap.fromTo('.footer-s', { yPercent: 70, opacity: 0 }, {
      yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 40%', scrub: 1 },
    });

    return () => {
      // matchMedia reverts the tweens on a breakpoint change; restore the split sentences too
      split.forEach((el) => {
        el.textContent = el.getAttribute('aria-label');
        el.removeAttribute('aria-label');
      });
    };
  });

  // images arrive lazily; re-measure once everything has loaded
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
