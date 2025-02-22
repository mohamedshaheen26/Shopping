// Initialize cart on page load
initializeCart();
loadCartFromLocalStorage();

// Initialize cart in localStorage (if needed)
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

// Load cart from API on page load
async function loadCartFromLocalStorage() {
  const userId = window.localStorage.getItem("userId");
  if (!userId) {
    document.querySelector(".cart-content table tbody").innerHTML =
      "<tr><td colspan='5' class='text-center'><p>You Must be Log in to View Your Cart</p></td></tr>";
    return;
  }

  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey));

  if (cart) {
    updateCartUI(cart.cartItems);
  } else {
    document.querySelector(".cart-content table tbody").innerHTML =
      "<tr><td colspan='5' class='text-center'><p>Your cart is empty.</p></td></tr>";
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

  console.log("Item being added:", item); // Debugging

  // Fetch the user's cart
  const cart = await fetchCart(userId);
  if (!cart) {
    // If no cart exists, create one
    const cartId = await createCart(userId);
    if (!cartId) {
      showAlert("Failed to create a cart.", "error");
      return;
    }
  }

  // Add the item to the server cart
  const updatedCart = await addItemToCart(cart.id, item);
  if (!updatedCart) {
    showAlert("Failed to add item to cart.", "error");
    return;
  }

  // Add the item to local storage
  const cartKey = `cart_${userId}`;
  const localCart = JSON.parse(localStorage.getItem(cartKey)) || {
    cartItems: [],
    totalPrice: 0,
  };

  const existingItem = localCart.cartItems.find(
    (cartItem) => cartItem.productId === item.id
  );

  if (existingItem) {
    // If the item already exists, increment the quantity
    existingItem.quantity += 1;
  } else {
    // If the item doesn't exist, add it to the cart
    localCart.cartItems.push({
      id: item.id, // Unique ID for the cart item
      productId: item.id, // ID of the product
      productName: item.name, // Name of the product
      price: item.price, // Price of the product
      quantity: 1, // Default quantity
      imageUrl: item.imageUrl, // URL of the product image
    });
  }

  console.log("Updated local cart:", localCart); // Debugging

  // Update local storage
  localStorage.setItem(cartKey, JSON.stringify(localCart));

  showAlert(`${item.name} added to cart!`, "success");
}

// Remove item from cart
async function removeFromCart(cartItemId, event) {
  event.preventDefault(); // Prevent default behavior

  const userId = window.localStorage.getItem("userId");
  if (!userId) return;

  // Fetch the user's cart
  const cart = await fetchCart(userId);
  if (!cart) return;

  // Remove the item from the cart
  const updatedCart = await removeItemFromCart(cart.id, cartItemId);
  if (updatedCart) {
    showAlert("Item removed from cart!", "success");
    return;
  }

  // Remove the item from local storage
  const cartKey = `cart_${userId}`;
  const localCart = JSON.parse(localStorage.getItem(cartKey));

  localCart.cartItems = localCart.cartItems.filter(
    (item) => item.id !== cartItemId
  );

  // Update local storage
  localStorage.setItem(cartKey, JSON.stringify(localCart));

  // Update the cart UI
  updateCartUI(localCart.cartItems);
  showAlert("Item removed from cart!", "success");
}

// Update item quantity in the cart
async function updateCartItemQuantity(cartItemId, newQuantity, event) {
  event.preventDefault(); // Prevent default behavior

  const userId = window.localStorage.getItem("userId");
  if (!userId) return;

  const cartKey = `cart_${userId}`;
  const localCart = JSON.parse(localStorage.getItem(cartKey));

  const itemToUpdate = localCart.cartItems.find(
    (item) => item.id === cartItemId
  );

  if (itemToUpdate) {
    itemToUpdate.quantity = newQuantity;
    localStorage.setItem(cartKey, JSON.stringify(localCart));
    updateCartUI(localCart.cartItems);
  }
}

async function fetchCart(userId) {
  try {
    const response = await fetch(
      `https://nshopping.runasp.net/api/Cart/GetByUser/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token for authentication
        },
      }
    );

    // If the cart doesn't exist (404), create a new one
    if (response.status === 404) {
      const createdCart = await createCart(userId);
      return createdCart;
    }

    // If the response is not OK, throw an error
    if (!response.ok) throw new Error("Failed to fetch cart");

    // Return the cart data
    const cart = await response.json();
    console.log("Cart from server:", cart); // Debugging
    return cart;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

// Create a cart for the user
async function createCart(userId) {
  try {
    const response = await fetch(
      `https://nshopping.runasp.net/api/Cart/Create/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token for authentication
        },
      }
    );

    if (!response.ok) throw new Error("Failed to create cart");

    const cart = await response.json();
    return cart;
  } catch (error) {
    console.error("Error creating cart:", error);
    return null;
  }
}

// Add an item to the cart
async function addItemToCart(cartId, item) {
  try {
    const response = await fetch(
      `https://nshopping.runasp.net/api/Cart/AddItem/${cartId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: 1, // Default quantity
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json(); // Parse the error response
      console.error("Error details:", errorData); // Log the error details
      throw new Error("Failed to add item to cart");
    }

    const updatedCart = await response.json();
    return updatedCart;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return null;
  }
}

// Remove an item from the cart
async function removeItemFromCart(cartId, cartItemId) {
  try {
    const response = await fetch(
      `https://nshopping.runasp.net/Cart/RemoveItem/${cartId}/${cartItemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token for authentication
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json(); // Parse the error response
      console.error("Error details:", errorData); // Log the error details
      throw new Error("Failed to remove item from cart");
    }

    const updatedCart = await response.json();
    return updatedCart;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return null;
  }
}

// Buy Now
async function checkout() {
  const userId = window.localStorage.getItem("userId");
  if (!userId) {
    showAlert("You must be logged in to complete the purchase.", "warning");
    return;
  }

  // Fetch the user's cart
  const cartKey = `cart_${userId}`;
  const localCart = JSON.parse(localStorage.getItem(cartKey));

  if (!localCart || localCart.cartItems.length === 0) {
    showAlert("Your cart is empty.", "warning");
    return;
  }

  // Prepare the order payload
  const orderPayload = {
    userId: userId,
    items: localCart.cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  };

  try {
    // Call the API to create the order
    const response = await fetch(
      `https://nshopping.runasp.net/api/Order/Create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token for authentication
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error details:", errorData);
      throw new Error("Failed to create order");
    }

    const order = await response.json();
    console.log("Order created:", order);

    // Clear the cart after successful order creation
    localStorage.removeItem(cartKey);
    updateCartUI([]); // Update the UI to reflect an empty cart

    showAlert(
      "Thank you for your purchase! Your order has been placed.",
      "success"
    );
  } catch (error) {
    console.error("Error during checkout:", error);
    showAlert("Failed to complete the purchase. Please try again.", "error");
  }
}
