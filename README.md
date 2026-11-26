# Amazon Clone

A small Amazon-inspired storefront for learning HTML, CSS, and JavaScript. It is not affiliated with Amazon and is not intended for commercial use.

## Run it

Open `index.html` in a modern browser. No build tools or server are required.

## Included

- Homepage category cards that open separate category pages in a new tab
- Sample products and prices for eight categories
- Product search, category selection, maximum price, rating, and sort filters
- A cart saved in browser local storage
- A demo sign-up/sign-in flow with a browser-only account
- Product/category imagery stored in `images/`

## Demo account limitation

The account and cart are only stored in this browser. Passwords are hashed in the browser as a demonstration, but this is **not secure authentication** and must not be used for real accounts. A real shop needs a backend or a trusted authentication service.

Product names, prices, and ratings are sample data in `script.js`. The existing category photos are reused for product cards, so unique product photos can be added later for a more realistic catalog.

## Project files

- `index.html` — homepage
- `script.js` — product data, search/filter behavior, cart, and demo account logic
- `style.css` — shared styles
- `search.html` — global product search
- `clothes.html`, `health.html`, `furniture.html`, `electronics.html`, `beauty.html`, `pets.html`, `toys.html`, `fashion.html` — category listings
- `images/` — logos, category artwork, hero artwork, and preview screenshots
