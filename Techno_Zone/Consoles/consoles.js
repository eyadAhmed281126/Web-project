// --- Global State & Selectors ---
const openCartButton = document.querySelector('.open-cart');
const closeCartButton = document.querySelector('.close-cart');
const sidebarCart = document.querySelector('.sidebar-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const notification = document.querySelector('.notification');
const clearCartButton = document.querySelector('.clear-cart');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cardButtons = document.querySelectorAll('.card-buttons'); // For product page quantity selectors

// Selector for the main empty cart message (targets your HTML structure)
const mainEmptyCartMessageElement = document.querySelector('.empty-cart-message');

const applyFiltersButton = document.querySelector('.apply-filters');
const priceFromInput = document.getElementById('price-from');
const priceToInput = document.getElementById('price-to');
const productCards = document.querySelectorAll('.product-card'); // Used by filters

// Initialize cart from localStorage
let currentCartItems = JSON.parse(localStorage.getItem('cart')) || [];

// --- Helper Functions ---
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(currentCartItems));
}

function showNotification(message) {
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            if (notification) notification.style.display = 'none';
        }, 3000);
    }
}

function updateNotificationCircle() {
    const totalDistinctItems = currentCartItems.length;
    const totalQuantity = currentCartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const notificationCircleElement = document.querySelector('.notification-circle'); // For sidebar cart badge
    const globalCartCountElement = document.getElementById("cart-count"); // For global header count

    // Update sidebar notification circle (displays number of distinct item types)
    if (notificationCircleElement) {
        notificationCircleElement.style.display = totalDistinctItems > 0 ? 'flex' : 'none';
        notificationCircleElement.textContent = totalDistinctItems > 10 ? '+10' : totalDistinctItems.toString();
    }
    
    // Update global cart count (displays total quantity of all items)
    if (globalCartCountElement) {
        if (totalQuantity > 0) {
            globalCartCountElement.textContent = totalQuantity.toString();
            globalCartCountElement.style.display = "inline";
        } else {
            globalCartCountElement.style.display = "none";
        }
    }
}

function replaceAll() {
    if (!cartItemsContainer) return;

    // 1. Remove only the dynamically added product items (.cart-item)
    const existingProductItems = cartItemsContainer.querySelectorAll('.cart-item');
    existingProductItems.forEach(item => item.remove());

    if (currentCartItems.length === 0) {
        // Cart is empty: show the main empty cart message
        if (mainEmptyCartMessageElement) {
            mainEmptyCartMessageElement.style.display = 'flex'; // Your CSS uses flex
        }
    } else {
        // Cart has items: hide the main empty cart message and render items
        if (mainEmptyCartMessageElement) {
            mainEmptyCartMessageElement.style.display = 'none';
        }

        currentCartItems.forEach(item => {
            const priceNumber = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^\d.-]/g, '')) || 0;
            const itemImage = item.image || 'images/default_product.png'; // Provide a real default image path

            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.dataset.name = item.name; 

            cartItemElement.innerHTML = `
                <img src="${itemImage}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="price-controls">
                        <p>${priceNumber.toFixed(2)} EGP</p>
                        <div class="cart-item-controls">
                            <button class="btn decrement" data-name="${item.name}">-</button>
                            <span class="item-count">${item.quantity}</span>
                            <button class="btn increment" data-name="${item.name}">+</button>
                            <button class="btn remove-item" data-name="${item.name}">Remove</button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }
    updateNotificationCircle(); // Update all counts and indicators after rendering
}

// --- Event Listeners ---

// Sidebar Toggle
if (openCartButton && closeCartButton && sidebarCart) {
    openCartButton.addEventListener('click', () => {
        if (sidebarCart.classList.contains('open')) {
            sidebarCart.classList.remove('open');
            openCartButton.style.right = '0';
        } else {
            sidebarCart.classList.add('open');
            openCartButton.style.right = '450px';
        }
    });

    closeCartButton.addEventListener('click', () => {
        if (sidebarCart.classList.contains('open')) {
            sidebarCart.classList.remove('open');
            openCartButton.style.right = '0';
        }
    });
}

// Clear Cart Button
if (clearCartButton) {
    clearCartButton.addEventListener('click', () => {
        currentCartItems = [];
        saveCartToLocalStorage();
        replaceAll(); 
        showNotification('Cart has been cleared');
    });
}

// Product Card Quantity Pickers
cardButtons.forEach((buttons) => {
    const decrementButton = buttons.querySelector('.decrement');
    const incrementButton = buttons.querySelector('.increment');
    const itemCountElement = buttons.querySelector('.item-count');

    if (decrementButton && incrementButton && itemCountElement) {
        decrementButton.addEventListener('click', () => {
            let itemCount = parseInt(itemCountElement.textContent);
            if (itemCount > 1) {
                itemCount--;
                itemCountElement.textContent = itemCount.toString();
            }
        });
        incrementButton.addEventListener('click', () => {
            let itemCount = parseInt(itemCountElement.textContent);
            itemCount++;
            itemCountElement.textContent = itemCount.toString();
        });
    }
});

// Add to Cart Buttons on Product Listings
addToCartButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        const productCard = event.target.closest('.offer-wrapper, .playstations-wrapper, .nintendo-switch-wrapper, .Xbox-wrapper');
        if (!productCard) return;

        const nameElement = productCard.querySelector('h3, .Name');
        const priceElement = productCard.querySelector('.price');
        const imageElement = productCard.querySelector('.offer-image, .product-image');
        const quantitySelectorOnCard = productCard.querySelector('.item-count');

        if (!nameElement || !priceElement) {
            console.error("Essential product details (name or price) missing from card:", productCard);
            showNotification("Error: Could not add item. Product details missing.");
            return;
        }

        const productName = nameElement.textContent.trim();
        const productPriceText = priceElement.textContent;
        const productImage = imageElement ? imageElement.src : 'images/default_product.png'; // Default image
        const quantityToAdd = quantitySelectorOnCard ? parseInt(quantitySelectorOnCard.textContent) : 1;

        const productPriceNumeric = parseFloat(productPriceText.replace(/[^\d.-]/g, '')) || 0;

        const existingItemIndex = currentCartItems.findIndex(item => item.name === productName);

        if (existingItemIndex > -1) {
            currentCartItems[existingItemIndex].quantity += quantityToAdd;
        } else {
            currentCartItems.push({
                name: productName,
                price: productPriceNumeric,
                image: productImage,
                quantity: quantityToAdd
            });
        }

        saveCartToLocalStorage();
        replaceAll(); 
        showNotification(`${quantityToAdd} of ${productName} added to cart`);
        
        if (quantitySelectorOnCard) {
            quantitySelectorOnCard.textContent = '1'; 
        }
    });
});

// Sidebar Cart Item Interactions
if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.matches('.btn[data-name]')) return;

        const productName = target.dataset.name;
        if (!productName) return;

        const itemIndex = currentCartItems.findIndex(item => item.name === productName);
        if (itemIndex === -1) {
            console.warn("Item to modify not found in currentCartItems array:", productName);
            return; 
        }

        let itemActuallyModified = false;

        if (target.classList.contains('increment')) {
            currentCartItems[itemIndex].quantity++;
            itemActuallyModified = true;
        } else if (target.classList.contains('decrement')) {
            if (currentCartItems[itemIndex].quantity > 1) {
                currentCartItems[itemIndex].quantity--;
            } else {
                const removedItemName = currentCartItems[itemIndex].name;
                currentCartItems.splice(itemIndex, 1);
                showNotification(`${removedItemName} removed from cart.`);
            }
            itemActuallyModified = true;
        } else if (target.classList.contains('remove-item')) {
            const removedItemName = currentCartItems[itemIndex].name;
            currentCartItems.splice(itemIndex, 1);
            showNotification(`${removedItemName} removed from cart.`);
            itemActuallyModified = true;
        }

        if (itemActuallyModified) {
            saveCartToLocalStorage();
            replaceAll();
        }
    });
}

// Filters Logic
if (applyFiltersButton && priceFromInput && priceToInput && productCards.length > 0) {
    applyFiltersButton.addEventListener('click', () => {
        const priceFrom = parseFloat(priceFromInput.value) || 0;
        const priceTo = parseFloat(priceToInput.value) || Infinity;

        productCards.forEach(card => {
            const priceElement = card.querySelector('.price');
            let displayStyle = 'none'; 

            if (priceElement) {
                const productPrice = parseFloat(priceElement.textContent.replace(/[^\d.-]/g, '').trim());
                if (!isNaN(productPrice) && productPrice >= priceFrom && productPrice <= priceTo) {
                    displayStyle = 'block'; 
                }
            } else {
                if (priceFrom === 0 && priceTo === Infinity) {
                    displayStyle = 'block';
                }
            }
            
            if (card.parentElement) {
                card.parentElement.style.display = displayStyle;
            } else {
                 card.style.display = displayStyle;
            }
        });
    });
}


// --- DOMContentLoaded for remaining initializations ---
document.addEventListener('DOMContentLoaded', () => {
    // Toggle Filters Sidebar
    const toggleFiltersButton = document.querySelector('.toggle-filters');
    const filterSidebarElement = document.querySelector('.sidebar'); 

    if (toggleFiltersButton && filterSidebarElement) {
        toggleFiltersButton.addEventListener('click', () => {
            filterSidebarElement.classList.toggle('active');
            if (filterSidebarElement.classList.contains('active')) {
                toggleFiltersButton.style.left = '100px';
            } else {
                toggleFiltersButton.style.left = '1000px';
            }
        });
    }
    
    replaceAll(); 
});
