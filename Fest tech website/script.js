// <!-- 7. JavaScript Engine -->
const VENDOR_PHONE = "2348149571308";
const ADMIN_PIN = "1234";
let isAdminUnlocked = false;

const defaultProducts = [
  {
    name: "Lenovo ThinkPad E485",
    specs: "Ryzen 5 • 8GB RAM • 256GB SSD • Vega 8",
    price: 245000,
    img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Redmi 20,000mAh Power Bank",
    specs: "18W Fast Charge • Dual USB Output",
    price: 22500,
    img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80"
  },
  {
    name: "Sony Studio Wireless Headset",
    specs: "30-Hour Battery • Deep Bass • Type-C",
    price: 35000,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  }
];

let savedProducts = JSON.parse(localStorage.getItem("apex_products"));
let products = savedProducts ? savedProducts : defaultProducts;

let cart = JSON.parse(localStorage.getItem("apex_cart")) || [];

window.onload = function() {
  const savedName = localStorage.getItem("apex_customer_name");

  if (savedName) document.getElementById("customerName").value = savedName;

  renderProducts();
  updateCartUI();
};

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  let cardsHTML = "";

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    let actionAreaHTML = "";

    if (isAdminUnlocked) {
      actionAreaHTML = `
        <div class="admin-card-controls">
          <button class="btn-delete-product" onclick="deleteProduct(${i})">🗑️ Remove Listing</button>
        </div>
      `;
    } else {
      actionAreaHTML = `<button class="btn-add" onclick="addToCartByIndex(${i}, this)">Add to Order +</button>`;
    }

    cardsHTML = cardsHTML + `
      <article class="card">
        <img src="${prod.img}" alt="${prod.name}" class="card-img">
        <div class="card-body">
          <h3 class="card-title">${prod.name}</h3>
          <p class="card-specs">${prod.specs}</p>
          <div class="card-price">₦${Number(prod.price).toLocaleString()}</div>
          ${actionAreaHTML}
        </div>
      </article>
    `;
  }

  grid.innerHTML = cardsHTML;
}

function unlockAdmin() {
  const adminPanel = document.getElementById("adminPanel");
  if (!adminPanel) {
    alert("Please uncomment the Admin Panel section in index.html first.");
    return;
  }

  if (isAdminUnlocked) {
    lockAdminMode();
    return;
  }

  const enteredPin = prompt("Enter Shop Owner PIN (Demo PIN: 1234):");
  if (enteredPin === ADMIN_PIN) {
    isAdminUnlocked = true;
    adminPanel.style.display = "block";
    renderProducts();
    updateCartUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (enteredPin !== null) {
    alert("Incorrect PIN!");
  }
}

function lockAdminMode() {
  isAdminUnlocked = false;
  const adminPanel = document.getElementById("adminPanel");
  if (adminPanel) {
    adminPanel.style.display = "none";
  }
  renderProducts();
  updateCartUI();
}

function addNewProduct() {
  const nameInput = document.getElementById("newProdName");
  const priceInput = document.getElementById("newProdPrice");
  const specsInput = document.getElementById("newProdSpecs");
  const imgInput = document.getElementById("newProdImg");

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const specs = specsInput.value.trim() || "Available in stock";
  const img = imgInput.value.trim() || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80";

  if (name === "" || price <= 0) {
    alert("Please enter a valid Product Name and Price.");
    return;
  }

  products.unshift({
    name: name,
    specs: specs,
    price: price,
    img: img
  });

  localStorage.setItem("apex_products", JSON.stringify(products));
  renderProducts();

  nameInput.value = "";
  priceInput.value = "";
  specsInput.value = "";
  imgInput.value = "";
}

function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("apex_products", JSON.stringify(products));
  renderProducts();
}

function resetDefaultProducts() {
  products = JSON.parse(JSON.stringify(defaultProducts));
  localStorage.setItem("apex_products", JSON.stringify(products));
  renderProducts();
}

function addToCartByIndex(productIndex, buttonElement) {
  const selectedProduct = products[productIndex];
  let existingItem = null;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].name === selectedProduct.name) {
      existingItem = cart[i];
      break;
    }
  }

  if (existingItem !== null) {
    existingItem.qty = existingItem.qty + 1;
  } else {
    cart.push({
      name: selectedProduct.name,
      price: Number(selectedProduct.price),
      qty: 1
    });
  }

  localStorage.setItem("apex_cart", JSON.stringify(cart));

  const originalText = buttonElement.innerText;
  buttonElement.innerText = "✓ Added!";
  buttonElement.style.backgroundColor = "#16a34a";

  setTimeout(function() {
    buttonElement.innerText = originalText;
    buttonElement.style.backgroundColor = "#0f172a";
  }, 600);

  updateCartUI();
}

function changeQty(index, change) {
  const item = cart[index];

  item.qty = item.qty + change;
  if (item.qty <= 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem("apex_cart", JSON.stringify(cart));
  updateCartUI();
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("apex_cart", JSON.stringify(cart));
  updateCartUI();
}

function clearCart() {
  cart = [];
  localStorage.setItem("apex_cart", JSON.stringify(cart));
  updateCartUI();
}

function saveCustomerDetails() {
  localStorage.setItem("apex_customer_name", document.getElementById("customerName").value);
  document.getElementById("errorMsg").style.display = "none";
}

function updateCartUI() {
  const cartDrawer = document.getElementById("cartDrawer");
  const cartItemsList = document.getElementById("cartItemsList");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  if (cart.length === 0 || isAdminUnlocked) {
    cartDrawer.style.display = "none";
    return;
  }

  cartDrawer.style.display = "flex";

  let totalUnits = 0;
  let totalAmount = 0;
  let itemsHTML = "";

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemSubtotal = item.price * item.qty;
    totalUnits = totalUnits + item.qty;
    totalAmount = totalAmount + itemSubtotal;

    itemsHTML = itemsHTML + `
      <div class="cart-item-row">
        <span>${item.qty}x ${item.name} (₦${itemSubtotal.toLocaleString()})</span>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">-</button>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
          <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
        </div>
      </div>
    `;
  }

  cartItemsList.innerHTML = itemsHTML;
  cartCount.innerText = totalUnits + (totalUnits === 1 ? " item in cart" : " items in cart");
  cartTotal.innerText = "₦" + totalAmount.toLocaleString();
}

function checkoutOnWhatsApp() {
  const nameInput = document.getElementById("customerName");
  const errorMsg = document.getElementById("errorMsg");

  const customerName = nameInput.value.trim();

  if (customerName === "") {
    errorMsg.style.display = "block";
    return;
  }

  let totalAmount = 0;
  let orderLines = "";

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const itemSubtotal = item.price * item.qty;
    totalAmount = totalAmount + itemSubtotal;
    orderLines = orderLines + (i + 1) + ". " + item.qty + "x " + item.name + " - ₦" + itemSubtotal.toLocaleString() + "\n";
  }

  const fullMessage = "Hello Fest Tech Gadgets! I would like to place an order:\n\n"
                    + "*Order Items:*\n" + orderLines
                    + "\n*Total Amount: ₦" + totalAmount.toLocaleString() + "*\n\n"
                    + "*Customer Details:*\n"
                    + "👤 Name: " + customerName + "\n\n"
                    + "Please confirm availability and delivery fee.";

  window.open("https://wa.me/" + VENDOR_PHONE + "?text=" + encodeURIComponent(fullMessage), "_blank");
}