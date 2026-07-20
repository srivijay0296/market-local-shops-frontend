import { useState } from "react";
import { toast } from "sonner";
import { X, Mail, Lock, User, Loader2, Shield, Store, Truck, Eye, EyeOff, Smartphone, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Step = 'role-selection' | 'auth-form';
type Role = 'BUYER' | 'SELLER' | 'ADMIN' | 'DELIVERY';

const roles = [
  { id: 'BUYER' as Role, title: 'Customer', icon: User, desc: 'Shop premium local products', color: 'text-primary', glow: 'shadow-primary/50' },
  { id: 'SELLER' as Role, title: 'Seller', icon: Store, desc: 'Grow your local business', color: 'text-accent', glow: 'shadow-accent/50' },
  { id: 'ADMIN' as Role, title: 'Admin', icon: Shield, desc: 'Manage marketplace operations', color: 'text-secondary', glow: 'shadow-secondary/50' },
  { id: 'DELIVERY' as Role, title: 'Delivery Partner', icon: Truck, desc: 'Deliver local happiness', color: 'text-success', glow: 'shadow-success/50' }
];

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [step, setStep] = useState<Step>('role-selection');
  const [selectedRole, setSelectedRole] = useState<Role>('BUYER');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    aadhaarId: ""
  });

  if (!showAuthModal) return null;

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('auth-form');
  };

  const resetModal = () => {
    setShowAuthModal(false);
    setTimeout(() => {
      setStep('role-selection');
      setFormData({ email: "", password: "", fullName: "", phone: "", aadhaarId: "" });
    }, 300);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        const loggedUser = await login(formData.email, formData.password);
        if (!loggedUser) {
          toast.error("Invalid credentials.");
          setLoading(false);
          return;
        }
        toast.success("Welcome back!");
        if (loggedUser.role === "ADMIN") navigate("/admin");
        else if (loggedUser.role === "SELLER") navigate("/seller");
        else navigate("/");
      } else {
        const newUser = await signup({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: selectedRole.toLowerCase()
        });
        if (newUser) {
          toast.success("Account created successfully!");
          if (newUser.role === "ADMIN") navigate("/admin");
          else if (newUser.role === "SELLER") navigate("/seller");
          else navigate("/");
        }
      }
      resetModal();
    } catch (err: any) {
      toast.error(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Animated Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={resetModal}
        className="absolute inset-0 bg-dark/60 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-float border border-white p-8 md:p-12 overflow-hidden z-10"
      >
        <button
          onClick={resetModal}
          className="absolute top-6 right-6 p-2 bg-background text-foreground/50 rounded-full hover:bg-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === 'role-selection' && (
            <motion.div 
              key="role"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full"
            >
              <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-black text-foreground mb-3">Welcome to NammaMarket</h2>
                <p className="text-foreground/60 font-medium text-lg">Choose your account type to get started</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className="p-6 rounded-2xl border-2 border-transparent bg-background hover:bg-white hover:border-primary/20 hover:shadow-3d transition-all text-left group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2`} />
                    <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 ${role.color} group-hover:${role.glow} group-hover:shadow-lg transition-all`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-1">{role.title}</h3>
                    <p className="text-sm font-medium text-foreground/60">{role.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'auth-form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="text-center mb-8 relative">
                <button 
                  onClick={() => setStep('role-selection')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground/50 hover:text-primary transition-colors"
                >
                  ← Back
                </button>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                   {roles.find(r => r.id === selectedRole)?.icon && (() => {
                     const Icon = roles.find(r => r.id === selectedRole)!.icon;
                     return <Icon className="w-6 h-6" />;
                   })()}
                </div>
                <h2 className="text-3xl font-display font-black text-foreground">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-foreground/60 font-medium text-sm mt-1">
                  Continue as {roles.find(r => r.id === selectedRole)?.title}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-5">
                {authMode === 'signup' && (
                  <FloatingInput 
                    icon={<User className="w-5 h-5" />}
                    label="Full Name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                )}

                <FloatingInput 
                  icon={<Mail className="w-5 h-5" />}
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                {authMode === 'signup' && selectedRole !== 'BUYER' && (
                   <FloatingInput 
                    icon={<Smartphone className="w-5 h-5" />}
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                )}

                <div className="relative">
                  <FloatingInput 
                    icon={<Lock className="w-5 h-5" />}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {authMode === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 transition-colors" />
                      <span className="font-medium text-foreground/70 group-hover:text-foreground transition-colors">Remember me</span>
                    </label>
                    <button type="button" className="font-bold text-primary hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      {authMode === 'login' ? 'Sign In' : 'Create Account'}
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-foreground/50 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-background transition-colors font-bold text-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border hover:bg-background transition-colors font-bold text-sm">
                   <Smartphone className="w-5 h-5 text-foreground/70" />
                   OTP Login
                </button>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                >
                  {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <span className="font-bold text-primary hover:underline">
                    {authMode === 'login' ? 'Sign up' : 'Log in'}
                  </span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Floating Label Input Component
function FloatingInput({ icon, label, type, value, onChange }: any) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${active ? 'text-primary' : 'text-foreground/40'}`}>
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        className="w-full pl-12 pr-4 pt-6 pb-2 bg-background rounded-xl border-2 border-transparent focus:bg-white focus:border-primary/50 outline-none transition-all text-sm font-medium shadow-inner"
      />
      <label 
        className={`absolute left-12 transition-all duration-200 pointer-events-none font-medium ${
          active ? 'top-2 text-[10px] text-primary uppercase tracking-wider' : 'top-1/2 -translate-y-1/2 text-sm text-foreground/50'
        }`}
      >
        {label}
      </label>
    </div>
  );
}
