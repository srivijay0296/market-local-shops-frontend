import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function ProductsList() {
    const [products, setProducts] = useState<any[]>([]);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        const { data } = await supabase.from("products").select("*");
        setProducts(data || []);
    };

    const deleteProduct = async (id: number) => {
        if (!confirm("Delete product?")) return;
        await supabase.from("products").delete().eq("id", id);
        fetchProducts();
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="p-6">
            <button
                onClick={() => navigate("/admin/products/create")}
                className="bg-blue-600 text-white px-4 py-2 mb-4"
            >
                + Add Product
            </button>

            <table className="w-full">
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.price}</td>

                            <td>
                                <button onClick={() => navigate(`/admin/products/edit/${p.id}`)}>
                                    Edit
                                </button>

                                <button onClick={() => deleteProduct(p.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}