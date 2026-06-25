import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { marketsApi } from "@/lib/api/markets";
import { storageApi } from "@/lib/api/storage";
import { useAuth } from "@/contexts/AuthContext";


interface ImageUploadProps {
  bucketName?: string;
  bucket?: string;          // alias for bucketName
  folder?: string;
  onUploadSuccess?: (url: string) => void;
  onUpload?: (urls: string[]) => void;  // alternative callback used by callers
  defaultImage?: string;
  existingImages?: string[];  // for edit pages
  single?: boolean;           // single-image mode flag
  maxImages?: number;         // limit how many images
  maxFiles?: number;          // alias for maxImages
}

export default function ImageUpload({
  bucketName,
  bucket,
  onUploadSuccess,
  onUpload,
  defaultImage,
  existingImages,
}: ImageUploadProps) {
  const effectiveBucket = bucket || bucketName || 'market-images';
  const handleSuccess = (url: string) => {
    if (onUploadSuccess) onUploadSuccess(url);
    if (onUpload) onUpload([url]);
  };
  const { user } = useAuth(); // 📦 Get app auth state
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImages?.[0] || defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🛡️ AUTH CHECK: Verify permissions from App State
    if (!user) {
      toast.error("You must be logged in as an admin to upload images.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if ((user as any)?.isDemo) {
      toast.info("Notice: You are using a demo account. Real uploads require a persistency session.");
    }

    console.log(`DEBUG: Found user session for upload:`, user.id);
    console.log(`DEBUG: Preparing to upload file:`, { name: file.name, size: file.size, type: file.type });

    // 3. Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPEG, PNG, or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Fast local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      // 🚢 Decide folder based on bucket
      let folder = 'markets';
      let targetBucket = effectiveBucket;
      if (targetBucket === 'products') folder = 'products';
      if (targetBucket === 'shops') folder = 'shops';

      const publicUrl = await storageApi.uploadImage(file, targetBucket, folder);
      
      handleSuccess(publicUrl);
      toast.success("Image uploaded successfully!");
      setPreview(publicUrl);


    } catch (error: any) {
      console.error("DEBUG: Storage Upload Error:", error);
      toast.error(`Upload failed: ${error.message}. Ensure you have logged in and Storage RLS policies are applied.`);
      setPreview(defaultImage || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setPreview(null);
    handleSuccess(""); // Return empty string to parent form
  };

  return (
    <div className="w-full">
      <label className="text-sm font-bold text-slate-700 ml-1 inline-flex items-center gap-2 mb-2">
        <ImageIcon className="w-4 h-4 text-blue-500" /> Cover Image
      </label>
      
      {preview ? (
        <div className="relative w-full max-w-sm h-48 rounded-2xl overflow-hidden border-2 border-slate-200 group">
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
          
          {uploading && (
             <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-sm">
                 <Loader2 className="w-8 h-8 text-white animate-spin" />
             </div>
          )}

          {!uploading && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition shadow-lg"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/50 hover:bg-blue-100/50 cursor-pointer transition-colors group">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:scale-110 transition-transform mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-blue-600">Click to upload imagery</span>
          <span className="text-xs text-blue-400 font-medium">JPEG, PNG, WebP</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
