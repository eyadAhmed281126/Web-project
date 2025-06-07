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
