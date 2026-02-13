import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Address State
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');

    const [message, setMessage] = useState('');
    const [updating, setUpdating] = useState(false);

    const { user, login, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setName(user.name);
            setEmail(user.email);
            if (user.address) {
                setStreet(user.address.street || '');
                setCity(user.address.city || '');
                setState(user.address.state || '');
                setZip(user.address.zip || '');
                setCountry(user.address.country || '');
            }
        }
    }, [navigate, user]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            toast.error(t('profile.passwordMismatch'));
            return;
        }

        setUpdating(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            // Build user data object
            const userData: any = { id: user?._id, name, email, password };

            // Add address if exists
            if (street || city || state || zip || country) {
                userData.address = { street, city, state, zip, country };
            }

            const { data } = await api.put(
                '/api/users/profile',
                userData,
                config
            );

            login(data); // Update context with new user info
            toast.success(t('profile.success'));
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
                return;
            }
            toast.error(error.response?.data?.message || t('profile.error'));
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Layout>
            <Helmet>
                <title>My Profile | Sri Chola Book Shop</title>
            </Helmet>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold font-serif mb-6 text-center">{t('profile.title')}</h1>

                    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <form onSubmit={submitHandler} className="space-y-6">

                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold border-b pb-2">{t('profile.personalInfo')}</h2>
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('profile.name')}</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('profile.email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">{t('profile.newPassword')}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t('profile.leaveBlank')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder={t('profile.confirmNew')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Address Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold border-b pb-2">{t('profile.shippingAddress')}</h2>
                                <div className="space-y-2">
                                    <Label htmlFor="street">{t('profile.street')}</Label>
                                    <Input
                                        id="street"
                                        placeholder={t('profile.placeholders.street')}
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">{t('profile.city')}</Label>
                                        <Input
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">{t('profile.state')}</Label>
                                        <Input
                                            id="state"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="zip">{t('profile.zip')}</Label>
                                        <Input
                                            id="zip"
                                            value={zip}
                                            onChange={(e) => setZip(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">{t('profile.country')}</Label>
                                        <Input
                                            id="country"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {message && <p className="text-destructive text-sm">{message}</p>}

                            <Button type="submit" className="w-full" disabled={updating}>
                                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('profile.update')}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
