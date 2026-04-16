import { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import { products as initialProducts } from "./data/products";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("catalogue-products");
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("catalogue-admin") === "true";
  });
  const [loginError, setLoginError] = useState("");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImagePreview, setNewImagePreview] = useState("");

  useEffect(() => {
    localStorage.setItem("catalogue-admin", isAdmin ? "true" : "false");
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem("catalogue-products", JSON.stringify(products));
  }, [products]);

  function handleLogin(event) {
    event.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setLoginError("");
      setUsername("");
      setPassword("");
      return;
    }

    setLoginError("Usuário ou senha inválidos.");
  }

  function handleLogout() {
    setIsAdmin(false);
    setLoginError("");
  }

  function updateProduct(id, changes) {
    setProducts((prev) => prev.map((product) => (
      product.id === id ? { ...product, ...changes } : product
    )));
  }

  function handleProductPriceChange(id, value) {
    const price = Number(value);
    if (Number.isNaN(price)) return;
    updateProduct(id, { price });
  }

  function handleImageUpload(id, file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateProduct(id, { image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function handleNewImageChange(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function addNewProduct(event) {
    event.preventDefault();

    if (!newName || !newPrice || !newImagePreview) {
      return;
    }

    const nextId = Math.max(...products.map((product) => product.id)) + 1;
    setProducts((prev) => [
      ...prev,
      {
        id: nextId,
        name: newName,
        price: Number(newPrice),
        image: newImagePreview,
      },
    ]);
    setNewName("");
    setNewPrice("");
    setNewImagePreview("");
  }

  return (
    <CartProvider>
      <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
        <h1>Catálogo</h1>

        {!isAdmin && (
          <form onSubmit={handleLogin} style={{ marginBottom: 20 }}>
            <h2>Login de Administrador</h2>
            <div style={{ display: "grid", gap: 10, maxWidth: 300 }}>
              <label>
                Usuário
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin"
                  style={{ width: "100%", padding: 8 }}
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="1234"
                  style={{ width: "100%", padding: 8 }}
                />
              </label>
              <button type="submit" style={{ padding: 10 }}>Entrar como administrador</button>
              {loginError && <p style={{ color: "red" }}>{loginError}</p>}
            </div>
          </form>
        )}

        {isAdmin && (
          <section style={{ marginBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2>Painel do Administrador</h2>
                <p>Você pode alterar preço, imagem ou adicionar novos produtos.</p>
              </div>
              <button onClick={handleLogout} style={{ padding: 10 }}>Sair</button>
            </div>

            <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
              {products.map((product) => (
                <div key={product.id} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
                  <h3>{product.name}</h3>
                  <img
                    src={product.image}
                    alt={product.name}
                    width="120"
                    style={{ display: "block", marginBottom: 12, objectFit: "cover" }}
                  />
                  <label style={{ display: "block", marginBottom: 8 }}>
                    Preço (R$)
                    <input
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(event) => handleProductPriceChange(product.id, event.target.value)}
                      style={{ width: "100%", padding: 8, marginTop: 4 }}
                    />
                  </label>
                  <label style={{ display: "block" }}>
                    Nova foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(product.id, event.target.files?.[0])}
                      style={{ display: "block", marginTop: 4 }}
                    />
                  </label>
                </div>
              ))}
            </div>

            <form onSubmit={addNewProduct} style={{ marginTop: 30, borderTop: "1px solid #ddd", paddingTop: 20, maxWidth: 500 }}>
              <h3>Adicionar novo produto</h3>
              <div style={{ display: "grid", gap: 12 }}>
                <label>
                  Nome do produto
                  <input
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </label>
                <label>
                  Preço (R$)
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(event) => setNewPrice(event.target.value)}
                    style={{ width: "100%", padding: 8, marginTop: 4 }}
                  />
                </label>
                <label>
                  Foto do produto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleNewImageChange(event.target.files?.[0])}
                    style={{ display: "block", marginTop: 4 }}
                  />
                </label>
                {newImagePreview && (
                  <img src={newImagePreview} alt="Prévia" width="120" style={{ display: "block" }} />
                )}
                <button type="submit" style={{ padding: 10 }}>Adicionar produto</button>
              </div>
            </form>
          </section>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <Cart />
      </div>
    </CartProvider>
  );
}

export default App;
