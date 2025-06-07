const cartMsg = document.createElement('div');
cartMsg.className = 'cart-message';
cartMsg.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  background: rgba(0, 128, 0, 0.9);
  color: white;
  border-radius: 5px;
  display: none;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  max-width: 300px;
  font-family: 'Karla', sans-serif;
`;
document.body.appendChild(cartMsg);

let hideTimer;

document.querySelectorAll('.add-to-cart').forEach(button => {
  button.addEventListener('click', function() {
    // Get the monitor name from the parent element
    const monitorname = this.closest('.cards-desc').querySelector('.product-name').textContent;
    
    // Update the message with the monitor name
    cartMsg.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">${monitorname}</div>
      <div>Added to cart! 🛒</div>
    `;
    
    // Show message (or keep it showing)
    cartMsg.style.display = 'block';
    
    // Reset the 3-second timer
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      cartMsg.style.display = 'none';
    }, 3000);
    
               // Button feedback
               const originalText = this.textContent;
               this.innerHTML = `
             <span style="display: inline-flex; align-items: center;">
                 <i class="fa-solid fa-circle-check fa-1x" ></i>Added!
             </span>`;
   
               setTimeout(() => {
                   this.textContent = originalText;
               }, 3000);
           });
       });
   


// Js for checkout and cart count
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
