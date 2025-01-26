const cartIcon = document.querySelector("#cart-icon");
const cartContent = document.querySelector(".cart-content");
const cart = document.querySelector(".cart");
const closeCart = document.querySelector("#cart-close");

document.querySelector(".cart-content").innerHTML =
  "<p class='text-center mb-0'>Please log in to view your cart.</p>";

cartIcon.addEventListener("click", () => {
  cart.classList.add("active");
});

closeCart.addEventListener("click", () => {
  cart.classList.remove("active");
});

document.addEventListener("click", (event) => {
  if (!cart.contains(event.target) && !cartIcon.contains(event.target)) {
    cart.classList.remove("active");
  }
});

// Logout logic
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
});
