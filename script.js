// Sample product data and small browser-only interactions for this learning demo.
const categories = {
  "Health & Personal Care": { image: "box2_image.jpg", products: [["Everyday Wellness Kit", 18.99, 4.6], ["Gentle Skin Care Set", 24.5, 4.4], ["Daily Care Essentials", 12.99, 4.2]] },
  "Clothes": { image: "box1_image.jpg", products: [["Classic Cotton T-Shirt", 14.99, 4.5], ["Everyday Denim Jeans", 39.99, 4.3], ["Soft Knit Hoodie", 32.5, 4.7]] },
  "Furniture": { image: "box3_image.jpg", products: [["Modern Lounge Chair", 129.99, 4.6], ["Compact Side Table", 44.95, 4.2], ["Comfort Desk Chair", 89.5, 4.4]] },
  "Electronics": { image: "box4_image.jpg", products: [["Wireless Headphones", 49.99, 4.6], ["Portable Bluetooth Speaker", 34.95, 4.3], ["Smart Watch", 79.99, 4.5]] },
  "Beauty & MakeUp": { image: "box5_image.jpg", products: [["Daily Beauty Set", 22.99, 4.4], ["Hydrating Face Cream", 16.5, 4.5], ["Makeup Brush Kit", 19.99, 4.2]] },
  "Pets & Animals": { image: "box6_image.jpg", products: [["Comfy Pet Bed", 35.99, 4.7], ["Everyday Pet Toy Set", 12.49, 4.3], ["Stainless Pet Bowl", 14.95, 4.5]] },
  "Toys": { image: "box7_image.jpg", products: [["Creative Building Blocks", 28.99, 4.8], ["Soft Plush Animal", 17.99, 4.6], ["Family Puzzle Set", 13.5, 4.4]] },
  "Fashion": { image: "box8_image.jpg", products: [["Lightweight Everyday Jacket", 54.99, 4.5], ["Canvas Casual Backpack", 29.99, 4.4], ["Classic Running Shoes", 64.5, 4.6]] }
};

const inventory = Object.entries(categories).flatMap(([category, info]) => info.products.map(([name, price, rating], index) => ({
  id: `${category}-${index}`,
  category,
  name,
  price,
  rating,
  image: `images/${info.image}`
})));

const CART_KEY = "amazonCloneCart";
const ACCOUNT_KEY = "amazonCloneAccount";
const SESSION_KEY = "amazonCloneSignedIn";
const readCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));
const money = (amount) => `$${amount.toFixed(2)}`;

function renderProducts() {
  const grid = document.querySelector("#product-grid");
  if (!grid) return;

  const params = new URLSearchParams(location.search);
  const category = document.body.dataset.category || params.get("category") || "all";
  const query = (params.get("q") || "").trim().toLowerCase();
  const maxPrice = Number(document.querySelector("#max-price")?.value) || Infinity;
  const minRating = Number(document.querySelector("#min-rating")?.value) || 0;
  const sort = document.querySelector("#sort-products")?.value || "featured";
  let products = inventory.filter((product) => {
    const matchesCategory = category === "all" || product.category.toLowerCase() === category.toLowerCase();
    const matchesQuery = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery && product.price <= maxPrice && product.rating >= minRating;
  });

  if (sort === "price-low") products.sort((a, b) => a.price - b.price);
  if (sort === "price-high") products.sort((a, b) => b.price - a.price);
  if (sort === "rating") products.sort((a, b) => b.rating - a.rating);

  const heading = document.querySelector("#listing-title");
  if (heading && document.body.dataset.page === "search") {
    heading.textContent = query ? `Search results for “${params.get("q") || ""}”` : "All products";
    if (category !== "all") heading.textContent += ` in ${category}`;
  }
  grid.innerHTML = products.length ? products.map((product) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <span class="muted">${product.category}</span>
      <h2>${product.name}</h2>
      <span class="rating">★ ${product.rating} out of 5</span>
      <p class="price">${money(product.price)}</p>
      <button type="button" data-add-to-cart="${product.id}">Add to cart</button>
    </article>`).join("") : `<div class="empty-state">No matching products. Try a different search or reset your filters.</div>`;
}

function updateCartCount() {
  const count = readCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((node) => node.textContent = count);
}

function openCart() {
  const dialog = document.querySelector("#cart-dialog");
  const rows = document.querySelector("#cart-items");
  const totalNode = document.querySelector("#cart-total");
  if (!dialog || !rows) return;
  const cart = readCart();
  rows.innerHTML = cart.length ? cart.map((item) => `<div class="cart-row"><span>${item.name} × ${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join("") : "<p>Your cart is empty. Add something from a category page.</p>";
  if (totalNode) totalNode.textContent = cart.length ? `Subtotal: ${money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}` : "";
  if (!dialog.open) dialog.showModal();
}

function setupDialogs() {
  // Category/search pages share the same account and cart dialogs as the homepage.
  if (!document.querySelector("#account-dialog")) {
    document.body.insertAdjacentHTML("beforeend", `<dialog id="account-dialog" class="modal"><button class="modal-close" aria-label="Close">&times;</button><h2>Sign in or create an account</h2><p class="muted">Demo only: your account stays in this browser.</p><form id="account-form"><label>Username<input name="username" required minlength="3" autocomplete="username"></label><label>Password<input name="password" type="password" required minlength="4" autocomplete="current-password"></label><div class="modal-actions"><button class="primary" type="submit" data-auth-mode="signin">Sign in</button><button class="secondary" type="submit" data-auth-mode="signup">Create account</button></div><p id="account-message" class="form-message" aria-live="polite"></p></form></dialog><dialog id="cart-dialog" class="modal"><button class="modal-close" aria-label="Close">&times;</button><h2>Your cart</h2><div id="cart-items"></div><p id="cart-total" class="cart-total"></p><button id="clear-cart" class="secondary">Clear cart</button></dialog>`);
  }
}

async function passwordDigest(password) {
  const bytes = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function updateGreeting() {
  const user = sessionStorage.getItem(SESSION_KEY);
  document.querySelectorAll("#greeting").forEach((node) => node.textContent = user ? `Hello, ${user}` : "Hello, sign in");
}

document.addEventListener("DOMContentLoaded", () => {
  setupDialogs();
  renderProducts();
  updateCartCount();
  updateGreeting();

  document.querySelector("#max-price")?.addEventListener("input", renderProducts);
  document.querySelector("#min-rating")?.addEventListener("change", renderProducts);
  document.querySelector("#sort-products")?.addEventListener("change", renderProducts);
  document.querySelector("#reset-filters")?.addEventListener("click", () => {
    document.querySelector("#max-price").value = "";
    if (document.querySelector("#min-rating")) document.querySelector("#min-rating").value = "0";
    document.querySelector("#sort-products").value = "featured";
    renderProducts();
  });

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      const product = inventory.find((item) => item.id === addButton.dataset.addToCart);
      if (!product) return;
      const cart = readCart();
      const existing = cart.find((item) => item.id === product.id);
      if (existing) existing.quantity += 1;
      else cart.push({ ...product, quantity: 1 });
      saveCart(cart);
      updateCartCount();
      addButton.textContent = "Added!";
      setTimeout(() => addButton.textContent = "Add to cart", 900);
    }
    if (event.target.closest(".account-open")) document.querySelector("#account-dialog").showModal();
    if (event.target.closest(".cart-open")) openCart();
    if (event.target.closest(".modal-close")) event.target.closest("dialog").close();
    if (event.target.closest("#clear-cart")) {
      saveCart([]);
      updateCartCount();
      openCart();
    }
  });

  document.querySelector("#account-form")?.addEventListener("click", (event) => {
    if (event.target.type === "submit") document.querySelector("#account-form").dataset.mode = event.target.dataset.authMode;
  });
  document.querySelector("#account-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    const message = document.querySelector("#account-message");
    const mode = form.dataset.mode || "signin";
    const savedAccount = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
    const digest = await passwordDigest(password);
    if (mode === "signup") {
      if (savedAccount) { message.textContent = "A demo account already exists in this browser. Sign in instead."; return; }
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ username, passwordDigest: digest }));
      sessionStorage.setItem(SESSION_KEY, username);
      message.textContent = "Demo account created. You are signed in.";
    } else if (savedAccount && savedAccount.username === username && savedAccount.passwordDigest === digest) {
      sessionStorage.setItem(SESSION_KEY, username);
      message.textContent = "Signed in successfully.";
    } else {
      message.textContent = savedAccount ? "Username or password is incorrect." : "No demo account yet. Choose Create account first.";
      return;
    }
    updateGreeting();
    form.reset();
  });
});
