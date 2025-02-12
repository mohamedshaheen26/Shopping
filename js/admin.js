const API_BASE_URL = "https://nshopping.runasp.net/api";

const userId = window.localStorage.getItem("userId"); // Replace with the actual user ID

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
    // Refresh the categories table
    displayCategories();

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

    // Refresh the products table
    displayProducts();

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

// Fetch and display Categories
async function displayCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/Category/AllCategories`);
    if (!response.ok) throw new Error("Failed to fetch products");

    const categories = await response.json();

    if (categories.length === 0) {
      document.querySelector(".categoriesTable tbody").innerHTML =
        "<tr><td colspan='6' class='text-center'>No categories found</td></tr>";
      return;
    }

    // Populate the products table
    const categoriesTable = document.querySelector(".categoriesTable tbody");
    categoriesTable.innerHTML = "";

    categories.forEach((category, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${++index}</td>
            <td>${category.name}</td>
            <td>
            ${
              userId !== null
                ? `
                 <button class="w-auto p-1 bg-transparent text-secondary m-0" onclick="openEditCategoryModal(${category.id}, '${category.name}')">
                 <i class="fas fa-edit"></i>
                 </button>
                <button class="w-auto p-1 bg-transparent text-danger m-0" id="delete-category" onclick="deleteCategory(${category.id})">
                <i class="fas fa-trash"></i>
                </button>`
                : ""
            }
            </td>
          `;
      categoriesTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    const categoriesTable = document.querySelector(".categoriesTable tbody");
    categoriesTable.innerHTML =
      "<tr class='text-center'><td colspan='6'>Failed to load products</td></tr>";
  }
}

// Open the edit category modal
function openEditCategoryModal(categoryId, categoryName) {
  // Populate the modal fields
  document.getElementById("editCategoryName").value = categoryName;
  document.getElementById("editCategoryId").value = categoryId;

  // Open the modal
  const modal = new bootstrap.Modal(
    document.getElementById("editCategoryModal")
  );
  modal.show();
}

async function updateCategory() {
  const categoryId = document.getElementById("editCategoryId").value;
  const categoryName = document.getElementById("editCategoryName").value;

  try {
    const response = await fetch(
      `${API_BASE_URL}/Category/Update/${categoryId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName }),
      }
    );

    if (!response.ok) throw new Error("Failed to update category");

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editCategoryModal")
    );
    modal.hide();

    // Refresh the categories table
    displayCategories();
    showAlert(`${categoryName} Category updated successfully!`, "success");
  } catch (error) {
    console.error("Error updating category:", error);
    showAlert("Failed to update category. Please try again.", "danger");
  }
}

// Delete an Category
async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Category/${categoryId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    displayCategories(); // Refresh the list
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

// Display Products
async function displayProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/Product`);
    if (!response.ok) throw new Error("Failed to fetch products");

    const products = await response.json();

    if (products.length === 0) {
      document.querySelector(".productsTable tbody").innerHTML =
        "<tr><td colspan='6' class='text-center'>No products found</td></tr>";
      return;
    }

    // Populate the products table
    const productsTable = document.querySelector(".productsTable tbody");
    productsTable.innerHTML = ""; // Clear the table

    products.forEach((product, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${++index}</td>
            <td>${product.name}</td>
            <td>${product.categoryName}</td>
            <td>${product.price}</td>
            <td>
            ${
              userId !== null
                ? `
                <button class="w-auto p-1 bg-transparent text-secondary m-0" onclick="openEditProductModal(${product.id})">
                <i class="fas fa-edit"></i>
                </button>
                <button class="w-auto p-1 bg-transparent text-danger m-0"  id="delete-product" onclick="deleteProduct(${product.id})">
                  <i class="fas fa-trash"></i>
                </>`
                : ""
            }
            </td>
          `;
      productsTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    const productsTable = document.querySelector(".productsTable tbody");
    productsTable.innerHTML =
      "<tr class='text-center'><td colspan='6'>Failed to load products</td></tr>";
  }
}

// Open the edit product modal
async function openEditProductModal(productId) {
  try {
    // Fetch product details
    const response = await fetch(`${API_BASE_URL}/Product/${productId}`);
    if (!response.ok) throw new Error("Failed to fetch product details");

    const product = await response.json();

    // Populate the modal fields
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editProductDescription").value =
      product.description;
    document.getElementById("editProductPrice").value = product.price;
    document.getElementById("editProductStock").value = product.stock;
    document.getElementById("editProductId").value = product.id;

    // Populate the category dropdown
    const categorySelect = document.getElementById("editProductCategory");
    categorySelect.innerHTML = "";
    const categoriesResponse = await fetch(
      `${API_BASE_URL}/Category/AllCategories`
    );
    const categories = await categoriesResponse.json();
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      if (category.id === product.categoryId) option.selected = true;
      categorySelect.appendChild(option);
    });

    // Open the modal
    const modal = new bootstrap.Modal(
      document.getElementById("editProductModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error fetching product details:", error);
    showAlert("Failed to fetch product details. Please try again.", "danger");
  }
}

async function updateProduct() {
  const productId = document.getElementById("editProductId").value;
  const productName = document.getElementById("editProductName").value;
  const productDescription = document.getElementById(
    "editProductDescription"
  ).value;
  const productPrice = document.getElementById("editProductPrice").value;
  const productStock = document.getElementById("editProductStock").value;
  const productCategory = document.getElementById("editProductCategory").value;

  try {
    const response = await fetch(`${API_BASE_URL}/Product/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: productName,
        description: productDescription,
        price: productPrice,
        stock: productStock,
        categoryId: productCategory,
      }),
    });

    if (!response.ok) throw new Error("Failed to update product");

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editProductModal")
    );
    modal.hide();

    // Refresh the products table
    displayProducts();
    showAlert(`${productName} Product updated successfully!`, "success");
  } catch (error) {
    console.error("Error updating product:", error);
    showAlert("Failed to update product. Please try again.", "danger");
  }
}

// Delete an Product
async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/Product/${productId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    displayProducts(); // Refresh the list
  } catch (error) {
    console.error("Error deleting item:", error);
  }
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

displayCategories();
displayProducts();
