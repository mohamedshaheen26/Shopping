// Logout logic
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
});

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

// Fetch categories and random images
async function fetchCategoriesWithRandomImages() {
  const loading = document.getElementById("loading");
  
  try {
    // Show loader
    loading.style.display = "flex";

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

    if (categories.length === 0) {
      const categoriesproducts = document.getElementById("products");
      categoriesproducts.innerHTML =
        "<li value=''>No categories available</li>";
      return;
    }

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
        <a href="products.html?categoryId=${category.id}" class="category text-dark">
          <img src="${imageUrl}" alt="${category.name}" style="width: 100px; height: 100px; object-fit: cover;" class="category-img rounded-circle " />
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
  } finally {
    // Hide loader
    loading.style.display = "none";
  }
}

fetchCategoriesWithRandomImages();
