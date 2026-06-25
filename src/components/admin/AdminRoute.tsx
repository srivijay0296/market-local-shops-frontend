import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminRoute() {
  const { user, isLoading, profileFetchError } = useAuth(); 

  console.log("AdminRoute - Loading:", isLoading);
  console.log("AdminRoute - User:", user);
  console.log("AdminRoute - Role:", user?.role);
  console.log("AdminRoute - ProfileFetchError:", profileFetchError);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="text-center relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-purple-200/20"></div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Authenticating Admin...</h2>
          <p className="text-slate-400 text-sm mt-2 font-bold font-sans uppercase">Secure Handshake in Progress</p>
        </div>
      </div>
    );
  }

  // If sync error occured, show descriptive error screen instead of infinite loader
  if (profileFetchError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50 backdrop-blur-sm p-4">
        <div className="text-center max-w-sm bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-100 shadow-xl shadow-rose-200/20">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase mb-3">Sync Error</h2>
          <p className="text-slate-500 text-xs font-bold font-sans uppercase mb-8 leading-relaxed">
            {profileFetchError}
          </p>
          <button 
             onClick={() => window.location.reload()}
             className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition active:scale-95 uppercase text-xs tracking-widest"
          >
             Retry Sync
          </button>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to /login
  if (!user) {
    console.log("AdminRoute - No user session found. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  // Access validation: Strictly ADMIN (Case Insensitive)
  const userRole = (user?.role || "").toUpperCase();
  const isSrivijay = user?.email?.toLowerCase() === 'srivijay0296@gmail.com';
  
  const hasAccess = userRole === "ADMIN";

  if (!hasAccess) {
    console.warn("AdminRoute - Access Denied. Redirecting to /access-denied.");
    return <Navigate to="/access-denied" replace />;
  }
  return <Outlet />;
}

