//  6. JavaScript Cart + localStorage + Delivery Inputs 
    const VENDOR_PHONE = "2348130976312"; // Replace with your actual WhatsApp number in international format (no + or 00)

    // 1. Load saved cart from localStorage on page startup (or start with an empty array)
    let cart = JSON.parse(localStorage.getItem("apex_cart")) || [];

    // Load saved customer name & address on startup, and render the cart immediately
    window.onload = function() {
      const savedName = localStorage.getItem("apex_customer_name");
      const savedAddress = localStorage.getItem("apex_customer_address");

      if (savedName) document.getElementById("customerName").value = savedName;
      if (savedAddress) document.getElementById("customerAddress").value = savedAddress;

      updateCartUI();
    };

    // Helper Function: Save current cart array into localStorage
    function saveCartToStorage() {
      localStorage.setItem("apex_cart", JSON.stringify(cart));
    }

    // Helper Function: Save customer name & delivery address as they type
    function saveCustomerDetails() {
      const nameVal = document.getElementById("customerName").value;
      const addressVal = document.getElementById("customerAddress").value;

      localStorage.setItem("apex_customer_name", nameVal);
      localStorage.setItem("apex_customer_address", addressVal);

      // Hide error message as soon as they start typing
      document.getElementById("errorMsg").style.display = "none";
    }

    // Function 2: Add item or increase quantity
    function addToCart(productName, productPrice, buttonElement) {
      let existingItem = null;

      for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === productName) {
          existingItem = cart[i];
          break;
        }
      }

      if (existingItem !== null) {
        existingItem.qty = existingItem.qty + 1;
      } else {
        cart.push({
          name: productName,
          price: productPrice,
          qty: 1
        });
      }

      // Save updated cart to localStorage
      saveCartToStorage();

      // Button visual feedback
      const originalText = buttonElement.innerText;
      buttonElement.innerText = "✓ Added!";
      buttonElement.style.backgroundColor = "#16a34a";

      setTimeout(function() {
        buttonElement.innerText = originalText;
        buttonElement.style.backgroundColor = "#0f172a";
      }, 600);

      updateCartUI();
    }

    // Function 3: Adjust item quantity
    function changeQty(index, change) {
      cart[index].qty = cart[index].qty + change;

      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }

      saveCartToStorage();
      updateCartUI();
    }

    // Function 4: Remove a single item
    function removeItem(index) {
      cart.splice(index, 1);
      saveCartToStorage();
      updateCartUI();
    }

    // Function 5: Clear entire cart and remove from localStorage
    function clearCart() {
      cart = [];
      saveCartToStorage();
      updateCartUI();
    }

    // Function 6: Update visual drawer and totals
    function updateCartUI() {
      const cartDrawer = document.getElementById("cartDrawer");
      const cartItemsList = document.getElementById("cartItemsList");
      const cartCount = document.getElementById("cartCount");
      const cartTotal = document.getElementById("cartTotal");

      if (cart.length === 0) {
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
            <span class="cart-item-name">${item.qty}x ${item.name} (₦${itemSubtotal.toLocaleString()})</span>
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

    // Function 7: Validate inputs and launch WhatsApp with full receipt
    function checkoutOnWhatsApp() {
      const nameInput = document.getElementById("customerName");
      const addressInput = document.getElementById("customerAddress");
      const errorMsg = document.getElementById("errorMsg");

      // .trim() removes accidental spaces at the beginning or end
      const customerName = nameInput.value.trim();
      const customerAddress = addressInput.value.trim();

      // Check that both fields are filled before opening WhatsApp
      if (customerName === "" || customerAddress === "") {
        errorMsg.style.display = "block";
        if (customerName === "") {
          nameInput.focus();
        } else {
          addressInput.focus();
        }
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

      // Build the complete invoice with Customer Name and Delivery Location
      const fullMessage = "Hello Apex Gadgets! I would like to place an order:\n\n"
                        + "*Order Items:*\n"
                        + orderLines
                        + "\n*Total Amount: ₦" + totalAmount.toLocaleString() + "*\n\n"
                        + "*Customer Details:*\n"
                        + "👤 Name: " + customerName + "\n"
                        + "📍 Delivery Location: " + customerAddress + "\n\n"
                        + "Please confirm availability and delivery fee.";

      const whatsappURL = "https://wa.me/" + VENDOR_PHONE + "?text=" + encodeURIComponent(fullMessage);
      window.open(whatsappURL, "_blank");
    }
  