import { useEffect, useState } from "react";
import { backendApi } from '@/lib/api/client';

export default function ShopsExplorerPage() {
    const [shops, setShops] = useState<any[]>([]);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        const { data } = await backendApi.get('/shops', { params: { sort: 'created_at_desc' } });

        setShops(data || []);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>🏪 Shops</h2>

            <div className="grid">
                {shops.map((shop) => (
                    <div key={shop.id} className="card">
                        <h3>{shop.name}</h3>
                        <p>{shop.location}</p>
                        <p>{shop.category}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}