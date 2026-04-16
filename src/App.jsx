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
  const [showLogin, setShowLogin] = useState(false);

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
      setShowLogin(false);
      setLoginError("");
      setUsername("");
      setPassword("");
      return;
    }

    setLoginError("Usuário ou senha inválidos.");
  }

  function handleLogout() {
    setIsAdmin(false);
    setShowLogin(false);
    setLoginError("");
  }

  function handleAdminClick() {
    setShowLogin(true);
    setLoginError("");
  }

  function handleCloseLogin() {
    setShowLogin(false);
    setLoginError("");
    setUsername("");
    setPassword("");
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
      <div className="app-container">
        <header className="app-header">
          <div>
            <p className="eyebrow">Vitrine online</p>
            <h1>Catálogo de produtos</h1>
            <p className="hero-description">
              Navegue pelos itens disponíveis e monte o pedido perfeito para seus clientes.
            </p>
          </div>

          <div className="header-actions">
            {isAdmin && <span className="admin-chip">Administrador conectado</span>}
            <button
              type="button"
              className="button button-primary"
              onClick={isAdmin ? handleLogout : handleAdminClick}
            >
              {isAdmin ? "Sair" : "Administrador"}
            </button>
          </div>
        </header>

        {showLogin && !isAdmin && (
          <div className="modal-overlay" onClick={handleCloseLogin}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="eyebrow">Área restrita</p>
                  <h2>Login de administrador</h2>
                </div>
                <button
                  type="button"
                  className="close-button"
                  onClick={handleCloseLogin}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>

              <form className="admin-form" onSubmit={handleLogin}>
                <label className="form-label">
                  Usuário
                  <input
                    className="input-field"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="admin"
                  />
                </label>
                <label className="form-label">
                  Senha
                  <input
                    className="input-field"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="1234"
                  />
                </label>
                {loginError && <p className="form-error">{loginError}</p>}
                <button className="button button-primary" type="submit">
                  Entrar
                </button>
              </form>
            </div>
          </div>
        )}

        {isAdmin && (
          <section className="admin-panel">
            <div className="admin-panel-grid">
              <div>
                <h2>Painel do administrador</h2>
                <p>
                  Faça edições no catálogo, altere preços e adicione produtos com foto diretamente aqui.
                </p>
              </div>
              <button type="button" className="button button-secondary" onClick={handleLogout}>
                Sair do administrador
              </button>
            </div>

            <div className="admin-grid">
              {products.map((product) => (
                <div key={product.id} className="admin-card">
                  <h3>{product.name}</h3>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="admin-card-image"
                  />
                  <label className="form-label">
                    Preço (R$)
                    <input
                      className="input-field"
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(event) => handleProductPriceChange(product.id, event.target.value)}
                    />
                  </label>
                  <label className="form-label">
                    Nova foto
                    <input
                      className="input-field"
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(product.id, event.target.files?.[0])}
                    />
                  </label>
                </div>
              ))}
            </div>

            <form className="admin-form" onSubmit={addNewProduct}>
              <h3>Adicionar novo produto</h3>
              <div className="form-grid">
                <label className="form-label">
                  Nome do produto
                  <input
                    className="input-field"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Ex: Mochila premium"
                  />
                </label>
                <label className="form-label">
                  Preço (R$)
                  <input
                    className="input-field"
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(event) => setNewPrice(event.target.value)}
                  />
                </label>
                <label className="form-label">
                  Foto do produto
                  <input
                    className="input-field"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleNewImageChange(event.target.files?.[0])}
                  />
                </label>
                {newImagePreview && (
                  <img src={newImagePreview} alt="Prévia" className="admin-card-image" />
                )}
              </div>
              <button className="button button-primary" type="submit">
                Adicionar produto
              </button>
            </form>
          </section>
        )}

        <section className="products-section">
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <aside className="cart-panel">
            <Cart />
          </aside>
        </section>
      </div>
    </CartProvider>
  );
}

export default App;
