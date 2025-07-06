document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gymId = urlParams.get('gymId');

  if (!gymId) {
    document.body.innerHTML = '<h1>No Gym ID Provided in URL</h1>';
    return;
  }

  fetch(`http://localhost:5000/api/gyms/${gymId}`)
  .then(res => {
    if (!res.ok) throw new Error("Failed to load gym data");
    return res.json();
  })
  .then(gym => {
    if (!gym || gym.status !== 'Approved') {
      document.body.innerHTML = '<h1>Gym not found or not approved</h1>';
      return;
    }

    const gymName = gym.name;

      // Update Gym Content
      updateHeader(gym);
      updateGymHero(gym);
      updatePhotoGallery(gym);

      document.getElementById('trial-booking-form').addEventListener('submit', function (event) {
        event.preventDefault();
      
        const formData = new FormData(this);
        const bookingData = {
          name: formData.get('name'),
          email: formData.get('email'),
          trialDate: formData.get('trialDate'),
          message: formData.get('message'),
          gymId: gymId,
          gymName: gymName
        };
      
        if (!bookingData.name || !bookingData.email || !bookingData.trialDate || !bookingData.gymId || !bookingData.gymName) {
          alert('Please fill all required fields.');
          return;
        }
      
        fetch('http://localhost:5000/api/trials/book-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Your trial session request has been sent successfully!');
            document.getElementById('trial-booking-form').reset();
          } else {
            alert('There was an issue with your booking. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('An error occurred. Please try again later.');
        });
      });
      
      // Simulate API call and update UI (Just an example for booking status)
      setTimeout(() => {
        const bookingStatus = document.getElementById('booking-status');
        bookingStatus.innerHTML = `
          <i class="fas fa-check-circle"></i>
          Booked for trial session at ${gym.name} on ${new Date().toLocaleDateString()}
        `;
        bookingStatus.className = 'success';
      }, 800);
    })
    .catch(err => {
      console.error("Error loading gym data:", err);
      document.body.innerHTML = `<h1>Error loading gym data</h1><p>Please try again later</p>`;
    });

  function updateHeader(gymData) {
    const headerEl = document.querySelector('.header');
    if (headerEl) {
      const rating = typeof gymData.rating === 'string' ? parseFloat(gymData.rating) : gymData.rating;
      const reviewCount = gymData.reviews ? gymData.reviews.length : 0;
      headerEl.innerHTML = `
        <div class="logo">FIT-verse</div>
        <h1>${gymData.name}</h1>
        <div class="rating">
          ${Array(Math.floor(rating)).fill('<i class="fas fa-star"></i>').join('')}
          ${rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
          ${Array(5 - Math.ceil(rating)).fill('<i class="far fa-star"></i>').join('')}
          <span>${rating.toFixed(1)} (${reviewCount} reviews)</span>
        </div>
      `;
    }
  }

  function updateGymHero(gymData) {
    const gymNameElement = document.getElementById('gymName');
    if (gymNameElement) {
      gymNameElement.textContent = gymData.name;
    }

    const heroRatingContainer = document.querySelector('.gym-hero .rating');
    if (heroRatingContainer) {
      const rating = typeof gymData.rating === 'string' ? parseFloat(gymData.rating) : gymData.rating;
      const reviewCount = gymData.reviews ? gymData.reviews.length : 0;
      heroRatingContainer.innerHTML = `
        ${Array(Math.floor(rating)).fill('<i class="fas fa-star"></i>').join('')}
        ${rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${Array(5 - Math.ceil(rating)).fill('<i class="far fa-star"></i>').join('')}
        <span>${rating.toFixed(1)} (${reviewCount} reviews)</span>
      `;
    }

    const heroImage = document.querySelector('.gym-hero img');
    if (heroImage && gymData.photos && gymData.photos.length > 0) {
      heroImage.src = `images/${gymData.photos[0]}`;
      heroImage.alt = `${gymData.name} interior`;
    }
  }

  function updatePhotoGallery(gymData) {
    const photoGrid = document.querySelector('.photo-grid');
    if (photoGrid && gymData.photos) {
      photoGrid.innerHTML = `
        <div class="swiper-container">
          <div class="swiper-wrapper">
            ${gymData.photos.map(src => `
              <div class="swiper-slide">
                <img src="images/${src}" alt="Gym photo" />
              </div>
            `).join('')}
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-next"></div>
          <div class="swiper-button-prev"></div>
        </div>
      `;
      new Swiper('.swiper-container', {
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        autoplay: {
          delay: 3000,
        },
      });
    }
  }
});
