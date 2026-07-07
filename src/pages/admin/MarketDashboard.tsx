// src/pages/admin/MarketDashboard.tsx
import { useEffect, useState } from 'react';
import { backendApi } from '@/lib/api/client';
import { BarChart3, Users, Package, Shield, Store } from 'lucide-react';
import { formatPrice } from '@/lib/constants';

// Types
interface Market { id: number; name: string; }
interface ShopRequest {
  id: number;
  shop_name: string;
  owner_name: string;
  market_id: number;
  phone: string;
  status: string;
  market_name?: string;
}
interface Product {
  id: number;
  name: string;
  price: number;
  vendor_id: number;
  status: string;
  images?: string[];
  vendor?: { name: string };
}
interface Vendor { id: number; name: string; phone?: string; }

import CreateButton from '@/components/admin/CreateButton';

export default function MarketDashboard() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [shopRequests, setShopRequests] = useState<ShopRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Markets
      const { data: marketsData } = await backendApi.get('/fallback_markets');
      setMarkets(marketsData as Market[]);

      // Shop Requests with market name (join manually)
      const { data: requestsData } = await backendApi.get('/shop-requests');
      if (!requestsData) throw new Error('Failed to fetch shop requests');
      const enriched = (requestsData as any[]).map((r) => ({
        id: r.id,
        shop_name: r.shop_name,
        owner_name: r.owner_name,
        market_id: r.market_id,
        phone: r.phone,
        status: r.status,
        market_name: r.market?.name ?? '—',
      }));
      setShopRequests(enriched);

      // Products with vendor name (join)
      const { data: prodData } = await backendApi.get('/products');
      if (!prodData) throw new Error('Failed to fetch products');
      setProducts(prodData as Product[]);

      // Vendors
      const { data: vendorData } = await backendApi.get('/vendors');
      setVendors(vendorData as Vendor[]);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    await backendApi.put(`/shop-requests/${id}/approve`, {});
    fetchData();
  };

  const handleReject = async (id: number) => {
    await backendApi.put(`/shop-requests/${id}/reject`, {});
    fetchData();
  };

  const filteredMarkets = markets.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Market Management Dashboard</h1>
        <div className="flex items-center gap-2">
          <CreateButton />
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <BarChart3 className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
          <Store className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Total Markets</p>
            <p className="text-xl font-semibold text-gray-800">{markets.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
          <Users className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Shop Requests</p>
            <p className="text-xl font-semibold text-gray-800">{shopRequests.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
          <Shield className="w-6 h-6 text-yellow-600" />
          <div>
            <p className="text-sm text-gray-500">Pending Requests</p>
            <p className="text-xl font-semibold text-gray-800">
              {shopRequests.filter((r) => r.status === 'pending').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
          <Package className="w-6 h-6 text-purple-600" />
          <div>
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-xl font-semibold text-gray-800">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Total Vendors</p>
            <p className="text-xl font-semibold text-gray-800">{vendors.length}</p>
          </div>
        </div>
      </div>

      {/* Markets List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Markets</h2>
          <input
            type="text"
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map((m) => (
              <div key={m.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                <span className="font-medium text-gray-800">{m.name}</span>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
                  View Shops
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No markets found.</p>
          )}
        </div>
      </section>

      {/* Shop Requests Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Shop Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Shop</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Owner</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Phone</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Market</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shopRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-800">{req.shop_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{req.owner_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{req.phone}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{req.market_name}</td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {req.status === 'pending' && (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {shopRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No shop requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Products Overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Products Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Product</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Vendor</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 flex items-center gap-2">
                    <img
                      src={p.images?.[0] || '/placeholder.svg'}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span className="font-medium text-gray-800">{p.name}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {p.vendor?.name || '—'}
                  </td>
                  <td className="px-4 py-2 text-sm font-semibold text-indigo-600">
                    {formatPrice(p.price)}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
