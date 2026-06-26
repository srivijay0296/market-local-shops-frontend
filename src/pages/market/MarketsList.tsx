import { useEffect, useState } from "react";
import { backendApi } from '@/lib/api/client';
import { useNavigate } from "react-router-dom";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function MarketsList() {
    const [markets, setMarkets] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const navigate = useNavigate();

    const fetchMarkets = async () => {
        try {
            const { data } = await backendApi.get('/markets');
            setMarkets(data || []);
        } catch (err) {
            console.error('Failed to fetch markets:', err);
        }
    };

    // 👉 Open modal
    const handleDelete = (id: number) => {
        setSelectedId(id);
        setOpen(true);
    };

    // 👉 Confirm delete
    const confirmDelete = async () => {
        if (!selectedId) return;
        try {
            await backendApi.delete(`/markets/${selectedId}`);
        } finally {
            setOpen(false);
            fetchMarkets();
        }
    };

    useEffect(() => {
        fetchMarkets();
    }, []);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-bold">Markets</h1>

                <button
                    onClick={() => navigate("/admin/markets/create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Create Market
                </button>
            </div>

            {/* Table */}
            <table className="w-full bg-white shadow rounded">
                <thead className="bg-gray-100">
                    <tr className="text-center">
                        <th className="p-2">ID</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {markets.length > 0 ? (
                        markets.map((m) => (
                            <tr key={m.id} className="text-center border-t hover:bg-gray-50">
                                <td className="p-2">{m.id}</td>
                                <td>{m.name}</td>
                                <td>{m.slug}</td>
                                <td>{m.location}</td>

                                {/* Actions */}
                                <td className="space-x-2">
                                    {/* EDIT */}
                                    <button
                                        onClick={() =>
                                            navigate(`/admin/markets/edit/${m.id}`)
                                        }
                                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        onClick={() => handleDelete(m.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-4 text-gray-500 text-center">
                                No markets found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ✅ Confirm Modal */}
            <ConfirmModal
                isOpen={open}
                onCancel={() => setOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Market"
                message="Are you sure you want to delete this market?"
            />
        </div>
    );
}