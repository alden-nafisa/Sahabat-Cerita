// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import CONFIG from './config';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Register service worker (respect Vite base for GitHub Pages)
  if ('serviceWorker' in navigator) {
    try {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      await navigator.serviceWorker.register(swUrl);
    } catch (err) {
      console.warn('SW registration failed', err);
    }
  }
});
