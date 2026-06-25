import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { User, ShieldAlert, Star, Loader2, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Sorting state
  const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Cloud registry sync failed");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    // Protection 1: Self-deletion check
    if (deleteId === currentAdmin?.id) {
      toast.error("Operation Denied: You cannot delete your own admin account.");
      setDeleteId(null);
      return;
    }

    // Protection 2: Last admin check
    const targetUser = users.find(u => u.id === deleteId);
    if (targetUser?.role === 'ADMIN') {
      const adminCount = users.filter(u => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        toast.error("Operation Denied: Cannot delete the last remaining ADMIN account.");
        setDeleteId(null);
        return;
      }
    }

    try {
      await usersApi.deleteUser(deleteId);
      toast.success("User identity successfully purged from registry.");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Delete operation failed.");
    }
    setDeleteId(null);
  };

  // Client-side filtering & search
  const filteredUsers = users.filter(u => {
    const nameMatch = (u.name || "").toLowerCase().includes(search.toLowerCase());
    const emailMatch = (u.email || "").toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === "ALL" || u.role === roleFilter;
    
    let statusMatch = true;
    if (statusFilter === "APPROVED") statusMatch = u.is_approved === true;
    if (statusFilter === "PENDING") statusMatch = u.is_approved === false;

    return (nameMatch || emailMatch) && roleMatch && statusMatch;
  });

  // Client-side sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let fieldA = a[sortBy] || "";
    let fieldB = b[sortBy] || "";

    if (sortBy === "created_at") {
      fieldA = new Date(fieldA).getTime();
      fieldB = new Date(fieldB).getTime();
    } else {
      fieldA = String(fieldA).toLowerCase();
      fieldB = String(fieldB).toLowerCase();
    }

    if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Client-side pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const formatDateString = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formatTimeString = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "hh:mm a");
    } catch (e) {
      return "";
    }
  };

  if (loading && !users.length) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Syncing Registry...</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Security Registry</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global Identity Synchronization</p>
        </div>
        <Link 
          to="/admin/users/create"
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition active:scale-95 shadow-2xl"
        >
          <User className="w-4 h-4" /> Add Identity
        </Link>
      </div>

      {/* Filters & Search Control Panel */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition font-semibold text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          {/* Role Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent outline-none text-xs font-bold text-slate-600 uppercase"
            >
              <option value="ALL">All Roles</option>
              <option value="BUYER">Buyers</option>
              <option value="SELLER">Sellers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent outline-none text-xs font-bold text-slate-600 uppercase"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-5 px-8 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort("name")}>
                  User Identity {sortBy === "name" && <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 text-indigo-500" />}
                </th>
                <th className="py-5 px-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort("role")}>
                  System Role {sortBy === "role" && <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 text-indigo-500" />}
                </th>
                <th className="py-5 px-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Authorization
                </th>
                <th className="py-5 px-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort("created_at")}>
                  Registry Date {sortBy === "created_at" && <ArrowUpDown className="w-3.5 h-3.5 inline ml-1 text-indigo-500" />}
                </th>
                <th className="py-5 px-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Last Login
                </th>
                <th className="py-5 px-8 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <p className="text-sm font-bold text-slate-400">No identities matched the search filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((row) => {
                  const role = row.role?.toLowerCase() || "buyer";
                  const configs: any = {
                    admin: { bg: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: <ShieldAlert className="w-3 h-3" /> },
                    seller: { bg: "bg-blue-50 text-blue-700 border-blue-100", icon: <Star className="w-3 h-3" /> },
                    buyer: { bg: "bg-slate-50 text-slate-700 border-slate-200", icon: <User className="w-3 h-3" /> }
                  };
                  const config = configs[role] || configs.buyer;
                  const isSelf = row.id === currentAdmin?.id;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Identity Column */}
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              {row.name || "Anonymous User"}
                              {isSelf && (
                                <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium italic mt-0.5">{row.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border ${config.bg} uppercase tracking-widest`}>
                          {config.icon} {role}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${row.is_approved ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${row.is_approved ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {row.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-5 px-6">
                        <div className="text-slate-600 text-xs font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateString(row.created_at)}
                        </div>
                      </td>

                      {/* Last Login Date */}
                      <td className="py-5 px-6">
                        <div className="text-slate-600 text-xs font-bold">
                          {row.last_sign_in_at ? (
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1.5 text-slate-700">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {formatDateString(row.last_sign_in_at)}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-5 font-semibold mt-0.5">{formatTimeString(row.last_sign_in_at)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold italic text-[10px] uppercase">Never Logged In</span>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/edit/${row.id}`)}
                            className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(row.id)}
                            disabled={isSelf}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${isSelf ? 'border border-slate-100 text-slate-300 cursor-not-allowed' : 'border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500'}`}
                          >
                            Purge
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 bg-slate-50 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages} ({filteredUsers.length} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border-2 border-slate-100 rounded-xl hover:border-indigo-500 transition disabled:opacity-30 disabled:hover:border-slate-100"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 border-2 border-slate-100 rounded-xl hover:border-indigo-500 transition disabled:opacity-30 disabled:hover:border-slate-100"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Revoke Identity?"
        message="Are you sure you want to purge this record? This action will cascade-delete the user's shops, products, and profile, and is recorded in the security audit."
      />
    </div>
  );
}
