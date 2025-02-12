const API_BASE_URL = "https://nshopping.runasp.net/api";
const userId = window.localStorage.getItem("userId"); // Get the logged-in user's ID

// Initialize cart in localStorage
function initializeCart() {
  if (!userId) return; // Exit if no user is logged in

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

// Call this function when the page loads
initializeCart();

// Fetch and display items based on the category
async function fetchCategoryProducts(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Product`);
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
      <p>No Products found.</p>
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
      </div>
    `;
    itemsContainer.appendChild(itemElement);
  });
}

// Extract categoryId from the URL
const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("categoryId");

fetchCategoryProducts(categoryId);
