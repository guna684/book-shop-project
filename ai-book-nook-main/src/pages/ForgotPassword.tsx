import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, BookOpen, KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/axios';

const ForgotPassword = () => {
    // Steps: 'email' -> 'otp' -> 'success'
    const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);

    // Step 1: Send OTP via Backend
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/api/users/forgotpassword', { email });
            toast.success(data.message || 'OTP sent to your email!');
            setStep('otp');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and Reset Password
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/api/users/verify-otp', {
                email,
                otp,
                newPassword: password
            });

            toast.success(data.message || 'Password reset successfully!');
            setStep('success');

            // Auto-redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Reset Password | Sri Chola Book Shop</title>
            </Helmet>
            <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={step}
                    className="w-full max-w-md bg-card p-8 rounded-2xl border border-border shadow-sm"
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <span className="font-serif text-2xl font-bold text-foreground">
                            Sri Chola <span className="text-primary">Book Shop</span>
                        </span>
                    </Link>

                    {step === 'email' && (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-muted-foreground">
                                    Enter your email address to receive a verification code.
                                </p>
                            </div>
                            <form onSubmit={handleEmailSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button variant="gold" size="lg" className="w-full gap-2" disabled={loading}>
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                    {!loading && <ArrowRight className="h-5 w-5" />}
                                </Button>
                            </form>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                                    Enter OTP & New Password
                                </h1>
                                <p className="text-muted-foreground">
                                    We sent a 6-digit code to <strong>{email}</strong>
                                </p>
                            </div>
                            <form onSubmit={handleOtpSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="pl-10 tracking-widest text-lg"
                                            required
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button variant="gold" size="lg" className="w-full" disabled={loading}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="w-full text-sm text-primary hover:underline mt-2"
                                >
                                    Wrong email? Go back
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-serif mb-2">Password Reset!</h2>
                                <p className="text-muted-foreground">
                                    Your password has been successfully updated.
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Redirecting to login...
                                </p>
                            </div>
                            <Link to="/login">
                                <Button className="w-full">
                                    Login Now
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default ForgotPassword;
