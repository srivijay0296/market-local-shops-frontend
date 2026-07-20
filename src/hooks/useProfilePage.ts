import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { usersApi } from "@/lib/api/users";
import { toast } from "sonner";

export function useProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }
    if (user) {
      setProfile({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user, authLoading]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await usersApi.updateUser(user.id, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    logout,
    authLoading,
    loading,
    profile,
    setProfile,
    handleUpdate
  };
}
