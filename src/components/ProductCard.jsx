export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="price">A partir de R$ {Number(product.price).toFixed(2)}</p>
      </div>
    </div>
  );
}
