import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import { Package, TrendingUp, Users, Settings } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      <AuthModal />
      <CartDrawer />

      {/* Admin Subnav */}
      <div className="bg-white border-b sticky top-16 z-20 shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            <Link to="/admin" className="border-b-2 border-transparent hover:border-gray-300 text-gray-600 py-4 text-sm font-medium flex items-center gap-2 px-2 whitespace-nowrap transition-colors">
              <TrendingUp className="w-4 h-4" /> Overview
            </Link>
            <Link to="/orders" className="border-b-2 border-[#1E3A8A] text-[#1E3A8A] py-4 text-sm font-bold flex items-center gap-2 px-2 whitespace-nowrap">
              <Package className="w-4 h-4" /> Global Orders
            </Link>
            <Link to="/admin" className="border-b-2 border-transparent hover:border-gray-300 text-gray-600 py-4 text-sm font-medium flex items-center gap-2 px-2 whitespace-nowrap transition-colors">
              <Users className="w-4 h-4" /> Users & Roles
            </Link>
            <Link to="/markets" className="border-b-2 border-transparent hover:border-gray-300 text-gray-600 py-4 text-sm font-medium flex items-center gap-2 px-2 whitespace-nowrap transition-colors">
              <Settings className="w-4 h-4" /> Market Divisions
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center w-full">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-[#1E3A8A]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-500 max-w-md text-center">
            Global order tracking across all market divisions is currently being implemented. Check back soon.
        </p>
      </main>

      <Footer />
    </div>
  );
}
