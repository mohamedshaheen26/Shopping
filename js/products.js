const API_BASE_URL = "https://nshopping.runasp.net/api";
const userId = window.localStorage.getItem("userId"); // Get the logged-in user's ID

let allProducts = []; // Store all products fetched from the API
let currentCategoryId = null; // Store the current category ID

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

// Fetch and display items based on the category
async function fetchCategoryProducts(categoryId) {
  const loading = document.getElementById("loading");
  try {
    // Show loader
    loading.style.display = "flex";

    const response = await fetch(`${API_BASE_URL}/Product`);
    if (!response.ok) throw new Error("Failed to fetch products");

    allProducts = await response.json(); // Store all products

    // Filter products based on the categoryId
    const filteredProducts = categoryId
      ? allProducts.filter(
          (product) => product.categoryId === parseInt(categoryId)
        )
      : allProducts;

    // Render items
    renderItems(filteredProducts, categoryId);
  } catch (error) {
    console.error("Error fetching products:", error);
    document.getElementById("products-list").innerHTML =
      "<p>Failed to load products.</p>";
  } finally {
    // Hide loader and show products
    loading.style.display = "none";
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
    const isAvailable = item.stock > 0;
    const stockText = isAvailable
      ? `<span>available</span>`
      : `<span>unavailable</span>`;
    const itemElement = document.createElement("div");

    itemElement.className = "col-sm-6 col-md-4 mb-4";
    itemElement.innerHTML = `
    <div class="card product-box h-100">
      <img src="${item.imageUrl}" alt="${item.name}" class="product-img">
      <div class="card-body d-flex flex-column justify-content-between p-4">
       <div class="d-flex justify-content-between gap-3">
          <h5 class="card-title mb-0">${item.name}</h5>
          <span class="product-price">${item.price}EGP</span>
        </div>
        <div class="text-warning mb-3">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="far fa-star"></i>
          <span class="text-muted">${stockText}</span>
        </div>
        <div class="d-flex justify-content-evenly">
              <a href="javascript:void(0)"class="add-cart ${
                isAvailable ? "" : "disabled"
              }"  data-item-id="${item.id}" data-item='${JSON.stringify(
      item
    ).replace(/'/g, "&apos;")}' onclick="addToCart('${userId}', this)">
                Add to Cart
                <i class='fas fa-shopping-cart'></i>
              </a>
              <a href="product.html?productId=${item.id}" class="view-product">
                View Details
                <i class='fas fa-chevron-right text-white'></i>
              </a>  
            </div>
      </div>
    </div>
    `;
    itemsContainer.appendChild(itemElement);
  });
}

// Extract categoryId from the URL
const urlParams = new URLSearchParams(window.location.search);
currentCategoryId = urlParams.get("categoryId");

fetchCategoryProducts(currentCategoryId);

// Handle search functionality
const searchInput = document.querySelector(".search");

searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();

  // Filter products based on the search term and current category
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = currentCategoryId
      ? product.categoryId === parseInt(currentCategoryId)
      : true; // If no category is selected, include all products

    return matchesSearch && matchesCategory;
  });

  // Render the filtered products
  renderItems(filteredProducts, currentCategoryId);
});
