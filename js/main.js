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

async function fetchCategoriesWithRandomImages() {
  try {
    const categoryResponse = await fetch(
      `https://nshopping.runasp.net/api/Category/AllCategories`
    );
    if (!categoryResponse.ok) throw new Error("Failed to fetch categories");

    const categories = await categoryResponse.json();

    const productsResponse = await fetch(
      `https://nshopping.runasp.net/api/Product`
    );
    if (!productsResponse.ok) throw new Error("Failed to fetch products");

    const allProducts = await productsResponse.json();

    // Populate categories with random images
    const categoriesproducts = document.getElementById("products");
    categoriesproducts.innerHTML = "";

    for (const category of categories) {
      // Filter products for this category
      const categoryProducts = allProducts.filter(
        (product) => product.categoryId === category.id
      );

      // Pick a random product image (fallback if no products)
      const randomProduct =
        categoryProducts.length > 0
          ? categoryProducts[
              Math.floor(Math.random() * categoryProducts.length)
            ]
          : null;

      const imageUrl = randomProduct
        ? randomProduct.imageUrl // Use product's image if available
        : "https://example.com/images/default-category.jpg"; // Fallback image

      const categoryItem = document.createElement("li");
      categoryItem.innerHTML = `
        <a href="Products.html?categoryId=${category.id}">
          <img src="${imageUrl}" alt="${category.name}" style="width: 100px; height: 100px; object-fit: cover;" />
          <p>${category.name}</p>
        </a>
      `;

      categoriesproducts.appendChild(categoryItem);
    }
  } catch (error) {
    console.error("Error fetching categories or products:", error);
    const categoriesproducts = document.getElementById("products");
    categoriesproducts.innerHTML =
      "<li value=''>Failed to load categories</li>";
  }
}

fetchCategoriesWithRandomImages();
