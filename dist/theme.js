'use strict';
(() => {
  const key = 'vt-lab-theme';
  const root = document.documentElement;
  const valid = value => value === 'dark' || value === 'light';
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Storage can be unavailable. */ }
  root.dataset.theme = valid(saved) ? saved : 'dark';

  function render(theme) {
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.querySelector('[data-theme-label]').textContent = 'THEME / ' + theme.toUpperCase();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    render(root.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        render(next);
        try { localStorage.setItem(key, next); } catch { /* The toggle still works for this page. */ }
      });
    });
  });

  addEventListener('storage', event => {
    if (event.key === key) render(valid(event.newValue) ? event.newValue : 'dark');
  });
})();
