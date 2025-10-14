// ================= UNIFIED SCRIPT FOR ALL PAGES =================
// This script provides consistent functionality across all pages:
// - Dynamic navigation loading
// - Dynamic footer loading
// - Persistent theme management
// - Mobile menu functionality
// - Back to top button

// ================= COMMON NAV LOADER =================
function loadCommonNav(callback) {
  const navPlaceholder = document.getElementById("nav-placeholder");
  if (!navPlaceholder) return;
  // Try several candidate paths so pages in subdirectories can still load the root nav.
  const candidates = [
    "nav.html",
    "../nav.html",
    "/nav.html"
  ];

  let i = 0;
  function tryNext() {
    if (i >= candidates.length) {
      console.error('loadCommonNav: failed to load nav.html from any candidate path:', candidates);
      return Promise.reject(new Error('Failed to load nav.html'));
    }

    const path = candidates[i++];
    return fetch(path).then(response => {
      if (!response.ok) {
        // try next candidate
        return tryNext();
      }
      return response.text();
    }).catch(() => {
      // network error -> try next
      return tryNext();
    });
  }

  tryNext()
    .then(html => {
      if (!html) return;

      // Compute prefix based on page path (same logic as head-loader)
      const path = window.location.pathname;
      const segments = path.split('/').filter(Boolean);
      if (segments.length && path[path.length - 1] !== '/') segments.pop();
      let prefix = '';
      for (let i = 0; i < segments.length; i++) prefix += '../';

      // Create a container and rewrite relative hrefs
      const container = document.createElement('div');
      container.innerHTML = html;
      const links = container.querySelectorAll('a[href]');
      links.forEach(a => {
        const h = a.getAttribute('href');
        if (!h) return;
        if (h.startsWith('http://') || h.startsWith('https://') || h.startsWith('/') || h.startsWith('#')) return;
        a.setAttribute('href', prefix + h);
      });

      navPlaceholder.innerHTML = container.innerHTML;
      if (typeof callback === "function") callback();
    })
    .catch(err => {
      console.error('loadCommonNav: unable to load nav.html', err);
    });
}

// ================= COMMON FOOTER LOADER =================
function loadCommonFooter() {
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (!footerPlaceholder) return;
  
  // Try several candidate paths so pages in subdirectories can still load the root footer.
  const candidates = [
    "footer.html",
    "../footer.html",
    "/footer.html"
  ];

  let i = 0;
  function tryNext() {
    if (i >= candidates.length) {
      console.error('loadCommonFooter: failed to load footer.html from any candidate path:', candidates);
      return Promise.reject(new Error('Failed to load footer.html'));
    }

    const path = candidates[i++];
    return fetch(path).then(response => {
      if (!response.ok) {
        // try next candidate
        return tryNext();
      }
      return response.text();
    }).catch(() => {
      // network error -> try next
      return tryNext();
    });
  }

  tryNext()
    .then(html => {
      if (!html) return;

      // Compute prefix based on page path (same logic as nav loader)
      const path = window.location.pathname;
      const segments = path.split('/').filter(Boolean);
      if (segments.length && path[path.length - 1] !== '/') segments.pop();
      let prefix = '';
      for (let i = 0; i < segments.length; i++) prefix += '../';

      // Create a container and rewrite relative hrefs
      const container = document.createElement('div');
      container.innerHTML = html;
      
      // Rewrite relative links in footer
      const links = container.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          link.setAttribute('href', prefix.slice(0, -1) + href);
        } else if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
          link.setAttribute('href', prefix + href);
        }
      });

      footerPlaceholder.innerHTML = container.innerHTML;
    })
    .catch(error => {
      console.error('Failed to load footer:', error);
      // Fallback footer
      footerPlaceholder.innerHTML = `
        <footer class="footer">
          <div class="container">
            <p>&copy; 2025 FineMagazi. All rights reserved. | <a href="/privacy-policy.html">Privacy Policy</a> | <a href="/About-Us.html">About Us</a></p>
          </div>
        </footer>
      `;
    });
}

// ================= MOBILE MENU TOGGLE (Revised for dynamic nav) =================
let nav = null;
const menuBtn = document.createElement("button");
menuBtn.innerText = "\u2630";
menuBtn.id = "menu-btn";
menuBtn.style.fontSize = "1.5rem";
menuBtn.style.background = "none";
menuBtn.style.border = "none";
menuBtn.style.cursor = "pointer";
menuBtn.style.display = "none";
menuBtn.style.color = "var(--text-dark)"; // Initial color, will be updated by theme logic
// Use a class-based approach for styling rather than inline styles so CSS can
// reserve space or position the button without layout shifts.
menuBtn.className = 'menu-btn';
// Append to header but position absolutely to avoid affecting header flow
const headerEl = document.querySelector("header");
if (headerEl) {
  headerEl.appendChild(menuBtn);
}

function updateMenuBtnColor(isDark) {
  // Keep only color change here; visual layout handled via CSS.
  menuBtn.style.color = isDark ? "#eee" : "#111";
}

function handleResize() {
  if (!nav) return;
  
  if (window.innerWidth <= 768) {
    menuBtn.style.display = "block";
    nav.style.display = "none";
    nav.classList.remove('mobile-nav-open');
  } else {
    menuBtn.style.display = "none";
    nav.style.display = "flex";
    nav.style.flexDirection = "row";
    nav.style.gap = "1.5rem";
    nav.style.position = "static";
    nav.style.background = "none";
    nav.style.border = "none";
    nav.style.boxShadow = "none";
    nav.style.padding = "0";
    nav.classList.remove('mobile-nav-open');
  }
}

menuBtn.addEventListener("click", () => {
  if (!nav) return;
  
  if (nav.classList.contains('mobile-nav-open')) {
    nav.classList.remove('mobile-nav-open');
    nav.style.display = "none";
    menuBtn.innerHTML = "\u2630"; // Hamburger icon
  } else {
    nav.classList.add('mobile-nav-open');
    nav.style.display = "flex";
    nav.style.flexDirection = "column";
    nav.style.gap = "1rem";
    menuBtn.innerHTML = "\u00D7"; // X icon
  }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!nav) return;
  
  if (window.innerWidth <= 768 && 
      nav.classList.contains('mobile-nav-open') && 
      !nav.contains(e.target) && 
      !menuBtn.contains(e.target)) {
    nav.classList.remove('mobile-nav-open');
    nav.style.display = "none";
    menuBtn.innerHTML = "\u2630";
  }
});

// Load nav and footer and initialize menu logic
window.addEventListener("DOMContentLoaded", () => {
  loadCommonNav(() => {
    nav = document.querySelector("#nav-placeholder nav");
    if (nav) {
      handleResize();
    }
  });
  
  // Load common footer
  loadCommonFooter();
});
window.addEventListener("resize", handleResize);

// ================= BACK TO TOP BUTTON =================
const backToTop = document.createElement("button");
backToTop.innerText = "↑ Top";
backToTop.id = "back-to-top";
backToTop.style.position = "fixed";
backToTop.style.bottom = "20px";
backToTop.style.right = "20px";
backToTop.style.padding = "10px 15px";
backToTop.style.fontSize = "1rem";
backToTop.style.background = "#0077cc";
backToTop.style.color = "#fff";
backToTop.style.border = "none";
backToTop.style.borderRadius = "5px";
backToTop.style.cursor = "pointer";
backToTop.style.display = "none";

document.body.appendChild(backToTop);

// Show button when scrolling down
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
});

// Scroll to top on click
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ================= PERMANENT DARK MODE TOGGLE (REVISED) =================
const darkModeBtn = document.getElementById("dark-mode");
const body = document.body;
const localStorageKey = 'themePreference';

// Function to apply the theme state (class, button text, and menu color)
function applyTheme(isDark) {
    if (isDark) {
        body.classList.add('dark');
        if (darkModeBtn) darkModeBtn.textContent = '☀️ Light Mode';
    } else {
        body.classList.remove('dark');
        if (darkModeBtn) darkModeBtn.textContent = '🌙 Dark Mode';
    }
    updateMenuBtnColor(isDark);
    
    // Update back to top button for dark mode
    if (isDark) {
        backToTop.style.background = "#66aaff";
    } else {
        backToTop.style.background = "#0077cc";
    }
    
    // Notify interested components/pages that the theme changed so they can update (charts, graphs, etc.)
    try {
        window.dispatchEvent(new Event('theme-change'));
    } catch (e) {
        // ignore dispatch errors on older browsers
    }
}

// Function to initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem(localStorageKey);
    let isDark = false;

    // Check localStorage first
    if (savedTheme === 'dark') {
        isDark = true;
    } else if (savedTheme === null && window.matchMedia) {
        // If no preference is saved, respect the user's OS setting
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    applyTheme(isDark);
}

// 1. Check and apply theme on page load to make it PERMANENT
window.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
});

// Also apply on window load as backup
window.addEventListener("load", () => {
    handleResize(); // Ensure mobile menu state is correct
    initializeTheme(); // Apply theme again as backup
});

// 2. Handle the toggle button click and save preference
if (darkModeBtn) {
    darkModeBtn.addEventListener("click", () => {
        // Determine the new theme state
        const isDark = !body.classList.contains('dark');
        
        applyTheme(isDark);

        // Save the new preference to localStorage
        const themeToSave = isDark ? 'dark' : 'light';
        localStorage.setItem(localStorageKey, themeToSave);
    });
}

// Register service worker for improved caching (non-blocking)
if ('serviceWorker' in navigator) {
  // Ensure we only register once and prefer the canonical '/service-worker.js'
  window.addEventListener('load', async () => {
    try {
      // Unregister any legacy service worker scripts (like '/sw.js') that may cause conflicts
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const r of registrations) {
        if (r.active && (r.active.scriptURL.endsWith('/sw.js') || r.active.scriptURL.endsWith('/service-worker-legacy.js'))) {
          try { await r.unregister(); console.log('Unregistered legacy service worker:', r.active.scriptURL); } catch (e) { /* ignore */ }
        }
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('SW registered:', registration.scope);

      // Prompt the new worker to take control when available to reduce stale page issues on mobile
      if (registration.waiting) {
        // There's an updated worker waiting — instruct it to skipWaiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Listen for updates and notify when a new SW becomes active
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available — ask it to skip waiting so clients can refresh
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
      });

      // When the controlling worker changes, reload the page to get the latest content
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed — reloading to activate new SW');
        window.location.reload();
      });
    } catch (err) {
      console.warn('SW registration/update failed:', err);
    }
  });
}