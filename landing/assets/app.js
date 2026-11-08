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

  /* Theme */
  const themeToggle = $('#themeToggle');
  const themeKey = 'strata-theme';

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    if (!themeToggle) return;
    const light = theme === 'daylight';
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  };

  if (themeToggle) {
    applyTheme(document.documentElement.dataset.theme || 'midnight');
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'daylight' ? 'midnight' : 'daylight';
      applyTheme(next);
      try {
        localStorage.setItem(themeKey, next);
      } catch {
        /* storage can be unavailable; the page still switches for this visit */
      }
    });
  }

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

  /* Flow tabs */
  const flowTabs = $$('.flow-step');
  const flowPanels = $$('.flow-panel');
  const flowProgress = $('#flowProgress');

  const activateFlow = (name, focus = false) => {
    const tab = flowTabs.find((t) => t.dataset.flow === name);
    const panel = flowPanels.find((p) => p.id === `flow-panel-${name}`);
    if (!tab || !panel) return;

    flowTabs.forEach((t) => {
      const selected = t === tab;
      t.classList.toggle('is-active', selected);
      t.setAttribute('aria-selected', String(selected));
      t.setAttribute('tabindex', selected ? '0' : '-1');
    });

    flowPanels.forEach((p) => {
      const selected = p === panel;
      p.classList.toggle('is-active', selected);
      p.hidden = !selected;
    });

    if (flowProgress) {
      const index = flowTabs.indexOf(tab);
      flowProgress.style.width = `${((index + 1) / flowTabs.length) * 100}%`;
    }
    if (focus) tab.focus();
  };

  flowTabs.forEach((tab) => {
    tab.addEventListener('click', () => activateFlow(tab.dataset.flow));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowDown' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const current = flowTabs.indexOf(tab);
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
      const next = forward
        ? (current + 1) % flowTabs.length
        : (current - 1 + flowTabs.length) % flowTabs.length;
      activateFlow(flowTabs[next].dataset.flow, true);
    });
  });

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
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    }
  };

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const panel = panels.find((p) => p.classList.contains('is-active'));
      const code = panel ? $('pre code', panel) : null;
      if (!code) return;

      await copyText(code.innerText);
      copyBtn.textContent = 'Copied';
      copyBtn.classList.add('is-copied');
      window.setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('is-copied');
      }, 1800);
    });
  }

  /* Copy quickstart */
  const copyQuickstart = $('#copyQuickstart');
  if (copyQuickstart) {
    copyQuickstart.addEventListener('click', async () => {
      const panel = copyQuickstart.closest('.quickstart-panel');
      const code = panel ? $('pre code', panel) : null;
      if (!code) return;

      await copyText(code.innerText);
      copyQuickstart.textContent = 'Copied';
      copyQuickstart.classList.add('is-copied');
      window.setTimeout(() => {
        copyQuickstart.textContent = 'Copy';
        copyQuickstart.classList.remove('is-copied');
      }, 1800);
    });
  }

  /* Pointer spotlight (desktop, fine pointers only) */
  const glow = $('#cursorGlow');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (glow && finePointer && !reduceMotion) {
    let raf = 0;
    let mx = 0;
    let my = 0;
    window.addEventListener('pointermove', (event) => {
      mx = event.clientX;
      my = event.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.setProperty('--mx', `${mx}px`);
        glow.style.setProperty('--my', `${my}px`);
        raf = 0;
      });
      glow.classList.add('is-on');
    }, { passive: true });
  }

  /* 3D strata tilt */
  const core = $('#core');
  const stage = $('#coreStage');
  if (core && stage && finePointer && !reduceMotion) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      core.style.setProperty('--ry', `${-15 + x * 14}deg`);
      core.style.setProperty('--rx', `${9 - y * 10}deg`);
      core.style.setProperty('--rz', `${-1.6 + x * 2}deg`);
    });
    stage.addEventListener('pointerleave', () => {
      core.style.setProperty('--ry', '-15deg');
      core.style.setProperty('--rx', '9deg');
      core.style.setProperty('--rz', '-1.6deg');
    });
  }

  /* Magnetic primary buttons (subtle) */
  if (finePointer && !reduceMotion) {
    $$('.btn-primary').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        button.style.transform = `translate(${x * 4}px, ${y * 3 - 2}px)`;
      });
      button.addEventListener('pointerleave', () => {
        button.style.transform = '';
      });
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
