document.addEventListener("DOMContentLoaded", function () {
  const cartItemsListContainer = document.querySelector(
    ".cart-items-list-container"
  );
  const returnBtn = document.querySelector(".return-btn");
  const removeAllBtn = document.querySelector(".remove-all-btn");
  const payBtn = document.querySelector(".pay-btn");
  const paymentErrorMessage = document.getElementById("payment-error-message");
  const paymentInputs = {
    name: document.getElementById("b-name"),
    email: document.getElementById("email-ad"),
    phone: document.getElementById("phone-num"),
    address: document.getElementById("delivery-address"),
    cardName: document.getElementById("card-name"),
    cardNumber: document.getElementById("card-number"),
    cardExpiry: document.getElementById("card-expiry"),
    cardCvv: document.getElementById("card-cvv"),
  };
  const paymentFormFields = Object.values(paymentInputs).filter(Boolean);
  const PAYMENT_DETAILS_KEY = "paymentDetails";

  let cartItems = [];
  try {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      if (Array.isArray(parsedCart)) {
        cartItems = parsedCart;
      } else {
        console.warn(
          "Stored cart data was not an array. Initializing to empty cart."
        );
        cartItems = [];
      }
    }
  } catch (error) {
    console.error("Error parsing cart from localStorage on init:", error);
    cartItems = []; // Default to empty cart on error
  }

  function savePaymentDetails() {
    const details = {};
    for (const key in paymentInputs) {
      if (paymentInputs[key]) {
        details[key] = paymentInputs[key].value;
      }
    }
    localStorage.setItem(PAYMENT_DETAILS_KEY, JSON.stringify(details));
  }

  function loadPaymentDetails() {
    try {
      const savedDetails = JSON.parse(
        localStorage.getItem(PAYMENT_DETAILS_KEY)
      );
      if (savedDetails) {
        for (const key in savedDetails) {
          if (paymentInputs[key] && typeof savedDetails[key] !== "undefined") {
            paymentInputs[key].value = savedDetails[key];
          }
        }
      }
    } catch (error) {
      console.error("Error loading payment details from localStorage:", error);
    }
  }

  function clearSavedPaymentDetails() {
    localStorage.removeItem(PAYMENT_DETAILS_KEY);
  }

  function displayCartItems() {
    cartItemsListContainer.innerHTML = "";

    // Sanitize quantities in cartItems *before* rendering and calculating totals
    cartItems.forEach((item) => {
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity < 1) {
        item.quantity = 1; // Default to 1 if not a valid positive number
      } else {
        item.quantity = quantity; // Ensure it's stored as a number
      }
    });

    if (cartItems.length === 0) {
      showEmptyCartMessage();
      // Payment details are NOT cleared here anymore based on previous request
    } else {
      cartItems.forEach((item, index) => {
        // item.quantity is now guaranteed to be a number >= 1
        const cartItemElement = document.createElement("div");
        cartItemElement.className = "cart-item";

        let itemPrice = 0;
        if (item.price && typeof item.price === "string") {
          const priceStringNoCommas = item.price.replace(/,/g, "");
          const priceMatch = priceStringNoCommas.match(/[\d\.]+/);
          if (priceMatch && priceMatch[0]) {
            const parsedPrice = parseFloat(priceMatch[0]);
            if (!isNaN(parsedPrice)) {
              itemPrice = parsedPrice;
            } else {
              console.warn(
                `Could not parse price (NaN) for item: "${item.name}". Original: "${item.price}"`
              );
            }
          } else {
            console.warn(
              `Could not extract numeric part from price for item: "${item.name}". Original: "${item.price}"`
            );
          }
        } else if (typeof item.price === "number") {
          itemPrice = item.price;
        } else {
          console.warn(
            `Price data missing or not a string/number for item: "${item.name}".`
          );
        }

        cartItemElement.innerHTML = `
          <span class="item-name">${item.name || "Unknown Item"}</span>
          <div class="item-controls">
            <span class="price-tag">${itemPrice.toFixed(2)} EGP</span>
            <div class="quantity-control">
              <i class="bx bx-minus-circle bx-sm" data-index="${index}"></i>
              <span class="quantity">${item.quantity}</span>
              <i class="bx bx-plus-circle bx-sm" data-index="${index}"></i>
            </div>
            <button class="remove-btn" data-index="${index}">Remove</button>
          </div>
        `;
        cartItemsListContainer.appendChild(cartItemElement);
      });
    }
    updateTotals(); // Always update totals after display changes
    attachItemEventListeners();
  }

  function attachItemEventListeners() {
    document.querySelectorAll(".cart-item .remove-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        cartItems.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cartItems));
        displayCartItems();
        updateCartCount();
      });
    });

    document
      .querySelectorAll(".cart-item .bx-plus-circle")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const index = parseInt(e.target.dataset.index);
          // cartItems[index].quantity is already a number here due to displayCartItems sanitization
          cartItems[index].quantity++;
          localStorage.setItem("cart", JSON.stringify(cartItems));
          displayCartItems();
        });
      });

    document
      .querySelectorAll(".cart-item .bx-minus-circle")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const index = parseInt(e.target.dataset.index);
          if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
            localStorage.setItem("cart", JSON.stringify(cartItems));
            displayCartItems();
          }
        });
      });
  }

  function updateTotals() {
    let subtotal = 0;
    const TAX_RATE = 0.12; //  HTML label matches 

    cartItems.forEach((item) => {
      let price = 0;
      if (item.price && typeof item.price === "string") {
        const priceStringNoCommas = item.price.replace(/,/g, "");
        const priceMatch = priceStringNoCommas.match(/[\d\.]+/);
        if (priceMatch && priceMatch[0]) {
          const parsed = parseFloat(priceMatch[0]);
          if (!isNaN(parsed)) {
            price = parsed;
          } else {
            console.warn(
              `Could not parse price (NaN) for total calculation for item: "${item.name}". Original: "${item.price}"`
            );
          }
        } else {
          console.warn(
            `Could not extract numeric part from price for total calculation for item: "${item.name}". Original: "${item.price}"`
          );
        }
      } else if (typeof item.price === "number") {
        price = item.price;
      } else {
        console.warn(
          `Price data missing or not a string/number for total calculation for item: "${item.name}".`
        );
      }

      // item.quantity is guaranteed to be a number >= 1 by displayCartItems
      const quantity = item.quantity;
      subtotal += price * quantity;
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    updateDisplay(".subtotal-amount", subtotal);
    updateDisplay(".tax-amount", tax);
    updateDisplay(".total-amount", total);
  }

  function updateDisplay(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      // value should be a number here. If it became NaN, toFixed will produce "NaN"
      element.textContent = `${value.toFixed(2)} EGP`;
    } else {
      console.warn(
        `Element with selector "${selector}" not found for updating display.`
      );
    }
  }

  function showEmptyCartMessage() {
    const existingMessage = cartItemsListContainer.querySelector(
      ".empty-cart-message"
    );
    if (existingMessage) existingMessage.remove();
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-cart-message";
    emptyMessage.textContent = "Your cart is empty.";
    cartItemsListContainer.appendChild(emptyMessage);
  }

  function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
      const count = cartItems.reduce(
        (acc, item) => acc + (item.quantity || 0),
        0
      );
      if (count > 0) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = "inline";
      } else {
        cartCountElement.style.display = "none";
      }
    }
  }

  if (returnBtn) {
    returnBtn.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "../Home Page/Home Page.html"; // Fallback page
      }
    });
  }

  if (removeAllBtn) {
    removeAllBtn.addEventListener("click", () => {
      cartItems = [];
      localStorage.setItem("cart", JSON.stringify(cartItems));
      // Payment details are NOT cleared here based on previous request
      displayCartItems();
      updateCartCount();
    });
  }

  if (payBtn) {
    payBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (paymentErrorMessage) {
        paymentErrorMessage.style.display = "none";
        paymentErrorMessage.textContent = "";
      }

      if (cartItems.length === 0) {
        if (paymentErrorMessage) {
          paymentErrorMessage.textContent =
            "Your cart is empty. Please add items before checkout.";
          paymentErrorMessage.style.display = "block";
        } else {
          alert("Your cart is empty. Please add items before checkout.");
        }
        return;
      }

      const requiredInputs = document.querySelectorAll(
        ".payment-wrapper input[required]"
      );
      let isValid = true;
      let firstInvalidField = null;
      requiredInputs.forEach((input) => {
        if (!input.checkValidity()) {
          input.style.borderColor = "red";
          isValid = false;
          if (input.validity.patternMismatch && input.title) {
            console.log(`Pattern mismatch for ${input.id}: ${input.title}`);
          }
          if (!firstInvalidField) firstInvalidField = input;
        } else {
          input.style.borderColor = "";
        }
      });

      if (!isValid) {
        if (paymentErrorMessage) {
          paymentErrorMessage.textContent =
            "Please fill out all required fields correctly.";
          paymentErrorMessage.style.display = "block";
        } else {
          alert("Please fill out all required fields correctly.");
        }
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      alert("Payment successful! Thank you for your purchase.");
      cartItems = [];
      localStorage.setItem("cart", JSON.stringify(cartItems));
      clearSavedPaymentDetails(); // Clear payment details on successful payment
      paymentFormFields.forEach((input) => (input.value = "")); // Clear form fields
      displayCartItems();
      updateCartCount();
    });
  }

  // Input field restrictions (no changes here from your original provided code)
  function restrictToNumeric(
    inputElement,
    regexPatternToRemove,
    maxLength = null
  ) {
    if (inputElement) {
      inputElement.addEventListener("input", function (event) {
        let value = event.target.value;
        value = value.replace(regexPatternToRemove, "");
        if (maxLength && value.length > maxLength) {
          value = value.slice(0, maxLength);
        }
        event.target.value = value;
      });
    }
  }
  function formatCardNumber(inputElement) {
    if (inputElement) {
      inputElement.addEventListener("input", function (event) {
        let value = event.target.value;
        const digitsOnly = value.replace(/[^0-9]/g, "");
        const limitedDigits = digitsOnly.slice(0, 16);
        let formattedValue = "";
        for (let i = 0; i < limitedDigits.length; i++) {
          if (i > 0 && i % 4 === 0) {
            formattedValue += " ";
          }
          formattedValue += limitedDigits[i];
        }
        event.target.value = formattedValue;
      });
    }
  }
  restrictToNumeric(paymentInputs.phone, /[^0-9]/g, 10);
  formatCardNumber(paymentInputs.cardNumber);
  restrictToNumeric(paymentInputs.cardCvv, /[^0-9]/g, 4);
  if (paymentInputs.cardExpiry) {
    paymentInputs.cardExpiry.addEventListener("input", function (event) {
      let value = event.target.value;
      let digitsAndSlashOnly = value.replace(/[^0-9/]/g, "");
      let formattedValue = "";
      const parts = digitsAndSlashOnly.split("/");
      let monthPart = parts[0] || "";
      let yearPart = parts[1] || "";
      if (monthPart.length > 2) {
        yearPart = monthPart.substring(2) + yearPart;
        monthPart = monthPart.substring(0, 2);
      }
      formattedValue = monthPart;
      if (
        monthPart.length === 2 &&
        !digitsAndSlashOnly.includes("/") &&
        event.inputType !== "deleteContentBackward" &&
        event.inputType !== "deleteContentForward"
      ) {
        if (digitsAndSlashOnly.length > 2 || yearPart.length > 0) {
          formattedValue += "/";
        }
      } else if (monthPart.length === 2 && digitsAndSlashOnly.includes("/")) {
        formattedValue += "/";
      }
      yearPart = yearPart.replace(/\//g, "");
      if (yearPart.length > 2) {
        yearPart = yearPart.substring(0, 2);
      }
      formattedValue += yearPart;
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.slice(0, 5);
      }
      event.target.value = formattedValue;
    });
  }

  // Storage and Focus listeners
  window.addEventListener("storage", function (event) {
    if (event.key === "cart") {
      let newCartData = [];
      try {
        if (event.newValue) {
          const parsedData = JSON.parse(event.newValue);
          if (Array.isArray(parsedData)) {
            newCartData = parsedData;
          } else {
            console.warn(
              "Cart data from storage event was not an array:",
              parsedData
            );
          }
        }
      } catch (e) {
        console.error("Error parsing cart data from storage event:", e);
      }
      cartItems = newCartData;
      displayCartItems(); // This will sanitize quantities and update totals
      updateCartCount();
    }
    if (event.key === PAYMENT_DETAILS_KEY && cartItems.length > 0) {
      loadPaymentDetails();
    }
  });

  window.addEventListener("focus", function () {
    let currentCartFromStorage = [];
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedData = JSON.parse(storedCart);
        if (Array.isArray(parsedData)) {
          currentCartFromStorage = parsedData;
        } else {
          console.warn(
            "Cart data from storage on focus was not an array:",
            parsedData
          );
        }
      }
    } catch (e) {
      console.error("Error parsing cart data from storage on focus:", e);
    }

    if (JSON.stringify(cartItems) !== JSON.stringify(currentCartFromStorage)) {
      cartItems = currentCartFromStorage;
      displayCartItems(); // This will sanitize quantities and update totals
      updateCartCount();
    }
    if (cartItems.length > 0) {
      loadPaymentDetails();
    }
  });

  // Initial Page Load
  if (cartItems.length > 0) {
    loadPaymentDetails(); // Load payment details if cart is not empty
  }
  displayCartItems(); // Initial display
  updateCartCount();
});
