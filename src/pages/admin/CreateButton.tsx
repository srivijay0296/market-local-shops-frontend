import { useNavigate } from "react-router-dom";

export default function CreateButton() {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2">
            <button
                onClick={() => navigate("/admin/markets/create")}
                className="bg-blue-600 text-white px-3 py-2 rounded"
            >
                + Market
            </button>

            <button
                onClick={() => navigate("/admin/products/create")}
                className="bg-green-600 text-white px-3 py-2 rounded"
            >
                + Product
            </button>
        </div>
    );
}