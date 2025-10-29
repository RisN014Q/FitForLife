
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
  <a href="booking.html"><i class="fas fa-calendar"></i> Booking</a>
  <a href="contact.html"><i class="fas fa-envelope"></i> Contact</a>
  <!-- Payment link placed at the bottom -->
  <a href="payment.html"><i class="fas fa-credit-card"></i> Payment</a>
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
    link.style.fontWeight = "bold"; // Highlights the current page
  }
});


//Open/close menu

function openMenu() { 
  if (window.innerWidth < 1024) { // Mobile/tablet only
    const menu = document.getElementById("menu");
    const overlay = document.getElementById("overlay");
    if (!menu || !overlay) return;

    menu.style.width = "200px";
    overlay.style.display = "block";
    overlay.onclick = function() { closeMenu(); };
  }
}
function closeMenu() { 
  if (window.innerWidth < 1024) { 
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");

  menu.style.width = "0";
  overlay.style.display = "none";
  }
}

function handleOutsideClick(event) {
  const menu = document.getElementById("menu");
  const menuIcon = document.querySelector(".menu-icon");

  if (!menu.contains(event.target) && !menuIcon.contains(event.target)) {
    closeMenu();
  }
}

//Client side calendar with availability rules
(function () {
  // small client-side calendar with simple trainer availability rules
  const params = new URLSearchParams(location.search);
  const trainerId = params.get('trainer') || '1'; // default trainer
  const trainerTitle = document.getElementById('trainer-title');
  trainerTitle.textContent = `Calendar`;
  

  // example availability config per trainer (customize as needed)
  const availability = {
    '1': { weekdaysAllowed: [1,2,3,4,5], blackouts: ['2025-12-25'] }, // Mon-Fri
    '2': { weekdaysAllowed: [2,3,4], blackouts: ['2025-11-28'] },     // Tue-Thu
  };

  const config = availability[trainerId] || availability['1'];

  const daysContainer = document.getElementById('days');
  const monthLabel = document.getElementById('monthLabel');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const selectedDatesEl = document.getElementById('selectedDates');
  const clearBtn = document.getElementById('clearSelection');
  const submitBtn = document.getElementById('submitSelection');

  let today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selected = new Set();

  function formatDateISO(d) {
    return d.toISOString().slice(0,10);
  }

  function isAvailableDate(date) {
    // disabled past days
    const now = new Date();
    now.setHours(0,0,0,0);
    if (date < now) return false;

    // weekday allowed? Sunday=0 ... Saturday=6
    const wd = date.getDay();
    if (!config.weekdaysAllowed.includes(wd)) return false;

    // blackouts
    if (config.blackouts && config.blackouts.includes(formatDateISO(date))) return false;

    return true;
  }

  function renderCalendar(year, month) {
    daysContainer.innerHTML = '';
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = firstOfMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });

    // leading blanks
    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = formatDateISO(date);
      const cell = document.createElement('button');
      cell.className = 'day';
      cell.type = 'button';
      cell.textContent = d;
      cell.dataset.date = iso;
      cell.setAttribute('aria-label', iso);

    if (isAvailableDate(date)) {
        cell.classList.add('available');
        // mark pre-selected if in selected
        if (selected.has(iso)) cell.classList.add('selected');
        cell.addEventListener('click', () => {
          if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            selected.delete(iso);
          } else {
            cell.classList.add('selected');
            selected.add(iso);
          }
          updateSelectedList();
        });
      } else {
        cell.classList.add('unavailable');
        cell.disabled = true;
      }

      daysContainer.appendChild(cell);
    }
  }

  function updateSelectedList() {
    selectedDatesEl.innerHTML = '';
    Array.from(selected).sort().forEach(iso => {
      const li = document.createElement('li');
      li.textContent = iso;
      selectedDatesEl.appendChild(li);
    });
  }

  prevBtn.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar(viewYear, viewMonth);
  });

  nextBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar(viewYear, viewMonth);
  });

  clearBtn.addEventListener('click', () => {
    selected.clear();
    updateSelectedList();
    // re-render to clear selected class
    renderCalendar(viewYear, viewMonth);
  });

  submitBtn.addEventListener('click', () => {
    if (selected.size === 0) {
      alert('Please select one or more dates first.');
      return;
    }
    // Example: show selected JSON and simulate sending
    const payload = {
      trainer: trainerId,
      dates: Array.from(selected).sort()
    };
    console.log('Booking request payload:', payload);
    // Replace with real POST or redirect as needed:
    alert('Requested dates:\n' + payload.dates.join('\n'));
    // Example redirect with query params to a confirmation page:
    // location.href = 'booking-confirm.html?trainer=' + trainerId + '&dates=' + encodeURIComponent(JSON.stringify(payload.dates));
  });

  // initial render
  renderCalendar(viewYear, viewMonth);
  updateSelectedList();
})();
