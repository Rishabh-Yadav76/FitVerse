document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1;
  const totalSteps = 3;
  const token = localStorage.getItem('token');
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");

  const formSections = document.querySelectorAll(".form-section");
  const steps = document.querySelectorAll(".step");

  function updateFormStep() {
    formSections.forEach((section, index) => {
      section.style.display = index + 1 === currentStep ? "block" : "none";
    });

    steps.forEach((step, index) => {
      step.classList.toggle("active", index + 1 === currentStep);
    });

    prevBtn.disabled = currentStep === 1;
    nextBtn.style.display = currentStep < totalSteps ? "inline-block" : "none";
    submitBtn.style.display = currentStep === totalSteps ? "inline-block" : "none";
  }

  nextBtn.addEventListener("click", () => {
    if (currentStep < totalSteps) {
      currentStep++;
      updateFormStep();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      updateFormStep();
    }
  });

  updateFormStep();

  // Password toggle
  document.querySelectorAll(".toggle-password").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const input = toggle.previousElementSibling;
      input.type = input.type === "password" ? "text" : "password";
      toggle.innerHTML = input.type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
    });
  });

  // Submit Form
  const editForm = document.getElementById("edit-profile-form");

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Basic Info
    formData.append("firstName", document.getElementById("first-name").value);
    formData.append("lastName", document.getElementById("last-name").value);
    formData.append("username", document.getElementById("username").value);
    formData.append("birthdate", document.getElementById("birthdate").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("email", document.getElementById("email").value);

    const profileImageInput = document.getElementById("upload-pic");
    if (profileImageInput.files.length > 0) {
      formData.append("profileImage", profileImageInput.files[0]);
    }

    // Fitness Details
    formData.append("heightFeet", document.getElementById("height-feet").value);
    formData.append("heightInches", document.getElementById("height-inches").value);
    formData.append("weight", document.getElementById("weight").value);
    formData.append("fitnessLevel", document.getElementById("fitness-level").value);
    formData.append("primaryGoal", document.getElementById("primary-goal").value);

    const workoutPrefs = [];
    document.querySelectorAll('input[name="workout-pref"]:checked').forEach(checkbox => {
      workoutPrefs.push(checkbox.value);
    });
    workoutPrefs.forEach(pref => formData.append("workoutPreferences", pref));

    // Preferences
    formData.append("theme", document.getElementById("theme").value);
    formData.append("measurementSystem", document.getElementById("measurement-system").value);
    formData.append("notifications", document.getElementById("notifications").value);
    formData.append("twoFactorEnabled", document.getElementById("two-factor-toggle").checked);

    // Password
    formData.append("currentPassword", document.getElementById("current-password").value);
    formData.append("newPassword", document.getElementById("new-password").value);
    formData.append("confirmPassword", document.getElementById("confirm-password").value);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("User not authenticated. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
          // No 'Content-Type' here; it will be set automatically by FormData
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        document.getElementById("success-modal").style.display = "block";
      } else {
        alert(result.error || "Something went wrong while updating.");
      }

    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  });

  // Close success modal
  document.getElementById("modal-close-btn").addEventListener("click", () => {
    document.getElementById("success-modal").style.display = "none";
  });

  // Optional: Remove picture logic
  document.getElementById("remove-pic").addEventListener("click", () => {
    document.getElementById("profile-pic").src = "/uploads/profile-pics/default.png";
    document.getElementById("upload-pic").value = "";
  });

  // Optional: Take photo feature placeholder
  document.getElementById("take-pic").addEventListener("click", () => {
    alert("Camera capture not implemented yet!");
  });
});
