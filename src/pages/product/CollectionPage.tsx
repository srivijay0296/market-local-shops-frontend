import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";

export default function CollectionPage() {
  const { handle } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryAndProducts = async () => {
      try {
        if (!handle) return;
        const cats = await categoriesApi.getCategories();
        const currentCat = cats.find(c => c.name.toLowerCase() === handle.toLowerCase());

        if (currentCat) {
          setCategory(currentCat);
          const prods = await productsApi.getProducts({ categoryId: currentCat.id });
          setProducts(prods || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCategoryAndProducts();
  }, [handle]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <AuthModal />
      <CartDrawer />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E3A8A] mb-4 tracking-tight capitalize">
              {handle} Collection
            </h1>
            {category && <p className="text-gray-500 text-lg">{category.description}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl" />
              ))
            ) : products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                <span className="text-5xl mb-4 block opacity-50">🥻</span>
                <h3 className="text-xl font-bold text-gray-700">No {handle}s found</h3>
                <p className="text-gray-500 mt-2">Check back later for new inventory from our vendors.</p>
                <Link to="/products" className="mt-6 inline-block bg-[#1E3A8A] text-white px-6 py-2.5 rounded-xl font-medium">Browse All Products</Link>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
