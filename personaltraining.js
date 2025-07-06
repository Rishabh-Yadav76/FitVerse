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
  
   
  
    // === MAIN TRAINER LOADING LOGIC ===
    const loadingIndicator = document.querySelector(".loading-indicator");
    const errorMessage = document.querySelector(".error-message");
    const trainersContainer = document.querySelector(".trainers-container");
    const retryButton = document.querySelector(".retry-loading");
    const filterForm = document.querySelector(".filter-form");
    const registerBtn = document.getElementById('registerBtn');
    const trainerModal = document.getElementById("trainerModal");
    const registrationModal = document.getElementById("registrationModal");
  
    const debugInfo = document.createElement("div");
    debugInfo.style.position = "fixed";
    debugInfo.style.bottom = "0";
    debugInfo.style.left = "0";
    debugInfo.style.background = "white";
    debugInfo.style.padding = "10px";
    debugInfo.style.zIndex = "1000";
    document.body.appendChild(debugInfo);
  
    function logout() {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    }
  
    async function loadTrainers() {
      debugInfo.textContent = "Loading data...";
      const paths = ["data/trainers.json"];
      let lastError;
  
      for (const path of paths) {
        try {
          debugInfo.textContent += `\nTrying path: ${path}`;
          const response = await fetch(path);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
  
          loadingIndicator.style.display = "none";
          errorMessage.style.display = "none";
          trainersContainer.style.display = "block";
          populateTrainers(data.trainers);
          setupModalEvents(data.trainers);
          debugInfo.textContent = `Success! Loaded from: ${path}`;
          return;
        } catch (err) {
          lastError = err;
          debugInfo.textContent += `\nFailed: ${path} - ${err.message}`;
        }
      }
  
      loadingIndicator.style.display = "none";
      errorMessage.style.display = "block";
      debugInfo.textContent += `\nFinal error: ${lastError?.message}`;
    }
  
    if (retryButton) retryButton.addEventListener("click", loadTrainers);
  
    function checkAvailability(availabilityObj, filterTime) {
      if (typeof availabilityObj !== "object") return false;
      const morningHours = ["6", "7", "8", "9", "10"];
      const eveningHours = ["16", "17", "18", "19", "20"];
      for (const day in availabilityObj) {
        for (const slot of availabilityObj[day]) {
          const hour = parseInt(slot.split(" - ")[0].split(":")[0]);
          if (
            (filterTime === "Morning" && morningHours.includes(hour.toString())) ||
            (filterTime === "Evening" && eveningHours.includes(hour.toString()))
          ) {
            return true;
          }
        }
      }
      return false;
    }
  
    if (filterForm) {
      filterForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const location = document.getElementById("location").value;
        const specialty = document.getElementById("specialty").value;
        const availability = document.getElementById("availability").value.toLowerCase();
  
        debugInfo.textContent = "Applying filters...";
        try {
          const response = await fetch("data/trainers.json");
          if (!response.ok) throw new Error("Network response was not ok");
  
          const data = await response.json();
          const filtered = data.trainers.filter(trainer => {
            const locationMatch = location === "All Cities" || trainer.location === location;
            const specialtyMatch =
              specialty === "All Specialties" ||
              (trainer.specialties && trainer.specialties.includes(specialty));
            const availabilityMatch =
              availability === "any time" || checkAvailability(trainer.availability, availability);
            return locationMatch && specialtyMatch && availabilityMatch;
          });
  
          populateTrainers(filtered);
          debugInfo.textContent = `Filter applied. Showing ${filtered.length} trainers`;
        } catch (error) {
          console.error("Filter error:", error);
          debugInfo.textContent = `Filter error: ${error.message}`;
        }
      });
    }
  
    function populateTrainers(trainersData) {
      const gyms = {};
      trainersData.forEach(trainer => {
        if (!gyms[trainer.gym]) gyms[trainer.gym] = [];
        gyms[trainer.gym].push(trainer);
      });
  
      document.querySelectorAll(".gym-section").forEach(section => {
        const gymName = section.querySelector("h2").textContent.replace(" Trainers", "").trim();
        const gymTrainers = gyms[gymName];
  
        if (gymTrainers) {
          const trainersGrid = section.querySelector(".trainers-grid");
          trainersGrid.innerHTML = "";
          gymTrainers.forEach(trainer => {
            const trainerCard = document.createElement("div");
            trainerCard.className = "trainer-card";
            trainerCard.setAttribute("data-trainer", trainer.id);
            trainerCard.innerHTML = `
              <div class="trainer-image">
                <img src="${trainer.image}" alt="Trainer ${trainer.name}">
              </div>
              <div class="trainer-info">
                <h3>${trainer.name}</h3>
                <p class="trainer-specialty">${trainer.specialty}</p>
                <p class="trainer-bio">${trainer.shortBio}</p>
                <div class="trainer-actions">
                  <a href="#" class="btn btn-outline view-profile">View Profile</a>
                  <a href="#" class="btn">Book Session</a>
                </div>
              </div>
            `;
            trainersGrid.appendChild(trainerCard);
          });
        }
      });
    }
  
    function setupModalEvents(trainersData) {
      const closeBtns = document.querySelectorAll(".close-modal");
      closeBtns.forEach(btn =>
        btn.addEventListener("click", () => {
          trainerModal.style.display = "none";
          registrationModal.style.display = "none";
          document.body.style.overflow = "auto";
        })
      );
  
      window.addEventListener("click", (e) => {
        if (e.target === trainerModal || e.target === registrationModal) {
          trainerModal.style.display = "none";
          registrationModal.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
  
      document.addEventListener("click", (e) => {
        if (e.target.classList.contains("view-profile")) {
          e.preventDefault();
          const trainerCard = e.target.closest(".trainer-card");
          const trainerId = trainerCard.getAttribute("data-trainer");
          const trainer = trainersData.find(t => t.id == trainerId);
          if (trainer) {
            displayTrainerProfile(trainer);
            trainerModal.style.display = "block";
            document.body.style.overflow = "hidden";
          }
        }
      });
  
      // Register button opens the modal
if (registerBtn && registrationModal) {
    registerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        registrationModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

      }
    }
  
    function displayTrainerProfile(trainer) {
      const modal = trainerModal;
      modal.querySelector(".profile-image img").src = trainer.image;
      modal.querySelector(".profile-image img").alt = trainer.name;
      modal.querySelector(".profile-name h2").textContent = trainer.name;
      modal.querySelector(".profile-name p").textContent = trainer.specialty;
      modal.querySelector(".profile-section:nth-child(2) p").textContent = trainer.about || "No information available";
  
      const specialtiesList = modal.querySelector(".profile-section:nth-child(3) ul");
      specialtiesList.innerHTML = "";
      (trainer.specialties || ["No specialties listed"]).forEach(specialty => {
        const li = document.createElement("li");
        li.textContent = specialty;
        specialtiesList.appendChild(li);
      });
  
      const availabilityList = modal.querySelector(".profile-section:nth-child(4) ul");
      availabilityList.innerHTML = "";
      if (Array.isArray(trainer.availability)) {
        trainer.availability.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          availabilityList.appendChild(li);
        });
      } else {
        availabilityList.innerHTML = "<li>No availability listed</li>";
      }
  
      const testimonialsSection = modal.querySelector(".profile-section:nth-child(5)");
      testimonialsSection.innerHTML = "<h3>Client Success Stories</h3>";
      if (trainer.testimonials && trainer.testimonials.length > 0) {
        trainer.testimonials.forEach(testimonial => {
          const div = document.createElement("div");
          div.className = "testimonial";
          div.innerHTML = `<p>"${testimonial.text}"</p><p><strong>- ${testimonial.client}</strong></p>`;
          testimonialsSection.appendChild(div);
        });
      } else {
        testimonialsSection.innerHTML += "<p>No testimonials available yet.</p>";
      }
  
      const contactInfo = modal.querySelector(".contact-info");
      contactInfo.innerHTML = `
        <p><i>📱</i> ${trainer.contact?.phone || "Not provided"}</p>
        <p><i>✉️</i> ${trainer.contact?.email || "Not provided"}</p>
        <p><i>🏢</i> ${trainer.gym || "Not specified"}</p>
        <p><i>⏰</i> Response time: ${trainer.contact?.responseTime || "Not specified"}</p>
      `;
  
      const certsList = modal.querySelector(".achievements-list");
      certsList.innerHTML = "";
      (trainer.certifications || ["No certifications listed"]).forEach(cert => {
        const li = document.createElement("li");
        li.textContent = cert;
        certsList.appendChild(li);
      });
    }
  
    // Initial load
    loadTrainers();
  });
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    const citySelect = document.getElementById("city");
    const gymSelect = document.getElementById("gym");

    // 🔄 Load gyms based on selected cities
    citySelect.addEventListener("change", async function () {
        const selectedCities = Array.from(citySelect.selectedOptions).map(opt => opt.value);

        // Fetch gyms from server
        try {
            const res = await fetch("http://localhost:5000/api/gyms/by-cities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cities: selectedCities })
            });

            const gyms = await res.json();

            // Clear old gym options
            gymSelect.innerHTML = '<option value="">-- Select Gym --</option>';

            gyms.forEach(gym => {
                const option = document.createElement("option");
                option.value = gym._id;
                option.textContent = `${gym.name} (${gym.city})`;
                gymSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Error fetching gyms:", error);
        }
    });

    // 📨 Handle form submission
    form.addEventListener("submit", async function (e) {
        e.preventDefault(); // stop page refresh

        const formData = new FormData(form);

        try {
            const response = await fetch("http://localhost:5000/api/trainers/register", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert("Trainer registered successfully!");
                form.reset();

                // Reset gym dropdown too
                gymSelect.innerHTML = '<option value="">-- Select Gym --</option>';
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) {
            alert("Submission failed. Check your server console.");
            console.error(err);
        }
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