const userId = window.localStorage.getItem("userId");

async function fetchProduct() {
  const loading = document.getElementById("loading");

  try {
    // Show loader
    loading.style.display = "flex";

    const productResponse = await fetch(
      `https://nshopping.runasp.net/api/Product/${productId}`
    );
    if (!productResponse.ok) throw new Error("Failed to fetch categories");

    const product = await productResponse.json();

    if (productId) {
      // Display the category name
      const productElement = document.getElementById("breadcrumb");
      productElement.innerHTML = `
        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
        <li class="breadcrumb-item"><a href="products.html">All Products</a></li>
        <li class="breadcrumb-item" aria-current="page">
        <a href="products.html?categoryId=${product.categoryId}">${product.categoryName}</a></li>
        </li>
        <li class="breadcrumb-item active" aria-current="page">${product.name}</li>
        `;
    } else {
      // Display the "All Products" breadcrumb
      const productElement = document.getElementById("breadcrumb");
      productElement.innerHTML = `
        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
        <li class="breadcrumb-item active" aria-current="page">All Products</li>
        `;
    }

    // Populate the product details
    const productDetails = document.getElementById("productDetailsContainer");
    productDetails.innerHTML = `
      <div class="col-md-8">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p>${product.price}EGP</p>
        <div class="text-warning mb-3">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="far fa-star"></i>
        </div>
      <a href="javascript:void(0)" class="add-cart" data-item-id="${
        product.id
      }" data-item='${JSON.stringify(
      product
    )}' onclick="addToCart('${userId}', this)">
      Add to Cart
      <i class='fas fa-shopping-cart'></i>
      </a>
      </div>
        <div class="col-md-4">
          <img class="product-image" src="${product.imageUrl}" alt="${
      product.name
    }" class="img-fluid">
        </div>
    `;
  } catch (error) {
    console.error("Error fetching product:", error);
  } finally {
    // Hide loader
    loading.style.display = "none";
  }
}

// simiilar products
async function fetchSimilarProducts(productId) {
  const loading = document.getElementById("loading");
  try {
    // Show loader
    loading.style.display = "flex";

    const productDetailsResponse = await fetch(
      `https://nshopping.runasp.net/api/product/${productId}`
    );
    if (!productDetailsResponse.ok) throw new Error("Failed to fetch products");

    const productDetails = await productDetailsResponse.json();

    const productsResponse = await fetch(
      `https://nshopping.runasp.net/api/product`
    );
    if (!productsResponse.ok) throw new Error("Failed to fetch products");

    const products = await productsResponse.json();

    // Filter products based on the categoryId
    const similarProducts = products.filter(
      (product) => product.categoryId === parseInt(productDetails.categoryId)
    );

    // random similarProducts
    similarProducts.sort(() => Math.random() - 0.5);

    const similarProductsContainer = document.getElementById("similarProducts");
    similarProductsContainer.innerHTML = "";

    similarProducts.slice(0, 3).forEach((product) => {
      if (product.id !== productId) {
        similarProductsContainer.innerHTML += `
        <div class="col-sm-6 col-md-4 mb-4 d-flex justify-content-start">
          <div class="card product-box ">
            <img src="${product.imageUrl}" alt="${
          product.name
        }" class="product-img">
            <div class="card-body p-4">
            <div class="d-flex justify-content-between">
                <h5 class="card-title">${product.name}</h5>
                <span class="product-price">${product.price}EGP</span>
              </div>
              <div class="text-warning mb-3">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="far fa-star"></i>
                <span class="text-muted">available</span>
              </div>
              <div class="d-flex justify-content-evenly">
                    <a href="javascript:void(0)" class="add-cart" data-item-id="${
                      product.id
                    }" data-item='${JSON.stringify(
          product
        )}' onclick="addToCart('${userId}', this)">
                      Add to Cart
                      <i class='fas fa-shopping-cart'></i>
                    </a>
                    <a href="product.html?productId=${
                      product.id
                    }" class="view-product" data-item-id="${
          product.id
        }" data-item='${JSON.stringify(product)}'>
                      View Details
                      <i class='fas fa-chevron-right text-white'></i>
                    </a>
                  </div>
            </div>
          </div>
        </div>
        `;
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    // Hide loader
    loading.style.display = "none";
  }
}

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("productId");
fetchProduct(productId);
fetchSimilarProducts(productId);
