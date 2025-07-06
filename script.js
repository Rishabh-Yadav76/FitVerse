// === NAVIGATION BAR: Toggle & Active Link Highlight ===
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split("/").pop();

  menuToggle.addEventListener("click", function () {
    navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
  });

  links.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  
});

function logout() {
  localStorage.removeItem('token'); // only remove token if that's what you're using
  window.location.href = 'index.html';
}

// === HERO SECTION GSAP Animation ===
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector("#hero-text")) {
    gsap.to("#hero-text", { opacity: 1, duration: 1 });
  }
  if (document.querySelector("#hero-subtext")) {
    gsap.to("#hero-subtext", { opacity: 1, duration: 1 });
  }
  if (document.querySelector(".btn")) {
    gsap.to(".btn", { scale: 1.2, duration: 1 });
  }
});
//gym search logic //
const userLocation = { lat: 28.357353, lng: 77.295289 };

function getDistance(loc1, loc2) {
  const R = 6371;
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function searchGyms() {
  const city = document.getElementById("city").value.toLowerCase();
  const pincode = document.getElementById("pincode").value.trim();
  const maxPrice = parseInt(document.getElementById("priceRange").value);
  const trainingType = document.getElementById("trainingType").value.toLowerCase();

  const selectedActivities = Array.from(document.querySelectorAll(".activity.active"))
    .map(div => div.dataset.activity.toLowerCase());

  console.log("City:", city, "Pincode:", pincode, "Max Price:", maxPrice, "Training Type:", trainingType, "Selected Activities:", selectedActivities);

  fetch("http://localhost:5000/api/gyms/search")
    .then(res => res.json())
    .then(gyms => {
      console.log("Raw gyms from backend:", gyms);

      const filtered = gyms
        .map(gym => {
          const gymCity = gym.location?.city?.toLowerCase() || "";
          const gymPincode = gym.location?.pincode || "";
          const gymActivities = (gym.activities || []).map(a => a.toLowerCase());

          // Convert all prices and check if any are within the range
          const basicPrice = parseInt((gym.membershipPlans?.basic?.price || "0").replace(/,/g, ""));
          const standardPrice = parseInt((gym.membershipPlans?.standard?.price || "0").replace(/,/g, ""));
          const premiumPrice = parseInt((gym.membershipPlans?.premium?.price || "0").replace(/,/g, ""));

          const anyPlanWithinPrice = [basicPrice, standardPrice, premiumPrice].some(p => !isNaN(p) && p <= maxPrice);

          const distance = gym.location?.lat && gym.location?.lng && typeof userLocation !== "undefined"
            ? getDistance(userLocation, {
                lat: parseFloat(gym.location.lat),
                lng: parseFloat(gym.location.lng),
              })
            : 0;

          return {
            ...gym,
            _meta: {
              gymCity,
              gymPincode,
              gymActivities,
              anyPlanWithinPrice
            },
            distance
          };
        })
        .filter(gym => {
          return (
            (!city || gym._meta.gymCity.includes(city)) &&
            (!pincode || gym._meta.gymPincode === pincode) &&
            (isNaN(maxPrice) || gym._meta.anyPlanWithinPrice) &&
            (trainingType === "all" || gym._meta.gymActivities.includes(trainingType)) &&
            (selectedActivities.length === 0 || selectedActivities.some(act =>
              gym._meta.gymActivities.includes(act)
            ))
          );
        })
        .sort((a, b) => a.distance - b.distance);

      console.log("Filtered Gyms:", filtered);
      showResults(filtered);
    })
    .catch(err => {
      console.error("Error fetching gyms:", err);
      document.getElementById("results").innerHTML = "<p>Failed to load gyms. Please try again later.</p>";
    });
}


function showResults(gyms) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (gyms.length === 0) {
    resultsDiv.innerHTML = "<p>No matching gyms found.</p>";
    return;
  }

  gyms.forEach(gym => {
    const card = document.createElement("div");
    card.className = "gym-card";

    card.innerHTML = `
      <h3>${gym.gymName}</h3>
      <p>City: ${gym.location?.city || "N/A"} | Pincode: ${gym.location?.pincode || "N/A"}</p>
      <p>Distance: ${gym.distance ? gym.distance.toFixed(2) : "N/A"} km</p>
      <p>Price: ₹${gym.membershipPlans?.basic?.price || "N/A"}</p>
      <p>Activities: ${gym.activities ? gym.activities.join(", ") : "N/A"}</p>
      <a href="gymdetails.html?gymId=${gym._id}">
        <button>View Full Profile</button>
      </a>
    `;

    resultsDiv.appendChild(card);
  });
}


// === SLIDER ===
let index = 0;

function moveSlide(step) {
  const slider = document.querySelector('.slider');
  const totalImages = slider.children.length;

  index += step;

  if (index >= totalImages) index = 0;
  if (index < 0) index = totalImages - 1;

  slider.style.transform = `translateX(${-index * 100}%)`;
}

setInterval(() => moveSlide(1), 4000);

// === SLIDER TEXT ANIMATION ON SCROLL ===
document.addEventListener("DOMContentLoaded", function () {
  const textElement = document.querySelector(".slider-text");

  function handleScroll() {
    const position = textElement.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (position < windowHeight - 100) {
      textElement.style.animation = "slideInFromLeft 1s ease-in-out forwards";
    }
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

// === MISC EVENTS ===
document.getElementById("priceRange").addEventListener("input", function () {
  document.getElementById("priceValue").textContent = `₹${this.value}`;
});

document.querySelectorAll(".activity").forEach(div => {
  div.addEventListener("click", () => {
    div.classList.toggle("active");
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const userNav = document.getElementById("user-profile-nav");
  const loginNav = document.getElementById("login-signup-nav");

  // Default states
  if (userNav) userNav.style.display = "none";
  if (loginNav) loginNav.style.display = "none";

  if (!token) {
    // 🔐 Not logged in: show login/signup
    if (loginNav) loginNav.style.display = "block";
    return;
  }

  // ✅ Try to fetch user profile if token exists
  fetch('http://localhost:5000/api/users/profile', {
    method: 'GET',
    headers: {
      'Content-Type': "application/json",
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errText}`);
      }
      return res.json();
    })
    .then(user => {
      const profilePicUrl = user.profileImage
        ? `http://localhost:5000${user.profileImage}`
        : `http://localhost:5000/uploads/profile-pics/default.png`;

      const userIconImage = document.getElementById("profile-icon-img");
      if (userIconImage) userIconImage.src = profilePicUrl;

      // 👤 Show profile dropdown, hide login
      if (userNav) userNav.style.display = "block";
      if (loginNav) loginNav.style.display = "none";
    })
    .catch(error => {
      console.error("Error fetching user:", error.message);
      // 🔐 Failed to authenticate, show login
      if (loginNav) loginNav.style.display = "block";
    });
});
// Fallback for touch devices
document.addEventListener('DOMContentLoaded', function() {
  const settingsOptions = document.querySelectorAll('.settings-option');
  
  settingsOptions.forEach(option => {
    // For mouse users
    option.addEventListener('mouseenter', function() {
      this.querySelector('.settings-submenu').style.display = 'block';
    });
    
    option.addEventListener('mouseleave', function() {
      this.querySelector('.settings-submenu').style.display = 'none';
    });
    
    // For touch devices
    option.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) { // Mobile devices
        e.preventDefault();
        const submenu = this.querySelector('.settings-submenu');
        submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
      }
    });
  });
});