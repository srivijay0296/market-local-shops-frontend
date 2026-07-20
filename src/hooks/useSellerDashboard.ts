import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backendApi } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export type SellerTabType = "products" | "posts" | "analytics" | "profile" | "enquiries";

export function useSellerDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SellerTabType>("products");
  
  // Form States
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: "", 
    description: "", 
    category: "", 
    images: [] as string[],
    show_price: true
  });

  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    media_url: "",
    media_type: "image" as "image" | "video",
    price: "",
    offer_tag: "",
    category: ""
  });

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "SELLER" && user.role !== "ADMIN"))) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Queries
  const { data: shop, isLoading: loadingShop } = useQuery({
    queryKey: ['seller', 'shop', user?.id],
    queryFn: async () => {
      const res = await backendApi.get("/shops", { params: { owner_id: user?.id } });
      return res.data || null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['seller', 'products', shop?.id],
    queryFn: async () => {
      const res = await backendApi.get("/products", { params: { shop_id: shop?.id, sort: "created_at_desc" } });
      return res.data || [];
    },
    enabled: !!shop?.id,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['seller', 'posts', shop?.id],
    queryFn: async () => {
      const { data } = await backendApi.get("/seller_posts", { params: { seller_id: shop?.id } });
      return data || [];
    },
    enabled: !!shop?.id,
  });

  const { data: enquiries = [], isLoading: loadingEnquiries } = useQuery({
    queryKey: ['seller', 'enquiries', user?.id],
    queryFn: async () => {
      const res = await backendApi.get("/enquiries", { params: { seller_id: user?.id, sort: "created_at_desc" } });
      return res.data || [];
    },
    enabled: !!user?.id && activeTab === "enquiries",
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (payload: any) => {
      await backendApi.post("/seller_posts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'posts', shop?.id] });
      toast.success("Broadcast published successfully!");
      setNewPost({ title: "", description: "", media_url: "", media_type: "image", price: "", offer_tag: "", category: "" });
      setShowAddPost(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to publish broadcast")
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      await backendApi.delete(`/seller_posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'posts', shop?.id] });
      toast.success("Post deleted successfully");
    },
    onError: () => toast.error("Failed to delete post")
  });

  const createProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      await backendApi.post("/products", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products', shop?.id] });
      toast.success(`${variables.name} listed successfully! Pending approval.`);
      setNewProduct({ name: "", price: "", description: "", category: "", images: [], show_price: true });
      setShowAddProduct(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create product")
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await backendApi.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products', shop?.id] });
      toast.success("Product deleted successfully");
    },
    onError: () => toast.error("Deletion failed")
  });

  // Handlers
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) {
      toast.error("Active shop profile required to publish posts");
      return;
    }
    if (!newPost.title) {
      toast.error("Title is required");
      return;
    }
    createPostMutation.mutate({
      shop_id: shop.id,
      seller_id: shop.id,
      title: newPost.title,
      description: newPost.description,
      media_url: newPost.media_url,
      media_type: newPost.media_type,
      price: parseFloat(newPost.price) || null,
      offer_tag: newPost.offer_tag,
      category: newPost.category || null,
      status: "approved"
    });
  };

  const handleDeletePost = (id: string) => {
    if (!confirm("Permanently delete this post?")) return;
    deletePostMutation.mutate(id);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) {
      toast.error("Active shop profile required to list products");
      return;
    }
    if (!newProduct.name || !newProduct.category) {
      toast.error("Required fields missing: Name and Category.");
      return;
    }
    const productImages = newProduct.images.length > 0 ? newProduct.images : ["https://placehold.co/600x400.png"];
    createProductMutation.mutate({
      shop_id: shop.id,
      name: newProduct.name,
      price: parseFloat(newProduct.price) || 0,
      description: newProduct.description,
      category: newProduct.category,
      images: productImages,
      image_url: productImages[0],
      is_approved: false,
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    deleteProductMutation.mutate(id);
  };

  const loading = loadingShop || loadingProducts || loadingPosts || loadingEnquiries;
  const saving = createPostMutation.isPending || deletePostMutation.isPending || createProductMutation.isPending || deleteProductMutation.isPending;

  return {
    user,
    authLoading,
    activeTab,
    setActiveTab,
    shop,
    products,
    posts,
    enquiries,
    loading,
    saving,
    showAddProduct,
    setShowAddProduct,
    newProduct,
    setNewProduct,
    showAddPost,
    setShowAddPost,
    newPost,
    setNewPost,
    handleCreatePost,
    handleDeletePost,
    handleCreateProduct,
    handleDeleteProduct
  };
}
