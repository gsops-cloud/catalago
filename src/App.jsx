// src/App.jsx
import { CartProvider } from "./context/CartContext";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import { products } from "./data/products";

function App() {
  return (
    <CartProvider>
      <h1>Catálogo</h1>

      <div style={{ display: "flex", gap: 20 }}>
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <Cart />
    </CartProvider>
  );
}

export default App;