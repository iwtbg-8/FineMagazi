
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
  } else {
    menuBtn.style.display = "none";
    nav.style.display = "flex";
    nav.style.flexDirection = "row";
    nav.style.gap = "1.5rem";
  }
}

menuBtn.addEventListener("click", () => {
  if (!nav) return;
  if (nav.style.display === "none" || nav.style.display === "") {
    nav.style.display = "flex";
    nav.style.flexDirection = "column";
    nav.style.gap = "1rem";
  } else {
    nav.style.display = "none";
  }
});

// Load nav and initialize menu logic
window.addEventListener("DOMContentLoaded", () => {
  loadCommonNav(() => {
    nav = document.querySelector("#nav-placeholder nav");
    handleResize();
  });
});
window.addEventListener("resize", handleResize);


// ================= BACK TO TOP BUTTON (Keep as-is) =================
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
        darkModeBtn.textContent = '☀️ Light Mode';
    } else {
        body.classList.remove('dark');
        darkModeBtn.textContent = '🌙 Dark Mode';
    }
    updateMenuBtnColor(isDark);
  // Notify interested components/pages that the theme changed so they can update (charts, graphs, etc.)
  try {
    window.dispatchEvent(new Event('theme-change'));
  } catch (e) {
    // ignore dispatch errors on older browsers
  }
}

// 1. Check and apply theme on page load to make it PERMANENT
window.addEventListener("load", () => {
    handleResize(); // Ensure mobile menu state is correct
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
});

// 2. Handle the toggle button click and save preference
darkModeBtn.addEventListener("click", () => {
    // Determine the new theme state
    const isDark = !body.classList.contains('dark');
    
    applyTheme(isDark);

    // Save the new preference to localStorage
    const themeToSave = isDark ? 'dark' : 'light';
    localStorage.setItem(localStorageKey, themeToSave);
});

// Register service worker for improved caching (non-blocking)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err));
  });
}