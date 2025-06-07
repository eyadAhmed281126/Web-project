document.addEventListener("DOMContentLoaded", () => {
  // Make cartItems accessible to event listeners later
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountElement = document.getElementById("cart-count");
  const globalCheckSound = document.getElementById("global-check-sound");
  const searchBar = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  const productCards = document.querySelectorAll(".product-card");
  const productsContainer = document.querySelector(".products-container");

  // Update the cart item count in the UI
  const updateCartCount = () => {
    // Read the latest count directly from the cartItems array
    const count = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    if (cartCountElement) {
      if (count > 0) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = "inline";
      } else {
        cartCountElement.style.display = "none";
      }
    }
  };

  // Play the check sound when an item is added to cart
  const playCheckSound = () => {
    if (globalCheckSound) {
      globalCheckSound.currentTime = 0;
      globalCheckSound.play().catch(error => console.log("Global audio play failed:", error));
    }
  };

  // Show the animated checkmark when an item is added
  const showCheckmarkAnimation = (card) => {
    const checkIcon = card.querySelector(".check-icon");
    if (checkIcon) {
      checkIcon.style.display = "inline";
      setTimeout(() => {
        checkIcon.classList.add("show");
      }, 10);

      setTimeout(() => {
        checkIcon.classList.remove("show");
        setTimeout(() => {
          checkIcon.style.display = "none";
        }, 500); // Matches CSS transition for opacity
      }, 1500); // How long the checkmark is visible
    }
  };

  // --- Add to Cart Logic ---
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const name = card.querySelector(".product-name").innerText.trim();
      const priceText = card.querySelector(".product-price").innerText.trim();
      // const imageSrc = card.querySelector(".product-image")?.src; // Optional

      const existingProductIndex = cartItems.findIndex(item => item.name === name);

      if (existingProductIndex !== -1) {
        cartItems[existingProductIndex].quantity = (cartItems[existingProductIndex].quantity || 0) + 1;
      } else {
        const product = { name, price: priceText, quantity: 1 };
        // if (imageSrc) product.image = imageSrc;
        cartItems.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cartItems));

      playCheckSound();
      showCheckmarkAnimation(card);
      updateCartCount(); // Update count immediately after adding
    });
  });

  // --- Search Logic ---
  function performSearch() {
    const query = searchBar.value.toLowerCase().trim();
    let visibleProductCount = 0;
    let noResultsMessage = productsContainer.querySelector(".no-results-message");

    productCards.forEach(card => {
      const productName = card.querySelector(".product-name").innerText.toLowerCase();
      const categorySection = card.closest('.category');
      // Ensure dataset.categoryName is accessed correctly, might need || '' if categoryName could be undefined
      const categoryName = categorySection?.dataset.categoryName?.toLowerCase() || "";

      const matchesProduct = productName.includes(query);
      // Only match category if query is more than just one letter (prevents matching 'a' in 'Asus')
      const matchesCategory = categoryName.includes(query) && query.length > 1;

      if (matchesProduct || matchesCategory) {
        card.style.display = "block";
        visibleProductCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Handle "No results" message display
    if (visibleProductCount === 0 && query !== "") {
      if (!noResultsMessage) {
        noResultsMessage = document.createElement("p");
        noResultsMessage.className = "no-results-message";
        const searchContainer = document.querySelector('.search-countern');
        // Insert after search container if possible, otherwise prepend to products container
        if (searchContainer && searchContainer.parentNode) {
            searchContainer.parentNode.insertBefore(noResultsMessage, searchContainer.nextSibling);
        } else {
            productsContainer.prepend(noResultsMessage);
        }
      }
      noResultsMessage.textContent = `No products found for "${searchBar.value}"`;
      noResultsMessage.style.display = "block";
    } else if (noResultsMessage) {
      noResultsMessage.style.display = "none";
    }

    // Show/hide entire category sections based on visible products within them
    document.querySelectorAll('.category').forEach(categorySection => {
        const visibleCardsInCategory = Array.from(categorySection.querySelectorAll('.product-card')).filter(card => card.style.display !== 'none');
        // Show category if search is empty OR if it has visible cards
        if (query === "" || visibleCardsInCategory.length > 0) {
            categorySection.style.display = "block";
        } else {
            categorySection.style.display = "none";
        }
    });
  }

  // Attach search event listeners
  if (searchBtn && searchBar) {
    searchBtn.addEventListener("click", performSearch);
    searchBar.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        performSearch();
      }
      // Perform search immediately if search bar is cleared
      if (searchBar.value.trim() === "" && event.key !== "Enter") { // Added check to avoid double search on Enter key when clearing
        performSearch();
      }
    });
  }

  // --- NEW: Listen for localStorage changes from other pages ---
  window.addEventListener('storage', function(event) {
    console.log("Storage event on laptop page:", event.key); // Debugging
    if (event.key === 'cart') {
      // Cart data in localStorage has changed (e.g., cleared on payment page)
      // Update the local cartItems variable on this page
      cartItems = JSON.parse(event.newValue) || [];
      // Update the cart count display in the header
      updateCartCount();
    }
  });

  // --- NEW: Listen for window focus to catch changes ---
  window.addEventListener('focus', function() {
    console.log("Focus event on laptop page"); // Debugging
    // Get the current state from localStorage when the tab regains focus
    const currentCartFromStorage = JSON.parse(localStorage.getItem("cart")) || [];
    // Check if the cart data has actually changed compared to this page's state
    if (JSON.stringify(cartItems) !== JSON.stringify(currentCartFromStorage)) {
        console.log("Cart changed on focus, updating..."); // Debugging
        cartItems = currentCartFromStorage; // Update local variable
        updateCartCount(); // Update display
    }
  });
  // --- END NEW ---


  // --- Initial Setup on Page Load ---
  updateCartCount(); // Update count when page first loads

  // Ensure category names are set in dataset for search functionality
  document.querySelectorAll('.category').forEach(section => {
    const title = section.querySelector('.category-title');
    if (title) {
        section.dataset.categoryName = title.innerText.trim();
    } else {
        console.warn("Category section found without a .category-title element:", section);
    }
  });

}); // End DOMContentLoaded