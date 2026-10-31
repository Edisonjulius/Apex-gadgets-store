//  <!-- 7. JavaScript Engine -->
    const VENDOR_PHONE = "2348130976312";
    const ADMIN_PIN = "1234";
    let isAdminUnlocked = false;

    const defaultProducts = [
      {
        name: "Lenovo ThinkPad E485",
        specs: "Ryzen 5 • 8GB RAM • 256GB SSD • Vega 8",
        price: 245000,
        stock: 3,
        img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Redmi 20,000mAh Power Bank",
        specs: "18W Fast Charge • Dual USB Output",
        price: 22500,
        stock: 8,
        img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Sony Studio Wireless Headset",
        specs: "30-Hour Battery • Deep Bass • Type-C",
        price: 35000,
        stock: 5,
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
      }
    ];

    let savedProducts = JSON.parse(localStorage.getItem("apex_products"));
    let products = savedProducts ? savedProducts.map(function(p) {
      return { ...p, stock: p.stock !== undefined ? Number(p.stock) : 5 };
    }) : defaultProducts;

    let cart = JSON.parse(localStorage.getItem("apex_cart")) || [];

    window.onload = function() {
      const savedName = localStorage.getItem("apex_customer_name");
      const savedAddress = localStorage.getItem("apex_customer_address");

      if (savedName) document.getElementById("customerName").value = savedName;
      if (savedAddress) document.getElementById("customerAddress").value = savedAddress;

      renderProducts();
      updateCartUI();
    };

    function renderProducts() {
      const grid = document.getElementById("productsGrid");
      let cardsHTML = "";

      for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        const currentStock = Number(prod.stock);

        const stockBadgeHTML = currentStock > 0
          ? `<span class="stock-pill">${currentStock} in stock</span>`
          : `<span class="stock-pill out">Sold Out</span>`;

        let actionAreaHTML = "";

        if (isAdminUnlocked) {
          actionAreaHTML = `
            <div class="admin-card-controls">
              <div class="stock-adjust-row">
                <button class="btn-stock-step" onclick="adjustProductStock(${i}, -1)">-1</button>
                <span>Stock: ${currentStock} units</span>
                <button class="btn-stock-step" onclick="adjustProductStock(${i}, 1)">+1</button>
              </div>
              <button class="btn-delete-product" onclick="deleteProduct(${i})">🗑️ Remove Listing</button>
            </div>
          `;
        } else {
          if (currentStock > 0) {
            actionAreaHTML = `<button class="btn-add" onclick="addToCartByIndex(${i}, this)">Add to Order +</button>`;
          } else {
            actionAreaHTML = `<button class="btn-sold-out" disabled>Out of Stock</button>`;
          }
        }

        cardsHTML = cardsHTML + `
          <article class="card">
            ${stockBadgeHTML}
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
      if (isAdminUnlocked) {
        lockAdminMode();
        return;
      }
      const enteredPin = prompt("Enter Shop Owner PIN (Demo PIN: 1234):");
      if (enteredPin === ADMIN_PIN) {
        isAdminUnlocked = true;
        document.getElementById("adminPanel").style.display = "block";
        renderProducts();
        updateCartUI();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (enteredPin !== null) {
        alert("Incorrect PIN!");
      }
    }

    function lockAdminMode() {
      isAdminUnlocked = false;
      document.getElementById("adminPanel").style.display = "none";
      renderProducts();
      updateCartUI();
    }

    function addNewProduct() {
      const nameInput = document.getElementById("newProdName");
      const priceInput = document.getElementById("newProdPrice");
      const stockInput = document.getElementById("newProdStock");
      const specsInput = document.getElementById("newProdSpecs");
      const imgInput = document.getElementById("newProdImg");

      const name = nameInput.value.trim();
      const price = Number(priceInput.value);
      const stock = Number(stockInput.value);
      const specs = specsInput.value.trim() || "Available in stock";
      const img = imgInput.value.trim() || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80";

      if (name === "" || price <= 0 || stock <= 0) {
        alert("Please enter a valid Product Name, Price, and Stock Quantity (at least 1).");
        return;
      }

      products.unshift({
        name: name,
        specs: specs,
        price: price,
        stock: stock,
        img: img
      });

      localStorage.setItem("apex_products", JSON.stringify(products));
      renderProducts();

      nameInput.value = "";
      priceInput.value = "";
      stockInput.value = "";
      specsInput.value = "";
      imgInput.value = "";
    }

    function adjustProductStock(index, change) {
      const newStock = Number(products[index].stock) + change;
      if (newStock < 0) return;

      products[index].stock = newStock;
      localStorage.setItem("apex_products", JSON.stringify(products));
      renderProducts();
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
      const maxAvailableStock = Number(selectedProduct.stock);
      let existingItem = null;

      for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === selectedProduct.name) {
          existingItem = cart[i];
          break;
        }
      }

      if (existingItem !== null) {
        if (existingItem.qty >= maxAvailableStock) {
          alert("Sorry! Only " + maxAvailableStock + " unit(s) of " + selectedProduct.name + " available in stock.");
          return;
        }
        existingItem.qty = existingItem.qty + 1;
        existingItem.maxStock = maxAvailableStock;
      } else {
        cart.push({
          name: selectedProduct.name,
          price: Number(selectedProduct.price),
          qty: 1,
          maxStock: maxAvailableStock
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

      if (change > 0 && item.maxStock && item.qty >= item.maxStock) {
        alert("Maximum available stock (" + item.maxStock + ") reached for this item.");
        return;
      }

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
      localStorage.setItem("apex_customer_address", document.getElementById("customerAddress").value);
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
      const addressInput = document.getElementById("customerAddress");
      const errorMsg = document.getElementById("errorMsg");

      const customerName = nameInput.value.trim();
      const customerAddress = addressInput.value.trim();

      if (customerName === "" || customerAddress === "") {
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

      const fullMessage = "Hello Apex Gadgets! I would like to place an order:\n\n"
                        + "*Order Items:*\n" + orderLines
                        + "\n*Total Amount: ₦" + totalAmount.toLocaleString() + "*\n\n"
                        + "*Customer Details:*\n"
                        + "👤 Name: " + customerName + "\n"
                        + "📍 Delivery / Hostel: " + customerAddress + "\n\n"
                        + "Please confirm availability and delivery fee.";

      window.open("https://wa.me/" + VENDOR_PHONE + "?text=" + encodeURIComponent(fullMessage), "_blank");
    }
