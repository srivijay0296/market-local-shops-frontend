import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { Plus } from "lucide-react";

interface Shop {
  id: number;
  name: string;
  location: string;
}

export default function Shops() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("shops").select("*");
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setShops(data as Shop[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("shops").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Shop deleted successfully" });
      fetchShops();
    }
    setShowConfirm(false);
    setSelectedId(null);
  };

  const openConfirm = (id: number) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Shops</h1>
        <Link
          to="/admin/shops/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Shop
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search shops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <>
          <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.location}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/shops/${s.id}/edit`)}
                      className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openConfirm(s.id)}
                      className="px-2 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showConfirm && selectedId !== null && (
        <ConfirmModal
          isOpen={true}
          title="Delete Shop"
          message="Are you sure you want to delete this shop? This action cannot be undone."
          onConfirm={() => handleDelete(selectedId)}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
