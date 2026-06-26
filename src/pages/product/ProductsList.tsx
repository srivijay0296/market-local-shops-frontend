import { useEffect, useState } from "react";
import { backendApi } from '@/lib/api/client';
import { useNavigate } from "react-router-dom";

export default function ProductsList() {
    const [products, setProducts] = useState<any[]>([]);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        const { data } = await backendApi.get('/products');
        setProducts(data || []);
    };

    const deleteProduct = async (id: number) => {
        if (!confirm("Delete product?")) return;
        await backendApi.delete(`/products/${id}`);
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