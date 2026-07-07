import { useState, useEffect } from 'react';
import { backendApi } from '@/lib/api/client';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react';

export default function HomepageSlider() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch active banners on mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await backendApi.get('/banners', { params: { active: true, sort: 'sort_order_desc' } });
        if (Array.isArray(data)) {
          setBanners(data);
        } else if (data?.content && Array.isArray(data.content)) {
          setBanners(data.content);
        } else if (data?.data && Array.isArray(data.data)) {
          setBanners(data.data);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-slate-100 animate-pulse rounded-2xl mb-8 flex items-center justify-center">
        <Store className="w-12 h-12 text-slate-300" />
      </div>
    );
  }

  // Fallback hero shown when no banners are configured in the database
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        {/* Bargur Textile Market Photo */}
        <img
          src="/bargur-textile-market.jpg"
          alt="Bargur Textile Market"
          className="w-full h-full object-cover object-center"
        />

        {/* Gradient Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        {/* Hero Text */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-4xl z-10">
          <p className="text-orange-400 font-bold tracking-widest uppercase text-sm mb-3">
            🏪 Bargur's #1 Wholesale Hub
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Bargur Textile Market
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">
            Discover premium sarees, fabrics & wholesale textiles straight from local weavers.
          </p>
            <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-block px-8 py-3.5 bg-[#fb641b] text-white text-lg font-bold rounded shadow-lg hover:bg-[#e65a15] hover:scale-105 transition-all duration-300"
            >
              Shop Now
            </Link>
            <Link
              to="/markets"
              className="inline-block px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded border border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Explore Markets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-12 group shadow-xl">
      {/* Slides Container */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            
            {/* Background Media */}
            {banner.type === 'video' ? (
              <video 
                src={banner.image_url} 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              />
            ) : (
              <img 
                src={banner.image_url} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

            {/* Banner Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-4xl z-10 transition-opacity duration-1000">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 transform translate-y-0 opacity-100 transition-all duration-700 font-heading">
                {banner.title}
              </h1>
              {banner.link && (
                <div>
                    <Link 
                      to={banner.link} 
                      className="inline-block px-8 py-3.5 bg-[#F97316] text-white text-lg font-bold rounded-xl shadow-lg hover:bg-orange-600 hover:scale-105 transition-all duration-300"
                    >
                      Shop Now
                    </Link>
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>

      {/* Manual Navigation Arrows (Visible on Hover) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all z-20"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Pagination Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index 
                    ? 'w-8 h-2.5 bg-white shadow-lg' 
                    : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
