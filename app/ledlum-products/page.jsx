import LedlumProducts from '../components/LedlumProducts';
import data from '../../public/data/ledlum-products.json';
import './products.css';

export const metadata = {
  title: 'LEDLUM Products 2026',
  description: 'Search and filter the LEDLUM 2026 price list.',
};

export default function ProductsPage() {
  const products = data;

  return (
    <main className="products-page">
      <header className="products-page__header">
        <h1 className="products-page__title">Products</h1>
        <p className="products-page__subtitle">LEDLUM price list 2026 · {products.length.toLocaleString('en-IN')} items</p>
      </header>
      <LedlumProducts products={products} />
    </main>
  );
}