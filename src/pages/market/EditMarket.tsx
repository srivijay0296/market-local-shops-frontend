import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function EditMarket() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        location: "",
    });

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase
                .from("markets")
                .select("*")
                .eq("id", id)
                .single();

            if (data) setForm(data);
        };
        fetch();
    }, []);

    const updateMarket = async (e: any) => {
        e.preventDefault();

        await supabase.from("markets").update(form).eq("id", id);
        navigate("/admin/markets");
    };

    return (
        <form onSubmit={updateMarket} className="p-6 space-y-4">
            <input
                value={form.name}
                className="border p-2 w-full"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
                value={form.slug}
                className="border p-2 w-full"
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />

            <input
                value={form.location}
                className="border p-2 w-full"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Update
            </button>
        </form>
    );
}