import { useState, useEffect, useRef } from "react";
import ProductCard from "./components/ProductCard";
import { getProducts, updateProduct as apiUpdateProduct, createProduct, deleteProduct as apiDeleteProduct, uploadImage, login as apiLogin } from "./services/api";

const AVAILABLE_SIZES = ["PP", "P", "M", "G", "GG"];

const PRICE_TIER_PRESETS = [
  { minQty: 10, label: "A partir de 10 peças" },
  { minQty: 50, label: "A partir de 50 peças" },
  { minQty: 100, label: "A partir de 100 peças" },
];

function defaultPriceTiers() {
  return PRICE_TIER_PRESETS.map((preset) => ({
    minQty: preset.minQty,
    label: preset.label,
    amount: "",
    showOnStorefront: false,
  }));
}

function normalizePriceTiers(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return defaultPriceTiers();
  const byQty = new Map(raw.map((t) => [Number(t?.minQty), t]));
  return PRICE_TIER_PRESETS.map((preset) => {
    const existing = byQty.get(preset.minQty);
    const amount = existing?.amount !== undefined && existing?.amount !== null && existing?.amount !== ""
      ? Number(existing.amount)
      : "";
    return {
      minQty: preset.minQty,
      label: typeof existing?.label === "string" && existing.label.trim() ? existing.label : preset.label,
      amount: Number.isFinite(amount) ? amount : "",
      showOnStorefront: Boolean(existing?.showOnStorefront),
    };
  });
}

function normalizeProduct(product) {
  const tiers = normalizePriceTiers(product?.priceTiers);
  const legacyPrice = Number(product?.price);
  if ((!product?.priceTiers || !Array.isArray(product.priceTiers)) && Number.isFinite(legacyPrice) && legacyPrice > 0) {
    tiers[0] = { ...tiers[0], amount: legacyPrice, showOnStorefront: true };
  }
  const primary = pickPrimaryPrice(tiers, legacyPrice);
  return { ...product, priceTiers: tiers, price: primary };
}

function pickPrimaryPrice(tiers, legacyPrice) {
  const visible = tiers.filter((t) => t.showOnStorefront && Number(t.amount) > 0);
  if (visible.length > 0) return Number(visible[0].amount);
  const any = tiers.map((t) => Number(t.amount)).find((n) => Number.isFinite(n) && n > 0);
  if (any) return any;
  return Number.isFinite(legacyPrice) ? legacyPrice : 0;
}

function serializePriceTiersForApi(tiers) {
  return normalizePriceTiers(tiers).map((t) => ({
    minQty: t.minQty,
    label: t.label,
    amount: t.amount === "" ? null : Number(t.amount),
    showOnStorefront: Boolean(t.showOnStorefront),
  }));
}

function App() {
  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPriceTiers, setNewPriceTiers] = useState(() => defaultPriceTiers());
  const [newProductFile, setNewProductFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [newSizes, setNewSizes] = useState([]);
  const [productError, setProductError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [dirtyProductIds, setDirtyProductIds] = useState(() => new Set());
  const [isSavingCatalog, setIsSavingCatalog] = useState(false);
  const [saveCatalogMessage, setSaveCatalogMessage] = useState("");
  const productsRef = useRef([]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProducts();
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setProducts(list.map(normalizeProduct));
        }
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

  async function updateProduct(id, changes, options = {}) {
    const { skipOptimistic = false } = options;
    if (!skipOptimistic) {
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? normalizeProduct({ ...product, ...changes }) : product))
      );
    }
    try {
      const saved = await apiUpdateProduct(id, changes);
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? normalizeProduct({ ...product, ...saved }) : product))
      );
    } catch (error) {
      console.error("Falha ao salvar alterações no servidor:", error);
      setProductError(`Falha ao salvar no servidor: ${error.message}`);
      const refreshed = await getProducts().catch(() => null);
      if (Array.isArray(refreshed)) setProducts(refreshed.map(normalizeProduct));
    }
  }

  async function deleteProduct(id) {
    setDirtyProductIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setProducts((prev) => prev.filter((product) => product.id !== id));
    try {
      await apiDeleteProduct(id);
    } catch (error) {
      console.error("Falha ao excluir no servidor:", error);
      setProductError(`Falha ao excluir no servidor: ${error.message}`);
      const refreshed = await getProducts().catch(() => null);
      if (Array.isArray(refreshed)) setProducts(refreshed.map(normalizeProduct));
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

    (async () => {
      try {
        const result = await apiLogin(username, password);
        if (result?.role !== "admin") {
          setLoginError("Usuário sem permissão de administrador.");
          return;
        }
        setIsAdmin(true);
        setShowLogin(false);
        setLoginError("");
        setUsername("");
        setPassword("");
      } catch (error) {
        setLoginError(error?.message || "Usuário ou senha inválidos.");
      }
    })();
  }

  function handleLogout() {
    setIsAdmin(false);
    setShowLogin(false);
    setLoginError("");
    setDirtyProductIds(new Set());
    setSaveCatalogMessage("");
  }

  function markProductDirty(productId) {
    setDirtyProductIds((prev) => new Set(prev).add(productId));
    setSaveCatalogMessage("");
  }

  async function saveCatalogChanges() {
    const ids = [...dirtyProductIds];
    if (ids.length === 0 || isSavingCatalog) return;

    setIsSavingCatalog(true);
    setProductError("");
    setSaveCatalogMessage("");

    const idsToClearFromDirty = [];
    const failed = [];
    let savedOnServer = 0;

    for (const id of ids) {
      const product = productsRef.current.find((p) => p.id === id);
      if (!product) {
        idsToClearFromDirty.push(id);
        continue;
      }
      const normalized = normalizeProduct(product);
      const payload = {
        priceTiers: serializePriceTiersForApi(normalized.priceTiers),
        price: normalized.price,
        sizes: Array.isArray(normalized.sizes) ? normalized.sizes : [],
      };
      try {
        const saved = await apiUpdateProduct(id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? normalizeProduct({ ...p, ...saved }) : p))
        );
        idsToClearFromDirty.push(id);
        savedOnServer += 1;
      } catch (error) {
        console.error("Falha ao salvar produto:", id, error);
        failed.push(id);
      }
    }

    setDirtyProductIds((prev) => {
      const next = new Set(prev);
      for (const id of idsToClearFromDirty) next.delete(id);
      return next;
    });

    if (failed.length > 0) {
      setProductError(
        `Não foi possível salvar ${failed.length} produto(s). Verifique a conexão e tente de novo.`
      );
    } else if (savedOnServer > 0) {
      setSaveCatalogMessage("Alterações salvas com sucesso.");
    }

    setIsSavingCatalog(false);
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

  function toggleProductSize(product, size) {
    const current = Array.isArray(product.sizes) ? product.sizes : [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? normalizeProduct({ ...p, sizes: next }) : p))
    );
    markProductDirty(product.id);
  }

  function toggleNewSize(size) {
    setNewSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  function updateProductTier(productId, minQty, patch) {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product;
        const tiers = normalizePriceTiers(product.priceTiers).map((t) =>
          t.minQty === minQty ? { ...t, ...patch } : t
        );
        return normalizeProduct({ ...product, priceTiers: tiers });
      })
    );
    markProductDirty(productId);
  }

  function updateNewTier(minQty, patch) {
    setNewPriceTiers((prev) =>
      normalizePriceTiers(prev).map((t) => (t.minQty === minQty ? { ...t, ...patch } : t))
    );
  }

  function handleImageUpload(id, file) {
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await uploadImage(reader.result);
        const imageUrl = result?.url;
        if (!imageUrl) throw new Error("Servidor não retornou a URL da imagem");
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

    if (!newName || !newProductFile || !newImagePreview) {
      setProductError("Preencha nome e selecione uma imagem antes de adicionar.");
      return;
    }

    const tiersForSave = serializePriceTiersForApi(newPriceTiers);
    const hasVisiblePrice = tiersForSave.some(
      (t) => t.showOnStorefront && t.amount !== null && Number(t.amount) > 0
    );
    if (!hasVisiblePrice) {
      setProductError("Marque e informe pelo menos um preço visível na vitrine (10, 50 ou 100 peças).");
      return;
    }

    setIsUploading(true);
    try {
      setProductError("");
      
      const uploadResult = await uploadImage(newImagePreview);
      const imageUrl = uploadResult?.url;
      if (!imageUrl) throw new Error("Servidor não retornou a URL da imagem");
      
      const nextId = Math.max(0, ...products.map((product) => product.id)) + 1;
      const normalizedTiers = normalizePriceTiers(tiersForSave);
      const newProduct = {
        id: nextId,
        name: newName,
        price: pickPrimaryPrice(normalizedTiers, 0),
        image: imageUrl,
        sizes: newSizes,
        priceTiers: tiersForSave,
      };

      const created = await createProduct(newProduct);
      setProducts((prev) => [...prev, normalizeProduct(created)]);
      
      setNewName("");
      setNewPriceTiers(defaultPriceTiers());
      setNewProductFile(null);
      setNewImagePreview("");
      setNewSizes([]);
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      const errorMsg = error.message || "Erro desconhecido";
      setProductError(`Falha: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="site-root">
      <div className="app-container">
        <header className="app-header">
          <div className="header-intro">
            <div className="catalog-mark" aria-hidden="true">
              C
            </div>
            <p className="eyebrow">Vitrine online</p>
            <h1>Catálogo de produtos</h1>
            <p className="hero-description">
              Consulte itens, tamanhos e condições por volume. Preços atualizados para sua equipe de compras.
            </p>
          </div>

          <div className="header-actions">
            <div className="search-container">
              <input
                type="search"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                aria-label="Buscar produtos"
              />
            </div>
            {isAdmin && (
              <span className="admin-chip" title="Sessão administrativa ativa">
                Administrador
              </span>
            )}
            <button
              type="button"
              className={isAdmin ? "button button-secondary" : "button button-primary"}
              onClick={isAdmin ? handleLogout : handleAdminClick}
            >
              {isAdmin ? "Sair" : "Área administrativa"}
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
              <p className="modal-body-text">
                Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.
              </p>
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

        <main className="app-main">
        {isAdmin && (
          <section className="admin-panel">
            <div className="admin-panel-grid">
              <div>
                <h2>Painel do administrador</h2>
                <p className="admin-panel-lead">
                  Edite preços e tamanhos abaixo e use o botão Salvar alterações para gravar no servidor. O
                  envio de uma nova foto continua sendo salvo na hora.
                </p>
                {dirtyProductIds.size > 0 && (
                  <p className="admin-unsaved-hint" role="status">
                    {dirtyProductIds.size === 1
                      ? "Há alterações não salvas em 1 produto."
                      : `Há alterações não salvas em ${dirtyProductIds.size} produtos.`}
                  </p>
                )}
                {saveCatalogMessage && (
                  <p className="form-success" role="status">
                    {saveCatalogMessage}
                  </p>
                )}
              </div>
              <div className="admin-panel-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void saveCatalogChanges()}
                  disabled={dirtyProductIds.size === 0 || isSavingCatalog}
                >
                  {isSavingCatalog ? "Salvando…" : "Salvar alterações"}
                </button>
                <button type="button" className="button button-secondary" onClick={handleLogout}>
                  Sair do administrador
                </button>
              </div>
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
                  <div className="form-label">
                    Preços por quantidade
                    <div className="admin-tier-stack">
                      {normalizePriceTiers(product.priceTiers).map((tier) => (
                        <div key={tier.minQty} className="admin-tier-row">
                          <label style={{ minWidth: 160 }}>
                            <input
                              type="checkbox"
                              checked={tier.showOnStorefront}
                              onChange={(e) =>
                                updateProductTier(product.id, tier.minQty, { showOnStorefront: e.target.checked })
                              }
                            />
                            Mostrar na vitrine
                          </label>
                          <span className="admin-tier-row-label">{tier.label}</span>
                          <label>
                            R$
                            <input
                              className="input-field"
                              style={{ width: 110 }}
                              type="number"
                              step="0.01"
                              value={tier.amount === "" ? "" : tier.amount}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateProductTier(product.id, tier.minQty, {
                                  amount: v === "" ? "" : Number(v),
                                });
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-label">
                    Tamanhos disponíveis
                    <div className="admin-size-row">
                      {AVAILABLE_SIZES.map((size) => (
                        <label key={size}>
                          <input
                            type="checkbox"
                            checked={(Array.isArray(product.sizes) ? product.sizes : []).includes(size)}
                            onChange={() => toggleProductSize(product, size)}
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>
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
                <div className="form-label">
                  Preços por quantidade
                  <div className="admin-tier-stack">
                    {normalizePriceTiers(newPriceTiers).map((tier) => (
                      <div key={tier.minQty} className="admin-tier-row">
                        <label style={{ minWidth: 160 }}>
                          <input
                            type="checkbox"
                            checked={tier.showOnStorefront}
                            onChange={(e) =>
                              updateNewTier(tier.minQty, { showOnStorefront: e.target.checked })
                            }
                          />
                          Mostrar na vitrine
                        </label>
                        <span className="admin-tier-row-label">{tier.label}</span>
                        <label>
                          R$
                          <input
                            className="input-field"
                            style={{ width: 110 }}
                            type="number"
                            step="0.01"
                            value={tier.amount === "" ? "" : tier.amount}
                            onChange={(e) => {
                              const v = e.target.value;
                              updateNewTier(tier.minQty, { amount: v === "" ? "" : Number(v) });
                            }}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-label">
                  Tamanhos disponíveis
                  <div className="admin-size-row">
                    {AVAILABLE_SIZES.map((size) => (
                      <label key={size}>
                        <input
                          type="checkbox"
                          checked={newSizes.includes(size)}
                          onChange={() => toggleNewSize(size)}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
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

          <section className="products-section" aria-labelledby="catalog-heading">
            <div>
              <h2 id="catalog-heading" className="section-heading">
                Catálogo
              </h2>
              <div className="products-grid">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
                {filteredProducts.length === 0 && searchTerm && (
                  <p className="no-results">Nenhum produto encontrado para &quot;{searchTerm}&quot;.</p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
