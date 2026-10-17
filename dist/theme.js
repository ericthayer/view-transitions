'use strict';
(() => {
  const key = 'vt-lab-theme';
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  const valid = value => value === 'dark' || value === 'light';
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Storage can be unavailable. */ }
  let preference = valid(saved) ? saved : null;
  const systemTheme = () => system.matches ? 'dark' : 'light';
  root.dataset.theme = preference ?? systemTheme();

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
        preference = next;
        render(next);
        try { localStorage.setItem(key, next); } catch { /* The toggle still works for this page. */ }
      });
    });
  });

  system.addEventListener('change', () => {
    if (preference === null) render(systemTheme());
  });

  addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : null;
    render(preference ?? systemTheme());
  });
})();
