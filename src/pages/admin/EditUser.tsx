import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { usersApi } from "@/lib/api/users";
import { ChevronLeft, User, Mail, Shield, Save, RefreshCw, Phone, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "@/components/admin/FormInput";

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "BUYER",
    is_approved: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (!error && data) {
        setForm({
           name: data.name || "",
           email: data.email || "",
           phone: data.phone || "",
           address: data.address || "",
           role: (data.role || "BUYER").toUpperCase(),
           is_approved: data.is_approved !== false
        });
      } else {
        toast.error("Failed to load user details.");
      }
      setFetching(false);
    };
    fetchProfile();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usersApi.adminUpdateUser(id!, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        role: form.role,
        is_approved: form.is_approved
      });
      toast.success("User profile updated successfully");
      navigate("/admin/users");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Update failed.");
      console.error("Profile Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse gap-4 text-slate-400">
         <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
         <p className="font-bold tracking-widest text-sm uppercase">Accessing Core Identity Database...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-500 pb-20">
      
      <div className="flex items-center gap-4 py-4">
        <Link 
          to="/admin/users" 
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition drop-shadow-sm text-slate-500"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Edit User Permissions</h1>
          <p className="text-slate-500 font-medium mt-1">Modifying identity configurations</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-10">
        <form onSubmit={handleUpdate} className="flex flex-col gap-6 w-full">
          
          <FormInput 
             label="Full Name"
             icon={User} iconColor="text-blue-500" focusColor="blue"
             placeholder="John Doe" required disabled={loading}
             value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          />
          
          <FormInput 
             label="Connected Email"
             icon={Mail} iconColor="text-emerald-500" focusColor="blue"
             placeholder="john@example.com" disabled={loading}
             value={form.email} onChange={e => setForm({...form, email: e.target.value})}
             helperText="Used for authentication tracking."
          />

          <FormInput 
             label="Phone Number"
             icon={Phone} iconColor="text-indigo-500" focusColor="blue"
             placeholder="+91 9876543210" disabled={loading}
             value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
          />

          <FormInput 
             label="Address"
             icon={MapPin} iconColor="text-rose-500" focusColor="blue"
             placeholder="123 Street Name, City" disabled={loading}
             value={form.address} onChange={e => setForm({...form, address: e.target.value})}
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" /> Platform Access Role
            </label>
            <select
              value={form.role.toUpperCase()}
              disabled={loading}
              onChange={(e) => setForm({ ...form, role: e.target.value.toUpperCase() })}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-slate-800 font-bold font-sans uppercase tracking-wider"
            >
              <option value="BUYER">Casual Buyer</option>
              <option value="SELLER">Verified Vendor</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div className="space-y-2 pb-4">
            <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Approval Status
            </label>
            <select
              value={form.is_approved ? "TRUE" : "FALSE"}
              disabled={loading}
              onChange={(e) => setForm({ ...form, is_approved: e.target.value === "TRUE" })}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-slate-800 font-bold font-sans uppercase tracking-wider"
            >
              <option value="TRUE">Approved (Active Access)</option>
              <option value="FALSE">Suspended (Blocked Access)</option>
            </select>
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end gap-3 mt-2">
            <Link to="/admin/users" className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition active:scale-[0.98]">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-[0.98] inline-flex items-center gap-2">
              {loading ? "Reconfiguring..." : <><Save className="w-5 h-5" /> Save Overrides</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
