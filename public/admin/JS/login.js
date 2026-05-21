const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const eye = document.querySelector(".login-form__icon-eye");
const eyeOff = document.querySelector(".login-form__icon-eye-off");

if (togglePassword && passwordInput && eye && eyeOff) {
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.getAttribute("type") === "password";

    if (isPassword) {
      passwordInput.setAttribute("type", "text");
      eye.style.display = "none";
      eyeOff.style.display = "block";
    } else {
      passwordInput.setAttribute("type", "password");
      eyeOff.style.display = "none";
      eye.style.display = "block";
    }
  });
}
