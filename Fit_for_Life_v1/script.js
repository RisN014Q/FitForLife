
// Shared Layout HTML

// Header
const headerHTML = `
<header>
  <!-- Menu button opens side menu -->
  <span class="menu-icon" onclick="openMenu()"><i class="fas fa-bars"></i></span>
  <!-- Logo text -->
  <span class="logo">Fit for Life</span>
  <!-- Search icon (not functional yet) -->
  <span class="search-icon"><i class="fas fa-search"></i></span>
</header>`;

// Side menu content
const menuHTML = `
<div id="menu" class="side-menu">
  <a href="javascript:void(0)" onclick="closeMenu()">✖ Close</a>
  <a href="index.html"><i class="fas fa-home"></i> Home</a>
  <a href="services.html"><i class="fas fa-dumbbell"></i> Services</a>
  <a href="reviews.html"><i class="fas fa-image"></i> Reviews</a>
  <a href="blog.html"><i class="fas fa-blog"></i> Blog</a>
  <a href="schedule.html"><i class="fas fa-calendar"></i> Schedule</a>
  <a href="contact.html"><i class="fas fa-envelope"></i> Contact</a>
</div>

<div id="overlay" class="overlay" onclick="closeMenu()"></div>`;

// Footer
const footerHTML = `
<footer>
  &copy; 2025 Fit for Life Personal Training
</footer>`;

// Insert HTML to page
document.addEventListener("DOMContentLoaded", function() {
    document.body.insertAdjacentHTML("afterbegin", headerHTML + menuHTML); // Adds header/menu to top
    document.body.insertAdjacentHTML("beforeend", footerHTML); // Adds footer to bottom
});

// Displays title to browser
document.title = document.title + " | Fit for Life";

// Highlight current page in side menu

const currentPage = window.location.pathname.split("/").pop();
const links = document.querySelectorAll(".side-menu a");
links.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.style.fontweight = "bold"; //Highlights the current page
  }
});


//Open/close menu

function openMenu() { 
  if (window.innerWidth < 1024) { //Mobile/tablet only
  document.getElementById("menu").style.width = "200px";
  document.getElementById("overlay").style.display = "block";
  document.addEventListener("click", handleOutsideClick);}
}
function closeMenu() { 
  if (window.innerWidth < 1024) { 
  document.getElementById("menu").style.width = "0";
  document.getElementById("overlay").style.display = "none";
  document.removeEventListener("click", handleOutsideClick);}
}