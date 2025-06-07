// Select DOM elements :
const btn = document.querySelector(".btn");
const post = document.querySelector(".post");
const widget = document.querySelector(".star-widget");
const editBtn = document.querySelector(".edit");

// Add click event handler to the "POST" button
  btn.onclick = () => {
  // When "POST" button is clicked:
  // 1. Hide the star rating widget
  widget.style.display = "none";
  // 2. Show the post-submission content
  post.style.display = "block";


// Add click event handler to the "EDIT" button
  editBtn.onclick = () => {
    // When "Edit" button is clicked:
    // 1. Show the star rating widget again
    widget.style.display = "block";
    // 2. Hide the post-submission content
    post.style.display = "none";
  }
// Prevent default form submission behavior
  return false;
}
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
