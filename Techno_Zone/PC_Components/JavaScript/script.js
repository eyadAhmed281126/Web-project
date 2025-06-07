document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cart-items');
    const addToCartButtons = document.querySelectorAll('.add-to-cart'); 
    const totalPriceElement = document.getElementById('total-price');
    const clearCartButton = document.getElementById('clear-cart');
    const cartLink = document.getElementById('cart-link');

    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    function updateCartDisplay() {
      cartItems.innerHTML = '';
      let total = 0;
      let itemCount = 0;

      for (const key in cart) {
        const item = cart[key];
        const li = document.createElement('li');

        li.innerHTML = `
          ${item.name} - ${item.price} × ${item.quantity} = ${item.total} EGP
        `;

        const decreaseButton = document.createElement('button');
        decreaseButton.textContent = '➖';
        decreaseButton.addEventListener('click', function() {
          decreaseQuantity(key);
        });

        const increaseButton = document.createElement('button');
        increaseButton.textContent = '➕';
        increaseButton.addEventListener('click', function() {
          increaseQuantity(key);
        });

        const removeButton = document.createElement('button');
        removeButton.textContent = '🗑️';
        removeButton.addEventListener('click', function() {
          removeItem(key);
        });

        li.appendChild(decreaseButton);
        li.appendChild(increaseButton);
        li.appendChild(removeButton);

        cartItems.appendChild(li);

        total += item.total;
        itemCount += item.quantity;
      }

      totalPriceElement.textContent = `Total: ${total} EGP`;
      cartLink.textContent = `Cart (${itemCount})`;

      localStorage.setItem('cart', JSON.stringify(cart));
    }

    addToCartButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const name = document.querySelectorAll('.front h3')[index].innerText;
        const priceText = document.querySelectorAll('.front p')[index].innerText;
        const price = parseFloat(priceText.replace(' EGP', '').replace(',', ''));

        console.log('Adding to cart:', name, price);

        if (cart[name]) {
          cart[name].quantity++;
          cart[name].total = cart[name].quantity * cart[name].price;
        } else {
          cart[name] = {
            name: name,
            price: price,
            quantity: 1,
            total: price
          };
        }

        updateCartDisplay();
      });
    });

    function increaseQuantity(key) {
      cart[key].quantity++;
      cart[key].total = cart[key].quantity * cart[key].price;
      updateCartDisplay();
    }

    function decreaseQuantity(key) {
      if (cart[key].quantity > 1) {
        cart[key].quantity--;
        cart[key].total = cart[key].quantity * cart[key].price;
      } else {
        delete cart[key];
      }
      updateCartDisplay();
    }

    function removeItem(key) {
      delete cart[key];
      updateCartDisplay();
    }

    clearCartButton.addEventListener('click', function() {
      cart = {};
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartDisplay();
    });

    updateCartDisplay();
});

//-------------------Shopping Cart JS-------------------------
document.addEventListener("DOMContentLoaded", () => {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCountElement = document.getElementById("cart-count");

    //  SUM of Quantities in Cart {to make multiple product increase its count and not added again}
    const updateCartCount = () => {
        const totalItems = cartItems.reduce((total, item) => {
            return total + (item.quantity || 1); // Handles missing quantity
        }, 0);
        if (cartCountElement) {
            if (totalItems > 0) {
                cartCountElement.textContent = totalItems;
                cartCountElement.style.display = "inline";
            } else {
                cartCountElement.style.display = "none";
            }
        }
    };
    // Initialize Cart Count
    updateCartCount();
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".product-card");
            const name = card.querySelector(".product-name").innerText.trim();
            const price = card.querySelector(".product-price").innerText.trim();
            // Check if product exists
            const existingIndex = cartItems.findIndex(item => item.name === name);
            if (existingIndex !== -1) {
                // Product exists → increment quantity
                cartItems[existingIndex].quantity = (cartItems[existingIndex].quantity || 1) + 1;
            } else {
                // New product → add with quantity 1
                cartItems.push({ name, price, quantity: 1 });
            }
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount(); // updates count
        });
    });
});
