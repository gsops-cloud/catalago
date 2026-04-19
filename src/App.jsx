import { useState, useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { getProducts, updateProduct as apiUpdateProduct, createProduct, deleteProduct as apiDeleteProduct } from "./services/api";
import { uploadImageToFirebase } from "./services/firebase";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

function App() {
  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newProductFile, setNewProductFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [productError, setProductError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Falha ao carregar produtos do servidor:", error);
        if (!cancelled) setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function updateProduct(id, changes) {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, ...changes } : product))
    );
    try {
      const saved = await apiUpdateProduct(id, changes);
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? { ...product, ...saved } : product))
      );
    } catch (error) {
      console.error("Falha ao salvar alterações no servidor:", error);
      setProductError(`Falha ao salvar no servidor: ${error.message}`);
      const refreshed = await getProducts().catch(() => null);
      if (Array.isArray(refreshed)) setProducts(refreshed);
    }
  }

  async function deleteProduct(id) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    try {
      await apiDeleteProduct(id);
    } catch (error) {
      console.error("Falha ao excluir no servidor:", error);
      setProductError(`Falha ao excluir no servidor: ${error.message}`);
      const refreshed = await getProducts().catch(() => null);
      if (Array.isArray(refreshed)) setProducts(refreshed);
    }
  }

  function confirmDeleteProduct(id) {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  }

  function handleDeleteConfirm() {
    if (productToDelete) {
      void deleteProduct(productToDelete);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  }

  function handleDeleteCancel() {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  }

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

  function handleProductPriceChange(id, value) {
    const price = Number(value);
    if (Number.isNaN(price)) return;
    updateProduct(id, { price });
  }

  function handleImageUpload(id, file) {
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const imageUrl = await uploadImageToFirebase(reader.result);
        await updateProduct(id, { image: imageUrl });
      } catch (error) {
        console.error("Erro ao enviar imagem:", error.message);
        setProductError(`Erro ao enviar imagem: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleNewImageChange(file) {
    if (!file) {
      setNewProductFile(null);
      setNewImagePreview("");
      return;
    }

    setProductError("");
    setNewProductFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setNewImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function addNewProduct(event) {
    event.preventDefault();

    if (!newName || !newPrice || !newProductFile || !newImagePreview) {
      setProductError("Preencha nome, preço e selecione uma imagem antes de adicionar.");
      return;
    }

    setIsUploading(true);
    try {
      setProductError("");
      
      const imageUrl = await uploadImageToFirebase(newImagePreview);
      
      const nextId = Math.max(0, ...products.map((product) => product.id)) + 1;
      const newProduct = {
        id: nextId,
        name: newName,
        price: Number(newPrice),
        image: imageUrl,
      };

      const created = await createProduct(newProduct);
      setProducts((prev) => [...prev, created]);
      
      setNewName("");
      setNewPrice("");
      setNewProductFile(null);
      setNewImagePreview("");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      const errorMsg = error.message || "Erro desconhecido";
      setProductError(`Falha: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="app-container">
      <div className="app-container">
        <header className="app-header">
          <div>
            <p className="eyebrow">Vitrine online</p>
            <h1>Catálogo de produtos</h1>
            <p className="hero-description">
              Navegue pelos itens disponíveis.
            </p>
          </div>

          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
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

        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={handleDeleteCancel}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="eyebrow">Confirmação</p>
                  <h2>Excluir produto</h2>
                </div>
                <button
                  type="button"
                  className="close-button"
                  onClick={handleDeleteCancel}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
              <p>Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
              <div className="modal-actions">
                <button className="button button-secondary" onClick={handleDeleteCancel}>
                  Cancelar
                </button>
                <button className="button button-danger" onClick={handleDeleteConfirm}>
                  Excluir
                </button>
              </div>
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
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => confirmDeleteProduct(product.id)}
                  >
                    Excluir produto
                  </button>
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
              {productError && <p className="form-error">{productError}</p>}
            </form>
          </section>
        )}

        <section className="products-section">
          <div className="products-grid">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}
            {filteredProducts.length === 0 && searchTerm && (
              <p className="no-results">Nenhum produto encontrado para "{searchTerm}"</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
