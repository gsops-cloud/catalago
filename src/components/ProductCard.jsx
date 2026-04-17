import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function getTierPrice(price, quantity) {
  if (quantity >= 100) return Math.max(price - 3, 0);
  if (quantity >= 50) return Math.max(price - 2, 0);
  if (quantity >= 10) return Math.max(price - 1, 0);
  return price;
}

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const tier10 = getTierPrice(product.price, 10).toFixed(2);
  const tier50 = getTierPrice(product.price, 50).toFixed(2);
  const tier100 = getTierPrice(product.price, 100).toFixed(2);

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="price">A partir de R$ {product.price.toFixed(2)}</p>
        <div className="price-badges">
          <span>10+ R$ {tier10}</span>
          <span>50+ R$ {tier50}</span>
          <span>100+ R$ {tier100}</span>
        </div>
        <button type="button" className="button button-secondary" onClick={() => addToCart(product)}>
          Adicionar
        </button>
      </div>
    </div>
  );
}
