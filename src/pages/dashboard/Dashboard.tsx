import CreateButton from "@/components/admin/CreateButton";

export default function Dashboard() {
    return (
        <div className="p-6">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>

                <CreateButton />
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 shadow rounded">Markets</div>
                <div className="bg-white p-4 shadow rounded">Products</div>
                <div className="bg-white p-4 shadow rounded">Shops</div>
                <div className="bg-white p-4 shadow rounded">Users</div>
            </div>
        </div>
    );
}