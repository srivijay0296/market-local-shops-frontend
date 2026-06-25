import { useNavigate } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
            <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

            <div className="space-y-2">
                <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>

                <button onClick={() => navigate("/admin/markets")}>
                    Markets (CRUD)
                </button>

                <button onClick={() => navigate("/admin/products")}>
                    Products (CRUD)
                </button>

                <button onClick={() => navigate("/admin/shops")}>
                    Shops (CRUD)
                </button>
            </div>
        </div>
    );
}