import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030712]">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
            <Loader2 className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Authenticating...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ── Seller awaiting approval → premium pending page ──────────
  if (user.role === 'SELLER' && !user.is_approved) {
    return <Navigate to="/pending-approval" replace />;
  }

  // ── Role check ────────────────────────────────────────────────
  const isAuthorized =
    allowedRoles.length === 0 ||
    allowedRoles.map(r => r.toUpperCase()).includes(user.role.toUpperCase());

  if (!isAuthorized) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}