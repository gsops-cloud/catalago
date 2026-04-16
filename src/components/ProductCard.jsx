import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, width: 180 }}>
      <img
        src={product.image}
        alt={product.name}
        width="150"
        style={{ display: "block", marginBottom: 12, objectFit: "cover" }}
      />
      <h3>{product.name}</h3>
      <p>R$ {product.price.toFixed(2)}</p>
      <button onClick={() => addToCart(product)} style={{ padding: 8, width: "100%" }}>
        Adicionar
      </button>
    </div>
  );
}
