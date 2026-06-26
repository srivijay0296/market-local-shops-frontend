import { useState } from "react";
import { backendApi } from '@/lib/api/client';
import { useNavigate } from "react-router-dom";

export default function CreateMarket() {
    const [form, setForm] = useState({ name: "", slug: "", location: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await backendApi.post('/markets', form);
            alert("Created!");
            navigate("/admin/markets");
        } catch (err: any) {
            alert(err.message || "Failed to create market");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
                placeholder="Name"
                className="border p-2 w-full"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
                placeholder="Slug"
                className="border p-2 w-full"
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <input
                placeholder="Location"
                className="border p-2 w-full"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <button className="bg-green-600 text-white px-4 py-2 rounded">
                Save
            </button>
        </form>
    );
}