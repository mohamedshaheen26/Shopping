// cart.js

// Initialize cart in localStorage
function initializeCart() {
  const userId = window.localStorage.getItem("userId"); // Get the logged-in user's ID
  if (!userId) return;

  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey));

  if (!cart) {
    // Create an empty cart if it doesn't exist
    localStorage.setItem(
      cartKey,
      JSON.stringify({
        cartItems: [],
        totalPrice: 0,
      })
    );
  }
}

// Load cart from localStorage on page load
function loadCartFromLocalStorage() {
  const userId = window.localStorage.getItem("userId");
  if (!userId) {
    document.querySelector(".cart-content table tbody").innerHTML =
      "<tr><td colspan='5' class='text-center'><p>You Must be Log in to View Your Cart</p></td></tr>";
  }

  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey));

  if (cart) {
    updateCartUI(cart.cartItems);
  }
}

// Update the cart UI
function updateCartUI(cartItems) {
  const cartContent = document.querySelector(".cart-content table tbody");
  const itemsCountElement = document.querySelector(
    ".cart-content table tbody #items"
  );
  const subtotalPriceElement = document.querySelector(
    ".cart-content table tbody #subtotal"
  );
  const shippingElement = document.querySelector(
    ".cart-content table tbody #shipping"
  );
  const discountElement = document.querySelector(
    ".cart-content table tbody #discount"
  );
  const totalPriceElement = document.querySelector(
    ".cart-content table tfoot #total"
  );

  cartContent.innerHTML = "";

  // Handle empty cart
  if (!cartItems || cartItems.length === 0) {
    cartContent.innerHTML =
      "<tr><td colspan='5' class='text-center'><p>Your cart is empty.</p></td></tr>";
    itemsCountElement.textContent = "0";
    subtotalPriceElement.textContent = "0";
    shippingElement.textContent = "0";
    discountElement.textContent = "0";
    totalPriceElement.textContent = "0EGP";
    return;
  }

  cartItems.forEach((item) => {
    const cartItemElement = document.querySelector(".cart-content table tbody");
    cartItemElement.innerHTML += `
              <tr>
                <td class="w-50">
                  <div class="d-flex align-items-center">
                    <img class="me-3" src="${
                      item.imageUrl
                    }" height="100" width="100" alt="${item.productName}">
                    <h6>${item.productName}</h6>
                  </div>
                </td>
                <td class="text-center align-middle">
                  <h6>${item.price}EGP</h6>
                </td>
                <td class="align-middle">
                  <div class="quantity-container d-flex justify-content-between align-items-center gap-2 px-2">
            <button class="quantity" ${
              item.quantity === 1 ? "disabled" : ""
            } onclick="updateCartItemQuantity(${item.id}, ${
      item.quantity - 1
    }, event)">
              <i class="fas fa-minus"></i>
            </button>
            <span id="quantity-${item.id}">${item.quantity}</span>
            <button class="quantity" onclick="updateCartItemQuantity(${
              item.id
            }, ${item.quantity + 1}, event)">
              <i class="fas fa-plus"></i>
            </button>
          </div>
                </td>
                <td class="text-center align-middle">
                  <h6>${item.price * item.quantity}EGP</h6>
                </td>
                <td class="text-center align-middle">
                  <button class="btn btn-sm del-cartItem" onclick="removeFromCart(${
                    item.id
                  }, event)">
            <i class="fas fa-times"></i>
          </button>
                </td>
              </tr>
    `;
  });

  itemsCountElement.textContent = cartItems.length;
  const subtotalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  subtotalPriceElement.textContent = `${subtotalPrice.toFixed()}`;
  shippingElement.textContent = "200";
  discountElement.textContent = "0";

  const totalPrice = subtotalPrice + 200 - 0;
  totalPriceElement.textContent = `${totalPrice.toFixed()}EGP`;
}

// Add to cart
async function addToCart(userId, element) {
  if (!userId) {
    showAlert("You must be logged in to add items to your cart.", "warning");
    return;
  }

  // Parse the item string back into an object
  const itemString = element.getAttribute("data-item");
  const item = JSON.parse(itemString);

  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey));

  // Check if the item is already in the cart
  const isItemInCart = cart.cartItems.some(
    (cartItem) => cartItem.productId === item.id
  );

  if (isItemInCart) {
    showAlert(`${item.name} is already in your cart!`, "warning");
    return;
  }

  // Add the item to the cart
  const newCartItem = {
    id: Date.now(), // Generate a unique ID for the cart item
    productId: item.id,
    productName: item.name,
    imageUrl: item.imageUrl,
    price: item.price,
    quantity: 1,
  };

  cart.cartItems.push(newCartItem);
  cart.totalPrice += item.price;

  // Update localStorage
  localStorage.setItem(cartKey, JSON.stringify(cart));

  showAlert(`${item.name} added to cart!`, "success");
}

// Remove item from cart
async function removeFromCart(cartItemId, event) {
  event.preventDefault(); // Prevent default behavior

  const userId = window.localStorage.getItem("userId");
  if (!userId) return;

  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey));

  // Find the item to remove
  const itemIndex = cart.cartItems.findIndex((item) => item.id === cartItemId);
  if (itemIndex === -1) return;

  // Update the total price
  const removedItem = cart.cartItems[itemIndex];
  cart.totalPrice -= removedItem.price * removedItem.quantity;

  // Remove the item from the cart
  cart.cartItems.splice(itemIndex, 1);

  // Update localStorage
  localStorage.setItem(cartKey, JSON.stringify(cart));

  // Update the cart UI
  updateCartUI(cart.cartItems);

  showAlert("Item removed from cart!", "success");
}

// Update item quantity in the cart
async function updateCartItemQuantity(cartItemId, newQuantity, event) {
  event.preventDefault(); // Prevent default behavior

  const userId = window.localStorage.getItem("userId");
  if (!userId) return;

  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey));

  // Find the item to update
  const itemToUpdate = cart.cartItems.find((item) => item.id === cartItemId);
  if (!itemToUpdate) return;

  // Update the total price
  cart.totalPrice -= itemToUpdate.price * itemToUpdate.quantity; // Remove old total
  itemToUpdate.quantity = newQuantity;
  cart.totalPrice += itemToUpdate.price * itemToUpdate.quantity; // Add new total

  // Update localStorage
  localStorage.setItem(cartKey, JSON.stringify(cart));

  // Update the cart UI
  updateCartUI(cart.cartItems);
}

// Buy Now
async function buyNow() {
  const userId = window.localStorage.getItem("userId");
  if (!userId) {
    showAlert("You must be logged in to complete the purchase.", "warning");
    return;
  }

  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey));

  if (!cart || cart.cartItems.length === 0) {
    showAlert("Your cart is empty.", "warning");
    return;
  }

  // Simulate a successful purchase
  showAlert("Thank you for your purchase!", "success");

  // Clear the cart
  localStorage.removeItem(cartKey);

  // Update the cart UI
  updateCartUI([]);
}

// Initialize cart and load cart data on page load
initializeCart();
loadCartFromLocalStorage();

// Prevent cart from closing when interacting with it
document.querySelector(".cart").addEventListener("click", (event) => {
  event.stopPropagation(); // Stop event propagation
});

// Close cart when clicking outside
document.addEventListener("click", (event) => {
  const cart = document.querySelector(".cart");
  const cartCloseButton = document.getElementById("cart-close");

  if (!cart.contains(event.target) && event.target !== cartCloseButton) {
    cart.style.right = "-100%"; // Hide the cart
  }
});

// Close cart when the close button is clicked
document.getElementById("cart-close").addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default behavior (e.g., following a link)
  const cart = document.querySelector(".cart");
  cart.style.right = "-100%"; // Hide the cart
});

// Toggle cart visibility
document.getElementById("cart-icon").addEventListener("click", (event) => {
  event.stopPropagation(); // Stop event propagation
  const cart = document.querySelector(".cart");
  cart.style.right = cart.style.right === "0" ? "-100%" : "0";
});
