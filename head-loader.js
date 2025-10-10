// head-loader.js
// Dynamically loads /head.html into the document <head>.
// Usage: include this script in the page (before other scripts that depend on head resources)
(function () {
  function fetchAndInsertHead() {
    const candidates = [
      '/head.html',
      'head.html',
      '../head.html'
    ];

    function tryNext(i) {
      if (i >= candidates.length) return Promise.reject(new Error('head.html not found'));
      return fetch(candidates[i]).then(function (res) {
        if (!res.ok) return tryNext(i + 1);
        return res.text();
      }).catch(function () { return tryNext(i + 1); });
    }

    return tryNext(0).then(function (html) {
      // Insert the fragment into head
      const template = document.createElement('template');
      template.innerHTML = html.trim();

      // Compute base prefix to make relative paths in head.html work from subfolders
      // e.g., if current path is /posts/FIRE-Moment.html -> prefix = '../'
      const path = window.location.pathname; // e.g. /posts/FIRE-Moment.html
      const segments = path.split('/').filter(Boolean);
      // If path ends with a filename, remove that last segment
      if (segments.length && path[path.length - 1] !== '/') segments.pop();
      let prefix = '';
      for (let i = 0; i < segments.length; i++) prefix += '../';

      // Rewrite relative href/src attributes inside the template
      const frag = template.content;
      const ATTRS = ['href', 'src'];
      ATTRS.forEach(attr => {
        const nodes = frag.querySelectorAll('[' + attr + ']');
        nodes.forEach(node => {
          const val = node.getAttribute(attr);
          // Skip absolute URLs and root-relative (starting with /) and hashes
          if (!val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/') || val.startsWith('#')) return;
          node.setAttribute(attr, prefix + val);
        });
      });

      document.head.appendChild(frag);
    });
  }

  // Allow per-page title via a global variable or data-title on the script tag that included this file
  function applyPageTitle() {
    // If page set window.PAGE_TITLE before loading this script, use it
    if (window.PAGE_TITLE) {
      document.title = window.PAGE_TITLE;
      return;
    }
    // Otherwise, check for a <script data-title="..." src="/head-loader.js"> tag
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const t = scripts[i].getAttribute('data-title');
      if (t) {
        document.title = t;
        return;
      }
    }
  }

  // Normalize a provided URL to an absolute URL suitable for canonical/og:url.
  // Accepts absolute (http/https), protocol-relative (//), root-relative (/path) and relative paths.
  function toAbsoluteUrl(u) {
    try {
      if (!u) return null;
      if (u.indexOf('http://') === 0 || u.indexOf('https://') === 0) return u;
      if (u.indexOf('//') === 0) return window.location.protocol + u;
      if (u.indexOf('/') === 0) return window.location.origin + u;
      // relative path: resolve against current document location
      return new URL(u, window.location.href).href;
    } catch (e) {
      return u;
    }
  }

  // If a page set PAGE_META before this script runs, insert the most critical
  // SEO tags synchronously so crawlers that don't wait for the async head fetch
  // still see canonical/title/description. This helps prevent "Crawled - currently not indexed"
  // caused by missing canonical/meta at crawl-time.
  try {
    if (window.PAGE_META && typeof window.PAGE_META === 'object') {
      const early = window.PAGE_META;
      if (early.title) document.title = early.title;

      if (early.description) {
        let d = document.head.querySelector('meta[name="description"]');
        if (!d) {
          d = document.createElement('meta');
          d.setAttribute('name', 'description');
          document.head.appendChild(d);
        }
        d.setAttribute('content', early.description);
      }

      if (early.url) {
        let c = document.head.querySelector('link[rel="canonical"]');
        if (!c) {
          c = document.createElement('link');
          c.setAttribute('rel', 'canonical');
          document.head.appendChild(c);
        }
        c.setAttribute('href', toAbsoluteUrl(early.url) || early.url);
      }
    }
  } catch (e) {
    // Non-fatal; continue with async head fetch
    console.error('PAGE_META early injection error', e);
  }

  // Load head then apply title (and re-run any initialization that needs head resources)
  fetchAndInsertHead().then(function () {
      // After head is inserted, allow per-page meta overrides via window.PAGE_META
      // Example: window.PAGE_META = { title: 'Article Title', description: '...', image: '/img/hero.jpg', url: '/posts/hero.html' }
      try {
        if (window.PAGE_META && typeof window.PAGE_META === 'object') {
          const m = window.PAGE_META;
          if (m.title) document.title = m.title;

          // Helper to update or create meta tags
          function upsertMeta(selector, attrs) {
            let el = document.head.querySelector(selector);
            if (!el) {
              el = document.createElement('meta');
              Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
              document.head.appendChild(el);
              return el;
            }
            Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
            return el;
          }

          if (m.description) {
            upsertMeta('meta[name="description"]', { name: 'description', content: m.description });
            upsertMeta('meta[property="og:description"]', { property: 'og:description', content: m.description });
            upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: m.description });
          }
          if (m.image) {
            upsertMeta('meta[property="og:image"]', { property: 'og:image', content: m.image });
            upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: m.image });
          }
          if (m.url) {
            // Update canonical link (always use an absolute URL)
            const abs = toAbsoluteUrl(m.url) || m.url;
            let canonical = document.head.querySelector('link[rel="canonical"]');
            if (!canonical) {
              canonical = document.createElement('link');
              canonical.setAttribute('rel', 'canonical');
              document.head.appendChild(canonical);
            }
            canonical.setAttribute('href', abs);

            // og:url
            upsertMeta('meta[property="og:url"]', { property: 'og:url', content: abs });
          } else {
            // If no PAGE_META.url provided, ensure there is at least a canonical for the current page
            let canonical = document.head.querySelector('link[rel="canonical"]');
            if (!canonical) {
              canonical = document.createElement('link');
              canonical.setAttribute('rel', 'canonical');
              canonical.setAttribute('href', window.location.origin + window.location.pathname);
              document.head.appendChild(canonical);
            }
          }
          if (m.title) {
            upsertMeta('meta[property="og:title"]', { property: 'og:title', content: m.title });
            upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: m.title });
          }
        }
      } catch (e) {
        console.error('PAGE_META processing error', e);
      }
      applyPageTitle();
  }).catch(function (err) {
    console.error('head-loader error:', err);
    applyPageTitle();
  });
})();
