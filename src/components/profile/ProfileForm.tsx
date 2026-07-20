import React, { useState, forwardRef } from "react";
import { User, Mail, Phone, MapPin, Edit2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usersApi } from "@/lib/api/users";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: any;
  profile: {
    name: string;
    phone: string;
    address: string;
  };
  setProfile: (val: any) => void;
  handleUpdate?: (e: React.FormEvent) => void; // Legacy fallback
  loading?: boolean;
}

export const ProfileForm = React.memo(function ProfileForm({
  user,
  profile,
  setProfile,
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || user?.name || "",
      phone: profile.phone || user?.phone || "",
      address: profile.address || user?.address || "",
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await usersApi.updateUser(user.id, {
        name: data.name,
        phone: data.phone,
        address: data.address
      });
      setProfile({ ...profile, name: data.name, phone: data.phone, address: data.address });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-border relative z-10">
        <div>
          <h2 className="text-3xl font-display font-black text-foreground flex items-center gap-3">
            <Edit2 className="w-6 h-6 text-primary" /> Identity Settings
          </h2>
          <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-2">Manage your personal data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div>
            <FloatingInput 
              icon={<User />} 
              label="Full Name" 
              type="text" 
              {...register("name")}
            />
            {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.name.message}</p>}
          </div>
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input 
              disabled
              type="email" 
              value={user?.email || ""} 
              className="w-full bg-background border-2 border-transparent py-4 pl-12 pr-4 rounded-xl font-medium text-sm text-foreground/50 cursor-not-allowed"
            />
            <label className="absolute left-12 top-1 text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Email Node (Locked)</label>
          </div>

          <div>
            <FloatingInput 
              icon={<Phone />} 
              label="Phone Number" 
              type="tel" 
              {...register("phone")}
            />
            {errors.phone && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.phone.message}</p>}
          </div>
          
          <div>
            <FloatingInput 
              icon={<MapPin />} 
              label="Delivery Address" 
              type="text" 
              {...register("address")}
            />
            {errors.address && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-1 ml-2">{errors.address.message}</p>}
          </div>

        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto btn-primary px-12 py-4 text-sm"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
});

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(({ icon, label, ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  const active = focused || (props.value && String(props.value).length > 0);

  return (
    <div className="relative">
      {icon && <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-foreground/40'}`}>{icon}</div>}
      <input 
        ref={ref}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }} 
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`w-full bg-background border-2 transition-colors py-4 ${icon ? 'pl-12' : 'pl-4'} pr-4 rounded-xl outline-none font-medium text-sm text-foreground ${focused ? 'border-primary/50 bg-white' : 'border-transparent'}`} 
      />
      <label className={`absolute left-${icon ? '12' : '4'} transition-all pointer-events-none uppercase tracking-widest font-bold ${active ? 'top-1 text-[9px] text-primary' : 'top-1/2 -translate-y-1/2 text-xs text-foreground/40'}`}>
        {label}
      </label>
    </div>
  );
});

FloatingInput.displayName = "FloatingInput";
