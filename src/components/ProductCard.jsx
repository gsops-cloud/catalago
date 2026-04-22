const brl = (value) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ProductCard({ product }) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];

  const tiers = Array.isArray(product?.priceTiers)
    ? product.priceTiers
        .filter((t) => t?.showOnStorefront && Number(t?.amount) > 0)
        .sort((a, b) => Number(a.minQty) - Number(b.minQty))
    : [];

  return (
    <article className="product-card">
      <div className="product-card-media">
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
      </div>

      <div className="product-card-body">
        <h3>{product.name}</h3>

        {sizes.length > 0 && (
          <ul className="product-sizes" aria-label="Tamanhos disponíveis">
            {sizes.map((size) => (
              <li key={size}>
                <span className="product-size-pill">{size}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="product-pricing">
          {tiers.length > 0 ? (
            tiers.map((tier) => (
              <div key={tier.minQty} className="price-tier">
                <span className="price-tier-label">{tier.label}</span>
                <span className="price-tier-value">{brl(tier.amount)}</span>
              </div>
            ))
          ) : (
            Number(product.price) > 0 && (
              <p className="price-tier-value-legacy">A partir de {brl(product.price)}</p>
            )
          )}
        </div>
      </div>
    </article>
  );
}
