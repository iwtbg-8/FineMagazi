// ================= MOBILE MENU TOGGLE (Keep as-is) =================
const nav = document.querySelector("header nav");
const menuBtn = document.createElement("button");

menuBtn.innerText = "☰";
menuBtn.id = "menu-btn";
menuBtn.style.fontSize = "1.5rem";
menuBtn.style.background = "none";
menuBtn.style.border = "none";
menuBtn.style.cursor = "pointer";
menuBtn.style.display = "none";
menuBtn.style.color = "var(--text-dark)"; // Initial color, will be updated by theme logic

// Append the button to header
document.querySelector("header").appendChild(menuBtn);

// Function to update the mobile menu button text color based on the current theme
function updateMenuBtnColor(isDark) {
    if (isDark) {
        // Use the dark mode text color (defined in your CSS as #eee)
        menuBtn.style.color = "#eee";
    } else {
        // Use the light mode text color (defined in your CSS as #111)
        menuBtn.style.color = "#111"; 
    }
}

// Show/hide menu on small screens
function handleResize() {
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
window.addEventListener("resize", handleResize);


// Toggle nav on click
menuBtn.addEventListener("click", () => {
  if (nav.style.display === "none" || nav.style.display === "") {
    nav.style.display = "flex";
    nav.style.flexDirection = "column";
    nav.style.gap = "1rem";
  } else {
    nav.style.display = "none";
  }
});


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