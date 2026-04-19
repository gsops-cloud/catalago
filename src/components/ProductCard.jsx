export default function ProductCard({ product }) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const sizesText = sizes.length > 0 ? `Tamanhos: ${sizes.join(", ")}` : "";

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-body">
        <h3>{product.name}</h3>
        {sizesText && <p className="sizes">{sizesText}</p>}
        <p className="price">A partir de R$ {Number(product.price).toFixed(2)}</p>
      </div>
    </div>
  );
}
