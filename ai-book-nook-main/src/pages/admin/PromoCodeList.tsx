import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Plus, Tag, Edit, Trash2, TrendingUp, Users, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

interface PromoCode {
    _id: string;
    code: string;
    discountType: 'PERCENT' | 'FLAT';
    discountValue: number;
    minCartValue: number;
    maxDiscount: number | null;
    usageLimit: number;
    usedCount: number;
    perUserLimit: number;
    expiryDate: string;
    isActive: boolean;
    createdAt: string;
}

const PromoCodeManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENT' as 'PERCENT' | 'FLAT',
        discountValue: 0,
        minCartValue: 0,
        maxDiscount: '',
        usageLimit: 100,
        perUserLimit: 1,
        expiryDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };
            const { data } = await api.get('/api/promo/admin', config);
            setPromoCodes(data);
        } catch (error: any) {
            toast.error(t('admin.promo.fetchError'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const payload = {
                ...formData,
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null
            };

            if (editingPromo) {
                await api.put(`/api/promo/admin/${editingPromo._id}`, payload, config);
                toast.success(t('admin.promo.saveSuccess'));
            } else {
                await api.post('/api/promo/admin', payload, config);
                toast.success(t('admin.promo.saveSuccess'));
            }

            setIsDialogOpen(false);
            resetForm();
            fetchPromoCodes();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.promo.saveError'));
        }
    };

    const handleEdit = (promo: PromoCode) => {
        setEditingPromo(promo);
        setFormData({
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            minCartValue: promo.minCartValue,
            maxDiscount: promo.maxDiscount?.toString() || '',
            usageLimit: promo.usageLimit,
            perUserLimit: promo.perUserLimit,
            expiryDate: new Date(promo.expiryDate).toISOString().split('T')[0],
            isActive: promo.isActive
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.promo.deactivateConfirm'))) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };
            await api.delete(`/api/promo/admin/${id}`, config);
            toast.success(t('admin.promo.deactivated'));
            fetchPromoCodes();
        } catch (error: any) {
            toast.error(t('admin.promo.deactivateError') || 'Failed to deactivate promo code');
        }
    };

    const toggleActive = async (promo: PromoCode) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                }
            };
            await api.put(`/api/promo/admin/${promo._id}`, {
                isActive: !promo.isActive
            }, config);
            toast.success(!promo.isActive ? t('admin.promo.activated') : t('admin.promo.deactivated'));
            fetchPromoCodes();
        } catch (error: any) {
            toast.error(t('admin.promo.updateError'));
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'PERCENT',
            discountValue: 0,
            minCartValue: 0,
            maxDiscount: '',
            usageLimit: 100,
            perUserLimit: 1,
            expiryDate: '',
            isActive: true
        });
        setEditingPromo(null);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    return (
        <AdminLayout>
            <Helmet>
                <title>{t('admin.promo.title')} | Admin Sri Chola Book Shop</title>
            </Helmet>

            <div className="w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-serif flex items-center gap-3">
                        <Tag className="h-8 w-8 text-primary" />
                        {t('admin.promo.title')}
                    </h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t('admin.promo.create')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPromo ? t('admin.promo.editTitle') : t('admin.promo.createTitle')}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingPromo
                                        ? t('admin.promo.editDesc')
                                        : t('admin.promo.createDesc')}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">{t('admin.promo.form.code')} *</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder={t('admin.promo.placeholders.code')}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discountType">{t('admin.promo.form.discountType')} *</Label>
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(value: 'PERCENT' | 'FLAT') =>
                                                setFormData({ ...formData, discountType: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PERCENT">{t('admin.promo.discountType.percent')}</SelectItem>
                                                <SelectItem value="FLAT">{t('admin.promo.discountType.flat')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="discountValue">
                                            {t('admin.promo.form.discountValue')} * {formData.discountType === 'PERCENT' ? '(%)' : '(₹)'}
                                        </Label>
                                        <Input
                                            id="discountValue"
                                            type="number"
                                            min="0"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minCartValue">{t('admin.promo.form.minCartValue')}</Label>
                                        <Input
                                            id="minCartValue"
                                            type="number"
                                            min="0"
                                            value={formData.minCartValue}
                                            onChange={(e) => setFormData({ ...formData, minCartValue: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="maxDiscount">{t('admin.promo.form.maxDiscount')}</Label>
                                        <Input
                                            id="maxDiscount"
                                            type="number"
                                            min="0"
                                            value={formData.maxDiscount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                            placeholder={t('admin.promo.placeholders.maxDiscount')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="usageLimit">{t('admin.promo.form.usageLimit')} *</Label>
                                        <Input
                                            id="usageLimit"
                                            type="number"
                                            min="1"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="perUserLimit">{t('admin.promo.form.perUserLimit')} *</Label>
                                        <Input
                                            id="perUserLimit"
                                            type="number"
                                            min="1"
                                            value={formData.perUserLimit}
                                            onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expiryDate">{t('admin.promo.form.expiryDate')} *</Label>
                                        <Input
                                            id="expiryDate"
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="isActive" className="cursor-pointer">{t('admin.promo.form.active')}</Label>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" className="flex-1">
                                        {editingPromo ? t('admin.common.update') : t('admin.common.create')} {t('admin.promo.form.code')}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                                        {t('admin.common.cancel')}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="text-center py-12">{t('admin.common.loading')}</div>
                ) : promoCodes.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-lg">
                        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t('admin.promo.noPromos')}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {promoCodes.map((promo) => (
                            <div
                                key={promo._id}
                                className="bg-card rounded-lg p-6 shadow-soft border border-border"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <Tag className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold font-mono">{promo.code}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {promo.discountType === 'PERCENT'
                                                    ? `${promo.discountValue}% off`
                                                    : `₹${promo.discountValue} off`}
                                                {promo.maxDiscount && ` (Max: ₹${promo.maxDiscount})`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleActive(promo)}
                                        >
                                            {promo.isActive ? (
                                                <ToggleRight className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(promo)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(promo._id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4" />
                                            {t('admin.promo.card.usage')}
                                        </p>
                                        <p className="font-semibold">
                                            {promo.usedCount} / {promo.usageLimit}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {t('admin.promo.card.perUser')}
                                        </p>
                                        <p className="font-semibold">{promo.perUserLimit} {t('admin.promo.card.times')}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {t('admin.promo.card.expires')}
                                        </p>
                                        <p className="font-semibold">
                                            {new Date(promo.expiryDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">{t('admin.promo.card.minCart')}</p>
                                        <p className="font-semibold">₹{promo.minCartValue}</p>
                                    </div>
                                </div>

                                {!promo.isActive && (
                                    <div className="mt-4 text-sm text-destructive">
                                        ⚠️ {t('admin.promo.warnings.inactive')}
                                    </div>
                                )}
                                {new Date(promo.expiryDate) < new Date() && (
                                    <div className="mt-4 text-sm text-destructive">
                                        ⚠️ {t('admin.promo.warnings.expired')}
                                    </div>
                                )}
                                {promo.usedCount >= promo.usageLimit && (
                                    <div className="mt-4 text-sm text-destructive">
                                        ⚠️ {t('admin.promo.warnings.limitReached')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default PromoCodeManagement;
