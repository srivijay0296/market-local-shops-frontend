import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { backendApi } from '@/lib/api/client';
import { HERO_IMAGES, MARKET_META, CATEGORIES } from '@/lib/constants';
import ProductCard from './ProductCard';
import Header from './Header';
import Footer from './Footer';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';
import { ChevronLeft, ChevronRight, MapPin, Store, TrendingUp, Sparkles, Clock, ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react';

export default function AppLayout() {

  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [colRes, prodRes] = await Promise.all([
        backendApi.get('/products', { params: { is_visible: true } }),
        backendApi.get('/products', { params: { status: 'active' } })
      ]);

      if (colRes.data) setCollections(colRes.data);

      if (prodRes.data) {
        setProducts(prodRes.data);
        setFeaturedProducts(prodRes.data.filter((p:any)=>p.tags?.includes('featured')));
        setTrendingProducts(prodRes.data.filter((p:any)=>p.tags?.includes('trending')));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(()=>{
      setHeroIndex(i => (i+1) % HERO_IMAGES.length);
    },5000);

    return ()=>clearInterval(timer);
  },[]);


  return (

    <div className="min-h-screen bg-[#F9FAFB]">

      <Header/>
      <AuthModal/>
      <CartDrawer/>

      {/* HERO */}
      <section
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage:"url('/images/bargur-textile-market.png')"
        }}
      >

      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center text-white">

        <div className="max-w-xl">

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full w-fit mb-4">
            <MapPin className="w-4 h-4"/>
            Bargur, Krishnagiri District
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-3">
            Shop from <span className="text-[#F97316]">7 Local Markets</span>
          </h1>

          <p className="text-gray-200 mb-6">
            Discover clothing, textiles and more from Bargur shops
          </p>

          <div className="flex gap-4">

            <Link
              to="/products"
              className="px-6 py-3 bg-[#F97316] rounded-lg font-semibold"
            >
              Explore Products
            </Link>

            <Link
              to="/collections"
              className="px-6 py-3 bg-white/20 border border-white rounded-lg"
            >
              Browse Markets
            </Link>

          </div>

        </div>

      </div>


      {/* HERO ARROWS */}

      <button
        onClick={()=>setHeroIndex(i => (i-1+HERO_IMAGES.length)%HERO_IMAGES.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
      >
        <ChevronLeft className="w-5 h-5"/>
      </button>

      <button
        onClick={()=>setHeroIndex(i => (i+1)%HERO_IMAGES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
      >
        <ChevronRight className="w-5 h-5"/>
      </button>

      </section>


      {/* STATS */}
      <section className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">

          <div className="flex items-center gap-3">
            <Store/>
            <div>
              <p className="font-bold">7</p>
              <p className="text-sm">Markets</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin/>
            <div>
              <p className="font-bold">285+</p>
              <p className="text-sm">Shops</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Sparkles/>
            <div>
              <p className="font-bold">10000+</p>
              <p className="text-sm">Products</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp/>
            <div>
              <p className="font-bold">5000+</p>
              <p className="text-sm">Buyers</p>
            </div>
          </div>

        </div>

      </section>


      {/* PRODUCTS */}

      <section className="max-w-7xl mx-auto px-4 py-10">

        <h2 className="text-2xl font-bold mb-6">
          Recently Added
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

            {products.slice(0,8).map(p=>(
              <ProductCard key={p.id} product={p}/>
            ))}

          </div>

        )}

      </section>


      {/* CTA */}

      <section className="bg-orange-500 py-12 text-center text-white">

        <h2 className="text-3xl font-bold mb-3">
          Start Selling on Bargur Market
        </h2>

        <Link
          to="/seller"
          className="px-8 py-3 bg-white text-orange-500 rounded-lg font-bold"
        >
          Register Your Shop
        </Link>

      </section>


      <Footer/>

    </div>

  );
}