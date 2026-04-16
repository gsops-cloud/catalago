import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div>
      <img src={product.image} width="150" />
      <h3>{product.name}</h3>
      <p>R$ {product.price}</p>
      <button onClick={() => addToCart(product)}>
        Adicionar
      </button>
    </div>
  );
}