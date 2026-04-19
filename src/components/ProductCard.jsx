export default function ProductCard({ product }) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const sizesText = sizes.length > 0 ? `Tamanhos: ${sizes.join(", ")}` : "";

  const tiers = Array.isArray(product?.priceTiers)
    ? product.priceTiers
        .filter((t) => t?.showOnStorefront && Number(t?.amount) > 0)
        .sort((a, b) => Number(a.minQty) - Number(b.minQty))
    : [];

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-body">
        <h3>{product.name}</h3>
        {sizesText && <p className="sizes">{sizesText}</p>}
        {tiers.length > 0 ? (
          tiers.map((tier) => (
            <p key={tier.minQty} className="price">
              {tier.label} R$ {Number(tier.amount).toFixed(2)}
            </p>
          ))
        ) : (
          Number(product.price) > 0 && (
            <p className="price">A partir de R$ {Number(product.price).toFixed(2)}</p>
          )
        )}
      </div>
    </div>
  );
}
