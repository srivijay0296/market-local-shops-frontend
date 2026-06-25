import React, { useState } from 'react';
import { uploadImage } from '@/services/api';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  onUpload?: (urls: string[]) => void;
  bucket?: string;
  label?: string;
  maxFiles?: number;
  maxImages?: number;
  single?: boolean;
  folder?: string;
  existingImages?: string[];
}

export default function ImageUpload({ onUploadComplete, onUpload, bucket = 'product-images', label = 'Upload Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      setUploading(true);
      console.log(`📤 Initializing upload for ${file.name} to bucket ${bucket}...`);
      
      const publicUrl = await uploadImage(file, bucket);
      
      console.log('✅ Upload successful. Public URL:', publicUrl);
      if (onUploadComplete) onUploadComplete(publicUrl);
      if (onUpload) onUpload([publicUrl]);
      
      sonnerToast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      sonnerToast.error(error.message || "Upload failed. Please check your permissions and try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      
      <div className="relative group">
        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-indigo-500 transition-all duration-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mb-3" />
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                Click to <span className="text-indigo-600">upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">PNG, JPG or WebP</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          </label>
        ) : (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            
            {uploading ? (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Syncing...</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button 
                    onClick={clearPreview}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="p-2 bg-green-500 text-white rounded-full shadow-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
