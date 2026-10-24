(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- header ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // underline the nav item for the section in view
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section').forEach((el) => sectionObserver.observe(el));

  /* ---------- hero drawing ---------- */
  const scene = document.querySelector('.scene');
  const scroller = document.querySelector('[data-scroller]');

  if (scene) {
    // bulbs along the string of lights
    const strand = scene.querySelector('#strand');
    const bulbs = scene.querySelector('#bulbs');
    const len = strand.getTotalLength();
    const count = 54;
    for (let i = 1; i < count; i++) {
      const p = strand.getPointAtLength((len * i) / count);
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'bulb-wrap');
      g.innerHTML =
        `<path class="faint" d="M${p.x} ${p.y} v5"/>` +
        `<circle class="bulb-halo" cx="${p.x}" cy="${p.y + 8}" r="11"/>` +
        `<circle class="bulb" cx="${p.x}" cy="${p.y + 8}" r="2.6"/>`;
      bulbs.appendChild(g);
    }

    // intro: the pen draws the scene from left to right
    if (!reduceMotion) {
      const shapes = scene.querySelectorAll('.art path, .art circle, .art rect:not(.hit), .art ellipse, .art text, .art .bulb-wrap');
      shapes.forEach((el) => {
        if (el.tagName !== 'text' && el.tagName !== 'g') el.setAttribute('pathLength', '1');
        let x = 0;
        try { const b = el.getBBox(); x = b.x + b.width / 2; } catch (_) { /* not rendered */ }
        el.style.setProperty('--d', `${(Math.max(0, x) / 1600 * 1.5 + Math.random() * .25).toFixed(2)}s`);
      });
      scene.classList.add('is-drawing');
      setTimeout(() => {
        scene.classList.remove('is-drawing');
        shapes.forEach((el) => el.removeAttribute('pathLength'));
      }, 3900);
    }

    // light up one piece, quiet the rest
    const spots = scene.querySelectorAll('.spot');
    const light = (spot) => {
      spots.forEach((s) => s.classList.toggle('is-active', s === spot));
      scene.classList.toggle('is-hovering', Boolean(spot));
    };
    spots.forEach((spot) => {
      spot.addEventListener('mouseenter', () => light(spot));
      spot.addEventListener('mouseleave', () => light(null));
      spot.addEventListener('focus', () => light(spot));
      spot.addEventListener('blur', () => light(null));
    });

    // on narrow screens open the panorama on the mandap
    const centre = () => {
      if (scroller.scrollWidth > scroller.clientWidth) {
        scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) * 0.5;
      }
    };
    centre();
    window.addEventListener('load', centre);
  }

  /* ---------- drawing / night comparison ---------- */
  // scroll moves the line (see scroll.js); the slider still works from the keyboard
  const compare = document.querySelector('[data-compare]');
  if (compare) {
    const range = compare.querySelector('.compare-range');
    range.addEventListener('input', () => compare.style.setProperty('--pos', `${range.value}%`));
  }

  /* ---------- work index ---------- */
  const work = document.querySelector('[data-work]');
  if (work) {
    const a = document.querySelector('[data-view-a]');
    const b = document.querySelector('[data-view-b]');
    let front = a, back = b;
    const buttons = [...work.querySelectorAll('button')];
    buttons.forEach((btn) => { const i = new Image(); i.src = btn.dataset.img; });
    const show = (btn) => {
      if (btn.getAttribute('aria-pressed') === 'true') return;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
      back.src = btn.dataset.img;
      back.alt = btn.dataset.alt;
      back.style.opacity = 1;
      front.style.opacity = 0;
      front.alt = '';
      back.removeAttribute('aria-hidden');
      front.setAttribute('aria-hidden', 'true');
      [front, back] = [back, front];
    };
    buttons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => show(btn));
      btn.addEventListener('focus', () => show(btn));
      btn.addEventListener('click', () => show(btn));
    });
  }

  /* ---------- kindly reply (demo: no backend) ---------- */
  const form = document.querySelector('[data-form]');
  if (form) {
    const status = form.querySelector('[data-status]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = [...form.querySelectorAll('[required]')].filter((input) => {
        const empty = !input.value.trim();
        input.closest('.blank').classList.toggle('is-invalid', empty);
        return empty;
      });
      if (missing.length) {
        status.classList.add('is-error');
        status.textContent = missing.length === 2
          ? 'Add your name and a phone number so we can call you back.'
          : missing[0].name === 'name' ? 'Add your name so we know who to ask for.' : 'Add a phone number so we can call you back.';
        missing[0].focus();
        return;
      }
      status.classList.remove('is-error');
      const name = form.elements.name.value.trim().split(' ')[0];
      status.textContent = `Thank you, ${name}. Sumit will call you within one working day.`;
      form.reset();
    });
  }
})();
