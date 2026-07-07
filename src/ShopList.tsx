import { useEffect, useState } from "react";
import { backendApi } from '@/lib/api/client';

export default function ShopList() {
    const [shops, setShops] = useState([]);
    const [category, setCategory] = useState("");

    const fetchShops = async () => {
        let query = backendApi.get('/shops');

        if (category) {
            query = query, { params: { category: category } };
        }

        const { data } = await query;
        setShops(data || []);
    };

    useEffect(() => {
        fetchShops();
    }, [category]);

    return (
        <div>
            <h2>Shops</h2>

            {/* 🔥 Category Filter */}
            <select onChange={(e) => setCategory(e.target.value)}>
                <option value="">All</option>
                <option value="Textiles">Textiles</option>
                <option value="Electronics">Electronics</option>
                <option value="Grocery">Grocery</option>
            </select>

            {/* 🔥 Shop Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
                {shops.map((shop: any) => (
                    <div key={shop.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
                        <img src={shop.image_url} width="100%" />
                        <h3>{shop.name}</h3>
                        <p>{shop.category}</p>
                        <p>{shop.location}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}