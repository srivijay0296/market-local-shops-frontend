import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Providers (Immediate Load)
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { CartProvider } from "@/contexts/CartContext";

// Layouts & Global Components
import SubscriptionBlocker from "@/components/SubscriptionBlocker";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import SmartChatbot from "./components/SmartChatbot";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";

// 🚀 LAZY LOADING - Production Performance Spec (Code Splitting)
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AccessDenied = lazy(() => import("./pages/AccessDenied"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const PendingApprovalPage = lazy(() => import("./pages/PendingApprovalPage"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

const CollectionPage = lazy(() => import("./pages/product/CollectionPage"));
const ProductPage = lazy(() => import("./pages/product/ProductPage"));
const AllProducts = lazy(() => import("./pages/product/AllProducts"));

const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const TrackOrdersPage = lazy(() => import("./pages/TrackOrdersPage"));

const SellerDashboard = lazy(() => import("./pages/seller/SellerDashboard"));
const SellerShopProfile = lazy(() => import("./pages/seller/SellerShopProfile"));
const SellerProfilePage = lazy(() => import("./pages/seller/SellerProfilePage"));
const SellerFeed = lazy(() => import("./pages/seller/SellerFeed"));
const ShopRequestForm = lazy(() => import("./pages/seller/ShopRequestForm"));

const MarketPage = lazy(() => import("./pages/market/MarketPage"));
const ShopsExplorerPage = lazy(() => import("./pages/ShopsExplorerPage"));
const ShopPage = lazy(() => import("./ShopPage"));

// Admin Tier
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Markets = lazy(() => import("./pages/admin/Markets"));
const CreateMarket = lazy(() => import("./pages/admin/CreateMarket"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const CreateProduct = lazy(() => import("./pages/admin/CreateProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const AdminShops = lazy(() => import("./pages/admin/AdminShops"));
const CreateShop = lazy(() => import("./pages/admin/CreateShop"));
const EditShop = lazy(() => import("./pages/admin/EditShop"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminUsersCreate = lazy(() => import("./pages/admin/AdminUsersCreate"));
const CreateUser = lazy(() => import("./pages/admin/CreateUser"));
const EditUser = lazy(() => import("./pages/admin/EditUser"));
const AdminSellers = lazy(() => import("./pages/admin/AdminSellers"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminFeed = lazy(() => import("./pages/admin/AdminFeed"));
const AdminShopRequests = lazy(() => import("./pages/admin/AdminShopRequests"));
const ServerConsole = lazy(() => import("./pages/admin/ServerConsole"));
const AdvancedServerControl = lazy(() => import("./pages/admin/AdvancedServerControl"));
const SystemStatus = lazy(() => import("./pages/admin/SystemStatus"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));

// Neural Loading Placeholder
const HQLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing HQ Nexus...</p>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
      <AuthProvider>
      <SubscriptionProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SubscriptionBlocker />

            <Suspense fallback={<HQLoader />}>
              <Routes>
                {/* PUBLIC */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<LoginPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* PRODUCTS */}
                <Route path="/collections/:handle" element={<CollectionPage />} />
                <Route path="/product/:handle" element={<ProductPage />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/post/:id" element={<PostDetailPage />} />

                {/* CART */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/orders" element={<TrackOrdersPage />} />

                {/* SELLER PROTECTION */}
                <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller-shop" element={<SellerShopProfile />} />
                  <Route path="/seller-feed" element={<SellerFeed />} />
                </Route>
                
                <Route path="/seller/:id" element={<SellerProfilePage />} />
                <Route path="/sellers" element={<ShopRequestForm />} />

                {/* MARKET */}
                <Route path="/markets" element={<MarketPage />} />
                <Route path="/market/:slug" element={<MarketPage />} />
                <Route path="/shops" element={<ShopsExplorerPage />} />
                <Route path="/shop/:shopId" element={<ShopPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                
                {/* INFO */}
                <Route path="/payments" element={<CartPage />} />
                <Route path="/shipping" element={<AboutUs />} />
                <Route path="/returns" element={<AboutUs />} />
                <Route path="/faq" element={<AboutUs />} />
                <Route path="/careers" element={<AboutUs />} />
                <Route path="/sell" element={<ShopRequestForm />} />
                <Route path="/advertise" element={<ContactUs />} />
                <Route path="/stories" element={<SellerFeed />} />

                {/* ADMIN PROTECTION */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="markets" element={<Markets />} />
                    <Route path="markets/create" element={<CreateMarket />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/create" element={<CreateProduct />} />
                    <Route path="products/edit/:id" element={<EditProduct />} />
                    <Route path="shops" element={<AdminShops />} />
                    <Route path="shops/create" element={<CreateShop />} />
                    <Route path="shops/edit/:id" element={<EditShop />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/create" element={<AdminUsersCreate />} />
                    <Route path="users/edit/:id" element={<EditUser />} />
                    <Route path="requests" element={<AdminShopRequests />} />
                    <Route path="sellers" element={<AdminSellers />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="feed" element={<AdminFeed />} />
                    <Route path="server" element={<ServerConsole />} />
                    <Route path="system" element={<SystemStatus />} />
                  </Route>
                </Route>

                <Route path="/server-view" element={<AdvancedServerControl />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            <BottomNav />
            <SmartChatbot />
          </TooltipProvider>
        </CartProvider>
      </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}