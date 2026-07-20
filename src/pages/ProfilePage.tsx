import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useProfilePage } from "@/hooks/useProfilePage";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    logout,
    loading,
    profile,
    setProfile,
    handleUpdate
  } = useProfilePage();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <AuthModal />
      
      <main className="flex-grow pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar Navigation */}
          <div className="md:col-span-4 lg:col-span-3">
            <ProfileSidebar user={user} name={profile.name} logout={logout} />
          </div>

          {/* Main Content: Account Settings */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-6 flex items-start gap-4"
            >
              <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">AI Profile Assistant</h4>
                <p className="text-xs text-foreground/70 mt-1 leading-relaxed">
                  Completing your profile ensures faster checkouts and personalized product recommendations. We use your deployment area to calculate real-time shipping routing.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProfileForm
                user={user}
                profile={profile}
                setProfile={setProfile}
                handleUpdate={handleUpdate}
                loading={loading}
              />
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
