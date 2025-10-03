// ================= MOBILE MENU TOGGLE =================
const nav = document.querySelector("header nav");
const menuBtn = document.createElement("button");

menuBtn.innerText = "☰";
menuBtn.id = "menu-btn";
menuBtn.style.fontSize = "1.5rem";
menuBtn.style.background = "none";
menuBtn.style.border = "none";
menuBtn.style.cursor = "pointer";
menuBtn.style.display = "none";
menuBtn.style.color = "#111";

// Append the button to header
document.querySelector("header").appendChild(menuBtn);

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
window.addEventListener("load", handleResize);

// Toggle nav on click
menuBtn.addEventListener("click", () => {
  if (nav.style.display === "none") {
    nav.style.display = "flex";
    nav.style.flexDirection = "column";
    nav.style.gap = "1rem";
  } else {
    nav.style.display = "none";
  }
});

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

// ================= DARK MODE TOGGLE =================
// Make sure your HTML has a button in header: <button id="dark-mode">🌙 Dark Mode</button>
const darkModeBtn = document.getElementById("dark-mode");

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    darkModeBtn.innerText = "☀️ Light Mode";
  } else {
    darkModeBtn.innerText = "🌙 Dark Mode";
  }
});
