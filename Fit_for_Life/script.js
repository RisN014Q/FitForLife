
// Shared Layout HTML

// Header and menu (uses Font Awesome 6 class names)
const headerHTML = `
<header class="site-header">
  <div class="hero-banner">
    <!-- Menu button opens side menu -->
    <span class="menu-icon" onclick="openMenu()"><i class="fa-solid fa-bars"></i></span>
  </div>
</header>`;

// Side menu content
/* Payment icon: 
  <a href="payment.html"><i class="fa-solid fa-credit-card"></i> Payment</a> */
const menuHTML = `
<div id="menu" class="side-menu">
  <a href="javascript:void(0)" onclick="closeMenu()">✖ Close</a>
  <a href="index.html"><i class="fa-solid fa-house"></i> Home</a>
  <a href="services.html"><i class="fa-solid fa-dumbbell"></i> Services</a>
  <a href="blog.html"><i class="fa-solid fa-blog"></i> Blog</a>
  <a href="reviews.html"><i class="fa-solid fa-image"></i> Reviews</a>
  <a href="booking.html"><i class="fa-solid fa-calendar-days"></i> Booking</a>
  <a href="faq.html"><i class="fa-solid fa-circle-question"></i> FAQ</a>
  <a href="contact.html"><i class="fa-solid fa-envelope"></i> Contact</a>
</div>

<div id="overlay" class="overlay" onclick="closeMenu()"></div>`;

// Footer
const footerHTML = `
<footer>
  &copy; 2025 Fit for Life Personal Training
</footer>`;

// Ensure Font Awesome is available (inject into <head> if not present)
function ensureFontAwesome() {
  try {
    const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l => {
      const href = l.getAttribute('href') || '';
      return href.includes('font-awesome') || href.includes('fontawesome') || href.includes('cdnjs.cloudflare.com/ajax/libs/font-awesome');
    });
    if (!exists) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  } catch (e) {
    // fail silently if document.head not available
    console.error('ensureFontAwesome error', e);
  }
}

// Ensure a favicon is present; inject a favicon link to head if one isn't found
function ensureFavicon() {
  try {
    const existing = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]'));
    if (existing.length === 0) {
      // Prefer .ico for max compatibility, fallback to SVG
      const linkIco = document.createElement('link');
      linkIco.rel = 'icon';
      linkIco.type = 'image/x-icon';
      linkIco.href = 'images/favicon.ico';
      document.head.appendChild(linkIco);
      // SVG fallback for modern browsers
      const linkSvg = document.createElement('link');
      linkSvg.rel = 'icon';
      linkSvg.type = 'image/svg+xml';
      linkSvg.href = 'images/favicon.svg';
      document.head.appendChild(linkSvg);
    }
  } catch (e) {
    console.error('ensureFavicon error', e);
  }
}

// Insert HTML to page and then run post-insert setup
document.addEventListener("DOMContentLoaded", function() {
  ensureFavicon();
  ensureFontAwesome();
    document.body.insertAdjacentHTML("afterbegin", headerHTML + menuHTML); // Adds header/menu to top
    document.body.insertAdjacentHTML("beforeend", footerHTML); // Adds footer to bottom

    // Displays title to browser
    document.title = document.title + " | Fit for Life";

    // Highlight current page in side menu (run after menu is inserted)
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll(".side-menu a");
    links.forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.style.fontWeight = "bold"; // Highlights the current page
      }
    });
});


//Open/close menu

function openMenu() { 
  if (window.innerWidth < 1024) { // Mobile/tablet only
    // Toggle a class on the body — CSS handles menu width and overlay
    document.body.classList.add('menu-open');
  }
}
function closeMenu() { 
  if (window.innerWidth < 1024) { 
    document.body.classList.remove('menu-open');
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
  // Map trainer IDs to display names
  const trainerNames = {
    '1': "Josh",
    '2': "Andrew"
  };
  const trainerTitle = document.getElementById('trainer-title');
  if (trainerNames[trainerId]) {
    trainerTitle.textContent = `${trainerNames[trainerId]}'s Availability`;
  } else {
    trainerTitle.textContent = `Trainer's Availability`;
  }
  

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
  const selectedTotalEl = document.getElementById('selectedTotal');
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

  function formatMMDDYYYY(iso) {
    // iso: YYYY-MM-DD
    const [y, m, d] = iso.split('-');
    return `${m}/${d}/${y}`;
  }
  function updateSelectedList() {
    selectedDatesEl.innerHTML = '';
    Array.from(selected).sort().forEach(iso => {
      const li = document.createElement('li');
      li.textContent = formatMMDDYYYY(iso);
      selectedDatesEl.appendChild(li);
    });
    // Update total price ($35 per selected date)
    if (selectedTotalEl) {
      const unit = 35;
      const total = unit * selected.size;
      selectedTotalEl.textContent = `$${total.toFixed(2)}`;
    }
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
    // Build a small booking payload and store in sessionStorage for the payment page
    const formattedDates = Array.from(selected).sort().map(formatMMDDYYYY);
    const payload = {
      trainer: trainerId,
      dates: formattedDates
    };
    try {
      sessionStorage.setItem('bookingPayload', JSON.stringify(payload));
      // Redirect to payment page which will read sessionStorage.bookingPayload
      location.href = 'payment.html';
    } catch (e) {
      // If storage fails, fallback to query-string (encode dates as JSON)
      console.error('sessionStorage set failed, falling back to query:', e);
      const qs = '?trainer=' + encodeURIComponent(trainerId) + '&dates=' + encodeURIComponent(JSON.stringify(payload.dates));
      location.href = 'payment.html' + qs;
    }
  });

  // initial render
  renderCalendar(viewYear, viewMonth);
  updateSelectedList();
})();
