const API_BASE_URL = "https://nshopping.runasp.net/api";
let userCartId = null; // Store the user's cart ID
const userId = window.localStorage.getItem("userId"); // Replace with the actual user ID
let cartId = null;

if (userId === null) {
  document.getElementById("addCategoryButton").remove();
  document.getElementById("addProductButton").remove();
}

// Fetch and display categories
async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/Category/AllCategories`);
    if (!response.ok) throw new Error("Failed to fetch categories");

    const categories = await response.json();

    // Populate the category dropdown in the modal
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a category";
    categorySelect.appendChild(defaultOption);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.innerHTML =
      "<option value=''>Failed to load categories</option>";
  }
}

// Add a new category
async function addCategory() {
  const categoryName = document.getElementById("categoryName").value;
  const addCategoryButton = document.querySelector(
    "#addCategoryModal .btn-primary"
  );

  if (!categoryName) {
    return alert("Please enter a category name");
  }

  // Disable the button and show loader
  addCategoryButton.disabled = true;
  addCategoryButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Adding...
      `;

  try {
    const response = await fetch(`${API_BASE_URL}/Category/Add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: categoryName }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response:", errorResponse);
      throw new Error("Failed to add category");
    }

    const data = await response.json();

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addCategoryModal")
    );
    modal.hide();

    // Show success alert
    showAlert("Category added successfully!", "success");

    // Refresh the category dropdown
    fetchCategories();
  } catch (error) {
    console.error("Error adding category:", error);
    showAlert("Failed to add category. Please try again.", "danger");
  } finally {
    // Re-enable the button and reset its text
    addCategoryButton.disabled = false;
    addCategoryButton.innerHTML = "Add Category";
  }
}

// Add a new item
async function addItem() {
  const itemName = document.getElementById("itemName").value;
  const itemPrice = document.getElementById("itemPrice").value;
  const itemDescription = document.getElementById("itemDescription").value;
  const itemStock = document.getElementById("itemStock").value;
  const categorySelect = document.getElementById("categorySelect");
  const categoryId = categorySelect.value;
  const itemImage = document.getElementById("itemImage").files[0];
  const addProductButton = document.querySelector(
    "#addProductModal .btn-primary"
  );

  if (
    !itemName ||
    !itemPrice ||
    !itemDescription ||
    !itemStock ||
    !categoryId ||
    !itemImage
  ) {
    return alert("Please fill all fields and select a category and image");
  }

  // Disable the button and show loader
  addProductButton.disabled = true;
  addProductButton.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Adding...
      `;

  const formData = new FormData();
  formData.append("Name", itemName);
  formData.append("Description", itemDescription);
  formData.append("Price", itemPrice);
  formData.append("Stock", itemStock);
  formData.append("CategoryId", categoryId);
  formData.append("imageFile", itemImage);

  try {
    const response = await fetch(`${API_BASE_URL}/Product`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Error response:", errorResponse);
      throw new Error("Failed to add item");
    }

    const data = await response.json();

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addProductModal")
    );
    modal.hide();

    // Show success alert
    showAlert("Product added successfully!", "success");

    // Refresh the list of items
    fetchCategoryProducts(categoryId);

    // Reset the form
    resetForm();
  } catch (error) {
    console.error("Error adding item:", error);
    showAlert("Failed to add product. Please try again.", "danger");
  } finally {
    // Re-enable the button and reset its text
    addProductButton.disabled = false;
    addProductButton.innerHTML = "Add Product";
  }
}

// Fetch and display items Based on the category
async function fetchCategoryProducts(categoryId) {
  try {
    const response = await fetch(`https://nshopping.runasp.net/api/Product`);
    if (!response.ok) throw new Error("Failed to fetch products");

    const allProducts = await response.json();

    // Filter products based on the categoryId
    const filteredProducts = allProducts.filter(
      (product) => product.categoryId === parseInt(categoryId)
    );

    if (categoryId) {
      // Render items
      renderItems(filteredProducts, categoryId);
    } else {
      // Render items
      renderItems(allProducts, categoryId);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("products-list").innerHTML =
      "<p>Failed to load products.</p>";
  }
}

// Render items
function renderItems(items, categoryId) {
  const itemsContainer = document.getElementById("items");
  itemsContainer.innerHTML = "";

  if (items.length === 0) {
    itemsContainer.innerHTML = `
    <div class="col-12 text-center">
      <p>No items found.</p>
    </div>
    `;
    return;
  }

  if (categoryId) {
    // Display the category name
    const categoryElement = document.getElementById("breadcrumb");
    categoryElement.innerHTML = `
      <li class="breadcrumb-item"><a href="index.html">Home</a></li>
      <li class="breadcrumb-item"><a href="products.html">All Products</a></li>
      <li class="breadcrumb-item active" aria-current="page">${items[0].categoryName}</li>
      `;
  } else {
    // Display the "All Products" breadcrumb
    const categoryElement = document.getElementById("breadcrumb");
    categoryElement.innerHTML = `
      <li class="breadcrumb-item"><a href="index.html">Home</a></li>
      <li class="breadcrumb-item active" aria-current="page">All Products</li>
      `;
  }

  items.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "col-sm-6 col-md-4 col-lg-3 mb-4";
    itemElement.innerHTML = `
      <div class="product-box">
        <img src="${item.imageUrl}" alt="${item.name}" class="product-img">
        <h2 class="product-title">${item.name}</h2>
        <span class="product-price">Price: $${item.price}</span>
        <a href="javascript:void(0)" class="add-cart" data-item-id="${
          item.id
        }" data-item='${JSON.stringify(
      item
    )}' onclick="addToCart('${userId}', this)">
          <i class='fas fa-shopping-cart'></i>
        </a>
        ${
          userId
            ? `<a href="javascript:void(0)" class="delete-item text-danger" onclick="deleteItem(${item.id})">
          <i class='fas fa-trash delete-item'></i>
        </a>`
            : ""
        }
      </div>
    `;
    itemsContainer.appendChild(itemElement);
  });
}

// Delete an item
async function deleteItem(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Product/${itemId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    fetchCategoryProducts(categoryId); // Refresh the list
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

// Add to cart
async function addToCart(userId, element) {
  // Parse the item string back into an object
  const itemString = element.getAttribute("data-item");
  const item = JSON.parse(itemString);

  // If the user doesn't have a cart, create one
  if (!userCartId) {
    userCartId = await createCart(userId);
    if (!userCartId) return; // Exit if cart creation fails
  }

  // Fetch the user's cart to check if the item is already in it
  const cart = await fetchUserCart(userId);
  if (cart && cart.cartItems) {
    const isItemInCart = cart.cartItems.some(
      (cartItem) => cartItem.productId === item.id
    );

    if (isItemInCart) {
      showAlert(`${item.name} is already in your cart!`, "warning");
      return; // Exit if the item is already in the cart
    }
  }

  // Add the item to the cart
  const cartItem = await addItemToCart(userCartId, item.id, 1);

  if (cartItem) {
    // Update the cart UI
    await fetchUserCart(userId);
    showAlert(`${item.name} added to cart!`, "success");

    // Disable the "Add to Cart" button for this item
    const addCartButton = document.querySelector(
      `.add-cart[data-item-id="${item.id}"]`
    );
    if (addCartButton) {
      addCartButton.classList.add("disabled");
      addCartButton.innerHTML = `<i class='fas fa-check'></i>`;
    }
  }
}

// Create a cart for the user
async function createCart(userId) {
  try {
    if (window.localStorage.getItem("userId") === null) {
      showAlert("You must be logged in to add items to your cart.", "warning");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/Cart/Create/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const cart = await response.json();
    return cart.id; // Return the cart ID
  } catch (error) {
    console.error("Error creating cart:", error);
    return null;
  }
}

// Add item to cart
async function addItemToCart(cartId, productId, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/Cart/AddItem/${cartId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to add item to cart");
    }

    const cartItem = await response.json();
    return cartItem;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    showAlert("Failed to add item to cart. Please try again.", "danger");
    return null;
  }
}

// Fetch user's cart
async function fetchUserCart(userId) {
  try {
    if (userId) {
      const response = await fetch(`${API_BASE_URL}/Cart/GetByUser/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "text/plain", // Add this header if required by the API
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user cart");
      }

      const cart = await response.json();
      cartId = cart.id;
      const cartItems = cart.cartItems || [];
      updateCartUI(cartItems); // Update the cart UI
      return cart;
    }
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return null;
  }
}

// Remove item from cart
async function removeFromCart(cartItemId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Cart/RemoveItem/${cartId}/${cartItemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove item from cart");
    }

    // If the item is successfully removed, fetch the updated cart
    await fetchUserCart(userId);
    showAlert("Item removed from cart!", "success");
  } catch (error) {
    console.error("Error removing item from cart:", error);
    showAlert("Failed to remove item from cart. Please try again.", "danger");
  }
}

// Update the quantity of an item in the cart
async function updateCartItemQuantity(cartItemId, newQuantity) {
  try {
    // Step 1: Fetch the cart item details
    const cartResponse = await fetch(
      `${API_BASE_URL}/Cart/GetByUser/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "text/plain",
        },
      }
    );

    if (!cartResponse.ok) {
      throw new Error("Failed to fetch cart details");
    }

    const cart = await cartResponse.json();
    const cartItem = cart.cartItems.find((item) => item.id === cartItemId);

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Step 2: Remove the item from the cart
    const removeResponse = await fetch(
      `${API_BASE_URL}/Cart/RemoveItem/${cartId}/${cartItemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!removeResponse.ok) {
      throw new Error("Failed to remove item from cart");
    }

    // Step 3: Add the item back to the cart with the updated quantity
    const addResponse = await fetch(`${API_BASE_URL}/Cart/AddItem/${cartId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        productId: cartItem.productId,
        quantity: newQuantity,
      }),
    });

    if (!addResponse.ok) {
      throw new Error("Failed to add item to cart");
    }

    // Step 4: Refresh the cart UI
    await fetchUserCart(userId);
  } catch (error) {
    console.error("Error updating item quantity:", error);
    showAlert("Failed to update item quantity. Please try again.", "danger");
  }
}

// Update the cart UI to include buttons for increasing/decreasing quantity
function updateCartUI(cartItems) {
  const cartContent = document.querySelector(".cart-content");
  const totalPriceElement = document.querySelector(".total-price");

  cartContent.innerHTML = "";

  // Handle empty cart
  if (!cartItems || cartItems.length === 0) {
    cartContent.innerHTML = "<p>Your cart is empty.</p>";
    totalPriceElement.textContent = "$0";
    return;
  }

  cartItems.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.className = "cart-item";
    cartItemElement.innerHTML = `
          <div class="row">
            <div class="col-9">
              <h6>${item.productName}</h6>
              <p>$${item.price}</p>
            </div>
            <div class="col-3">
              <button class="btn btn-sm btn-danger" onclick="removeFromCart(${
                item.id
              })">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div class="col-12">
              <div class="d-flex justify-content-center align-items-center gap-3">
                <button class="quantity" ${
                  item.quantity === 1 ? "disabled" : ""
                } onclick="updateCartItemQuantity(${item.id}, ${
      item.quantity - 1
    })">
                  <i class="fas fa-minus"></i>
                </button>
                <span id="quantity-${item.id}">${item.quantity}</span>
                <button class="quantity" onclick="updateCartItemQuantity(${
                  item.id
                }, ${item.quantity + 1})">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        `;
    cartContent.appendChild(cartItemElement);
  });

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
}

// Remove item from cart
async function removeItemFromCart(cartId, cartItemId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/Cart/RemoveItem/${cartId}/${cartItemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove item from cart");
    }

    return true; // Success
  } catch (error) {
    console.error("Error removing item from cart:", error);
    showAlert("Failed to remove item from cart. Please try again.", "danger");
    return false;
  }
}

// Buy Now
async function buyNow() {
  // Simulate a successful purchase
  showAlert("Thank you for your purchase!", "success");

  // Optionally, reset the cart ID (if needed)
  userCartId = null;
}

// Show alert
function showAlert(message, type) {
  const alertContainer = document.getElementById("alertContainer");

  // Create alert element
  const alertElement = document.createElement("div");
  alertElement.className = `alert alert-${type} alert-dismissible fade show`;
  alertElement.setAttribute("role", "alert");
  alertElement.innerHTML = message;
  alertContainer.style.left = "0";
  alertContainer.style.transition = "left 0.5s ease-in-out";
  // Add the alert to the container
  alertContainer.appendChild(alertElement);

  // Automatically remove the alert after 5 seconds
  setTimeout(() => {
    alertContainer.style.left = "-500px";
    alertContainer.style.transition = "left 0.5s ease-in-out";
  }, 2000);
  setTimeout(() => {
    alertElement.remove();
  }, 3000);
}

// Reset form
function resetForm() {
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  document.getElementById("itemDescription").value = "";
  document.getElementById("itemStock").value = "";
  document.getElementById("categorySelect").value = "";
  document.getElementById("itemImage").value = "";
}

// Reset category form
function resetCategoryForm() {
  document.getElementById("categoryName").value = "";
}

// Add event listener to reset the form when the modal is closed
document
  .getElementById("addProductModal")
  .addEventListener("hidden.bs.modal", () => {
    resetForm();
  });

document
  .getElementById("addCategoryModal")
  .addEventListener("hidden.bs.modal", () => {
    resetCategoryForm();
  });

// Initial fetch to display data
fetchCategories();

// Extract categoryId from the URL
const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("categoryId");

fetchCategoryProducts(categoryId);
fetchUserCart(userId); // Fetch the user's cart on page load
