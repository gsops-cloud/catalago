// src/components/Cart.jsx
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Cart() {
  const { cart } = useContext(CartContext);

  function sendToWhatsApp() {
    const phone = "5585999999999"; // seu número

    const message = cart
      .map(item => `• ${item.name} - R$ ${item.price}`)
      .join("%0A");

    const url = `https://wa.me/${phone}?text=Pedido:%0A${message}`;

    window.open(url, "_blank");
  }

  return (
    <div>
      <h2>Carrinho</h2>
      {cart.map((item, index) => (
        <p key={index}>{item.name}</p>
      ))}

      <button onClick={sendToWhatsApp}>
        Finalizar no WhatsApp
      </button>
    </div>
  );
}