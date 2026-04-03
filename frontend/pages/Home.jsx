import React, { useState, useEffect } from "react";
import { fetchProducts, fetchApplicationProducts } from "../services/api.service";

/**
 * Home page — entry point for both company-level and app-level launches.
 *
 * Props:
 *   company_id     — from URL params via App.jsx
 *   application_id — present only on app-level launch, null otherwise
 */
function Home({ company_id, application_id }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const isAppLaunch = !!application_id;

  useEffect(() => {
    loadProducts();
  }, [company_id, application_id]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isAppLaunch
        ? await fetchApplicationProducts(application_id, company_id)
        : await fetchProducts(company_id);
      setProducts(data?.items || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="home">
      <h1 className="home__title">
        {isAppLaunch ? "Application Products" : "Company Products"}
      </h1>
      <p className="home__subtitle">
        Company: <strong>{company_id}</strong>
        {isAppLaunch && (
          <> | Application: <strong>{application_id}</strong></>
        )}
      </p>

      {error && <div className="home__error">{error}</div>}

      <div className="product-list">
        {products.length === 0 && !error && (
          <p className="home__empty">No products found.</p>
        )}
        {products.map((product) => (
          <div key={product.uid} className="product-card">
            <div className="product-card__name">{product.name}</div>
            {product.item_code && (
              <div className="product-card__code">SKU: {product.item_code}</div>
            )}
            {product.brand && (
              <div className="product-card__brand">{product.brand.name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
