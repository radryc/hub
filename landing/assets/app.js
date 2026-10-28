/* Strata — interactions
   No dependencies. Everything degrades gracefully. */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Year */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Scroll progress + sticky nav */
  const progress = $('#progress');
  const nav = $('#nav');
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress) progress.style.transform = `scaleX(${ratio})`;
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const menuBtn = $('#menuBtn');
  const navLinks = $('#navLinks');

  const closeMenu = () => {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  };

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    $$('a', navLinks).forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (event) => {
      if (!navLinks.classList.contains('is-open')) return;
      if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* Reveal on scroll */
  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  }

  /* Active section in nav */
  const sections = $$('main section[id]');
  const navAnchors = $$('.nav-links a[href^="#"]');

  if ('IntersectionObserver' in window && sections.length && navAnchors.length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navAnchors.forEach((a) => {
            a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );
    sections.forEach((section) => activeObserver.observe(section));
  }

  /* Code tabs */
  const tabs = $$('.code-tab');
  const panels = $$('.code-panel-inner');
  const copyBtn = $('#copyBtn');
  const codeSection = $('#code');

  const activateTab = (name, focus = false) => {
    const tab = tabs.find((t) => t.dataset.tab === name);
    const panel = panels.find((p) => p.id === `panel-${name}`);
    if (!tab || !panel) return;

    tabs.forEach((t) => {
      const selected = t === tab;
      t.classList.toggle('is-active', selected);
      t.setAttribute('aria-selected', String(selected));
      t.setAttribute('tabindex', selected ? '0' : '-1');
    });

    panels.forEach((p) => {
      const selected = p === panel;
      p.classList.toggle('is-active', selected);
      p.hidden = !selected;
    });

    if (copyBtn) {
      copyBtn.classList.remove('is-copied');
      copyBtn.textContent = 'Copy';
    }
    if (focus) tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const current = tabs.indexOf(tab);
      const next = event.key === 'ArrowRight'
        ? (current + 1) % tabs.length
        : (current - 1 + tabs.length) % tabs.length;
      activateTab(tabs[next].dataset.tab, true);
    });
  });

  /* Product cards jump to the relevant primitive */
  $$('[data-tab-target]').forEach((button) => {
    button.addEventListener('click', () => {
      activateTab(button.dataset.tabTarget);
      if (codeSection) codeSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* Copy active snippet */
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const panel = panels.find((p) => p.classList.contains('is-active'));
      const code = panel ? $('pre code', panel) : null;
      if (!code) return;

      const text = code.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }

      copyBtn.textContent = 'Copied';
      copyBtn.classList.add('is-copied');
      window.setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('is-copied');
      }, 1800);
    });
  }

  /* Pointer spotlight (desktop, fine pointers only) */
  const spotlight = $('#spotlight');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (spotlight && finePointer && !reduceMotion) {
    let raf = 0;
    let mx = 0;
    let my = 0;
    window.addEventListener('pointermove', (event) => {
      mx = event.clientX;
      my = event.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        spotlight.style.setProperty('--mx', `${mx}px`);
        spotlight.style.setProperty('--my', `${my}px`);
        raf = 0;
      });
      spotlight.classList.add('is-on');
    }, { passive: true });
  }

  /* Subtle console tilt */
  const consoleEl = $('#console');
  if (consoleEl && finePointer && !reduceMotion) {
    const wrap = consoleEl.parentElement;
    wrap.addEventListener('pointermove', (event) => {
      const rect = wrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      consoleEl.style.setProperty('--ry', `${x * 7}deg`);
      consoleEl.style.setProperty('--rx', `${-y * 5}deg`);
    });
    wrap.addEventListener('pointerleave', () => {
      consoleEl.style.setProperty('--ry', '0deg');
      consoleEl.style.setProperty('--rx', '0deg');
    });
  }

  /* Pause ticker when the tab is hidden */
  const ticker = $('.ticker-track');
  if (ticker) {
    document.addEventListener('visibilitychange', () => {
      ticker.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  }
})();
