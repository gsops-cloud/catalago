import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="price">R$ {product.price.toFixed(2)}</p>
        <button type="button" className="button button-secondary" onClick={() => addToCart(product)}>
          Adicionar
        </button>
      </div>
    </div>
  );
}
