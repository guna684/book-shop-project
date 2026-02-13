import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleGoogleAutofill = () => {
    // In a real application, this would use the Google Identity Services SDK
    // to prompt the user to select an account and then retrieve the email.
    // For this simulation/prototype:
    const mockGoogleEmail = window.prompt("Google Account Simulation:\nPlease enter the email you want to select from your Google Account:", "user@gmail.com");
    if (mockGoogleEmail) {
      setEmail(mockGoogleEmail);
      toast.info(`Email autofilled from Google: ${mockGoogleEmail}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (isLogin) {
        const { data } = await api.post(
          '/api/users/login',
          { email, password }
        );

        // Logic to enforce Admin Login separation
        if (isAdminLogin && !data.isAdmin) {
          toast.error("Access Denied: You are not an administrator.");
          setLoading(false);
          return;
        }

        if (!isAdminLogin && data.isAdmin) {
          // Optional: If an admin tries to login as regular user, maybe we allow it?
          // Or maybe we redirect them to dashboard anyway?
          // For now, let's allow it but warn or just proceed.
          // But the user asked for a separate option.
          // Let's strictly redirect based on the toggle?
          // Actually, if they are admin, they can access everything.
        }

        login(data);
        toast.success(`Welcome back, ${data.name}!`);

        if (isAdminLogin || data.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }

      } else {
        // Register (Always User)
        const { data } = await api.post(
          '/api/users',
          { name, email, password }
        );
        login(data);
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${isLogin ? (isAdminLogin ? 'Admin Sign In' : 'Sign In') : 'Create Account'} | Sri Chola Book Shop`}</title>
      </Helmet>
      <div className="min-h-screen flex">
        {/* Left - Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-serif text-2xl font-bold text-foreground">
                Sri Chola <span className="text-primary">Book Shop</span>
              </span>
            </Link>

            <div className="mb-6">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                {isLogin ? (isAdminLogin ? 'Admin Portal' : 'Welcome Back!') : 'Create Account'}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? (isAdminLogin ? 'Sign in to manage the Sri Chola Book Shop platform' : 'Sign in to access your account and continue shopping')
                  : 'Join Sri Chola Book Shop to start your reading journey'}
              </p>
            </div>

            {/* Admin Toggle */}
            {isLogin && (
              <div className="flex p-1 bg-secondary rounded-lg mb-8">
                <button
                  onClick={() => setIsAdminLogin(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isAdminLogin ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  Customer Login
                </button>
                <button
                  onClick={() => setIsAdminLogin(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isAdminLogin ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  Admin Login
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isAdminLogin ? "admin@sricholabooks.com" : "you@example.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isLogin && !isAdminLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <Link to="/forgotpassword" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button variant="gold" size="lg" className="w-full gap-2" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? (isAdminLogin ? 'Admin Sign In' : 'Sign In') : 'Create Account')}
                {loading ? null : <ArrowRight className="h-5 w-5" />}
              </Button>
            </form>



            <p className="text-center mt-8 text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsAdminLogin(false); // Reset admin toggle when switching modes
                }}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>

        {/* Right - Image */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent blur-[100px]" />
          </div>

          <div className="relative z-10 h-full flex items-center justify-center p-12">
            <div className="max-w-md text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-serif text-4xl font-bold text-paper mb-6">
                  Discover Worlds Through Words
                </h2>
                <p className="text-paper/70 text-lg">
                  Join thousands of readers who have found their next favorite book with our
                  AI-powered recommendations.
                </p>

                <div className="mt-12 flex justify-center gap-4">
                  {[
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
                  ].map((src, i) => (
                    <motion.img
                      key={i}
                      src={src}
                      alt="Book"
                      className="w-24 h-36 object-cover rounded-lg shadow-elevated"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      style={{ transform: `rotate(${(i - 1) * 8}deg)` }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
