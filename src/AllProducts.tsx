import { useEffect, useState } from "react";
import { productService } from "@/services/api";
import { Loader2, AlertCircle } from "lucide-react";

export default function AllProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const data = await productService.getAll();
                setProducts(data || []);
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to load products");
                console.error("DEBUG: AllProducts Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Initializing product stream...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4 text-destructive">
                <AlertCircle className="w-12 h-12" />
                <h3 className="text-xl font-bold">API Sync Error</h3>
                <p className="text-center">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all"
                >
                  Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <header className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                🛒 Products <span className="text-indigo-600">Nexus</span>
              </h2>
              <p className="text-slate-500 mt-1">Directly sourced from Bargur's finest weavers.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-400">No products found in this frequency.</p>
                    </div>
                ) : (
                    products.map((p) => (
                        <div key={p.id} className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="aspect-square overflow-hidden bg-slate-100">
                              <img 
                                src={Array.isArray(p.images) ? p.images[0] : (p.image_url || "/placeholder.png")} 
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                            </div>
                            <div className="p-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1 block">
                                  {p.category || "General"}
                                </span>
                                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{p.name}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                  <p className="text-lg font-black text-indigo-600">₹{p.price}</p>
                                  <p className="text-[10px] text-slate-400 flex items-center">
                                    🏪 <span className="ml-1 truncate max-w-[80px]">{p.shops?.name || "Local Shop"}</span>
                                  </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}